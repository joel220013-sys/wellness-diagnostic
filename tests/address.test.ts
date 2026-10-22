/// <reference types="jest" />
import { AddressSchema } from '../src/lib/validations';

describe('Address Validation & Coordinate Safeguards', () => {
  test('rejects out-of-range latitude coordinates', () => {
    const invalidAddress = {
      recipient_name: 'Patient Test',
      recipient_phone: '+91 98765 43210',
      address_line_1: 'Plot 12',
      city: 'Delhi',
      postal_code: '110001',
      latitude: 105.4, // invalid lat > 90!
      longitude: 77.2,
    };

    const res = AddressSchema.safeParse(invalidAddress);
    expect(res.success).toBe(false);
  });

  test('accepts valid address with numeric coordinates', () => {
    const validAddress = {
      recipient_name: 'Patient Test',
      recipient_phone: '+91 98765 43210',
      address_line_1: 'Plot 12, Connaught Place',
      city: 'New Delhi',
      postal_code: '110001',
      latitude: 28.6315,
      longitude: 77.2167,
    };

    const res = AddressSchema.safeParse(validAddress);
    expect(res.success).toBe(true);
  });
});

import { parseNominatimAddress } from '../src/lib/geoAddress';

describe('Nominatim Address Parsing', () => {
  test('correctly extracts GMIT Davanagere place details into structured fields', () => {
    const nominatimData = {
      name: 'GM Institute of Technology',
      address: {
        amenity: 'GM Institute of Technology',
        road: 'SH76',
        suburb: 'K.T. Jambanna Nagara',
        village: 'Doddabati',
        county: 'Davanagere Taluku',
        state_district: 'Davanagere',
        state: 'Karnataka',
        postcode: '577566',
      },
    };

    const parsed = parseNominatimAddress(nominatimData);
    expect(parsed.addressLine1).toBe('GM Institute of Technology');
    expect(parsed.addressLine2).toBe('SH76, K.T. Jambanna Nagara');
    expect(parsed.landmark).toBe('Near Doddabati');
    expect(parsed.city).toBe('Davanagere');
    expect(parsed.state).toBe('Karnataka');
    expect(parsed.postalCode).toBe('577566');
  });

  test('correctly extracts Bangalore cafe with house number and neighbourhood', () => {
    const nominatimData = {
      name: 'Dialogues Cafe',
      address: {
        amenity: 'Dialogues Cafe',
        house_number: '41',
        road: 'Mahayogi Vemana Road',
        neighbourhood: 'Koramangala 4th Block',
        suburb: 'Kormangala East',
        city: 'Bengaluru',
        state: 'Karnataka',
        postcode: '560034',
      },
    };

    const parsed = parseNominatimAddress(nominatimData);
    expect(parsed.addressLine1).toBe('41, Dialogues Cafe');
    expect(parsed.addressLine2).toBe('Mahayogi Vemana Road, Kormangala East');
    expect(parsed.city).toBe('Bengaluru');
    expect(parsed.state).toBe('Karnataka');
    expect(parsed.postalCode).toBe('560034');
  });
});

