const express = require('express');
const router = express.Router();
const { searchAndRecommendPGs, getPGById } = require('../controllers/pgController');

router.post('/recommend', searchAndRecommendPGs);
router.get('/:id', getPGById);

module.exports = router;
