import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UsersService } from "@/users";
import { Storage } from "../schemas";
import { StoragesService } from "../storages.service";
import { StorageBaseGuard } from "./base.guard";

@Injectable()
export class StorageWatcherGuard extends StorageBaseGuard {
  constructor(jwt: JwtService, users: UsersService, storages: StoragesService) {
    const validate = (questioner: User, storage: Storage): boolean =>
      questioner.role === "admin" ||
      storage.access === "public" ||
      storage.owner.toString() === questioner._id.toString() ||
      storage.members.some(
        (member) => member._id.toString() === questioner._id.toString(),
      );

    super(jwt, users, storages, validate);
  }
}
