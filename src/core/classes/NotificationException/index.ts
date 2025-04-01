import { INotification } from "@/core";
import { HttpException, HttpExceptionOptions } from "@nestjs/common";

export class NotificationException extends HttpException {
  constructor(
    notification: INotification["notification"],
    status: number,
    options?: HttpExceptionOptions,
  ) {
    super({ notification }, status, options);
  }
}
