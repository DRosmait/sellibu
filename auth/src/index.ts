import mongoose from "mongoose";

import app from "./app";
import natsWrapper from "./nats-wrapper";

const setup = async () => {
  const variableNames = [
    "NATS_CLIENT_ID",
    "NATS_URL",
    "NATS_CLUSTER_ID",
    "MONGO_URI",
    "JWT_KEY",
  ];

  variableNames.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`${varName} env variable must be definde.`);
    }
  });

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(5000, () => console.log("Auth server is listening on port 5000"));
};

setup();
