import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AppStatusDocument = HydratedDocument<AppStatus>;

@Schema()
export class AppStatus {
  @Prop()
  virgin: boolean;
}

export const AppStatusSchema = SchemaFactory.createForClass(AppStatus);
