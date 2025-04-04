import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DefaultOptionType } from "antd/es/select";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtGuard } from "@/auth/jwt.guard";
import { Nullable } from "@/core";
import { User } from "./schemas";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiTags("Пользователи")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Пользователь.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Отсутствуют фильтры для поиска.",
  })
  @Get()
  @UseGuards(JwtGuard)
  async getUser(
    @Query("_id") _id: string,
    @Query("email") email: string,
    @Query("login") login: string,
  ): Promise<Nullable<User>> {
    if (!_id && !email && !login) {
      throw new BadRequestException("Отсутствуют фильтры для поиска");
    }

    return await this.usersService.get({ _id, email, login });
  }

  @Get("/record")
  @UseGuards(JwtGuard)
  async getRecord(): Promise<Record<string, User>> {
    const users = await this.usersService.getAllUsers({ password: false });

    return Object.fromEntries(
      Object.entries(Object.groupBy(users, (user) => user._id)).map(
        ([key, [user]]) => [key, user],
      ),
    );
  }

  @Get("/options")
  @UseGuards(JwtGuard)
  async getOptions(): Promise<DefaultOptionType[]> {
    const users = await this.usersService.getAllUsers({ password: false });

    return users.map((user) => ({
      value: user._id,
      label: user.login,
      avatar: user.avatar,
    }));
  }
}
