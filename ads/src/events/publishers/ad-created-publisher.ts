import { Publisher, Subjects, AdCreatedEvent } from "@sellibu-proj/common";

export class AdCreatedPublisher extends Publisher<AdCreatedEvent> {
  subject: Subjects.AdCreated = Subjects.AdCreated;
}
