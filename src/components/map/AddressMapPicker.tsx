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

declare global {
  interface Window {
    google?: any;
    __googleMapsLoadingPromise?: Promise<void>;
    gm_authFailure?: () => void;
  }
}

interface AddressMapPickerProps {
  initialAddress?: Partial<AddressInput>;
  onConfirmAddress: (address: AddressInput) => void;
  savedAddresses?: AddressInput[];
}

// Default lab center: Wellness Diagnostic Center, Vidyanagar, Davanagere
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

const GOOGLE_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAwsS5CrgxBPJ37X6UoWiX5ZgIAlVWDk48';

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google && window.google.maps && window.google.maps.Map) {
    return Promise.resolve();
  }
  if (window.__googleMapsLoadingPromise) {
    return window.__googleMapsLoadingPromise;
  }

  window.__googleMapsLoadingPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve();
      return;
    }

    const callbackName = '__googleMapsInitCallback';
    (window as any)[callbackName] = () => {
      resolve();
    };

    window.gm_authFailure = () => {
      console.warn('[Google Maps]: Key authentication issue detected in Google Cloud Console.');
    };

    const existing = document.getElementById('google-maps-sdk-script');
    if (existing) {
      if (window.google?.maps?.Map) {
        resolve();
      } else {
        existing.addEventListener('load', () => {
          setTimeout(() => {
            if (window.google?.maps?.Map) resolve();
            else reject(new Error('Google Maps Map not initialized'));
          }, 200);
        });
        existing.addEventListener('error', (err) => reject(err));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-sdk-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = (err) => {
      console.error('[Google Maps script tag onerror]:', err);
      reject(err);
    };
    document.head.appendChild(script);

    // Timeout safety net (8 seconds)
    setTimeout(() => {
      if (window.google?.maps?.Map) {
        resolve();
      } else {
        reject(new Error('Google Maps script loading timed out'));
      }
    }, 8000);
  });

  return window.__googleMapsLoadingPromise;
}

