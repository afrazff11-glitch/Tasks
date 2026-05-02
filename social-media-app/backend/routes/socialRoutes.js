const express = require("express");
const { followUser, unfollowUser } = require("../controllers/socialController");

const router = express.Router();

router.post("/follow", followUser);
router.delete("/follow", unfollowUser);

module.exports = router;
