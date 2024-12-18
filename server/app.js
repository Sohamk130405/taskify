const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const userRoutes = require("./routes/userRoutes.js");
const organizationRoutes = require("./routes/organizationRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");

// CORS options
const corsOptions = {
  credentials: true,
  origin: process.env.CORS_ORIGIN,
  methods: "GET , POST , PUT , PATCH , DELETE , HEAD",
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/boards", taskRoutes);
app.get("/test", (req, res) => res.json({ message: "Server is working" }));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
