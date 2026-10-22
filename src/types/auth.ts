export type UserRole = 'patient' | 'admin' | 'driver';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  badge_id?: string;
  designation?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  patientId?: string;
  badgeId?: string;
  designation?: string;
  active: boolean;
  createdAt: string;
}
