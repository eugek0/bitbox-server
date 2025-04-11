import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Storage } from "@/storages/schemas";
import { EntityType } from "../types";
import { User } from "@/core";

export type EntityDocument = HydratedDocument<Entity>;

@Schema()
export class Entity {
  _id: string;

  @Prop()
  name: string;

  @Prop()
  extension: string;

  @Prop()
  fullname: string;

  @Prop()
  type: EntityType;

  @Prop()
  size: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Storage.name })
  storage: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Entity.name })
  parent?: string;

  @Prop()
  uploadedAt: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  uploader: string;
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
