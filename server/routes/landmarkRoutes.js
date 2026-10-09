const express = require('express');
const router = express.Router();
const { getLandmarks, addLandmark, editLandmark } = require('../controllers/cityLandmarkController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getLandmarks);
router.post('/', protect, authorize('admin'), addLandmark);
router.put('/:id', protect, authorize('admin'), editLandmark);

module.exports = router;
