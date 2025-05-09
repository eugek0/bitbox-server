import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RecoverPasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "password",
    description: "Новый пароль пользователя.",
    type: String,
    required: true,
    example: "12345",
  })
  readonly password: string;
}
