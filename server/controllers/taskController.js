// controller/taskController.js
const db = require("../config/database.js");
const { logActivity } = require("../utils/logActivity.js");
const fs = require("fs");
const path = require("path");
// Create Task
module.exports.createTask = async (req, res) => {
  const {
    title,
    position,
    description,
    assigned_to,
    priority,
    due_date,
    created_by,
    tags,
    orgId,
  } = req.body;

  const cardId = req.params.cardId;
  const img = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !created_by || !cardId) {
    return res
      .status(400)
      .json({ message: "Title, Card ID, and Created By are required" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert new task
    const [newTask] = await connection.execute(
      `INSERT INTO Tasks (title,position, description, card_id, org_id, assigned_to, img, priority, due_date, created_by) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        title,
        position,
        description,
        cardId,
        orgId,
        assigned_to,
        img,
        priority,
        due_date,
        created_by,
      ]
    );

    const taskId = newTask.insertId;

    // Handle tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        // Check if tag exists or insert new one
        let [existingTag] = await connection.execute(
          `SELECT * FROM Tags WHERE title = ?`,
          [tag.title]
        );

        let tagId;
        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const [newTag] = await connection.execute(
            `INSERT INTO Tags (title, bg_color, text_color) VALUES (?, ?, ?)`,
            [tag.title, tag.bg_color, tag.text_color]
          );
          tagId = newTag.insertId;
        }

        // Associate tag with task
        await connection.execute(
          `INSERT INTO TaskTags (task_id, tag_id) VALUES (?, ?)`,
          [taskId, tagId]
        );
      }
    }
    await connection.commit();
    res.status(201).json({ message: "Task created successfully", taskId });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Get Tasks
module.exports.getTasks = async (req, res) => {
  const boardId = req.params.boardId;
  const connection = await db.getConnection();

  try {
    // Fetch all cards associated with the board
    const [cards] = await connection.execute(
      `SELECT id AS card_id, name AS card_title 
       FROM Cards 
       WHERE board_id = ?`,
      [boardId]
    );

    // Fetch tasks and associate them with their respective cards
    const tasksByCards = await Promise.all(
      cards.map(async (card) => {
        // Fetch tasks for each card, ordered by position, and include the assigned user info
        const [tasks] = await connection.execute(
          `SELECT t.*, 
                  c.id AS card_id, c.name AS card_title,
                  u.id AS assigned_to, u.name AS assigned_to_name, u.email AS assigned_to_email , u.profile_pic AS assigned_to_profile_pic
           FROM Tasks t
           JOIN Cards c ON t.card_id = c.id
           LEFT JOIN Users u ON t.assigned_to = u.id
           WHERE c.id = ?
           ORDER BY t.position`, // Ensures tasks are ordered by position
          [card.card_id]
        );

        // Fetch tags for each task
        const tasksWithTags = await Promise.all(
          tasks.map(async (task) => {
            const [tags] = await connection.execute(
              `SELECT t.* FROM Tags t 
               JOIN TaskTags tt ON t.id = tt.tag_id
               WHERE tt.task_id = ?`,
              [task.id]
            );

            return {
              ...task,
              tags, // Include tags array
              assigned_to: {
                id: task.assigned_to,
                name: task.assigned_to_name,
                email: task.assigned_to_email,
                profile_pic: task.assigned_to_profile_pic,
              }, // Include assigned_to user details
            };
          })
        );

        return {
          cardId: card.card_id,
          cardTitle: card.card_title,
          tasks: tasksWithTags, // Add tasks array (could be empty)
        };
      })
    );

    // Convert the structure to match the frontend requirement
    const groupedTasks = tasksByCards.reduce((acc, card) => {
      acc[card.cardId] = {
        name: card.cardTitle,
        items: card.tasks.map((task) => ({
          id: task.id,
          position: task.position,
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to, // Include assigned_to details in the task
          img: task.img,
          priority: task.priority,
          due_date: task.due_date,
          created_by: task.created_by,
          tags: task.tags,
        })),
      };
      return acc;
    }, {});

    res.status(200).json(groupedTasks);
  } catch (error) {
    console.error(
      "Error fetching tasks by board with tags and assigned users:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports.updateTask = async (req, res) => {
  const { title, description, assigned_to, priority, due_date, tags } =
    req.body;
  const taskId = req.params.taskId;

  if (!taskId || !title) {
    return res.status(400).json({ message: "Task ID and title are required" });
  }

  const newImage = req.file ? `/uploads/${req.file.filename}` : null;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Fetch current task details to check the existing image
    const [currentTask] = await connection.execute(
      `SELECT img FROM Tasks WHERE id = ?`,
      [taskId]
    );

    const oldImage = currentTask[0]?.img;

    // Update task details
    await connection.execute(
      `UPDATE Tasks SET title = ?, description = ?, assigned_to = ?, priority = ?, due_date = ?, img = ? WHERE id = ?`,
      [title, description, assigned_to, priority, due_date, newImage, taskId]
    );

    // Handle tag updates (existing logic remains)
    if (tags && Array.isArray(tags)) {
      await connection.execute(`DELETE FROM TaskTags WHERE task_id = ?`, [
        taskId,
      ]);
      for (const tag of tags) {
        let [existingTag] = await connection.execute(
          `SELECT * FROM Tags WHERE title = ?`,
          [tag.title]
        );
        let tagId;
        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const [newTag] = await connection.execute(
            `INSERT INTO Tags (title, bg_color, text_color) VALUES (?, ?, ?)`,
            [tag.title, tag.bg_color, tag.text_color]
          );
          tagId = newTag.insertId;
        }
        await connection.execute(
          `INSERT INTO TaskTags (task_id, tag_id) VALUES (?, ?)`,
          [taskId, tagId]
        );
      }
    }

    // Remove the old image if a new one is provided
    if (oldImage && newImage && oldImage !== newImage) {
      const oldImagePath = path.join(__dirname, "..", "..", oldImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Error deleting old image:", err);
      });
    }

    await connection.commit();
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports.deleteTask = async (req, res) => {
  const taskId = req.params.taskId;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Fetch the image associated with the task
    const [task] = await connection.execute(
      `SELECT img FROM Tasks WHERE id = ?`,
      [taskId]
    );

    const oldImage = task[0]?.img;

    // Remove task-tag associations
    await connection.execute(`DELETE FROM TaskTags WHERE task_id = ?`, [
      taskId,
    ]);

    // Delete the task
    await connection.execute(`DELETE FROM Tasks WHERE id = ?`, [taskId]);

    // Remove the associated image
    if (oldImage) {
      const oldImagePath = path.join(__dirname, "..", "..", oldImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Error deleting old image:", err);
      });
    }

    await connection.commit();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Backend route handler (Node.js/Express)
module.exports.moveTasks = async (req, res) => {
  const { sourceCardId, destinationCardId, items } = req.body; // Extract source and destination card IDs and tasks with new positions
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // If moving within the same column
    if (sourceCardId === destinationCardId) {
      for (const item of items) {
        await connection.execute(
          `UPDATE Tasks SET position = ? WHERE id = ? AND card_id = ?`,
          [item.position, item.id, sourceCardId]
        );
      }
    } else {
      // If moving between different columns
      for (const item of items) {
        await connection.execute(
          `UPDATE Tasks SET position = ?, card_id = ? WHERE id = ?`,
          [item.position, destinationCardId, item.id]
        );
      }
    }
    await connection.commit();
    res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating task positions:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports.getTaskAnalytics = async (req, res) => {
  const { orgId } = req.params; // Assuming you're fetching analytics for a specific organization
  const connection = await db.getConnection();

  try {
    // Fetch task-related statistics based on card names
    const [taskStats] = await connection.execute(
      `
      SELECT 
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN c.name = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN c.name = 'todo' THEN 1 ELSE 0 END) AS pending_tasks,
        SUM(CASE WHEN c.name = 'doing' THEN 1 ELSE 0 END) AS in_progress_tasks
      FROM Tasks t
      JOIN Cards c ON t.card_id = c.id
      WHERE c.board_id IN (SELECT id FROM Boards WHERE org_id = ?)
    `,
      [orgId]
    );

    res.status(200).json({ taskStats: taskStats[0] });
  } catch (error) {
    console.error("Error fetching task analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};
