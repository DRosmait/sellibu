import mongoose from "mongoose";
import { AdStatus } from "@sellibu-proj/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { UserDoc } from "./user";

interface AdAttrs {
  title: string;
  price: number;
  user: UserDoc;
  status: AdStatus;
}

export interface AdDoc extends mongoose.Document {
  title: string;
  price: number;
  user: UserDoc;
  userId: string;
  status: AdStatus;
  version: number;
}

interface AdModel extends mongoose.Model<AdDoc> {
  build(attrs: AdAttrs): AdDoc;
}

const adSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
    },
    price: {
      required: true,
      type: Number,
    },
    user: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: String,
    },
    status: {
      required: true,
      type: String,
      enum: Object.values(AdStatus),
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

adSchema.set("versionKey", "version");
adSchema.plugin(updateIfCurrentPlugin);

adSchema.statics.build = (attrs: AdAttrs) =>
  new Ad({ ...attrs, userId: attrs.user.id });

const Ad = mongoose.model<AdDoc, AdModel>("Ad", adSchema);

export { Ad };
