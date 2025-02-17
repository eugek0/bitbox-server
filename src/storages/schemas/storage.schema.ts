import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type StorageDocument = HydratedDocument<Storage>;

@Schema()
export class Storage {
  _id: string;

  @Prop()
  readonly name: string;

  @Prop()
  readonly description: string;

  @Prop()
  readonly owner: string;

  @Prop()
  readonly used: number;

  @Prop()
  readonly size: number;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
