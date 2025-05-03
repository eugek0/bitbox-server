import { Controller, Get } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { Log } from "./schemas";
import { Method } from "./schemas/method.schema";

@Controller("logger")
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  async get(): Promise<Log[]> {
    return await this.loggerService.getAll();
  }

  @Get("methods")
  async getMethods(): Promise<Method[]> {
    return await this.loggerService.getMethods();
  }
}
