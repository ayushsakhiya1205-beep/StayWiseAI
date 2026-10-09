import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CityContext } from '../context/CityContext';
import API from '../services/api';
import PGCard from '../components/PGCard';
import FilterSidebar from '../components/FilterSidebar';
import MapView from '../components/MapView';
import { Search, Sparkles, MapPin, GraduationCap, Briefcase, Filter, Map, RefreshCw, CheckCircle2, LocateFixed } from 'lucide-react';

export default function SearchWizard() {
  const [searchParams] = useSearchParams();
  const { cities, states, citiesByState, selectedState, changeState, landmarks, selectedCity, changeCity, fetchLandmarks } = useContext(CityContext);

  // Wizard Step states
  const [userRole, setUserRole] = useState(searchParams.get('role') || 'student');
  const [cityId, setCityId] = useState(searchParams.get('cityId') || '');
  const [landmarkId, setLandmarkId] = useState('');
  const [customLocation, setCustomLocation] = useState({ lat: '', lng: '' });

  // Preference Filter State
  const [filters, setFilters] = useState({
    maxRent: 35000,
    minRent: 0,
    roomType: 'any',
    acType: 'any',
    foodRequired: false,
    wifiRequired: false,
    parkingType: 'any',
    laundryRequired: false,
    geyserRequired: false,
    powerBackupRequired: false,
    genderPreference: 'any',
    sortBy: 'best_match'
  });

  // Results state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // --- Current Location Detection ---
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [locationStatusType, setLocationStatusType] = useState(null); // 'success' | 'error'

  // Haversine distance in km between two lat/lng pairs
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Your browser does not support location detection. Please select your city manually.');
      setLocationStatusType('error');
      return;
    }

    setLocating(true);
    setLocationStatus(null);
    setLocationStatusType(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearest city from already-loaded cities (with lat/lng)
        const citiesWithCoords = cities.filter(
          (c) => typeof c.latitude === 'number' && typeof c.longitude === 'number'
        );

        if (citiesWithCoords.length === 0) {
          setLocationStatus('Supported city coordinates are unavailable. Please select your city manually.');
          setLocationStatusType('error');
          setLocating(false);
          return;
        }

        let nearest = null;
        let minDist = Infinity;
        citiesWithCoords.forEach((city) => {
          const dist = haversineKm(latitude, longitude, city.latitude, city.longitude);
          if (dist < minDist) {
            minDist = dist;
            nearest = city;
          }
        });

        // Sanity check — reject if nearest city is more than 200 km away
        if (!nearest || minDist > 200) {
          setLocationStatus("Your location doesn't match any supported city. Please select your city manually.");
          setLocationStatusType('error');
          setLocating(false);
          return;
        }

        // Update existing dropdowns using existing context methods
        changeCity(nearest._id);
        setCityId(nearest._id);
        setLandmarkId('');

        setLocationStatus(`📍 Location detected: ${nearest.cityName}, ${nearest.state} (${Math.round(minDist)} km from city centre)`);
        setLocationStatusType('success');
        setLocating(false);
      },
      (err) => {
        let msg;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Location permission denied. Please allow location access or select your city manually.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Unable to determine your location. Please select your city manually.';
            break;
          case err.TIMEOUT:
            msg = 'Location request timed out. Please try again or select your city manually.';
            break;
          default:
            msg = 'Location detection failed. Please select your city manually.';
        }
        setLocationStatus(msg);
        setLocationStatusType('error');
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };
  // --- End Current Location Detection ---


  useEffect(() => {
    if (cities && cities.length > 0 && !cityId) {
      setCityId(cities[0]._id);
      fetchLandmarks(cities[0]._id, userRole === 'student' ? 'college' : 'office');
    }
  }, [cities]);

  useEffect(() => {
    if (cityId) {
      fetchLandmarks(cityId, userRole === 'student' ? 'college' : 'office');
    }
  }, [cityId, userRole]);

  // Execute AI Recommendation Request
  const handleSearch = async (overrideFilters = filters) => {
    if (!cityId) return;

    try {
      setLoading(true);

      const payload = {
        cityId,
        landmarkId: landmarkId || null,
        userRole,
        minRent: overrideFilters.minRent,
        maxRent: overrideFilters.maxRent,
        acType: overrideFilters.acType,
        foodRequired: overrideFilters.foodRequired,
        wifiRequired: overrideFilters.wifiRequired,
        parkingType: overrideFilters.parkingType,
        laundryRequired: overrideFilters.laundryRequired,
        geyserRequired: overrideFilters.geyserRequired,
        powerBackupRequired: overrideFilters.powerBackupRequired,
        genderPreference: overrideFilters.genderPreference,
        roomType: overrideFilters.roomType,
        sortBy: overrideFilters.sortBy,
        customLat: customLocation.lat ? parseFloat(customLocation.lat) : undefined,
        customLng: customLocation.lng ? parseFloat(customLocation.lng) : undefined
      };

      const res = await API.post('/pgs/recommend', payload);
      if (res.data.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search whenever key location parameters or filters change
  useEffect(() => {
    if (cityId) {
      handleSearch(filters);
    }
  }, [cityId, landmarkId, userRole, filters]);

  const resetFilters = () => {
    const defaultF = {
      maxRent: 25000,
      minRent: 0,
      roomType: 'any',
      acType: 'any',
      foodRequired: false,
      wifiRequired: false,
      parkingType: 'any',
      laundryRequired: false,
      geyserRequired: false,
      powerBackupRequired: false,
      genderPreference: 'any',
      sortBy: 'best_match'
    };
    setFilters(defaultF);
    handleSearch(defaultF);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* Top Search Setup Bar */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          
          {/* Step 1: Role Selection */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {userRole === 'student' ? <GraduationCap size={16} color="#16a34a" /> : <Briefcase size={16} color="#2563eb" />}
              I am searching as
            </label>
            <select
              className="form-select"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              style={{ fontWeight: 700 }}
            >
              <option value="student">🎓 Student (Near College)</option>
              <option value="working_professional">💼 Working Professional (Near Office)</option>
            </select>
          </div>

          {/* Step 2: State Selection */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">State</label>
            <select
              className="form-select"
              value={selectedState || 'Gujarat'}
              onChange={(e) => {
                changeState(e.target.value);
                setLandmarkId('');
              }}
              style={{ fontWeight: 700 }}
            >
              {states && states.map((st) => (
                <option key={st} value={st}>
                  📌 {st} State
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: District / City Selection */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">District / City</label>
            <select
              className="form-select"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                changeCity(e.target.value);
                setLandmarkId('');
              }}
              style={{ fontWeight: 700 }}
            >
              <option value="">Select District City</option>
              {citiesByState && citiesByState[selectedState] ? (
                citiesByState[selectedState].map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.cityName}
                  </option>
                ))
              ) : (
                cities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.cityName} ({c.state})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Step 3: Landmark Selection */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              {userRole === 'student' ? 'Target College / Institute' : 'Target Office / Workplace'}
            </label>
            <select
              className="form-select"
              value={landmarkId}
              onChange={(e) => setLandmarkId(e.target.value)}
            >
              <option value="">All Landmarks in City</option>
              {landmarks.map((l) => (
                <option key={l._id} value={l._id}>
                  📍 {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            disabled={locating || loading}
            className="btn"
            title="Auto-detect your location and update State & City"
            style={{
              height: '42px',
              background: locating
                ? 'linear-gradient(135deg, #15803d 0%, #166534 100%)'
                : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 15px rgba(22,163,74,0.28)',
              opacity: (locating || loading) ? 0.75 : 1,
              cursor: (locating || loading) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {locating
              ? <><RefreshCw className="animate-spin" size={16} /> Detecting…</>
              : <><LocateFixed size={16} /> Use Current Location</>
            }
          </button>

          {/* Search CTA */}
          <button
            onClick={() => handleSearch(filters)}
            disabled={loading}
            className="btn btn-primary"
            style={{ height: '42px' }}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
            Search Best PGs
          </button>

        </div>

        {/* Location Status Message */}
        {locationStatus && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: locationStatusType === 'success' ? '#f0fdf4' : '#fef2f2',
            color: locationStatusType === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${locationStatusType === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {locationStatus}
          </div>
        )}

      </div>

      {/* Main Results Layout with Sidebar */}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Left Filter Sidebar */}
        <div>
          <FilterSidebar filters={filters} onChange={(newF) => setFilters(newF)} onReset={resetFilters} />
        </div>

        {/* Right Recommended Results Feed */}
        <div>
          
          {/* Header Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  Best PGs Near {results && results.landmark ? results.landmark.name : 'Your Location'}
                </h2>
                {results && results.mode && (
                  <span className="badge badge-mode" style={{ fontSize: '0.78rem' }}>
                    <Sparkles size={12} color="#2563eb" /> Mode: {results.mode}
                  </span>
                )}
              </div>
              <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {results ? `Found ${results.total} candidate PGs ranked by AI suitability` : 'Calculating recommendations...'}
              </p>
            </div>

            {/* Map View Button */}
            {results && results.landmark && (
              <button onClick={() => setShowMapModal(true)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                <Map size={16} /> Proximity Map View
              </button>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#475569' }}>
              <RefreshCw className="animate-spin" size={32} color="#2563eb" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ fontWeight: 600, color: '#0f172a' }}>AI Engine Analyzing Distance, Rent & Facilities...</p>
            </div>
          )}

          {/* Empty Results State */}
          {!loading && results && results.pgs.length === 0 && (
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #fca5a5' }}>
                <Filter size={28} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                No PG matched all your strict criteria
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                Try relaxing your budget slider, selecting 'Any' for AC or room sharing types, or choosing a different target landmark.
              </p>
              <button onClick={resetFilters} className="btn btn-primary">
                Relax Filters
              </button>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results && results.pgs.length > 0 && (
            <div className="grid-2">
              {results.pgs.map((pg) => (
                <PGCard key={pg._id} pg={pg} />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Map View Modal */}
      {showMapModal && results && (
        <MapView landmark={results.landmark} pgs={results.pgs} onClose={() => setShowMapModal(false)} />
      )}

    </div>
  );
}
