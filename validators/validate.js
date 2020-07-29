const { validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.status(400);
    return res.json({
      message: "Please send required fields",
      data: null,
      error: true,
      errors: errors,
    });
  }
  next();
};
