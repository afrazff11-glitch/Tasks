const path = require("path");
const express = require("express");
const cors = require("cors");

const { initializeSchema } = require("./models/schema");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const socialRoutes = require("./routes/socialRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

initializeSchema();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/social", socialRoutes);

const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));

app.get("/", (req, res) => {
	res.sendFile(path.join(frontendDir, "login.html"));
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
