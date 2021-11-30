import mongoose from "mongoose";

import { User } from "../../../models";

export async function addUserToDB() {
  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
    userName: "Max Mustermann",
  });
  await user.save();

  return user;
}
