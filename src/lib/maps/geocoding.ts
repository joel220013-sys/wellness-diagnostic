export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5&countrycodes=in`;

    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'WellnessDiagnosticApp/1.0',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.address,
    }));
  } catch (err) {
    console.error('Error during geocode search:', err);
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'WellnessDiagnosticApp/1.0',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      displayName: data.display_name,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      address: data.address,
    };
  } catch (err) {
    console.error('Error during reverse geocoding:', err);
    return null;
  }
}
