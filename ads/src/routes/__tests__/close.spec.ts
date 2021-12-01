import request from "supertest";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { AdStatus } from "@sellibu-proj/common";

import app from "../../app";
import { addUserToDB } from "./helpers";

describe("close.ts", () => {
  it(`returns a ${StatusCodes.BAD_REQUEST} if ad wasn't found.`, async () => {
    // create user
    const user = await addUserToDB();

    await request(app)
      .delete("/api/ads/close")
      .set("Cookie", global.signin(user.id))
      .send({ id: new mongoose.Types.ObjectId().toHexString() })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if user is not the ad's owner.`, async () => {
    // create user
    const user = await addUserToDB();

    // create ad
    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.CREATED);

    // try to close the ad with another user
    await request(app)
      .delete("/api/ads/close")
      .set("Cookie", global.signin())
      .send({ id: new mongoose.Types.ObjectId().toHexString() })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.OK} when ad was successfully closed.`, async () => {
    // create user
    const user = await addUserToDB();

    // create ad
    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.CREATED);

    // close the ad with owner user
    await request(app)
      .delete("/api/ads/close")
      .set("Cookie", global.signin(user.id))
      .send({ id: new mongoose.Types.ObjectId().toHexString() })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`changes ad's status to ${AdStatus.Closed}.`, async () => {
    // create user
    const user = await addUserToDB();

    // create ad
    const { body: ad } = await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.CREATED);

    expect(ad.status).toEqual(AdStatus.Open);

    // close the ad with owner user
    const { body: closedAd } = await request(app)
      .delete("/api/ads/close")
      .set("Cookie", global.signin(user.id))
      .send({ id: ad.id })
      .expect(StatusCodes.OK);

    expect(closedAd.status).toEqual(AdStatus.Closed);
  });
});
