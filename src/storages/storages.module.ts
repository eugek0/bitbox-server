import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { StoragesService } from "./storages.service";
import { StoragesController } from "./storages.controller";
import { Storage, StorageSchema } from "./schemas";
import { UsersModule } from "@/users";
import { StorageMaintainerGuard, StorageWatcherGuard } from "./guards";

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: StorageSchema, name: Storage.name }]),
    UsersModule,
    JwtModule,
  ],
  controllers: [StoragesController],
  providers: [StoragesService, StorageWatcherGuard, StorageMaintainerGuard],
  exports: [StoragesService, StorageWatcherGuard, StorageMaintainerGuard],
})
export class StoragesModule {}
