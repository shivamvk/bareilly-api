const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    postId: {
        type: mongoose.Types.ObjectId,
        ref: "Post"
    },
    time: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Notification", notificationSchema);


