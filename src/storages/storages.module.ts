import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { StoragesService } from "./storages.service";
import { StoragesController } from "./storages.controller";
import { Storage, StorageSchema } from "./schemas";
import { EntitiesModule } from "@/entities/entities.module";
import { UsersModule } from "@/users";
import {
  StorageMaintainerGuard,
  StorageWatcherGuard,
  StorageAdministratorGuard,
} from "./guards";

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: StorageSchema, name: Storage.name }]),
    forwardRef(() => EntitiesModule),
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
