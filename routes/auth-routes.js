const router = require("express").Router();
const authController = require("../controllers/auth-controller");
const {
  sendOTPValidationRules,
  verifyOTPValidationRules,
  logoutValidationRules,
} = require("../validators/auth-validation");
const { validate } = require("../validators/validate");
const checkAuth = require("../middleware/check-auth");

router.post(
  "/sendOTP",
  sendOTPValidationRules(),
  validate,
  authController.sendOTP
);

router.post(
  "/resendOTP",
  sendOTPValidationRules(),
  validate,
  authController.resendOTP
);

router.post(
  "/verifyOTP",
  verifyOTPValidationRules(),
  validate,
  authController.verifyOTP
);

router.use(checkAuth);

router.post(
  "/logout",
  logoutValidationRules(),
  validate,
  authController.logout
)

module.exports = router;
