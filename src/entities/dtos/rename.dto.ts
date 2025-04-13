import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class RenameEntityDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly entity: string;

  @IsNotEmpty()
  @IsString()
  readonly fullname: string;
}
