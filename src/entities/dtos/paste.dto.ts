import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";

export class PasteEntityDto {
  @IsString()
  @IsIn(["copy", "cut"])
  @ApiProperty({
    name: "type",
    description: "Тип вставки (Копирование или Вырезание)",
    type: String,
    required: true,
  })
  readonly type: "copy" | "cut";

  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    name: "entities",
    description: "ID сущностей, которые нужно вставить",
    type: [String],
    required: true,
  })
  readonly entities: string[];

  @ApiProperty({
    name: "parent",
    description: "ID родительской сущности в которую производится вставка",
    type: [String],
  })
  @IsMongoId()
  @IsOptional()
  readonly parent: string;
}
