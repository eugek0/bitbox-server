import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerService } from "./logger.service";
import { Log, LogSchema } from "./schemas";
import { LoggerController } from "./logger.controller";
import { Method, MethodSchema } from "./schemas/method.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Log.name, schema: LogSchema },
      { name: Method.name, schema: MethodSchema },
    ]),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
  controllers: [LoggerController],
})
export class LoggerModule {}
