import { Controller, Post, UseGuards } from "@nestjs/common";
import { StoragesService } from "./storages.service";
import { CreateStorageDto } from "./dtos/createStorage.dto";
import { JwtGuard } from "@/auth/jwt.guard";

@Controller("storages")
export class StoragesController {
  constructor(private storagesService: StoragesService) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(dto: CreateStorageDto): Promise<void> {
    await this.storagesService.create(dto);
  }
}
