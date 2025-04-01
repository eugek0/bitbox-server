import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService, User } from "@/users";
import { StoragesService } from "../storages.service";
import { Storage } from "../schemas";
import { StorageBaseGuard } from "./base.guard";

@Injectable()
export class StorageMaintainerGuard extends StorageBaseGuard {
  constructor(jwt: JwtService, users: UsersService, storages: StoragesService) {
    const validate = (questioner: User, storage: Storage) =>
      questioner.role === "admin" ||
      storage.owner.toString() === questioner._id.toString() ||
      storage.members.some(
        (member) =>
          member._id.toString() === questioner._id.toString() &&
          member.role === "maintainer",
      );

    super(jwt, users, storages, validate);
  }
}
