import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
  id: string;
  email: string;
  userName: string;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  userName: string;
  version: number;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
  findByEvent(event: { id: string; version: number }): Promise<UserDoc | null>;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      // make userName unique everywhere
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userSchema.set("versionKey", "version");
userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (userAttrs: UserAttrs) => {
  const { id, ...attrs } = userAttrs;
  return new User({
    _id: id,
    ...attrs,
  });
};

userSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return User.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
