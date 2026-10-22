import { NextRequest } from 'next/server';
import { UserRole, SessionUser } from '@/types';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errors';
import { INITIAL_USERS } from '@/data/mockData';

export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  // If authorization header is provided, inspect or fall back to default demo user
  const authHeader = req?.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    const found = INITIAL_USERS.find((u) => u.id === token || u.email === token);
    if (found) return found;
  }

  // Check demo cookie/header
  const roleHeader = req?.headers.get('X-User-Role') as UserRole | null;
  if (roleHeader) {
    const demoUser = INITIAL_USERS.find((u) => u.role === roleHeader);
    if (demoUser) return demoUser;
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
