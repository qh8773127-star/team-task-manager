const pool = require("../config/db");
const { teamSchema } = require("../validations/teamValidation");
const { ZodError } = require("zod");

const createTeam = async (req, res) => {
  try {
    const { name } = teamSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const newTeam = await client.query(
        "INSERT INTO teams (name, creator_id) VALUES ($1, $2) RETURNING *",
        [name, req.user.id],
      );

      await client.query(
        "INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)",
        [newTeam.rows[0].id, req.user.id],
      );

      await client.query("COMMIT");
      res.status(201).json(newTeam.rows[0]);
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
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
      [req.user.id],
    );
    res.status(200).json(teams.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTeam = await pool.query(
      "DELETE FROM teams WHERE id = $1 AND creator_id = $2 RETURNING *",
      [id, req.user.id],
    );

    if (deletedTeam.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Team not found or you are not the creator" });
    }

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body;

    const team = await pool.query("SELECT * FROM teams WHERE id = $1 AND creator_id = $2", [teamId, req.user.id]);
    if (team.rows.length === 0) {
      return res.status(403).json({ error: "Only the team creator can add members." });
    }

    const user = await pool.query("SELECT id, name FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User with this email does not exist." });
    }

    const isMember = await pool.query("SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2", [teamId, user.rows[0].id]);
    if (isMember.rows.length > 0) {
      return res.status(400).json({ error: "User is already a member of this team." });
    }
    await pool.query("INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)", [teamId, user.rows[0].id]);
    res.status(201).json({ message: "Member added successfully", member: user.rows[0] });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const members = await pool.query(
      `SELECT u.id, u.name, u.email 
       FROM users u 
       JOIN team_members tm ON u.id = tm.user_id 
       WHERE tm.team_id = $1`,
      [teamId]
    );
    res.status(200).json(members.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await pool.query("SELECT creator_id FROM teams WHERE id = $1", [teamId]);
    
    if (team.rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: "Only the team creator can remove members." });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ error: "You cannot remove yourself from the team." });
    }
    const deleted = await pool.query(
      "DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING *",
      [teamId, userId]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Member not found in this team" });
    }

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { createTeam, getTeams, deleteTeam, addTeamMember, getTeamMembers, removeTeamMember};
