import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { StoragesService } from "./storages.service";
import { JwtGuard } from "@/auth/jwt.guard";
import { User } from "@/core/decorators";
import { INotification } from "@/core/types";
import { DefaultOptionType } from "antd/es/select";
import { Storage } from "./schemas/storage.schema";
import { CreateStorageDto } from "./dtos";
import { TrimStringsPipe } from "@/core/pipes";

@Controller("storages")
export class StoragesController {
  constructor(private storagesService: StoragesService) {}

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Список хранилищ.",
  })
  @Get()
  async getStorages(): Promise<Storage[]> {
    return await this.storagesService.getStorages();
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
