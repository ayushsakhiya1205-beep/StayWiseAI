const mongoose = require('mongoose');

const interactionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PGListing',
      required: true
    },
    landmarkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Landmark',
      required: false
    },
    eventType: {
      type: String,
      enum: ['VIEW', 'WISHLIST', 'ENQUIRY', 'REVIEW', 'CLICK'],
      required: true
    },
    userRole: {
      type: String,
      enum: ['student', 'working_professional', 'anonymous'],
      default: 'anonymous'
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

interactionLogSchema.index({ pgId: 1, eventType: 1 });
interactionLogSchema.index({ userId: 1 });

module.exports = mongoose.model('InteractionLog', interactionLogSchema);
