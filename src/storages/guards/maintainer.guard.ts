import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService, User } from "@/users";
import { StoragesService } from "../storages.service";
import { Storage } from "../schemas";
import { StorageBaseGuard } from "./base.guard";

@Injectable()
export class StorageMaintainerGuard extends StorageBaseGuard {
  constructor(jwt: JwtService, users: UsersService, storages: StoragesService) {
    const validate = (questioner: User, storage: Storage): boolean => {
      const member = storage.members.find(
        (item) => questioner._id.toString() === item._id.toString(),
      );

      return (
        questioner.role === "admin" ||
        storage.owner.toString() === questioner._id.toString() ||
        member?.role === "maintainer" ||
        member?.role === "administrator" ||
        ((storage.defaultRole === "maintainer" ||
          storage.defaultRole === "administrator") &&
          member?.role !== "watcher")
      );
    };

    super(jwt, users, storages, validate);
  }
}
