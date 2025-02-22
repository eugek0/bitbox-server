import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
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
}
