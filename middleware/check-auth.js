const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.header("Authorization").split(" ")[1];
    if (!token) {
      return res.json({
        message: "Invalid token",
        data: null,
        error: true,
        errors: "Authorization token required"
      });
    }
    const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.tokenData = { id: data.id, phone: data.phone };
    next();
  } catch (err) {
    console.log(err);
    return res.json({
      message: `Authorization token error ${err.message}`,
      data: null,
      error: true,
      errors: "Invalid token"
    });
  }
};
