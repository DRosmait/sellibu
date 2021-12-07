import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { validateRequest, BadRequestError } from "@sellibu-proj/common";

import { User } from "../models";
import natsWrapper from "../nats-wrapper";
import { UserCreatedPublisher } from "../events";
import { passwodLength, userNameLength } from "../helpers";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength(passwodLength)
      .withMessage(
        `Password must be between ${passwodLength.min} and ${passwodLength.max} characters`
      ),
    body("userName")
      .trim()
      .isLength(userNameLength)
      .withMessage(
        `User name must be between ${userNameLength.min} and ${userNameLength.max} characters`
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, userName } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email is already in use.");
    }

    const newUser = User.build({
      email,
      password,
      userName,
    });
    await newUser.save();

    // Generate JWT user payload
    const userJwt = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        userName: newUser.userName,
      },
      process.env.JWT_KEY!
    );

    // store JWT user payload in request's session object
    req.session = { jwt: userJwt };

    // Publish user-created event
    await new UserCreatedPublisher(natsWrapper.client).publish({
      id: newUser.id,
      email: newUser.email,
      userName: newUser.userName,
    });

    res.status(StatusCodes.CREATED).send(newUser);
  }
);

export { router as signupRouter };
