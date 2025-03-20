import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { UsersService } from "@/users/users.service";
import { Nullable } from "@/core/types";

@Injectable()
export class StoragesService {
  constructor(
    @InjectModel(Storage.name) private storageModel: Model<Storage>,
    private usersService: UsersService,
  ) {}

  private root: string = path.resolve(__dirname, "..", "..", "storages");

  async getStorages(): Promise<Storage[]> {
    return await this.storageModel.find().lean();
  }

  async getAvailable(userid: string): Promise<Storage[]> {
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

  async getAvailableById(
    id: string,
    userid: string,
  ): Promise<Nullable<Storage>> {
    const storage = await this.storageModel.findById(id).lean();

    if (!storage) {
      throw new NotFoundException("Такого хранилища не существует.");
    }

    if (
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
