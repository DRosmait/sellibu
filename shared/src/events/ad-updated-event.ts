import { Subjects } from ".";
import { AdStatus } from "../constants";

export interface AdUpdatedEvent {
  subject: Subjects.AdUpdated;
  data: {
    id: string;
    title: string;
    description: string;
    price: string;
    status: AdStatus;
    version: number;
  };
}
