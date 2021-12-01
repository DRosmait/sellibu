import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { createUserInDB, getRandomMongooseId } from "./helpers";
import { AdStatus } from "@sellibu-proj/common";

describe("update.ts", () => {
  it(`returns a ${StatusCodes.NOT_FOUND} if ad not found`, async () => {
    await request(app)
      .put("/api/ads/" + getRandomMongooseId())
      .set("Cookie", global.signin())
      .send({
        title: "Ad's title",
        description: "Ad's very long description",
        price: 20,
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.NOT_FOUND} if user is not ad's owner`, async () => {
    // create user
    const user = await createUserInDB();

    // create ad
    const { body: ad } = await request(app)
      .post("/api/ads")
      .set("Cookie", global.signin(user.id)) // signs in random user
      .send({
        title: "Ad's title",
        description: "Ad's very long description",
        price: 20,
      })
      .expect(StatusCodes.CREATED);

    // try to update with another user
    await request(app)
      .put("/api/ads/" + ad.id)
      .set("Cookie", global.signin()) // signs in another random user
      .send({
        title: "Ad's title",
        description: "Ad's very long description",
        price: 20,
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if ad is closed`, async () => {
    // create user
    const user = await createUserInDB();

    // create ad
    const { body: ad } = await request(app)
      .post("/api/ads")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's very long description",
        price: 20,
      })
      .expect(StatusCodes.CREATED);

    // close the ad
    await request(app)
      .delete("/api/ads/" + ad.id)
      .set("Cookie", global.signin(user.id))
      .send()
      .expect(StatusCodes.OK);

    // try to update a closed ad
    await request(app)
      .put("/api/ads/" + ad.id)
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's very long description",
        price: 20,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.OK} and updated ad on success.`, async () => {
    // create user
    const user = await createUserInDB();

    // create ad
    const { body: ad } = await request(app)
      .post("/api/ads")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's very long description",
        price: 20,
      })
      .expect(StatusCodes.CREATED);

    const { body: updatedAd } = await request(app)
      .put("/api/ads/" + ad.id)
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Updated title",
        description: "Updated description",
        price: 100,
      })
      .expect(StatusCodes.OK);

    expect(updatedAd.title).toEqual("Updated title");
    expect(updatedAd.description).toEqual("Updated description");
    expect(updatedAd.price).toEqual(100);
  });

  it(`does not update 'user', 'userId', 'status' fields.`, async () => {
    // create owner
    const owner = await createUserInDB();
    // create another user
    const otherUser = await createUserInDB({ email: "another@test.com" });

    // create ad
    const { body: ad } = await request(app)
      .post("/api/ads")
      .set("Cookie", global.signin(owner.id))
      .send({
        title: "Ad's title",
        description: "Ad's very long description",
        price: 20,
      })
      .expect(StatusCodes.CREATED);

    const { body: updatedAd } = await request(app)
      .put("/api/ads/" + ad.id)
      .set("Cookie", global.signin(owner.id))
      .send({
        title: "Updated title",
        description: "Updated description",
        price: 100,
        user: otherUser,
        userId: otherUser.id,
        status: AdStatus.OnHold,
      })
      .expect(StatusCodes.OK);

    expect(updatedAd.user.id).toEqual(owner.id);
    expect(updatedAd.userId).toEqual(owner.id);
    expect(updatedAd.status).toEqual(AdStatus.Open);
  });
});
