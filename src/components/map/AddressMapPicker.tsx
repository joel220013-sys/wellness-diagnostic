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

// Default initial location: Gurugram / Delhi NCR (28.4595, 77.0266)
const DEFAULT_COORDS = { lat: 28.4595, lng: 77.0266 };

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
    initialAddress?.address_line_1 ? `${initialAddress.address_line_1}, ${initialAddress.city || ''}` : 'Click on map or search above to set exact door pin'
  );

  // Address details form fields - clean empty input bars
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
          let nextCity = city;
          let nextPostal = postalCode;
          let nextRoad = addressLine1;
          let nextState = state;

          if (data.address) {
            if (data.address.city || data.address.town || data.address.village || data.address.suburb) {
              nextCity = data.address.city || data.address.town || data.address.village || data.address.suburb || '';
              setCity(nextCity);
            }
            if (data.address.postcode) {
              nextPostal = data.address.postcode;
              setPostalCode(nextPostal);
            }
            if (data.address.road || data.address.neighbourhood || data.address.residential) {
              nextRoad = data.address.road || data.address.neighbourhood || data.address.residential || '';
              setAddressLine1(nextRoad);
            }
            if (data.address.state) {
              nextState = data.address.state;
              setState(nextState);
            }
          }

          onConfirmAddress({
            label,
            recipient_name: recipientName,
            recipient_phone: recipientPhone,
            address_line_1: nextRoad,
            address_line_2: addressLine2 || undefined,
            landmark: landmark || undefined,
            city: nextCity,
            state: nextState || undefined,
            postal_code: nextPostal,
            latitude: lat,
            longitude: lng,
            access_instructions: accessInstructions || undefined,
            is_default: isDefault,
          });
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

        {/* Quick Location Action */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isGeolocating}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-botanical-50 text-botanical-700 hover:bg-botanical-100 border border-botanical-200 text-xs font-bold transition-all shadow-soft-sm disabled:opacity-50"
        >
          {isGeolocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-botanical-600" />
          ) : (
            <Navigation className="w-4 h-4 text-botanical-600" />
          )}
          <span>Use My Current Location</span>
        </button>
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

            {geoError && (
              <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{geoError}</span>
              </div>
            )}
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

          {/* Selected Location Banner */}
          <div className="p-3 bg-botanical-50/70 border-t border-botanical-100 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-botanical-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-botanical-700 uppercase tracking-wider block">
                Selected Map Location
              </span>
              <p className="text-xs font-semibold text-botanical-950 truncate">
                {reverseGeocodedText}
              </p>
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
                      onClick={() => setLabel(item.id as any)}
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
                    onConfirmAddress({
                      label,
                      recipient_name: val,
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
                    });
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
                    onConfirmAddress({
                      label,
                      recipient_name: recipientName,
                      recipient_phone: val,
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
                    });
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
                  onConfirmAddress({
                    label,
                    recipient_name: recipientName,
                    recipient_phone: recipientPhone,
                    address_line_1: val,
                    address_line_2: addressLine2 || undefined,
                    landmark: landmark || undefined,
                    city,
                    state: state || undefined,
                    postal_code: postalCode,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    access_instructions: accessInstructions || undefined,
                    is_default: isDefault,
                  });
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
                  onConfirmAddress({
                    label,
                    recipient_name: recipientName,
                    recipient_phone: recipientPhone,
                    address_line_1: addressLine1,
                    address_line_2: val || undefined,
                    landmark: landmark || undefined,
                    city,
                    state: state || undefined,
                    postal_code: postalCode,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    access_instructions: accessInstructions || undefined,
                    is_default: isDefault,
                  });
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
                    onConfirmAddress({
                      label,
                      recipient_name: recipientName,
                      recipient_phone: recipientPhone,
                      address_line_1: addressLine1,
                      address_line_2: addressLine2 || undefined,
                      landmark: val || undefined,
                      city,
                      state: state || undefined,
                      postal_code: postalCode,
                      latitude: coords.lat,
                      longitude: coords.lng,
                      access_instructions: accessInstructions || undefined,
                      is_default: isDefault,
                    });
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
                    onConfirmAddress({
                      label,
                      recipient_name: recipientName,
                      recipient_phone: recipientPhone,
                      address_line_1: addressLine1,
                      address_line_2: addressLine2 || undefined,
                      landmark: landmark || undefined,
                      city: val,
                      state: state || undefined,
                      postal_code: postalCode,
                      latitude: coords.lat,
                      longitude: coords.lng,
                      access_instructions: accessInstructions || undefined,
                      is_default: isDefault,
                    });
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
                    onConfirmAddress({
                      label,
                      recipient_name: recipientName,
                      recipient_phone: recipientPhone,
                      address_line_1: addressLine1,
                      address_line_2: addressLine2 || undefined,
                      landmark: landmark || undefined,
                      city,
                      state: state || undefined,
                      postal_code: val,
                      latitude: coords.lat,
                      longitude: coords.lng,
                      access_instructions: accessInstructions || undefined,
                      is_default: isDefault,
                    });
                  }}
                  placeholder="PIN Code"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            {/* Access Instructions for Phlebotomist */}
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
                    access_instructions: val || undefined,
                    is_default: isDefault,
                  });
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
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-botanical-500 focus:ring-botanical-500 h-3.5 w-3.5"
              />
              <label htmlFor="isDefaultAddress" className="text-[11px] text-botanical-800 font-medium">
                Save as default collection address
              </label>
            </div>
          </div>

          {/* Confirmation Button */}
          <div className="pt-3 border-t border-ivory-200">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-bold text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Use This Collection Address</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
