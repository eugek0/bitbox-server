import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UsersService } from "@/users";
import { Storage } from "../schemas";
import { StoragesService } from "../storages.service";
import { StorageBaseGuard } from "./base.guard";

@Injectable()
export class StorageWatcherGuard extends StorageBaseGuard {
  constructor(jwt: JwtService, users: UsersService, storages: StoragesService) {
    const validate = (questioner: User, storage: Storage): boolean => {
      const member = storage.members.find(
        (item) => questioner._id.toString() === item._id.toString(),
      );

      return (
        questioner.role === "admin" ||
        storage.owner.toString() === questioner._id.toString() ||
        storage.access === "public" ||
        (storage.access === "private" &&
          member &&
          (member?.role === "administrator" ||
            member?.role === "maintainer" ||
            member?.role === "watcher" ||
            storage.defaultRole === "watcher"))
      );
    };

    super(jwt, users, storages, validate);
  }
}
