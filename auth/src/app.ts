import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, currentUser } from "./middlewares";
import { NotFoundError } from "./errors";

import { signupRouter, signinRouter, currentUserRouter } from "./routes";

const app = express();

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

app.use(currentUserRouter);
app.use(signupRouter);
app.use(signinRouter);

app.use("*", () => {
  throw new NotFoundError("Route not found");
});

app.use(errorHandler);

export default app;
