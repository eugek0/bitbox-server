import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";

export class DeleteEntitiesDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    name: "entities",
    description: "Список ID сущностей, которые нужно удалить",
    type: [String],
    required: true,
    uniqueItems: true,
  })
  readonly entities: string[];
}
