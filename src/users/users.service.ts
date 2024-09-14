import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./schemas/user.schema";
import { CreateUserDto } from "@/auth/dtos/createUser.dto";
import * as moment from "moment";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email }).lean().exec();
  }

  async getById(id: string): Promise<User | undefined> {
    return await this.userModel.findById(id).lean().exec();
  }

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.getByEmail(dto.email)) {
      throw new BadRequestException(
        "Пользователь с таким Email уже существует",
      );
    }
    const user = await this.userModel.create({ ...dto, createdAt: moment().toISOString() });
    return await user.save();
  }
}
