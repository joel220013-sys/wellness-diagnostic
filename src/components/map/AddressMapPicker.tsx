'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  Home, 
  Briefcase, 
  Building, 
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { AddressInput } from '@/lib/validations';

interface AddressMapPickerProps {
  initialAddress?: Partial<AddressInput>;
  onConfirmAddress: (address: AddressInput) => void;
  savedAddresses?: AddressInput[];
}

import { parseNominatimAddress, ParsedAddress } from '@/lib/geoAddress';
export type { ParsedAddress };


// Default lab center: Wellness Diagnostic Center, Vidyanagar, Davangere
export const LAB_COORDS = { lat: 14.4408576, lng: 75.9332864 };
const DEFAULT_COORDS = LAB_COORDS;

// Popular Davanagere localities for fast 1-click doorstep pin placement
const DAVANAGERE_LOCALITIES = [
  { name: 'Wellness Diagnostic (Lab)', lat: 14.44086, lng: 75.93329 },
  { name: 'Vidyanagar', lat: 14.4532, lng: 75.9084 },
  { name: 'Teachers Colony', lat: 14.4415, lng: 75.9320 },
  { name: 'Davanagere Center', lat: 14.4644, lng: 75.9218 },
  { name: 'MCC B Block', lat: 14.4721, lng: 75.9126 },
  { name: 'PJ Extension', lat: 14.4688, lng: 75.9255 },
  { name: 'SS Layout', lat: 14.4501, lng: 75.9189 },
  { name: 'Kuvempu Nagar', lat: 14.4820, lng: 75.9110 },
  { name: 'Hadadi Road', lat: 14.4602, lng: 75.9015 },
  { name: 'Dental College Area', lat: 14.4447, lng: 75.9168 },
];

