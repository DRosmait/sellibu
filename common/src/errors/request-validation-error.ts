import { StatusCodes } from "http-status-codes";
import { ValidationError } from "express-validator";

import { CustomError } from ".";

export class RequestValidationError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(
    private errors: ValidationError[],
    message = "Invalid request parameters"
  ) {
    super(message);

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(({ msg, param }) => ({
      message: msg,
      field: param,
    }));
  }
}
