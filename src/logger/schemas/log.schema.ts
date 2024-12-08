import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type LogDocument = HydratedDocument<Log>;

@Schema()
export class Log {
  _id: string;

  @Prop()
  message: string;

  @Prop()
  createdAt: string;

  @Prop()
  user: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
