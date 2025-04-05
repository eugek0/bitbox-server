import { User } from "@/users/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument } from "mongoose";
import { StorageAccess, StorageMemberRole } from "../types";

export type StorageDocument = HydratedDocument<Storage>;

@Schema()
class StorageMember extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  _id: string;

  @Prop()
  role: StorageMemberRole;
}

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

  @Prop({ type: [{ type: StorageMember }] })
  readonly members: StorageMember[];

  @Prop()
  readonly restrictFileSize: boolean;

  @Prop()
  readonly maxFileSize: number;

  @Prop()
  readonly restrictFilesCount: boolean;

  @Prop()
  readonly maxFilesCount: number;

  @Prop()
  readonly defaultRole: StorageMemberRole;

  @Prop()
  readonly createdAt: string;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
