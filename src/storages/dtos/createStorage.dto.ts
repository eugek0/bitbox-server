import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateStorageDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "name",
    description: "Название хранилища.",
    type: String,
    required: true,
  })
  readonly name: string;

  @IsOptional()
  @IsString()
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
}
