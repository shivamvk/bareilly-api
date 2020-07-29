const User = require("../models/user");
const jwt = require("jsonwebtoken");
const user = require("../models/user");

const sendOTP = async (req, res, next) => {
  //send otp using msg91 later
  res.json({
    message: "OTP sent successfully",
    data: null,
    error: false,
    errors: null,
  });
};

const resendOTP = async (req, res, next) => {
  //resend otp using msg91 later
  res.json({
    message: "OTP sent successfully",
    data: null,
    error: false,
    errors: null,
  });
};

const verifyOTP = async (req, res, next) => {
  const { fcmToken, phone, otp } = req.body;
  //verify otp by sending a request to msg91 server
  //if verified continue otherwise return an error here
  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ phone: phone });
  } catch (err) {
    res.status(500);
    res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }
  if (!identifiedUser) {
    identifiedUser = new User({
      phone: phone,
      joiningDate: new Date().toISOString(),
    });
    try {
      await identifiedUser.save();
    } catch (err) {
      res.status(500);
      res.json({
        message: `DB error: ${err.message}`,
        data: null,
        error: true,
        errors: err.message,
      });
    }
  }
  try {
    identifiedUser.fcmRegistrationTokens.push(fcmToken);
    await identifiedUser.save();
  } catch (err) {
    res.status(500);
    res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }

  const token = jwt.sign(
    {
      id: identifiedUser.id,
      phone: identifiedUser.phone,
    },
    process.env.JWT_SECRET_KEY
  );
  res.json({
    message: "OTP verfied",
    data: {
      token: token,
      userId: identifiedUser.id,
      phone: identifiedUser.phone,
    },
    error: false,
    errors: null,
  });
};

const logout = async (req, res, next) => {
  const { userId, fcmToken } = req.body;
  if (userId !== req.tokenData.id) {
    res.status(401);
    return res.json({
      message: "Unauthorized",
      data: null,
      error: true,
      errors: "You aren;t authorised to do this!",
    });
  }
  await User.update(
    { _id: userId },
    {
      $pull: {
        fcmRegistrationTokens: fcmToken,
      },
    },
    { multi: true }
  );
  res.json({
    message: "Logged out",
    data: null,
    error: false,
    errors: null,
  });
};

exports.sendOTP = sendOTP;
exports.resendOTP = resendOTP;
exports.verifyOTP = verifyOTP;
exports.logout = logout;
