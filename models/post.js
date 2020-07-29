const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  active: {
    type: Boolean,
    default: true,
  },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  time: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
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
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Like",
    },
  ],
  dislikes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Like",
    },
  ],
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

postSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Post", postSchema);
