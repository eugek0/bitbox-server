import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";

export class DeleteStoragesDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    name: "storages",
    description: "Идентификаторы хранилищ.",
    type: [String],
    required: true,
  })
  readonly storages: string[];
}
