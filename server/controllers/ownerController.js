const PGListing = require('../models/PGListing');
const Enquiry = require('../models/Enquiry');
const Review = require('../models/Review');

// @desc Get owner PGs
// @route GET /api/owner/pgs
exports.getMyPGs = async (req, res) => {
  try {
    const pgs = await PGListing.find({ ownerId: req.user._id })
      .populate('cityId', 'cityName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pgs.length, pgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add PG Listing
// @route POST /api/owner/pgs
exports.addPG = async (req, res) => {
  try {
    const pgData = {
      ...req.body,
      ownerId: req.user._id,
      status: 'pending' // Every new PG goes to Pending Admin Review
    };

    const pg = await PGListing.create(pgData);
    res.status(201).json({ success: true, message: 'PG listing created successfully and submitted for Admin Approval', pg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Edit PG Listing
// @route PUT /api/owner/pgs/:id
exports.editPG = async (req, res) => {
  try {
    let pg = await PGListing.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG listing not found or unauthorized' });
    }

    const updatedFields = {
      ...req.body,
      status: 'pending' // Edits require admin re-approval
    };

    pg = await PGListing.findByIdAndUpdate(req.params.id, updatedFields, { new: true, runValidators: true });
    res.json({ success: true, message: 'PG updated and submitted for Admin re-verification', pg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Toggle PG availability
// @route PATCH /api/owner/pgs/:id/availability
exports.toggleVacancy = async (req, res) => {
  try {
    const pg = await PGListing.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG listing not found' });
    }

    pg.availability = !pg.availability;
    await pg.save();

    res.json({ success: true, message: `Vacancy updated to ${pg.availability ? 'Available' : 'Full'}`, availability: pg.availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get enquiries for owner PGs
// @route GET /api/owner/enquiries
exports.getOwnerEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ ownerId: req.user._id })
      .populate('pgId', 'name address photos rent')
      .populate('userId', 'name email mobile role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Respond to enquiry
// @route PUT /api/owner/enquiries/:id
exports.respondEnquiry = async (req, res) => {
  try {
    const { status, replyMessage } = req.body;
    const enquiry = await Enquiry.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) enquiry.status = status;
    if (replyMessage) enquiry.replyMessage = replyMessage;

    await enquiry.save();
    res.json({ success: true, message: 'Enquiry response updated', enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get owner dashboard stats
// @route GET /api/owner/stats
exports.getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const totalPGs = await PGListing.countDocuments({ ownerId });
    const approvedPGs = await PGListing.countDocuments({ ownerId, status: 'approved' });
    const pendingPGs = await PGListing.countDocuments({ ownerId, status: 'pending' });
    const totalEnquiries = await Enquiry.countDocuments({ ownerId });

    const pgs = await PGListing.find({ ownerId });
    const pgIds = pgs.map((p) => p._id);
    const reviews = await Review.find({ pgId: { $in: pgIds } });
    
    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

    res.json({
      success: true,
      stats: {
        totalPGs,
        approvedPGs,
        pendingPGs,
        totalEnquiries,
        totalReviews: reviews.length,
        avgRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
