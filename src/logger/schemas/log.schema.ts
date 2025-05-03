import { User } from "@/core";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type LogDocument = HydratedDocument<Log>;

@Schema()
export class Log {
  _id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
  user: string | null;

  @Prop()
  method: string;

  @Prop()
  url: string;

  @Prop()
  createdAt: Date;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop()
  type: "pubapi" | "user";

  @Prop({ type: Object })
  body: Record<string, any>;

  @Prop({ type: Object })
  query: Record<string, any>;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
