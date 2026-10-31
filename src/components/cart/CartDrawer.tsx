'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Droplet, 
  BadgePercent,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { 
    selectedTests, 
    removeSelectedTest, 
    clearSelectedTests 
  } = useData();

  if (!isOpen) return null;

  const totalAmount = selectedTests.reduce((sum, t) => sum + Number(t.price || 0), 0);
  const totalOriginalAmount = selectedTests.reduce((sum, t) => {
    const orig = (t as any).original_price || (t.price ? Math.round(Number(t.price) * 1.3) : 0);
    return sum + orig;
  }, 0);
  const totalSavings = totalOriginalAmount > totalAmount ? totalOriginalAmount - totalAmount : 0;

  const handleProceedToBooking = () => {
    onClose();
    router.push('/patient/book');
  };

  const handleBrowseTests = () => {
    onClose();
    router.push('/patient/tests');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-botanical-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (Sliding in from right, full height) */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-botanical-50/70">
          <div className="w-12 h-1.5 rounded-full bg-botanical-300/70" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-ivory-200 flex items-center justify-between bg-botanical-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-peach-400 text-botanical-950 flex items-center justify-center font-bold shadow-soft-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-botanical-950">Diagnostic Cart</h2>
              <p className="text-[11px] text-botanical-700/80">
                {selectedTests.length} {selectedTests.length === 1 ? 'test' : 'tests'} selected for home collection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-botanical-600 hover:text-botanical-950 hover:bg-white transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {selectedTests.length === 0 ? (
          // Empty State
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-ivory-100 text-botanical-400 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-botanical-950">Your Cart is Empty</h3>
              <p className="text-xs text-botanical-700/80 max-w-xs mx-auto">
                Explore our 228+ verified pathology tests and Aarogyam preventive health checkup packages.
              </p>
            </div>
            <button
              onClick={handleBrowseTests}
              className="px-5 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
            >
              Browse All Diagnostic Tests
            </button>
          </div>
        ) : (
          // Cart Items List + Summary
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Free Doorstep Banner */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Free doorstep phlebotomist collection included for all selected tests!</span>
            </div>

            {/* Test Items */}
            <div className="space-y-2.5">
              {selectedTests.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white border border-ivory-300 shadow-soft-xs flex flex-col justify-between gap-2.5 hover:border-botanical-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-ivory-100 text-botanical-700">
                        {t.category || 'Pathology Test'}
                      </span>
                      <h4 className="font-bold text-botanical-950 text-sm mt-1 leading-snug line-clamp-2">
                        {t.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-botanical-700/70 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Droplet className="w-3 h-3 text-rose-500" />
                          {t.sample_type || 'Blood Sample'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-botanical-500" />
                          {t.fasting_required ? 'Fasting Required' : 'Non-Fasting'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <p className="font-extrabold text-botanical-950 text-sm">
                        ₹{Number(t.price).toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => removeSelectedTest(t.id)}
                        className="mt-2 text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove test from cart"
                        aria-label={`Remove ${t.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 space-y-2 text-xs">
              <h5 className="font-bold text-botanical-950 uppercase tracking-wider text-[10px]">
                Order Bill Summary
              </h5>
              <div className="flex justify-between text-botanical-800">
                <span>Items Subtotal ({selectedTests.length})</span>
                <span className="font-semibold">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-botanical-800">
                <span>Doorstep Phlebotomist Visit</span>
                <span className="text-emerald-700 font-bold">
                  <span className="line-through text-botanical-400 font-normal mr-1">₹150</span>
                  FREE
                </span>
              </div>
              <div className="flex justify-between text-botanical-800">
                <span>Cold-Chain Sample Transport</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-botanical-800">
                <span>Digital Verified NABL Report</span>
                <span className="text-emerald-700 font-bold">Included</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-800 pt-1 border-t border-ivory-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
                    Total Savings
                  </span>
                  <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-ivory-300 font-extrabold text-sm text-botanical-950">
                <span>Estimated Total Payable</span>
                <span className="text-botanical-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-botanical-800/80">
              <div className="p-2.5 rounded-xl bg-white border border-ivory-200 flex items-center gap-1.5 shadow-soft-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>NABL Accredited Lab</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-ivory-200 flex items-center gap-1.5 shadow-soft-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Same-Day Reports</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {selectedTests.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-ivory-200 bg-white space-y-2.5 shadow-soft-lg">
            <div className="flex items-center justify-between pb-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-botanical-700 tracking-wider">Total Amount</p>
                <p className="text-lg font-extrabold text-botanical-950">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={clearSelectedTests}
                className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold"
              >
                Clear Cart
              </button>
            </div>

            <button
              onClick={handleProceedToBooking}
              className="w-full py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-extrabold text-sm shadow-soft transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Schedule Phlebotomist Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleBrowseTests}
              className="w-full py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-900 font-bold text-xs transition-colors"
            >
              + Add More Diagnostic Tests
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
