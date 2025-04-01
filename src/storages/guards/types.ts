import { User } from "@/users";
import { Storage } from "../schemas";

export type StorageBaseGuardValidate = (
  questioner: User,
  storage: Storage,
) => boolean;
