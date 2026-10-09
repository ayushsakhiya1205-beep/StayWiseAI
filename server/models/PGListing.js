const mongoose = require('mongoose');

const pgListingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true
    },
    name: {
      type: String,
      required: [true, 'PG Name is required'],
      trim: true
    },
    description: {
      type: String,
      required: true
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
    rent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: 0
    },
    deposit: {
      type: Number,
      default: 0
    },
    roomTypes: [
      {
        type: String,
        enum: ['single', 'double', 'triple', 'dormitory']
      }
    ],
    sharingType: {
      type: String,
      default: 'Double Sharing'
    },
    genderPreference: {
      type: String,
      enum: ['boys', 'girls', 'co-ed'],
      default: 'co-ed'
    },
    acType: {
      type: String,
      enum: ['ac', 'non-ac', 'both'],
      default: 'ac'
    },
    parkingType: {
      type: String,
      enum: ['bike', 'car', 'both', 'none'],
      default: 'bike'
    },
    foodAvailable: {
      type: Boolean,
      default: true
    },
    wifiAvailable: {
      type: Boolean,
      default: true
    },
    laundryAvailable: {
      type: Boolean,
      default: true
    },
    powerBackup: {
      type: Boolean,
      default: false
    },
    geyserAvailable: {
      type: Boolean,
      default: true
    },
    furnishingType: {
      type: String,
      enum: ['furnished', 'semi-furnished', 'unfurnished'],
      default: 'furnished'
    },
    photos: [
      {
        type: String
      }
    ],
    ratingAverage: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    availability: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'deactivated'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

pgListingSchema.index({ cityId: 1, status: 1, rent: 1 });
pgListingSchema.index({ ownerId: 1 });
pgListingSchema.index({ status: 1 });

module.exports = mongoose.model('PGListing', pgListingSchema);
