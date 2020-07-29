const Tag = require("../models/tag");
const User = require("../models/user");
const Post = require("../models/post");

const getAllTags = async (req, res, next) => {
  const tags = await Tag.find();
  res.json({
    message: "All tags",
    data: tags.map((tag) => {
      return tag.toObject({ getters: true });
    }),
    error: false,
    errors: null,
  });
};

const getAllMentions = async (req, res, next) => {
  const users = await User.find();
  res.json({
    message: "All mentions",
    data: users.map((user) => {
      return user.toObject({ getters: true });
    }),
    error: false,
    errors: null,
  });
};

const getPostsForHome = async (req, res, next) => {
  const posts = await Post.find()
    .populate([
      {
        path: "creator",
        model: "User",
        populate: {
          path: "posts",
          model: "Post",
          select: "_id",
        },
      },
    ])
    .populate([
      {
        path: "likes",
        model: "Like",
      },
    ])
    .populate([
      {
        path: "dislikes",
        model: "Like",
      },
    ]);
  res.json({
    message: "Home content",
    data: posts.map((post) => {
      return post.toObject({ getters: true });
    }),
    error: true,
    errors: false,
  });
};

exports.getAllTags = getAllTags;
exports.getAllMentions = getAllMentions;
exports.getPostsForHome = getPostsForHome;
