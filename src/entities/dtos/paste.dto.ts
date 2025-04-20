import {
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";

export class PasteEntityDto {
  @IsString()
  @IsIn(["copy", "cut"])
  readonly type: "copy" | "cut";

  @IsArray()
  @IsMongoId({ each: true })
  readonly entities: string[];

  @IsMongoId()
  @IsOptional()
  readonly parent: string;
}
