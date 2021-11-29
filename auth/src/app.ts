import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, currentUser, NotFoundError } from "@sellibu-proj/common";

import {
  signupRouter,
  signinRouter,
  signoutRouter,
  currentUserRouter,
} from "./routes";

const app = express();
app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(currentUserRouter);

app.use("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
