import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UsersService } from "@/users";
import { JwtPayload } from "@/core";
import { AuthBaseGuardValidate } from "./types";

export class AuthBaseGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly validate: AuthBaseGuardValidate,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;

    const token =
      request.headers.Authorization?.toString().split(" ")[1] ??
      request.headers.authorization?.toString().split(" ")[1] ??
      request?.cookies?.access;

    const payload = this.jwtService.decode(token) as JwtPayload;
    const questioner = await this.usersService.getById(payload.sub);

    if (!this.validate(questioner)) {
      throw new ForbiddenException({
        message: "У вас недостаточно прав для данного действия.",
      });
    }

    return true;
  }
}
