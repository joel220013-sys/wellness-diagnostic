export interface PatientAddress {
  id: string;
  patient_id: string;
  label: 'Home' | 'Work' | 'Other';
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  locality?: string;
  city: string;
  state?: string;
  postal_code: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  access_instructions?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
