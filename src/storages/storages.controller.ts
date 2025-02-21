import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { StoragesService } from "./storages.service";
import { CreateStorageDto } from "./dtos";
import { JwtGuard } from "@/auth/jwt.guard";
import { User } from "@/core/decorators";
import { Storage } from "./schemas/storage.schema";
import { INotification } from "@/core/types";
import { DefaultOptionType } from "antd/es/select";

@Controller("storages")
export class StoragesController {
  constructor(private storagesService: StoragesService) {}

  @Get()
  async getStorages(): Promise<Storage[]> {
    return await this.storagesService.getStorages();
  }

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

  @Get("search/options")
  @UseGuards(JwtGuard)
  async search(@Query("name") name: string): Promise<DefaultOptionType[]> {
    if (!name) {
      return [];
    }

    const storages = await this.storagesService.search({ name });

    return storages.map((storage) => ({ value: storage.name }));
  }
}
