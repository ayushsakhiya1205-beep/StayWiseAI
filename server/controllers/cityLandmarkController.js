const mongoose = require('mongoose');
const City = require('../models/City');
const Landmark = require('../models/Landmark');
const defaultCities = require('../data/defaultCities');

// @desc Get all active cities
// @route GET /api/cities
exports.getCities = async (req, res) => {
  try {
    let cities = await City.find({ active: true }).sort({ state: 1, cityName: 1 });
    if (!cities || cities.length === 0) {
      cities = defaultCities;
    }
    res.json({ success: true, cities });
  } catch (error) {
    res.json({ success: true, cities: defaultCities });
  }
};

// @desc Get landmarks by city and type
// @route GET /api/landmarks?cityId=xxx&type=college
exports.getLandmarks = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, landmarks: [] });
    }

    const { cityId, type } = req.query;
    const filter = { active: true };
    if (cityId) {
      if (!mongoose.Types.ObjectId.isValid(cityId)) {
        return res.json({ success: true, landmarks: [] });
      }
      filter.cityId = cityId;
    }
    if (type) filter.type = type;

    const landmarks = await Landmark.find(filter).populate('cityId', 'cityName').sort({ name: 1 });
    res.json({ success: true, landmarks });
  } catch (error) {
    res.json({ success: true, landmarks: [] });
  }
};

// @desc Admin: Add City
// @route POST /api/cities
exports.addCity = async (req, res) => {
  try {
    const { cityName, state, latitude, longitude } = req.body;
    const city = await City.create({ cityName, state, latitude, longitude });
    res.status(201).json({ success: true, city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Admin: Edit City
// @route PUT /api/cities/:id
exports.editCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Admin: Add Landmark
// @route POST /api/landmarks
exports.addLandmark = async (req, res) => {
  try {
    const { cityId, type, name, address, latitude, longitude } = req.body;
    const landmark = await Landmark.create({ cityId, type, name, address, latitude, longitude });
    res.status(201).json({ success: true, landmark });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Admin: Edit Landmark
// @route PUT /api/landmarks/:id
exports.editLandmark = async (req, res) => {
  try {
    const landmark = await Landmark.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, landmark });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
