// Geospatial helpers shared by the nearby-professional search and the
// booking-scoped live location sharing endpoints.
//
// All distances are great-circle ("as the crow flies") distances computed with
// the Haversine formula on the raw coordinates. Never describe these values as
// road or driving distance.

const EARTH_RADIUS_METERS = 6371008.8;

const LOCATION_LIVE_MS = 10 * 60 * 1000;
const LOCATION_RECENT_MS = 6 * 60 * 60 * 1000;

function isFiniteNumber(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

/**
 * Great-circle distance in whole meters, or null when any coordinate is missing.
 * Rounding to the nearest meter keeps the value usable for sorting without
 * destroying precision the way coordinate rounding would.
 */
export function haversineMeters(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(isFiniteNumber)) return null;
  const toRadians = degrees => (Number(degrees) * Math.PI) / 180;
  const deltaLat = toRadians(Number(lat2) - Number(lat1));
  const deltaLon = toRadians(Number(lon2) - Number(lon1));
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  return Math.round(EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Validates a coordinate pair received from a client. Returns a message when the
 * value must be rejected, otherwise null.
 */
export function coordinateError(latitude, longitude, { required = false } = {}) {
  const latitudeMissing = latitude === null || latitude === undefined;
  const longitudeMissing = longitude === null || longitude === undefined;
  if (latitudeMissing || longitudeMissing) {
    // Both absent is only an error when the caller requires a position.
    if (latitudeMissing && longitudeMissing && !required) return null;
    return 'Send both latitude and longitude.';
  }
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return 'Coordinates must be numbers.';
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90.';
  if (lon < -180 || lon > 180) return 'Longitude must be between -180 and 180.';
  if (lat === 0 && lon === 0) return 'That coordinate is a null island placeholder, not a real location.';
  return null;
}

/**
 * Accuracy in meters from a device fix. Rejects negative or absurd values.
 */
export function accuracyError(accuracyMeters) {
  if (accuracyMeters === null || accuracyMeters === undefined) return null;
  if (!isFiniteNumber(accuracyMeters)) return 'Accuracy must be a number of meters.';
  const value = Number(accuracyMeters);
  if (value < 0 || value > 100000) return 'Accuracy must be between 0 and 100000 meters.';
  return null;
}

/**
 * How trustworthy a stored professional position is. Stale positions must not be
 * presented as an accurate distance, so callers suppress the number instead.
 */
export function locationFreshness(updatedAt, now = Date.now()) {
  if (!updatedAt) return 'unknown';
  const timestamp = new Date(updatedAt).getTime();
  if (!Number.isFinite(timestamp)) return 'unknown';
  const age = now - timestamp;
  if (age <= LOCATION_LIVE_MS) return 'live';
  if (age <= LOCATION_RECENT_MS) return 'recent';
  return 'stale';
}

/**
 * Human label for a distance. Meters below one kilometer, one-decimal kilometers
 * above it.
 */
export function distanceLabel(meters) {
  if (meters === null || meters === undefined) return null;
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * The distance block returned to clients. distanceMeters is the raw Haversine
 * value; distanceKm is the same number in kilometers, unrounded. distanceKind
 * makes the straight-line nature explicit so the UI never calls it driving
 * distance.
 */
export function distancePayload(meters) {
  if (meters === null || meters === undefined) {
    return { distanceMeters: null, distanceKm: null, distanceLabel: null, distanceKind: 'straight_line' };
  }
  return {
    distanceMeters: meters,
    distanceKm: Number((meters / 1000).toFixed(3)),
    distanceLabel: distanceLabel(meters),
    distanceKind: 'straight_line',
  };
}

export const locationThresholds = { liveMs: LOCATION_LIVE_MS, recentMs: LOCATION_RECENT_MS };

const ADDIS_BIAS = 'proximity:38.7578,9.03';

export function geoapifySearchText(query) {
  return String(query || '').trim();
}

export function mapGeoapifySearchFeatures(features) {
  return (features || []).map(feature => {
    const properties = feature?.properties || {};
    const latitude = Number(properties.lat);
    const longitude = Number(properties.lon);
    return {
      label: String(properties.formatted || properties.name || '').trim(),
      latitude,
      longitude,
      placeId: properties.place_id || null,
      area: properties.neighbourhood || properties.suburb || properties.district || properties.city || '',
      landmark: properties.name || properties.street || '',
      countryCode: String(properties.country_code || '').toLowerCase(),
    };
  }).filter(item => item.label
    && Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
    && item.latitude >= -90 && item.latitude <= 90
    && item.longitude >= -180 && item.longitude <= 180
    && !(item.latitude === 0 && item.longitude === 0)
    && (!item.countryCode || item.countryCode === 'et'));
}

export function mapGeoapifyReverseFeature(feature) {
  const properties = feature?.properties;
  if (!properties) return { formattedAddress: null, placeId: null, area: '', landmark: '' };
  return {
    formattedAddress: properties.formatted || null,
    placeId: properties.place_id || null,
    area: properties.neighbourhood || properties.suburb || properties.district || properties.city || '',
    landmark: properties.name || properties.street || '',
  };
}

export function geoapifySearchUrl(query, apiKey) {
  const url = new URL('https://api.geoapify.com/v1/geocode/search');
  url.searchParams.set('text', geoapifySearchText(query));
  url.searchParams.set('filter', 'countrycode:et');
  url.searchParams.set('bias', ADDIS_BIAS);
  url.searchParams.set('limit', '5');
  url.searchParams.set('apiKey', apiKey);
  return url;
}

export function geoapifyReverseUrl(latitude, longitude, apiKey) {
  const url = new URL('https://api.geoapify.com/v1/geocode/reverse');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));
  url.searchParams.set('apiKey', apiKey);
  return url;
}
