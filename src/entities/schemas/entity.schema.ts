import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Storage } from "@/storages/schemas";
import { EntityType } from "../types";

export type EntityDocument = HydratedDocument<Entity>;

@Schema()
export class Entity {
  _id: string;

  @Prop()
  readonly name: string;

  @Prop()
  readonly extension: string;

  @Prop()
  readonly fullname: string;

  @Prop()
  readonly type: EntityType;

  @Prop()
  readonly size: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Storage.name })
  readonly storage: string;

  @Prop()
  readonly path: string;
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
