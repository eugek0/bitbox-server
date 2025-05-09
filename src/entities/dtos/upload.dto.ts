import { ApiProperty } from "@nestjs/swagger";

export class UploadEntitiesDto {
  @ApiProperty({
    name: "parent",
    description:
      "ID родительской сущности, дочернии сущности которой, нужно скачать",
    type: String,
    required: true,
    uniqueItems: true,
  })
  readonly parent: string;
}
