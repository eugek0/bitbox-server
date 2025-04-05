import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as p from "path";
import * as fs from "fs/promises";
import { Entity, EntityDocument } from "./schemas";
import {
  convertBytes,
  exists,
  NotificationException,
  Nullable,
  STORAGE_ROOT,
} from "@/core";
import { StoragesService } from "@/storages";

@Injectable()
export class EntitiesService {
  constructor(
    @InjectModel(Entity.name) private readonly entityModel: Model<Entity>,
    @Inject(forwardRef(() => StoragesService))
    private readonly storagesService: StoragesService,
  ) {}

  async getById(entityid: string): Promise<Nullable<Entity>> {
    return await this.entityModel.findById(entityid).lean();
  }

  async get(storageid: string, path: string): Promise<Entity[]> {
    return await this.entityModel.find({ storage: storageid, path }).lean();
  }

  async getPathById(entityid: string): Promise<string | undefined> {
    const entity = await this.getById(entityid);

    const path = p.join(
      STORAGE_ROOT,
      entity.storage.toString(),
      entity.fullname,
    );

    if (!exists(path)) {
      throw new NotFoundException("Такого файла не существует");
    }

    return path;
  }

  async upload(
    entities: Express.Multer.File[],
    storageid: string,
    path: string,
  ): Promise<void> {
    const storage = await this.storagesService.getById(storageid);
    const storageEntities = await this.get(storageid, "/");
    const newEntities: EntityDocument[] = [];
    const totalEntitiesSize = entities.reduce(
      (accumulator, entity) => accumulator + entity.size,
      0,
    );

    if (!storage) {
      throw new NotFoundException("Такого хранилища не существует");
    }

    if (!(await exists(p.join(STORAGE_ROOT, storage._id.toString(), path)))) {
      throw new NotFoundException("Директории по такому пути не существует");
    }

    if (
      storage.restrictFilesCount &&
      storageEntities.length + entities.length > storage.maxFilesCount
    ) {
      throw new NotificationException(
        {
          status: "error",
          config: {
            message: "Ошибка",
            description: `При записи файлов будет превышено максимальное количество файлов в хранилище (${storage.maxFilesCount} шт.)`,
          },
        },
        400,
      );
    }

    if (
      storage.restrictFileSize &&
      entities.some((entity) => entity.size > storage.maxFileSize)
    ) {
      throw new NotificationException(
        {
          status: "error",
          config: {
            message: "Ошибка",
            description: `Один из файлов превышает максимально допустимый размер в ${convertBytes(storage.maxFileSize)}`,
          },
        },
        400,
      );
    }

    if (storage.used + totalEntitiesSize > storage.size) {
      throw new NotificationException(
        {
          status: "error",
          config: {
            message: "Ошибка",
            description: `При записи файлов будет превышен максимальный размер хранилища в ${convertBytes(storage.size)}`,
          },
        },
        400,
      );
    }

    try {
      for (const entity of entities) {
        const [name, extension] = entity.originalname.split(/\.(?!.*\.)/);
        const newFilePath = p.join(
          STORAGE_ROOT,
          storage._id.toString(),
          path,
          entity.originalname,
        );

        if (!(await exists(newFilePath))) {
          newEntities.push(
            new this.entityModel({
              fullname: entity.originalname,
              storage: storageid,
              size: entity.size,
              type: "file",
              extension,
              name,
              path,
            }),
          );
        }
        await fs.writeFile(newFilePath, entity.buffer);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        "Ошибка при записи файлов в хранилище",
      );
    }

    await this.entityModel.bulkSave(newEntities);
    await this.storagesService.edit(
      {
        used: storage.used + totalEntitiesSize,
      },
      storage._id.toString(),
    );
  }
}
