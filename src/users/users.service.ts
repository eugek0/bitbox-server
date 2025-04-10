import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as generateAvatar from "github-like-avatar-generator";
import * as moment from "moment";
import * as bcrypt from "bcryptjs";
import { User } from "./schemas";
import { Nullable } from "@/core";
import { RegisterUserDto } from "@/auth";
import { GetUserDto } from "./dtos";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getByEmail(email: string): Promise<Nullable<User>> {
    return await this.userModel.findOne({ email }).lean().exec();
  }

  async getByLogin(login: string): Promise<Nullable<User>> {
    return await this.userModel.findOne({ login }).lean().exec();
  }

  async getById(id: string): Promise<Nullable<User>> {
    return await this.userModel.findById(id).lean().exec();
  }

  async get(dto: GetUserDto): Promise<Nullable<User>> {
    const filter = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value),
    );
    return await this.userModel
      .findOne(filter)
      .select("-password")
      .lean()
      .exec();
  }

  async getAll(): Promise<User[]> {
    return await this.userModel.find().lean().exec();
  }

  async getAllUsers({
    password = true,
  }: {
    password?: boolean;
  }): Promise<User[]> {
    return await this.userModel
      .find({ role: "user" })
      .lean()
      .select(password ? null : "-password")
      .exec();
  }

  async getAllAdmins(): Promise<User[]> {
    return await this.userModel.find({ role: "admin" }).lean().exec();
  }

  async create(dto: RegisterUserDto): Promise<Nullable<User>> {
    if (await this.getByEmail(dto.email)) {
      throw new BadRequestException(
        "Пользователь с таким Email уже существует",
        { cause: "email" },
      );
    }
    if (await this.getByLogin(dto.login)) {
      throw new BadRequestException(
        "Пользователь с таким логином уже существует",
        { cause: "login" },
      );
    }

    const { password, ...rest } = dto;

    const user = await this.userModel.create({
      ...rest,
      password: await bcrypt.hash(password, await bcrypt.genSalt()),
      createdAt: moment().toISOString(),
      avatar: generateAvatar({
        blocks: 6,
        width: 100,
      }).base64,
      role: dto.role ?? "user",
    });
    return await user.save();
  }
}
