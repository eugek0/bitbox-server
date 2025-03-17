import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { StorageAccess } from "../types/access.types";

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
  readonly name: string;

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

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    name: "size",
    description: "Размер хранилища.",
    type: String,
    required: true,
  })
  readonly size: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "access",
    description: "Режим доступа к хранилищу.",
    type: String,
    required: true,
  })
  readonly access: StorageAccess;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    name: "members",
    description: "Пользователи, имеющие доступ к хранилищу в приватном режиме.",
    type: [String],
    required: false,
  })
  readonly members: string[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    name: "restrict_file_size",
    description: "Флаг ограничения максимального размера файла",
    type: Boolean,
    required: false,
  })
  readonly restrict_file_size: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "max_file_size",
    description: "Максимальный размер файла",
    type: Number,
    required: false,
  })
  readonly max_file_size: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    name: "restrict_files_count",
    description: "Флаг ограничения максимального количества файлов",
    type: Boolean,
    required: false,
  })
  readonly restrict_files_count: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "max_files_count",
    description: "Максимальное количество файлов",
    type: Number,
    required: false,
  })
  readonly max_files_count: number;
}
