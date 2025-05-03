import { IsNotEmpty } from "class-validator";
import { UserRole } from "../types";

export class ChangeRoleDto {
  @IsNotEmpty()
  readonly role: UserRole;
}
