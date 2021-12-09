import express from "express";
import { StatusCodes } from "http-status-codes";
import { AdStatus } from "@sellibu-proj/common";

import { Ad } from "../models";

const router = express.Router();

router.get("/api/ads", async (req, res) => {
  const ads = await Ad.find({ status: { $ne: AdStatus.Closed } });

  res.status(StatusCodes.OK).send(ads);
});

export { router as showAllAdsRouter };
