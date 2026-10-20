const pool = require("../config/db");
const { taskSchema } = require('../validations/taskValidation'); 
const { ZodError } = require("zod");

const createTask = async (req, res) => {
  try {
    const data = taskSchema.parse(req.body);
    // Check if user is member of the team
    const isMember = await pool.query(
      "SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2",
      [data.team_id, req.user.id],
    );
    if (isMember.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not a member of this team" });
    }

    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, team_id, assignee_id, creator_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.title,
        data.description || null,
        data.team_id,
        data.assignee_id || null,
        req.user.id,
        data.status || "TODO",
      ],
    );

    res.status(201).json(newTask.rows[0]);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error("Create Team Error:", error);
    res.status(500).json({ error: "Server error while creating team" });
  }
};

const getTasks = async (req, res) => {
  try {
    const { team_id, assignee_id } = req.query;
    let query = "SELECT * FROM tasks WHERE 1=1";
    const values = [];
    let paramCount = 1;

    if (team_id) {
      query += ` AND team_id = $${paramCount}`;
      values.push(team_id);
      paramCount++;
    }

    if (assignee_id) {
      query += ` AND assignee_id = $${paramCount}`;
      values.push(assignee_id);
      paramCount++;
    }

    const tasks = await pool.query(query, values);
    res.status(200).json(tasks.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignee_id } = req.body;

    const updatedTask = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status), 
           assignee_id = COALESCE($4, assignee_id)
       WHERE id = $5 AND creator_id = $6 RETURNING *`,
      [title, description, status, assignee_id, id, req.user.id],
    );

    if (updatedTask.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Task not found or you are not the creator" });
    }

    res.status(200).json(updatedTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND creator_id = $2 RETURNING *",
      [id, req.user.id],
    );

    if (deletedTask.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
