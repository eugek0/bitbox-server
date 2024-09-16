import { BadRequestException } from "@nestjs/common";

class FormException extends BadRequestException {
  constructor(message: string, field: string) {
    super({ message, field }, { cause: field });
  }
}

export default FormException;
