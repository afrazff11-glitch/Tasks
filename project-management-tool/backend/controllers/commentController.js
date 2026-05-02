const Comment = require("../models/Comment");
const Task = require("../models/Task");

const getComments = async (req, res) => {
  try {
    const filter = {};

    if (req.query.task) {
      filter.task = req.query.task;
    }

    const comments = await Comment.find(filter).populate("user", "name email").sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { task, text } = req.body;

    if (!task || !text) {
      return res.status(400).json({ message: "Task and text are required" });
    }

    const comment = await Comment.create({ task, text, user: req.user._id });
    await Task.findByIdAndUpdate(task, { $push: { comments: comment._id } });

    const populated = await Comment.findById(comment._id).populate("user", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await Task.findByIdAndUpdate(comment.task, { $pull: { comments: comment._id } });
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, createComment, deleteComment };
