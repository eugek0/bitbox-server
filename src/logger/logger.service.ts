import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Log } from "./schemas";
import { Method } from "./schemas/method.schema";

@Injectable()
export class LoggerService {
  constructor(
    @InjectModel(Log.name) private logModel: Model<Log>,
    @InjectModel(Method.name) private methodModel: Model<Method>,
  ) {}

  async getAll(): Promise<Log[]> {
    return await this.logModel.find().lean().exec();
  }

  async create(log: Partial<Log>): Promise<Log> {
    const candidate = await this.logModel.create(log);
    return await candidate.save();
  }

  async seedMethodsDescriptions(seed: Omit<Method, "_id">[]): Promise<void> {
    await this.methodModel.insertMany(seed);
  }

  async methodsCount(): Promise<number> {
    return await this.methodModel.countDocuments();
  }

  async getMethods(): Promise<Method[]> {
    return await this.methodModel.find().lean().exec();
  }
}
