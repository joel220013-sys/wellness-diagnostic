import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  if (!q.trim()) {
    return NextResponse.json({ success: false, results: [] });
  }

  // 1. Try Google Maps Geocoding API first if key is present
  if (GOOGLE_API_KEY) {
    try {
      const queryWithCity = /davanagere|davangere|karnataka/i.test(q) ? q : `${q}, Davanagere, Karnataka`;
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        queryWithCity
      )}&region=in&key=${GOOGLE_API_KEY}`;

      const res = await fetch(googleUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const formatted = data.results.map((r: any) => {
            const comps: Record<string, string> = {};
            for (const c of r.address_components || []) {
              for (const t of c.types || []) {
                comps[t] = c.long_name;
              }
            }

            const locality = comps.sublocality_level_1 || comps.sublocality || comps.neighborhood || '';
            const city = comps.locality || comps.administrative_area_level_2 || 'Davanagere';
            const state = comps.administrative_area_level_1 || 'Karnataka';
            const postalCode = comps.postal_code || '577004';
            const road = comps.route || comps.premise || comps.establishment || '';

            return {
              display_name: r.formatted_address,
              lat: r.geometry?.location?.lat,
              lon: r.geometry?.location?.lng,
              source: 'google',
              address: {
                address_line_1: road || locality || r.formatted_address.split(',')[0],
                address_line_2: locality,
                locality,
                city,
                state,
                postal_code: postalCode,
              },
            };
          });

          return NextResponse.json({
            success: true,
            source: 'google',
            results: formatted,
          });
        }
      }
    } catch (err) {
      console.warn('[Google Geocode Search error, falling back to Nominatim]:', err);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const hasCity = /davanagere|davangere|bangalore|bengaluru|hubli|shivamogga|karnataka/i.test(q);
    const queryWithCity = hasCity ? q : `${q}, Davanagere, Karnataka`;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        queryWithCity
      )}&countrycodes=in&viewbox=75.7,14.6,76.1,14.3&bounded=0&addressdetails=1&limit=5`,
      { headers: { 'User-Agent': 'WellnessDiagnosticApp/1.0' } }
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        source: 'nominatim',
        results: data.map((d: any) => ({
          display_name: d.display_name,
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          source: 'nominatim',
          raw: d,
        })),
      });
    }
  } catch (err: any) {
    console.error('[Nominatim Geocode Search error]:', err);
  }

  return NextResponse.json({ success: false, results: [] });
}

