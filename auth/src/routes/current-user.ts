import express from "express";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get("/api/users/currentuser", async (req, res) => {
  res.status(StatusCodes.OK).send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
