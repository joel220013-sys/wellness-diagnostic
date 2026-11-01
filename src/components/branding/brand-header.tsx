'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './logo';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import CartDrawer from '@/components/cart/CartDrawer';
import AdminSidebar from '@/components/layout/admin-sidebar';
import { isSoundAlertsEnabled, setSoundAlertsEnabled, playOrderChime } from '@/lib/notificationService';
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
  ArrowLeftRight,
  Volume2,
  VolumeX
} from 'lucide-react';

interface BrandHeaderProps {
  portalRole?: 'patient' | 'admin' | 'driver';
  title?: string;
  subtitle?: string;
}

export default function BrandHeader({ portalRole }: BrandHeaderProps) {
  const { user, logout } = useAuth();
  const { selectedTests, isCartOpen, setIsCartOpen } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const pathname = usePathname();

  React.useEffect(() => {
    setSoundEnabled(isSoundAlertsEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundAlertsEnabled(next);
    if (next) playOrderChime();
  };

  // Auto-close mobile drawer whenever route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Role-specific navigation links for the mobile drawer
  const getNavLinks = () => {
    if (portalRole === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Orders & Bookings', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Collection Map', href: '/admin/map', icon: MapPin },
        { name: 'Patients Records', href: '/admin/patients', icon: Users },
        { name: 'Diagnostic Tests', href: '/admin/tests', icon: FlaskConical },
        { name: 'Health Packages', href: '/admin/packages', icon: Boxes },
        { name: 'Phlebotomists / Drivers', href: '/admin/drivers', icon: Truck },
        { name: 'Job Assignments', href: '/admin/assignments', icon: CalendarCheck },
        { name: 'Lab Reports', href: '/admin/reports', icon: FileText },
        { name: 'Invoices & Revenue', href: '/admin/invoices', icon: Receipt },
        { name: 'Lab Settings', href: '/admin/settings', icon: Settings },
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
      { name: 'All Diagnostic Tests', href: '/patient/tests', icon: FlaskConical },
      { 
        name: selectedTests.length > 0 ? `Book Collection (${selectedTests.length})` : 'Book Home Collection', 
        href: selectedTests.length > 0 ? '/patient/book' : '/patient/tests', 
        icon: CalendarPlus, 
        highlight: true 
      },
      { name: 'My Bookings', href: '/patient/bookings', icon: CalendarCheck },
      { name: 'Laboratory Reports', href: '/patient/reports', icon: FileText },
      { name: 'Invoices & Billing', href: '/patient/invoices', icon: Receipt },
      { name: 'Saved Addresses', href: '/patient/addresses', icon: MapPin },
      { name: 'Patient Profile', href: '/patient/profile', icon: User },
      { name: 'Settings & Security', href: '/patient/settings', icon: Settings },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ivory-300 w-full shadow-soft-sm">
      <div className="w-full h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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
          {portalRole === 'patient' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-soft-sm ${
                selectedTests.length > 0
                  ? 'text-botanical-950 bg-peach-300 hover:bg-peach-400 border border-peach-400'
                  : 'text-botanical-800 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300'
              }`}
              title="Open diagnostic cart view"
            >
              <ShoppingBag className="w-4 h-4 text-peach-700" />
              <span>Cart {selectedTests.length > 0 ? `(${selectedTests.length})` : ''}</span>
            </button>
          )}

          {(portalRole === 'admin' || portalRole === 'driver') && (
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-ivory-100 text-botanical-600 border-ivory-300 hover:bg-ivory-200'
              }`}
              title={soundEnabled ? 'Order sound alert is ON (click to mute)' : 'Order sound alert is OFF (click to unmute)'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="hidden xl:inline text-[11px]">Chime ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-botanical-500" />
                  <span className="hidden xl:inline text-[11px]">Muted</span>
                </>
              )}
            </button>
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
            <button
              onClick={() => setIsCartOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-soft transition-all active:scale-95 ${
                selectedTests.length > 0
                  ? 'bg-peach-400 text-botanical-950 border border-peach-300'
                  : 'bg-botanical-500 text-white hover:bg-botanical-600'
              }`}
              aria-label="Open cart view"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart {selectedTests.length > 0 ? `(${selectedTests.length})` : ''}</span>
            </button>
          )}
          {(portalRole === 'admin' || portalRole === 'driver') && (
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-ivory-100 text-botanical-600 border-ivory-300'
              }`}
              title={soundEnabled ? 'Order sound alert is ON' : 'Order sound alert is Muted'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-botanical-500" />
              )}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-soft-sm active:scale-95 ${
              portalRole === 'admin'
                ? 'bg-[#18352E] text-white border-botanical-700/50 hover:bg-botanical-800'
                : 'bg-ivory-100 text-botanical-900 hover:bg-ivory-200 border-ivory-300'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer for Admin (Exact Dark-Green Menu from Desktop Sidebar) */}
      {mobileMenuOpen && portalRole === 'admin' && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
          />
          {/* Slide-over panel */}
          <div className="relative w-72 max-w-[85vw] bg-[#18352E] shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-left duration-200">
            <AdminSidebar 
              isMobileDrawer={true} 
              onClose={() => setMobileMenuOpen(false)} 
              onItemClick={() => setMobileMenuOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation for Non-Admin Portals (Patient / Driver) */}
      {mobileMenuOpen && portalRole !== 'admin' && (
        <div className="lg:hidden border-t border-ivory-300 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-soft-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
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
          {/* Diagnostic Cart trigger on Mobile Menu */}
          {portalRole === 'patient' && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-peach-100 hover:bg-peach-200 text-botanical-950 border border-peach-200 transition-colors shadow-soft-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-peach-400 text-botanical-950">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <span className="font-extrabold text-xs">Diagnostic Cart</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-botanical-950 border border-peach-200">
                {selectedTests.length} {selectedTests.length === 1 ? 'Test' : 'Tests'}
              </span>
            </button>
          )}

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

      {/* Cart Drawer View */}
      {portalRole === 'patient' && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </header>
  );
}
