import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const CityContext = createContext();

const FALLBACK_CITIES = [
  // GUJARAT (33 Districts)
  { _id: '65f000000000000000000001', cityName: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { _id: '65f000000000000000000002', cityName: 'Amreli', state: 'Gujarat', latitude: 21.6032, longitude: 71.2221 },
  { _id: '65f000000000000000000003', cityName: 'Anand', state: 'Gujarat', latitude: 22.5645, longitude: 72.9289 },
  { _id: '65f000000000000000000004', cityName: 'Aravalli', state: 'Gujarat', latitude: 23.5135, longitude: 73.2325 },
  { _id: '65f000000000000000000005', cityName: 'Banaskantha', state: 'Gujarat', latitude: 24.1724, longitude: 72.4346 },
  { _id: '65f000000000000000000006', cityName: 'Bharuch', state: 'Gujarat', latitude: 21.7051, longitude: 72.9959 },
  { _id: '65f000000000000000000007', cityName: 'Bhavnagar', state: 'Gujarat', latitude: 21.7645, longitude: 72.1519 },
  { _id: '65f000000000000000000008', cityName: 'Botad', state: 'Gujarat', latitude: 22.1704, longitude: 71.6684 },
  { _id: '65f000000000000000000009', cityName: 'Chhota Udaipur', state: 'Gujarat', latitude: 22.3082, longitude: 74.0094 },
  { _id: '65f000000000000000000010', cityName: 'Dahod', state: 'Gujarat', latitude: 22.8347, longitude: 74.2547 },
  { _id: '65f000000000000000000011', cityName: 'Dang', state: 'Gujarat', latitude: 20.7303, longitude: 73.7042 },
  { _id: '65f000000000000000000012', cityName: 'Devbhoomi Dwarka', state: 'Gujarat', latitude: 22.2394, longitude: 68.9678 },
  { _id: '65f000000000000000000013', cityName: 'Gandhinagar', state: 'Gujarat', latitude: 23.2156, longitude: 72.6369 },
  { _id: '65f000000000000000000014', cityName: 'Gir Somnath', state: 'Gujarat', latitude: 20.9038, longitude: 70.3697 },
  { _id: '65f000000000000000000015', cityName: 'Jamnagar', state: 'Gujarat', latitude: 22.4707, longitude: 70.0577 },
  { _id: '65f000000000000000000016', cityName: 'Junagadh', state: 'Gujarat', latitude: 21.5222, longitude: 70.4579 },
  { _id: '65f000000000000000000017', cityName: 'Kheda', state: 'Gujarat', latitude: 22.7505, longitude: 72.6841 },
  { _id: '65f000000000000000000018', cityName: 'Kutch', state: 'Gujarat', latitude: 23.7337, longitude: 69.8597 },
  { _id: '65f000000000000000000019', cityName: 'Mahisagar', state: 'Gujarat', latitude: 23.1772, longitude: 73.5412 },
  { _id: '65f000000000000000000020', cityName: 'Mehsana', state: 'Gujarat', latitude: 23.6000, longitude: 72.4000 },
  { _id: '65f000000000000000000021', cityName: 'Morbi', state: 'Gujarat', latitude: 22.8173, longitude: 70.8367 },
  { _id: '65f000000000000000000022', cityName: 'Narmada', state: 'Gujarat', latitude: 21.8703, longitude: 73.5670 },
  { _id: '65f000000000000000000023', cityName: 'Navsari', state: 'Gujarat', latitude: 20.9467, longitude: 72.9520 },
  { _id: '65f000000000000000000024', cityName: 'Panchmahal', state: 'Gujarat', latitude: 22.7712, longitude: 73.6146 },
  { _id: '65f000000000000000000025', cityName: 'Patan', state: 'Gujarat', latitude: 23.8493, longitude: 72.1266 },
  { _id: '65f000000000000000000026', cityName: 'Porbandar', state: 'Gujarat', latitude: 21.6417, longitude: 69.6293 },
  { _id: '65f000000000000000000027', cityName: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
  { _id: '65f000000000000000000028', cityName: 'Sabarkantha', state: 'Gujarat', latitude: 23.5979, longitude: 72.9698 },
  { _id: '65f000000000000000000029', cityName: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { _id: '65f000000000000000000030', cityName: 'Surendranagar', state: 'Gujarat', latitude: 22.7224, longitude: 71.6380 },
  { _id: '65f000000000000000000031', cityName: 'Tapi', state: 'Gujarat', latitude: 21.1895, longitude: 73.4182 },
  { _id: '65f000000000000000000032', cityName: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { _id: '65f000000000000000000033', cityName: 'Valsad', state: 'Gujarat', latitude: 20.5992, longitude: 72.9342 },

  // MAHARASHTRA (36 Districts)
  { _id: '65f000000000000000000101', cityName: 'Ahmednagar', state: 'Maharashtra', latitude: 19.0952, longitude: 74.7496 },
  { _id: '65f000000000000000000102', cityName: 'Akola', state: 'Maharashtra', latitude: 20.7002, longitude: 77.0082 },
  { _id: '65f000000000000000000103', cityName: 'Amravati', state: 'Maharashtra', latitude: 20.9374, longitude: 77.7796 },
  { _id: '65f000000000000000000104', cityName: 'Chhatrapati Sambhajinagar (Aurangabad)', state: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { _id: '65f000000000000000000105', cityName: 'Beed', state: 'Maharashtra', latitude: 18.9891, longitude: 75.7601 },
  { _id: '65f000000000000000000106', cityName: 'Bhandara', state: 'Maharashtra', latitude: 21.1685, longitude: 79.6557 },
  { _id: '65f000000000000000000107', cityName: 'Buldhana', state: 'Maharashtra', latitude: 20.5293, longitude: 76.1843 },
  { _id: '65f000000000000000000108', cityName: 'Chandrapur', state: 'Maharashtra', latitude: 19.9615, longitude: 79.2961 },
  { _id: '65f000000000000000000109', cityName: 'Dhule', state: 'Maharashtra', latitude: 20.9042, longitude: 74.7749 },
  { _id: '65f000000000000000000110', cityName: 'Gadchiroli', state: 'Maharashtra', latitude: 20.1849, longitude: 79.9972 },
  { _id: '65f000000000000000000111', cityName: 'Gondia', state: 'Maharashtra', latitude: 21.4624, longitude: 80.1961 },
  { _id: '65f000000000000000000112', cityName: 'Hingoli', state: 'Maharashtra', latitude: 19.7176, longitude: 77.1473 },
  { _id: '65f000000000000000000113', cityName: 'Jalgaon', state: 'Maharashtra', latitude: 21.0077, longitude: 75.5626 },
  { _id: '65f000000000000000000114', cityName: 'Jalna', state: 'Maharashtra', latitude: 19.8410, longitude: 75.8864 },
  { _id: '65f000000000000000000115', cityName: 'Kolhapur', state: 'Maharashtra', latitude: 16.7050, longitude: 74.2433 },
  { _id: '65f000000000000000000116', cityName: 'Latur', state: 'Maharashtra', latitude: 18.4088, longitude: 76.5604 },
  { _id: '65f000000000000000000117', cityName: 'Mumbai City', state: 'Maharashtra', latitude: 18.9388, longitude: 72.8353 },
  { _id: '65f000000000000000000118', cityName: 'Mumbai Suburban', state: 'Maharashtra', latitude: 19.1176, longitude: 72.8481 },
  { _id: '65f000000000000000000119', cityName: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { _id: '65f000000000000000000120', cityName: 'Nanded', state: 'Maharashtra', latitude: 19.1383, longitude: 77.3210 },
  { _id: '65f000000000000000000121', cityName: 'Nandurbar', state: 'Maharashtra', latitude: 21.3713, longitude: 74.2409 },
  { _id: '65f000000000000000000122', cityName: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { _id: '65f000000000000000000123', cityName: 'Dharashiv (Osmanabad)', state: 'Maharashtra', latitude: 18.1861, longitude: 76.0419 },
  { _id: '65f000000000000000000124', cityName: 'Palghar', state: 'Maharashtra', latitude: 19.6936, longitude: 72.7655 },
  { _id: '65f000000000000000000125', cityName: 'Parbhani', state: 'Maharashtra', latitude: 19.2686, longitude: 76.7709 },
  { _id: '65f000000000000000000126', cityName: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { _id: '65f000000000000000000127', cityName: 'Raigad', state: 'Maharashtra', latitude: 18.5158, longitude: 73.1822 },
  { _id: '65f000000000000000000128', cityName: 'Ratnagiri', state: 'Maharashtra', latitude: 16.9902, longitude: 73.3120 },
  { _id: '65f000000000000000000129', cityName: 'Sangli', state: 'Maharashtra', latitude: 16.8524, longitude: 74.5815 },
  { _id: '65f000000000000000000130', cityName: 'Satara', state: 'Maharashtra', latitude: 17.6805, longitude: 74.0183 },
  { _id: '65f000000000000000000131', cityName: 'Sindhudurg', state: 'Maharashtra', latitude: 16.1264, longitude: 73.6993 },
  { _id: '65f000000000000000000132', cityName: 'Solapur', state: 'Maharashtra', latitude: 17.6599, longitude: 75.9064 },
  { _id: '65f000000000000000000133', cityName: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
  { _id: '65f000000000000000000134', cityName: 'Wardha', state: 'Maharashtra', latitude: 20.7453, longitude: 78.6022 },
  { _id: '65f000000000000000000135', cityName: 'Washim', state: 'Maharashtra', latitude: 20.1018, longitude: 77.1350 },
  { _id: '65f000000000000000000136', cityName: 'Yavatmal', state: 'Maharashtra', latitude: 20.3888, longitude: 78.1204 }
];

export const CityProvider = ({ children }) => {
  const [cities, setCities] = useState(FALLBACK_CITIES);
  const [landmarks, setLandmarks] = useState([]);
  const [selectedState, setSelectedState] = useState('Gujarat');
  const [selectedCity, setSelectedCity] = useState(FALLBACK_CITIES[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await API.get('/cities');
      if (res.data.success && res.data.cities && res.data.cities.length > 0) {
        setCities(res.data.cities);
        const initialCity = res.data.cities[0];
        setSelectedCity(initialCity);
        setSelectedState(initialCity.state || 'Gujarat');
        fetchLandmarks(initialCity._id);
      }
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLandmarks = async (cityId, type = null) => {
    try {
      let url = `/landmarks?cityId=${cityId}`;
      if (type) url += `&type=${type}`;
      const res = await API.get(url);
      if (res.data.success) {
        setLandmarks(res.data.landmarks);
      }
    } catch (err) {
      console.error('Failed to load landmarks:', err);
    }
  };

  const changeCity = (cityId) => {
    const city = cities.find((c) => c._id === cityId);
    if (city) {
      setSelectedCity(city);
      setSelectedState(city.state);
      fetchLandmarks(city._id);
    }
  };

  const changeState = (stateName) => {
    setSelectedState(stateName);
    const stateCities = cities.filter((c) => c.state === stateName);
    if (stateCities.length > 0) {
      setSelectedCity(stateCities[0]);
      fetchLandmarks(stateCities[0]._id);
    }
  };

  // Derive unique states list and grouped cities
  const states = Array.from(new Set(cities.map((c) => c.state))).filter(Boolean);
  const citiesByState = cities.reduce((acc, c) => {
    const st = c.state || 'Other';
    if (!acc[st]) acc[st] = [];
    acc[st].push(c);
    return acc;
  }, {});

  return (
    <CityContext.Provider
      value={{
        cities,
        states,
        citiesByState,
        landmarks,
        selectedState,
        selectedCity,
        changeCity,
        changeState,
        fetchLandmarks,
        loading
      }}
    >
      {children}
    </CityContext.Provider>
  );
};
