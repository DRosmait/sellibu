import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@sellibu-proj/common";

import { User } from "../models";
import { userNameLength } from "../helpers";

const router = express.Router();

router.put("/api/auth/update", requireAuth, [
  body("email").isEmail().withMessage("Email must be valid"),
  body("userName")
    .trim()
    .isLength(userNameLength)
    .withMessage(
      `User name must be between ${userNameLength.min} and ${userNameLength.max} characters`
    ),
  validateRequest,
  async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;
    const user = await User.findById(userId);

    if (!user) throw new NotFoundError("User");

    const { email, userName } = req.body;

    if (user.email !== email) {
      const anotherUser = await User.findOne({ email });
      if (anotherUser != null)
        throw new BadRequestError("Email is already in use");
    }

    // update user
    user.set({ email, userName });
    await user.save();

    // Generate JWT user payload
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_KEY!
    );

    // store JWT user payload in request's session object
    req.session = { jwt: userJwt };

    res.status(StatusCodes.OK).send(user);
  },
]);

export { router as updateUserRouter };
