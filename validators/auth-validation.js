const { body } = require('express-validator');

const sendOTPValidationRules = () => {
    return [
        body("phone").notEmpty().isLength(10)
    ];
};

const verifyOTPValidationRules = () => {
    return [
        body("fcmToken").notEmpty(),
        body("phone").notEmpty().isLength(10),
        body("otp").notEmpty()
    ];
};

const logoutValidationRules = () => {
    return [
        body("fcmToken").notEmpty(),
        body("userId").notEmpty()
    ];
};

module.exports = {
    sendOTPValidationRules,
    verifyOTPValidationRules,
    logoutValidationRules
}