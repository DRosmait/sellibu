import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { getSignedUserCookie } from "@sellibu-proj/common";

jest.mock("../nats-wrapper");

let mongo: MongoMemoryServer;

declare global {
  function signin(userId?: string): string[];
}

beforeAll(async () => {
  process.env.JWT_KEY = "somekey";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

global.signin = getSignedUserCookie;
