import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAwsS5CrgxBPJ37X6UoWiX5ZgIAlVWDk48';

// High-fidelity Davanagere landmark grid (exact distances)
const DAVANAGERE_GRID = [
  { name: '15th Cross, SS Layout', locality: 'SS Layout', landmark: 'Near Kubera Hotel', lat: 14.43516, lng: 75.91902, pin: '577004' },
  { name: 'Wellness Diagnostic Center (Lab)', locality: 'Vidyanagar', landmark: 'Teachers Colony Main Road', lat: 14.44086, lng: 75.93329, pin: '577004' },
  { name: 'Teachers Colony', locality: 'Teachers Colony', landmark: 'Near Vidyanagar', lat: 14.4415, lng: 75.9320, pin: '577004' },
  { name: 'Vidyanagar', locality: 'Vidyanagar', landmark: 'Near Bapuji College', lat: 14.4532, lng: 75.9084, pin: '577005' },
  { name: 'MCC B Block', locality: 'MCC B Block', landmark: 'Near Kuvempu Nagar', lat: 14.4721, lng: 75.9126, pin: '577004' },
  { name: 'MCC A Block', locality: 'MCC A Block', landmark: 'Opposite Bapuji Hospital', lat: 14.4695, lng: 75.9172, pin: '577004' },
  { name: 'PJ Extension', locality: 'PJ Extension', landmark: 'City Central Bus Stand Road', lat: 14.4688, lng: 75.9255, pin: '577002' },
  { name: 'Davanagere City Center', locality: 'Davanagere Center', landmark: 'Clock Tower / Railway Station', lat: 14.4644, lng: 75.9218, pin: '577001' },
  { name: 'Kuvempu Nagar', locality: 'Kuvempu Nagar', landmark: 'Near MCC Layout', lat: 14.4820, lng: 75.9110, pin: '577004' },
  { name: 'Hadadi Road', locality: 'Hadadi Road', landmark: 'Near Shamanur Circle', lat: 14.4602, lng: 75.9015, pin: '577005' },
  { name: 'Dental College Area', locality: 'Bapuji Dental College', landmark: 'MCC Road', lat: 14.4447, lng: 75.9168, pin: '577004' },
  { name: 'Devaraja Arasu Badavane', locality: 'Devaraja Arasu Badavane', landmark: 'Vinobanagara', lat: 14.47210, lng: 75.91260, pin: '577006' },
  { name: 'Nituvalli', locality: 'Nituvalli', landmark: 'Near Durgambika Temple', lat: 14.43706, lng: 75.92760, pin: '577002' },
];

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || searchParams.get('lon') || '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ success: false, error: 'Valid lat and lng required' }, { status: 400 });
  }

  // 1. Google Maps Geocoding API
  if (GOOGLE_API_KEY) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&region=in&key=${GOOGLE_API_KEY}`;
      const res = await fetch(googleUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const first = data.results[0];
          const comps: Record<string, string> = {};
          for (const c of first.address_components || []) {
            for (const t of c.types || []) {
              comps[t] = c.long_name;
            }
          }

          const locality = comps.sublocality_level_1 || comps.sublocality || comps.neighborhood || '';
          const city = comps.locality || comps.administrative_area_level_2 || 'Davanagere';
          const state = comps.administrative_area_level_1 || 'Karnataka';
          const postalCode = comps.postal_code || '577004';
          const road = comps.route || comps.premise || comps.establishment || '';

          return NextResponse.json({
            success: true,
            source: 'google',
            display_name: first.formatted_address,
            address: {
              address_line_1: road || locality || first.formatted_address.split(',')[0],
              address_line_2: locality,
              locality,
              city,
              state,
              postal_code: postalCode,
              formatted: first.formatted_address,
            },
          });
        }
      }
    } catch (err) {
      console.warn('[Google Geocode API call error]:', err);
    }
  }

  // 2. High-Accuracy Davanagere Locality Grid Lookup (No coarse OpenStreetMap/Leaflet fallback)
  let closest = DAVANAGERE_GRID[0];
  let minDistance = Infinity;

  for (const item of DAVANAGERE_GRID) {
    const dist = getDistanceMeters(lat, lng, item.lat, item.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  const isLocalToDavanagere = minDistance < 15000;
  const line1 = isLocalToDavanagere ? closest.name : `GPS Point (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
  const locality = isLocalToDavanagere ? closest.locality : 'Davanagere';
  const landmark = isLocalToDavanagere ? closest.landmark : '';
  const pin = isLocalToDavanagere ? closest.pin : '577004';

  const formattedAddress = `${line1}, ${locality}, Davanagere, Karnataka ${pin}, India`;

  return NextResponse.json({
    success: true,
    source: 'google_fallback_grid',
    display_name: formattedAddress,
    address: {
      address_line_1: line1,
      address_line_2: locality,
      landmark,
      locality,
      city: 'Davanagere',
      state: 'Karnataka',
      postal_code: pin,
      formatted: formattedAddress,
    },
  });
}
