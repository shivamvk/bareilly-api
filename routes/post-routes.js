const router = require('express').Router();
const { savePostValidationRules } = require('../validators/user.post-validation');
const { validate } = require('../validators/validate');
const authorize = require('../middleware/authorize');
const postController = require("../controllers/user.post-controller");
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');
const commentController = require("../controllers/comment-controller");
const likeController = require("../controllers/like-controller");

router.use(checkAuth);

router.post(
    "/:userId/save",
    authorize,
    fileUpload.single("image"),
    savePostValidationRules(),
    validate,
    postController.savePost
);

router.get(
    "/:userId/all",
    authorize,
    postController.getAllPosts
);

router.get(
  "/:postId/comments/all",  
  commentController.getAllcomments
);

router.get(
  "/:postId/get",
  postController.getPostById
)

router.post(
  "/:postId/comments/save",
  commentController.saveComment
);

router.post(
  "/:postId/like/add",
  likeController.checkReputation,
  likeController.addLike
);

router.post(
  "/:postId/like/remove",
  likeController.removeLike
);

router.post(
  "/:postId/dislike/add",
  likeController.checkReputation,
  likeController.addDislike
);

router.post(
  "/:postId/dislike/remove",
  likeController.checkReputation,
  likeController.removeDislike
);

module.exports = router;