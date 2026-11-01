import { describe, test, expect } from 'vitest';
import { BookingCreateSchema } from '../src/lib/validations';

describe('Booking Integrity & Validation', () => {
  test('rejects booking with missing tests array', () => {
    const invalidBooking = {
      patient_id: 'user_patient_1',
      patient_name: 'Test Patient',
      patient_phone: '+91 98765 43210',
      patient_email: 'patient@example.com',
      patient_age: 32,
      patient_gender: 'Female',
      test_ids: [], // empty!
      collection_date: '2026-10-22',
      time_slot: '07:30 AM – 09:00 AM',
      address: {
        recipient_name: 'Test Patient',
        recipient_phone: '+91 98765 43210',
        address_line_1: 'Flat 402',
        city: 'Gurugram',
        postal_code: '122018',
        latitude: 28.4022,
        longitude: 77.0654,
      },
      payment_method: 'card',
    };

    const result = BookingCreateSchema.safeParse(invalidBooking);
    expect(result.success).toBe(false);
  });

  test('validates correct booking structure with valid GPS coordinates', () => {
    const validBooking = {
      patient_id: 'user_patient_1',
      patient_name: 'Test Patient',
      patient_phone: '+91 98765 43210',
      patient_email: 'patient@example.com',
      patient_age: 32,
      patient_gender: 'Female',
      test_ids: ['pkg_full_body'],
      collection_date: '2026-10-22',
      time_slot: '07:30 AM – 09:00 AM',
      address: {
        recipient_name: 'Test Patient',
        recipient_phone: '+91 98765 43210',
        address_line_1: 'Tower B, Flat 402',
        city: 'Gurugram',
        postal_code: '122018',
        latitude: 28.4022,
        longitude: 77.0654,
      },
      payment_method: 'upi',
    };

    const result = BookingCreateSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
  });
});
