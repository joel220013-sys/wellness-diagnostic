'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  Plus, 
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

// Default initial location: Springfield / Portland Oregon area (44.0521, -123.0868)
const DEFAULT_COORDS = { lat: 44.0521, lng: -123.0868 };

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
  const [geoError, setGeoError] = useState<string | null>(null);
  const [reverseGeocodedText, setReverseGeocodedText] = useState(
    initialAddress?.address_line_1 ? `${initialAddress.address_line_1}, ${initialAddress.city || ''}` : 'Springfield Center, OR 97477'
  );

  // Address details form fields
  const [recipientName, setRecipientName] = useState(initialAddress?.recipient_name || 'Sarah Jenkins');
  const [recipientPhone, setRecipientPhone] = useState(initialAddress?.recipient_phone || '+1 (555) 234-5678');
  const [addressLine1, setAddressLine1] = useState(initialAddress?.address_line_1 || '742 Evergreen Terrace');
  const [addressLine2, setAddressLine2] = useState(initialAddress?.address_line_2 || 'Apt 4B');
  const [landmark, setLandmark] = useState(initialAddress?.landmark || 'Near Springfield Elementary');
  const [city, setCity] = useState(initialAddress?.city || 'Springfield');
  const [state, setState] = useState(initialAddress?.state || 'OR');
  const [postalCode, setPostalCode] = useState(initialAddress?.postal_code || '97477');
  const [accessInstructions, setAccessInstructions] = useState(
    initialAddress?.access_instructions || 'Ring intercom 04. Elevator available.'
  );
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>(
    (initialAddress?.label as 'Home' | 'Work' | 'Other') || 'Home'
  );
  const [isDefault, setIsDefault] = useState(initialAddress?.is_default || false);

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

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

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

  // Update map marker when coords change programmatically
  const updateMapMarker = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // Reverse Geocoding helper with debounced fallback
  const handleReverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'WellnessDiagnosticApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setReverseGeocodedText(data.display_name);
          // Auto-populate city & postal code if available
          if (data.address) {
            if (data.address.city || data.address.town || data.address.village) {
              setCity(data.address.city || data.address.town || data.address.village);
            }
            if (data.address.postcode) {
              setPostalCode(data.address.postcode);
            }
            if (data.address.road) {
              setAddressLine1(data.address.road);
            }
          }
        }
      }
    } catch {
      // Graceful fallback: maintain formatted coordinates
      setReverseGeocodedText(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    }
  };

  // Search Address with Geocoding
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGeoError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        { headers: { 'User-Agent': 'WellnessDiagnosticApp/1.0' } }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          updateMapMarker(lat, lng);
          setReverseGeocodedText(data[0].display_name);
          setAddressLine1(data[0].display_name.split(',')[0]);
        } else {
          setGeoError('Location not found. Please try another search term or click directly on the map.');
        }
      }
    } catch {
      setGeoError('Unable to reach geocoding service. Please click on the map to place your pin.');
    } finally {
      setIsSearching(false);
    }
  };

  // Use Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateMapMarker(lat, lng);
        await handleReverseGeocode(lat, lng);
        setIsGeolocating(false);
      },
      (error) => {
        setIsGeolocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location access was denied. Please search or pick your address on the map.');
        } else {
          setGeoError('Could not determine current location. Please use manual address search.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
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
  };

  return (
    <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-ivory-200 bg-ivory-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-botanical-600">
            Step 3 of 4 — Collection Location
          </span>
          <h3 className="text-xl font-extrabold text-botanical-950 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-botanical-500" />
            <span>Select Home Collection Address</span>
          </h3>
        </div>

        {/* Quick Location Action */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isGeolocating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-botanical-50 text-botanical-700 hover:bg-botanical-100 border border-botanical-200 text-xs sm:text-sm font-bold transition-all shadow-soft-sm disabled:opacity-50"
        >
          {isGeolocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-botanical-600" />
          ) : (
            <Navigation className="w-4 h-4 text-botanical-600" />
          )}
          <span>Use My Current Location</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 sm:px-6 bg-white border-b border-ivory-200">
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
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-ivory-50/30"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Area'}
          </button>
        </form>

        {geoError && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{geoError}</span>
          </div>
        )}
      </div>

      {/* Leaflet Interactive Map Canvas */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-ivory-100 z-10">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Floating coordinates badge */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-ivory-300 shadow-soft-sm text-[11px] text-botanical-900 font-mono">
          <span className="font-bold text-botanical-600">GPS:</span> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>

        {/* Floating instructions badge */}
        <div className="absolute top-3 left-3 z-[1000] bg-botanical-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-soft text-xs flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-peach-300" />
          <span>Click anywhere or drag marker to set exact home door</span>
        </div>
      </div>

      {/* Selected Location Banner */}
      <div className="p-4 bg-botanical-50/60 border-y border-botanical-100 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-botanical-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="text-[11px] font-bold text-botanical-700 uppercase tracking-wider block">
            Selected Pin Location
          </span>
          <p className="text-xs sm:text-sm font-semibold text-botanical-950 line-clamp-2">
            {reverseGeocodedText}
          </p>
        </div>
      </div>

      {/* Additional Details Form */}
      <form onSubmit={handleSubmitConfirmation} className="p-4 sm:p-6 space-y-4">
        {/* Address Label Selection */}
        <div>
          <label className="block text-xs font-bold text-botanical-900 mb-1.5">
            Address Label
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
                  onClick={() => setLabel(item.id as any)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-botanical-900 mb-1">
              Patient / Contact Name *
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-botanical-900 mb-1">
              Mobile Number (for Phlebotomist) *
            </label>
            <input
              type="tel"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
        </div>

        {/* Address Lines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-botanical-900 mb-1">
              House / Flat / Building No. *
            </label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-botanical-900 mb-1">
              Floor, Apartment or Suite (Optional)
            </label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="e.g. Apt 4B, 2nd Floor"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-botanical-900 mb-1">
              Landmark
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Elementary School"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-botanical-900 mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Springfield"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-botanical-900 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="97477"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
            />
          </div>
        </div>

        {/* Access Instructions for Phlebotomist */}
        <div>
          <label className="block text-xs font-bold text-botanical-900 mb-1">
            Access Instructions for Sample Collector (Optional)
          </label>
          <input
            type="text"
            value={accessInstructions}
            onChange={(e) => setAccessInstructions(e.target.value)}
            placeholder="e.g. Gate code #1294, call on arrival, elevator located on right"
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
          />
        </div>

        {/* Save as default checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isDefaultAddress"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded text-botanical-500 focus:ring-botanical-500"
          />
          <label htmlFor="isDefaultAddress" className="text-xs text-botanical-800 font-medium">
            Save as default collection address for future bookings
          </label>
        </div>

        {/* Confirmation Button */}
        <div className="pt-4 border-t border-ivory-200 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Collection Address & Continue</span>
          </button>
        </div>
      </form>
    </div>
  );
}
