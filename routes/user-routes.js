const router = require('express').Router();
const userController = require("../controllers/user-controller");
const { validate } = require("../validators/validate");
const checkAuth = require("../middleware/check-auth");
const authorize = require("../middleware/authorize"); 
const fileUpload = require('../middleware/file-upload');
const { editAccountValidationRules } = require('../validators/user-validation');

router.use(checkAuth);

router.get(
    "/account/:userId",
    authorize,
    userController.getAccountById
);

router.patch(
    "/account/:userId",
    authorize,
    fileUpload.single("image"),
    editAccountValidationRules(),
    validate,
    userController.upsertAccountDetails
)

router.get(
    "/profile/:userId",
    authorize,
    userController.getProfileById
)

router.get(
    "/profile/:userId/notifications",
    authorize,
    userController.getNotificationsById
);

module.exports = router;