'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from './logo';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Shield, Truck } from 'lucide-react';

interface BrandHeaderProps {
  portalRole?: 'patient' | 'admin' | 'driver';
  title?: string;
  subtitle?: string;
}

export default function BrandHeader({ portalRole, title, subtitle }: BrandHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-ivory-300 sticky top-0 z-30 shadow-soft-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" showTagline={false} />
          {portalRole && (
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-ivory-300">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize tracking-wide ${
                portalRole === 'admin' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                  : portalRole === 'driver'
                  ? 'bg-sky-100 text-sky-900 border border-sky-200'
                  : 'bg-botanical-100 text-botanical-900 border border-botanical-200'
              }`}>
                {portalRole === 'driver' ? 'Phlebotomist / Driver' : portalRole} Portal
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-botanical-950">{user.name}</p>
                <p className="text-[11px] text-botanical-700/70">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out of portal"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="text-xs font-semibold text-botanical-800 hover:text-botanical-600 transition-colors"
            >
              Change Portal
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
