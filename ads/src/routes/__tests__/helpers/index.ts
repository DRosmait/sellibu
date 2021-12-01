import mongoose from "mongoose";
import { AdStatus } from "@sellibu-proj/common";

import { Ad, User, UserDoc } from "../../../models";

export async function addUserToDB() {
  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    userName: "Max Mustermann",
  });
  await user.save();

  return user;
}

export function createAds({
  count = 10,
  closedCount = 2,
  userDoc,
}: {
  count: number;
  closedCount: number;
  userDoc?: UserDoc;
}) {
  if (count < closedCount)
    throw new Error(
      "createAds() function expect 'count' greater than 'closedCount'"
    );

  return Promise.race(
    Array(count)
      .fill("")
      .map(async (_, idx) => {
        const user = userDoc || (await addUserToDB());
        const isClosed = idx < count - closedCount - 1;
        const ad = Ad.build({
          title: `Ad #${idx}`,
          description: `Description for Ad #${idx}`,
          price: Math.floor(Math.random() * 100) + 1,
          user,
          status: isClosed ? AdStatus.Open : AdStatus.Closed,
        });

        return ad;
      })
  );
}
