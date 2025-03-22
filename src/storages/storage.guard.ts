import { JwtPayload } from "@/core/types/jwt.types";
import { UsersService } from "@/users/users.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { StoragesService } from "./storages.service";
import { User } from "@/users/schemas/user.schema";
import { Storage } from "./schemas/storage.schema";

@Injectable()
export class StorageGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private storagesService: StoragesService,
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

    return this.validate(questioner, storage);
  }

  private validate(questioner: User, storage: Storage): boolean {
    return (
      questioner.role === "admin" ||
      storage.owner.toString() === questioner._id.toString() ||
      storage.members.some(
        (member) => member.toString() === questioner._id.toString(),
      )
    );
  }
}
