import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { ApiError, searchLocations } from '@shared/api';
import { LocateFixed, MapPin, Search } from 'lucide-react';

export type LocationValue = { latitude: number | null; longitude: number | null; method: 'manual' | 'search' | 'map'; confirmed: boolean };
type Props = { value: LocationValue; address: string; landmark: string; onChange: (value: LocationValue) => void; onAddress: (address: string) => void; onLandmark: (landmark: string) => void };
const ADDIS: [number, number] = [9.03, 38.74];
const MAP_TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const USES_OSM_TILES = MAP_TILE_URL.includes('tile.openstreetmap.org');
const pinIcon = L.divIcon({ className: 'meraki-map-pin', html: '<span></span>', iconSize: [24, 24], iconAnchor: [12, 12] });

export const LocationPicker: React.FC<Props> = ({ value, address, landmark, onChange, onAddress, onLandmark }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof searchLocations>>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [mapError, setMapError] = useState(false);
  const selected = value.latitude !== null && value.longitude !== null ? [value.latitude, value.longitude] as [number, number] : null;

  useEffect(() => {
    const text = query.trim();
    if (text.length < 3) { setSuggestions([]); setLoading(false); return; }
    let live = true;
    const timer = setTimeout(() => {
      setLoading(true);
      searchLocations(text).then(items => {
        if (live) { setSuggestions(items); setMessage(items.length ? '' : 'No results. Enter an address or use the map.'); }
      }).catch(error => {
        if (live) {
          setSuggestions([]);
          setMessage(error instanceof ApiError && error.status === 503 ? 'Address search unavailable. Enter the address or use the map.' : 'Search unavailable. Enter the address or use the map.');
        }
      }).finally(() => { if (live) setLoading(false); });
    }, 450);
    return () => { live = false; clearTimeout(timer); };
  }, [query]);

  const choose = (item: { label: string; latitude: number; longitude: number }) => {
    onAddress(item.label);
    onChange({ latitude: item.latitude, longitude: item.longitude, method: 'search', confirmed: false });
    setConfirmed(false);
    setQuery(item.label);
    setSuggestions([]);
    setMessage('Address selected. Confirm the pin.');
  };

  const useCurrent = () => {
    if (!navigator.geolocation) { setMessage('Location access unavailable.'); return; }
    setMessage('');
    navigator.geolocation.getCurrentPosition(position => {
      onChange({ latitude: position.coords.latitude, longitude: position.coords.longitude, method: 'map', confirmed: false });
      setConfirmed(false);
      setMessage('Location pin selected. Confirm to continue.');
    }, () => setMessage('Location permission denied.'), { enableHighAccuracy: true, timeout: 10000 });
  };

  return <section className="space-y-4" aria-label="Service location">
    <div className="relative">
      <label htmlFor="location-search" className="block text-sm font-medium text-[#334155]">Search address
        <span className="relative mt-2 block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input id="location-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Street or landmark" className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/25" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={suggestions.length > 0} aria-controls="location-suggestions" aria-describedby="location-search-status"/></span>
      </label>
      <p id="location-search-status" role="status" aria-live="polite" className={loading || message ? 'mt-2 text-xs text-slate-600' : 'sr-only'}>{loading ? 'Searching…' : message}</p>
      {suggestions.length > 0 && <ul id="location-suggestions" role="listbox" aria-label="Address suggestions" className="absolute z-[1000] mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">{suggestions.map((item, index) => <li role="option" aria-selected="false" key={`${item.latitude}:${item.longitude}:${index}`}><button type="button" onClick={() => choose(item)} className="w-full rounded px-3 py-3 text-left text-sm hover:bg-[#D4A853]/15 focus:bg-[#D4A853]/15 focus:outline-none">{item.label}</button></li>)}</ul>}
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <label htmlFor="booking-address" className="block text-sm font-medium text-[#334155]">Street or building <span className="text-red-700">*</span><input id="booking-address" name="address" value={address} maxLength={300} placeholder="Enter address" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/25" onChange={event => { onAddress(event.target.value); onChange({ latitude: null, longitude: null, method: 'manual', confirmed: false }); setConfirmed(false); }}/></label>
      <label htmlFor="booking-landmark" className="block text-sm font-medium text-[#334155]">Landmark <span className="font-normal text-slate-500">(optional)</span><input id="booking-landmark" name="nearbyLandmark" value={landmark} onChange={event => onLandmark(event.target.value)} maxLength={160} placeholder="Nearby landmark" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/25"/></label>
    </div>

    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#D4A853]/15 text-[#102A43]"><MapPin size={18}/></span><p className="text-sm font-semibold text-[#102A43]">Map pin</p></div>
        <button type="button" onClick={useCurrent} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-semibold text-[#102A43] hover:border-[#D4A853] hover:bg-[#D4A853]/10 focus:outline-none focus:ring-2 focus:ring-[#D4A853]"><LocateFixed size={15}/> Use my location</button>
      </div>
      {mapError && <p role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">Map unavailable. You can enter the address manually.</p>}
      <div className="meraki-location-map h-72 w-full sm:h-80">
        <MapContainer center={selected || ADDIS} zoom={selected ? 16 : 12} scrollWheelZoom={false} zoomControl={false} className="h-full w-full" aria-label="Map to select service location">
          <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} eventHandlers={{ tileerror: () => setMapError(true), tileload: () => setMapError(false) }}/>
          <ZoomControl position="topright"/>
          <MapTap selected={selected} onChange={point => { setConfirmed(false); onChange({ latitude: point[0], longitude: point[1], method: 'map', confirmed: false }); }}/>
        </MapContainer>
      </div>
      <div className="space-y-3 border-t border-slate-200 bg-[#F7F8FA] p-4">
        {selected ? <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-xs text-slate-600">{selected[0].toFixed(5)}, {selected[1].toFixed(5)}</p><button type="button" onClick={() => { setConfirmed(true); onChange({ ...value, confirmed: true }); setMessage('Location confirmed.'); }} className="min-h-11 rounded-xl bg-[#102A43] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#D4A853]">{confirmed || value.confirmed ? 'Location confirmed' : 'Confirm pin'}</button></div> : <p className="text-xs text-slate-600">Map pin optional</p>}
        <p className="text-[11px] leading-5 text-slate-500">Map attribution appears in the map controls. Address search powered by <a className="underline" href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> when configured.{USES_OSM_TILES && <> <a className="underline" href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">Report a map issue</a>.</>}</p>
      </div>
    </div>
  </section>;
};

const MapTap: React.FC<{ selected: [number, number] | null; onChange: (point: [number, number]) => void }> = ({ selected, onChange }) => {
  const map = useMapEvents({ click: event => onChange([event.latlng.lat, event.latlng.lng]) });
  useEffect(() => { if (selected) map.setView(selected, Math.max(map.getZoom(), 15), { animate: true }); }, [map, selected?.[0], selected?.[1]]);
  return selected ? <Marker position={selected} icon={pinIcon} draggable eventHandlers={{ dragend: event => { const point = event.target.getLatLng(); onChange([point.lat, point.lng]); } }}/> : null;
};
