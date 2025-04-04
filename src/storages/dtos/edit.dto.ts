import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { StorageAccess } from "../types";
import { Type } from "class-transformer";
import { StorageMemberDto } from "./member.dto";

export class EditStorageDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @ApiProperty({
    name: "name",
    description: "Название хранилища.",
    type: String,
    required: false,
  })
  readonly name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  @ApiProperty({
    name: "description",
    description: "Описание хранилища.",
    required: false,
    type: String,
  })
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "size",
    description: "Размер хранилища.",
    type: String,
    required: false,
  })
  readonly size?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "access",
    description: "Режим доступа к хранилищу.",
    type: String,
    required: false,
  })
  readonly access?: StorageAccess;

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
  readonly members?: StorageMemberDto[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    name: "restrictFileSize",
    description: "Флаг ограничения максимального размера файла",
    type: Boolean,
    required: false,
  })
  readonly restrictFileSize?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "maxFileSize",
    description: "Максимальный размер файла",
    type: Number,
    required: false,
  })
  readonly maxFileSize?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    name: "restrictFilesCount",
    description: "Флаг ограничения максимального количества файлов",
    type: Boolean,
    required: false,
  })
  readonly restrictFilesCount?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "maxFilesCount",
    description: "Максимальное количество файлов",
    type: Number,
    required: false,
  })
  readonly maxFilesCount?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "used",
    description: "Использованное место в хранилище",
    type: Number,
    required: false,
  })
  readonly used?: number;
}
