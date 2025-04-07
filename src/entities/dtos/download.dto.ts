import { IsArray, IsNotEmpty } from "class-validator";

export class DownloadEntitiesDto {
  @IsNotEmpty()
  @IsArray()
  entities: string[];
}
