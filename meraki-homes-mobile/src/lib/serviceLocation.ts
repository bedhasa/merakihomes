import type { ConfirmedCustomerLocation } from '../components/CustomerLocationPicker';

type ParamValue = string | string[] | undefined;
type LocationParams = {
  latitude?: ParamValue;
  longitude?: ParamValue;
  formattedAddress?: ParamValue;
  placeId?: ParamValue;
  landmark?: ParamValue;
  area?: ParamValue;
  locationSource?: ParamValue;
  accuracy?: ParamValue;
};

function first(value: ParamValue) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseSource(value: string | undefined): ConfirmedCustomerLocation['locationSource'] {
  if (value === 'gps' || value === 'manual_search' || value === 'map') return value;
  return 'map';
}

export function locationToParams(location: ConfirmedCustomerLocation) {
  return {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    formattedAddress: location.formattedAddress,
    placeId: location.placeId || '',
    landmark: location.landmark,
    area: location.area,
    locationSource: location.locationSource,
    accuracy: location.accuracy == null ? '' : String(location.accuracy),
  };
}

export function locationFromParams(params: LocationParams): ConfirmedCustomerLocation | null {
  const latitude = Number(first(params.latitude));
  const longitude = Number(first(params.longitude));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  const accuracyValue = first(params.accuracy);
  const accuracy = accuracyValue === undefined || accuracyValue === '' ? null : Number(accuracyValue);
  return {
    latitude,
    longitude,
    formattedAddress: first(params.formattedAddress) || '',
    placeId: first(params.placeId) || null,
    area: first(params.area) || '',
    landmark: first(params.landmark) || '',
    locationSource: parseSource(first(params.locationSource)),
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
  };
}
