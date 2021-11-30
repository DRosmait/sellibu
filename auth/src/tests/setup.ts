import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request, { Response } from "supertest";

import app from "../app";

let mongo: MongoMemoryServer;

declare global {
  function signin(): Promise<{ response: Response; cookie: string[] }>;
}

beforeAll(async () => {
  process.env.JWT_KEY = "somekey";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
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

global.signin = async () => {
  const user = {
    email: "test@test.com",
    password: "password",
    userName: "user",
  };

  const response = await request(app).post("/api/users/signup").send(user);

  const cookie = response.get("Set-Cookie");

  return { response, cookie };
};
