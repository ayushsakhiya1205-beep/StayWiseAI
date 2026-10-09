/**
 * Cold-Start Heuristic Recommendation Engine
 * Calculates Haversine distance and multi-factor recommendation score.
 */

// Calculate geographic distance using Haversine formula (returns distance in km)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Return rounded to 2 decimals
}

/**
 * Ranks candidate PGs using cold-start heuristic scoring formula
 */
function rankPGsColdStart(candidates, userPrefs, landmarkCoords) {
  const {
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
    genderPreference = 'any',
    roomType = 'any',
    furnishingType = 'any'
  } = userPrefs;

  const targetLat = landmarkCoords ? landmarkCoords.latitude : 23.0225;
  const targetLon = landmarkCoords ? landmarkCoords.longitude : 72.5714;

  // Weight profiles based on user role
  const isProfessional = userRole === 'working_professional';
  const wDist = isProfessional ? 0.25 : 0.25;
  const wPrice = isProfessional ? 0.20 : 0.30;
  const wAmenity = isProfessional ? 0.35 : 0.30;
  const wRating = isProfessional ? 0.20 : 0.15;

  const scoredPGs = candidates.map((pg) => {
    // 1. Distance score
    const distanceKm = calculateHaversineDistance(
      targetLat,
      targetLon,
      pg.latitude,
      pg.longitude
    );
    const distanceScore = 1.0 / (1.0 + distanceKm / 2.0);

    // 2. Price Fit Score
    const rent = pg.rent || 0;
    let priceFitScore = 1.0;
    if (maxRent > 0) {
      if (rent <= maxRent && rent >= minRent) {
        priceFitScore = 1.0;
      } else if (rent < minRent) {
        priceFitScore = 0.9;
      } else {
        const overflowRatio = (rent - maxRent) / maxRent;
        priceFitScore = Math.max(0.1, 1.0 - overflowRatio * 1.5);
      }
    }

    // 3. Amenity Match Score
    let totalRequested = 0;
    let matched = 0;

    if (acType && acType !== 'any') {
      totalRequested++;
      if (pg.acType === acType || pg.acType === 'both') matched++;
    }
    if (foodRequired) {
      totalRequested++;
      if (pg.foodAvailable) matched++;
    }
    if (wifiRequired) {
      totalRequested++;
      if (pg.wifiAvailable) matched++;
    }
    if (parkingType && parkingType !== 'any' && parkingType !== 'none') {
      totalRequested++;
      if (pg.parkingType === parkingType || pg.parkingType === 'both') matched++;
    }
    if (laundryRequired) {
      totalRequested++;
      if (pg.laundryAvailable) matched++;
    }
    if (geyserRequired) {
      totalRequested++;
      if (pg.geyserAvailable) matched++;
    }
    if (powerBackupRequired) {
      totalRequested++;
      if (pg.powerBackup) matched++;
    }
    if (genderPreference && genderPreference !== 'any') {
      totalRequested++;
      if (pg.genderPreference === genderPreference || pg.genderPreference === 'co-ed') matched++;
    }
    if (roomType && roomType !== 'any') {
      totalRequested++;
      if (Array.isArray(pg.roomTypes) && pg.roomTypes.includes(roomType)) matched++;
    }
    if (furnishingType && furnishingType !== 'any') {
      totalRequested++;
      if (pg.furnishingType === furnishingType) matched++;
    }

    const amenityMatchPct = totalRequested > 0 ? matched / totalRequested : 1.0;

    // 4. Rating score
    const ratingScore = (pg.ratingAverage || 4.0) / 5.0;

    // Combined Weighted Score (0 to 1)
    const rawScore =
      wDist * distanceScore +
      wPrice * priceFitScore +
      wAmenity * amenityMatchPct +
      wRating * ratingScore;

    const matchPercentage = Math.round(Math.min(0.99, Math.max(0.40, rawScore)) * 100);

    // Build human-readable breakdown indicators
    const indicators = {
      distance: distanceKm <= 1.5 ? 'Excellent' : distanceKm <= 3.5 ? 'Good' : 'Moderate',
      budget: rent <= maxRent ? 'Fits Budget' : 'Above Budget',
      amenities: `${Math.round(amenityMatchPct * 100)}% Matched`,
      rating: `${pg.ratingAverage || 4.0} ★`
    };

    // Generate clear, explainable reason text
    const matchedFeaturesList = [];
    if (pg.wifiAvailable && wifiRequired) matchedFeaturesList.push('Wi-Fi');
    if (pg.foodAvailable && foodRequired) matchedFeaturesList.push('Food');
    if ((pg.acType === 'ac' || pg.acType === 'both') && acType === 'ac') matchedFeaturesList.push('AC');

    const featureStr = matchedFeaturesList.length > 0 ? matchedFeaturesList.join(', ') : 'key facilities';
    const reason = `Great match! Only ${distanceKm} km away, fits your ₹${rent.toLocaleString('en-IN')}/mo budget, matches ${featureStr}, and has a rating of ${pg.ratingAverage || 4.0}/5.`;

    const pgObj = pg.toObject ? pg.toObject() : pg;

    return {
      ...pgObj,
      distanceKm,
      matchScore: matchPercentage,
      recommendationScore: rawScore,
      recommendationMode: 'Cold Start Recommendation',
      indicators,
      recommendationReason: reason,
      featureScores: {
        distanceScore: Math.round(distanceScore * 100) / 100,
        priceFitScore: Math.round(priceFitScore * 100) / 100,
        amenityMatchPct: Math.round(amenityMatchPct * 100) / 100,
        ratingScore: Math.round(ratingScore * 100) / 100
      }
    };
  });

  // Sort descending by raw recommendation score
  scoredPGs.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Assign ranks
  return scoredPGs.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

module.exports = {
  calculateHaversineDistance,
  rankPGsColdStart
};
