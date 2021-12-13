import { Subjects } from "./subjects";

export interface UserUpdatedEvent {
  subject: Subjects.UserUpdated;
  data: {
    id: string;
    email: string;
    userName: string;
    version: number;
  };
}
