import { HttpException } from "@nestjs/common";

export function isHttpException(unknown: unknown): unknown is HttpException {
  return unknown instanceof HttpException;
}
