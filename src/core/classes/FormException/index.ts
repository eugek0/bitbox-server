import { BadRequestException } from "@nestjs/common";

export class FormException extends BadRequestException {
  constructor(message: string, field: string) {
    super({ message, field }, { cause: field });
  }
}
