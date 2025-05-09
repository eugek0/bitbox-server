import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";

export class DownloadEntitiesDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    name: "entities",
    description: "Список ID сущностей, которые нужно скачать",
    type: [String],
    required: true,
    uniqueItems: true,
  })
  entities: string[];
}
