const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
    type: String,
  },
  userName: {
    type: String,
  },
  image: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
  },
  dob: {
    type: String, //ISOString
  },
  gender: {
    type: String,
    enum: ["", null, "Male", "Female", "Others", "Prefer not to say"],
  },
  joiningDate: {
    type: String, //ISOString
  },
  reputation: {
    type: Number,
    default: 0
  },
  posts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
  queries: [
    {
      type: String,
    },
  ],
  answers: [
    {
      type: String,
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  notifications: [{
    type: mongoose.Types.ObjectId,
    ref: "Notification"
  }],
  fcmRegistrationTokens: [
    {
      type: String,
    },
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
