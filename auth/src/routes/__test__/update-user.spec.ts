import request from "supertest";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { getSignedUserCookie } from "@sellibu-proj/common";

import app from "../../app";
import { User } from "../../models";
import natsWrapper from "../../nats-wrapper";

describe("update-user.ts", () => {
  it(`returns a ${StatusCodes.UNAUTHORIZED} if user is not authorized.`, async () => {
    // create user
    const {
      response: { body: user },
    } = await global.signin();

    // try to update user's name without signing in
    await request(app)
      .put("/api/users/update")
      .send({
        email: user.email,
        userName: "New user name",
      })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if 'userName' or 'email' are not defined in request body.`, async () => {
    // create user
    const { cookie } = await global.signin();

    // try to update the user without all mandatory fields
    await request(app)
      .put("/api/users/update")
      .set("Cookie", cookie)
      .send({
        email: "some_new_email@test.com",
      })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .put("/api/users/update")
      .set("Cookie", cookie)
      .send({
        userName: "New user name",
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.NOT_FOUND} if current user not found in DB.`, async () => {
    // create faked user session cookie
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = getSignedUserCookie(userId);

    // try to update nonexistent user
    await request(app)
      .put("/api/users/update")
      .set("Cookie", cookie)
      .send({
        email: "some_new_email@test.com",
        userName: "New user name",
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if new email is already in use.`, async () => {
    // create users
    const {
      cookie,
      response: { body: userOne },
    } = await global.signin();

    const userTwo = User.build({
      email: "email@test.com",
      userName: "User Two",
      password: "password",
    });
    await userTwo.save();

    // try to update userOne's email using email of user two
    await request(app)
      .put("/api/users/update")
      .set("Cookie", cookie)
      .send({
        email: userTwo.email,
        userName: userOne.userName,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.OK} on success user update.`, async () => {
    // create users
    const { cookie } = await global.signin();

    // update user
    const { body: updatedUser } = await request(app)
      .put("/api/users/update")
      .set("Cookie", cookie)
      .send({
        email: "updatedemail@test.com",
        userName: "New user name",
      })
      .expect(StatusCodes.OK);

    expect(updatedUser.email).toEqual("updatedemail@test.com");
    expect(updatedUser.userName).toEqual("New user name");
  });

  it("publishes an event.", async () => {
    // create users
    const { cookie } = await global.signin();

    // update user
    await request(app)
      .put("/api/users/update")
      .set("Cookie", cookie)
      .send({
        email: "updatedemail@test.com",
        userName: "New user name",
      })
      .expect(StatusCodes.OK);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2); // first time in signin() method after creating the user and second time after update
  });
});
