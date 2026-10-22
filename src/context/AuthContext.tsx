'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionUser, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

const INITIAL_USERS: SessionUser[] = [
  {
    id: 'user_patient_1',
    name: 'Patient User',
    email: 'patient@wellness.com',
    phone: '+91 98765 43210',
    role: 'patient',
    patientId: 'WD-PT-001',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_admin_1',
    name: 'Medical Administrator',
    email: 'admin@wellness.com',
    phone: '+91 98765 12345',
    role: 'admin',
    badgeId: 'WD-ADM-001',
    designation: 'Laboratory Director',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_driver_1',
    name: 'Phlebotomist Partner',
    email: 'driver@wellness.com',
    phone: '+91 98111 22334',
    role: 'driver',
    badgeId: 'WD-PHLEB-001',
    designation: 'Senior Phlebotomist',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  }
];

interface AuthContextType {
  user: SessionUser | null;
  isLoading: boolean;
  selectedPortal: UserRole | null;
  setSelectedPortal: (role: UserRole | null) => void;
  login: (emailOrPhone: string, password: string, requiredRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  registerPatient: (data: { name: string; email: string; phone: string; password: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  usersList: SessionUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'wellness_auth_user_v2';
const STORAGE_KEY_PORTAL = 'wellness_selected_portal_v2';
const STORAGE_KEY_USERS_DB = 'wellness_users_database_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [selectedPortal, setSelectedPortalState] = useState<UserRole | null>(null);
  const [usersList, setUsersList] = useState<SessionUser[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS_DB);
      if (storedUsers) {
        setUsersList(JSON.parse(storedUsers));
      } else {
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(INITIAL_USERS));
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
    await new Promise((res) => setTimeout(res, 350));

    const cleanInput = emailOrPhone.trim().toLowerCase();
    
    const foundUser = usersList.find(
      (u) => u.email.toLowerCase() === cleanInput || u.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '')
    );

    if (!foundUser) {
      return {
        success: false,
        error: `No account found with identifier "${emailOrPhone}". Please check credentials or register.`
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

  const registerPatient = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    await new Promise((res) => setTimeout(res, 400));

    const cleanEmail = data.email.trim().toLowerCase();

    const existing = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      };
    }

    const newPatient: SessionUser = {
      id: `user_patient_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      role: 'patient',
      patientId: `WD-PT-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      active: true,
      createdAt: new Date().toISOString()
    };

    const updated = [newPatient, ...usersList];
    setUsersList(updated);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(updated));

    setUser(newPatient);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newPatient));

    return { success: true };
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
      message: `Password reset instructions and verification link dispatched to ${email}.`
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