/**
 * Calculates straight-line distance in meters between two GPS coordinates (Haversine formula).
 * Used to filter out Wi-Fi/cellular triangulation jitter when clicking "Use Current Location".
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function AddressMapPicker({
  initialAddress,
  onConfirmAddress,
  savedAddresses = [],
}: AddressMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialAddress?.latitude || DEFAULT_COORDS.lat,
    lng: initialAddress?.longitude || DEFAULT_COORDS.lng,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [ispWarning, setIspWarning] = useState<string | null>(null);
  const [isConfirmedFeedback, setIsConfirmedFeedback] = useState(false);

  const [reverseGeocodedText, setReverseGeocodedText] = useState(
    initialAddress?.address_line_1 
      ? `${initialAddress.address_line_1}, ${initialAddress.city || ''}` 
      : 'Click on map or search above to set exact door pin'
  );

  // Address details form fields
  const [recipientName, setRecipientName] = useState(initialAddress?.recipient_name || '');
  const [recipientPhone, setRecipientPhone] = useState(initialAddress?.recipient_phone || '');
  const [addressLine1, setAddressLine1] = useState(initialAddress?.address_line_1 || '');
  const [addressLine2, setAddressLine2] = useState(initialAddress?.address_line_2 || '');
  const [landmark, setLandmark] = useState(initialAddress?.landmark || '');
  const [city, setCity] = useState(initialAddress?.city || '');
  const [state, setState] = useState(initialAddress?.state || '');
  const [postalCode, setPostalCode] = useState(initialAddress?.postal_code || '');
  const [accessInstructions, setAccessInstructions] = useState(
    initialAddress?.access_instructions || ''
  );
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>(
    (initialAddress?.label as 'Home' | 'Work' | 'Other') || 'Home'
  );
  const [isDefault, setIsDefault] = useState(initialAddress?.is_default || false);

  // Auto-sync recipient details when parent patient details change
  useEffect(() => {
    if (initialAddress?.recipient_name !== undefined && initialAddress?.recipient_name !== '') {
      setRecipientName(initialAddress.recipient_name);
    }
  }, [initialAddress?.recipient_name]);

  useEffect(() => {
    if (initialAddress?.recipient_phone !== undefined && initialAddress?.recipient_phone !== '') {
      setRecipientPhone(initialAddress.recipient_phone);
    }
  }, [initialAddress?.recipient_phone]);

  // Sync helper to keep parent in sync with field edits
  const syncAddress = (updated: Partial<AddressInput>) => {
    onConfirmAddress({
      label,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      address_line_1: addressLine1,
      address_line_2: addressLine2 || undefined,
      landmark: landmark || undefined,
      city,
      state: state || undefined,
      postal_code: postalCode,
      latitude: coords.lat,
      longitude: coords.lng,
      access_instructions: accessInstructions || undefined,
      is_default: isDefault,
      ...updated,
    });
  };

  // Initialize Leaflet Map safely on Client
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Custom Botanical Healthcare Map Marker
      const healthcareIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: #08784E; color: white; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(8,120,78,0.4); border: 2.5px solid white;">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: true,
      });

      // Official Google Maps Roadmap Tile Layer
      const googleRoadmap = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps',
      });

      // Official Google Maps Satellite (Hybrid) Layer
      const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Satellite',
      });

      // OpenStreetMap Layer fallback
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      });

      // Set Google Maps as active base map
      googleRoadmap.addTo(map);

      // Layer switcher control (Google Maps Roadmap, Satellite, OSM)
      L.control.layers(
        {
          'Google Maps': googleRoadmap,
          'Google Satellite': googleSatellite,
          'OpenStreetMap': osmLayer,
        },
        {},
        { position: 'topright' }
      ).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: healthcareIcon,
      }).addTo(map);

      marker.bindPopup('<b>Selected Collection Address</b><br/>Drag pin to pinpoint your home doorstep').openPopup();

      marker.on('dragend', async () => {
        const newPos = marker.getLatLng();
        setCoords({ lat: newPos.lat, lng: newPos.lng });
        await handleReverseGeocode(newPos.lat, newPos.lng);
      });

      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        await handleReverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Ensure Leaflet tiles and center are perfectly sized without edge cutoffs
      setTimeout(() => {
        try {
          map.invalidateSize();
          map.setView([coords.lat, coords.lng], 16);
        } catch {}
      }, 250);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map marker when coords change programmatically with smooth gliding
  const updateMapMarker = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    if (mapInstanceRef.current && markerRef.current) {
      try {
        mapInstanceRef.current.invalidateSize();
      } catch {}
      const targetZoom = 17;

      if (typeof mapInstanceRef.current.flyTo === 'function') {
        mapInstanceRef.current.flyTo([lat, lng], targetZoom, { duration: 0.5 });
      } else {
        mapInstanceRef.current.setView([lat, lng], targetZoom);
      }
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.openPopup();
    }
  };

  // Reverse Geocoding: Auto-populates all address inputs from coordinates
  const handleReverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      // 1. Try our unified Next.js geocode API (Google Maps + OpenStreetMap fallback)
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setReverseGeocodedText(data.display_name);

          let parsedLine1 = data.address?.address_line_1;
          let parsedLine2 = data.address?.address_line_2;
          let parsedCity = data.address?.city;
          let parsedState = data.address?.state;
          let parsedPostal = data.address?.postal_code;

          if (data.raw) {
            const parsed = parseNominatimAddress(data.raw);
            parsedLine1 = parsed.addressLine1 || parsedLine1;
            parsedLine2 = parsed.addressLine2 || parsedLine2;
            parsedCity = parsed.city || parsedCity;
            parsedState = parsed.state || parsedState;
            parsedPostal = parsed.postalCode || parsedPostal;
            if (parsed.landmark && !landmark) setLandmark(parsed.landmark);
          }

          if (parsedLine1) setAddressLine1(parsedLine1);
          if (parsedLine2) setAddressLine2(parsedLine2);
          if (parsedCity) setCity(parsedCity);
          if (parsedState) setState(parsedState);
          if (parsedPostal) setPostalCode(parsedPostal);

          onConfirmAddress({
            label,
            recipient_name: recipientName || initialAddress?.recipient_name || '',
            recipient_phone: recipientPhone || initialAddress?.recipient_phone || '',
            address_line_1: parsedLine1 || addressLine1,
            address_line_2: parsedLine2 || addressLine2 || undefined,
            landmark: landmark || undefined,
            city: parsedCity || city,
            state: parsedState || state || undefined,
            postal_code: parsedPostal || postalCode,
            latitude: lat,
            longitude: lng,
            access_instructions: accessInstructions || undefined,
            is_default: isDefault,
          });
        }
      }
    } catch {
      setReverseGeocodedText(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Quick snap to Davanagere center (clears any erroneous out-of-town fields)
  const handleResetToDavanagere = async () => {
    setIspWarning(null);
    setGeoError(null);
    setAddressLine1('');
    setAddressLine2('Davanagere Central');
    setCity('Davanagere');
    setState('Karnataka');
    setPostalCode('577002');
    updateMapMarker(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
    await handleReverseGeocode(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
  };

  // Quick snap to selected Davanagere neighborhood
  const handleSelectQuickLocality = async (loc: { name: string; lat: number; lng: number }) => {
    setIspWarning(null);
    setGeoError(null);
    setAddressLine1('');
    setAddressLine2(loc.name);
    setCity('Davanagere');
    setState('Karnataka');
    setPostalCode('577002');
    updateMapMarker(loc.lat, loc.lng);
    await handleReverseGeocode(loc.lat, loc.lng);
  };

  // Search Address with Geocoding and auto-population (Google Maps + OpenStreetMap fallback)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGeoError(null);
    setIspWarning(null);

    try {
      const q = searchQuery.trim();

      // 1. Call unified geocoding API
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
      const resData = res.ok ? await res.json() : null;
      const data = resData?.results || [];

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon || item.lng);
        updateMapMarker(lat, lng);
        setReverseGeocodedText(item.display_name);

        let parsedLine1 = item.address?.address_line_1;
        let parsedLine2 = item.address?.address_line_2;
        let parsedCity = item.address?.city;
        let parsedState = item.address?.state;
        let parsedPostal = item.address?.postal_code;

        if (item.raw) {
          const parsed = parseNominatimAddress(item.raw);
          parsedLine1 = parsed.addressLine1 || parsedLine1;
          parsedLine2 = parsed.addressLine2 || parsedLine2;
          parsedCity = parsed.city || parsedCity;
          parsedState = parsed.state || parsedState;
          parsedPostal = parsed.postalCode || parsedPostal;
          if (parsed.landmark && !landmark) setLandmark(parsed.landmark);
        }

        if (parsedLine1) setAddressLine1(parsedLine1);
        if (parsedLine2) setAddressLine2(parsedLine2);
        if (parsedCity) setCity(parsedCity);
        if (parsedState) setState(parsedState);
        if (parsedPostal) setPostalCode(parsedPostal);

        onConfirmAddress({
          label,
          recipient_name: recipientName || initialAddress?.recipient_name || '',
          recipient_phone: recipientPhone || initialAddress?.recipient_phone || '',
          address_line_1: parsedLine1 || addressLine1,
          address_line_2: parsedLine2 || addressLine2 || undefined,
          landmark: landmark || undefined,
          city: parsedCity || city,
          state: parsedState || state || undefined,
          postal_code: parsedPostal || postalCode,
          latitude: lat,
          longitude: lng,
          access_instructions: accessInstructions || undefined,
          is_default: isDefault,
        });
      } else {
        setGeoError('Location not found. Please try another search term or click directly on the map.');
      }
    } catch {
      setGeoError('Unable to reach geocoding service. Please click on the map to place your pin.');
    } finally {
      setIsSearching(false);
    }
  };

  // Use Browser Geolocation with fresh satellite GPS detection & automatic accuracy handling
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    if (isGeolocating) return;

    setIsGeolocating(true);
    setGeoError(null);
    setIspWarning(null);

    const applyPosition = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy || 0);

      // Smoothly glide camera and snap pin to exact detected coordinates
      updateMapMarker(lat, lng);
      await handleReverseGeocode(lat, lng);

      const distFromDavanagere = calculateDistanceMeters(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng, lat, lng);
      if (distFromDavanagere > 50000) {
        const distanceKm = Math.round(distFromDavanagere / 1000);
        setIspWarning(
          `Detected location is ~${distanceKm} km from Davanagere. If you are booking for home collection in Davanagere, feel free to tap 'Davanagere Center' or drag the pin to the patient's doorstep.`
        );
      } else if (accuracy > 150) {
        setIspWarning(
          `Location detected via Wi-Fi (accuracy ±${accuracy}m). Drag the green pin to your exact building or doorway for precise phlebotomist arrival.`
        );
      } else {
        setIspWarning(null);
      }

      setIsGeolocating(false);
    };

    navigator.geolocation.getCurrentPosition(
      applyPosition,
      (error) => {
        if (error.code === error.TIMEOUT) {
          // If high-accuracy satellite GPS timed out (e.g. indoors or on PC), fallback to standard network Wi-Fi location
          navigator.geolocation.getCurrentPosition(
            applyPosition,
            () => {
              setIsGeolocating(false);
              setGeoError('Could not determine current location. Please click or drag the pin on the map.');
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
          );
        } else {
          setIsGeolocating(false);
          if (error.code === error.PERMISSION_DENIED) {
            setGeoError('Location permission was denied in your browser settings. Please click directly on the map to place your pin.');
          } else {
            setGeoError('Location unavailable. Please click directly on the map or use the search bar.');
          }
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // Confirm Final Address Selection
  const handleSubmitConfirmation = (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed: AddressInput = {
      label,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      address_line_1: addressLine1,
      address_line_2: addressLine2 || undefined,
      landmark: landmark || undefined,
      city,
      state: state || undefined,
      postal_code: postalCode,
      latitude: coords.lat,
      longitude: coords.lng,
      access_instructions: accessInstructions || undefined,
      is_default: isDefault,
    };

    onConfirmAddress(confirmed);
    setIsConfirmedFeedback(true);
    setTimeout(() => setIsConfirmedFeedback(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-ivory-200 bg-ivory-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-botanical-600">
            Sample Collection Location
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-botanical-950 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-botanical-500" />
            <span>Select Home Collection Address & Pin Location</span>
          </h3>
        </div>

        {/* Quick Location Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDavanagere}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-peach-50 text-botanical-950 hover:bg-peach-100 border border-peach-200 text-xs font-bold transition-all shadow-soft-xs"
            title="Reset pin to Davanagere city center"
          >
            <MapPin className="w-3.5 h-3.5 text-peach-600" />
            <span>Davanagere Center</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGeolocating}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-botanical-50 text-botanical-700 hover:bg-botanical-100 border border-botanical-200 text-xs font-bold transition-all shadow-soft-sm disabled:opacity-50"
            title="Detect GPS location (Mobile phones provide high accuracy; PC/laptops use Wi-Fi IP)"
          >
            {isGeolocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-botanical-600" />
            ) : (
              <Navigation className="w-4 h-4 text-botanical-600" />
            )}
            <span>Use My Current Location</span>
          </button>
        </div>
      </div>

      {/* Responsive Desktop 2-Column Split: Map on Left (7 cols), Form on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x divide-ivory-200">
        {/* Left Column: Search & Interactive Leaflet Map Canvas */}
        <div className="lg:col-span-7 flex flex-col bg-ivory-50/30">
          {/* Search Input Bar */}
          <div className="p-3.5 sm:p-4 bg-white border-b border-ivory-200">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-botanical-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apartment, locality, street or postal code..."
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-ivory-50/30"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Area'}
              </button>
            </form>

            {/* ISP Broadband Gateway Warning Banner */}
            {ispWarning && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-in slide-in-from-top duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Broadband / Wi-Fi Provider Location Detected:</strong> {ispWarning}
                  </p>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <button
                    type="button"
                    onClick={handleResetToDavanagere}
                    className="px-3 py-1 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft-xs flex items-center gap-1.5 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Snap to Davanagere Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIspWarning(null)}
                    className="px-2.5 py-1 text-xs text-amber-800 hover:underline font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {geoError && (
              <div className="mt-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Quick Davanagere Neighborhood Chips */}
            <div className="mt-2.5 pt-2 border-t border-ivory-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-botanical-600 block mb-1.5">
                Quick-Pick Davanagere Areas:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {DAVANAGERE_LOCALITIES.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectQuickLocality(loc)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-botanical-900 whitespace-nowrap transition-colors flex items-center gap-1 hover:border-botanical-400 active:scale-95"
                  >
                    <MapPin className="w-3 h-3 text-peach-500" />
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leaflet Interactive Map Canvas */}
          <div className="relative w-full h-[320px] lg:h-[440px] bg-ivory-100 z-10 flex-1 min-h-[300px]">
            <div ref={mapContainerRef} className="w-full h-full" />
            
            {/* Floating coordinates badge */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-ivory-300 shadow-soft-sm text-[10px] sm:text-[11px] text-botanical-900 font-mono">
              <span className="font-bold text-botanical-600">GPS:</span> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </div>

            {/* Floating instructions badge */}
            <div className="absolute top-3 left-3 z-[1000] bg-botanical-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-xl shadow-soft text-[11px] flex items-center gap-1.5">
              <Info className="w-3 h-3 text-peach-300" />
              <span>Click or drag marker to pinpoint doorway</span>
            </div>
          </div>

          {/* Selected Location Banner with standard Doorstep Sample Collection pill */}
          <div className="p-3 bg-botanical-50/70 border-t border-botanical-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-botanical-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-botanical-700 uppercase tracking-wider block">
                  Selected Map Location
                </span>
                <p className="text-xs font-semibold text-botanical-950 truncate">
                  {isReverseGeocoding ? 'Detecting address details...' : reverseGeocodedText}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-botanical-100 text-botanical-900 border border-botanical-200">
                ₹50 Doorstep Collection Fee
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Address Details Form */}
        <form onSubmit={handleSubmitConfirmation} className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-white">
          <div className="space-y-3">
            {/* Address Label Selection */}
            <div>
              <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                Address Tag
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'Home', label: 'Home', icon: Home },
                  { id: 'Work', label: 'Work', icon: Briefcase },
                  { id: 'Other', label: 'Other', icon: Building },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const newLabel = item.id as 'Home' | 'Work' | 'Other';
                        setLabel(newLabel);
                        syncAddress({ label: newLabel });
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        label === item.id
                          ? 'bg-botanical-500 border-botanical-500 text-white shadow-soft-sm'
                          : 'bg-white border-ivory-300 text-botanical-800 hover:bg-ivory-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecipientName(val);
                    syncAddress({ recipient_name: val });
                  }}
                  placeholder="Patient / Recipient Name"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                  Mobile (For Phlebotomist) *
                </label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecipientPhone(val);
                    syncAddress({ recipient_phone: val });
                  }}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                House / Flat / Building No. *
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => {
                  const val = e.target.value;
                  setAddressLine1(val);
                  syncAddress({ address_line_1: val });
                }}
                placeholder="House / Flat / Door No. or Building Name"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                Floor, Locality or Society (Optional)
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => {
                  const val = e.target.value;
                  setAddressLine2(val);
                  syncAddress({ address_line_2: val || undefined });
                }}
                placeholder="Apartment, Street or Locality (Optional)"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
              />
            </div>

            {/* Landmark, City & Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLandmark(val);
                    syncAddress({ landmark: val || undefined });
                  }}
                  placeholder="Nearby landmark (Optional)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCity(val);
                    syncAddress({ city: val });
                  }}
                  placeholder="City / Town"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPostalCode(val);
                    syncAddress({ postal_code: val });
                  }}
                  placeholder="PIN Code"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            {/* Phlebotomist Gate Instructions */}
            <div>
              <label className="block text-[11px] font-bold text-botanical-900 mb-1">
                Phlebotomist Gate Instructions (Optional)
              </label>
              <input
                type="text"
                value={accessInstructions}
                onChange={(e) => {
                  const val = e.target.value;
                  setAccessInstructions(val);
                  syncAddress({ access_instructions: val || undefined });
                }}
                placeholder="Gate code, call before arrival, doorbell notes (Optional)"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
              />
            </div>

            {/* Save as default checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="isDefaultAddress"
                checked={isDefault}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsDefault(checked);
                  syncAddress({ is_default: checked });
                }}
                className="rounded text-botanical-500 focus:ring-botanical-500 h-3.5 w-3.5"
              />
              <label htmlFor="isDefaultAddress" className="text-[11px] text-botanical-800 font-medium">
                Save as default collection address
              </label>
            </div>
          </div>

          {/* Confirmation Button with Live Visual Feedback */}
          <div className="pt-3 border-t border-ivory-200">
            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 transition-all ${
                isConfirmedFeedback
                  ? 'bg-emerald-600 text-white'
                  : 'bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isConfirmedFeedback ? 'Address Pinned & Confirmed!' : 'Confirm & Use This Collection Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
