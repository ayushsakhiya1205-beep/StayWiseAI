const express = require('express');
const router = express.Router();
const {
  getMyPGs,
  addPG,
  editPG,
  toggleVacancy,
  getOwnerEnquiries,
  respondEnquiry,
  getOwnerStats
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('pg_owner', 'admin'));

router.get('/stats', getOwnerStats);
router.get('/pgs', getMyPGs);
router.post('/pgs', addPG);
router.put('/pgs/:id', editPG);
router.patch('/pgs/:id/availability', toggleVacancy);
router.get('/enquiries', getOwnerEnquiries);
router.put('/enquiries/:id', respondEnquiry);

module.exports = router;
