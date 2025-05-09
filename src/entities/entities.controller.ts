import { ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { Nullable, User } from "@/core";
import { StorageMaintainerGuard, StorageWatcherGuard } from "@/storages/guards";
import { GetEntitiesDto } from "./dtos/getEntities.dto";
import { MetadataFilesInterceptor } from "@/core/interceptors";
import { DownloadEntitiesDto } from "./dtos/download.dto";
import { Response } from "express";
import { PasteEntityDto } from "./dtos";
import { RenameEntityDto } from "./dtos/rename.dto";

@Controller("entities")
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Получен бинарник файла.",
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @Post("/blob/:storageid")
  @UseGuards(JwtGuard, StorageWatcherGuard)
  async getBlob(
    @Res() response: Response,
    @Param("storageid") storageid: string,
    @Body() dto: DownloadEntitiesDto,
  ): Promise<any> {
    await this.entitiesService.downloadEntities(
      dto.entities,
      storageid,
      response,
    );
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Одна сущность хранилища",
    type: Entity,
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @ApiParam({
    name: "entityid",
    description: "ID сущности",
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
    description: "Список сущностей хранилища",
    type: [Entity],
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @ApiQuery({
    name: "parent",
    description: "ID родительской сущности",
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
    status: HttpStatus.CREATED,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Сущности загружены",
    type: [Entity],
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @Post(":storageid")
  @UseInterceptors(FilesInterceptor("entities"), MetadataFilesInterceptor)
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async upload(
    @Body() dto: UploadEntitiesDto,
    @Param("storageid") storageid: string,
    @UploadedFiles() entities: Express.Multer.File[],
    @User() uploader: string,
  ): Promise<void> {
    return await this.entitiesService.upload(
      entities,
      storageid,
      dto,
      uploader,
    );
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Директория создана",
    type: [Entity],
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @Post("mkdir/:storageid")
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async createDirectory(
    @Body() dto: CreateDirectoryDto,
    @Param("storageid") storageid: string,
    @User() uploader: string,
  ): Promise<void> {
    await this.entitiesService.createDirectory(dto, storageid, uploader);
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Сушности удалены",
    type: [Entity],
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @Delete("rm/:storageid")
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async delete(
    @Body() dto: DeleteEntitiesDto,
    @Param("storageid") storageid: string,
  ): Promise<void> {
    await this.entitiesService.delete(dto, storageid);
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @Post("paste/:storageid")
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async paste(
    @Body() dto: PasteEntityDto,
    @Param("storageid") storageid: string,
  ): Promise<void> {
    await this.entitiesService.paste(dto, storageid);
  }

  @ApiTags("Сущности")
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @Patch("rename/:storageid")
  @UseGuards(JwtGuard, StorageMaintainerGuard)
  async rename(
    @Body() dto: RenameEntityDto,
    @Param("storageid") storageid: string,
  ): Promise<void> {
    await this.entitiesService.rename(dto, storageid);
  }
}
