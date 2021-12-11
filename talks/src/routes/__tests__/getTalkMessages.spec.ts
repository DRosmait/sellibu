import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { Message, Talk } from "../../models";
import { getRandomMongooseId, createAdOwnerUser } from "./helpers";

const setup = async () => {
  const { ad, owner, user } = await createAdOwnerUser();

  const { body: firstMessage } = await request(app)
    .post("/api/talks/message")
    .set("Cookie", global.signin(user.id))
    .send({
      content: "Message text",
      adId: ad.id,
    })
    .expect(StatusCodes.CREATED);

  const talk = await Talk.findById(firstMessage.talkId)
    .populate("ad")
    .populate("owner")
    .populate("user");

  for (let i = 0; i < 10; i++) {
    const creator = i % 2 ? owner : user;
    const talkId = i % 2 ? talk.id : undefined;

    await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(creator.id))
      .send({
        content: `Message text ${i}`,
        adId: ad.id,
        talkId,
      })
      .expect(StatusCodes.CREATED);
  }

  return { talk, ad, owner, user };
};

describe("getTalkMessages.ts", () => {
  it(`returns a ${StatusCodes.UNAUTHORIZED} if user is not signed in.`, async () => {
    const { talk } = await setup();

    await request(app)
      .get(`/api/talks/${talk.id}/messages`)
      .send()
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.UNAUTHORIZED} if user not found in DB.`, async () => {
    const { talk } = await setup();

    await request(app)
      .get(`/api/talks/${talk.id}/messages`)
      .set("Cookie", global.signin())
      .send()
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.NOT_FOUND} if talk not found in DB`, async () => {
    const { user } = await setup();

    await request(app)
      .get(`/api/talks/${getRandomMongooseId()}/messages`)
      .set("Cookie", global.signin(user.id))
      .send()
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.NOT_FOUND} if current user is neither 'owner' nor 'user' of the talk.`, async () => {
    const { user } = await setup();

    await request(app)
      .get(`/api/talks/${getRandomMongooseId()}/messages`)
      .set("Cookie", global.signin(user.id))
      .send()
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.OK} and list of messages for the talk's user.`, async () => {
    const { user, talk } = await setup();

    const { body: messages } = await request(app)
      .get(`/api/talks/${talk.id}/messages`)
      .set("Cookie", global.signin(user.id))
      .send()
      .expect(StatusCodes.OK);

    expect(messages.length).toEqual(11);
  });

  it(`returns a ${StatusCodes.OK} and list of messages for the talk's owner.`, async () => {
    const { owner, talk } = await setup();

    const { body: messages } = await request(app)
      .get(`/api/talks/${talk.id}/messages`)
      .set("Cookie", global.signin(owner.id))
      .send()
      .expect(StatusCodes.OK);

    expect(messages.length).toEqual(11);
  });
});
