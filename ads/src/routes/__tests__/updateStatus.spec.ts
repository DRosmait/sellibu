import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { AdStatus } from "@sellibu-proj/common";

import app from "../../app";
import { Ad } from "../../models";
import { createUserInDB, getRandomMongooseId } from "./helpers";

describe("updateStatus.ts", () => {
  it(`returns a ${StatusCodes.NOT_FOUND} if ad wasn't found.`, async () => {
    // create user
    const user = await createUserInDB();

    await request(app)
      .put(`/api/ads/${getRandomMongooseId()}/status`)
      .set("Cookie", global.signin(user.id))
      .send({ status: "on:hold" })
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if NO 'status' was provided.`, async () => {
    // create user
    const user = await createUserInDB();

    await request(app)
      .put(`/api/ads/${getRandomMongooseId()}/status`)
      .set("Cookie", global.signin(user.id))
      .expect(StatusCodes.BAD_REQUEST);
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
      .put(`/api/ads/${getRandomMongooseId()}/status`)
      .set("Cookie", global.signin())
      .send({ status: "on:hold" })
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if ad already has 'expired' status.`, async () => {
    // create user
    const user = await createUserInDB();

    // create Ad in DB
    const ad = Ad.build({
      title: "Ad's title",
      description: "Ad's long description",
      price: 100,
      user,
      status: AdStatus.Expired,
    });
    await ad.save();

    // try to change status to 'on:hold'
    await request(app)
      .put(`/api/ads/${ad.id}/status`)
      .set("Cookie", global.signin(user.id))
      .send({ status: "on:hold" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if provided status is unknown.`, async () => {
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

    // try to change to some invalid status
    await request(app)
      .put(`/api/ads/${ad.id}/status`)
      .set("Cookie", global.signin(user.id))
      .send({ status: "inexistent:status" })
      .expect(StatusCodes.BAD_REQUEST);
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
      .put(`/api/ads/${ad.id}/status`)
      .set("Cookie", global.signin(user.id))
      .send({ status: "closed" })
      .expect(StatusCodes.OK);

    expect(closedAd.status).toEqual(AdStatus.Closed);
  });
});
