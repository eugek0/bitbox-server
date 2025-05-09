import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { Log } from "./schemas";
import { Method } from "./schemas/method.schema";
import { JwtGuard } from "@/auth";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("logger")
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @ApiTags("Логи")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Получены все логи",
    type: [Log],
  })
  @Get()
  @UseGuards(JwtGuard)
  async get(): Promise<Log[]> {
    return await this.loggerService.getAll();
  }

  @ApiTags("Логи")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Получены описания методов",
    type: [Method],
  })
  @Get("methods")
  @UseGuards(JwtGuard)
  async getMethods(): Promise<Method[]> {
    return await this.loggerService.getMethods();
  }
}
