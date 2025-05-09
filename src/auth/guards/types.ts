import { User } from "@/users";

export type AuthBaseGuardValidate = (questioner: User) => boolean;
