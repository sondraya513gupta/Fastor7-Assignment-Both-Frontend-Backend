import api from './api';

const DEFAULT_CITY_ID = import.meta.env.VITE_CITY_ID || 118;

/**
 * Fetch restaurant list for a given city
 * @param {number|string} city_id - City identifier (default 118)
 * @returns {Promise<Array>} List of restaurants
 */
export async function getRestaurants(city_id = DEFAULT_CITY_ID) {
  const response = await api.get('/v1/m/restaurant', {
    params: {
      city_id: city_id,
    },
  });

  // Extract results from data.results or data array
  const data = response.data;
  if (data && data.data && Array.isArray(data.data.results)) {
    return data.data.results;
  }
  if (data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}
