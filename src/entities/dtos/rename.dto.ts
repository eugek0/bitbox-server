import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class RenameEntityDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({
    name: "entity",
    description: "ID сущности, которую нужно переименовать",
    type: String,
  })
  readonly entity: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "fullname",
    description: "Новое имя сущности",
    type: String,
  })
  readonly fullname: string;
}
