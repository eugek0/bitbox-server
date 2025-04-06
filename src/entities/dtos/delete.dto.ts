import { IsArray, IsNotEmpty } from "class-validator";

export class DeleteEntitiesDto {
  @IsNotEmpty()
  @IsArray()
  readonly entities: string[];
}
