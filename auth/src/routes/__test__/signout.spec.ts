import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";

describe("signout.ts", () => {
  it("clears the cookie after signing out.", async () => {
    const { cookie } = await global.signin();

    const response = await request(app)
      .get("/api/users/signout")
      .set("Cookie", cookie)
      .send({})
      .expect(StatusCodes.OK);

    expect(response.get("Set-Cookie")[0]).toBe(
      "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
    );
  });
});
