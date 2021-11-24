import { StatusCodes } from "http-status-codes";
import request from "supertest";

import app from "../../app";

describe("current-user.ts", () => {
  it("responds with details about current user", async () => {
    const { cookie } = await global.signin();

    const { body } = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", cookie)
      .send()
      .expect(StatusCodes.OK);

    expect(body.currentUser.email).toEqual("test@test.com");
    expect(body.currentUser.userName).toEqual("user");
  });

  it("responds with NULL if not authenticated", async () => {
    const { body } = await request(app)
      .get("/api/users/currentuser")
      .send()
      .expect(StatusCodes.OK);

    expect(body.currentUser).toBeNull();
  });
});
