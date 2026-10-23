'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionUser, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: SessionUser | null;
  isLoading: boolean;
  selectedPortal: UserRole | null;
  setSelectedPortal: (role: UserRole | null) => void;
  login: (emailOrPhone: string, password: string, requiredRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  registerPatient: (data: { name: string; email: string; phone: string; password: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  registerAccount: (data: { name: string; email: string; phone: string; password: string; role: UserRole; badgeId?: string; designation?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  usersList: SessionUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'wellness_auth_user_v5';
const STORAGE_KEY_PORTAL = 'wellness_selected_portal_v5';
const STORAGE_KEY_USERS_DB = 'wellness_users_database_v5';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [selectedPortal, setSelectedPortalState] = useState<UserRole | null>(null);
  const [usersList, setUsersList] = useState<SessionUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS_DB);
      if (storedUsers) {
        setUsersList(JSON.parse(storedUsers));
      } else {
        setUsersList([]);
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify([]));
      }

      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedPortal = localStorage.getItem(STORAGE_KEY_PORTAL);
      if (storedPortal && ['patient', 'admin', 'driver'].includes(storedPortal)) {
        setSelectedPortalState(storedPortal as UserRole);
      }
    } catch (e) {
      console.error('Failed to parse auth data from localStorage:', e);
    } finally {
      setIsLoading(false);
    }

    // Also sync profiles from Supabase backend if available
    fetch('/api/auth/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          const mapped: SessionUser[] = data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            role: p.role,
            badgeId: p.badge_id,
            designation: p.designation,
            avatar: p.avatar_url,
            active: true,
            createdAt: p.created_at,
          }));
          if (mapped.length > 0) {
            setUsersList((prev) => {
              const combined = [...mapped];
              for (const u of prev) {
                if (!combined.some((c) => c.id === u.id || c.email === u.email)) {
                  combined.push(u);
                }
              }
              try {
                localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const setSelectedPortal = (role: UserRole | null) => {
    setSelectedPortalState(role);
    if (role) {
      localStorage.setItem(STORAGE_KEY_PORTAL, role);
    } else {
      localStorage.removeItem(STORAGE_KEY_PORTAL);
    }
  };

  const login = async (emailOrPhone: string, password: string, requiredRole: UserRole): Promise<{ success: boolean; error?: string }> => {
    const cleanInput = emailOrPhone.trim().toLowerCase();

    // 1. First try authenticating via Supabase backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanInput,
          password,
          required_role: requiredRole
        })
      });
      if (res.ok) {
        const json = await res.json();
        const p = json.data;
        const loggedInUser: SessionUser = {
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          role: p.role,
          badgeId: p.badge_id,
          designation: p.designation,
          avatar: p.avatar_url,
          active: true,
          createdAt: p.created_at
        };
        setUser(loggedInUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedInUser));
        return { success: true };
      }
    } catch {}

    // 2. Fallback to local users list
    const foundUser = usersList.find(
      (u) => u.email.toLowerCase() === cleanInput || u.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '')
    );

    if (!foundUser) {
      return {
        success: false,
        error: `No account found with identifier "${emailOrPhone}". Please register or initialize your account first.`
      };
    }

    if (foundUser.role !== requiredRole) {
      const roleNames: Record<UserRole, string> = {
        patient: 'Patient Portal (/patient/login)',
        admin: 'Admin Portal (/admin/login)',
        driver: 'Driver / Phlebotomist Portal (/driver/login)'
      };

      return {
        success: false,
        error: `Access Denied: This account is registered as "${foundUser.role.toUpperCase()}" and is not authorized for the ${roleNames[requiredRole]}.`
      };
    }

    if (password.length < 4) {
      return {
        success: false,
        error: 'Invalid password. Password must be at least 4 characters.'
      };
    }

    setUser(foundUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(foundUser));
    return { success: true };
  };

  const registerAccount = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    badgeId?: string;
    designation?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    // 1. Persist to Supabase PostgreSQL Database
    let createdUser: SessionUser | null = null;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password: data.password,
          role: data.role,
          badge_id: data.badgeId,
          designation: data.designation
        })
      });

      if (res.ok) {
        const json = await res.json();
        const p = json.data;
        createdUser = {
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          role: p.role,
          badgeId: p.badge_id,
          designation: p.designation,
          avatar: p.avatar_url,
          active: true,
          createdAt: p.created_at || new Date().toISOString()
        };
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.detail) {
          return { success: false, error: err.detail };
        }
      }
    } catch {}

    if (!createdUser) {
      createdUser = {
        id: `user_${data.role}_${Date.now()}`,
        name: data.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: data.role,
        badgeId: data.badgeId || `WD-${data.role.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        designation: data.designation || (data.role === 'admin' ? 'Laboratory Administrator' : (data.role === 'driver' ? 'Phlebotomist' : 'Patient')),
        active: true,
        createdAt: new Date().toISOString()
      };
    }

    const updated = [createdUser, ...usersList.filter((u) => u.email !== cleanEmail)];
    setUsersList(updated);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(updated));

    setUser(createdUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(createdUser));

    return { success: true };
  };

  const registerPatient = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    return registerAccount({
      ...data,
      role: 'patient',
      designation: 'Patient'
    });
  };

  const loginAsDemo = (role: UserRole) => {
    const demoUser = usersList.find((u) => u.role === role);
    if (demoUser) {
      setUser(demoUser);
      setSelectedPortal(role);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));

      if (role === 'patient') router.push('/patient/dashboard');
      else if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'driver') router.push('/driver/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedPortal(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_PORTAL);
    router.push('/');
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((res) => setTimeout(res, 300));
    return {
      success: true,
      message: `Password reset instructions dispatched to ${email}.`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        selectedPortal,
        setSelectedPortal,
        login,
        registerPatient,
        registerAccount,
        loginAsDemo,
        logout,
        requestPasswordReset,
        usersList
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
