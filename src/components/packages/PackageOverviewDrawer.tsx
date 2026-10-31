'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Droplet, 
  FlaskConical, 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight,
  Check,
  Plus
} from 'lucide-react';
import { DiagnosticTest } from '@/types';
import { getPackageDetails, DetailedPackageData, SubProfileItem } from '@/data/package-details';
import { useData } from '@/context/DataContext';

interface PackageOverviewDrawerProps {
  test: DiagnosticTest | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow?: (test: DiagnosticTest) => void;
}

export default function PackageOverviewDrawer({
  test,
  isOpen,
  onClose,
  onBookNow
}: PackageOverviewDrawerProps) {
  const router = useRouter();
  const { toggleSelectTest, addSelectedTest, isTestSelected } = useData();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item expanded by default

  if (!isOpen || !test) return null;

  const details: DetailedPackageData = getPackageDetails(
    test.name, 
    test.parameters_count || 72, 
    test.description
  );

  const selected = isTestSelected(test.id);

  const handleToggleAccordion = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleBook = () => {
    if (onBookNow) {
      onBookNow(test);
    } else {
      addSelectedTest(test);
      router.push('/patient/book');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-botanical-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Sliding in from right) */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ivory-200 flex items-center justify-between bg-botanical-50/60">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-botanical-600" />
            <h2 className="text-base font-bold text-botanical-950">Package Overview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-ivory-200 text-botanical-800 transition-colors"
            aria-label="Close Overview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Turnaround Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-900 text-white text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-peach-300" />
            <span>{details.reportsIn || test.turnaround_description || 'Reports in 24-38 Hrs'}</span>
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-botanical-950 tracking-tight">
              {test.name}
            </h1>
            <p className="text-xs sm:text-sm text-botanical-800/80 leading-relaxed mt-2.5">
              {details.description || test.description}
            </p>
          </div>

          {/* Sample Type & Fasting Information Row */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200">
            <div>
              <span className="text-[11px] font-semibold text-botanical-700 block mb-1">Sample Type</span>
              <div className="flex flex-wrap gap-1.5">
                {(details.samples || ['Blood']).map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-ivory-300 text-xs font-bold text-botanical-900"
                  >
                    <Droplet className="w-3 h-3 text-peach-600" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-botanical-700 block mb-1">Fasting Required</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-ivory-300 text-xs font-bold text-botanical-900">
                <Clock className="w-3 h-3 text-botanical-600" />
                <span>{details.fasting || (test.fasting_required ? `${test.fasting_hours || 10}-12 Hrs` : 'Non-Fasting')}</span>
              </span>
            </div>
          </div>

          {/* Includes Section */}
          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-base font-extrabold text-botanical-950">
                Includes {details.parametersCount || test.parameters_count || 1} Tests
              </h3>
              <p className="text-xs text-botanical-700/80 mt-0.5">
                This Package Will Include The Following Tests
              </p>
            </div>

            {/* Accordion Profiles List */}
            <div className="space-y-2.5">
              {details.profiles.map((profile, idx) => {
                const isExpanded = expandedIndex === idx;

                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-ivory-300 bg-white shadow-soft-sm overflow-hidden transition-all"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => handleToggleAccordion(idx)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-ivory-50/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-botanical-950">
                            {profile.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-botanical-100 text-botanical-900">
                            {profile.count} Tests
                          </span>
                        </div>
                        <p className="text-[11px] text-botanical-700/80 line-clamp-1">
                          {profile.description}
                        </p>
                      </div>

                      <div className="p-1 rounded-full text-botanical-600 flex-shrink-0 mt-0.5">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Accordion Expanded Body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-ivory-100 bg-ivory-50/40 space-y-2 animate-in fade-in duration-200">
                        <p className="text-[11px] text-botanical-800 leading-relaxed">
                          {profile.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {profile.tests.map((testName, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2.5 py-1 rounded-lg bg-white border border-ivory-300 text-[11px] font-medium text-botanical-900 shadow-soft-xs"
                            >
                              • {testName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Booking Bar */}
        <div className="p-4 sm:p-5 border-t border-ivory-200 bg-white flex items-center justify-between gap-4 shadow-soft-lg">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-botanical-600 block">
              Package Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-botanical-950">
                ₹{Number(test.price).toLocaleString('en-IN')}
              </span>
              {Boolean(test.original_price && test.original_price > test.price) && (
                <span className="text-xs text-botanical-500 line-through">
                  ₹{Number(test.original_price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSelectTest(test)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                selected
                  ? 'bg-botanical-100 text-botanical-900 border-botanical-300'
                  : 'bg-ivory-100 text-botanical-900 border-ivory-300 hover:bg-ivory-200'
              }`}
            >
              {selected ? (
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-botanical-700" />
                  <span>Added</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-botanical-700" />
                  <span>Add to Cart</span>
                </span>
              )}
            </button>

            <button
              onClick={handleBook}
              className="px-5 py-2.5 rounded-xl bg-peach-500 hover:bg-peach-600 text-white font-extrabold text-xs shadow-soft transition-all flex items-center gap-1.5"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

