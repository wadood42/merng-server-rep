const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkAuth = require("../../utils/check_auth");
const { UserInputError, AuthenticationError } = require("apollo-server");
const {
  validateRegisterInput,
} = require("../../validations/registeration_validations");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );
}
const { validateLogin } = require("../../validations/login_validation");

module.exports = {
  Query: {
    async getUser(parent, args, context) {
      console.log("gettting single user", args);

      const user = await User.findById(args.userId).populate({
        path: "posts",
        populate: { path: "author" },
      });

      console.log("yaya found user", user);
      return user;
    },
    async getUsers(parent, args, context) {
      console.log("getting all userssssss");
      const user = checkAuth(context);

      if (user) {
        const users = await User.find();
        console.log("getting users", users);
        return users;
      } else {
        throw new AuthenticationError("log in first");
      }
    },
  },
  Mutation: {
    async follow(_, args, context) {
      const user = checkAuth(context);

      if (user) {
        console.log("user for following", args);
        const followingUser = await User.findById(args.followingId);
        console.log("followingUser", followingUser);
        const followerUser = await User.findById(user.id);

        if (!followingUser.followers.includes(user.id)) {
          followingUser.followers.push({
            followerId: followerUser._id,
            createdAt: new Date().toISOString(),
          });

          followerUser.followings.push({
            followingId: followingUser._id,
            createdAt: new Date().toISOString(),
          });

          console.log("user", followerUser);
          await followingUser.save();
          await followerUser.save();
        }

        return followingUser;
      } else {
        throw new AuthenticationError("log in first");
      }
    },

    async unfollow(parent, args, context) {
      const user = checkAuth(context);
      console.log("args", args);

      const follower = await User.findById(user.id);
      const following = await User.findById(args.unfollowingId);

      await follower.updateOne({
        $pull: { followings: { followingId: following._id } },
      });

      await following.updateOne({
        $pull: {
          followers: { followerId: follower._id },
        },
      });

      console.log("follower", follower);
      console.log("following", following);

      // await follower.save();
      // await following.save();

      return following;
    },

    async login(_, args) {
      const { username, password } = args;
      const { isValid, errors } = validateLogin(args);

      if (!isValid()) {
        throw new UserInputError("Sorry bud", {
          errors,
        });
      }

      const user = await User.findOne({ username: username });

      if (!user) {
        errors.general = "user not found";
        throw new UserInputError("Sorry", { errors });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "wrong credentials";
        throw new UserInputError("wrong credentials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user.id,
        token,
      };
    },
    async register(parent, args, context, info) {
      const { isValid, errors } = validateRegisterInput(args);

      if (!isValid()) {
        throw new UserInputError("sorry", {
          errors,
        });
      }
      const { username, email, password, confirmedPassword } = args;

      const user = await User.findOne({ username: username });
      if (user) {
        throw new UserInputError("username is taken", {
          errors: {
            username: "this username is taken",
          },
        });
        ``;
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        email,
        username,
        password: hashedPassword,
      });

      const result = await newUser.save();
      const token = jwt.sign(
        {
          id: result.id,
          email: result.email,
          username: result.username,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      return {
        ...result._doc,
        id: result.id,
        token,
      };
    },
  },
};
