import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "@/auth/jwt.guard";
import { UsersService } from "./users.service";
import { User } from "./schemas/user.schema";
import { DefaultOptionType } from "antd/es/select";

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
  ): Promise<User | undefined> {
    if (!_id && !email && !login) {
      throw new BadRequestException("Отсутствуют фильтры для поиска");
    }

    return await this.usersService.get({ _id, email, login });
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
