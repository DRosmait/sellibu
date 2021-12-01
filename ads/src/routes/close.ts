import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { requireAuth, AdStatus, NotFoundError } from "@sellibu-proj/common";

import { Ad } from "../models";

const router = express.Router();

router.delete(
  "/api/ads/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundError("Ad");

    const ad = await Ad.findById(id).populate("user");

    if (!ad) throw new NotFoundError("Ad");
    if (ad!.user.id !== req.currentUser!.id) throw new NotFoundError("Ad");

    ad.set({ status: AdStatus.Closed });
    await ad.save();

    res.status(StatusCodes.OK).send(ad);
  }
);

export { router as closeAdRouter };
