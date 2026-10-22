import { describe, test, expect } from 'vitest';
import { isValidRole, isPatient, isAdmin, isDriver } from '../src/lib/auth/roles';

describe('Authentication & Role Validation', () => {
  test('correctly validates permissible roles', () => {
    expect(isValidRole('patient')).toBe(true);
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('driver')).toBe(true);
    expect(isValidRole('superuser')).toBe(false);
    expect(isValidRole('')).toBe(false);
  });

  test('role guard helpers return accurate boolean states', () => {
    expect(isPatient('patient')).toBe(true);
    expect(isPatient('admin')).toBe(false);
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('driver')).toBe(false);
    expect(isDriver('driver')).toBe(true);
    expect(isDriver('patient')).toBe(false);
  });
});
