import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || searchParams.get('lon') || '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ success: false, error: 'Valid lat and lng required' }, { status: 400 });
  }

  // 1. Try Google Reverse Geocoding
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
      console.warn('[Google Reverse Geocode error, falling back to Nominatim]:', err);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'WellnessDiagnosticApp/1.0' } }
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        source: 'nominatim',
        display_name: data.display_name,
        raw: data,
      });
    }
  } catch (err: any) {
    console.error('[Nominatim Reverse Geocode error]:', err);
  }

  return NextResponse.json({
    success: true,
    display_name: `Coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
    address: {
      address_line_1: `Coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      city: 'Davanagere',
      state: 'Karnataka',
      postal_code: '577002',
    },
  });
}
