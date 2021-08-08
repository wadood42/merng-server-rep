const { model, Schema } = require("mongoose");
const Post = require("./Post");
const userSchema = new Schema(
  {
    username: String,
    password: String,
    email: String,
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    followers: [
      {
        followerId: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: String,
      },
    ],
    followings: [
      {
        followingId: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
