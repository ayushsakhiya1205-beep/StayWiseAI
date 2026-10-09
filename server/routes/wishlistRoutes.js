const express = require('express');
const router = express.Router();
const { toggleWishlist, getUserWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/toggle', protect, toggleWishlist);
router.get('/', protect, getUserWishlist);

module.exports = router;
