const validator = require("validator");

module.exports.validateLogin = ({ username, password }) => {
  const errors = {};

  if (validator.isEmpty(username)) {
    errors.username = "Username is required";
  }
  if (validator.isEmpty(password)) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: () => Object.keys(errors).length === 0,
  };
};
