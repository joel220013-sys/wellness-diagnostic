'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MapPin, 
  Users, 
  FlaskConical, 
  Package, 
  Truck, 
  UserCheck, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders & Bookings', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Collection Map', href: '/admin/map', icon: MapPin },
  { name: 'Patients Records', href: '/admin/patients', icon: Users },
  { name: 'Diagnostic Tests', href: '/admin/tests', icon: FlaskConical },
  { name: 'Health Packages', href: '/admin/packages', icon: Package },
  { name: 'Phlebotomists / Drivers', href: '/admin/drivers', icon: Truck },
  { name: 'Job Assignments', href: '/admin/assignments', icon: UserCheck },
  { name: 'Lab Reports', href: '/admin/reports', icon: FileText },
  { name: 'Invoices & Revenue', href: '/admin/invoices', icon: Receipt },
  { name: 'Lab Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-[#18352E] text-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-soft">
      <div className="space-y-5">
        {/* Admin Credential Badge */}
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-peach-400 text-botanical-950 font-extrabold flex items-center justify-center text-sm shadow-soft-sm">
              <ShieldCheck className="w-5 h-5 text-botanical-950" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-ivory-200/80 truncate">{user?.email || 'admin@wellness.com'}</p>
              <span className="inline-block mt-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                Medical Director / Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-ivory-300/60 mb-2">
            Operations & Control
          </p>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-botanical-500 text-white shadow-soft font-bold'
                    : 'text-ivory-200/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-peach-300'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-peach-400 text-botanical-950">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Sign Out */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-300 hover:bg-rose-500/20 border border-transparent hover:border-rose-400/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-rose-300" />
            <span>Sign Out of Admin</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300/60" />
        </button>
      </div>
    </aside>
  );
}
