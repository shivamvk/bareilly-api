const mongoose = require("mongoose");
const Post = require("../models/post");
const Like = require("../models/like");
const User = require("../models/user");
const Notification = require("../models/notification");
const sendNotification = require("../utils/sendNotification");

const checkReputation = async (req, res, next) => {
  const { userId } = req.body;
  const identifiedUser = await User.findById(userId);
  console.log(identifiedUser);
  if (!identifiedUser.reputation || identifiedUser.reputation < 20) {
    return res.json({
      message: "Minimum reputation required",
      data: null,
      error: true,
      errors: "Minimum 20 reputation not found",
    });
  } else {
    next();
  }
};

const addLike = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const identifiedPost = await Post.findById(postId).populate("dislikes");
  const like = new Like({
    time: new Date().toISOString(),
    user: userId,
  });
  let creator;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    console.log(identifiedPost.dislikes);
    const removedDislikes = identifiedPost.dislikes.filter((dislike) => {
      console.log(dislike.user + "  " + userId);
      return dislike.user.toString() !== userId.toString();
    });
    creator = await User.findById(identifiedPost.creator);
    console.log(removedDislikes);
    if (removedDislikes.length === identifiedPost.dislikes.length) {
      creator.reputation = creator.reputation + 2;
    } else {
      creator.reputation = creator.reputation + 3;
    }
    identifiedPost.dislikes = removedDislikes;
    await creator.save({ session: sess });
    await like.save({ session: sess });
    identifiedPost.likes.push(like);
    await identifiedPost.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    res.status(500);
    return res.json({
      message: err.message,
      data: null,
      error: true,
      error: err.message,
    });
  }
  res.json({
    message: "Like done",
    data: like.toObject({ getters: true }),
    error: false,
    errors: null,
  });
  const identifiedUser = await User.findById(userId);
  const likemessage = {
    data: {
      channelId: "post",
      channelName: "Post updates",
      channelDescription:
        "Updates about posts including upvotes, downvotes, opinions",
      type: "likePost",
      title: "New upvote",
      body: `@${identifiedUser.userName} upvoted your post. (+2 on reputation)`,
      image: identifiedUser.image,
      postId: identifiedPost.id,
    },
    tokens: creator.fcmRegistrationTokens,
  };
  sendNotification(likemessage);
  const notification = new Notification({
    title: likemessage.data.title,
    body: likemessage.data.body,
    image: likemessage.data.image,
    postId: identifiedPost.id,
    time: new Date().toISOString(),
  });
  await notification.save();
  creator.notifications.push(notification);
  await creator.save();
};

const addDislike = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const identifiedPost = await Post.findById(postId).populate("likes");
  const dislike = new Like({
    time: new Date().toISOString(),
    user: userId,
  });
  let creator;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    const removedLikes = identifiedPost.likes.filter((like) => {
      console.log(like + " " + like.user + "  " + userId);
      return like.user.toString() !== userId.toString();
    });
    creator = await User.findById(identifiedPost.creator);
    console.log(removedLikes);
    if (removedLikes.length === identifiedPost.likes.length) {
      creator.reputation = creator.reputation - 1;
    } else {
      creator.reputation = creator.reputation - 3;
    }
    identifiedPost.likes = removedLikes;
    await creator.save({ session: sess });
    await dislike.save({ session: sess });
    identifiedPost.dislikes.push(dislike);
    await identifiedPost.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    res.status(500);
    return res.json({
      message: err.message,
      data: null,
      error: true,
      error: err.message,
    });
  }
  res.json({
    message: "Dislike done",
    data: dislike.toObject({ getters: true }),
    error: false,
    errors: null,
  });
  const identifiedUser = await User.findById(userId);
  const likemessage = {
    data: {
      channelId: "post",
      channelName: "Post updates",
      channelDescription:
        "Updates about posts including upvotes, downvotes, opinions",
      type: "dislikePost",
      title: "New downvote",
      body: `@${identifiedUser.userName} downvoted your post. (-1 on reputation)`,
      image: identifiedUser.image,
      postId: identifiedPost.id,
    },
    tokens: creator.fcmRegistrationTokens,
  };
  sendNotification(likemessage);
  const notification = new Notification({
    title: likemessage.data.title,
    body: likemessage.data.body,
    image: likemessage.data.image,
    postId: identifiedPost.id,
    time: new Date().toISOString(),
  });
  await notification.save();
  creator.notifications.push(notification);
  await creator.save();
};

const removeLike = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const identifiedPost = await Post.findById(postId).populate("likes");
    const sess = await mongoose.startSession();
    sess.startTransaction();
    const creator = await User.findById(identifiedPost.creator);
    creator.reputation = creator.reputation - 2;
    await creator.save({ session: sess });
    console.log(userId);
    console.log(postId);
    const likeRemovedArray = identifiedPost.likes.filter((like) => {
      console.log(like.user.toString() !== userId.toString());
      return like.user.toString() !== userId.toString();
    });
    console.log(likeRemovedArray);
    identifiedPost.likes = likeRemovedArray;
    await identifiedPost.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    res.status(500);
    return res.json({
      message: err.message,
      data: null,
      error: true,
      error: err.message,
    });
  }
  res.json({
    message: "like removed",
    data: null,
    error: false,
    error: null,
  });
};

const removeDislike = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const identifiedPost = await Post.findById(postId)
      .populate("likes")
      .populate("dislikes");
    const sess = await mongoose.startSession();
    sess.startTransaction();
    const creator = await User.findById(identifiedPost.creator);
    creator.reputation = creator.reputation + 1;
    await creator.save({ session: sess });
    console.log(userId);
    console.log(postId);
    console.log(identifiedPost.dislikes);
    const dislikeRemovedArray = identifiedPost.dislikes.filter((dislike) => {
      console.log(dislike.user + "   " + userId);
      return dislike.user.toString() !== userId.toString();
    });
    console.log(dislikeRemovedArray);
    identifiedPost.dislikes = dislikeRemovedArray;
    await identifiedPost.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    res.status(500);
    return res.json({
      message: err.message,
      data: null,
      error: true,
      error: err.message,
    });
  }
  res.json({
    message: "dislike removed",
    data: null,
    error: false,
    error: null,
  });
};

exports.checkReputation = checkReputation;
exports.addLike = addLike;
exports.removeLike = removeLike;
exports.addDislike = addDislike;
exports.removeDislike = removeDislike;
