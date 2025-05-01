import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RecoverPasswordDto {
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
