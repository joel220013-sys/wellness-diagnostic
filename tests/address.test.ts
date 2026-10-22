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
