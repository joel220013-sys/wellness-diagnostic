'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  Check, 
  ShoppingBag, 
  CalendarPlus, 
  Filter, 
  Clock, 
  Droplet, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Info,
  CheckCircle2,
  ChevronRight,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { DiagnosticTest } from '@/types';
import PackageOverviewDrawer from '@/components/packages/PackageOverviewDrawer';
import { getPackageDetails } from '@/data/package-details';

export default function PatientTestsPage() {
  const router = useRouter();
  const { tests, selectedTests, toggleSelectTest, addSelectedTest, isTestSelected, clearSelectedTests } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'parameters'>('featured');
  const [overviewTest, setOverviewTest] = useState<DiagnosticTest | null>(null);
  const [showEmptyCartPrompt, setShowEmptyCartPrompt] = useState(false);

  const handleScrollToCatalog = () => {
    setShowEmptyCartPrompt(true);
    const el = document.getElementById('tests-catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = el.querySelector('input');
      if (input) input.focus();
    }
    setTimeout(() => setShowEmptyCartPrompt(false), 6000);
  };

  // Categories list
  const categories = [
    'All',
    'Popular',
    'Health Packages',
    'Full Body Checkups',
    'Blood Test',
    'Jaanch Packages',
    'Diabetes',
    'Thyroid',
    'Lipid',
    'Liver',
    'Kidney',
    'Vitamins',
    'Hematology',
  ];

  // Unique deduplicated tests filtered & sorted
  const displayedTests = useMemo(() => {
    // 1. Ensure absolute uniqueness by normalized name
    const uniqueMap = new Map<string, DiagnosticTest>();
    for (const t of tests) {
      const key = (t.name || '').toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, t);
      }
    }
    const list = Array.from(uniqueMap.values());

    // 2. Filter by search & category
    const q = searchQuery.toLowerCase().trim();
    const filtered = list.filter((t) => {
      const cat = (t.category || '').toLowerCase();
      const selCat = selectedCategory.toLowerCase();

      let matchesCat = selectedCategory === 'All';
      if (!matchesCat) {
        const nameLower = (t.name || '').toLowerCase();
        if (selectedCategory === 'Popular') {
          matchesCat = !!t.popular;
        } else if (selectedCategory === 'Thyroid') {
          matchesCat =
            cat.includes('thyroid') ||
            cat.includes('endocrin') ||
            nameLower.includes('thyroid') ||
            nameLower.includes('tsh') ||
            nameLower.includes('t3') ||
            nameLower.includes('t4') ||
            nameLower.includes('anti-tpo') ||
            nameLower.includes('anti-tg') ||
            nameLower.includes('thyroglobulin');
        } else if (selectedCategory === 'Kidney') {
          matchesCat =
            cat.includes('kidney') ||
            cat.includes('renal') ||
            nameLower.includes('kidney') ||
            nameLower.includes('renal') ||
            nameLower.includes('kft') ||
            nameLower.includes('kidpro') ||
            nameLower.includes('creatinine') ||
            nameLower.includes('microalbumin') ||
            nameLower.includes('uric acid') ||
            nameLower.includes('urea');
        } else if (selectedCategory === 'Lipid') {
          matchesCat =
            cat.includes('lipid') ||
            cat.includes('cardiac') ||
            nameLower.includes('lipid') ||
            nameLower.includes('cholesterol') ||
            nameLower.includes('triglyceride') ||
            nameLower.includes('hdl') ||
            nameLower.includes('ldl') ||
            nameLower.includes('vldl') ||
            nameLower.includes('cardiac') ||
            nameLower.includes('apolipoprotein');
        } else if (selectedCategory === 'Liver') {
          matchesCat =
            cat.includes('liver') ||
            cat.includes('hepatic') ||
            nameLower.includes('liver') ||
            nameLower.includes('lft') ||
            nameLower.includes('hepatic') ||
            nameLower.includes('bilirubin') ||
            nameLower.includes('sgot') ||
            nameLower.includes('sgpt') ||
            nameLower.includes('alkaline phosphatase') ||
            nameLower.includes('ggt');
        } else if (selectedCategory === 'Diabetes') {
          matchesCat =
            cat.includes('diabet') ||
            nameLower.includes('diabet') ||
            nameLower.includes('glucose') ||
            nameLower.includes('sugar') ||
            nameLower.includes('hba1c') ||
            nameLower.includes('insulin');
        } else if (selectedCategory === 'Vitamins') {
          matchesCat =
            cat.includes('vitamin') ||
            nameLower.includes('vitamin') ||
            nameLower.includes('vit ') ||
            nameLower.includes('vit-') ||
            nameLower.includes('vitd') ||
            nameLower.includes('vitb') ||
            nameLower.includes('folate') ||
            nameLower.includes('folic acid') ||
            nameLower.includes('biotin') ||
            nameLower.includes('cobalamin');
        } else if (selectedCategory === 'Hematology') {
          matchesCat =
            cat.includes('hematolog') ||
            cat.includes('haematolog') ||
            nameLower.includes('cbc') ||
            nameLower.includes('hemogram') ||
            nameLower.includes('hemoglobin') ||
            nameLower.includes('esr') ||
            nameLower.includes('platelet');
        } else if (selectedCategory === 'Jaanch Packages') {
          matchesCat =
            cat.includes('jaanch') ||
            nameLower.includes('jaanch');
        } else if (selectedCategory === 'Blood Test') {
          matchesCat =
            cat.includes('blood') ||
            (t.sample_type || '').toLowerCase().includes('blood');
        } else if (selectedCategory === 'Health Packages' || selectedCategory === 'Full Body Checkups') {
          matchesCat =
            cat.includes('package') ||
            cat.includes('checkup') ||
            cat.includes('full body') ||
            cat.includes('health package') ||
            (t.id && t.id.startsWith('pkg_')) ||
            nameLower.includes('aarogyam') ||
            nameLower.includes('package') ||
            nameLower.includes('profile') ||
            nameLower.includes('checkup');
        } else {
          matchesCat = cat.includes(selCat);
        }
      }

      const matchesSearch =
        !q ||
        (t.name || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });

    // 3. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'parameters') return (b.parameters_count || 1) - (a.parameters_count || 1);
      // default: popular first, then by name
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [tests, searchQuery, selectedCategory, sortBy]);

  const totalCartAmount = selectedTests.reduce((sum, t) => sum + Number(t.price || 0), 0);

  const handleBookNow = (test: DiagnosticTest) => {
    addSelectedTest(test);
    router.push('/patient/book');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botanical-50 border border-botanical-100 text-botanical-800 text-xs font-bold">
            <FlaskConical className="w-3.5 h-3.5 text-botanical-600" />
            <span>NABL Certified Diagnostic Menu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950 tracking-tight">
            All Diagnostic Tests & Health Packages
          </h1>
          <p className="text-xs sm:text-sm text-botanical-800/80 max-w-2xl leading-relaxed">
            Choose from verified individual pathology tests and preventive health packages. Book online and our certified phlebotomist collects your sample at home.
          </p>
        </div>

        {/* Action Link */}
        <div className="flex items-center gap-3">
          {selectedTests.length > 0 ? (
            <button
              onClick={() => router.push('/patient/book')}
              className="px-5 py-2.5 rounded-full bg-peach-400 hover:bg-peach-300 text-botanical-950 font-extrabold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2 hover:-translate-y-0.5 animate-pulse"
            >
              <CalendarCheck className="w-4 h-4 text-botanical-950" />
              <span>Proceed to Book ({selectedTests.length} {selectedTests.length === 1 ? 'Test' : 'Tests'} • ₹{totalCartAmount.toLocaleString('en-IN')})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleScrollToCatalog}
              className="px-5 py-2.5 rounded-full bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
              title="Select tests below to schedule home collection"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Home Collection ↓</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty cart warning prompt when user clicks Book Home Collection before selecting tests */}
      {showEmptyCartPrompt && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-soft animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Please select at least 1 diagnostic test or health package below by clicking <strong>&quot;+ Add&quot;</strong> or <strong>&quot;Book&quot;</strong> before scheduling home collection.</span>
          </div>
          <button 
            onClick={() => setShowEmptyCartPrompt(false)} 
            className="text-amber-800 hover:text-amber-950 text-xs underline font-bold flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Floating Cart Indicator (if tests selected) */}
      {selectedTests.length > 0 && (
        <div className="sticky top-20 z-20 bg-gradient-to-r from-botanical-900 to-botanical-950 text-white p-4 rounded-2xl shadow-soft-lg border border-botanical-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-peach-400 text-botanical-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {selectedTests.length} {selectedTests.length === 1 ? 'Test' : 'Tests'} Selected in Cart
              </p>
              <p className="text-xs text-ivory-200/80">
                Total Collection Estimate: <span className="font-extrabold text-peach-300">₹{totalCartAmount.toLocaleString('en-IN')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={clearSelectedTests}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-ivory-200 transition-colors"
            >
              Clear Cart
            </button>
            <Link
              href="/patient/book"
              className="px-5 py-2 rounded-xl bg-peach-400 hover:bg-peach-500 text-botanical-950 font-bold text-xs shadow-soft transition-all flex items-center gap-2"
            >
              <span>Schedule Phlebotomist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div id="tests-catalog-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-ivory-300 shadow-soft-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-botanical-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by name, biomarker, or organ..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-ivory-300 bg-ivory-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-botanical-500 text-botanical-950"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-botanical-700/80 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-ivory-300 bg-white text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
            >
              <option value="featured">Featured & Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="parameters">Most Parameters</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-botanical-500 text-white shadow-soft-sm'
                  : 'bg-ivory-100 text-botanical-800 hover:bg-ivory-200 border border-ivory-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Test Count Feedback */}
      <div className="flex items-center justify-between text-xs text-botanical-700/80 px-1">
        <span>Showing <strong className="text-botanical-950">{displayedTests.length}</strong> unique diagnostic tests & health profiles</span>
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="underline hover:text-botanical-950">
            Clear search filter
          </button>
        )}
      </div>

      {/* Tests Catalog Grid */}
      {displayedTests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 shadow-soft-sm space-y-3">
          <FlaskConical className="w-12 h-12 text-botanical-400 mx-auto" />
          <h3 className="text-base font-bold text-botanical-950">No diagnostic tests found</h3>
          <p className="text-xs text-botanical-700/80 max-w-sm mx-auto">
            We couldn't find any tests matching "{searchQuery}". Try searching for another parameter like "Lipid", "Thyroid", or "CBC".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-2 px-4 py-2 rounded-xl bg-botanical-500 text-white font-bold text-xs shadow-soft"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedTests.map((test) => {
            const isSelected = isTestSelected(test.id);
            const originalPrice = test.original_price || (test.price * 1.3);
            const discountPct = originalPrice > test.price 
              ? Math.round(((originalPrice - test.price) / originalPrice) * 100) 
              : 0;
            const isPackage = 
              test.category === 'Health Packages' || 
              (test.parameters_count || 1) >= 2 || 
              test.id.startsWith('pkg_');
            const pkgInfo = isPackage ? getPackageDetails(test.name, test.parameters_count, test.description) : null;
            const isFasting = Boolean(
              test.fasting_required || 
              test.preparation_instructions?.toLowerCase().includes('fasting')
            );
            const fastingText = isFasting 
              ? `${test.fasting_hours || 10}-12 Hrs Fasting` 
              : 'Non-Fasting';

            return (
              <div
                key={test.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between hover:shadow-soft ${
                  isSelected 
                    ? 'border-botanical-500 ring-2 ring-botanical-500/20 shadow-soft-sm' 
                    : 'border-ivory-300 hover:border-botanical-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Badge Row */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-botanical-50 text-botanical-700 border border-botanical-100">
                      {test.category || 'Clinical Pathology'}
                    </span>
                    {discountPct > 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-peach-100 text-peach-700 border border-peach-200">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 
                      onClick={() => setOverviewTest(test)}
                      className="text-base font-bold text-botanical-950 tracking-tight leading-snug cursor-pointer hover:text-botanical-700 transition-colors"
                    >
                      {test.name}
                    </h3>
                    <p className="text-xs text-botanical-800/75 mt-1 line-clamp-2 leading-relaxed">
                      {test.description || 'Comprehensive laboratory diagnostic analysis across verified clinical vitals.'}
                    </p>
                  </div>

                  {/* Includes Section with Show All Tests Link (Like Pic 1 & Pic 3) */}
                  <div className="pt-2 border-t border-ivory-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-botanical-950">
                        Includes {test.parameters_count || 1} Tests
                      </span>
                      <button
                        type="button"
                        onClick={() => setOverviewTest(test)}
                        className="text-xs font-bold text-botanical-600 hover:text-botanical-800 inline-flex items-center gap-0.5 hover:underline"
                      >
                        <span>Show All Tests</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Preview bullets like Pic 1 */}
                    {pkgInfo && pkgInfo.previewBullets && (
                      <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-botanical-700/80">
                        {pkgInfo.previewBullets.slice(0, 4).map((bullet, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-2 py-0.5 rounded-md bg-ivory-50 border border-ivory-200 text-[10px] font-medium text-botanical-800"
                          >
                            • {bullet}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Parameters & Turnaround Details */}
                  <div className="pt-2 border-t border-ivory-200 grid grid-cols-2 gap-2 text-[11px] text-botanical-800/80">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-botanical-600 flex-shrink-0" />
                      <span className="truncate">{test.parameters_count || 1} Parameters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-peach-600 flex-shrink-0" />
                      <span className="truncate">{test.turnaround_description || '8-12 Hours'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{test.sample_type || 'Blood Sample'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="truncate font-semibold text-botanical-900">{fastingText}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Add/Book Buttons */}
                <div className="mt-5 pt-4 border-t border-ivory-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-botanical-950">
                        ₹{Number(test.price).toLocaleString('en-IN')}
                      </span>
                      {originalPrice > test.price && (
                        <span className="text-xs text-botanical-700/50 line-through">
                          ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-emerald-700 font-semibold">
                      Free Doorstep Pickup
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSelectTest(test)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-soft-sm'
                          : 'bg-ivory-100 hover:bg-botanical-50 text-botanical-900 border border-ivory-300'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-botanical-600" />
                          <span>Add</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleBookNow(test)}
                      className="px-3.5 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white text-xs font-bold shadow-soft transition-all"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Overview Slide-over Drawer (Matching Pic 4 & Pic 5) */}
      <PackageOverviewDrawer
        test={overviewTest}
        isOpen={!!overviewTest}
        onClose={() => setOverviewTest(null)}
        onBookNow={handleBookNow}
      />
    </div>
  );
}

