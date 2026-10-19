const pool = require('../config/db');
const { taskSchema } = require('../validations/taskValidation');

const createTeam = async (req, res) => {
  try {
    const { name } = teamSchema.parse(req.body); 
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const newTeam = await client.query(
        'INSERT INTO teams (name, creator_id) VALUES ($1, $2) RETURNING *',
        [name, req.user.id]
      );

      await client.query(
        'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
        [newTeam.rows[0].id, req.user.id]
      );

      await client.query('COMMIT');
      res.status(201).json(newTeam.rows[0]);
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues[0].message });
    console.error("Create Team Error:", error);
    res.status(500).json({ error: "Server error while creating team" });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await pool.query(
      `SELECT t.* FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = $1`,
      [req.user.id]
    );
    res.status(200).json(teams.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createTeam, getTeams };