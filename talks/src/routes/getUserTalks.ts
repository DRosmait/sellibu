import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { requireAuth } from "@sellibu-proj/common";

import { Talk } from "../models";

const router = express.Router();

router.get("/api/talks", requireAuth, async (req: Request, res: Response) => {
  const userId = req.currentUser!.id;

  // use Promise.all() to do queries in parallel
  const [talksAsUser, talksAsOwner] = await Promise.all(
    [Talk.find({ userId }), Talk.find({ ownerId: userId })].map((talkPrms) =>
      talkPrms.populate("ad").populate("owner").populate("user")
    )
  );

  res.status(StatusCodes.OK).send(talksAsUser.concat(talksAsOwner));
});

export { router as getUserTalksRouter };
