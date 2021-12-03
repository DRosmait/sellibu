import mongoose from "mongoose";

import app from "./app";
import natsWrapper from "./nats-wrapper";
import { UserCreatedListener } from "./events/listeners/user-created-listener";

const setup = async () => {
  // Mandatory ENV variables
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
    // Connect to NATS-Streaming
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    // Listen to NATS messages
    new UserCreatedListener(natsWrapper.client).listen();

    // Connect to Mongoose DB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(5000, () => console.log("Ads server is listening on port 5000"));
};

setup();
