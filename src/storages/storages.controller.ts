import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { StoragesService } from "./storages.service";
import { CreateStorageDto } from "./dtos";
import { JwtGuard } from "@/auth/jwt.guard";
import { User } from "@/core/decorators";
import { Storage } from "./schemas/storage.schema";
import { INotification } from "@/core/types";

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
}
