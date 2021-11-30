import express, { Request, Response } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import {
  validateRequest,
  requireAuth,
  NotAuthorizedError,
} from "@sellibu-proj/common";

import { Ad, User } from "../models";

const router = express.Router();

const titleLength = { min: 3, max: 200 };
const descriptionLength = { max: 1000 };

router.post(
  "/api/ads/create",
  requireAuth,
  [
    body("title")
      .trim()
      .isLength(titleLength)
      .withMessage(
        `Title must be between ${titleLength.min} and ${titleLength.max} characters.`
      ),
    body("description")
      .trim()
      .isLength(descriptionLength)
      .withMessage(
        `Description cannot be longer ${descriptionLength.max} characters.`
      ),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser!.id);

    if (!user) throw new NotAuthorizedError();

    const { title, description, price } = req.body;
    const ad = Ad.build({
      title,
      description,
      price,
      user,
    });
    await ad.save();

    res.status(StatusCodes.CREATED).send(ad);
  }
);

export { router as createAdRouter };
