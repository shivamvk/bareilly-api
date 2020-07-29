const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const tagSchema = new Schema({
  count: {
    type: Number,
    required: true,
    default: 1,
  },
  text: {
    type: String,
    required: true,
    unique: true,
  },
});

tagSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Tag", tagSchema);
