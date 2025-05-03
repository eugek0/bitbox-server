import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type LogDocument = HydratedDocument<Method>;

@Schema()
export class Method {
  _id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;
}

export const MethodSchema = SchemaFactory.createForClass(Method);
