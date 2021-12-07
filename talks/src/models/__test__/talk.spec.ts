import mongoose from "mongoose";
import { AdStatus } from "@sellibu-proj/common";

import { Talk, Ad, User } from "../.";

const setup = async () => {
  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "max@mustermann.com",
    userName: "Max Mustermann",
  });
  await user.save();

  const owner = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "lisa@musterfrau.com",
    userName: "Lisa Musterfrau",
  });
  await owner.save();

  const ad = Ad.build({
    title: "Title",
    price: 100,
    user: owner,
    status: AdStatus.Open,
  });
  await ad.save();

  const talk = Talk.build({
    ad,
    owner,
    user,
  });
  await talk.save();

  return { user, owner, ad, talk };
};

describe("talk.ts", () => {
  it("has 'id' field", async () => {
    const { talk } = await setup();
    expect(talk.id).toBeDefined();
  });

  it("implements optimistic concurrency control", async () => {
    const { talk } = await setup();

    const firstInstance = await Talk.findById(talk.id);
    const secondInstance = await Talk.findById(talk.id);

    // save chages on the first instance
    const updatedAt = new Date().toISOString();
    firstInstance!.set({ updatedAt });
    await firstInstance!.save();
    expect(firstInstance!.version).toEqual(1);
    expect(firstInstance!.updatedAt).toEqual(updatedAt);

    // try to save changes on the second instance
    const saveSecondChange = async () => {
      secondInstance!.set({ updatedAt: new Date().toISOString() });
      await secondInstance!.save();
    };
    await expect(saveSecondChange).rejects.toThrow();
    expect(secondInstance!.version).toEqual(0);
  });

  it("increments version number on each save", async () => {
    const { talk } = await setup();

    expect(talk.version).toEqual(0);

    await talk.save();
    expect(talk.version).toEqual(1);

    await talk.save();
    expect(talk.version).toEqual(2);

    await talk.save();
    expect(talk.version).toEqual(3);
  });
});
