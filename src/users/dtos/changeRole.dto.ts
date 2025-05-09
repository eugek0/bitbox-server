import { IsNotEmpty } from "class-validator";
import { UserRole } from "../types";
import { ApiProperty } from "@nestjs/swagger";

export class ChangeRoleDto {
  @IsNotEmpty()
  @ApiProperty({
    name: "role",
    description: "Роль пользователя",
    type: String,
    example: "user",
    required: true,
  })
  readonly role: UserRole;
}
