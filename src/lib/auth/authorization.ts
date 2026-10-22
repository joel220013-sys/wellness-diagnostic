import { NextRequest } from 'next/server';
import { UserRole, SessionUser } from '@/types';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errors';
export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  const roleHeader = req?.headers.get('X-User-Role') as UserRole | null;
  if (roleHeader) {
    return {
      id: `usr_${roleHeader}`,
      name: roleHeader.charAt(0).toUpperCase() + roleHeader.slice(1) + ' User',
      email: `${roleHeader}@wellness.com`,
      phone: '+91 98765 00000',
      role: roleHeader,
      active: true,
      createdAt: new Date().toISOString()
    };
  }
  return null;
}

export async function requireAuth(req: NextRequest): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) {
    throw new UnauthorizedError('Authentication token or session is missing');
  }
  return user;
}

export async function requireRole(req: NextRequest, allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth(req);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Action restricted. Permitted roles: ${allowedRoles.join(', ')}`);
  }
  return user;
}
