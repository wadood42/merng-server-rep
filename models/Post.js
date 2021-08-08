const { model, Schema } = require("mongoose");
const User = require("./User");

const postSchema = new Schema(
  {
    body: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    comments: [
      {
        body: String,
        author: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: String,
      },
    ],
    likes: [
      {
        author: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
