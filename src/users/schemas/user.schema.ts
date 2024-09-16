import { Base64 } from "@/core/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

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
}

export const UserSchema = SchemaFactory.createForClass(User);
