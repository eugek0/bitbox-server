import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import * as moment from "moment";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
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
import { Storage, StoragesService } from "@/storages";
import {
  CreateDirectoryDto,
  DeleteEntitiesDto,
  UploadEntitiesDto,
} from "./dtos";
import { IEntityBreadcrumb } from "./types";

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

  async get(storageid: string, parent?: string): Promise<Entity[]> {
    return await this.entityModel
      .find({
        storage: storageid,
        parent: !parent || parent === "undefined" ? null : parent,
      })
      .lean();
  }

  async getPathById(entityid: string): Promise<string | undefined> {
    const entity = await this.getById(entityid);

    const path = p.join(
      STORAGE_ROOT,
      entity.storage.toString(),
      `${entity._id.toString()}.${entity.extension}`,
    );

    if (!exists(path)) {
      throw new NotFoundException("Такого файла не существует");
    }

    return path;
  }

  async upload(
    entities: Express.Multer.File[],
    storageid: string,
    dto: UploadEntitiesDto,
  ): Promise<void> {
    const storage = await this.storagesService.getById(storageid);
    const storageEntities = await this.get(storageid, dto.parent);
    const newEntities: EntityDocument[] = [];
    const totalEntitiesSize = entities.reduce(
      (accumulator, entity) => accumulator + entity.size,
      0,
    );

    if (
      !storage ||
      !(await exists(p.resolve(STORAGE_ROOT, storage._id.toString())))
    ) {
      throw new NotFoundException("Такого хранилища не существует");
    }

    this.validateStorageLimits(
      storage,
      storageEntities.length,
      entities,
      totalEntitiesSize,
    );

    try {
      for (const entity of entities) {
        const [name, extension] = entity.originalname.split(/\.(?!.*\.)/);
        const paths = entity?.path?.split("/");
        paths?.pop();

        let parentid = dto.parent;
        if (paths) {
          parentid = await this.createPathTreeAndReturnParentId(
            paths,
            storageid,
            dto.parent,
          );
        }

        const entityuuid = new mongoose.Types.ObjectId();

        const newFilePath = p.join(
          STORAGE_ROOT,
          storage._id.toString(),
          `${entityuuid.toString()}.${extension}`,
        );

        if (!(await exists(newFilePath))) {
          newEntities.push(
            new this.entityModel({
              _id: entityuuid,
              fullname: entity.originalname,
              name,
              extension,
              size: entity.size,
              type: "file",
              storage: storageid,
              parent: !parentid || parentid === "undefined" ? null : parentid,
            }),
          );
        }

        await fs.mkdir(p.dirname(newFilePath), { recursive: true });
        await fs.writeFile(newFilePath, entity.buffer);
      }
    } catch (error) {
      console.log(error);
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

  async clearStorage(storageid: string): Promise<void> {
    await this.entityModel.deleteMany({ storage: storageid });
  }

  async createDirectory(
    dto: CreateDirectoryDto,
    storageid: string,
  ): Promise<void> {
    try {
      const directory = new this.entityModel({
        name: dto.name,
        fullname: dto.name,
        storage: storageid,
        parent: dto.parent,
        type: "directory",
        size: 0,
        createdAt: moment().toISOString(),
      });

      await directory.save();
    } catch (error) {
      throw new InternalServerErrorException(
        "Произошла ошибка при создании директории",
      );
    }
  }

  async delete(dto: DeleteEntitiesDto, storageid: string): Promise<void> {
    let freedSize = 0;

    try {
      for (const entity of dto.entities) {
        freedSize += await this.deleteEntityRecursive(entity, storageid);
      }

      const storage = await this.storagesService.getById(storageid);
      await this.storagesService.edit(
        {
          used: Math.max(0, storage.used - freedSize),
        },
        storageid,
      );
    } catch {
      throw new InternalServerErrorException("Ошибка при удалении сущностей");
    }
  }

  async getBreadcrumbs(entityid: string) {
    const breadcrumbs: IEntityBreadcrumb[] = [];
    let current = await this.entityModel.findById(entityid).lean().exec();

    while (current) {
      breadcrumbs.unshift({ _id: current._id, fullname: current.fullname }); // Добавляем в начало (от корня к текущему)
      if (!current.parent) break;
      current = await this.entityModel.findById(current.parent).exec();
    }

    return breadcrumbs;
  }

  private validateStorageLimits(
    storage: Storage,
    existingCount: number,
    newEntities: Express.Multer.File[],
    newSize: number,
  ): void {
    if (
      storage.restrictFilesCount &&
      existingCount + newEntities.length > storage.maxFilesCount
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
      newEntities.some((file) => file.size > storage.maxFileSize)
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

    if (storage.used + newSize > storage.size) {
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
  }

  private async createPathTreeAndReturnParentId(
    pathParts: string[],
    storageId: string,
    rootParent?: string,
  ): Promise<string> {
    let parentId =
      !rootParent || rootParent === "undefined" ? null : rootParent;

    for (const folder of pathParts) {
      const existing = await this.entityModel.findOne({
        name: folder,
        parent: parentId,
        storage: storageId,
        type: "directory",
      });

      if (existing) {
        parentId = existing._id.toString();
        continue;
      }

      const created = await this.entityModel.create({
        name: folder,
        fullname: folder,
        extension: "",
        type: "directory",
        size: 0,
        storage: storageId,
        parent: parentId,
      });

      parentId = created._id.toString();
    }

    return parentId;
  }

  private async deleteEntityRecursive(
    entityid: string,
    storageid: string,
  ): Promise<number> {
    const entity = await this.entityModel.findOne({
      _id: entityid,
      storage: storageid,
    });

    if (!entity) throw new NotFoundException("Сущность не найдена");

    const entityPath = p.join(
      STORAGE_ROOT,
      entity.storage.toString(),
      `${entity._id.toString()}.${entity.extension}`,
    );
    let totalFreedSize = 0;

    if (entity.type === "directory") {
      const children = await this.entityModel.find({ parent: entity._id });

      for (const child of children) {
        await this.deleteEntityRecursive(child._id.toString(), storageid);
      }

      if (await exists(entityPath)) {
        await fs.rmdir(entityPath).catch(() => null);
      }
    }

    if (entity.type === "file") {
      if (await exists(entityPath)) {
        await fs.unlink(entityPath).catch(() => null);
        totalFreedSize += entity.size || 0;
      }
    }

    await this.entityModel.deleteOne({ _id: entity._id });

    return totalFreedSize;
  }
}
