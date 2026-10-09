const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: [true, 'City name is required'],
      unique: true,
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State name is required'],
      trim: true
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

module.exports = mongoose.model('City', citySchema);
