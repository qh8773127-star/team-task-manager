const pool = require('../config/db');
const { z } = require('zod');

const teamSchema = z.object({
  name: z.string().min(2, "Team name is too short"),
});

const createTeam = async (req, res) => {
  try {
    const { name } = teamSchema.parse(req.body);
    const newTeam = await pool.query(
      'INSERT INTO teams (name, creator_id) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    );
   
    await pool.query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
      [newTeam.rows[0].id, req.user.id]
    );

    res.status(201).json(newTeam.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Server error" });
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