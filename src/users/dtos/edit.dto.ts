import { Base64 } from "@/core";
import { ContactType } from "../types";
import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EditUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "login",
    description: "Логин пользователя",
    type: String,
    example: "eugek0",
  })
  readonly login?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "name",
    description: "Имя пользователя",
    type: String,
    example: "Eugene",
  })
  readonly name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "lastname",
    description: "Фамилия пользователя",
    type: String,
    example: "Kobelev",
  })
  readonly lastname?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "telegram",
    description: "Телеграм пользователя",
    type: String,
    example: "example",
  })
  readonly telegram?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: "prefered_contacts",
    description: "Предпочитаемый способ связи",
    type: String,
    example: "telegram",
  })
  readonly prefered_contacts?: ContactType;
}
