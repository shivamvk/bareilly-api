const { body } = require("express-validator");

const editAccountValidationRules = () => {
  return [body("userName").notEmpty()];
};

module.exports = {
  editAccountValidationRules,
};
