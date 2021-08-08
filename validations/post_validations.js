const validator = require("validator");

module.exports.validatePost = (body) => {
  const errors = {};

  if (validator.isEmpty(body)) {
    errors.body = "post must have a body";
  }

  return {
    isValid: () => Object.keys(errors).length === 0,
    errors,
  };
};
