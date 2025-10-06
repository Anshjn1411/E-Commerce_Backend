// user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");

// Get all users
router.get("/", userController.getAllUsers);

// Get user profile by token
router.get("/profile", userController.getUserProfile);

// Get user by ID
router.get("/:id", userController.getUserById);

// Update user
router.put("/:id", userController.updateUser);

// Delete user (hard delete)
router.delete("/:id", userController.deleteUser);

module.exports = router;