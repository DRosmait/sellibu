import request from "supertest";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { createAdsInDB, getRandomMongooseId } from "./helpers";

describe("show.ts", () => {
  it(`returns ${StatusCodes.NOT_FOUND} if ad not found.`, async () => {
    await request(app)
      .get("/api/ads/" + getRandomMongooseId())
      .send()
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns ${StatusCodes.OK} if ad found.`, async () => {
    const ads = await createAdsInDB();
    const ad = ads[5];

    const { body } = await request(app)
      .get("/api/ads/" + ads[5].id)
      .send()
      .expect(StatusCodes.OK);

    expect(body.title).toEqual(ad.title);
    expect(body.description).toEqual(ad.description);
    expect(body.price).toEqual(ad.price);
    expect(body.user.id).toEqual(ad.user.id);
  });
});
