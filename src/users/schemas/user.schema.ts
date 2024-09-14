import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  readonly login: string;

  @Prop()
  readonly email: string;

  @Prop()
  readonly password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
