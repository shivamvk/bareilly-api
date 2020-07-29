const router = require("express").Router();
const contentController = require("../controllers/content-controller");

router.get(
    "/tags/all",
    contentController.getAllTags
);  

router.get(
    "/mentions/all",
    contentController.getAllMentions
);

router.get(
    "/home",
    contentController.getPostsForHome
)

module.exports = router;