export interface ParsedAddress {
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
}

/**
 * Parses raw Nominatim reverse/search geocoding JSON into clean, structured Indian address fields.
 * Handles POIs (universities, hospitals, companies, cafes), house numbers, roads, localities,
 * villages, districts, and states without ugly road fallbacks or missing fields.
 */
export function parseNominatimAddress(data: any): ParsedAddress {
  const addr = (data && typeof data === 'object' && data.address) || {};

  // 1. Specific POI / Building / Campus / Hospital / Facility / Shop name
  const poi = (
    data?.name ||
    addr.amenity ||
    addr.building ||
    addr.office ||
    addr.shop ||
    addr.tourism ||
    addr.leisure ||
    addr.healthcare ||
    addr.hospital ||
    addr.clinic ||
    addr.school ||
    addr.university ||
    addr.college ||
    addr.commercial ||
    addr.industrial ||
    addr.house_name ||
    ''
  ).trim();

  // 2. House Number / Door Number
  const houseNumber = (addr.house_number || '').trim();

  // 3. Road / Street / Avenue / Highway
  const road = (
    addr.road ||
    addr.street ||
    addr.pedestrian ||
    addr.highway ||
    addr.path ||
    addr.footway ||
    ''
  ).trim();

  // 4. Locality / Suburb / Neighbourhood / Sector / Colony
  const locality = (
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    addr.subdivision ||
    addr.quarter ||
    addr.subdistrict ||
    ''
  ).trim();

  // 5. Village / Hamlet
  const village = (addr.village || addr.hamlet || addr.isolated_dwelling || '').trim();

  // 6. City / District / Town / Municipality
  const rawCity = (
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.city_district ||
    addr.state_district ||
    addr.district ||
    addr.county ||
    village ||
    ''
  ).trim();

  // Clean administrative suffixes (e.g. "Davanagere Taluku" -> "Davanagere")
  const cleanCity = rawCity
    .replace(/\s+(Taluk|Taluku|District|Division|Tehsil|Mandal)$/i, '')
    .trim();

  // 7. State & Postal Code
  const state = (addr.state || addr.province || addr.region || '').trim();
  const postalCode = (addr.postcode || '').trim();

  // Structure Address Line 1 and Line 2
  let line1 = '';
  let line2 = '';
  let landmark = '';

  if (poi && poi.toLowerCase() !== road.toLowerCase()) {
    line1 = houseNumber ? `${houseNumber}, ${poi}` : poi;
    const line2Parts = [road, locality].filter((p) => Boolean(p) && p.toLowerCase() !== poi.toLowerCase());
    line2 = line2Parts.join(', ');
  } else if (houseNumber) {
    line1 = road ? `${houseNumber}, ${road}` : `House No. ${houseNumber}`;
    line2 = locality || village;
  } else if (road) {
    line1 = road;
    line2 = locality || village;
  } else {
    const firstSegment = (data?.display_name || '').split(',')[0]?.trim() || '';
    line1 = firstSegment;
    line2 = locality || village;
  }

  // Landmark Deduction:
  if (village && village.toLowerCase() !== cleanCity.toLowerCase() && !line1.toLowerCase().includes(village.toLowerCase()) && !line2.toLowerCase().includes(village.toLowerCase())) {
    landmark = `Near ${village}`;
  } else if (locality && !line1.toLowerCase().includes(locality.toLowerCase()) && !line2.toLowerCase().includes(locality.toLowerCase())) {
    landmark = `Near ${locality}`;
  } else if (road && !line1.toLowerCase().includes(road.toLowerCase()) && !line2.toLowerCase().includes(road.toLowerCase())) {
    landmark = `On ${road}`;
  }

  return {
    addressLine1: line1,
    addressLine2: line2,
    landmark,
    city: cleanCity,
    state,
    postalCode,
  };
}
