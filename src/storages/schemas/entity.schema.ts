import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { EntityType } from "../types/entity.types";
import { Storage } from "./storage.schema";

export type EntityDocument = HydratedDocument<Entity>;

@Schema()
export class Entity {
  _id: string;

  @Prop()
  readonly name: string;

  @Prop()
  readonly extension: string;

  @Prop()
  readonly type: EntityType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Storage.name })
  readonly storage: string;

  @Prop()
  readonly path: string;
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
