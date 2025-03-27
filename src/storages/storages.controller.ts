import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
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
import { CreateEditStorageDto } from "./dtos";
import { TrimStringsPipe } from "@/core/pipes";
import { Response } from "express";
import { NotificationException } from "@/core/classes";
import { UploadFilesDto } from "./dtos/uploadFiles.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Entity } from "./schemas/entity.schema";
import { StorageGuard } from "./storage.guard";
import { DeleteStoragesDto } from "./dtos/deleteStorages.dto";
import { getNoun } from "@/core/utils";

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
  async getAvailableStorages(@User() questioner: string): Promise<Storage[]> {
    return await this.storagesService.getAvailableStorages(questioner);
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Получить информацию о хранилище.",
  })
  @Get(":storageid")
  @UseGuards(JwtGuard, StorageGuard())
  async getStorageById(
    @Param("storageid") storageid: string,
  ): Promise<Nullable<Storage>> {
    const storage = await this.storagesService.getStorageById(storageid);

    if (!storage) {
      throw new NotificationException(
        {
          status: "error",
          config: {
            message: "Ошибка",
            description: "Такого хранилища не найдено.",
          },
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
  async createStorage(
    @Body() dto: CreateEditStorageDto,
    @User() owner: string,
  ): Promise<INotification> {
    await this.storagesService.createStorage(dto, owner);

    return {
      notification: {
        status: "success",
        config: {
          message: "Успех",
          description: "Хранилище успешно создано!",
        },
      },
    };
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Хранилище создано.",
  })
  @UsePipes(TrimStringsPipe)
  @Put(":storageid")
  @UseGuards(JwtGuard, StorageGuard(true))
  async editStorage(
    @Param("storageid") storageid: string,
    @Body() dto: CreateEditStorageDto,
  ): Promise<INotification> {
    await this.storagesService.editStorage(dto, storageid);

    return {
      notification: {
        status: "success",
        config: {
          message: "Успех",
          description: "Хранилище успешно изменено!",
        },
      },
    };
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Хранилища удалены.",
  })
  @Delete()
  @UseGuards(JwtGuard, StorageGuard(true))
  async deleteStorages(@Body() dto: DeleteStoragesDto): Promise<INotification> {
    await this.storagesService.deleteStorage(dto);

    return {
      notification: {
        status: "success",
        config: {
          message: "Успех",
          description: `${dto.storages.length} ${getNoun(dto.storages.length, "хранилище", "хранилища", "хранилищ")} ${dto.storages.length > 1 ? "были" : "было"} успешно ${dto.storages.length > 1 ? "удалены" : "удалено"}!`,
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
    @User() questioner: string,
  ): Promise<DefaultOptionType[]> {
    if (!name) {
      return [];
    }

    const storages: DefaultOptionType = {
      label: "Хранилища",
      options: (
        await this.storagesService.searchStorages(
          {
            name: name.trim(),
          },
          questioner,
        )
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
  @Get(":storageid/entities")
  @UseGuards(JwtGuard, StorageGuard())
  async getStorageEntities(
    @Param("storageid") storageid: string,
    @Query("path") path: string,
  ): Promise<Entity[]> {
    const n = null;

    n.a

    return await this.storagesService.getStorageEntities(storageid, path);
  }

  @Get(":storageid/entity/:entityid")
  @UseGuards(JwtGuard, StorageGuard())
  async getEntityById(
    @Param("entityid") entityid: string,
  ): Promise<Nullable<Entity>> {
    return await this.storagesService.getEntityById(entityid);
  }

  @Get(":storageid/file/:fileid")
  @UseGuards(JwtGuard, StorageGuard())
  async getFileById(
    @Param("fileid") fileid: string,
    @Res() response: Response,
  ): Promise<void> {
    const path = await this.storagesService.getFilePathById(fileid);
    response.sendFile(path, { dotfiles: "allow" });
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post("upload/:storageid")
  @UseInterceptors(FilesInterceptor("entities"))
  @UseGuards(JwtGuard, StorageGuard())
  async uploadFiles(
    @Body() dto: UploadFilesDto,
    @Param("storageid") storageid: string,
    @UploadedFiles() entities: Express.Multer.File[],
  ): Promise<void> {
    await this.storagesService.uploadEntities(entities, storageid, dto.path);
  }
}
