import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerService } from "./logger.service";
import { LoggerFilter } from "./logger.filter";
import { Log, LogSchema } from "./schemas";

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  providers: [LoggerService, LoggerFilter],
})
export class LoggerModule {}
