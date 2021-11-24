import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { User } from "../../models";
import { Password } from "../../helpers";

describe("signup.ts", () => {
  it(`returns a ${StatusCodes.BAD_REQUEST} if required filds 'email', 'password' or 'userName' are not defined.`, async () => {
    await request(app)
      .post("/api/users/signup")
      .send({})
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/users/signup")
      .send({ email: "test@test.com" })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/users/signup")
      .send({ email: "test@test.com", password: "password" })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/users/signup")
      .send({ password: "password", userName: "Test" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if email is invalid.`, async () => {
    await request(app)
      .post("/api/users/signup")
      .send({ email: "test@test", password: "password", userName: "User" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if password is not in the range.`, async () => {
    await request(app)
      .post("/api/users/signup")
      .send({ email: "test@test.com", password: "pa", userName: "User" })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: Array(15).fill("password").join(""),
        userName: "User",
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if user name is not in the range.`, async () => {
    await request(app)
      .post("/api/users/signup")
      .send({ email: "test@test.com", password: "password", userName: "u" })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
        userName: Array(15).fill("username").join(""),
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if email already exists.`, async () => {
    const user = User.build({
      email: "test@test.com",
      password: "password",
      userName: "user 1",
    });
    await user.save();

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
        userName: "user 2",
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.CREATED} with user object on success.`, async () => {
    const user = {
      email: "test@test.com",
      password: "password",
      userName: "user",
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
    };

    const { body: createdUser } = await request(app)
      .post("/api/users/signup")
      .send(user)
      .expect(StatusCodes.CREATED);

    expect(createdUser.email).toEqual(user.email);
    expect(createdUser.userName).toEqual(user.userName);
    expect(createdUser.location.lat).toEqual(user.location.lat);
    expect(createdUser.location.long).toEqual(user.location.long);
    expect(createdUser.location.radius).toEqual(user.location.radius);
    expect(createdUser.address.city).toEqual(user.address.city);
    expect(createdUser.address.street).toEqual(user.address.street);
    expect(createdUser.address.country).toEqual(user.address.country);
    expect(createdUser.address.countryCode).toEqual(user.address.countryCode);
  });

  it(`returns NO password in user object on success.`, async () => {
    const { response } = await global.signin();

    expect(response.body.password).not.toBeDefined();
  });

  it("sets cookie with JWT user payload after successful sign up", async () => {
    const { cookie } = await global.signin();

    expect(cookie).toBeDefined();
  });
});
