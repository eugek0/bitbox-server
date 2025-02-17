import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as path from "path";
import { promises as fs } from "fs";
import { CreateStorageDto } from "./dtos/createStorage.dto";

@Injectable()
export class StoragesService {
  constructor(
    @InjectModel(Storage.name) private storageModel: Model<Storage>,
  ) {}

  private root: string = path.resolve(__dirname, "..", "..", "storages");

  async create(dto: CreateStorageDto): Promise<void> {
    try {
      const _id = new Types.ObjectId();

      await fs.mkdir(path.join(this.root, _id.toString()));

      const storage = new this.storageModel({ _id, ...dto });

      await storage.save();
    } catch (error) {}
  }
}
