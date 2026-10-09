const axios = require('axios');
const { rankPGsColdStart } = require('./coldStartEngine');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Gets ranked PGs from ML service, falling back to Cold-Start engine if ML service is unavailable.
 */
async function getRankedPGs(candidates, userPrefs, landmarkCoords) {
  try {
    const payload = {
      userPrefs,
      landmarkCoords,
      candidates: candidates.map((pg) => {
        const p = pg.toObject ? pg.toObject() : pg;
        return {
          id: p._id.toString(),
          name: p.name,
          rent: p.rent,
          latitude: p.latitude,
          longitude: p.longitude,
          acType: p.acType,
          foodAvailable: p.foodAvailable,
          wifiAvailable: p.wifiAvailable,
          parkingType: p.parkingType,
          laundryAvailable: p.laundryAvailable,
          powerBackup: p.powerBackup,
          geyserAvailable: p.geyserAvailable,
          furnishingType: p.furnishingType,
          genderPreference: p.genderPreference,
          roomTypes: p.roomTypes || [],
          ratingAverage: p.ratingAverage || 4.0,
          ratingCount: p.ratingCount || 0
        };
      })
    };

    const response = await axios.post(`${ML_SERVICE_URL}/api/recommend`, payload, {
      timeout: 3000
    });

    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      const mlResults = response.data.results;
      const resultMap = new Map(mlResults.map((r) => [r.id, r]));

      // Merge ML scores back into candidate PG objects
      const merged = candidates.map((pg) => {
        const pObj = pg.toObject ? pg.toObject() : pg;
        const mlItem = resultMap.get(pObj._id.toString());

        if (mlItem) {
          return {
            ...pObj,
            distanceKm: mlItem.distanceKm,
            matchScore: mlItem.matchScore,
            recommendationScore: mlItem.score,
            recommendationMode: response.data.mode || 'AI Personalized',
            indicators: mlItem.indicators,
            recommendationReason: mlItem.reason,
            featureScores: mlItem.featureScores,
            rank: mlItem.rank
          };
        } else {
          return pObj;
        }
      });

      merged.sort((a, b) => (a.rank || 999) - (b.rank || 999));
      return {
        mode: response.data.mode || 'AI Personalized',
        pgs: merged
      };
    }
  } catch (error) {
    console.warn(`[ML Client Warning] ML Service unavailable (${error.message}). Falling back to Cold Start Engine.`);
  }

  // Fallback to JS Cold-Start Engine
  const ranked = rankPGsColdStart(candidates, userPrefs, landmarkCoords);
  return {
    mode: 'Smart Match (Cold Start Fallback)',
    pgs: ranked
  };
}

module.exports = {
  getRankedPGs
};
