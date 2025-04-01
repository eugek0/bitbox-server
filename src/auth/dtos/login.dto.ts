import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    name: "email",
    description: "Электронная почта пользователя.",
    type: String,
    required: true,
    uniqueItems: true,
    format: "*@*.*",
    example: "palma21042005@gmail.com",
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "password",
    description: "Пароль пользователя.",
    type: String,
    required: true,
    example: "12345",
  })
  password: string;
}
