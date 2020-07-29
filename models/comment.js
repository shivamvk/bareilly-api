const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mentions: [
    {
      type: String,
    },
  ],
  tags: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Tag",
    },
  ],
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("comment", commentSchema);
