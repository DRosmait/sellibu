import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";

describe("signin.ts", () => {
  it(`returns ${StatusCodes.BAD_REQUEST} if email has invalid email pattern.`, async () => {
    await global.signin();

    await request(app)
      .post("/api/users/signin")
      .send({ email: "test@test", password: "password" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns ${StatusCodes.BAD_REQUEST} if password is empty.`, async () => {
    await global.signin();

    await request(app)
      .post("/api/users/signin")
      .send({ email: "test@test.com", password: "" })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/users/signin")
      .send({ email: "test@test.com" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns ${StatusCodes.BAD_REQUEST} if email does not exist.`, async () => {
    await request(app)
      .post("/api/users/signin")
      .send({ email: "somobody@test.com", password: "password" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns ${StatusCodes.BAD_REQUEST} if password is incorrect.`, async () => {
    await global.signin();

    await request(app)
      .post("/api/users/signin")
      .send({ email: "test@test.com", password: "wrong_password" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`responds with a cookie when given valid credentials.`, async () => {
    await global.signin();

    const response = await request(app)
      .post("/api/users/signin")
      .send({ email: "test@test.com", password: "password" })
      .expect(StatusCodes.OK);

    expect(response.get("Set-Cookie")).toBeDefined();
  });
});
