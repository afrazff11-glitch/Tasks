const express = require("express");
const { getComments, createComment, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getComments).post(protect, createComment);
router.route("/:id").delete(protect, deleteComment);

module.exports = router;
