const Review = require('../models/Review');
const PGListing = require('../models/PGListing');
const InteractionLog = require('../models/InteractionLog');

// @desc Add Review & Rating
// @route POST /api/reviews
exports.addReview = async (req, res) => {
  try {
    const { pgId, rating, comment } = req.body;
    if (!pgId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'pgId, rating and comment are required' });
    }

    const review = await Review.create({
      pgId,
      userId: req.user._id,
      rating: Number(rating),
      comment
    });

    // Re-calculate average rating for PG
    const reviews = await Review.find({ pgId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await PGListing.findByIdAndUpdate(pgId, {
      ratingAverage: Math.round(avg * 10) / 10,
      ratingCount: reviews.length
    });

    // Log Interaction Event
    await InteractionLog.create({
      userId: req.user._id,
      pgId,
      eventType: 'REVIEW',
      userRole: req.user.role || 'student'
    });

    res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Reviews for a PG
// @route GET /api/reviews/:pgId
exports.getPGReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ pgId: req.params.pgId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
