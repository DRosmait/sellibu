import mongoose from "mongoose";

import { Ad, User } from "..";
import { AdStatus } from "@sellibu-proj/common";

function getUser() {
  return User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    userName: "Max Mustermann",
  });
}

async function createAd() {
  const ad = Ad.build({
    title: "Title",
    description: "Ad's long description",
    price: 100,
    user: getUser(),
  });
  await ad.save();

  return ad;
}

describe("ad.js", () => {
  it("has 'id' field", async () => {
    const ad = await createAd();

    expect(ad.id).toBeDefined();
  });

  it("has 'userId' field", async () => {
    const ad = await createAd();

    expect(ad.userId).toBeDefined();
  });

  it(`has '${AdStatus.Open}' default status after creation.`, async () => {
    const ad = Ad.build({
      title: "Title",
      description: "Ad's long description",
      price: 100,
      user: getUser(),
    });
    await ad.save();

    expect(ad.status).toEqual(AdStatus.Open);
  });

  it("implements optimistic concurrency control", async () => {
    const ad = await createAd();

    const firstInstance = await Ad.findById(ad.id);
    const secondInstance = await Ad.findById(ad.id);

    const firstSave = async () => {
      firstInstance!.set({ password: "first change" });
      await firstInstance!.save();
    };

    const secondSave = async () => {
      secondInstance!.set({ password: "second change" });
      await secondInstance!.save();
    };

    await firstSave();
    expect(firstInstance!.version).toEqual(1);

    await expect(secondSave).rejects.toThrow();
    expect(secondInstance!.version).toEqual(0);
  });

  it("increments version number on each save.", async () => {
    const ad = await createAd();

    expect(ad.version).toEqual(0);

    await ad.save();
    expect(ad.version).toEqual(1);

    await ad.save();
    expect(ad.version).toEqual(2);

    await ad.save();
    expect(ad.version).toEqual(3);
  });
});
