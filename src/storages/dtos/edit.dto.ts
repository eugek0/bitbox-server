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
    name: "restrict_file_size",
    description: "Флаг ограничения максимального размера файла",
    type: Boolean,
    required: false,
  })
  readonly restrict_file_size?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "max_file_size",
    description: "Максимальный размер файла",
    type: Number,
    required: false,
  })
  readonly max_file_size?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    name: "restrict_files_count",
    description: "Флаг ограничения максимального количества файлов",
    type: Boolean,
    required: false,
  })
  readonly restrict_files_count?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    name: "max_files_count",
    description: "Максимальное количество файлов",
    type: Number,
    required: false,
  })
  readonly max_files_count?: number;

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
