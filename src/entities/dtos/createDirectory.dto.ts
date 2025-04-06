import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDirectoryDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly parent?: string;
}
