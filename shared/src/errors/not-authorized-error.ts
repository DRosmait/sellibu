import { StatusCodes } from "http-status-codes";

import { CustomError } from ".";

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor() {
    super("Not authorized user");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: "Not authorized user" }];
  }
}
