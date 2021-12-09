import express from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "@sellibu-proj/common";

import { Ad } from "../models";

const router = express.Router();

router.get("/api/ads/:id", async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new BadRequestError("Ad's id is not valid");

  const ad = await Ad.findById(id).populate("user");
  if (!ad) throw new NotFoundError("Ad");

  res.status(StatusCodes.OK).send(ad);
});

export { router as showAdRouter };
