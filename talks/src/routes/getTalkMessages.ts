import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@sellibu-proj/common";

import { User, Talk, Message } from "../models";

const router = express.Router();

router.get(
  "/api/talks/:id/messages",
  requireAuth,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser!.id);
    if (!user) throw new NotAuthorizedError();

    const talkId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(talkId))
      throw new NotFoundError("Talk");

    const talk = await Talk.findById(talkId);
    if (!talk) throw new NotFoundError("Talk");
    if (talk.userId !== user.id && talk.ownerId !== user.id)
      throw new NotFoundError("Talk");

    const messages = await Message.find({ talkId });

    res.status(StatusCodes.OK).send(messages);
  }
);

export { router as getTalkMessagesRouter };
