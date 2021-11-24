import mongoose from "mongoose";

import { Password } from "../helpers";

interface UserAttrs {
  email: string;
  password: string;
  userName: string;
  phone?: string;
  location?: {
    lat?: number;
    long?: number;
    radius?: number;
  };
  address?: {
    city?: string;
    street?: string;
    country?: string;
    countryCode?: string;
  };
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  userName: string;
  phone?: string;
  location?: {
    lat?: number;
    long?: number;
    radius?: number;
  };
  address?: {
    city?: string;
    street?: string;
    country?: string;
    countryCode?: string;
  };
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    phone: String,
    location: {
      lat: Number,
      long: Number,
      radius: {
        type: Number,
        default: 1 * 1000, // 1km
      },
    },
    address: {
      city: String,
      street: String,
      country: String,
      countryCode: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.hoHash(this.get("password"));
    this.set("password", hashed);
  }

  done();
});

userSchema.statics.build = (userAttrs: UserAttrs) => {
  return new User(userAttrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
