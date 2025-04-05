import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { StoragesService } from "./storages.service";
import { StoragesController } from "./storages.controller";
import { Storage, StorageSchema } from "./schemas";
import { UsersModule } from "@/users";
import {
  StorageMaintainerGuard,
  StorageWatcherGuard,
  StorageAdministratorGuard,
} from "./guards";

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: StorageSchema, name: Storage.name }]),
    UsersModule,
    JwtModule,
  ],
  controllers: [StoragesController],
  providers: [
    StoragesService,
    StorageWatcherGuard,
    StorageMaintainerGuard,
    StorageAdministratorGuard,
  ],
  exports: [
    StoragesService,
    StorageWatcherGuard,
    StorageMaintainerGuard,
    StorageAdministratorGuard,
  ],
})
export class StoragesModule {}
