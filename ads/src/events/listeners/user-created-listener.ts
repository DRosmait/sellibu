import { Message } from "node-nats-streaming";
import { Listener, UserCreatedEvent, Subjects } from "@sellibu-proj/common";

import { User } from "../../models";
import { queueGroupeName } from "../constants";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupeName;

  async onMessage(data: UserCreatedEvent["data"], msg: Message) {
    const { id, email, userName } = data;

    const newUser = User.build({
      id,
      email,
      userName,
    });
    await newUser.save();

    msg.ack();
  }
}
