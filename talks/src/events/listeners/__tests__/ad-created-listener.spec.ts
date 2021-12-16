import mongoose from "mongoose";
import { AdCreatedEvent, AdStatus } from "@sellibu-proj/common";
import { Message } from "node-nats-streaming";

import natsWrapper from "../../../nats-wrapper";
import { AdCreatedListener } from "../ad-created-listener";
import { Ad, User } from "../../../models";

const setup = async () => {
  const listener = new AdCreatedListener(natsWrapper.client);

  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    userName: "Max Mustermann",
  });
  await user.save();

  const data: AdCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Ad's title",
    price: 100,
    description: "Ad's long description",
    status: AdStatus.Open,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date().toISOString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("ad-created-listener.ts", () => {
  it("creates and saves a ad on message recieved.", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ad = await Ad.findById(data.id);

    expect(ad).toBeDefined();
    expect(ad!.title).toEqual(data.title);
    expect(ad!.price).toEqual(data.price);
    expect(ad!.status).toEqual(data.status);
    expect(ad!.userId).toEqual(data.userId);
  });

  it("acks the message.", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
