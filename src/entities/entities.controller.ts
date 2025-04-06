import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtGuard } from "@/auth";
import { EntitiesService } from "./entities.service";
import {
  CreateDirectoryDto,
  DeleteEntitiesDto,
  UploadEntitiesDto,
} from "./dtos";
import { Entity } from "./schemas";
import { Nullable } from "@/core";
import { StorageMaintainerGuard, StorageWatcherGuard } from "@/storages/guards";
import { GetEntitiesDto } from "./dtos/getEntities.dto";
import { MetadataFilesInterceptor } from "@/core/interceptors";

@Controller("entities")
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Одна сущность хранилища.",
  })
  @Get(":storageid/:entityid")
  @UseGuards(JwtGuard, StorageWatcherGuard)
  async getById(
    @Param("entityid") entityid: string,
  ): Promise<Nullable<Entity>> {
    return await this.entitiesService.getById(entityid);
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Список сущностей хранилища.",
  })
  @Get(":storageid")
  @UseGuards(JwtGuard, StorageWatcherGuard)
  async get(
    @Param("storageid") storageid: string,
    @Query("parent") parent: string,
  ): Promise<GetEntitiesDto> {
    const items = await this.entitiesService.get(storageid, parent);
    const breadcrumbs = await this.entitiesService.getBreadcrumbs(parent);

    return {
      items,
      breadcrumbs,
    };
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Бинарник файла.",
  })
  @Get(":storageid/blob/:fileid")
  @UseGuards(JwtGuard, StorageWatcherGuard)
  async getBlob(
    @Param("fileid") fileid: string,
    @Res() response: Response,
  ): Promise<void> {
    const path = await this.entitiesService.getPathById(fileid);
    response.sendFile(path, { dotfiles: "allow" });
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post(":storageid")
  @UseInterceptors(FilesInterceptor("entities"), MetadataFilesInterceptor)
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async upload(
    @Body() dto: UploadEntitiesDto,
    @Param("storageid") storageid: string,
    @UploadedFiles() entities: Express.Multer.File[],
  ): Promise<void> {
    await this.entitiesService.upload(entities, storageid, dto);
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post("mkdir/:storageid")
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async createDirectory(
    @Body() dto: CreateDirectoryDto,
    @Param("storageid") storageid: string,
  ): Promise<void> {
    await this.entitiesService.createDirectory(dto, storageid);
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Delete("rm/:storageid")
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async delete(
    @Body() dto: DeleteEntitiesDto,
    @Param("storageid") storageid: string,
  ): Promise<void> {
    await this.entitiesService.delete(dto, storageid);
  }
}
