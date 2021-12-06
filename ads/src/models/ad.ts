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

export interface AdDoc extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  user: UserDoc;
  userId: string;
  status: AdStatus;
  createdAt: string;
  expiresAt: string;
  version: number;
}

interface AdModel extends mongoose.Model<AdDoc> {
  build(attrs: AdAttrs): AdDoc;
}

function getMonthsInFuture(monthCount: number, date = new Date()) {
  date.setMonth(date.getMonth() + monthCount);
  return date.toISOString();
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
      default: AdStatus.Open,
    },
    createdAt: {
      type: String,
      default: new Date().toISOString(),
    },
    expiresAt: {
      type: String,
      default: new Date().toISOString(),
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

adSchema.pre("save", function (done) {
  this.set("userId", this.user.id);
  this.set("expiresAt", getMonthsInFuture(1, new Date(this.createdAt)));

  done();
});

adSchema.statics.build = (attrs: AdAttrs) => new Ad(attrs);

const Ad = mongoose.model<AdDoc, AdModel>("Ad", adSchema);

export { Ad };
