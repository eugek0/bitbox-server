import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { StoragesService } from "./storages.service";
import { CreateStorageDto } from "./dtos";
import { JwtGuard } from "@/auth/jwt.guard";
import { User } from "@/core/decorators";
import { Storage } from "./schemas/storage.schema";

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
  ): Promise<void> {
    await this.storagesService.create(dto, owner);
  }

  @Delete()
  @UseGuards(JwtGuard)
  async delete(@Query("id") id: string): Promise<void> {
    await this.storagesService.delete(id);
  }
}
