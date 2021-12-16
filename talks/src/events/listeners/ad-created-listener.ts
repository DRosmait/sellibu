import { Listener, Subjects, AdCreatedEvent } from "@sellibu-proj/common";
import { Message } from "node-nats-streaming";

import { Ad, User } from "../../models";
import { queueGroupeName } from "../constants";

export class AdCreatedListener extends Listener<AdCreatedEvent> {
  subject: Subjects.AdCreated = Subjects.AdCreated;
  queueGroupName = queueGroupeName;

  async onMessage(
    { id, title, price, status, userId }: AdCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const ad = Ad.build({
      id,
      title,
      price,
      status,
      user,
    });

    await ad.save();

    msg.ack();
  }
}
