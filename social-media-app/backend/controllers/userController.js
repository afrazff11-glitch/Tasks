const db = require("../config/db");

function mapUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    bio: user.bio || "",
    createdAt: user.created_at
  };
}

function getAllUsers(req, res) {
  const sql = `SELECT id, username, full_name, bio, created_at FROM users ORDER BY created_at DESC`;
  db.all(sql, [], (error, users) => {
    if (error) {
      return res.status(500).json({ message: "Failed to load users" });
    }

    return res.json(users.map(mapUser));
  });
}

function getUserProfile(req, res) {
  const userId = Number(req.params.id);
  const viewerId = Number(req.query.viewerId || 0);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (userError, user) => {
    if (userError) {
      return res.status(500).json({ message: "Failed to load profile" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    db.get(`SELECT COUNT(*) AS count FROM followers WHERE following_id = ?`, [userId], (followersError, followersRow) => {
      if (followersError) {
        return res.status(500).json({ message: "Failed to load followers" });
      }

      db.get(`SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?`, [userId], (followingError, followingRow) => {
        if (followingError) {
          return res.status(500).json({ message: "Failed to load following" });
        }

        db.get(`SELECT COUNT(*) AS count FROM posts WHERE user_id = ?`, [userId], (postsError, postsRow) => {
          if (postsError) {
            return res.status(500).json({ message: "Failed to load post count" });
          }

          if (!viewerId) {
            return res.json({
              ...mapUser(user),
              followersCount: followersRow.count,
              followingCount: followingRow.count,
              postsCount: postsRow.count,
              isFollowing: false
            });
          }

          db.get(
            `SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?`,
            [viewerId, userId],
            (followError, followRow) => {
              if (followError) {
                return res.status(500).json({ message: "Failed to load follow relationship" });
              }

              return res.json({
                ...mapUser(user),
                followersCount: followersRow.count,
                followingCount: followingRow.count,
                postsCount: postsRow.count,
                isFollowing: Boolean(followRow)
              });
            }
          );
        });
      });
    });
  });
}

module.exports = {
  getAllUsers,
  getUserProfile
};
