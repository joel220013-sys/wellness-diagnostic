import { BookingCreateInput } from '@/lib/validations';
import { calculateOrderPricing } from './pricingService';
import { getServerSupabase } from '@/lib/supabase/server';
import { Booking } from '@/types';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';

export async function createBookingService(input: BookingCreateInput): Promise<{
  success: boolean;
  booking?: Booking;
  error?: string;
}> {
  try {
    const pricing = calculateOrderPricing(input.test_ids);

    const booking_reference = `WD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingId = `ord_${Date.now()}`;
    const assignedDriverId = input.assigned_driver_id || 'drv_unassigned';

    const addressSnapshot = {
      street: sanitizeInput(`${input.address.address_line_1}${input.address.address_line_2 ? ', ' + input.address.address_line_2 : ''}`),
      city: sanitizeInput(input.address.city),
      postal_code: sanitizeInput(input.address.postal_code),
      locality: input.address.locality ? sanitizeInput(input.address.locality) : undefined,
      landmark: input.address.landmark ? sanitizeInput(input.address.landmark) : undefined,
      latitude: input.address.latitude,
      longitude: input.address.longitude,
      instructions: input.address.access_instructions ? sanitizeInput(input.address.access_instructions) : undefined,
    };

    const newBooking: Booking = {
      id: bookingId,
      booking_reference,
      patient_id: sanitizeInput(input.patient_id),
      patient_name: sanitizeInput(input.patient_name),
      patient_phone: sanitizePhone(input.patient_phone),
      patient_email: sanitizeEmail(input.patient_email),
      patient_age: input.patient_age,
      patient_gender: input.patient_gender,
      status: 'assigned',
      scheduled_date: input.collection_date,
      scheduled_slot: input.time_slot,
      address_snapshot: addressSnapshot,
      latitude: input.address.latitude,
      longitude: input.address.longitude,
      tests: pricing.items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.id,
        price: item.price,
        original_price: item.price + 500,
        category: 'Popular',
        turnaround_description: '12-24 Hours',
        description: 'Comprehensive diagnostic blood test panel',
        parameters_count: 15,
        sample_type: 'Blood (EDTA & Serum)',
        active: true,
      })),
      subtotal: pricing.subtotal,
      collection_fee: pricing.collectionFee,
      discount_amount: pricing.discount,
      tax_amount: pricing.tax,
      total_amount: pricing.total,
      payment_status: input.payment_method === 'cash' ? 'cash_on_collection' : 'paid',
      payment_method: input.payment_method,
      assigned_driver_id: assignedDriverId,
      assigned_driver_name: input.assigned_driver_id ? 'Assigned Phlebotomist' : 'Pending Assignment',
      driver_phone: '+91 98111 22334',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabaseServer = getServerSupabase();
    if (supabaseServer) {
      await supabaseServer.from('bookings').insert({
        id: newBooking.id,
        booking_reference: newBooking.booking_reference,
        patient_id: newBooking.patient_id,
        scheduled_date: newBooking.scheduled_date,
        scheduled_slot: newBooking.scheduled_slot,
        status: newBooking.status,
        subtotal: newBooking.subtotal,
        collection_fee: newBooking.collection_fee,
        total_amount: newBooking.total_amount,
        payment_status: newBooking.payment_status,
        address_snapshot: addressSnapshot,
        latitude: addressSnapshot.latitude,
        longitude: addressSnapshot.longitude,
      });
    }

    return {
      success: true,
      booking: newBooking,
    };
  } catch (err: any) {
    console.error('Error in createBookingService:', err);
    return {
      success: false,
      error: err.message || 'Failed to create home blood collection booking.',
    };
  }
}
