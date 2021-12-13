import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { UserUpdatedEvent } from "@sellibu-proj/common";

import { UserUpdatedListener } from "../user-updated-listener";
import natsWrapper from "../../../nats-wrapper";
import { User } from "../../../models";

const setup = async () => {
  const listener = new UserUpdatedListener(natsWrapper.client);

  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    userName: "Max Mustermann",
  });
  await user.save();

  const data: UserUpdatedEvent["data"] = {
    id: user.id,
    email: "new@test.com",
    userName: "Lisa Mustermann",
    version: user.version + 1,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("user-updated-listener.ts", () => {
  it("updates the user on message recieved.", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const user = await User.findById(data.id);

    expect(user!.email).toEqual(data.email);
    expect(user!.userName).toEqual(data.userName);
  });

  it("acks the message.", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
