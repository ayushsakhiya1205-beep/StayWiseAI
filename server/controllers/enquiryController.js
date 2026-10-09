const Enquiry = require('../models/Enquiry');
const PGListing = require('../models/PGListing');
const InteractionLog = require('../models/InteractionLog');

// @desc Send Enquiry
// @route POST /api/enquiries
exports.sendEnquiry = async (req, res) => {
  try {
    const { pgId, message } = req.body;
    if (!pgId || !message) {
      return res.status(400).json({ success: false, message: 'pgId and message are required' });
    }

    const pg = await PGListing.findById(pgId);
    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG not found' });
    }

    const enquiry = await Enquiry.create({
      pgId,
      userId: req.user._id,
      ownerId: pg.ownerId,
      message,
      status: 'New'
    });

    // Log Interaction Event for ML Pipeline
    await InteractionLog.create({
      userId: req.user._id,
      pgId: pg._id,
      eventType: 'ENQUIRY',
      userRole: req.user.role || 'student'
    });

    res.status(201).json({ success: true, message: 'Enquiry sent successfully to PG Owner', enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get User's Sent Enquiries
// @route GET /api/enquiries/my
exports.getUserEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ userId: req.user._id })
      .populate({
        path: 'pgId',
        select: 'name address photos rent ownerId',
        populate: { path: 'ownerId', select: 'name mobile email' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
