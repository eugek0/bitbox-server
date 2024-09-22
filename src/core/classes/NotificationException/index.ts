import { INotification } from "@/core/types";
import { HttpException, HttpExceptionOptions } from "@nestjs/common";

export class NotificationException extends HttpException {
  constructor(
    notification: INotification,
    status: number,
    options?: HttpExceptionOptions,
  ) {
    super(notification, status, options);
  }
}
