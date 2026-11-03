'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/admin-sidebar';
import BrandHeader from '@/components/branding/brand-header';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authTimedOut, setAuthTimedOut] = useState(false);

  // Safety fallback: Never keep admin screen stuck in loading state for more than 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimedOut(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Quick check for admin cookie as instant client-side fallback
  const hasAdminCookie =
    typeof document !== 'undefined' &&
    document.cookie.includes('wellness_auth_role=admin');

  const isAdmin = (user && user.role === 'admin') || hasAdminCookie;

  useEffect(() => {
    if (!isLoading || authTimedOut) {
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [user, isLoading, authTimedOut, isAdmin, router]);

  if (isLoading && !authTimedOut && !hasAdminCookie) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-botanical-500 animate-spin" />
          <p className="text-sm font-semibold text-botanical-800">Verifying Administrative Privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-ivory-300 max-w-md w-full text-center space-y-4 shadow-soft">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-botanical-950">Administrative Access Required</h2>
          <p className="text-sm text-botanical-800/80">
            Please log in with verified administrator credentials to view and manage laboratory packages.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/admin/login"
              className="block w-full py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-sm shadow-soft"
            >
              Go to Admin Login
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
      <BrandHeader portalRole="admin" />
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar - Docked to left edge and sticky */}
        <div className="hidden lg:block w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30">
          <AdminSidebar />
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
