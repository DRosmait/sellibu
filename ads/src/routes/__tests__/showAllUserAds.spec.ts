import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { createUserInDB, createAdsInDB, getRandomMongooseId } from "./helpers";
import { AdStatus } from "@sellibu-proj/common";

describe("showForUser.ts", () => {
  it(`returns a ${StatusCodes.NOT_FOUND} if user with provided ID not found.`, async () => {
    await request(app)
      .get("/api/ads/user/" + getRandomMongooseId())
      .send()
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.OK} with a list of OPEN user's ads.`, async () => {
    // Create users
    const userOne = await createUserInDB({
      email: "userOne@test.com",
      userName: "User One",
    });
    const userTwo = await createUserInDB({
      email: "userTwo@test.com",
      userName: "User Two",
    });
    const userThree = await createUserInDB({
      email: "userThree@test.com",
      userName: "User Three",
    });

    // create ads for each user
    const userOneAds = await createAdsInDB({ userDoc: userOne });
    const userTwoAds = await createAdsInDB({
      userDoc: userTwo,
      count: 5,
      closedCount: 0,
    });
    const userThreeAds = await createAdsInDB({ userDoc: userThree });

    // get only one user's ads
    const { body } = await request(app)
      .get("/api/ads/user/" + userTwo.id)
      .send()
      .expect(StatusCodes.OK);

    expect(body.length).toEqual(
      userTwoAds.filter((ad) => ad.status !== AdStatus.Closed).length
    );
  });
});
