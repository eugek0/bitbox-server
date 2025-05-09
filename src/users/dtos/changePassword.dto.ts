import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "oldPassword",
    description: "Старый пароль",
    type: String,
    example: "12345",
    required: true,
  })
  readonly oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    name: "newPassword",
    description: "Новый пароль",
    type: String,
    example: "123456",
    required: true,
  })
  readonly newPassword: string;
}
