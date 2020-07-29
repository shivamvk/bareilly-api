const mongoose = require("mongoose");
const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const extractTagsAndMentions = require("../utils/extractTagsAndMentions");
const sendNotification = require("../utils/sendNotification");

const getAllcomments = async (req, res, next) => {
  const { postId } = req.params;
  let comments;
  try {
    comments = await Comment.find({ post: postId })
      .populate([
        {
          path: "user",
          model: "User",
          select: "id userName fullName image",
        },
      ])
      .populate([
        {
          path: "post",
          model: "Post",
          select: "id",
        },
      ])
      .populate([
        {
          path: "tags",
          model: "Tag",
        },
      ]);
  } catch (err) {
    res.status(500);
    res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }
  res.json({
    message: "All comments",
    data: comments.map((comment) => {
      return comment.toObject({ getters: true });
    }),
    error: false,
    errors: null,
  });
};

const saveComment = async (req, res, next) => {
  const { postId } = req.params;
  const { userId, text } = req.body;
  const identifiedPost = await Post.findById(postId);
  const identifiedUser = await User.findById(userId);
  if (!identifiedUser.reputation || identifiedUser.reputation < 20) {
    res.status(400);
    return res.json({
      message: "Minimum 20 repuation is required to do this",
      data: null,
      error: true,
      error: "Bad request",
    });
  }
  let comment;
  try {
    const { tags, mentions } = await extractTagsAndMentions(text);
    comment = new Comment({
      user: identifiedUser.id,
      post: identifiedPost.id,
      mentions: mentions,
      tags: tags,
      text: text,
      time: new Date().toISOString(),
    });
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await comment.save({ session: sess });
    if (identifiedPost.comments.length === 0) {
      identifiedUser.reputation = identifiedUser.reputation + 2;
    }
    await identifiedUser.save({ session: sess });
    identifiedPost.comments.push(comment);
    await identifiedPost.save({ session: sess });
    await sess.commitTransaction();
    const tokens = [];
    const users = [];
    console.log(mentions);
    for (i = 0; i < mentions.length; i++) {
      console.log(mentions[i]);
      const user = await User.findById(mentions[i]);
      console.log(user);
      for (j = 0; j < user.fcmRegistrationTokens.length; j++) {
        tokens.push(user.fcmRegistrationTokens[i]);
      }
    }
    const message = {
      data: {
        channelId: "post",
        channelName: "Post updates",
        channelDescription:
          "Updates about posts including upvotes, downvotes, opinions",
        type: "commentMention",
        title: "New mention",
        body: `@${identifiedUser.userName} mentioned you in an opinion`,
        image: identifiedUser.image,
        postImage: identifiedPost.images[0] || "",
        postId: identifiedPost.id
      },
      tokens: tokens,
    };
    console.log(message);
    sendNotification(message);
    const notification = new Notification({
      title: message.data.title,
      body: message.data.body,
      image: message.data.image,
      postId: newPost.id,
      time: new Date().toISOString(),
    });
    await notification.save();
    for (i = 0; i < users.length; i++) {
      users[i].notifications.push(notification);
      await users[i].save();
    }
  } catch (err) {
    res.status(500);
    return res.json({
      message: `DB error: ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }
  comment = await Comment.findById(comment.id)
    .populate([
      {
        path: "user",
        model: "User",
        select: "id userName fullName image",
      },
    ])
    .populate([
      {
        path: "post",
        model: "Post",
        select: "id",
      },
    ]);
  res.json({
    message: "Comment saved",
    data: comment.toObject({ getters: true }),
    error: false,
    errors: null,
  });
};

exports.getAllcomments = getAllcomments;
exports.saveComment = saveComment;
