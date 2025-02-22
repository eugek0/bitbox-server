import { User } from "@/users/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { StorageAccess } from "../types/access.types";

export type StorageDocument = HydratedDocument<Storage>;

@Schema()
export class Storage {
  _id: string;

  @Prop({ unique: true })
  readonly name: string;

  @Prop()
  readonly description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  readonly owner: User;

  @Prop()
  readonly used: number;

  @Prop()
  readonly size: number;

  @Prop()
  readonly access: StorageAccess;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  readonly members: User[];
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
