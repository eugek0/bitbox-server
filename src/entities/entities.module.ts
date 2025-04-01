import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EntitiesService } from "./entities.service";
import { EntitiesController } from "./entities.controller";
import { Entity, EntitySchema } from "./schemas";
import { StoragesModule } from "@/storages";

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: EntitySchema, name: Entity.name }]),
    StoragesModule,
  ],
  providers: [EntitiesService],
  controllers: [EntitiesController],
})
export class EntitiesModule {}
