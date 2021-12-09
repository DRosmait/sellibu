import request from "supertest";
import { StatusCodes } from "http-status-codes";

import app from "../../app";
import { createUserInDB } from "./helpers";

const contactPayload = {
  phone: "+1234567890",
  location: {
    lat: 50.4481,
    long: 30.51457,
    radius: 1000,
  },
  address: {
    city: "Kyiv",
    street: "Volodymyrska St, 45",
    country: "Ukraine",
    countryCode: "02000",
  },
  visible: {
    email: false,
    phone: true,
    location: true,
    address: false,
  },
};

describe("contact-update.ts", () => {
  it(`returns ${StatusCodes.UNAUTHORIZED} if user is not authorized.`, async () => {
    await request(app)
      .put("/api/ads/contact")
      .send(contactPayload)
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns ${StatusCodes.UNAUTHORIZED} if user is not found in DB.`, async () => {
    const response = await request(app)
      .put("/api/ads/contact")
      .set("Cookie", global.signin()) // pass signed in cookie
      .send(contactPayload)
      .expect(StatusCodes.UNAUTHORIZED);
  });

  it(`returns ${StatusCodes.OK} on successful contact data update.`, async () => {
    // create user in DB
    const user = await createUserInDB();

    await request(app)
      .put("/api/ads/contact")
      .set("Cookie", global.signin(user.id)) // send request with signed cookie for created user
      .send(contactPayload)
      .expect(StatusCodes.OK);
  });
});
