import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import {
  requireAuth,
  validateRequest,
  NotAuthorizedError,
  BadRequestError,
  NotFoundError,
} from "@sellibu-proj/common";

import { User, Ad, Talk, TalkDoc, Message } from "../models";

const router = express.Router();

router.post(
  "/api/talks/message",
  requireAuth,
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Message content must be provided."),
    body("adId")
      .trim()
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { content, talkId, adId } = req.body;
    const userId = req.currentUser!.id;

    // get user
    const user = await User.findById(userId);
    if (!user) throw new NotAuthorizedError();

    // get Ad
    const ad = await Ad.findById(adId).populate("user");
    if (!ad) throw new NotFoundError("Ad");

    // get talk
    let talk: TalkDoc;
    const owner = ad.user;

    if (talkId) {
      talk = (await Talk.findById(talkId)) as TalkDoc;
      if (!talk) throw new NotFoundError("Talk");
    } else if (!talkId && owner.id === user.id) {
      throw new BadRequestError("Owner cannot create first message.");
    } else {
      talk = (await Talk.findOne({ ad, user, owner: ad.user })) as TalkDoc;
      if (!talk) {
        talk = Talk.build({
          ad,
          user,
          owner: ad.user,
        });
      }
    }

    // create message
    const message = Message.build({
      content,
      userId: user.id,
      talkId: talk.id,
    });
    await message.save();

    // update talk
    talk.set({ updatedAt: message.createdAt });
    await talk.save();

    res.status(StatusCodes.OK).send(message);
  }
);

export { router as createMessageRouter };
