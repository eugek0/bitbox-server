import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppStatus } from "./schemas/appStatus.schema";

@Controller("/")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getStatus(): Promise<AppStatus> {
    return await this.appService.getStatus();
  }

  @Get("filesystem")
  async getFileSystem(): Promise<any> {
    return await this.appService.getFileSystem();
  }
}
