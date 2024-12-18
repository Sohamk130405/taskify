// routes/taskRoutes.js
const express = require("express");
const { protectRoute } = require("../middlewares/protectRoute.js");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  moveTasks,
  getTaskAnalytics,
} = require("../controllers/taskController.js");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Task routes
router.get("/analytics/:orgId", protectRoute, getTaskAnalytics);
router.post("/:cardId/tasks", protectRoute, upload.single("img"), createTask);
router.get("/:boardId/tasks", protectRoute, getTasks);
router.put("/:taskId/tasks", protectRoute, upload.single("img"), updateTask);
router.delete("/:taskId/tasks", protectRoute, deleteTask);
router.put("/tasks/move", protectRoute, moveTasks);
module.exports = router;
