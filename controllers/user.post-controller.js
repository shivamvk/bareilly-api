const Post = require("../models/post");
const extractTagsAndMentions = require("../utils/extractTagsAndMentions");
const uploadImageToStorage = require("../utils/uploadFileToGC");
const mongoose = require("mongoose");
const User = require("../models/user");
const sendNotification = require("../utils/sendNotification");
const { v4: uuid } = require("uuid");

const savePost = async (req, res, next) => {
  const { text } = req.body;
  let tagsAndMentions;
  try {
    tagsAndMentions = await extractTagsAndMentions(text);
  } catch (err) {
    res.status(500);
    return res.json({
      message: `Tag or mention error ${err.message}`,
      data: null,
      error: true,
      errors: err.message,
    });
  }

  let newPost;
  console.log(req.body);
  console.log(req.file);
  if (req.file != null) {
    uploadImageToStorage(req.file)
      .then(async (url) => {
        newPost = new Post({
          creator: req.identifiedUser.id,
          time: new Date().toISOString(),
          text: text,
          tags: tagsAndMentions.tags,
          mentions: tagsAndMentions.mentions,
          images: [url],
        });
        try {
          const sess = await mongoose.startSession();
          sess.startTransaction();
          await newPost.save({ session: sess });
          let identifiedUser = await User.findById(req.params.userId);
          identifiedUser.posts.push(newPost);
          if (identifiedUser.posts.length === 1) {
            identifiedUser.reputation = 20;
          } else {
            identifiedUser.reputation = identifiedUser.reputation + 15;
          }
          await identifiedUser.save({ session: sess });
          await sess.commitTransaction();
          const tokens = [];
          const users = [];
          console.log(tagsAndMentions.mentions);
          for (i = 0; i < tagsAndMentions.mentions.length; i++) {
            console.log(tagsAndMentions.mentions[i]);
            const user = await User.findById(tagsAndMentions.mentions[i]);
            console.log(user);
            users.push(user);
            for (j = 0; j < user.fcmRegistrationTokens.length; j++) {
              tokens.push(user.fcmRegistrationTokens[i]);
            }
          }
          const message = {
            data: {
              id: uuid(),
              channelId: "post",
              channelName: "Post updates",
              channelDescription:
                "Updates about posts including upvotes, downvotes, opinions",
              type: "postMention",
              title: "New mention",
              body: `@${identifiedUser.userName} mentioned you in a post`,
              image: identifiedUser.image,
              postImage: url,
              postId: newPost.id,
            },
            tokens: tokens,
          };
          sendNotification(message);
          res.json({
            message: "Post created successfully",
            data: newPost.toObject({ getters: true }),
            error: false,
            errors: null,
          });
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
          message: err.message,
          data: null,
          error: true,
          errors: false,
        });
      });
  } else {
    newPost = new Post({
      creator: req.identifiedUser.id,
      time: new Date().toISOString(),
      text: text,
      tags: tagsAndMentions.tags,
      mentions: tagsAndMentions.mentions,
    });
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await newPost.save({ session: sess });
      let identifiedUser = await User.findById(req.params.userId);
      identifiedUser.posts.push(newPost);
      if (identifiedUser.posts.length === 1) {
        identifiedUser.reputation = 20;
      } else {
        identifiedUser.reputation = identifiedUser.reputation + 15;
      }
      await identifiedUser.save({ session: sess });
      await sess.commitTransaction();
      const tokens = [];
      const users = [];
      console.log(tagsAndMentions.mentions);
      for (i = 0; i < tagsAndMentions.mentions.length; i++) {
        console.log(tagsAndMentions.mentions[i]);
        const user = await User.findById(tagsAndMentions.mentions[i]);
        users.push(user);
        console.log(user);
        for (j = 0; j < user.fcmRegistrationTokens.length; j++) {
          tokens.push(user.fcmRegistrationTokens[i]);
        }
      }
      const message = {
        data: {
          id: uuid(),
          channelId: "post",
          channelName: "Post updates",
          channelDescription:
            "Updates about posts including upvotes, downvotes, opinions",
          type: "postMention",
          title: "New mention",
          body: `@${identifiedUser.userName} mentioned you in a post`,
          image: identifiedUser.image,
          postId: newPost.id,
        },
        tokens: tokens,
      };
      sendNotification(message);
      res.json({
        message: "Post created successfully",
        data: newPost.toObject({ getters: true }),
        error: false,
        errors: null,
      });
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
      console.log(err);
      res.status(500);
      return res.json({
        message: `DB error: ${err.message}`,
        data: null,
        error: true,
        errors: err.message,
      });
    }
  }
};

const getAllPosts = async (req, res, next) => {
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
            select: "image fullName userName",
          },
          {
            path: "likes",
            model: "Like",
          },
          {
            path: "dislikes",
            model: "Like",
          },
        ],
      },
    ]);
  } catch (err) {}
  res.json({
    message: "All posts of user",
    data: identifiedUser.posts.map((post) => {
      return post.toObject({ getters: true });
    }),
    error: false,
    errors: null,
  });
};

const getPostById = async (req, res, next) => {
  const { postId } = req.params;
  const identifiedPost = await Post.findById(postId).populate([
    {
      path: "creator",
      model: "User",
      select: "id userName fullName image",
    },
    {
      path: "likes",
      model: "Like",
    },
    {
      path: "dislikes",
      model: "Like",
    },
  ]);
  if (!identifiedPost) {
    res.status(400);
    return res.json({
      message: "Invalid postId",
      data: null,
      error: true,
      errors: "Post id is not valid",
    });
  } else {
    res.json({
      message: "Post details",
      data: identifiedPost.toObject({ getters: true }),
      error: false,
      errors: null,
    });
  }
};

exports.savePost = savePost;
exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
