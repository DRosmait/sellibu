import { Subjects } from ".";

export interface UserCreatedEvent {
  subject: Subjects.UserCreated;
  data: {
    id: string;
    email: string;
    userName: string;
  };
}
