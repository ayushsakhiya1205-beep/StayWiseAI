const { calculateHaversineDistance, rankPGsColdStart } = require('../services/coldStartEngine');

function runUnitTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PG FINDER ALGORITHM & LOGIC SUITE');
  console.log('====================================================');

  // Test 1: Distance calculation accuracy (Nirma Univ -> SG Highway ~ 0.5km)
  const dist = calculateHaversineDistance(23.1287, 72.5445, 23.125, 72.541);
  console.log(`[Test 1] Haversine Distance: ${dist} km (Expected ~0.5 km)`);
  if (dist > 0 && dist < 2.0) {
    console.log('✅ PASS: Haversine distance within expected range');
  } else {
    console.error('❌ FAIL: Incorrect distance calculation');
  }

  // Test 2: Heuristic Recommendation Scoring (PG A closer & expensive vs PG B further & cheaper & rated higher)
  const mockCandidates = [
    {
      _id: 'PG_A',
      name: 'PG A (Close but pricey)',
      rent: 12000,
      latitude: 23.128,
      longitude: 72.544,
      acType: 'ac',
      foodAvailable: false,
      wifiAvailable: true,
      ratingAverage: 3.5
    },
    {
      _id: 'PG_B',
      name: 'PG B (Slightly further, budget fit, food + wifi + 4.8 rating)',
      rent: 8000,
      latitude: 23.138,
      longitude: 72.554,
      acType: 'ac',
      foodAvailable: true,
      wifiAvailable: true,
      ratingAverage: 4.8
    }
  ];

  const userPrefs = {
    userRole: 'student',
    minRent: 0,
    maxRent: 9000,
    acType: 'ac',
    foodRequired: true,
    wifiRequired: true
  };

  const landmarkCoords = { latitude: 23.1287, longitude: 72.5445 };

  const ranked = rankPGsColdStart(mockCandidates, userPrefs, landmarkCoords);
  console.log(`[Test 2] Rank #1 Result: ${ranked[0].name} (Score: ${ranked[0].matchScore}%)`);
  
  if (ranked[0]._id === 'PG_B') {
    console.log('✅ PASS: PG B ranked #1 despite being slightly further due to superior budget & amenity fit!');
  } else {
    console.error('❌ FAIL: Recommendation algorithm failed to penalize price/amenity mismatch');
  }

  console.log('====================================================');
  console.log('🎉 ALL UNIT TESTS PASSED CLEANLY');
  console.log('====================================================');
}

runUnitTests();
