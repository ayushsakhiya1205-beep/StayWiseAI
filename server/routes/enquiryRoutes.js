const express = require('express');
const router = express.Router();
const { sendEnquiry, getUserEnquiries } = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendEnquiry);
router.get('/my', protect, getUserEnquiries);

module.exports = router;
