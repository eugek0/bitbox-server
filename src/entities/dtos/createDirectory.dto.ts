import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDirectoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "name",
    description: "Имя директории",
    type: String,
    required: true,
    uniqueItems: true,
  })
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "parent",
    description:
      "ID родительской сущности, для которой нужно создать директорию",
    type: String,
    required: true,
    uniqueItems: true,
  })
  readonly parent?: string;
}
