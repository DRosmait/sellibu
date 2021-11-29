import mongoose from "mongoose";

import app from "./app";

const setup = async () => {
  if (process.env.JWT_KEY) {
    throw new Error("JWT_KEY evn variable must bu define.");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }

  app.listen(5000, () => console.log("Ads server is listening on port 5000"));
};

setup();
