import express from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "@sellibu-proj/common";

import { Ad, User } from "../models";

const router = express.Router();

router.get("/api/ads/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new NotFoundError("User");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");

  const ads = await Ad.find({ userId: user.id }).populate("user");

  res.status(StatusCodes.OK).send(ads);
});

export { router as showAllUserAdsRouter };
