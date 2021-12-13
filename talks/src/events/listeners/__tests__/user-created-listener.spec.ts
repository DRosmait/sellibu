import mongoose from "mongoose";
import { UserCreatedEvent } from "@sellibu-proj/common";
import { Message } from "node-nats-streaming";

import natsWrapper from "../../../nats-wrapper";
import { UserCreatedListener } from "../user-created-listener";
import { User } from "../../../models";

const setup = () => {
  const listener = new UserCreatedListener(natsWrapper.client);

  const data: UserCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    userName: "Max Mustermann",
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("user-created-listener.ts", () => {
  it("creates and saves a user on message recieved.", async () => {
    const { listener, data, msg } = setup();

    await listener.onMessage(data, msg);

    const user = await User.findById(data.id);

    expect(user).toBeDefined();
    expect(user!.email).toEqual(data.email);
    expect(user!.userName).toEqual(data.userName);
  });

  it("acks the message.", async () => {
    const { listener, data, msg } = setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
