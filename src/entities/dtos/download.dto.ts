import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";

export class DownloadEntitiesDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  entities: string[];
}
