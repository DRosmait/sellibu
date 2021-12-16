import mongoose from "mongoose";
import { AdStatus } from "@sellibu-proj/common";
import { Ad, User } from "../../../models";

export function getRandomMongooseId() {
  return new mongoose.Types.ObjectId().toHexString();
}

export const createAdOwnerUser = async () => {
  const owner = User.build({
    id: getRandomMongooseId(),
    email: "max@test.com",
    userName: "Max Mustermann",
  });
  await owner.save();

  const user = User.build({
    id: getRandomMongooseId(),
    email: "lisa@test.com",
    userName: "Lisa Musterfrau",
  });
  await user.save();

  const ad = Ad.build({
    id: getRandomMongooseId(),
    title: "Some ad",
    price: 100,
    user: owner,
    status: AdStatus.Open,
  });
  await ad.save();

  return { owner, user, ad };
};
