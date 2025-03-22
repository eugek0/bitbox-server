import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as p from "path";
import * as fs from "fs/promises";
import { CreateStorageDto, SearchStoragesDto } from "./dtos";
import { Storage } from "./schemas/storage.schema";
import { exists } from "@/core/utils";
import { isHttpException } from "@/core/typeguards";
import { FormException, NotificationException } from "@/core/classes";
import { UsersService } from "@/users/users.service";
import { Nullable } from "@/core/types";
import { Entity, EntityDocument } from "./schemas/entity.schema";
import { convertBytes } from "@/core/utils";

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

  async getAvailableStoragesById(
    id: string,
    userid: string,
  ): Promise<Nullable<Storage>> {
    const questioner = await this.usersService.getById(userid);
    const storage = await this.storageModel.findById(id).lean();

    if (!storage) {
      throw new NotFoundException("Такого хранилища не существует.");
    }

    if (
      questioner.role !== "admin" &&
      storage.access !== "public" &&
      storage.owner.toString() !== userid &&
      !storage.members.some((member) => member.toString() === userid)
    ) {
      const owner = await this.usersService.getById(storage.owner.toString());
      throw new ForbiddenException({
        message: "У вас нет доступа к этому хранилищу.",
        contacts: owner?.[owner?.prefered_contacts ?? "none"],
        type: owner?.prefered_contacts,
      });
    }

    return storage;
  }

  async createStorage(dto: CreateStorageDto, owner: string): Promise<void> {
    try {
      if (!(await exists(p.join(this.root, dto.name)))) {
        await fs.mkdir(p.join(this.root, dto.name), { recursive: true });
      } else {
        throw new FormException(
          "Хранилище с таким именем уже существует",
          "name",
        );
      }

      const storage = new this.storageModel({ owner, used: 0, ...dto });

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

  async deleteStorage(name: string): Promise<void> {
    try {
      if (await exists(p.join(this.root, name))) {
        await fs.rm(p.join(this.root, name), { recursive: true });
      } else {
        throw new BadRequestException("Такого хранилища не существует");
      }
      await this.storageModel.findOneAndDelete({ name });
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

  async searchStorages(dto: SearchStoragesDto): Promise<Storage[]> {
    const filter = Object.fromEntries(
      Object.entries(dto)
        .filter(([_, value]) => value)
        .map(([key, value]) => [key, { $regex: value, $options: "i" }]),
    );

    return await this.storageModel.find(filter).lean().exec();
  }

  async getStorageEntities(storageid: string, path: string): Promise<Entity[]> {
    return await this.entityModel.find({ storage: storageid, path }).lean();
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
}
