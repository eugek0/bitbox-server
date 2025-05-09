import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { StoragesService } from "../storages.service";
import { UsersService } from "@/users";
import { JwtPayload } from "@/core";
import { StorageBaseGuardValidate } from "./types";

export class StorageBaseGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly storagesService: StoragesService,
    private readonly validate: StorageBaseGuardValidate,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;

    const storages = request.body.storages ?? [request.params.storageid];

    const token =
      request.headers.Authorization?.toString().split(" ")[1] ??
      request.headers.authorization?.toString().split(" ")[1] ??
      request?.cookies?.access;

    const payload = this.jwtService.decode(token) as JwtPayload;
    const questioner = await this.usersService.getById(payload.sub);

    for (const storageid of storages) {
      const storage = await this.storagesService.getById(storageid);

      if (!storage) {
        throw new NotFoundException("Такого хранилища не существует");
      }

      const owner = await this.usersService.getById(storage?.owner?.toString());

      if (!this.validate(questioner, storage)) {
        throw new ForbiddenException({
          message: "У вас нет доступа к этому хранилищу.",
          contacts:
            owner?.prefered_contacts !== "none"
              ? owner?.[owner?.prefered_contacts]
              : undefined,
          type:
            owner?.prefered_contacts !== "none"
              ? owner?.prefered_contacts
              : undefined,
        });
      }
    }

    return true;
  }
}
