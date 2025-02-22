import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as path from "path";
import * as fs from "fs/promises";
import { CreateStorageDto, SearchStoragesDto } from "./dtos";
import { Storage } from "./schemas/storage.schema";
import { exists } from "@/core/utils";
import { isHttpException } from "@/core/typeguards";
import { FormException } from "@/core/classes";

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
        await fs.mkdir(path.join(this.root, dto.name), { recursive: true });
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

  async delete(name: string): Promise<void> {
    try {
      if (await exists(path.join(this.root, name))) {
        await fs.rm(path.join(this.root, name), { recursive: true });
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

  async search(dto: SearchStoragesDto): Promise<Storage[]> {
    const filter = Object.fromEntries(
      Object.entries(dto)
        .filter(([_, value]) => value)
        .map(([key, value]) => [key, { $regex: value, $options: "i" }]),
    );

    return await this.storageModel.find(filter).lean().exec();
  }
}
