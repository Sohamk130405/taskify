//routes/userRoute.js
const express = require("express");
const router = express.Router();
const {
  signUpUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getAllUsers,
  getOrgUsers,
  updateUserProfile,
  getUserAnalytics,
} = require("../controllers/userController.js");

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

router.get("/analytics/:orgId", getUserAnalytics);
router.get("/profile/:id", getUserProfile);
router.get("/getAllUsers", getAllUsers);
router.get("/orgUsers/:orgId", getOrgUsers);
router.put("/:id", upload.single("profile_pic"), updateUserProfile);
router.post("/signup", signUpUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
module.exports = router;
