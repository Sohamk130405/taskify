const jwt = require("jsonwebtoken");
const db = require("../config/database");

module.exports.protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized!" });

    const decoded = jwt.verify(token, "gdubg8v4y8ccshiu398");
    const userId = decoded.userId;

    const connection = await db.getConnection();

    try {
      // Retrieve the user without the password field
      const [rows] = await connection.execute(
        "SELECT id, name, email, profile_pic FROM Users WHERE id = ?",
        [userId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      req.user = rows[0];
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in protectRoute: ", error.message);
  }
};