export default function AddressMapPicker({
  initialAddress,
  onConfirmAddress,
  savedAddresses = [],
}: AddressMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

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
  const [reverseGeocodedText, setReverseGeocodedText] = useState<string>(
    initialAddress?.address_line_1
      ? `${initialAddress.address_line_1}, ${initialAddress.city || 'Davanagere'}`
      : 'Click on Google Map or search above to set doorstep pin'
  );

  // Address form fields
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>((initialAddress?.label as any) || 'Home');
  const [recipientName, setRecipientName] = useState(initialAddress?.recipient_name || '');
  const [recipientPhone, setRecipientPhone] = useState(initialAddress?.recipient_phone || '');
  const [addressLine1, setAddressLine1] = useState(initialAddress?.address_line_1 || '');
  const [addressLine2, setAddressLine2] = useState(initialAddress?.address_line_2 || '');
  const [landmark, setLandmark] = useState(initialAddress?.landmark || '');
  const [city, setCity] = useState(initialAddress?.city || 'Davanagere');
  const [state, setState] = useState(initialAddress?.state || 'Karnataka');
  const [postalCode, setPostalCode] = useState(initialAddress?.postal_code || '577004');
  const [accessInstructions, setAccessInstructions] = useState(initialAddress?.access_instructions || '');
  const [isDefault, setIsDefault] = useState(initialAddress?.is_default || false);
  const [isConfirmedFeedback, setIsConfirmedFeedback] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Pure Google Map
  useEffect(() => {
    let isMounted = true;

    async function initGoogleMap() {
      try {
        await loadGoogleMapsScript(GOOGLE_API_KEY);
        if (!isMounted || !mapContainerRef.current) return;

        if (window.google?.maps?.Map) {
          const google = window.google;

          const cleanRoadMapType = new google.maps.ImageMapType({
            getTileUrl: (coord: any, zoom: number) => {
              const subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
              const s = subdomains[Math.abs(coord.x + coord.y) % subdomains.length];
              return `https://${s}.google.com/vt/lyrs=m&x=${coord.x}&y=${coord.y}&z=${zoom}`;
            },
            tileSize: new google.maps.Size(256, 256),
            maxZoom: 20,
            name: 'Map',
          });

          const cleanSatelliteMapType = new google.maps.ImageMapType({
            getTileUrl: (coord: any, zoom: number) => {
              const subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
              const s = subdomains[Math.abs(coord.x + coord.y) % subdomains.length];
              return `https://${s}.google.com/vt/lyrs=y&x=${coord.x}&y=${coord.y}&z=${zoom}`;
            },
            tileSize: new google.maps.Size(256, 256),
            maxZoom: 20,
            name: 'Satellite',
          });

          const mapOptions = {
            center: { lat: coords.lat, lng: coords.lng },
            zoom: 16,
            mapTypeId: 'google_clean_road',
            mapTypeControl: true,
            mapTypeControlOptions: {
              mapTypeIds: ['google_clean_road', 'google_clean_sat'],
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER,
            },
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
          };

          const map = new google.maps.Map(mapContainerRef.current, mapOptions);
          map.mapTypes.set('google_clean_road', cleanRoadMapType);
          map.mapTypes.set('google_clean_sat', cleanSatelliteMapType);
          map.setMapTypeId('google_clean_road');
          mapInstanceRef.current = map;

          // Custom green healthcare SVG pin for Google Maps
          const marker = new google.maps.Marker({
            position: { lat: coords.lat, lng: coords.lng },
            map,
            draggable: true,
            title: 'Selected Collection Address - Drag to doorstep',
            animation: google.maps.Animation.DROP,
            icon: {
              url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="%2308784E" stroke="%23ffffff" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 7v10M7 12h10" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round"/></svg>`,
              scaledSize: new google.maps.Size(38, 38),
              anchor: new google.maps.Point(19, 19),
            },
          });
          markerRef.current = marker;

          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="font-family: sans-serif; font-size: 12px; color: #18352E; padding: 4px;">
              <b>Selected Collection Address</b><br/>
              Drag pin to pinpoint your home doorstep
            </div>`,
          });
          infoWindowRef.current = infoWindow;
          infoWindow.open(map, marker);

          // Marker dragend event
          marker.addListener('dragend', async () => {
            const pos = marker.getPosition();
            if (pos) {
              const newLat = pos.lat();
              const newLng = pos.lng();
              setCoords({ lat: newLat, lng: newLng });
              await reverseGeocodeWithGoogle(newLat, newLng);
            }
          });

          // Map click event: snaps marker to clicked spot
          map.addListener('click', async (e: any) => {
            if (!e.latLng) return;
            const clickLat = e.latLng.lat();
            const clickLng = e.latLng.lng();
            marker.setPosition(e.latLng);
            setCoords({ lat: clickLat, lng: clickLng });
            infoWindow.open(map, marker);
            await reverseGeocodeWithGoogle(clickLat, clickLng);
          });

          // Initialize Google Places Autocomplete on the search input
          if (searchInputRef.current && google.maps.places) {
            const davangereBounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(14.3, 75.7),
              new google.maps.LatLng(14.6, 76.1)
            );

            const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
              bounds: davangereBounds,
              componentRestrictions: { country: 'in' },
              fields: ['geometry', 'formatted_address', 'address_components', 'name'],
            });
            autocompleteRef.current = autocomplete;

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (!place.geometry || !place.geometry.location) {
                return;
              }

              const placeLat = place.geometry.location.lat();
              const placeLng = place.geometry.location.lng();

              updateMapMarker(placeLat, placeLng);
              parseAndPopulateGoogleComponents(place);
            });
          }
        }
      } catch (err) {
        console.warn('[Google Maps Init Error]:', err);
      } finally {
        if (isMounted) {
          setIsMapReady(true);
        }
      }
    }

    initGoogleMap();

    return () => {
      isMounted = false;
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, []);

  // Update map marker and camera position
  const updateMapMarker = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    if (mapInstanceRef.current && markerRef.current && window.google?.maps) {
      const targetZoom = 17;
      mapInstanceRef.current.setZoom(targetZoom);
      mapInstanceRef.current.panTo({ lat, lng });
      markerRef.current.setPosition({ lat, lng });
      if (infoWindowRef.current) {
        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
      }
    }
  };

  // Helper to parse Google address components into form state
  const parseAndPopulateGoogleComponents = (googleResult: any) => {
    if (!googleResult) return;
    const comps: Record<string, string> = {};
    for (const c of googleResult.address_components || []) {
      for (const t of c.types || []) {
        comps[t] = c.long_name;
      }
    }

    const road = comps.route || comps.premise || comps.establishment || '';
    const locality = comps.sublocality_level_1 || comps.sublocality || comps.neighborhood || '';
    const cityVal = comps.locality || comps.administrative_area_level_2 || 'Davanagere';
    const stateVal = comps.administrative_area_level_1 || 'Karnataka';
    const pinVal = comps.postal_code || postalCode;

    const formatted = googleResult.formatted_address || `${locality}, ${cityVal}`;
    setReverseGeocodedText(formatted);

    const line1 = road || locality || formatted.split(',')[0] || '';
    if (line1) setAddressLine1(line1);
    if (locality) setAddressLine2(locality);
    if (cityVal) setCity(cityVal);
    if (stateVal) setState(stateVal);
    if (pinVal) setPostalCode(pinVal);

    const pos = markerRef.current?.getPosition?.();
    const lat = pos ? pos.lat() : coords.lat;
    const lng = pos ? pos.lng() : coords.lng;

    onConfirmAddress({
      label,
      recipient_name: recipientName || initialAddress?.recipient_name || '',
      recipient_phone: recipientPhone || initialAddress?.recipient_phone || '',
      address_line_1: line1 || addressLine1,
      address_line_2: locality || addressLine2 || undefined,
      landmark: landmark || undefined,
      city: cityVal,
      state: stateVal,
      postal_code: pinVal,
      latitude: lat,
      longitude: lng,
      access_instructions: accessInstructions || undefined,
      is_default: isDefault,
    });
  };

  // Reverse Geocoding with Google Maps Geocoder (with Next.js API server fallback)
  const reverseGeocodeWithGoogle = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      // 1. Try Client Google Maps Geocoder if enabled
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const response = await new Promise<any>((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          });
        });

        if (response) {
          parseAndPopulateGoogleComponents(response);
          return;
        }
      }

      // 2. Fallback to our Serverless Geocoding Endpoint
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setReverseGeocodedText(data.display_name);
          const addr = data.address || {};
          if (addr.address_line_1) setAddressLine1(addr.address_line_1);
          if (addr.address_line_2) setAddressLine2(addr.address_line_2);
          if (addr.city) setCity(addr.city);
          if (addr.state) setState(addr.state);
          if (addr.postal_code) setPostalCode(addr.postal_code);

          onConfirmAddress({
            label,
            recipient_name: recipientName || initialAddress?.recipient_name || '',
            recipient_phone: recipientPhone || initialAddress?.recipient_phone || '',
            address_line_1: addr.address_line_1 || addressLine1,
            address_line_2: addr.address_line_2 || addressLine2 || undefined,
            landmark: landmark || undefined,
            city: addr.city || city,
            state: addr.state || state || undefined,
            postal_code: addr.postal_code || postalCode,
            latitude: lat,
            longitude: lng,
            access_instructions: accessInstructions || undefined,
            is_default: isDefault,
          });
        }
      }
    } catch (err) {
      console.warn('[Reverse Geocode error]:', err);
      setReverseGeocodedText(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Google Current Location GPS Detection
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

      // Glide Google Map to exact user coordinates
      updateMapMarker(lat, lng);
      await reverseGeocodeWithGoogle(lat, lng);

      const distFromDavanagere = calculateDistanceMeters(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng, lat, lng);
      if (distFromDavanagere > 50000) {
        const distanceKm = Math.round(distFromDavanagere / 1000);
        setIspWarning(
          `Location detected (~${distanceKm} km from Davanagere). If testing remotely, you can drag the green pin or tap 'Davanagere Center' anytime.`
        );
      } else if (accuracy > 150) {
        setIspWarning(
          `Location detected (accuracy ±${accuracy}m). Feel free to drag the green pin to your exact building or doorway for precise phlebotomist arrival.`
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
          navigator.geolocation.getCurrentPosition(
            applyPosition,
            () => {
              setIsGeolocating(false);
              setGeoError('GPS signal timed out. Please drag the pin on the Google Map or use search.');
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
          );
        } else {
          setIsGeolocating(false);
          if (error.code === error.PERMISSION_DENIED) {
            setGeoError('Location permission was denied. Please drag the pin on the Google Map.');
          } else {
            setGeoError('Location unavailable. Please click on the Google Map to place your pin.');
          }
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // Search Address with Geocoding
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGeoError(null);
    setIspWarning(null);

    try {
      const q = searchQuery.trim();
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
      const resData = res.ok ? await res.json() : null;
      const data = resData?.results || [];

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon || item.lng);
        updateMapMarker(lat, lng);
        setReverseGeocodedText(item.display_name);

        const addr = item.address || {};
        if (addr.address_line_1) setAddressLine1(addr.address_line_1);
        if (addr.address_line_2) setAddressLine2(addr.address_line_2);
        if (addr.city) setCity(addr.city);
        if (addr.state) setState(addr.state);
        if (addr.postal_code) setPostalCode(addr.postal_code);

        onConfirmAddress({
          label,
          recipient_name: recipientName || initialAddress?.recipient_name || '',
          recipient_phone: recipientPhone || initialAddress?.recipient_phone || '',
          address_line_1: addr.address_line_1 || addressLine1,
          address_line_2: addr.address_line_2 || addressLine2 || undefined,
          landmark: landmark || undefined,
          city: addr.city || city,
          state: addr.state || state || undefined,
          postal_code: addr.postal_code || postalCode,
          latitude: lat,
          longitude: lng,
          access_instructions: accessInstructions || undefined,
          is_default: isDefault,
        });
      } else {
        setGeoError('Location not found. Please try another search term or click directly on the Google Map.');
      }
    } catch {
      setGeoError('Unable to reach geocoding service. Please click directly on the Google Map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Quick snap to Davanagere center
  const handleResetToDavanagere = async () => {
    setIspWarning(null);
    setGeoError(null);
    setAddressLine1('');
    setAddressLine2('Davanagere Central');
    setCity('Davanagere');
    setState('Karnataka');
    setPostalCode('577002');
    updateMapMarker(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
    await reverseGeocodeWithGoogle(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
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
    await reverseGeocodeWithGoogle(loc.lat, loc.lng);
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
            title="Detect GPS location with Google Maps"
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

      {/* Responsive 2-Column Split: Google Map on Left (7 cols), Form on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x divide-ivory-200">
        {/* Left Column: Search & Interactive Google Map Canvas */}
        <div className="lg:col-span-7 flex flex-col bg-ivory-50/30">
          <div className="p-4 sm:p-5 border-b border-ivory-200">
            {/* Search Bar with Google Places Autocomplete */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-botanical-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search apartment, locality, street or postal code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs sm:text-sm font-medium text-botanical-950 placeholder:text-botanical-700/50 focus:outline-none focus:ring-2 focus:ring-botanical-500 shadow-soft-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-botanical-600 hover:bg-botanical-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search Area</span>}
              </button>
            </form>

            {/* Quick-Pick Davanagere Area Pills */}
            <div className="mt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-botanical-700 block mb-1.5">
                Quick-Pick Davanagere Areas:
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {DAVANAGERE_LOCALITIES.map((loc) => {
                  const isCurrent =
                    Math.abs(coords.lat - loc.lat) < 0.003 && Math.abs(coords.lng - loc.lng) < 0.003;
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelectQuickLocality(loc)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                        isCurrent
                          ? 'bg-botanical-600 text-white border-botanical-600 shadow-soft-xs'
                          : 'bg-white text-botanical-800 border-ivory-300 hover:border-botanical-300 hover:bg-botanical-50/50'
                      }`}
                    >
                      <span className="text-[11px] text-peach-500 mr-1">📍</span>
                      {loc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Google Map Viewport */}
          <div className="relative w-full h-[380px] sm:h-[450px] bg-ivory-100">
            <div ref={mapContainerRef} className="w-full h-full" />

            {!isMapReady && (
              <div className="absolute inset-0 bg-ivory-100/90 flex flex-col items-center justify-center gap-2 text-botanical-700">
                <Loader2 className="w-8 h-8 animate-spin text-botanical-500" />
                <span className="text-xs font-semibold">Loading Official Google Maps...</span>
              </div>
            )}

            {/* Drag helper tooltip badge */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="bg-botanical-950/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-soft flex items-center gap-1.5 border border-white/10">
                <Info className="w-3.5 h-3.5 text-peach-300" />
                <span>Click or drag marker to pinpoint doorway</span>
              </div>
            </div>

            {/* Live GPS Coordinates Indicator */}
            <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md text-botanical-950 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-soft-xs border border-ivory-300">
                GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </div>
            </div>
          </div>

          {/* Selected Location Banner with standard Doorstep Sample Collection pill */}
          <div className="p-3.5 bg-botanical-50/70 border-t border-botanical-200/60 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 text-xs text-botanical-950">
              <MapPin className="w-4 h-4 text-botanical-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-botanical-700 block">
                  Selected Map Location
                </span>
                <p className="font-semibold line-clamp-2">
                  {isReverseGeocoding ? (
                    <span className="inline-flex items-center gap-1 text-botanical-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Locating street via Google Maps...
                    </span>
                  ) : (
                    reverseGeocodedText
                  )}
                </p>
              </div>
            </div>

            {/* Standard Doorstep Collection Fee Pill */}
            <div className="flex-shrink-0 text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-botanical-100 text-botanical-900 border border-botanical-300 shadow-soft-xs">
                ₹50 Doorstep Collection Fee
              </span>
            </div>
          </div>

          {/* Warnings & Alerts */}
          {ispWarning && (
            <div className="mx-4 my-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{ispWarning}</span>
            </div>
          )}

          {geoError && (
            <div className="mx-4 my-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Doorstep Address Form */}
        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-white space-y-4">
          <form onSubmit={handleSubmitConfirmation} className="space-y-4">
            {/* Address Tag Selector */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1.5">Address Tag</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Home', 'Work', 'Other'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLabel(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      label === t
                        ? 'bg-botanical-600 text-white border-botanical-600 shadow-soft-xs'
                        : 'bg-ivory-50 text-botanical-800 border-ivory-300 hover:bg-botanical-50'
                    }`}
                  >
                    {t === 'Home' && <Home className="w-3.5 h-3.5" />}
                    {t === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                    {t === 'Other' && <Building className="w-3.5 h-3.5" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">Mobile (For Phlebotomist) *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
                />
              </div>
            </div>

            {/* House / Flat / Building */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">House / Flat / Building No. *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 302, Sai Residency / House #45"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
              />
            </div>

            {/* Floor, Locality or Society */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">
                Floor, Locality or Society (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 3rd Floor, Teachers Colony"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
              />
            </div>

            {/* Landmark, City & PIN Code */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">Landmark</label>
                <input
                  type="text"
                  placeholder="Nearby landmark (Opt)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="Davanagere"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-botanical-900 mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  placeholder="577004"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
                />
              </div>
            </div>

            {/* Phlebotomist Gate Instructions */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">
                Phlebotomist Gate Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="Gate code, call before arrival, doorbell notes (Optional)"
                value={accessInstructions}
                onChange={(e) => setAccessInstructions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
              />
            </div>

            {/* Save as Default Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-botanical-600 focus:ring-botanical-500 border-ivory-300"
              />
              <label htmlFor="isDefault" className="text-xs font-semibold text-botanical-800 cursor-pointer">
                Save as default collection address
              </label>
            </div>

            {/* Confirm Address Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-2xl bg-botanical-600 hover:bg-botanical-700 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center justify-center gap-2"
            >
              {isConfirmedFeedback ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Doorstep Pin & Address Saved ✓</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Confirm & Use This Collection Address</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
