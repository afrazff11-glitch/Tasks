const db = require("../config/db");

function createPost(req, res) {
  const { userId, content } = req.body;

  if (!userId || !content || !content.trim()) {
    return res.status(400).json({ message: "userId and content are required" });
  }

  const sql = `INSERT INTO posts (user_id, content) VALUES (?, ?)`;
  db.run(sql, [Number(userId), content.trim()], function onInsert(error) {
    if (error) {
      return res.status(500).json({ message: "Failed to create post" });
    }

    return res.status(201).json({ id: this.lastID, userId: Number(userId), content: content.trim() });
  });
}

function getFeed(req, res) {
  const viewerId = Number(req.query.viewerId || 0);
  const postsSql = `
    SELECT
      p.id,
      p.user_id,
      p.content,
      p.created_at,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked_by_viewer
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `;

  db.all(postsSql, [viewerId], (postsError, posts) => {
    if (postsError) {
      return res.status(500).json({ message: "Failed to load feed" });
    }

    const postIds = posts.map((post) => post.id);
    if (postIds.length === 0) {
      return res.json([]);
    }

    const placeholders = postIds.map(() => "?").join(",");
    const commentsSql = `
      SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id IN (${placeholders})
      ORDER BY c.created_at ASC
    `;

    db.all(commentsSql, postIds, (commentsError, comments) => {
      if (commentsError) {
        return res.status(500).json({ message: "Failed to load comments" });
      }

      const groupedComments = comments.reduce((acc, comment) => {
        if (!acc[comment.post_id]) {
          acc[comment.post_id] = [];
        }
        acc[comment.post_id].push({
          id: comment.id,
          userId: comment.user_id,
          username: comment.username,
          content: comment.content,
          createdAt: comment.created_at
        });
        return acc;
      }, {});

      const payload = posts.map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        fullName: post.full_name,
        content: post.content,
        createdAt: post.created_at,
        likesCount: post.likes_count,
        commentsCount: post.comments_count,
        likedByViewer: post.liked_by_viewer > 0,
        comments: groupedComments[post.id] || []
      }));

      return res.json(payload);
    });
  });
}

function addComment(req, res) {
  const postId = Number(req.params.id);
  const { userId, content } = req.body;

  if (!postId || !userId || !content || !content.trim()) {
    return res.status(400).json({ message: "post id, userId and content are required" });
  }

  const sql = `INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)`;
  db.run(sql, [postId, Number(userId), content.trim()], function onInsert(error) {
    if (error) {
      return res.status(500).json({ message: "Failed to add comment" });
    }

    return res.status(201).json({ id: this.lastID, postId, userId: Number(userId), content: content.trim() });
  });
}

function likePost(req, res) {
  const postId = Number(req.params.id);
  const { userId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ message: "post id and userId are required" });
  }

  const sql = `INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)`;
  db.run(sql, [Number(userId), postId], (error) => {
    if (error) {
      return res.status(500).json({ message: "Failed to like post" });
    }

    return res.json({ message: "Post liked" });
  });
}

function unlikePost(req, res) {
  const postId = Number(req.params.id);
  const userId = Number(req.query.userId || 0);

  if (!postId || !userId) {
    return res.status(400).json({ message: "post id and userId are required" });
  }

  const sql = `DELETE FROM likes WHERE user_id = ? AND post_id = ?`;
  db.run(sql, [userId, postId], (error) => {
    if (error) {
      return res.status(500).json({ message: "Failed to unlike post" });
    }

    return res.json({ message: "Post unliked" });
  });
}

module.exports = {
  createPost,
  getFeed,
  addComment,
  likePost,
  unlikePost
};
