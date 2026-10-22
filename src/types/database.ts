export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          role: 'patient' | 'admin' | 'driver';
          full_name: string;
          avatar_url: string | null;
          badge_id: string | null;
          designation: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      patient_addresses: {
        Row: {
          id: string;
          patient_id: string;
          label: string;
          recipient_name: string;
          phone: string;
          address_line_1: string;
          address_line_2: string | null;
          locality: string | null;
          city: string;
          state: string | null;
          postal_code: string;
          landmark: string | null;
          latitude: number;
          longitude: number;
          access_instructions: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      tests: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          category: string;
          price: number;
          preparation_instructions: string | null;
          turnaround_description: string;
          sample_type: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_reference: string;
          patient_id: string;
          status: string;
          scheduled_date: string;
          scheduled_slot: string;
          address_id: string | null;
          address_snapshot: Json;
          latitude: number;
          longitude: number;
          subtotal: number;
          collection_fee: number;
          tax_amount: number;
          total_amount: number;
          payment_status: string;
          patient_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
