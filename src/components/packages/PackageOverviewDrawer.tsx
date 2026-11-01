'use client';

import React, { useState, useMemo } from 'react';
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
  Plus,
  Layers,
  ListFilter
} from 'lucide-react';
import { DiagnosticTest, TestParameterItem } from '@/types';
import { getPackageDetails, DetailedPackageData } from '@/data/package-details';
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
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('flat');
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number | null>(0);

  // Normalize parameters from test.parameters_list
  const parsedParameters: TestParameterItem[] = useMemo(() => {
    if (!test?.parameters_list) return [];
    let list: any = test.parameters_list;
    if (typeof list === 'string') {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    if (Array.isArray(list)) {
      return list.map((item: any) => {
        if (typeof item === 'string') {
          return { name: item, groupName: 'General' };
        }
        return {
          code: item.code || '',
          name: item.name || '',
          type: item.type || 'TEST',
          groupName: item.groupName || 'General',
        };
      });
    }
    return [];
  }, [test]);

  // Group parameters by organ/profile category if available
  const groupedProfiles = useMemo(() => {
    if (parsedParameters.length === 0) return [];
    const map = new Map<string, string[]>();
    for (const item of parsedParameters) {
      const grp = item.groupName || 'Clinical Marker';
      if (!map.has(grp)) map.set(grp, []);
      map.get(grp)!.push(item.name);
    }
    return Array.from(map.entries()).map(([name, tests]) => ({
      name,
      count: tests.length,
      tests,
    }));
  }, [parsedParameters]);

  if (!isOpen || !test) return null;

  const fallbackDetails: DetailedPackageData = getPackageDetails(
    test.name, 
    test.parameters_count || 72, 
    test.description
  );

  const selected = isTestSelected(test.id);
  const totalCount = parsedParameters.length > 0 
    ? parsedParameters.length 
    : (test.parameters_count || fallbackDetails.parametersCount || 1);

  const handleBook = () => {
    if (onBookNow) {
      onBookNow(test);
    } else {
      addSelectedTest(test);
      router.push('/patient/book');
    }
    onClose();
  };

  const isFasting = Boolean(
    test.fasting_required || 
    (test.preparation_instructions && test.preparation_instructions.toLowerCase().includes('fasting')) ||
    (test.description && test.description.toLowerCase().includes('fasting') && !test.description.toLowerCase().includes('non fasting'))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-botanical-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Sliding in from right) */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header - Verbatim 'Test/Package Details' from Thyrocare Pic 2 */}
        <div className="px-6 py-4 border-b border-ivory-200 flex items-center justify-between bg-white">
          <h2 className="text-base sm:text-lg font-bold text-botanical-950 tracking-tight">
            Test/Package Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-ivory-100 text-botanical-800 transition-colors"
            aria-label="Close Overview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Test / Package Title in Bold Caps */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-botanical-950 tracking-tight uppercase leading-snug">
              {test.name}
            </h1>

            {/* Fasting, Sample Type, Turnaround Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-botanical-100 text-botanical-900 font-bold">
                <Droplet className="w-3.5 h-3.5 text-botanical-600" />
                <span>{test.sample_type || 'Blood'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ivory-100 border border-ivory-300 text-botanical-800 font-semibold">
                <Clock className="w-3.5 h-3.5 text-botanical-500" />
                <span>{isFasting ? `${test.fasting_hours || 10}-12 Hrs Fasting` : 'Non-Fasting'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-peach-100 text-peach-900 font-semibold">
                <Clock className="w-3.5 h-3.5 text-peach-600" />
                <span>TAT: {test.turnaround_description || '24-38 Hrs'}</span>
              </span>
            </div>
          </div>

          {/* Description Section - Verbatim Pic 2 */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-extrabold text-botanical-950">
              Description
            </h3>
            <p className="text-xs sm:text-sm text-botanical-800/85 leading-relaxed">
              {test.description || fallbackDetails.description || 'Comprehensive clinical laboratory screening evaluating vital metabolic and organ parameters.'}
            </p>
          </div>

          {/* Tests included in this package Section - Verbatim Pic 2 & Pic 3 */}
          <div className="space-y-3 pt-2 border-t border-ivory-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-botanical-950">
                Tests included in this package <span className="text-botanical-600">{totalCount} Tests</span>
              </h3>
              
              {/* Optional Flat vs Grouped toggle */}
              {groupedProfiles.length > 1 && (
                <div className="inline-flex rounded-lg bg-ivory-100 p-0.5 border border-ivory-300 text-[10px] font-bold">
                  <button
                    onClick={() => setViewMode('flat')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      viewMode === 'flat' ? 'bg-white shadow-soft-xs text-botanical-950' : 'text-botanical-600'
                    }`}
                  >
                    All Tests
                  </button>
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      viewMode === 'grouped' ? 'bg-white shadow-soft-xs text-botanical-950' : 'text-botanical-600'
                    }`}
                  >
                    By Organ ({groupedProfiles.length})
                  </button>
                </div>
              )}
            </div>

            {/* Accordion Dropdown Button (Includes X Tests) - Verbatim Pic 2 & Pic 3 */}
            <div className="border border-ivory-300 rounded-2xl overflow-hidden bg-white shadow-soft-xs">
              <button
                type="button"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-ivory-50/60 hover:bg-ivory-100/70 transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-botanical-900">
                  (Includes {totalCount} {totalCount === 1 ? 'test' : 'tests'})
                </span>
                <span className="text-botanical-600 p-1">
                  {isAccordionOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              {/* Accordion Content when open */}
              {isAccordionOpen && (
                <div className="p-4 border-t border-ivory-200 bg-white">
                  {viewMode === 'flat' ? (
                    /* Flat list with bullets matching Pic 3 */
                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 divide-y divide-ivory-100">
                      {parsedParameters.length > 0 ? (
                        parsedParameters.map((param, pIdx) => (
                          <li key={pIdx} className="pt-2 first:pt-0 flex items-start gap-2.5 text-xs font-semibold text-botanical-950">
                            <span className="text-botanical-500 font-extrabold mt-0.5 leading-none">•</span>
                            <div className="flex-1">
                              <span className="tracking-tight uppercase">{param.name}</span>
                              {param.groupName && param.groupName !== 'General' && (
                                <span className="ml-2 text-[10px] font-normal text-botanical-600/75">
                                  ({param.groupName})
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                      ) : (
                        /* Fallback flat list from profiles if parsedParameters is empty */
                        fallbackDetails.profiles.flatMap((prof) => prof.tests).map((tName, tIdx) => (
                          <li key={tIdx} className="pt-2 first:pt-0 flex items-start gap-2.5 text-xs font-semibold text-botanical-950">
                            <span className="text-botanical-500 font-extrabold mt-0.5 leading-none">•</span>
                            <span className="tracking-tight uppercase">{tName}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  ) : (
                    /* Grouped by organ/category view */
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {groupedProfiles.map((grp, gIdx) => {
                        const isGrpExpanded = expandedGroupIndex === gIdx;
                        return (
                          <div key={gIdx} className="rounded-xl border border-ivory-200 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedGroupIndex(isGrpExpanded ? null : gIdx)}
                              className="w-full px-3 py-2 flex items-center justify-between text-left bg-ivory-50 text-xs font-bold text-botanical-900"
                            >
                              <span>{grp.name} ({grp.count})</span>
                              {isGrpExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            {isGrpExpanded && (
                              <div className="p-3 bg-white space-y-1.5 border-t border-ivory-200">
                                {grp.tests.map((tName, tIdx) => (
                                  <div key={tIdx} className="flex items-start gap-2 text-[11px] text-botanical-800">
                                    <span className="text-botanical-400">•</span>
                                    <span>{tName}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Booking Bar - Matching Pic 1/2 */}
        <div className="p-4 sm:p-5 border-t border-ivory-200 bg-white flex items-center justify-between gap-4 shadow-soft-lg">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-botanical-600 block">
              Package Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-botanical-950">
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
              className="px-6 py-2.5 rounded-xl bg-peach-500 hover:bg-peach-600 text-white font-extrabold text-xs shadow-soft transition-all flex items-center gap-1.5"
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
