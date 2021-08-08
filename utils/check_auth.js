const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    console.log("token", token);
    if (token) {
      try {
        return jwt.verify(token, process.env.SECRET_KEY);
        // console.log("user ", user);
        // return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token is invalid");
  }
  throw new Error("You must be logged in");
};
