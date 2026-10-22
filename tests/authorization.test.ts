import { describe, test, expect } from 'vitest';
import { requireRole } from '../src/lib/auth/authorization';
import { NextRequest } from 'next/server';

describe('Role-Based Access Control (RBAC) Isolation', () => {
  test('rejects request when unauthenticated', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders');
    await expect(requireRole(req, ['admin'])).rejects.toThrow('Authentication token or session is missing');
  });

  test('rejects unauthorized patient attempting admin resource', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders', {
      headers: { 'X-User-Role': 'patient' },
    });
    await expect(requireRole(req, ['admin'])).rejects.toThrow('Action restricted');
  });

  test('allows authorized admin accessing admin route', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders', {
      headers: { 'X-User-Role': 'admin' },
    });
    const user = await requireRole(req, ['admin']);
    expect(user.role).toBe('admin');
  });
});
