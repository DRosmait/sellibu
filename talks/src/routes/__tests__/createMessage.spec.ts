import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { Talk } from "../../models";
import { getRandomMongooseId, createAdOwnerUser } from "./helpers";

describe("createMessage.ts", () => {
  it(`returns a ${StatusCodes.UNAUTHORIZED} if user is not signed in.`, async () => {
    const { ad } = await createAdOwnerUser();

    await request(app)
      .post("/api/talks/message")
      .send({
        content: "Message text",
        adId: ad.id,
      })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.UNAUTHORIZED} if not found in DB.`, async () => {
    const { ad } = await createAdOwnerUser();

    await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin())
      .send({
        content: "Message text",
        adId: ad.id,
      })
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns a ${StatusCodes.NOT_FOUND} if Ad not found in DB.`, async () => {
    const { user } = await createAdOwnerUser();

    await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(user.id))
      .send({
        content: "Message text",
        adId: getRandomMongooseId(),
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if message has no content or it is empty.`, async () => {
    const { user, ad } = await createAdOwnerUser();

    await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(user.id))
      .send({ adId: ad.id })
      .expect(StatusCodes.BAD_REQUEST);

    await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(user.id))
      .send({
        content: "",
        adId: ad.id,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.NOT_FOUND} if optional Talk ID passed but Talk not found in DB.`, async () => {
    const { user, ad } = await createAdOwnerUser();

    await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(user.id))
      .send({
        content: "Message text",
        adId: ad.id,
        talkId: getRandomMongooseId(),
      })
      .expect(StatusCodes.NOT_FOUND);
  });

  it(`returns a ${StatusCodes.BAD_REQUEST} if owner tries to create a message without passing Talk ID.`, async () => {
    const { owner, ad } = await createAdOwnerUser();

    await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(owner.id))
      .send({
        content: "Message text",
        adId: ad.id,
      })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it(`returns a ${StatusCodes.CREATED} on successful message creation.`, async () => {
    const { user, ad } = await createAdOwnerUser();

    const { body: message } = await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(user.id))
      .send({
        content: "Message text",
        adId: ad.id,
      })
      .expect(StatusCodes.CREATED);

    expect(message.content).toEqual("Message text");
    expect(message.userId).toEqual(user.id);
    expect(message.createdAt).toBeDefined();
  });

  it(`creates talk in DB after successful message creation.`, async () => {
    const { user, ad } = await createAdOwnerUser();

    const { body: message } = await request(app)
      .post("/api/talks/message")
      .set("Cookie", global.signin(user.id))
      .send({
        content: "Message text",
        adId: ad.id,
      })
      .expect(StatusCodes.CREATED);

    const talk = await Talk.findById(message.talkId)
      .populate("ad")
      .populate("owner")
      .populate("user");

    expect(talk).toBeDefined();
    expect(talk!.ad.id).toEqual(ad.id);
    expect(talk!.owner.id).toEqual(ad.user.id);
    expect(talk!.user.id).toEqual(user.id);
  });

  it("creates messages in existing talk regardless if Talk ID is specified or not (NOT for owner).", async () => {
    const { owner, user, ad } = await createAdOwnerUser();

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
  });
});
