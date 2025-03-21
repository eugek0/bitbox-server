import { JwtPayload } from "@/core/types/jwt.types";
import { UsersService } from "@/users/users.service";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { StoragesService } from "./storages.service";
import { User } from "@/users/schemas/user.schema";
import { Storage } from "./schemas/storage.schema";

export function StorageGuard(owned?: boolean) {
  @Injectable()
  class StorageGuardMixin implements CanActivate {
    constructor(
      public jwtService: JwtService,
      public usersService: UsersService,
      public storagesService: StoragesService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest() as Request;

      const payload = this.jwtService.decode(
        request.cookies.access,
      ) as JwtPayload;
      const questioner = await this.usersService.getById(payload.sub);
      const storage = await this.storagesService.getStorageById(
        request.params.storageid,
      );
      const owner = await this.usersService.getById(storage.owner.toString());

      if (!this.validate(questioner, storage)) {
        throw new ForbiddenException({
          message: "У вас нет доступа к этому хранилищу.",
          contacts:
            owner.prefered_contacts !== "none"
              ? owner?.[owner?.prefered_contacts]
              : undefined,
          type:
            owner.prefered_contacts !== "none"
              ? owner?.prefered_contacts
              : undefined,
        });
      }

      return true;
    }

    public validate(questioner: User, storage: Storage): boolean {
      if (owned && storage.owner.toString() !== questioner._id.toString()) {
        return false;
      }

      const result =
        questioner.role === "admin" ||
        storage.access === "public" ||
        storage.owner.toString() === questioner._id.toString() ||
        storage.members.some(
          (member) => member.toString() === questioner._id.toString(),
        );
      return result;
    }
  }

  return StorageGuardMixin;
}
