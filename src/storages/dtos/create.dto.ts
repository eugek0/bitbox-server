import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { StorageAccess } from "../types";
import { StorageMemberDto } from "./member.dto";
import { Type } from "class-transformer";

export class CreateStorageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @ApiProperty({
    name: "name",
    description: "Название хранилища.",
    type: String,
    required: true,
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  @ApiProperty({
    name: "description",
    description: "Описание хранилища.",
    required: false,
    type: String,
  })
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    name: "size",
    description: "Размер хранилища.",
    type: String,
    required: true,
  })
  size: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "access",
    description: "Режим доступа к хранилищу.",
    type: String,
    required: true,
  })
  access: StorageAccess;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => StorageMemberDto)
  @ApiProperty({
    name: "members",
    description: "Пользователи, имеющие доступ к хранилищу в приватном режиме.",
    type: [Object],
    required: false,
  })
  members?: StorageMemberDto[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    name: "restrictFileSize",
    description: "Флаг ограничения максимального размера файла",
    type: Boolean,
    required: false,
  })
  restrictFileSize?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "maxFileSize",
    description: "Максимальный размер файла",
    type: Number,
    required: false,
  })
  maxFileSize?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    name: "restrictFilesCount",
    description: "Флаг ограничения максимального количества файлов",
    type: Boolean,
    required: false,
  })
  restrictFilesCount?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "maxFilesCount",
    description: "Максимальное количество файлов",
    type: Number,
    required: false,
  })
  maxFilesCount?: number;
}
