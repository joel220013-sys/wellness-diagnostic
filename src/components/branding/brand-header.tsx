'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './logo';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  CalendarPlus, 
  CalendarCheck, 
  FileText, 
  Receipt, 
  MapPin, 
  User, 
  Map, 
  ShoppingBag, 
  Users, 
  Settings, 
  FlaskConical, 
  Boxes, 
  Truck,
  ArrowLeftRight
} from 'lucide-react';

interface BrandHeaderProps {
  portalRole?: 'patient' | 'admin' | 'driver';
  title?: string;
  subtitle?: string;
}

export default function BrandHeader({ portalRole }: BrandHeaderProps) {
  const { user, logout } = useAuth();
  const { selectedTests } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Role-specific navigation links for the mobile drawer
  const getNavLinks = () => {
    if (portalRole === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Live Dispatch Map', href: '/admin/map', icon: Map },
        { name: 'Diagnostic Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Phlebotomists / Staff', href: '/admin/drivers', icon: Truck },
        { name: 'Patient Directory', href: '/admin/patients', icon: Users },
        { name: 'Test Catalog', href: '/admin/tests', icon: FlaskConical },
        { name: 'Health Packages', href: '/admin/packages', icon: Boxes },
        { name: 'Invoices & Revenue', href: '/admin/invoices', icon: Receipt },
        { name: 'System Settings', href: '/admin/settings', icon: Settings },
      ];
    }
    if (portalRole === 'driver') {
      return [
        { name: 'Today Pickups', href: '/driver/dashboard', icon: LayoutDashboard },
        { name: 'My Assignments', href: '/driver/assignments', icon: CalendarCheck },
        { name: 'Collection History', href: '/driver/history', icon: FileText },
        { name: 'Phlebotomist Profile', href: '/driver/profile', icon: User },
      ];
    }
    // Default: patient
    return [
      { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
      { name: 'Book Home Collection', href: '/patient/book', icon: CalendarPlus, highlight: true },
      { name: 'My Bookings', href: '/patient/bookings', icon: CalendarCheck },
      { name: 'Laboratory Reports', href: '/patient/reports', icon: FileText },
      { name: 'Invoices & Billing', href: '/patient/invoices', icon: Receipt },
      { name: 'Saved Addresses', href: '/patient/addresses', icon: MapPin },
      { name: 'Patient Profile', href: '/patient/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="h-16 bg-white border-b border-ivory-300 sticky top-0 z-50 shadow-soft-sm w-full flex items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo + Portal Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="hover:opacity-95 transition-opacity" title="Back to Home">
            <BrandLogo size="sm" showTagline={false} />
          </Link>
          {portalRole && (
            <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-ivory-300">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold capitalize tracking-wide ${
                portalRole === 'admin' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                  : portalRole === 'driver'
                  ? 'bg-sky-100 text-sky-900 border border-sky-200'
                  : 'bg-botanical-100 text-botanical-900 border border-botanical-200'
              }`}>
                {portalRole === 'driver' ? 'Phlebotomist' : portalRole}
              </span>
            </div>
          )}
        </div>

        {/* Right Desktop: User info + Sign Out */}
        <div className="hidden lg:flex items-center gap-3">
          {portalRole === 'patient' && selectedTests.length > 0 && (
            <Link
              href="/patient/book"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-botanical-900 bg-peach-100 hover:bg-peach-200 border border-peach-200 shadow-soft-sm transition-all"
              title="View selected tests in cart"
            >
              <ShoppingBag className="w-4 h-4 text-peach-600" />
              <span>Cart ({selectedTests.length})</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-botanical-950">{user.name}</p>
                <p className="text-[11px] text-botanical-700/70">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out of portal"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/portal"
              className="text-xs font-semibold text-botanical-800 hover:text-botanical-600 transition-colors"
            >
              Change Portal
            </Link>
          )}
        </div>

        {/* Right Mobile: Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {portalRole === 'patient' && (
            <Link
              href="/patient/book"
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs shadow-soft transition-all ${
                selectedTests.length > 0
                  ? 'bg-peach-100 text-botanical-950 border border-peach-200'
                  : 'bg-botanical-500 text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-peach-600" />
              {selectedTests.length > 0 ? (
                <span>Cart ({selectedTests.length})</span>
              ) : (
                <span>Book</span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-ivory-100 text-botanical-900 hover:bg-ivory-200 active:scale-95 transition-all border border-ivory-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-botanical-900" /> : <Menu className="w-5 h-5 text-botanical-900" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-ivory-300 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-soft-xl max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User profile info bar on mobile */}
          {user && (
            <div className="p-3 bg-botanical-50/70 rounded-2xl border border-botanical-100 flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-botanical-950">{user.name}</p>
                <p className="text-[11px] text-botanical-700/80">{user.email}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-botanical-800 border border-botanical-200 capitalize">
                {user.role}
              </span>
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-botanical-500 text-white font-bold shadow-soft'
                      : link.highlight
                      ? 'bg-peach-100 text-peach-900 font-bold border border-peach-200'
                      : 'text-botanical-900 hover:bg-ivory-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-botanical-600'}`} />
                  <span className="flex-1">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions: Switch Portal & Logout */}
          <div className="pt-3 border-t border-ivory-200 flex flex-col gap-2">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-botanical-800 bg-ivory-100 border border-ivory-300 hover:bg-ivory-200 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Switch Portal</span>
            </Link>

            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
