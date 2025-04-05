import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService, User } from "@/users";
import { StoragesService } from "../storages.service";
import { Storage } from "../schemas";
import { StorageBaseGuard } from "./base.guard";

@Injectable()
export class StorageAdministratorGuard extends StorageBaseGuard {
  constructor(
    jwt: JwtService,
    users: UsersService,
    @Inject(forwardRef(() => StoragesService)) storages: StoragesService,
  ) {
    const validate = (questioner: User, storage: Storage): boolean => {
      const member = storage.members.find(
        (item) => questioner._id.toString() === item._id.toString(),
      );

      return (
        questioner.role === "admin" ||
        storage.owner.toString() === questioner._id.toString() ||
        member?.role === "administrator" ||
        (storage.defaultRole === "administrator" &&
          member?.role !== "watcher" &&
          member?.role !== "maintainer")
      );
    };

    super(jwt, users, storages, validate);
  }
}
