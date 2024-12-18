module.exports.logActivity = async (
  connection,
  userId,
  orgId,
  boardId = null,
  cardId = null,
  taskId = null,
  action,
  details
) => {
  await connection.execute(
    `INSERT INTO Activity (user_id, org_id, board_id, card_id, task_id, action, details) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, orgId, boardId, cardId, taskId, action, details]
  );
};
