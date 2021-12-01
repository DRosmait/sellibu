import express, { Request, Response } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  AdStatus,
} from "@sellibu-proj/common";

import { Ad } from "../models";

const router = express.Router();

router.delete(
  "/api/ads/close",
  requireAuth,
  [body("id").notEmpty().withMessage("Ad's ID must be defined.")],
  validateRequest,
  async (req: Request, res: Response) => {
    const ad = await Ad.findById(req.body.id).populate("user");
    if (!ad) throw new BadRequestError("Ad not found");
    if (ad!.user.id !== req.currentUser!.id)
      throw new BadRequestError("Ad not found");

    ad.set({ status: AdStatus.Closed });
    await ad.save();

    res.status(StatusCodes.OK).send(ad);
  }
);

export { router as closeAdRouter };
