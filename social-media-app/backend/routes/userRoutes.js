const express = require("express");
const { getAllUsers, getUserProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserProfile);

module.exports = router;
