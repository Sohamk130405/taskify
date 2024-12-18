//controllers/userController.js
const bcrypt = require("bcryptjs");
const db = require("../config/database.js");
const {
  generateTokenAndSetCookie,
} = require("../utils//generateTokenAndSetCookie.js");

module.exports.getUserProfile = async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    const [user] = await connection.execute(
      "SELECT name, email, profile_pic, phone FROM Users WHERE id = ?",
      [id]
    );
    if (user.length === 0)
      return res.status(400).json({ error: "User not found!" });

    // Since user[0] is already a plain JavaScript object, we can directly send it
    res.status(200).json(user[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in getUserProfile: ", error.message);
  } finally {
    if (connection) connection.release();
  }
};

module.exports.signUpUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const connection = await db.getConnection();
    try {
      // Start transaction
      await connection.beginTransaction();

      // Check if user already exists
      const [existingUser] = await connection.execute(
        "SELECT * FROM Users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: "User already exists!" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const [result] = await connection.execute(
        "INSERT INTO Users (name, email, password, profile_pic, phone) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, null, phone]
      );

      // Retrieve new user details
      const [newUser] = await connection.execute(
        "SELECT * FROM Users WHERE id = LAST_INSERT_ID()"
      );

      if (newUser.length > 0) {
        // Commit transaction
        await connection.commit();

        generateTokenAndSetCookie(newUser[0].id, res);
        res.status(201).json({
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          profilePic: newUser[0].profilePic,
          phone: newUser[0].phone,
        });
      } else {
        await connection.rollback();
        res.status(400).json({ error: "Invalid User Credentials!" });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in signUpUser: ", error.message);
  }
};
module.exports.updateUserProfile = async (req, res) => {
  const { id } = req.params; // User ID from request parameters
  const { name, email, phone } = req.body; // New profile details from request body
  if (!id || !name || !email || !phone) {
    console.log(id, name, email, phone);
    return res.status(400).json({ error: "All fields are required!" });
  }
  const connection = await db.getConnection();
  try {
    // Start transaction
    await connection.beginTransaction();

    // Check if the email is already in use by another user
    const [existingUser] = await connection.execute(
      "SELECT * FROM Users WHERE email = ? AND id != ?",
      [email, id]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Email is already in use by another user!" });
    }
    const profile_pic = req.file ? `/uploads/${req.file.filename}` : null;
    // Update user profile
    await connection.execute(
      "UPDATE Users SET name = ?, email = ?, profile_pic = ?, phone = ? WHERE id = ?",
      [name, email, profile_pic, phone, id]
    );

    // Commit transaction
    await connection.commit();

    // Fetch updated user details
    const [updatedUser] = await connection.execute(
      "SELECT id, name, email, profile_pic, phone FROM Users WHERE id = ?",
      [id]
    );

    res.status(200).json(updatedUser[0]); // Send updated user profile
  } catch (error) {
    if (connection) await connection.rollback(); // Rollback transaction on error
    res.status(500).json({ message: error.message });
    console.log("Error in updateUserProfile: ", error.message);
  } finally {
    if (connection) connection.release();
  }
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await db.getConnection();

    try {
      // Check if user exists
      const [userResult] = await connection.execute(
        "SELECT * FROM Users WHERE email = ?",
        [email]
      );

      const user = userResult[0];

      if (!user) {
        return res.status(400).json({ error: "User does not exist!" });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid Credentials!" });
      }

      // Generate token and set cookie
      generateTokenAndSetCookie(user.id, res);
      console.log(user.id);
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profile_pic,
        phone: user.phone,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in loginUser: ", error.message);
  }
};

module.exports.logoutUser = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in logoutUser: ", error.message);
  }
};

module.exports.getAllUsers = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [user] = await connection.execute("SELECT * FROM user_profile_view");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in getAllUsers: ", error.message);
  } finally {
    if (connection) connection.release();
  }
};

module.exports.getOrgUsers = async (req, res) => {
  const connection = await db.getConnection();
  const orgId = req.params.orgId; // Get organization ID from request parameters
  try {
    const [users] = await connection.execute(
      `
      CALL GetUsersByOrganization(?);
      `,
      [orgId]
    );

    res.status(200).json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in getOrgUsers: ", error.message);
  } finally {
    if (connection) connection.release();
  }
};

// Get User Analytics
module.exports.getUserAnalytics = async (req, res) => {
  const { orgId } = req.params;
  const connection = await db.getConnection();

  try {
    // Fetch task completion data grouped by users
    const [userStats] = await connection.execute(
      `
  SELECT 
    u.id AS user_id, 
    u.name AS user_name, 
    u.email, 
    u.profile_pic,
    COUNT(t.id) AS total_assigned_tasks,
    SUM(CASE WHEN c.name = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks
  FROM Users u
  JOIN UserOrganizations uo ON u.id = uo.user_id 
  LEFT JOIN Tasks t ON u.id = t.assigned_to AND t.org_id = uo.organization_id
  LEFT JOIN Cards c ON t.card_id = c.id
  WHERE uo.organization_id = ?
  GROUP BY u.id
  `,
      [orgId]
    );

    res.status(200).json({ userStats });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};
