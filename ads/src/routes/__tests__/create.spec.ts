import request from "supertest";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

import app from "../../app";
import { User } from "../../models";

async function addUserToDB() {
  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    userName: "Max Mustermann",
  });
  await user.save();

  return user;
}

describe("create.ts", () => {
  it(`returns a ${StatusCodes.UNAUTHORIZED} if user is not signed in.`, async () => {
    await request(app)
      .post("/api/ads/create")
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.UNAUTHORIZED} if signed user is not in DB.`, async () => {
    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin())
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if required props are not defined.`, async () => {
    const user = await addUserToDB();

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
      })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        price: 100,
      })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if 'title' is not in the range.`, async () => {
    const user = await addUserToDB();

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "A",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: Array(100).fill("very long title").join(" "),
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if 'description' is not in the range.`, async () => {
    const user = await addUserToDB();

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: Array(100).fill("Ad's long description").join(" "),
        price: 100,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if 'price' is ZERO or negative value.`, async () => {
    const user = await addUserToDB();

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: -100,
      })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 0,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.CREATED} with AD object on success.`, async () => {
    const user = await addUserToDB();

    const { body: newAd } = await request(app)
      .post("/api/ads/create")
      .set("Cookie", global.signin(user.id))
      .send({
        title: "Ad's title",
        description: "Ad's long description",
        price: 100,
      })
      .expect(StatusCodes.CREATED);

    expect(newAd.title).toEqual("Ad's title");
    expect(newAd.description).toEqual("Ad's long description");
    expect(newAd.price).toEqual(100);
    expect(newAd.user.id).toEqual(user.id);
  });
});
