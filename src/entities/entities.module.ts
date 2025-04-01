import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EntitiesService } from "./entities.service";
import { EntitiesController } from "./entities.controller";
import { Entity, EntitySchema } from "./schemas";
import { StoragesModule } from "@/storages";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "@/users";

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: EntitySchema, name: Entity.name }]),
    StoragesModule,
    UsersModule,
    JwtModule,
  ],
  providers: [EntitiesService],
  controllers: [EntitiesController],
})
export class EntitiesModule {}
