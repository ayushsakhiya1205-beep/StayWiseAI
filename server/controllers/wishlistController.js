const Wishlist = require('../models/Wishlist');
const InteractionLog = require('../models/InteractionLog');

// @desc Toggle Wishlist (Add / Remove)
// @route POST /api/wishlist/toggle
exports.toggleWishlist = async (req, res) => {
  try {
    const { pgId } = req.body;
    const userId = req.user._id;

    if (!pgId) return res.status(400).json({ success: false, message: 'pgId is required' });

    const existing = await Wishlist.findOne({ userId, pgId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return res.json({ success: true, message: 'Removed from Wishlist', inWishlist: false });
    } else {
      await Wishlist.create({ userId, pgId });

      // Log Interaction event
      await InteractionLog.create({
        userId,
        pgId,
        eventType: 'WISHLIST',
        userRole: req.user.role || 'student'
      });

      return res.json({ success: true, message: 'Saved to Wishlist', inWishlist: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get User Wishlist
// @route GET /api/wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id })
      .populate({
        path: 'pgId',
        populate: { path: 'cityId', select: 'cityName state' }
      })
      .sort({ createdAt: -1 });

    const pgs = items.map((i) => i.pgId).filter(Boolean);
    res.json({ success: true, count: pgs.length, pgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
