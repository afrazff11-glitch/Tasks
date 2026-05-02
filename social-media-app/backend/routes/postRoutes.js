const express = require("express");
const {
  createPost,
  getFeed,
  addComment,
  likePost,
  unlikePost
} = require("../controllers/postController");

const router = express.Router();

router.get("/", getFeed);
router.post("/", createPost);
router.post("/:id/comments", addComment);
router.post("/:id/like", likePost);
router.delete("/:id/like", unlikePost);

module.exports = router;
