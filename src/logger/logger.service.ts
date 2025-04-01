import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as moment from "moment";
import { Log } from "./schemas";

@Injectable()
export class LoggerService {
  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {}

  async create(user: string, message: string): Promise<Log> {
    const log = await this.logModel.create({
      createdAt: moment().toISOString(),
      message,
      user,
    });
    return await log.save();
  }
}
