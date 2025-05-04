import { Controller, Get, UseGuards } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { Log } from "./schemas";
import { Method } from "./schemas/method.schema";
import { JwtGuard } from "@/auth";

@Controller("logger")
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @UseGuards(JwtGuard)
  async get(): Promise<Log[]> {
    return await this.loggerService.getAll();
  }

  @Get("methods")
  @UseGuards(JwtGuard)
  async getMethods(): Promise<Method[]> {
    return await this.loggerService.getMethods();
  }
}
