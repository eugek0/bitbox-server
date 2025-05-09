import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService, User } from "@/users";
import { AuthBaseGuard } from "./base.guard";

@Injectable()
export class AuthAdministratorGuard extends AuthBaseGuard {
  constructor(
    jwt: JwtService,
    @Inject(forwardRef(() => UsersService))
    users: UsersService,
  ) {
    const validate = (questioner: User): boolean =>
      ["owner", "administrator"].includes(questioner.role);

    super(jwt, users, validate);
  }
}
