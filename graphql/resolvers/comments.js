const Post = require("../../models/Post");
const { AuthenticationError, UserInputError } = require("apollo-server");
const checkAuth = require("../../utils/check_auth");
const { validateComment } = require("../../validations/comment_validations");

module.exports = {
  Mutation: {
    createComment: async (parent, args, context) => {
      const user = checkAuth(context);

      const { isValid, errors } = validateComment(args);

      if (user) {
        if (isValid()) {
          const post = await Post.findById(args.postId);
          post.comments.unshift({
            body: args.body,
            username: user.username,
            createdAt: new Date().toISOString(),
          });
          await post.save();
          return post;
        } else {
          throw new UserInputError(errors);
        }
      } else {
        throw new AuthenticationError("you must login first");
      }
    },

    deleteComment: async (parent, args, context) => {
      const user = checkAuth(context);

      if (user) {
        const post = await Post.findById(args.postId);
        if (post) {
          const commentIndex = post.comments.findIndex(
            (c) => c.id === args.commentId
          );

          if (post.comments[commentIndex].username === user.username) {
            post.comments.splice(commentIndex, 1);
            await post.save();

            return post;
          } else {
            throw new UserInputError("you can only delete your comments");
          }
        } else {
          throw new UserInputError("post not found");
        }
      } else {
        throw new AuthenticationError();
      }
    },
  },
};
