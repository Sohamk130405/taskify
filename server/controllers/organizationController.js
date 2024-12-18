//controllers/organizationController.js
const db = require("../config/database.js");

module.exports.createOrganization = async (req, res) => {
  const { orgName, selectedUsers, createdBy } = req.body;

  if (!orgName || !createdBy || !Array.isArray(selectedUsers)) {
    return res.status(400).json({ message: "Some fields are empty" });
  }

  const connection = await db.getConnection(); // Use connection here

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Check if the user exists
    const [user] = await connection.execute(
      "SELECT * FROM Users WHERE id = ?",
      [createdBy]
    );

    // If the user does not exist, rollback and return an error
    if (user.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "User does not exist!" });
    }

    // Insert the organization
    const [result] = await connection.execute(
      "INSERT INTO Organizations (name, created_by) VALUES (?, ?)",
      [orgName, createdBy]
    );

    const organizationId = result.insertId;

    // Insert the admin (creator) into UserOrganizations
    await connection.execute(
      "INSERT INTO UserOrganizations (user_id, organization_id, role) VALUES (?, ?, ?)",
      [createdBy, organizationId, "admin"]
    );

    // Insert selected users into UserOrganizations
    const userOrgPromises = selectedUsers.map((user) =>
      connection.execute(
        "INSERT INTO UserOrganizations (user_id, organization_id, role) VALUES (?, ?, ?)",
        [user.id, organizationId, "member"]
      )
    );

    await Promise.all(userOrgPromises);

    // Commit the transaction
    await connection.commit();

    res.status(201).json({
      message: "Organization created successfully",
      orgId: organizationId,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();
    console.error("Error creating organization:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();
  }
};

module.exports.getOrganizationsForUser = async (req, res) => {
  const userId = req.user.id;
  const connection = await db.getConnection();
  try {
    const [organizations] = await connection.execute(
      `SELECT o.id, o.name, uo.role 
       FROM Organizations o
       JOIN UserOrganizations uo ON o.id = uo.organization_id
       WHERE uo.user_id = ?`,
      [userId]
    );

    res.status(200).json(organizations);
  } catch (error) {
    console.error("Error fetching organizations for user:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports.getBoards = async (req, res) => {
  const userId = req.user.id;
  const connection = await db.getConnection();

  try {
    const [isUserExistInOrg] = await connection.execute(
      `SELECT id FROM UserOrganizations WHERE organization_id = ? AND user_id = ? `,
      [req.params.orgId, userId]
    );

    if (isUserExistInOrg.length === 0) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const [boards] = await connection.execute(
      `SELECT * FROM Boards WHERE organization_id  = ? `,
      [req.params.orgId]
    );
    res.status(200).json(boards);
  } catch (error) {
    console.error("Error fetching boards for organization:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports.createBoard = async (req, res) => {
  const { name, created_by } = req.body;
  const orgId = req.params.orgId;

  if (!name) {
    return res.status(400).json({ message: "Enter Name of board" });
  }

  if (!orgId || !created_by) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  const img = req.file ? `/uploads/${req.file.filename}` : null;

  const connection = await db.getConnection();
  try {
    // Start transaction
    await connection.beginTransaction();

    // Insert new board
    const [newBoard] = await connection.execute(
      `INSERT INTO Boards (name, organization_id, created_by, img) VALUES (?, ?, ?, ?)`,
      [name, orgId, created_by, img]
    );

    // Get the ID of the newly created board
    const boardId = newBoard.insertId;
    // Commit transaction
    await connection.commit();

    res.status(201).json({
      message: "Board created successfully with default cards",
      board: newBoard,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating board and default cards:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports.getCards = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const [cards] = await connection.execute(
      `SELECT * FROM Boards WHERE board_id  = ? `,
      [req.params.boardId]
    );
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching boards for organization:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports.createCard = async (req, res) => {
  const { name, created_by } = req.body;
  const boardId = req.params.boardId;

  if (!name) {
    return res.status(400).json({ message: "Enter Name of Card" });
  }

  if (!created_by || !boardId) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  const connection = await db.getConnection();
  try {
    const newCard = await connection.execute(
      `INSERT INTO Cards (name, board_id, created_by) VALUES (?, ?, ?)`,
      [name, boardId, created_by]
    );
    await connection.commit();

    res
      .status(201)
      .json({ message: "Card created successfully", card: newCard });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating card:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Get Activity Analytics
module.exports.getActivityAnalytics = async (req, res) => {
  const { orgId } = req.params;
  const connection = await db.getConnection();

  try {
    // Fetch activity data (insert, update, delete) for tasks
    const [activityStats] = await connection.execute(
      `
      CALL GetTaskActionCounts(?) 
    `,
      [orgId]
    );

    res.status(200).json({ activityStats });
  } catch (error) {
    console.error("Error fetching activity analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Get Card Analytics (Tasks per card/board)
module.exports.getCardAnalytics = async (req, res) => {
  const { orgId } = req.params;
  const connection = await db.getConnection();

  try {
    // Fetch the number of tasks per card (board level analysis)
    const [cardStats] = await connection.execute(
      `
      SELECT 
        c.id AS card_id, c.name AS card_name,
        COUNT(t.id) AS total_tasks
      FROM Cards c
      LEFT JOIN Tasks t ON c.id = t.card_id
      LEFT JOIN Boards b ON c.board_id = b.id
      WHERE b.organization_id = ?
      GROUP BY c.id
    `,
      [orgId]
    );

    res.status(200).json({ cardStats });
  } catch (error) {
    console.error("Error fetching card analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};
