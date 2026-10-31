'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  CalendarCheck, 
  FileText, 
  Receipt, 
  MapPin, 
  User, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  FlaskConical,
  Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from '@/components/common/BrandLogo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { name: 'All Diagnostic Tests', href: '/patient/tests', icon: FlaskConical, badge: '200+' },
  { name: 'Book Home Collection', href: '/patient/book', icon: CalendarPlus, badge: 'Book' },
  { name: 'My Bookings', href: '/patient/bookings', icon: CalendarCheck },
  { name: 'Laboratory Reports', href: '/patient/reports', icon: FileText },
  { name: 'Invoices & Billing', href: '/patient/invoices', icon: Receipt },
  { name: 'Saved Addresses', href: '/patient/addresses', icon: MapPin },
  { name: 'Patient Profile', href: '/patient/profile', icon: User },
  { name: 'Settings & Security', href: '/patient/settings', icon: Settings },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-ivory-300 h-full flex flex-col justify-between p-4 shadow-soft-sm overflow-y-auto">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 bg-botanical-50/60 rounded-2xl border border-botanical-100/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-botanical-500 text-white font-bold flex items-center justify-center text-sm shadow-soft-sm">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-botanical-950 truncate">{user?.name || 'Patient'}</p>
              <p className="text-xs text-botanical-700/80 truncate">{user?.email || 'patient@wellness.com'}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-botanical-700 border border-botanical-200">
                Patient ID: {user?.patientId || user?.badgeId || 'WD-PT-001'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-botanical-800/60 mb-2">
            Patient Portal
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/patient/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-botanical-500 text-white shadow-soft-sm font-bold'
                    : 'text-botanical-900/80 hover:bg-botanical-50/70 hover:text-botanical-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-botanical-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-peach-100 text-botanical-900 border border-peach-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="space-y-3 pt-4 border-t border-ivory-200">
        <div className="p-3 rounded-xl bg-ivory-100/70 border border-ivory-200 text-xs text-botanical-900/80">
          <div className="flex items-center gap-1.5 font-bold text-botanical-950 mb-1">
            <PhoneCall className="w-3.5 h-3.5 text-botanical-600" />
            <span>Support Helpline</span>
          </div>
          <p className="text-[11px] text-botanical-700/80">1800-419-WELL (24x7 Support)</p>
        </div>

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
  );
}
