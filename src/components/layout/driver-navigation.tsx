'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MapPin, 
  Clock, 
  User, 
  LogOut, 
  CheckCircle,
  Truck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from '@/components/common/BrandLogo';

export default function DriverNavigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const NAV_ITEMS = [
    { name: 'Cockpit', href: '/driver/dashboard', icon: Home },
    { name: 'My Assignments', href: '/driver/assignments', icon: MapPin },
    { name: 'History', href: '/driver/history', icon: Clock },
    { name: 'Profile', href: '/driver/profile', icon: User },
  ];

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-ivory-300 h-full flex-col justify-between p-4 shadow-soft-sm overflow-y-auto">
        <div className="space-y-6">
          {/* Driver profile chip */}
          <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-soft-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-botanical-950 truncate">{user?.name || 'Phlebotomist'}</p>
                <p className="text-[11px] text-botanical-700/80 truncate">{user?.badgeId || 'WD-PHLEB-104'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-800">On Duty Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-botanical-800/60 mb-2">
              Mobile Phlebotomy Portal
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-botanical-500 text-white shadow-soft font-bold'
                      : 'text-botanical-900/80 hover:bg-sky-50 hover:text-sky-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sky-700'}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-ivory-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sign Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-ivory-300 py-2 px-3 z-50 flex items-center justify-around shadow-soft-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-semibold transition-colors ${
                isActive ? 'text-botanical-600 font-bold' : 'text-botanical-700/70'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-botanical-100 text-botanical-700' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
