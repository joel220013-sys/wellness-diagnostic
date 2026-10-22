import { BookingStatus } from './booking';

export interface CollectionAssignment {
  id: string;
  booking_id: string;
  driver_id: string;
  assigned_by: string;
  assignment_status: 'pending' | 'accepted' | 'en_route' | 'completed' | 'failed';
  assigned_at: string;
  updated_at: string;
}

export interface CollectionEvent {
  id: string;
  booking_id: string;
  assignment_id?: string;
  actor_id: string;
  event_type: BookingStatus;
  notes?: string;
  barcode?: string;
  tube_count?: number;
  occurred_at: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  badge_id: string;
  vehicle_number: string;
  vehicle_details?: string;
  assigned_orders_count?: number;
  active_status: 'on_duty' | 'off_duty' | 'on_route';
  current_zone: string;
  completed_today: number;
  pending_today: number;
  rating: number;
}
