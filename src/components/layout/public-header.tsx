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
  ChevronRight, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { selectedTests } = useData();

  const NAV_LINKS = [
    { name: 'Home', href: '/home' },
    { name: 'Blood Tests', href: '/tests' },
    { name: 'Health Packages', href: '/packages' },
    { name: 'Home Collection', href: '/home-collection' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ivory-300">
      {/* Top Notification Bar */}
      <div className="bg-[#18352E] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-ivory-200">
              NABL Certified Diagnostic Care • 100% Sterile Home Blood Collection
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <a href="tel:18004199355" className="hover:text-peach-300 flex items-center gap-1">
              <Phone className="w-3 h-3 text-peach-400" />
              <span>1800-419-WELL (Toll Free)</span>
            </a>
            <Link href="/" className="hover:text-peach-300 text-[11px] underline">
              Choose Access Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <BrandLogo size="md" showTagline={true} />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors ${
                    isActive 
                      ? 'text-botanical-600 font-bold border-b-2 border-botanical-600 pb-1' 
                      : 'text-botanical-900/80 hover:text-botanical-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-botanical-800 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-botanical-600" />
              <span>Portals</span>
            </Link>

            <Link
              href="/patient/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-botanical-500 hover:bg-botanical-600 shadow-soft transition-all duration-200 hover:-translate-y-0.5"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Collection</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/patient/book"
              className="p-2 rounded-xl bg-botanical-500 text-white text-xs font-bold"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-ivory-100 text-botanical-900 hover:bg-ivory-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-ivory-300 bg-white px-4 pt-3 pb-6 space-y-3 shadow-soft-lg">
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-botanical-950 hover:bg-botanical-50"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-ivory-200 flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-botanical-800 bg-ivory-100 border border-ivory-300"
            >
              Choose Access Portal
            </Link>
            <Link
              href="/patient/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-botanical-500 shadow-soft"
            >
              Book Home Collection
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
