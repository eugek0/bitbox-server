import { Module } from "@nestjs/common";
import { StoragesService } from "./storages.service";
import { StoragesController } from "./storages.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Storage, StorageSchema } from "./schemas/storage.schema";
import { UsersModule } from "@/users/users.module";
import { Entity, EntitySchema } from "./schemas/entity.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: StorageSchema, name: Storage.name },
      { schema: EntitySchema, name: Entity.name },
    ]),
    UsersModule,
  ],
  providers: [StoragesService],
  controllers: [StoragesController],
})
export class StoragesModule {}
