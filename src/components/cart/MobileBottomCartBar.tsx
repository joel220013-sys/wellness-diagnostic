'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function MobileBottomCartBar() {
  const router = useRouter();
  const { selectedTests, setIsCartOpen } = useData();

  if (selectedTests.length === 0) return null;

  const totalAmount = selectedTests.reduce((sum, t) => sum + Number(t.price || 0), 0);

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-gradient-to-r from-botanical-900 to-botanical-950 text-white p-3 rounded-2xl shadow-soft-xl border border-botanical-800 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
      <div 
        onClick={() => setIsCartOpen(true)}
        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
        role="button"
        tabIndex={0}
        aria-label="Open Cart View"
      >
        <div className="w-9 h-9 rounded-xl bg-peach-400 text-botanical-950 flex items-center justify-center font-bold flex-shrink-0 shadow-soft-xs">
          <ShoppingBag className="w-4.5 h-4.5" />
        </div>
        <div className="truncate">
          <p className="text-xs font-bold leading-tight truncate">
            {selectedTests.length} {selectedTests.length === 1 ? 'Test' : 'Tests'} • ₹{totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-peach-300 font-semibold truncate">
            Tap to view cart details
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setIsCartOpen(true)}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-bold text-ivory-100 transition-colors"
        >
          Cart
        </button>
        <button
          onClick={() => router.push('/patient/book')}
          className="px-3.5 py-2 rounded-xl bg-peach-400 hover:bg-peach-300 active:bg-peach-500 text-botanical-950 text-xs font-extrabold shadow-soft flex items-center gap-1 transition-all"
        >
          <span>Book</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

