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
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { DefaultOptionType } from "antd/es/select";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StoragesService } from "./storages.service";
import { JwtGuard } from "@/auth";
import { Storage } from "./schemas";
import { CreateStorageDto, DeleteStoragesDto } from "./dtos";
import {
  User,
  INotification,
  Nullable,
  NotificationException,
  TrimStringsPipe,
  getNoun,
} from "@/core";
import { StorageAdministratorGuard, StorageWatcherGuard } from "./guards";
import { EntitiesService } from "@/entities";

@Controller("storages")
export class StoragesController {
  constructor(
    private readonly storagesService: StoragesService,
    private readonly entitiesService: EntitiesService,
  ) {}

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Получен список хранилищ",
    type: [Storage],
  })
  @Get()
  @UseGuards(JwtGuard)
  async getAvailableStorages(@User() questioner: string): Promise<Storage[]> {
    return await this.storagesService.getAvailable(questioner);
  }

  @ApiTags("Хранилища")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Получена информация о хранилище",
    type: Storage,
  })
  @Get(":storageid")
  @UseGuards(JwtGuard, StorageWatcherGuard)
  async getStorageById(
    @Param("storageid") storageid: string,
  ): Promise<Nullable<Storage>> {
    const storage = await this.storagesService.getById(storageid);

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
  @ApiBody({
    type: Storage,
  })
  @UsePipes(TrimStringsPipe)
  @Post()
  @UseGuards(JwtGuard)
  async createStorage(
    @Body() dto: CreateStorageDto,
    @User() owner: string,
  ): Promise<INotification> {
    await this.storagesService.create(dto, owner);

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
  @ApiBody({
    type: Storage,
  })
  @ApiParam({
    name: "storageid",
    description: "ID хранилища",
  })
  @UsePipes(TrimStringsPipe)
  @Put(":storageid")
  @UseGuards(JwtGuard, StorageAdministratorGuard)
  async editStorage(
    @Param("storageid") storageid: string,
    @Body() dto: CreateStorageDto,
  ): Promise<INotification> {
    await this.storagesService.edit(dto, storageid);

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
  @UseGuards(JwtGuard, StorageAdministratorGuard)
  async deleteStorages(@Body() dto: DeleteStoragesDto): Promise<INotification> {
    await this.storagesService.delete(dto);

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
    description: "Получены хранилища пользователя",
    type: [Storage],
  })
  @ApiParam({
    name: "userid",
    description: "ID пользователя",
  })
  @Get("user/:userid")
  @UseGuards(JwtGuard)
  async getUserStorages(
    @Param("userid") userid: string,
    @User() questionerid: string,
  ): Promise<Storage[]> {
    return await this.storagesService.getUserAvailable(questionerid, userid);
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
        await this.storagesService.search(
          {
            name: name.trim(),
          },
          questioner,
        )
      ).map((storage) => ({
        label: storage.name,
        value: storage._id,
        type: "storage",
      })),
    };

    const entities = {
      label: "Сущности",
      options: (
        await this.entitiesService.search(
          {
            fullname: name.trim(),
          },
          questioner,
        )
      ).map((entity) => ({
        storage: entity.storage.toString(),
        extension: entity.extension,
        parent: entity.parent,
        label: entity.fullname,
        value: entity._id,
        type: entity.type,
      })),
    };

    return Object.values({ storages, entities }).filter(
      (group) => group.options.length,
    );
  }
}
