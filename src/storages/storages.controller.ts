import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
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
import { UploadFilesDto } from "./dtos/uploadFiles.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Entity } from "./schemas/entity.schema";

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
    return await this.storagesService.getAvailableStorages(
      request.user as string,
    );
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
    const storage = await this.storagesService.getAvailableStoragesById(
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
    await this.storagesService.createStorage(dto, owner);

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
    await this.storagesService.deleteStorage(id);

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
      options: (
        await this.storagesService.searchStorages({ name: name.trim() })
      ).map((storage) => ({
        value: storage.name,
        _id: storage._id,
      })),
    };

    return storages?.options?.length ? [storages] : [];
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Список сущностей хранилища.",
  })
  @Get(":storage/entities")
  @UseGuards(JwtGuard)
  async getStorageEntities(
    @Param("storage") storage: string,
    @Query("path") path: string,
  ): Promise<Entity[]> {
    return await this.storagesService.getStorageEntities(storage, path);
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post("upload/:storage")
  @UseInterceptors(FilesInterceptor("entities"))
  @UseGuards(JwtGuard)
  async uploadFiles(
    @Body() dto: UploadFilesDto,
    @Param("storage") storage: string,
    @UploadedFiles() entities: Express.Multer.File[],
  ): Promise<void> {
    await this.storagesService.uploadEntities(entities, storage, dto.path);
  }
}
