import { UserRole } from '@/types';

export const ROLES: Record<string, UserRole> = {
  PATIENT: 'patient',
  ADMIN: 'admin',
  DRIVER: 'driver',
};

export function isValidRole(role: string): role is UserRole {
  return ['patient', 'admin', 'driver'].includes(role);
}

export function isPatient(role?: UserRole): boolean {
  return role === 'patient';
}

export function isAdmin(role?: UserRole): boolean {
  return role === 'admin';
}

export function isDriver(role?: UserRole): boolean {
  return role === 'driver';
}
