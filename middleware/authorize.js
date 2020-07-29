const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const { userId } = req.params;
  if (userId == null || userId === "" || !ObjectId.isValid(userId)) {
    res.status(400);
    return res.json({
      message: "Please provide a valid user id",
      data: null,
      error: true,
      errors: "Invalid user id",
    });
  }
  let identifiedUser;
  try {
    identifiedUser = await User.findById(userId).populate("posts");
  } catch (err) {
    return res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }
  if (!identifiedUser) {
    res.status(400);
    return res.json({
      message: "user id not registered",
      data: null,
      error: true,
      errors: "invalid user id",
    });
  }
  if (req.tokenData.id !== userId) {
    res.status(401);
    return res.json({
      message: "You are not authorized to see this content",
      data: null,
      error: true,
      errors: "Unauthorized",
    });
  }
  req.identifiedUser = identifiedUser.toObject({ getters: true });
  next();
};
