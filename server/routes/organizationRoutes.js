//routes/organizationRoute.js
const express = require("express");
const { protectRoute } = require("../middlewares/protectRoute.js");
const {
  createOrganization,
  getOrganizationsForUser,
  getBoards,
  createBoard,
  getCards,
  createCard,
  getActivityAnalytics,
  getCardAnalytics,
} = require("../controllers/organizationController.js");
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
router.get("/analytics/:orgId", getActivityAnalytics);
router.get("/cards/analytics/:orgId", getCardAnalytics);
router.get("/getOrgs", protectRoute, getOrganizationsForUser);
router.get("/:orgId/boards", protectRoute, getBoards);
router.get("/:boardId/cards", protectRoute, getCards);
router.post(
  "/:orgId/boards/createBoard",
  protectRoute,
  upload.single("img"),
  createBoard
);
router.post("/createOrg", protectRoute, createOrganization);
router.post("/:boardId/cards", protectRoute, createCard);

module.exports = router;
