import { Injectable } from "@nestjs/common";
import { StorageBaseGuard } from "./storageBase.guard";
import { User, UsersService } from "@/users";
import { Storage } from "../schemas";
import { JwtService } from "@nestjs/jwt";
import { StoragesService } from "../storages.service";

@Injectable()
export class StorageWatcherGuard extends StorageBaseGuard {
  constructor(jwt: JwtService, users: UsersService, storages: StoragesService) {
    const validate = (questioner: User, storage: Storage): boolean =>
      questioner.role === "admin" ||
      storage.access === "public" ||
      storage.owner.toString() === questioner._id.toString() ||
      storage.members.some(
        (member) => member.toString() === questioner._id.toString(),
      );

    super(jwt, users, storages, validate);
  }
}
