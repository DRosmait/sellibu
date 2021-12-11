import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { AdDoc, UserDoc } from ".";

interface TalkAttrs {
  ad: AdDoc;
  user: UserDoc;
  owner: UserDoc;
}

export interface TalkDoc extends mongoose.Document {
  ad: AdDoc;
  user: UserDoc;
  userId: string;
  owner: UserDoc;
  ownerId: string;
  createdAt: String;
  updatedAt: String;
  version: number;
}

interface TalkModel extends mongoose.Model<TalkDoc> {
  build(attrs: TalkAttrs): TalkDoc;
}

const talkSchema = new mongoose.Schema(
  {
    ad: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: "Ad",
    },
    user: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    userId: String,
    owner: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    ownerId: String,
    createdAt: {
      type: String,
      default: new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: new Date().toISOString(),
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.id;
      },
    },
  }
);

talkSchema.set("versionKey", "version");
talkSchema.plugin(updateIfCurrentPlugin);

talkSchema.statics.build = (attrs: TalkAttrs) =>
  new Talk({ ...attrs, ownerId: attrs.owner.id, userId: attrs.user.id });

const Talk = mongoose.model<TalkDoc, TalkModel>("Talk", talkSchema);

export { Talk };
