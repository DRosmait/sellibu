import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { getSignedUserCookie } from "@sellibu-proj/common";

import app from "../../app";

import { passwordLength } from "../../helpers";

describe("change-password.ts", () => {
  it(`returns a ${StatusCodes.UNAUTHORIZED} if user is not signed in.`, async () => {
    await request(app)
      .put("/api/auth/password")
      .send({ oldPassword: "password", newPassword: "updated password" })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.UNAUTHORIZED} if user is not found in DB.`, async () => {
    await request(app)
      .put("/api/auth/password")
      .set("Cookie", getSignedUserCookie())
      .send({ oldPassword: "password", newPassword: "updated password" })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if the old password is wrong.`, async () => {
    const { cookie } = await global.signin();

    await request(app)
      .put("/api/auth/password")
      .set("Cookie", cookie)
      .send({ oldPassword: "wrong password", newPassword: "updated password" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if the new password is not in the range.`, async () => {
    const { cookie } = await global.signin();

    await request(app)
      .put("/api/auth/password")
      .set("Cookie", cookie)
      .send({
        oldPassword: "password",
        newPassword: new Array(passwordLength.min - 1).fill("p"),
      })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .put("/api/auth/password")
      .set("Cookie", cookie)
      .send({
        oldPassword: "password",
        newPassword: new Array(passwordLength.max + 1).fill("p"),
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.OK} on successful password change.`, async () => {
    const { cookie } = await global.signin();

    await request(app)
      .put("/api/auth/password")
      .set("Cookie", cookie)
      .send({
        oldPassword: "password",
        newPassword: "updated password",
      })
      .expect(StatusCodes.OK);
  });
});
