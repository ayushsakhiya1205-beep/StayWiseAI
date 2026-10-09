const express = require('express');
const router = express.Router();
const { getCities, addCity, editCity } = require('../controllers/cityLandmarkController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getCities);
router.post('/', protect, authorize('admin'), addCity);
router.put('/:id', protect, authorize('admin'), editCity);

module.exports = router;
