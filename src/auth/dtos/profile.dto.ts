import { Base64 } from "@/core/types";
import { ApiProperty } from "@nestjs/swagger";

export class ProfileDto {
  @ApiProperty({
    name: "_id",
    description: "Идентификатор пользователя.",
    type: String,
    required: true,
    uniqueItems: true,
    readOnly: true,
  })
  _id: string;

  @ApiProperty({
    name: "login",
    description: "Уникальный логин пользователя.",
    type: String,
    required: true,
    uniqueItems: true,
    example: "eugek0",
  })
  login: string;

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

  @ApiProperty({
    name: "createdAt",
    description:
      "Дата, когда был создан аккаунт пользователя (в стандарте UTC).",
    type: String,
    required: true,
    format: "YYYY-MM-DDTHH:mm:ssZ",
  })
  createdAt: string;

  @ApiProperty({
    name: "avatar",
    description: "Аватар пользователя в формате Base64.",
    type: String,
    required: true,
    format: "Base64",
  })
  avatar: Base64;
}
