import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  AdStatus,
  BadRequestError,
} from "@sellibu-proj/common";

import { Ad } from "../models";
import { titleLength, descriptionLength } from "./helpers";

const router = express.Router();

router.put(
  "/api/ads/:id",
  requireAuth,
  [
    body("title")
      .trim()
      .isLength(titleLength)
      .withMessage(
        `Title must be between ${titleLength.min} and ${titleLength.max} characters.`
      ),
    body("description")
      .notEmpty()
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
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError("Ad");

    const ad = await Ad.findById(id).populate("user");
    if (!ad) throw new NotFoundError("Ad");
    if (ad.status === AdStatus.Closed)
      throw new BadRequestError("Ad is closed.");
    if (ad.user.id !== req.currentUser!.id) throw new NotFoundError("Ad");

    const { title, description, price } = req.body;

    ad.set({ title, description, price });
    await ad.save();

    res.status(StatusCodes.OK).send(ad);
  }
);

export { router as updateAdRouter };
