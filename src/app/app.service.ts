import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DEFAULT_APP_STATUS } from "./constants";
import { AppStatus } from "./schemas/appStatus.schema";
import * as fs from "fs/promises";

@Injectable()
export class AppService {
  constructor(
    @InjectModel(AppStatus.name) private readonly statusModel: Model<AppStatus>,
  ) {}

  async getStatus(): Promise<AppStatus> {
    return (
      (await this.statusModel.findOne().lean().exec()) ?? DEFAULT_APP_STATUS
    );
  }

  async getFileSystem(): Promise<any> {
    return fs.readdir("/home");
  }
}
