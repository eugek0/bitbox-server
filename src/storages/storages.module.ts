import { Module } from "@nestjs/common";
import { StoragesService } from "./storages.service";
import { StoragesController } from "./storages.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Storage, StorageSchema } from "./schemas/storage.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: StorageSchema, name: Storage.name }]),
  ],
  providers: [StoragesService],
  controllers: [StoragesController],
})
export class StoragesModule {}
