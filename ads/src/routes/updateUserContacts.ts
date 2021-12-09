import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { requireAuth, NotAuthorizedError } from "@sellibu-proj/common";

import { User } from "../models";

const router = express.Router();

router.put(
  "/api/ads/contact",
  requireAuth,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser!.id);
    if (!user) throw new NotAuthorizedError();

    const {
      phone = user.phone,
      location = user.location,
      address = user.address,
      visible = user.visible,
    } = req.body;

    user.set({
      phone,
      location: {
        ...user.location,
        ...location,
      },
      address: {
        ...user.address,
        ...address,
      },
      visible: {
        ...user.visible,
        visible,
      },
    });
    await user.save();

    res.status(StatusCodes.OK).send(user);
  }
);

export { router as updateUserContactsRouter };
