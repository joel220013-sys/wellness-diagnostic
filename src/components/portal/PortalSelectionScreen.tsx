'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserCheck, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Sparkles,
  CheckCircle2, 
  Building2, 
  ChevronRight,
  Globe,
  Clock,
  Award
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function PortalSelectionScreen() {
  const router = useRouter();
  const { setSelectedPortal } = useAuth();

  const handlePortalSelect = (role: UserRole) => {
    setSelectedPortal(role);
    if (role === 'patient') router.push('/patient/login');
    else if (role === 'admin') router.push('/admin/login');
    else if (role === 'driver') router.push('/driver/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFF9F2] text-[#0D2319] selection:bg-botanical-200">
      {/* Top Header */}
      <header className="w-full border-b border-ivory-300/80 bg-white/70 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <BrandLogo size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-botanical-700 bg-botanical-50 hover:bg-botanical-100/80 border border-botanical-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-botanical-600" />
              <span>Public Website</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Hero Title & Subheading */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-200 text-botanical-800 text-xs sm:text-sm font-semibold mb-4 shadow-soft-sm">
            <Sparkles className="w-4 h-4 text-peach-500" />
            <span>Healthcare Gateway — Select Your Portal to Proceed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-botanical-950 tracking-tight leading-tight">
            Choose Your <span className="text-botanical-500">Access Portal</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-botanical-800/80 max-w-2xl mx-auto font-normal">
            Welcome to Wellness Diagnostic. Please select your authorized entry portal below to access customized diagnostic workflows, records, and management tools.
          </p>
        </div>

        {/* 3 Role-Based Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl">
          
          {/* 1. PATIENT PORTAL CARD */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-ivory-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-botanical-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-botanical-50 border border-botanical-100 flex items-center justify-center text-botanical-600 group-hover:bg-botanical-500 group-hover:text-white transition-colors duration-300 shadow-soft-sm">
                  <UserCheck className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-botanical-50 text-botanical-700 border border-botanical-100">
                  Patients & Family
                </span>
              </div>

              <h2 className="text-2xl font-bold text-botanical-950 group-hover:text-botanical-600 transition-colors">
                Patient Portal
              </h2>
              <p className="mt-2 text-sm text-botanical-800/75 leading-relaxed">
                Book blood tests, schedule home collection, view reports, and download invoices.
              </p>

              <div className="mt-6 pt-5 border-t border-ivory-200/80 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-botanical-500 flex-shrink-0 mt-0.5" />
                  <span>Browse 50+ blood tests & health packages</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-botanical-500 flex-shrink-0 mt-0.5" />
                  <span>Interactive map home collection selector</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-botanical-500 flex-shrink-0 mt-0.5" />
                  <span>Download verified NABL PDF laboratory reports</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => handlePortalSelect('patient')}
                className="w-full py-3.5 px-4 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-soft transition-all duration-200 group-hover:shadow-md"
              >
                <span>Continue as Patient</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. ADMIN PORTAL CARD */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-ivory-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-peach-100/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-peach-50 border border-peach-200 flex items-center justify-center text-peach-600 group-hover:bg-peach-400 group-hover:text-white transition-colors duration-300 shadow-soft-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-peach-50 text-peach-700 border border-peach-200">
                  Lab Admins Only
                </span>
              </div>

              <h2 className="text-2xl font-bold text-botanical-950 group-hover:text-peach-600 transition-colors">
                Admin Portal
              </h2>
              <p className="mt-2 text-sm text-botanical-800/75 leading-relaxed">
                Manage bookings, patients, test packages, staff, driver assignments, reports, and billing.
              </p>

              <div className="mt-6 pt-5 border-t border-ivory-200/80 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-peach-500 flex-shrink-0 mt-0.5" />
                  <span>Real-time dispatch & live city collection map</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-peach-500 flex-shrink-0 mt-0.5" />
                  <span>Enter lab test results & publish signed reports</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-peach-500 flex-shrink-0 mt-0.5" />
                  <span>Manage INR pricing, test catalog & staff roles</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => handlePortalSelect('admin')}
                className="w-full py-3.5 px-4 rounded-xl bg-botanical-900 hover:bg-botanical-950 active:bg-black text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-soft transition-all duration-200 group-hover:shadow-md"
              >
                <span>Continue as Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 3. DRIVER / PHLEBOTOMIST PORTAL CARD */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-ivory-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-botanical-100/60 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-botanical-50 border border-botanical-200 flex items-center justify-center text-botanical-700 group-hover:bg-botanical-600 group-hover:text-white transition-colors duration-300 shadow-soft-sm">
                  <Truck className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-botanical-100 text-botanical-800 border border-botanical-200">
                  Mobile Phlebotomists
                </span>
              </div>

              <h2 className="text-2xl font-bold text-botanical-950 group-hover:text-botanical-600 transition-colors">
                Driver / Phlebotomist
              </h2>
              <p className="mt-2 text-sm text-botanical-800/75 leading-relaxed">
                View assigned collections, navigate to patient addresses, and update collection details.
              </p>

              <div className="mt-6 pt-5 border-t border-ivory-200/80 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-botanical-500 flex-shrink-0 mt-0.5" />
                  <span>Today's assigned patient home visit schedules</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-botanical-500 flex-shrink-0 mt-0.5" />
                  <span>One-touch patient calling & route navigation</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-botanical-900/80">
                  <CheckCircle2 className="w-4 h-4 text-botanical-500 flex-shrink-0 mt-0.5" />
                  <span>Log vial barcodes, tube count & cold-chain status</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => handlePortalSelect('driver')}
                className="w-full py-3.5 px-4 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-soft transition-all duration-200 group-hover:shadow-md"
              >
                <span>Continue as Driver</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-ivory-300/80 bg-white/40 py-4 px-4 text-center text-xs text-botanical-800/70">
        © 2026 Wellness Diagnostic Laboratory Inc. All rights reserved. Strict role isolation and patient data privacy protected.
      </footer>
    </div>
  );
}
