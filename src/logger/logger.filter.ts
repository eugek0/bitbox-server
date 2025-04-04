import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LoggerService } from "./logger.service";
import { NotificationException, isHttpException } from "@/core";

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

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      response.json(
        new NotificationException(
          {
            config: {
              message: "Ошибка",
              description: `Произошла ошибка, пожалуйста оповестите нас о проблеме. Идентификатор ошибки: ${log._id}.`,
            },
            status: "error",
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ).getResponse(),
      );

      console.error(exception);
    } else {
      response.status(exception.getStatus());
      response.json(exception.getResponse());
    }
  }
}
