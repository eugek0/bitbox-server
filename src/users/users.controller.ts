import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DefaultOptionType } from "antd/es/select";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtGuard } from "@/auth/jwt.guard";
import { FormException, INotification, Nullable } from "@/core";
import { User } from "./schemas";
import { EditUserDto } from "./dtos/edit.dto";
import { ChangePasswordDto } from "./dtos/changePassword.dto";
import { ChangeRoleDto } from "./dtos/changeRole.dto";

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
  async get(
    @Query("_id") _id: string,
    @Query("email") email: string,
    @Query("login") login: string,
  ): Promise<Nullable<User>> {
    if (!_id && !email && !login) {
      throw new BadRequestException("Отсутствуют фильтры для поиска");
    }

    return await this.usersService.get({ _id, email, login });
  }

  @ApiTags("Пользователи")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Пользователи.",
  })
  @Get("all")
  @UseGuards(JwtGuard)
  async getAll(): Promise<User[]> {
    return await this.usersService.getAll({ password: false });
  }

  @ApiTags("Пользователи")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Пользователи.",
  })
  @Patch("role/:userid")
  @UseGuards(JwtGuard)
  async changeRole(
    @Param("userid") userid: string,
    @Body() dto: ChangeRoleDto,
  ): Promise<void> {
    const user = await this.usersService.getById(userid);

    if (user.isCreator) {
      throw new BadRequestException("Нельзя изменить роль у создателя сервиса");
    }

    await this.usersService.changeRole(userid, dto.role);
  }

  @ApiTags("Пользователи")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Пользователь успешно изменен.",
  })
  @Patch(":userid")
  @UseGuards(JwtGuard)
  async edit(
    @Param("userid") userid: string,
    @Body() dto: EditUserDto,
  ): Promise<INotification> {
    const user = await this.usersService.getById(userid);

    if (
      user.login !== dto.login &&
      (await this.usersService.getByLogin(dto.login))
    ) {
      throw new FormException(
        "Пользователь с таким логином уже существует",
        "login",
      );
    }

    await this.usersService.editById(userid, dto);

    return {
      notification: {
        status: "success",
        config: {
          message: "Успех",
          description: "Профиль успешно отредактирован",
        },
      },
    };
  }

  @ApiTags("Пользователи")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Пароль успешно изменен.",
  })
  @Patch("password/:userid")
  @UseGuards(JwtGuard)
  async changePassword(
    @Param("userid") userid: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<INotification> {
    await this.usersService.changePassword(userid, dto);

    return {
      notification: {
        status: "success",
        config: {
          message: "Успех",
          description: "Пароль успешно изменен",
        },
      },
    };
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
      search: `${user.login} ${user.email}`,
    }));
  }
}
