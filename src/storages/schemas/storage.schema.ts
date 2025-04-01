import { User } from "@/users/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument } from "mongoose";
import { StorageAccess, StorageMemberRole } from "../types";

export type StorageDocument = HydratedDocument<Storage>;

@Schema()
class StorageMember extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, unique: true })
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
  readonly restrict_file_size: boolean;

  @Prop()
  readonly max_file_size: number;

  @Prop()
  readonly restrict_files_count: boolean;

  @Prop()
  readonly max_files_count: number;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
