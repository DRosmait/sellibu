import mongoose from "mongoose";

import { Message } from "../.";

describe("message.ts", () => {
  it("has 'id' field.", async () => {
    const message = Message.build({
      content: "Some message text",
      userId: new mongoose.Types.ObjectId().toHexString(),
      talkId: new mongoose.Types.ObjectId().toHexString(),
    });
    await message.save();

    expect(message.id).toBeDefined();
  });
});
