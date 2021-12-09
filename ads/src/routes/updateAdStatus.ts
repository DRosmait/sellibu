import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
  requireAuth,
  validateRequest,
  AdStatus,
  NotFoundError,
  BadRequestError,
} from "@sellibu-proj/common";

import { Ad } from "../models";

const router = express.Router();

router.put(
  "/api/ads/:id/status",
  requireAuth,
  [body("status").not().isEmpty().withMessage("Status must be provided.")],
  validateRequest,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError("Ad");

    const ad = await Ad.findById(id).populate("user");

    if (!ad) throw new NotFoundError("Ad");
    if (ad!.user.id !== req.currentUser!.id) throw new NotFoundError("Ad");
    if (ad.status === AdStatus.Expired)
      throw new BadRequestError("Ad is expired.");

    const { status } = req.body;

    if (!status || !Object.values(AdStatus).includes(status))
      throw new BadRequestError("Wrong ad's status.");

    ad.set({ status });
    await ad.save();

    res.status(StatusCodes.OK).send(ad);
  }
);

export { router as updateAdStatusRouter };
