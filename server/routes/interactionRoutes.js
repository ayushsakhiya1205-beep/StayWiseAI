const express = require('express');
const router = express.Router();
const { logInteraction } = require('../controllers/interactionController');

router.post('/', logInteraction);

module.exports = router;
