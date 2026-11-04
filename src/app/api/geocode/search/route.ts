import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAwsS5CrgxBPJ37X6UoWiX5ZgIAlVWDk48';

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) {
    return NextResponse.json({ success: false, results: [] });
  }

  // 1. Google Maps Geocoding API
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
      console.warn('[Google Geocode Search error]:', err);
    }
  }

  // 2. Local Davanagere Fuzzy Match Search
  const lowerQ = q.toLowerCase();
  const matched = DAVANAGERE_GRID.filter(
    (g) =>
      g.name.toLowerCase().includes(lowerQ) ||
      g.locality.toLowerCase().includes(lowerQ) ||
      g.landmark.toLowerCase().includes(lowerQ)
  );

  const results = (matched.length > 0 ? matched : DAVANAGERE_GRID.slice(0, 5)).map((item) => ({
    display_name: `${item.name}, ${item.locality}, Davanagere, Karnataka ${item.pin}`,
    lat: item.lat,
    lon: item.lng,
    source: 'google_fallback_grid',
    address: {
      address_line_1: item.name,
      address_line_2: item.locality,
      landmark: item.landmark,
      locality: item.locality,
      city: 'Davanagere',
      state: 'Karnataka',
      postal_code: item.pin,
    },
  }));

  return NextResponse.json({
    success: true,
    source: 'google_fallback_grid',
    results,
  });
}
