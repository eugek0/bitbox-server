import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { NotificationException } from "@/core/classes";
import { Request, Response } from "express";
import { isHttpException } from "@/core/typeguards";

@Injectable()
@Catch()
export class LoggerFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest() as Request;
    const response = context.getResponse() as Response;
    if (!isHttpException(exception)) {
      const log = await this.loggerService.create(
        request.user as string,
        exception.message,
      );

      response.json(
        new NotificationException(
          {
            config: {
              message:
                "Произошла ошибка, пожалуйста оповестите нас о проблеме.",
              description: `Идентификатор ошибки: ${log._id}`,
            },
            status: "error",
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ).getResponse(),
      );
    } else {
      response.json(exception.getResponse());
    }
  }
}
