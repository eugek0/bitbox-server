import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as p from "path";
import * as fs from "fs/promises";
import { CreateEditStorageDto, SearchStoragesDto } from "./dtos";
import { Storage } from "./schemas/storage.schema";
import { exists } from "@/core/utils";
import { isHttpException } from "@/core/typeguards";
import { FormException, NotificationException } from "@/core/classes";
import { UsersService } from "@/users/users.service";
import { Nullable } from "@/core/types";
import { Entity, EntityDocument } from "./schemas/entity.schema";
import { convertBytes } from "@/core/utils";
import { User } from "@/users/schemas/user.schema";

@Injectable()
export class StoragesService {
  constructor(
    @InjectModel(Storage.name) private storageModel: Model<Storage>,
    @InjectModel(Entity.name) private entityModel: Model<Entity>,
    private usersService: UsersService,
  ) {}

  private root: string = p.resolve(__dirname, "..", "..", "storages");

  async getStorages(): Promise<Storage[]> {
    return await this.storageModel.find().lean();
  }

  async getStorageById(id: string): Promise<Nullable<Storage>> {
    return await this.storageModel.findById(id).lean();
  }

  async getStorageByName(name: string): Promise<Nullable<Storage>> {
    return await this.storageModel.findOne({ name }).lean();
  }

  async getAvailableStorages(userid: string): Promise<Storage[]> {
    const questioner = await this.usersService.getById(userid);

    if (questioner.role === "admin") {
      return this.storageModel.find().lean();
    }

    return this.storageModel
      .find({
        $or: [{ access: "public" }, { owner: userid }, { members: userid }],
      })
      .lean();
  }

  async createStorage(dto: CreateEditStorageDto, owner: string): Promise<void> {
    try {
      if (await this.getStorageByName(dto.name)) {
        throw new FormException(
          "Хранилище с таким именем уже существует",
          "name",
        );
      }
      const storage = new this.storageModel({ owner, used: 0, ...dto });
      await fs.mkdir(p.join(this.root, storage._id.toString()), {
        recursive: true,
      });

      await storage.save();
    } catch (error) {
      if (!isHttpException) {
        throw new InternalServerErrorException(
          "Произошла ошибка при создании хранилища",
        );
      } else {
        throw error;
      }
    }
  }

  async editStorage(
    dto: CreateEditStorageDto,
    storageid: string,
  ): Promise<void> {
    try {
      if (!(await this.getStorageById(storageid))) {
        throw new NotFoundException("Такого хранилища не существует");
      }

      await this.storageModel.findByIdAndUpdate(storageid, dto);
    } catch (error) {
      if (!isHttpException) {
        throw new InternalServerErrorException(
          "Произошла ошибка при создании хранилища",
        );
      } else {
        throw error;
      }
    }
  }

  async deleteStorage(storageid: string): Promise<void> {
    try {
      const storage = await this.getStorageById(storageid);

      if (!storage) {
        throw new NotFoundException("Такого хранилища не существует");
      }

      if (await exists(p.join(this.root, storage._id.toString()))) {
        await fs.rm(p.join(this.root, storage._id.toString()), {
          recursive: true,
        });
      } else {
        throw new BadRequestException("Такого хранилища не существует");
      }
      await this.storageModel.findByIdAndDelete(storageid);
    } catch (error) {
      if (!isHttpException(error)) {
        throw new InternalServerErrorException(
          "Произошла ошибка при удалении хранилища",
        );
      } else {
        throw error;
      }
    }
  }

  async searchStorages(
    dto: SearchStoragesDto,
    questionerid: string,
  ): Promise<Storage[]> {
    const questioner = await this.usersService.getById(questionerid);

    const filter = Object.fromEntries(
      Object.entries(dto)
        .filter(([_, value]) => value)
        .map(([key, value]) => [key, { $regex: value, $options: "i" }]),
    );

    const storages = await this.storageModel.find(filter).lean().exec();

    return storages.filter((storage) => this.checkAccess(questioner, storage));
  }

  async getStorageEntities(storageid: string, path: string): Promise<Entity[]> {
    return await this.entityModel.find({ storage: storageid, path }).lean();
  }

  async getEntityById(id: string): Promise<Nullable<Entity>> {
    return await this.entityModel.findById(id).lean();
  }

  async getFileBufferById(id: string): Promise<string> {
    const entity = await this.getEntityById(id);
    const storage = await this.getStorageById(entity.storage);

    const path = p.join(this.root, storage.name, entity.fullname);

    if (entity.type !== "file") {
      throw new BadRequestException("Данная сущность не является файлом");
    }

    if (!exists(path)) {
      throw new NotFoundException("Такого файла не существует");
    }

    return path;
  }

  async uploadEntities(
    entities: Express.Multer.File[],
    storageid: string,
    path: string,
  ): Promise<void> {
    const storage = await this.getStorageById(storageid);
    const storageEntities = await this.getStorageEntities(storageid, "/");
    const newEntities: EntityDocument[] = [];
    const totalEntitiesSize = entities.reduce(
      (accumulator, entity) => accumulator + entity.size,
      0,
    );

    if (!storage) {
      throw new NotFoundException("Такого хранилища не существует");
    }

    if (!(await exists(p.join(this.root, storage.name, path)))) {
      throw new NotFoundException("Директории по такому пути не существует");
    }

    if (
      storage.restrict_files_count &&
      storageEntities.length + entities.length > storage.max_files_count
    ) {
      throw new NotificationException(
        {
          status: "error",
          config: {
            message: `При записи файлов будет превышено максимальное количество файлов в хранилище (${storage.max_files_count} шт.)`,
          },
        },
        400,
      );
    }

    if (
      storage.restrict_file_size &&
      entities.some((entity) => entity.size > storage.max_file_size)
    ) {
      throw new NotificationException(
        {
          status: "error",
          config: {
            message: `Один из файлов превышает максимально допустимый размер в ${convertBytes(storage.max_file_size)}`,
          },
        },
        400,
      );
    }

    if (storage.used + totalEntitiesSize > storage.size) {
      throw new NotificationException(
        {
          status: "error",
          config: {
            message: `При записи файлов будет превышен максимальный размер хранилища в ${convertBytes(storage.size)}`,
          },
        },
        400,
      );
    }

    try {
      for (const entity of entities) {
        const [name, extension] = entity.originalname.split(/\.(?!.*\.)/);
        const newFilePath = p.join(
          this.root,
          storage.name,
          path,
          entity.originalname,
        );

        if (!(await exists(newFilePath))) {
          newEntities.push(
            new this.entityModel({
              fullname: entity.originalname,
              storage: storageid,
              size: entity.size,
              type: "file",
              extension,
              name,
              path,
            }),
          );
        }
        await fs.writeFile(newFilePath, entity.buffer);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        "Ошибка при записи файлов в хранилище",
      );
    }

    await this.entityModel.bulkSave(newEntities);
    await this.storageModel.findByIdAndUpdate(storage._id, {
      used: storage.used + totalEntitiesSize,
    });
  }

  private checkAccess(questioner: User, storage: Storage) {
    const result =
      questioner.role === "admin" ||
      storage.access === "public" ||
      storage.owner.toString() === questioner._id.toString() ||
      storage.members.some(
        (member) => member.toString() === questioner._id.toString(),
      );
    return result;
  }
}
