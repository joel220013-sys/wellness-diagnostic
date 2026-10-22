'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DriverNavigation from '@/components/layout/driver-navigation';
import BrandHeader from '@/components/branding/brand-header';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/driver/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-botanical-500 animate-spin" />
          <p className="text-sm font-semibold text-botanical-800">Verifying Phlebotomist Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-ivory-300 max-w-md w-full text-center space-y-4 shadow-soft">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-botanical-950">Phlebotomist Login Required</h2>
          <p className="text-sm text-botanical-800/80">
            Please sign in with your certified phlebotomist or driver credentials to view assigned collection jobs.
          </p>
          <Link
            href="/driver/login"
            className="block w-full py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-sm shadow-soft"
          >
            Go to Driver Login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'driver') {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-rose-200 max-w-md w-full text-center space-y-4 shadow-soft">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-botanical-950">Access Restricted</h2>
          <p className="text-sm text-botanical-800/80">
            Your authenticated account (<strong>{user.role.toUpperCase()}</strong>) is not recognized as a registered phlebotomist.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={user.role === 'patient' ? '/patient/dashboard' : '/admin/dashboard'}
              className="block w-full py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-sm shadow-soft"
            >
              Go to Your Portal
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 rounded-xl bg-ivory-100 text-botanical-900 font-semibold text-sm border border-ivory-300"
            >
              Switch Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col pb-16 md:pb-0">
      <BrandHeader portalRole="driver" />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Navigation */}
        <DriverNavigation />
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
