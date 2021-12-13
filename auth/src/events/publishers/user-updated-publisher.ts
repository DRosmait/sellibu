import { UserUpdatedEvent, Publisher, Subjects } from "@sellibu-proj/common";

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
}
