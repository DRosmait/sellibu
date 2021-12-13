import { Listener, Subjects, UserCreatedEvent } from "@sellibu-proj/common";
import { Message } from "node-nats-streaming";

import { User } from "../../models";
import { queueGroupeName } from "../constants";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupeName;

  async onMessage(
    { id, email, userName }: { id: string; email: string; userName: string },
    msg: Message
  ): Promise<void> {
    const user = User.build({
      id,
      email,
      userName,
    });

    await user.save();

    msg.ack();
  }
}
