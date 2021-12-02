import mongoose from "mongoose";

import app from "./app";

const setup = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable must be definde.");
  }

  try {
    await mongoose.connect("mongodb://ads-mongo-srv:27017/ads");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(5000, () => console.log("Ads server is listening on port 5000"));
};

setup();
