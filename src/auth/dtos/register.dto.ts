import { UserRole } from "@/users";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "login",
    description: "Уникальный логин пользователя.",
    type: String,
    required: true,
    uniqueItems: true,
    example: "eugek0",
  })
  readonly login: string;

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
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @ApiProperty({
    name: "password",
    description: "Пароль пользователя.",
    type: String,
    required: true,
    example: "12345",
    minLength: 5,
  })
  readonly password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "role",
    description: "Роль пользователя.",
    type: String,
    required: false,
    example: "admin",
  })
  readonly role?: UserRole;
}
