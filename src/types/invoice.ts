export interface InvoiceItem {
  id?: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id?: string;
  order_id?: string;
  patient_id: string;
  patient_name: string;
  subtotal: number; // in INR
  collection_fee: number; // in INR
  tax_amount?: number;
  discount?: number;
  total_amount: number; // in INR
  status: 'paid' | 'pending' | 'cancelled' | 'Paid' | 'Pending' | 'Unpaid';
  payment_method?: 'card' | 'upi' | 'cash' | string;
  items?: InvoiceItem[];
  issued_at: string;
}

export interface LabReportResultItem {
  test_name?: string;
  parameter?: string;
  parameter_name?: string;
  value?: string;
  result_value?: string;
  unit: string;
  reference_range?: string;
  normal_range?: string;
  status: 'normal' | 'high' | 'low' | 'Normal' | 'High' | 'Low';
}

export interface LabReport {
  id: string;
  report_number: string;
  booking_id?: string;
  order_id?: string;
  booking_reference?: string;
  patient_id: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: 'Male' | 'Female' | 'Other';
  test_name?: string;
  storage_path?: string;
  original_filename?: string;
  status?: 'ready' | 'pending' | 'draft' | string;
  released_at: string;
  doctor_name?: string;
  verified_by_name?: string;
  lab_technician?: string;
  tests_included?: string[];
  results: LabReportResultItem[];
  overall_remarks?: string;
}
