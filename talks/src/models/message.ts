import mongoose from "mongoose";

interface MessageAttrs {
  content: string;
  userId: string;
  talkId: string;
}

interface MessageDoc extends mongoose.Document {
  content: string;
  userId: string;
  talkId: string;
  createdAt: string;
}

interface MessageModel extends mongoose.Model<MessageDoc> {
  build(attrs: MessageAttrs): MessageDoc;
}

const messageSchema = new mongoose.Schema(
  {
    content: {
      required: true,
      type: String,
    },
    createdAt: {
      type: String,
      default: new Date().toISOString(),
    },
    userId: {
      required: true,
      type: String,
    },
    talkId: {
      required: true,
      type: String,
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

messageSchema.statics.build = (attrs: MessageAttrs) => new Message(attrs);

const Message = mongoose.model<MessageDoc, MessageModel>(
  "Message",
  messageSchema
);

export { Message };
