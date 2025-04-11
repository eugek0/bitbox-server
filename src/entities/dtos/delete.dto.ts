import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";

export class DeleteEntitiesDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  readonly entities: string[];
}
