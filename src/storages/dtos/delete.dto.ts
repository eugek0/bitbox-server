import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class DeleteStoragesDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    name: "storages",
    description: "Идентификаторы хранилищ.",
    type: [String],
    required: true,
  })
  readonly storages: string[];
}
