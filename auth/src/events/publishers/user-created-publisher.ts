import { Publisher, UserCreatedEvent, Subjects } from "@sellibu-proj/common";

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
