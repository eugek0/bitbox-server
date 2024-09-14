import { User } from "@/users/schemas/user.schema";

export interface ITokens {
  access: string;
  refresh: string;
}

export type ProfileType = Pick<User, "username" | "email">;
