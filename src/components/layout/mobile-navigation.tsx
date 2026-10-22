'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FlaskConical, CalendarPlus, UserCheck, Phone } from 'lucide-react';

export default function MobileNavigation() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Tests', href: '/tests', icon: FlaskConical },
    { name: 'Book', href: '/patient/book', icon: CalendarPlus, highlight: true },
    { name: 'Portal', href: '/', icon: UserCheck },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-ivory-300 py-1.5 px-3 z-40 flex items-center justify-around shadow-soft-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 -mt-4"
            >
              <div className="w-12 h-12 rounded-full bg-botanical-500 text-white flex items-center justify-center shadow-soft-lg hover:bg-botanical-600 transition-transform active:scale-95">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-botanical-900 mt-0.5">{item.name}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
              isActive ? 'text-botanical-600 font-bold' : 'text-botanical-800/70'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
