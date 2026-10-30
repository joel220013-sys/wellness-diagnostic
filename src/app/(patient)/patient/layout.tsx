'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PatientSidebar from '@/components/layout/patient-sidebar';
import BrandHeader from '@/components/branding/brand-header';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'patient') {
        router.push('/patient/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-botanical-500 animate-spin" />
          <p className="text-sm font-semibold text-botanical-800">Authenticating Patient Portal Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'patient') {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-ivory-300 max-w-md w-full text-center space-y-4 shadow-soft">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-botanical-950">Invalid Credentials</h2>
          <p className="text-sm text-botanical-800/80">Please sign in with valid patient credentials to access personal health records and appointments.</p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/patient/login"
              className="block w-full py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-sm shadow-soft"
            >
              Go to Patient Login
            </Link>
            <Link
              href="/portal"
              className="block w-full py-2.5 rounded-xl bg-ivory-100 text-botanical-900 font-semibold text-sm border border-ivory-300"
            >
              Choose Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col">
      <BrandHeader portalRole="patient" />
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar - Docked to left edge */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <PatientSidebar />
        </div>
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-[1400px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
