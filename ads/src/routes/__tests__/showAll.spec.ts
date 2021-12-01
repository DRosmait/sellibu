import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { AdStatus } from "@sellibu-proj/common";

import app from "../../app";
import { Ad } from "../../models";
import { createAds } from "./helpers";

describe("show.ts", () => {
  it(`returns a ${StatusCodes.OK} and list of all open ads.`, async () => {
    await createAds({ count: 10, closedCount: 2 });

    const { body } = await request(app)
      .get("/api/ads")
      .send()
      .expect(StatusCodes.OK);

    expect(body.length).toEqual(8);
    expect(
      body.every((ad: { status: AdStatus }) => ad.status === AdStatus.Open)
    ).toBeTruthy();
  });
});
