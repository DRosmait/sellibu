import { Subjects } from ".";
import { AdStatus } from "../constants";

export interface AdCreatedEvent {
  subject: Subjects.AdCreated;
  data: {
    id: string;
    title: string;
    description: string;
    price: number;
    status: AdStatus;
    userId: string;
    createdAt: string;
    expiresAt: string;
    version: number;
  };
}
