import { User } from "@/core";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";

export type LogDocument = HydratedDocument<Log>;

@Schema()
export class Log {
  @ApiProperty({
    name: "_id",
    description: "ID лога",
    type: String,
    required: true,
    uniqueItems: true,
  })
  _id: string;

  @ApiProperty({
    name: "user",
    description: "ID пользователя",
    type: String,
    required: true,
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
  user: string | null;

  @ApiProperty({
    name: "method",
    description: "Тип метода",
    type: String,
    required: true,
    example: "GET",
  })
  @Prop()
  method: string;

  @ApiProperty({
    name: "url",
    description: "URL запроса",
    type: String,
    required: true,
    example: "/users",
  })
  @Prop()
  url: string;

  @ApiProperty({
    name: "createdAt",
    description: "Время запроса",
    type: String,
    required: true,
    format: "YYYY-MM-DDTHH:mm:ss",
    example: "2025-01-09T12:12:12Z",
  })
  @Prop()
  createdAt: Date;

  @ApiProperty({
    name: "ip",
    description: "IP адрес",
    type: String,
    required: true,
  })
  @Prop()
  ip: string;

  @ApiProperty({
    name: "userAgent",
    description: "User-Agent",
    type: String,
    required: true,
  })
  @Prop()
  userAgent: string;

  @ApiProperty({
    name: "type",
    description: "Тип токена",
    type: String,
    required: true,
    example: "pubapi",
  })
  @Prop()
  type: "pubapi" | "user";

  @ApiProperty({
    name: "body",
    description: "Тело запроса",
    type: Object,
    required: true,
  })
  @Prop({ type: Object })
  body: Record<string, any>;

  @ApiProperty({
    name: "query",
    description: "Query параметры",
    type: Object,
    required: true,
  })
  @Prop({ type: Object })
  query: Record<string, any>;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
