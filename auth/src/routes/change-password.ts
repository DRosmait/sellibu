import express, { Request, Response } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import {
  requireAuth,
  validateRequest,
  NotAuthorizedError,
  BadRequestError,
} from "@sellibu-proj/common";

import { User } from "../models";
import { passwordLength, Password } from "../helpers";

const router = express.Router();

router.put(
  "/api/users/update",
  requireAuth,
  [
    body("newPassword")
      .trim()
      .isLength(passwordLength)
      .withMessage(
        `Password must be between ${passwordLength.min} and ${passwordLength.max} characters`
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;

    const user = await User.findById(userId);
    if (!user) throw new NotAuthorizedError();

    const { oldPassword, newPassword } = req.body;
    const passwordMatch = await Password.compare(user.password, oldPassword);
    if (!passwordMatch)
      throw new BadRequestError("Old password is not correct.");

    user.set({ password: newPassword });
    await user.save();

    res.status(StatusCodes.OK).send(user);
  }
);

export { router as changePasswordRouter };
