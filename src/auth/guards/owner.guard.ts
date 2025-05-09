import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService, User } from "@/users";
import { AuthBaseGuard } from "./base.guard";

@Injectable()
export class AuthOwnerGuard extends AuthBaseGuard {
  constructor(jwt: JwtService, users: UsersService) {
    const validate = (questioner: User): boolean => questioner.role === "owner";

    super(jwt, users, validate);
  }
}
