const User = require("../models/user");
const uploadImageToStorage = require("../utils/uploadFileToGC");
const { populate } = require("../models/user");

const getAccountById = async (req, res, next) => {
  const { userId } = req.params;
  let identifiedUser;
  try {
    identifiedUser = await User.findById(userId);
  } catch (err) {
    res.status(500);
    return res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }
  res.json({
    message: "User account details",
    data: {
      id: identifiedUser.id,
      fullName: identifiedUser.fullName,
      userName: identifiedUser.userName,
      phone: identifiedUser.phone,
      bio: identifiedUser.bio,
      image: identifiedUser.image,
      dob: identifiedUser.dob,
      joiningDate: identifiedUser.joiningDate,
    },
    error: false,
    errors: null,
  });
};

const upsertAccountDetails = async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, userName, bio, dob, gender } = req.body;
  let identifiedUser;
  console.log(req.body);
  console.log(req.file);
  try {
    identifiedUser = await User.findById(userId);
  } catch (err) {
    res.status(500);
    return res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }
  if (req.file != null) {
    uploadImageToStorage(req.file)
      .then(async (url) => {
        try {
          identifiedUser.image = url;
          identifiedUser.fullName = fullName || null;
          identifiedUser.userName = userName;
          identifiedUser.bio = bio || null;
          identifiedUser.dob = dob || null;
          identifiedUser.gender = gender || null;
          await identifiedUser.save();
          res.json({
            message: "User account details",
            data: {
              id: identifiedUser.id,
              fullName: identifiedUser.fullName,
              userName: identifiedUser.userName,
              image: identifiedUser.image,
              phone: identifiedUser.phone,
              bio: identifiedUser.bio,
              dob: identifiedUser.dob,
              gender: identifiedUser.gender,
              joiningDate: identifiedUser.joiningDate,
            },
            error: false,
            errors: null,
          });
        } catch (err) {
          console.log(err);
          res.status(500);
          return res.json({
            message: `DB error: ${err.message}`,
            data: null,
            error: true,
            errors: err.message,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500);
        return res.json({
          message: `DB error: ${err.message}`,
          data: null,
          error: true,
          errors: err.message,
        });
      });
  } else {
    try {
      identifiedUser.fullName = fullName;
      identifiedUser.userName = userName;
      identifiedUser.bio = bio;
      identifiedUser.dob = dob;
      identifiedUser.gender = gender;
      await identifiedUser.save();
    } catch (err) {
      res.status(500);
      return res.json({
        message: `DB error: ${err.message}`,
        data: null,
        error: true,
        errors: err.message,
      });
    }
    res.json({
      message: "User account details",
      data: {
        id: identifiedUser.id,
        fullName: identifiedUser.fullName,
        userName: identifiedUser.userName,
        image: identifiedUser.image,
        phone: identifiedUser.phone,
        bio: identifiedUser.bio,
        dob: identifiedUser.dob,
        gender: identifiedUser.gender,
        joiningDate: identifiedUser.joiningDate,
      },
      error: false,
      errors: null,
    });
  }
};

const getProfileById = async (req, res, next) => {
  const { userId } = req.params;
  let identifiedUser;
  try {
    identifiedUser = await User.findById(userId).populate([
      {
        path: "posts",
        model: "Post",
        populate: [
          {
            path: "creator",
            model: "User",
            select: "image fullName userName"
          },
          {
            path: "likes",
            model: "Like"
          },
          {
            path: "dislikes",
            model: "Like"
          }
        ],
      },
    ]);
  } catch (err) {
    res.status(500);
    return res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }
  res.json({
    message: "User profile",
    data: identifiedUser.toObject({ getters: true }),
    error: false,
    errors: null,
  });
};

const getNotificationsById = async (req, res, next) => {
  const { userId } = req.params;
  const identifiedUser = await User.findById(userId).populate("notifications");
  res.json({
    message: "All notifications",
    data: identifiedUser.notifications,
    error: false,
    errors: null,
  });
};

exports.getAccountById = getAccountById;
exports.upsertAccountDetails = upsertAccountDetails;
exports.getProfileById = getProfileById;
exports.getNotificationsById = getNotificationsById;
