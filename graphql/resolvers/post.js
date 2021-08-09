const { AuthenticationError, UserInputError } = require("apollo-server");
const Post = require("../../models/Post");
const User = require("../../models/User");
const checkAuth = require("../../utils/check_auth");
const { validatePost } = require("../../validations/post_validations");
module.exports = {
  Query: {
    async getPosts(parent, args, context) {
      const user = checkAuth(context);

      if (user) {
        console.log("user from getposts resolvers", user);
        try {
          // const posts = await Post.find({ author: user.id }).sort({
          //   createdAt: -1,
          const posts = await Post.find().populate("author").sort({
            createdAt: -1,
          });
          console.log("found posts", posts);
          return posts;
        } catch (err) {
          throw new Error(err);
        }
      } else {
        throw new AuthenticationError();
      }
    },

    async getPost(parent, args) {
      console.log("getting single post");
      try {
        const post = await Post.findById(args.postId).populate({
          path: "comments",
          populate: { path: "author" },
        });
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createPost(parent, { body }, context) {
      const user = checkAuth(context);

      console.log("creating post", user);

      if (user) {
        const { isValid, errors } = validatePost(body);
        if (isValid()) {
          const newPost = new Post({
            body,
            author: user.id,
          });

          const foundUser = await User.findById(user.id);

          const savedPost = await newPost.save();
          foundUser.posts.push(savedPost._id);
          await foundUser.save();
          return await Post.findById(savedPost._id).populate("author");
        } else {
          throw new UserInputError(errors.body);
        }
      } else {
        throw new AuthenticationError("must be logged in first");
      }
    },

    async deletePost(parent, args, context) {
      const user = checkAuth(context);
      console.log("user form deletingpost", user);

      try {
        const post = await Post.findById(args.postId);
        console.log(
          "post to be deleted",
          JSON.stringify(post.author) === user.id
        );

        if (user.id === post.author.toString()) {
          console.log("yay im in");
          await post.delete();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error("sorry");
      }
    },
    likePost: async (prarent, args, context) => {
      const user = checkAuth(context);
      console.log("liking post", user);

      if (user) {
        const post = await Post.findById(args.postId);
        if (post) {
          if (post.likes.find((like) => like.author.toString() === user.id)) {
            // post already been liked, unlike it
            post.likes = post.likes.filter(
              (like) => like.author.toString() !== user.id
            );
          } else {
            post.likes.push({
              author: user.id,
              createdAt: new Date().toISOString(),
            });
          }
          await post.save();
          return post;
        } else {
          throw new UserInputError("post not found");
        }
      } else {
        throw new AuthenticationError("you log in first");
      }
    },
  },
};
