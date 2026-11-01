const express = require('express');
const router = express.Router();
const { createTeam, getTeams, deleteTeam, getTeamMembers, addTeamMember, removeTeamMember} = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); 

router.post('/', createTeam);
router.post('/:teamId/members', addTeamMember);
router.get('/', getTeams);
router.get('/:teamId/members', getTeamMembers);
router.delete('/:id', deleteTeam);
router.delete('/:teamId/members/:userId', removeTeamMember);


module.exports = router;