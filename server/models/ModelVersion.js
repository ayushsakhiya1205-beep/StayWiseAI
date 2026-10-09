const mongoose = require('mongoose');

const modelVersionSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true
    },
    algorithm: {
      type: String,
      default: 'GradientBoostingRegressor'
    },
    sampleCount: {
      type: Number,
      default: 0
    },
    trainRows: {
      type: Number,
      default: 0
    },
    testRows: {
      type: Number,
      default: 0
    },
    precisionAtK: {
      type: Number,
      default: 0
    },
    ndcgAtK: {
      type: Number,
      default: 0
    },
    precisionAt10: {
      type: Number,
      default: 0
    },
    ndcgAt10: {
      type: Number,
      default: 0
    },
    r2Score: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ModelVersion', modelVersionSchema);
