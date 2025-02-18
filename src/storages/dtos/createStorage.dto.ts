import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateStorageDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNotEmpty()
  @IsNumber()
  readonly size: number;
}
