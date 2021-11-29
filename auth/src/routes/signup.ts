import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { validateRequest, BadRequestError } from "@sellibu-proj/common";

import { User } from "../models";

const router = express.Router();

const passwodLength = { min: 8, max: 100 };
const userNameLength = { min: 2, max: 100 };

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
    const { email, password, userName, location, address } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email is already in use.");
    }

    const newUser = User.build({
      email,
      password,
      userName,
      location,
      address,
    });
    await newUser.save();

    // Generate JWT user payload
    const userJwt = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        userName: newUser.userName,
        location: newUser.location,
        address: newUser.address,
      },
      process.env.JWT_KEY!
    );

    // store JWT user payload in request's session object
    req.session = { jwt: userJwt };

    res.status(StatusCodes.CREATED).send(newUser);
  }
);

export { router as signupRouter };
