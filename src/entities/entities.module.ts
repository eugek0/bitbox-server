import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EntitiesService } from "./entities.service";
import { EntitiesController } from "./entities.controller";
import { Entity, EntitySchema } from "./schemas";
import { StoragesModule } from "@/storages/storages.module";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "@/users";
import { MulterModule } from "@nestjs/platform-express";
import * as multer from "multer";
import { v4 } from "uuid";

@Module({
  imports: [
    MulterModule.register({
      storage: multer.diskStorage({
        destination: (_, __, cb) => {
          cb(null, "temp");
        },
        filename: (_, __, cb) => {
          cb(null, v4());
        },
      }),
    }),
    MongooseModule.forFeature([{ schema: EntitySchema, name: Entity.name }]),
    forwardRef(() => StoragesModule),
    UsersModule,
    JwtModule,
  ],
  providers: [EntitiesService],
  controllers: [EntitiesController],
  exports: [EntitiesService],
})
export class EntitiesModule {}
