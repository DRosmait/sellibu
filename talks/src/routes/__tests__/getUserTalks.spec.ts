import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { Talk } from "../../models";
import { createAdOwnerUser } from "./helpers";

describe("getUserTalks.ts", () => {
  it(`returns a ${StatusCodes.UNAUTHORIZED} if user is not signed in.`, async () => {
    await request(app)
      .get("/api/talks")
      .send()
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.OK} and a list of user's talks.`, async () => {
    const { ad, owner, user } = await createAdOwnerUser();

    const talk = Talk.build({ ad, owner, user });
    await talk.save();

    const { body: userTalks } = await request(app)
      .get("/api/talks")
      .set("Cookie", global.signin(user.id))
      .send()
      .expect(StatusCodes.OK);

    expect(userTalks.length).toEqual(1);

    const { body: ownerTalks } = await request(app)
      .get("/api/talks")
      .set("Cookie", global.signin(owner.id))
      .send()
      .expect(StatusCodes.OK);

    expect(ownerTalks.length).toEqual(1);
  });
});
