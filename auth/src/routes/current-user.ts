import express from "express";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get("/api/users/currentuser", async (req, res) => {
  const status = req.currentUser ? StatusCodes.OK : StatusCodes.UNAUTHORIZED;
  res.status(status).send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
