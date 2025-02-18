import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as path from "path";
import * as fs from "fs/promises";
import { CreateStorageDto } from "./dtos/createStorage.dto";
import { Storage } from "./schemas/storage.schema";
import { exists } from "@/core/utils";
import { isHttpException } from "@/core/typeguards";

@Injectable()
export class StoragesService {
  constructor(
    @InjectModel(Storage.name) private storageModel: Model<Storage>,
  ) {}

  private root: string = path.resolve(__dirname, "..", "..", "storages");

  async getStorages(): Promise<Storage[]> {
    return await this.storageModel.find().lean();
  }

  async create(dto: CreateStorageDto, owner: string): Promise<void> {
    try {
      if (!(await exists(path.join(this.root, dto.name)))) {
        await fs.mkdir(path.join(this.root, dto.name));
      } else {
        throw new BadRequestException(
          "Хранилище с таким именем уже существует",
        );
      }

      const storage = new this.storageModel({ owner, ...dto });

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

  async delete(id: string): Promise<void> {
    try {
      if (await exists(path.join(this.root, id))) {
        await fs.rm(path.join(this.root, id), { recursive: true });
      } else {
        throw new BadRequestException("Такого хранилища не существует");
      }
      await this.storageModel.findByIdAndDelete(id);
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
}
