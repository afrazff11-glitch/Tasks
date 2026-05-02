const db = require("../config/db");

function register(req, res) {
  const { username, fullName, password } = req.body;

  if (!username || !fullName || !password) {
    return res.status(400).json({ message: "username, fullName and password are required" });
  }

  const sql = `INSERT INTO users (username, full_name, password) VALUES (?, ?, ?)`;
  db.run(sql, [username.trim(), fullName.trim(), password], function onInsert(error) {
    if (error) {
      if (error.message.includes("UNIQUE")) {
        return res.status(409).json({ message: "Username already exists" });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }

    return res.status(201).json({
      id: this.lastID,
      username: username.trim(),
      fullName: fullName.trim()
    });
  });
}

function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const sql = `SELECT id, username, full_name, bio FROM users WHERE username = ? AND password = ?`;
  db.get(sql, [username.trim(), password], (error, user) => {
    if (error) {
      return res.status(500).json({ message: "Failed to log in" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      bio: user.bio
    });
  });
}

module.exports = {
  register,
  login
};
