const mongoose = require('mongoose');

const landmarkSchema = new mongoose.Schema(
  {
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true
    },
    type: {
      type: String,
      enum: ['college', 'office'],
      required: true
    },
    name: {
      type: String,
      required: [true, 'Landmark name is required'],
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

landmarkSchema.index({ cityId: 1, type: 1 });

module.exports = mongoose.model('Landmark', landmarkSchema);
