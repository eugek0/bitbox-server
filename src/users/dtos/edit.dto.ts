import { Base64 } from "@/core";
import { ContactType } from "../types";
import { IsOptional, IsString } from "class-validator";

export class EditUserDto {
  @IsOptional()
  @IsString()
  readonly login?: string;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly lastname?: string;

  @IsOptional()
  @IsString()
  readonly telegram?: string;

  @IsOptional()
  @IsString()
  readonly prefered_contacts?: ContactType;

  @IsOptional()
  @IsString()
  readonly avatar?: Base64;
}
