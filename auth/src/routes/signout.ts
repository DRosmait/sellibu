import express from "express";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get("/api/users/signout", async (req, res) => {
  req.session = null;
  res.status(StatusCodes.OK).send({});
});

export { router as signoutRouter };
