import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;

declare global {
  function signin(): string[];
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

global.signin = (full: boolean = true, userId?: string) => {
  const payload = {
    id: userId && new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    password: "password",
    userName: "Max Mustermann",
    ...(full && {
      phone: "+380971234567",
      location: {
        lat: 53.86182,
        long: 10.66172,
        radius: 1500,
      },
      address: {
        city: "Kyiv",
        street: "Hlybochytska St, 32А",
        country: "Ukraine",
        countryCode: "02000",
      },
    }),
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`express:sess=${base64}`];
};
