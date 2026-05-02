const db = require("../config/db");

function followUser(req, res) {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res.status(400).json({ message: "followerId and followingId are required" });
  }

  if (Number(followerId) === Number(followingId)) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const sql = `INSERT OR IGNORE INTO followers (follower_id, following_id) VALUES (?, ?)`;
  db.run(sql, [Number(followerId), Number(followingId)], (error) => {
    if (error) {
      return res.status(500).json({ message: "Failed to follow user" });
    }

    return res.json({ message: "User followed" });
  });
}

function unfollowUser(req, res) {
  const followerId = Number(req.query.followerId || 0);
  const followingId = Number(req.query.followingId || 0);

  if (!followerId || !followingId) {
    return res.status(400).json({ message: "followerId and followingId are required" });
  }

  const sql = `DELETE FROM followers WHERE follower_id = ? AND following_id = ?`;
  db.run(sql, [followerId, followingId], (error) => {
    if (error) {
      return res.status(500).json({ message: "Failed to unfollow user" });
    }

    return res.json({ message: "User unfollowed" });
  });
}

module.exports = {
  followUser,
  unfollowUser
};
