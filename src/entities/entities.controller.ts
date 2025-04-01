import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import {
  Body,
  Controller,
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
import { StorageGuard } from "@/storages";
import { EntitiesService } from "./entities.service";
import { UploadEntitiesDto } from "./dtos";
import { Entity } from "./schemas";
import { Nullable } from "@/core";

@Controller("entities")
export class EntitiesController {
  constructor(private entitiesService: EntitiesService) {}

  @Get(":storageid/entity/:entityid")
  @UseGuards(JwtGuard, StorageGuard())
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
  @UseGuards(JwtGuard, StorageGuard())
  async get(
    @Param("storageid") storageid: string,
    @Query("path") path: string,
  ): Promise<Entity[]> {
    return await this.entitiesService.get(storageid, path);
  }

  @Get(":storageid/file/:fileid")
  @UseGuards(JwtGuard, StorageGuard())
  async getPathById(
    @Param("fileid") fileid: string,
    @Res() response: Response,
  ): Promise<void> {
    const path = await this.entitiesService.getPathById(fileid);
    response.sendFile(path, { dotfiles: "allow" });
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post("upload/:storageid")
  @UseInterceptors(FilesInterceptor("entities"))
  @UseGuards(JwtGuard, StorageGuard())
  async upload(
    @Body() dto: UploadEntitiesDto,
    @Param("storageid") storageid: string,
    @UploadedFiles() entities: Express.Multer.File[],
  ): Promise<void> {
    await this.entitiesService.upload(entities, storageid, dto.path);
  }
}
