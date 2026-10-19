const express = require('express');
const router = express.Router();
const { createTeam, getTeams } = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); 
router.post('/', createTeam);
router.get('/', getTeams);

module.exports = router;