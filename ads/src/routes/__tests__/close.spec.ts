import request from "supertest";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { AdStatus } from "@sellibu-proj/common";

import app from "../../app";
import { createUserInDB, getRandomMongooseId } from "./helpers";

describe("close.ts", () => {
  it(`returns a ${StatusCodes.NOT_FOUND} if ad wasn't found.`, async () => {
    // create user
    const user = await createUserInDB();

    await request(app)
      .delete("/api/ads/" + getRandomMongooseId())
      .set("Cookie", global.signin(user.id))
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.NOT_FOUND} if user is not the ad's owner.`, async () => {
    // create user
    const user = await createUserInDB();

    // create ad
    await request(app)
      .post("/api/ads")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.CREATED);

    // try to close the ad with another user
    await request(app)
      .delete("/api/ads/" + getRandomMongooseId())
      .set("Cookie", global.signin())
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.OK} when ad was successfully closed.`, async () => {
    // create user
    const user = await createUserInDB();

    // create ad
    const { body: ad } = await request(app)
      .post("/api/ads")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.CREATED);

    // close the ad with owner user
    const { body: closedAd } = await request(app)
      .delete("/api/ads/" + ad.id)
      .set("Cookie", global.signin(user.id))
      .expect(StatusCodes.OK);

    expect(closedAd.status).toEqual(AdStatus.Closed);
  });
});
