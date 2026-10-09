const express = require('express');
const router = express.Router();
const { addReview, getPGReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/:pgId', getPGReviews);

module.exports = router;
