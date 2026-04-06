/**
 * Family Memoir App — Reverse Geocoding
 *
 * Converts GPS coordinates to a human-readable place name
 * using OpenStreetMap Nominatim (free, no API key required).
 * Rate limit: max 1 request per second.
 */

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string|null>} Place name like "Amsterdam, Netherlands" or null
 */
export async function reverseGeocode(latitude, longitude) {
  if (latitude == null || longitude == null) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FamilyMemoirApp/1.0 (prototype)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      console.error('Geocoding HTTP error:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.error) {
      console.error('Geocoding error:', data.error);
      return null;
    }

    const addr = data.address || {};
    const parts = [
      addr.city || addr.town || addr.village || addr.hamlet,
      addr.state,
      addr.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : data.display_name || null;
  } catch (err) {
    console.error('Geocoding failed:', err.message);
    return null;
  }
}
