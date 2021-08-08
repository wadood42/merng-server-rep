const validator = require("validator");

module.exports.validateRegisterInput = ({
  username,
  password,
  email,
  confirmedPassword,
}) => {
  const errors = {};
  if (validator.isEmpty(email)) {
    errors.username = "Email is required.";
  }
  if (validator.isEmpty(username)) {
    errors.username = "Username is required.";
  }
  if (validator.isEmpty(password)) {
    errors.password = "Password is required.";
  }
  if (validator.isEmpty(confirmedPassword)) {
    errors.confirmedPassword = "Confirm password is required.";
  }
  if (!validator.isEmail(email)) {
    errors.email = "Email is not valid.";
  }
  if (!validator.equals(password, confirmedPassword)) {
    errors.confirmedPassword = "Passwords dont match.";
  }

  return {
    errors,
    isValid: () => Object.keys(errors).length === 0,
  };
};
