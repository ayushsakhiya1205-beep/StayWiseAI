const InteractionLog = require('../models/InteractionLog');

// @desc Log User Interaction Event (VIEW / CLICK)
// @route POST /api/interactions
exports.logInteraction = async (req, res) => {
  try {
    const { pgId, landmarkId, eventType, userRole } = req.body;
    if (!pgId || !eventType) {
      return res.status(400).json({ success: false, message: 'pgId and eventType are required' });
    }

    const userId = req.user ? req.user._id : null;
    const role = userRole || (req.user ? req.user.role : 'anonymous');

    await InteractionLog.create({
      userId,
      pgId,
      landmarkId,
      eventType,
      userRole: role
    });

    res.json({ success: true, message: 'Interaction logged' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
