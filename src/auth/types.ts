import { User } from "@/users/schemas/user.schema";

export interface ITokens {
  access: string;
  refresh: string;
}

export interface ITokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export type ProfileType = Omit<User, "password">;
