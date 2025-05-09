import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { HydratedDocument } from "mongoose";

export type LogDocument = HydratedDocument<Method>;

@Schema()
export class Method {
  @ApiProperty({
    name: "_id",
    description: "ID метода",
    type: String,
    required: true,
    uniqueItems: true,
  })
  _id: string;

  @ApiProperty({
    name: "name",
    description: "Имя метода",
    type: String,
    required: true,
  })
  @Prop()
  name: string;

  @ApiProperty({
    name: "description",
    description: "Описание метода",
    type: String,
    required: true,
  })
  @Prop()
  description: string;
}

export const MethodSchema = SchemaFactory.createForClass(Method);
