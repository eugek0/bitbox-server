import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Storage } from "@/storages/schemas";
import { EntityType } from "../types";
import { User } from "@/core";
import { ApiProperty } from "@nestjs/swagger";

export type EntityDocument = HydratedDocument<Entity>;

@Schema()
export class Entity {
  @ApiProperty({
    name: "_id",
    description: "ID сущности",
    type: String,
    required: true,
  })
  _id: string;

  @ApiProperty({
    name: "name",
    description: "Имя сущности",
    type: String,
    required: true,
  })
  @Prop()
  name: string;

  @ApiProperty({
    name: "extension",
    description: "Расширение сущности",
    type: String,
    required: true,
  })
  @Prop()
  extension: string;

  @ApiProperty({
    name: "fullname",
    description: "Полное имя сущности (Имя + Расширение)",
    type: String,
    required: true,
  })
  @Prop()
  fullname: string;

  @ApiProperty({
    name: "type",
    description: "Тип сущности (Файл или Директория)",
    type: String,
    required: true,
  })
  @Prop()
  type: EntityType;

  @ApiProperty({
    name: "size",
    description: "Размер сущности в КБ",
    type: Number,
    required: true,
  })
  @Prop()
  size: number;

  @ApiProperty({
    name: "storage",
    description: "ID хранилища, в котором хранится сущность",
    type: String,
    required: true,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Storage.name })
  storage: string;

  @ApiProperty({
    name: "parent",
    description: "ID родительской сущности",
    type: String,
    required: true,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Entity.name })
  parent?: string;

  @ApiProperty({
    name: "uploadedAt",
    description: "Дата и время загрузки",
    type: String,
    format: "YYYY-MM-DDTHH:mm:ssZ",
    required: true,
  })
  @Prop()
  uploadedAt: string;

  @ApiProperty({
    name: "uploader",
    description: "ID пользователя, загрузившего сущность",
    type: String,
    required: true,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  uploader: string;
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
