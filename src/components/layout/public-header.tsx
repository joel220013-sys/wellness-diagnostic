'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/common/BrandLogo';
import { 
  Menu, 
  X, 
  Phone, 
  CalendarPlus, 
  UserCheck, 
  Home,
  FlaskConical,
  Boxes,
  Truck,
  Info,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { selectedTests } = useData();

  const NAV_LINKS = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Blood Tests', href: '/tests', icon: FlaskConical },
    { name: 'Health Packages', href: '/packages', icon: Boxes },
    { name: 'Home Collection', href: '/home-collection', icon: Truck },
    { name: 'About Us', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ivory-300 w-full shadow-soft-sm">
      {/* Top Notification Bar */}
      <div className="bg-[#18352E] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-ivory-200 text-[11px] sm:text-xs">
              NABL Certified Diagnostic Care • Davangere (577005)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="tel:18004199355" className="hover:text-peach-300 flex items-center gap-1 text-[11px] sm:text-xs">
              <Phone className="w-3 h-3 text-peach-400" />
              <span className="hidden sm:inline">1800-419-WELL (Toll Free)</span>
              <span className="sm:hidden">1800-419-WELL</span>
            </a>
            <Link href="/" className="hover:text-peach-300 text-[11px] underline hidden sm:inline">
              Choose Access Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <BrandLogo size="md" showTagline={true} />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors py-1 ${
                    isActive 
                      ? 'text-botanical-600 font-bold border-b-2 border-botanical-600' 
                      : 'text-botanical-900/80 hover:text-botanical-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {selectedTests.length > 0 && (
              <Link
                href="/patient/book"
                className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-botanical-800 bg-peach-100 hover:bg-peach-200/80 border border-peach-200 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-peach-600" />
                <span>Cart ({selectedTests.length})</span>
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-botanical-800 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-botanical-600" />
              <span>Portals</span>
            </Link>

            <Link
              href="/patient/book"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-botanical-500 hover:bg-botanical-600 shadow-soft transition-all duration-200 hover:-translate-y-0.5"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Collection</span>
            </Link>
          </div>

          {/* Mobile & Tablet Action Buttons + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {selectedTests.length > 0 && (
              <Link
                href="/patient/book"
                className="relative p-2 rounded-xl bg-peach-100 text-peach-800 border border-peach-200"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-4 h-4 text-peach-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-botanical-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {selectedTests.length}
                </span>
              </Link>
            )}

            <Link
              href="/patient/book"
              className="px-3.5 py-1.5 rounded-full bg-botanical-500 hover:bg-botanical-600 text-white text-xs font-bold shadow-soft"
            >
              Book Test
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-ivory-100 text-botanical-900 hover:bg-ivory-200 active:scale-95 transition-all border border-ivory-300"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-botanical-900" /> : <Menu className="w-5 h-5 text-botanical-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Visible on all screens < 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-ivory-300 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 shadow-soft-xl max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
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
                      : 'text-botanical-900 hover:bg-ivory-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-botanical-600'}`} />
                  <span className="flex-1">{link.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-ivory-200 flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-botanical-800 bg-ivory-100 border border-ivory-300 hover:bg-ivory-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-botanical-600" />
              <span>Choose Access Portal (Patient / Staff)</span>
            </Link>

            <Link
              href="/patient/book"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-botanical-500 shadow-soft hover:bg-botanical-600 transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book Home Blood Collection</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
