import { Message } from "node-nats-streaming";
import { Listener, Subjects, UserUpdatedEvent } from "@sellibu-proj/common";

import { User } from "../../models";
import { queueGroupeName } from "../constants";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
  queueGroupName = queueGroupeName;

  async onMessage(data: UserUpdatedEvent["data"], msg: Message): Promise<void> {
    const user = await User.findByEvent(data);

    if (!user) throw new Error("User not found");

    user.set({
      email: data.email,
      userName: data.userName,
    });
    await user.save();

    msg.ack();
  }
}
