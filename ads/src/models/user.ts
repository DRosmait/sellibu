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
  visible: {
    email: boolean;
    phone: boolean;
    location: boolean;
    address: boolean;
  };
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
    },
    phone: String,
    location: {
      lat: Number,
      long: Number,
      radius: {
        type: Number,
        default: 1 * 1000, // 1km
        min: 500, // 0,5km
        max: 10 * 1000, // 10km
      },
    },
    address: {
      city: String,
      street: String,
      country: String,
      countryCode: String,
    },
    visible: {
      email: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: Boolean,
        default: false,
      },
      location: {
        type: Boolean,
        default: false,
      },
      address: {
        type: Boolean,
        default: false,
      },
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
