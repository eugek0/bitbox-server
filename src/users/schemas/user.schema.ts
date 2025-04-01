import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UserRole, ContactType } from "../types";
import { Base64 } from "@/core";

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
  _id: string;

  @Prop()
  readonly login: string;

  @Prop()
  readonly email: string;

  @Prop()
  readonly password: string;

  @Prop()
  readonly createdAt: string;

  @Prop()
  readonly avatar: Base64;

  @Prop()
  readonly role: UserRole;

  @Prop()
  readonly telegram: string;

  @Prop({ default: "email" })
  readonly prefered_contacts: ContactType;
}

export const UserSchema = SchemaFactory.createForClass(User);
