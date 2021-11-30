import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@sellibu-proj/common";

import { User } from "../models";
import { Password } from "../helpers";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new BadRequestError("Invalid credentials");

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordMatch) throw new BadRequestError("Invalid credentials");

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        userName: existingUser.userName,
      },
      process.env.JWT_KEY!
    );

    req.session = { jwt: userJwt };

    res.status(StatusCodes.OK).send(existingUser);
  }
);

export { router as signinRouter };
