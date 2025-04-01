import { IsNotEmpty, IsString } from "class-validator";
import { StorageMemberRole } from "../types";

export class StorageMemberDto {
  @IsNotEmpty()
  @IsString()
  readonly _id: string;

  @IsNotEmpty()
  @IsString()
  readonly role: StorageMemberRole;
}
