import { Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Log, LogSchema } from "./schemas/log.schema";
import { LoggerFilter } from "./logger.filter";

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  providers: [LoggerService, LoggerFilter],
})
export class LoggerModule {}
