import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./schemas/user.schema";
import { JwtGuard } from "@/auth/jwt.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("list")
  @UseGuards(JwtGuard)
  async getUsersList(): Promise<User[]> {
    return await this.usersService.getAllUsers({ password: false });
  }

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
}
