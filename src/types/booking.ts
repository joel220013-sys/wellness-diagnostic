import { DiagnosticTest } from './test';
import { PatientAddress } from './address';

export type BookingStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Assigned'
  | 'Collection Scheduled'
  | 'Sample Collected'
  | 'Processing'
  | 'Report Ready'
  | 'Cancelled'
  | 'Failed'
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'collection_scheduled'
  | 'sample_collected'
  | 'processing'
  | 'report_ready'
  | 'cancelled'
  | 'failed';

export interface BookingAddressSnapshot {
  street?: string;
  address_line_1?: string;
  address_line_2?: string;
  recipient_name?: string;
  phone?: string;
  recipient_phone?: string;
  city: string;
  state?: string;
  postal_code: string;
  locality?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
  access_instructions?: string;
}

export interface BookingItemSnapshot {
  id?: string;
  booking_id?: string;
  test_id?: string;
  item_name?: string;
  item_name_snapshot?: string;
  unit_price?: number;
  unit_price_snapshot?: number;
  quantity: number;
  line_total: number;
}

export interface Booking {
  id: string;
  booking_reference: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: 'Male' | 'Female' | 'Other';
  status: BookingStatus;
  scheduled_date: string;
  scheduled_slot: string;
  address_id?: string;
  address_snapshot: BookingAddressSnapshot;
  latitude?: number;
  longitude?: number;
  subtotal: number; // in INR
  collection_fee: number; // in INR
  tax_amount?: number;
  discount?: number;
  discount_amount?: number;
  total_amount: number; // in INR
  payment_status: string;
  payment_method?: string;
  patient_notes?: string;
  driver_id?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  assigned_driver_id?: string | null;
  assigned_driver_name?: string | null;
  items?: Array<{
    id?: string;
    test_id?: string;
    item_name: string;
    unit_price?: number;
    quantity: number;
    line_total: number;
  }>;
  tests?: DiagnosticTest[];
  report_id?: string | null;
  sample_details?: {
    barcode?: string;
    sample_barcode?: string;
    tube_count?: number;
    temperature_recorded?: string;
    temperature_normal?: boolean;
    notes?: string;
    collected_at?: string;
    failure_reason?: string;
  };
  created_at?: string;
  updated_at?: string;
}
