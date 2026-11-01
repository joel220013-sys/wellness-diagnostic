import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional().default('Home'),
  recipient_name: z.string().min(2, 'Recipient name is required'),
  recipient_phone: z.string().optional(),
  phone: z.string().optional(),
  address_line_1: z.string().min(3, 'House/Flat and building number is required'),
  address_line_2: z.string().optional(),
  landmark: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().min(3, 'Postal code is required'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude coordinates'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude coordinates'),
  access_instructions: z.string().optional(),
  is_default: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof AddressSchema>;

export const BookingCreateSchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  patient_name: z.string().min(2, 'Patient name is required'),
  patient_phone: z.string().min(7, 'Patient phone is required'),
  patient_email: z.string().email('Valid patient email is required'),
  patient_age: z.number().min(1).max(120),
  patient_gender: z.enum(['Male', 'Female', 'Other']),
  test_ids: z.array(z.string()).min(1, 'At least one test or health package must be selected'),
  collection_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid collection date (YYYY-MM-DD) required'),
  time_slot: z.string().min(3, 'Collection time slot must be selected'),
  address: AddressSchema,
  payment_method: z.enum(['card', 'upi', 'cash']),
  assigned_driver_id: z.string().nullable().optional(),
});

export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;

export const DriverAssignmentSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID is required'),
  driver_id: z.string().min(1, 'Driver / Phlebotomist ID is required'),
});

export const CollectionStatusUpdateSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID is required'),
  status: z.enum([
    'assigned',
    'en_route',
    'sample_collected',
    'processing_in_lab',
    'report_ready',
    'cancelled',
  ]),
  barcode: z.string().optional(),
  tube_count: z.number().int().min(1).optional(),
  temperature_normal: z.boolean().optional(),
  notes: z.string().optional(),
});

export const ReportUploadSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  results: z.array(
    z.object({
      testName: z.string(),
      parameter: z.string(),
      value: z.string(),
      unit: z.string(),
      referenceRange: z.string(),
      status: z.enum(['normal', 'high', 'low']),
    })
  ).min(1, 'At least one parameter result is required'),
  overall_remarks: z.string().min(5, 'Clinical remarks required'),
  doctor_name: z.string().optional().default('Consultant Pathologist, MD'),
});
