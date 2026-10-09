const mongoose = require('mongoose');
const PGListing = require('../models/PGListing');
const Landmark = require('../models/Landmark');
const Review = require('../models/Review');
const { getRankedPGs } = require('../services/mlClient');

// @desc Search & AI Recommendation endpoint
// @route POST /api/pgs/recommend
exports.searchAndRecommendPGs = async (req, res) => {
  try {
    const {
      cityId,
      landmarkId,
      userRole = 'student',
      minRent = 0,
      maxRent = 50000,
      acType = 'any',
      foodRequired = false,
      wifiRequired = false,
      parkingType = 'any',
      laundryRequired = false,
      geyserRequired = false,
      powerBackupRequired = false,
      furnishingType = 'any',
      genderPreference = 'any',
      roomType = 'any',
      customLat,
      customLng,
      sortBy = 'best_match'
    } = req.body;

    if (!cityId) {
      return res.status(400).json({ success: false, message: 'cityId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.json({
        success: true,
        mode: 'Smart Match',
        total: 0,
        pgs: [],
        message: 'No PGs matched all your requirements.'
      });
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        mode: 'Offline Mode',
        total: 0,
        pgs: [],
        message: 'Database connection offline. Please check your network or whitelist your IP address on MongoDB Atlas.'
      });
    }

    // 1. Determine landmark coordinates
    let landmarkCoords = null;
    let landmarkObj = null;

    if (landmarkId && mongoose.Types.ObjectId.isValid(landmarkId)) {
      landmarkObj = await Landmark.findById(landmarkId);
      if (landmarkObj) {
        landmarkCoords = {
          latitude: landmarkObj.latitude,
          longitude: landmarkObj.longitude,
          name: landmarkObj.name
        };
      }
    }

    if (!landmarkCoords && customLat && customLng) {
      landmarkCoords = {
        latitude: parseFloat(customLat),
        longitude: parseFloat(customLng),
        name: 'Selected Location'
      };
    }

    // 2. Query Approved PGs in the city
    const queryFilter = {
      cityId,
      status: 'approved',
      availability: true
    };

    // Rent filter
    if (maxRent > 0) {
      queryFilter.rent = { $gte: minRent || 0, $lte: maxRent };
    }

    // Mandatory Gender Filter if explicitly requested
    if (genderPreference && genderPreference !== 'any') {
      queryFilter.genderPreference = { $in: [genderPreference, 'co-ed'] };
    }

    // Mandatory Room Type filter if specified
    if (roomType && roomType !== 'any') {
      queryFilter.roomTypes = roomType;
    }

    // Mandatory AC filter if specified strictly
    if (acType === 'ac') {
      queryFilter.acType = { $in: ['ac', 'both'] };
    } else if (acType === 'non-ac') {
      queryFilter.acType = { $in: ['non-ac', 'both'] };
    }

    const candidatePGs = await PGListing.find(queryFilter)
      .populate('cityId', 'cityName state')
      .populate('ownerId', 'name mobile email');

    if (!candidatePGs || candidatePGs.length === 0) {
      return res.json({
        success: true,
        mode: 'Smart Match',
        total: 0,
        pgs: [],
        message: 'No PGs matched all your requirements. Try relaxing your filters or budget range.'
      });
    }

    // 3. User Preferences package
    const userPrefs = {
      userRole,
      minRent,
      maxRent,
      acType,
      foodRequired,
      wifiRequired,
      parkingType,
      laundryRequired,
      geyserRequired,
      powerBackupRequired,
      furnishingType,
      genderPreference,
      roomType
    };

    // 4. Send to ML Service / Cold Start Engine
    const { mode, pgs } = await getRankedPGs(candidatePGs, userPrefs, landmarkCoords);

    // 5. Apply Secondary Sorting if requested
    let finalPGs = [...pgs];
    if (sortBy === 'nearest') {
      finalPGs.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'lowest_rent') {
      finalPGs.sort((a, b) => a.rent - b.rent);
    } else if (sortBy === 'highest_rated') {
      finalPGs.sort((a, b) => b.ratingAverage - a.ratingAverage);
    } // default is best_match (sorted by recommendationScore)

    res.json({
      success: true,
      mode,
      landmark: landmarkCoords,
      total: finalPGs.length,
      pgs: finalPGs
    });
  } catch (error) {
    console.error('Search & Recommend Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single PG Details
// @route GET /api/pgs/:id
exports.getPGById = async (req, res) => {
  try {
    const pg = await PGListing.findById(req.params.id)
      .populate('cityId', 'cityName state')
      .populate('ownerId', 'name mobile email');

    if (!pg) {
      return res.status(404).json({ success: false, message: 'PG Listing not found' });
    }

    const reviews = await Review.find({ pgId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pg,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
