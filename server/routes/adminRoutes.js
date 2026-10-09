const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getPendingPGs,
  approvePG,
  rejectPG,
  getUsers,
  toggleUserStatus,
  deleteUser,
  getReviews,
  deleteReview,
  getMlDashboard,
  triggerMlTrain
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/pgs/pending', getPendingPGs);
router.patch('/pgs/:id/approve', approvePG);
router.patch('/pgs/:id/reject', rejectPG);

router.get('/users', getUsers);
router.patch('/users/:id/suspend', toggleUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

router.get('/ml-dashboard', getMlDashboard);
router.post('/ml-train', triggerMlTrain);

module.exports = router;
