const validator = require("validator");

module.exports.validateComment = ({ body, postId }) => {
  const errors = {};

  if (body.isEmpty) {
    errors.body = "comments cant be empty!";
  }

  return {
    errors,
    isValid: () => Object.keys(errors).length === 0,
  };
};
