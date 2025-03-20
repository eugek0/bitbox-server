import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { StoragesService } from "./storages.service";
import { JwtGuard } from "@/auth/jwt.guard";
import { User } from "@/core/decorators";
import { INotification, Nullable } from "@/core/types";
import { DefaultOptionType } from "antd/es/select";
import { Storage } from "./schemas/storage.schema";
import { CreateStorageDto } from "./dtos";
import { TrimStringsPipe } from "@/core/pipes";
import { Request } from "express";
import { NotificationException } from "@/core/classes";

@Controller("storages")
export class StoragesController {
  constructor(private storagesService: StoragesService) {}

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Список хранилищ.",
  })
  @Get()
  @UseGuards(JwtGuard)
  async get(@Req() request: Request): Promise<Storage[]> {
    return await this.storagesService.getAvailable(request.user as string);
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Получить информацию о хранилище.",
  })
  @Get(":id")
  @UseGuards(JwtGuard)
  async getById(
    @Param("id") id: string,
    @Req() request: Request,
  ): Promise<Nullable<Storage>> {
    const storage = await this.storagesService.getAvailableById(
      id,
      request.user as string,
    );

    if (!storage) {
      throw new NotificationException(
        {
          status: "error",
          config: { message: "Такого хранилища не найдено." },
        },
        404,
      );
    }

    return storage;
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Хранилище создано.",
  })
  @UsePipes(TrimStringsPipe)
  @Post()
  @UseGuards(JwtGuard)
  async create(
    @Body() dto: CreateStorageDto,
    @User() owner: string,
  ): Promise<INotification> {
    await this.storagesService.create(dto, owner);

    return {
      notification: {
        status: "success",
        config: {
          message: "Хранилище успешно создано!",
        },
      },
    };
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Хранилище удалено.",
  })
  @Delete(":id")
  @UseGuards(JwtGuard)
  async delete(@Param("id") id: string): Promise<INotification> {
    await this.storagesService.delete(id);

    return {
      notification: {
        status: "success",
        config: {
          message: "Хранилище успешно удалено!",
        },
      },
    };
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Список хранилищ для выпадающего списка.",
  })
  @Get("search/options")
  @UseGuards(JwtGuard)
  async searchOptions(
    @Query("name") name: string,
  ): Promise<DefaultOptionType[]> {
    if (!name) {
      return [];
    }

    const storages: DefaultOptionType = {
      label: "Хранилища",
      options: (await this.storagesService.search({ name: name.trim() })).map(
        (storage) => ({
          value: storage.name,
        }),
      ),
    };

    return storages?.options?.length ? [storages] : [];
  }
}
