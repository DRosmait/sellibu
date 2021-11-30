import mongoose from "mongoose";
import { AdStatus } from "@sellibu-proj/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { UserDoc } from "./user";

interface AdAttrs {
  title: string;
  description: string;
  // TODO: editor for description
  price: number;
  // TODO: images
  user: UserDoc;
  status?: AdStatus;
}

interface AdDoc extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  user: UserDoc;
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
    description: {
      required: true,
      type: String,
    },
    price: {
      required: true,
      type: String,
    },
    status: {
      required: true,
      type: String,
      enum: Object.values(AdStatus),
      default: AdStatus.Open,
    },
    user: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: "User",
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

adSchema.statics.build = (attrs: AdAttrs) => {
  return new Ad(attrs);
};

const Ad = mongoose.model<AdDoc, AdModel>("Ad", adSchema);

export { Ad };
