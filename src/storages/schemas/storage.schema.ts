import { User } from "@/users/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument } from "mongoose";
import { StorageAccess, StorageMemberRole } from "../types";
import { ApiProperty } from "@nestjs/swagger";

export type StorageDocument = HydratedDocument<Storage>;

@Schema()
class StorageMember extends Document {
  @ApiProperty({
    name: "_id",
    description: "ID пользователя",
    type: String,
    required: true,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  _id: string;

  @ApiProperty({
    name: "role",
    description: "Роль пользователя",
    type: String,
    example: "maintainer",
    required: true,
  })
  @Prop()
  role: StorageMemberRole;
}

@Schema()
export class Storage {
  @ApiProperty({
    name: "_id",
    description: "ID хранилища",
    type: String,
    required: true,
  })
  _id: string;

  @ApiProperty({
    name: "name",
    description: "Название хранилища",
    type: String,
    required: true,
    example: "Тестовое хранилище",
  })
  @Prop({ unique: true })
  readonly name: string;

  @ApiProperty({
    name: "description",
    description: "Описание хранилища",
    type: String,
    required: true,
    example: "Описание тестового хранилища",
  })
  @Prop()
  readonly description: string;

  @ApiProperty({
    name: "owner",
    description: "ID владельца хранилища",
    type: String,
    required: true,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  readonly owner: User;

  @ApiProperty({
    name: "used",
    description: "Размер использованного места в КБ",
    type: Number,
    required: true,
    example: 1024,
  })
  @Prop()
  readonly used: number;

  @ApiProperty({
    name: "size",
    description: "Размер допустимого места в КБ",
    type: Number,
    required: true,
    example: 1024,
  })
  @Prop()
  readonly size: number;

  @ApiProperty({
    name: "access",
    description: "Доступность хранилища",
    type: String,
    required: true,
    example: "public",
  })
  @Prop()
  readonly access: StorageAccess;

  @ApiProperty({
    name: "members",
    description: "Список участников хранилища",
    type: [StorageMember],
    required: true,
  })
  @Prop({ type: [{ type: StorageMember }] })
  readonly members: StorageMember[];

  @ApiProperty({
    name: "restrictFileSize",
    description: "Ограничен максимальный размер файла",
    type: Boolean,
    required: true,
    example: true,
  })
  @Prop()
  readonly restrictFileSize: boolean;

  @ApiProperty({
    name: "maxFileSize",
    description: "Максимальный размер файла в КБ",
    type: Number,
    required: true,
    example: 512,
  })
  @Prop()
  readonly maxFileSize: number;

  @ApiProperty({
    name: "restrictFilesCount",
    description: "Ограничено максимальное количество файлов",
    type: Boolean,
    required: true,
    example: true,
  })
  @Prop()
  readonly restrictFilesCount: boolean;

  @ApiProperty({
    name: "maxFilesCount",
    description: "Максимальное количество файлов в шт.",
    type: Number,
    required: true,
    example: 512,
  })
  @Prop()
  readonly maxFilesCount: number;

  @ApiProperty({
    name: "defaultRole",
    description: "Стандартная роль",
    type: String,
    required: true,
    example: "watcher",
  })
  @Prop()
  readonly defaultRole: StorageMemberRole;

  @ApiProperty({
    name: "createdAt",
    description: "Время создания хранилища",
    type: String,
    required: true,
    format: "YYYY-MM-DDTHH:mm:ssZ",
    example: "2025-01-01T12:12:12Z",
  })
  @Prop()
  readonly createdAt: string;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
