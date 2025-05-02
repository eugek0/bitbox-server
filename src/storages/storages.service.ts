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
import { Storage } from "./schemas";
import {
  STORAGE_ROOT,
  FormException,
  isHttpException,
  Nullable,
  exists,
} from "@/core";
import { UsersService, User, UserRole } from "@/users";
import { CreateStorageDto, DeleteStoragesDto, SearchStoragesDto } from "./dtos";
import { EntitiesService } from "@/entities";
import * as moment from "moment";

@Injectable()
export class StoragesService {
  constructor(
    @InjectModel(Storage.name) private storageModel: Model<Storage>,
    private usersService: UsersService,
    private entitiesService: EntitiesService,
  ) {}
  async get(): Promise<Storage[]> {
    return await this.storageModel.find().lean();
  }

  async getById(id: string): Promise<Nullable<Storage>> {
    return await this.storageModel.findById(id).lean();
  }

  async getByName(name: string): Promise<Nullable<Storage>> {
    return await this.storageModel.findOne({ name }).lean();
  }

  async getAvailable(userid: string): Promise<Storage[]> {
    const questioner = await this.usersService.getById(userid);

    if ((["administrator", "owner"] as UserRole[]).includes(questioner.role)) {
      return this.storageModel.find().lean();
    }

    return await this.storageModel
      .find({
        $or: [
          { access: "public" },
          { owner: userid },
          { "members._id": userid },
        ],
      })
      .lean();
  }

  async create(dto: CreateStorageDto, owner: string): Promise<void> {
    try {
      if (await this.getByName(dto.name)) {
        throw new FormException(
          "Хранилище с таким именем уже существует",
          "name",
        );
      }
      const storage = new this.storageModel({
        owner,
        used: 0,
        createdAt: moment().toISOString(),
        ...dto,
      });
      await fs.mkdir(p.join(STORAGE_ROOT, storage._id.toString()), {
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

  async edit(dto: any, storageid: string): Promise<void> {
    try {
      if (!(await this.getById(storageid))) {
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

  async delete(dto: DeleteStoragesDto): Promise<void> {
    try {
      for (const storageid of dto.storages) {
        const storage = await this.getById(storageid);

        if (!storage) {
          throw new NotFoundException("Такого хранилища не существует");
        }

        if (await exists(p.join(STORAGE_ROOT, storage._id.toString()))) {
          await fs.rm(p.join(STORAGE_ROOT, storage._id.toString()), {
            recursive: true,
          });
        } else {
          throw new BadRequestException("Такого хранилища не существует");
        }
        await this.storageModel.findByIdAndDelete(storageid);
        await this.entitiesService.clearStorage(storageid);
      }
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

  async search(
    dto: SearchStoragesDto,
    questionerid: string,
  ): Promise<Storage[]> {
    const questioner = await this.usersService.getById(questionerid);

    const filter = Object.fromEntries(
      Object.entries(dto)
        .filter(([_, value]) => value)
        .map(([key, value]) => [
          key,
          {
            $regex: String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        ]),
    );

    const storages = await this.storageModel.find(filter).lean().exec();

    return storages.filter((storage) => this.checkAccess(questioner, storage));
  }

  async getStoragesByIds(storageids: string[]) {
    return this.storageModel
      .find({ _id: { $in: storageids } })
      .lean()
      .exec();
  }

  private checkAccess(questioner: User, storage: Storage) {
    const result =
      (["administrator", "owner"] as UserRole[]).includes(questioner.role) ||
      storage.access === "public" ||
      storage.owner.toString() === questioner._id.toString() ||
      storage.members.some(
        (member) => member.toString() === questioner._id.toString(),
      );
    return result;
  }
}
