import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { Password } from "../helpers";

interface UserAttrs {
  email: string;
  password: string;
  userName: string;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  userName: string;
  version: number;
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

userSchema.set("versionKey", "version");
userSchema.plugin(updateIfCurrentPlugin);

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
