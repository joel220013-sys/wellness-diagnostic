'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Info,
  CalendarCheck,
  AlertCircle,
  Search,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { calculateOrderPricing } from '@/services/pricingService';
import AddressMapPickerWrapper from '@/components/map/AddressMapPickerWrapper';
import { AddressInput } from '@/lib/validations';
import { DiagnosticTest } from '@/types';

const BOOK_CATEGORIES = [
  'All',
  'Full Body Checkups',
  'Health Packages',
  'Aarogyam',
  'Blood Test',
  'Diabetes',
  'Thyroid',
  'Lipid',
  'Liver',
  'Kidney',
  'Jaanch Packages',
  'Vitamins',
  'Hematology',
];

const COLLECTION_SLOTS = [
  '06:00 AM – 07:30 AM (Early Fasting)',
  '07:30 AM – 09:00 AM (Recommended Fasting)',
  '09:00 AM – 10:30 AM (Standard Morning)',
  '10:30 AM – 12:00 PM (Late Morning)',
  '04:00 PM – 05:30 PM (Evening Collection)',
  '05:30 PM – 07:00 PM (Late Evening)'
];

export default function BookCollectionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    tests, 
    selectedTests, 
    toggleSelectTest, 
    removeSelectedTest, 
    clearSelectedTests, 
    createBooking 
  } = useData();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wellness_cart_tests_v5');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return 2;
        }
      } catch {}
    }
    return 1;
  });

  useEffect(() => {
    if (selectedTests.length > 0) {
      setCurrentStep(2);
    }
  }, [selectedTests.length]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>(COLLECTION_SLOTS[1]);
  const [testSearch, setTestSearch] = useState('');
  const [testCategory, setTestCategory] = useState('All');

  const filteredTests = tests.filter((t) => {
    const q = testSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));

    const catLower = (t.category || '').toLowerCase();
    const nameLower = (t.name || '').toLowerCase();

    let matchesCategory = testCategory === 'All';
    if (!matchesCategory) {
      if (testCategory === 'Thyroid') {
        matchesCategory =
          catLower.includes('thyroid') ||
          catLower.includes('endocrin') ||
          nameLower.includes('thyroid') ||
          nameLower.includes('tsh') ||
          nameLower.includes('t3') ||
          nameLower.includes('t4') ||
          nameLower.includes('anti-tpo') ||
          nameLower.includes('anti-tg') ||
          nameLower.includes('thyroglobulin');
      } else if (testCategory === 'Kidney') {
        matchesCategory =
          catLower.includes('kidney') ||
          catLower.includes('renal') ||
          nameLower.includes('kidney') ||
          nameLower.includes('renal') ||
          nameLower.includes('kft') ||
          nameLower.includes('kidpro') ||
          nameLower.includes('creatinine') ||
          nameLower.includes('microalbumin') ||
          nameLower.includes('uric acid') ||
          nameLower.includes('urea');
      } else if (testCategory === 'Lipid') {
        matchesCategory =
          catLower.includes('lipid') ||
          catLower.includes('cardiac') ||
          nameLower.includes('lipid') ||
          nameLower.includes('cholesterol') ||
          nameLower.includes('triglyceride') ||
          nameLower.includes('hdl') ||
          nameLower.includes('ldl') ||
          nameLower.includes('vldl') ||
          nameLower.includes('cardiac') ||
          nameLower.includes('apolipoprotein');
      } else if (testCategory === 'Liver') {
        matchesCategory =
          catLower.includes('liver') ||
          catLower.includes('hepatic') ||
          nameLower.includes('liver') ||
          nameLower.includes('lft') ||
          nameLower.includes('hepatic') ||
          nameLower.includes('bilirubin') ||
          nameLower.includes('sgot') ||
          nameLower.includes('sgpt') ||
          nameLower.includes('alkaline phosphatase') ||
          nameLower.includes('ggt');
      } else if (testCategory === 'Diabetes') {
        matchesCategory =
          catLower.includes('diabet') ||
          nameLower.includes('diabet') ||
          nameLower.includes('glucose') ||
          nameLower.includes('sugar') ||
          nameLower.includes('hba1c') ||
          nameLower.includes('insulin');
      } else if (testCategory === 'Vitamins') {
        matchesCategory =
          catLower.includes('vitamin') ||
          nameLower.includes('vitamin') ||
          nameLower.includes('vit ') ||
          nameLower.includes('vit-') ||
          nameLower.includes('vitd') ||
          nameLower.includes('vitb') ||
          nameLower.includes('folate') ||
          nameLower.includes('folic acid') ||
          nameLower.includes('biotin') ||
          nameLower.includes('cobalamin');
      } else if (testCategory === 'Hematology') {
        matchesCategory =
          catLower.includes('hematolog') ||
          catLower.includes('haematolog') ||
          nameLower.includes('cbc') ||
          nameLower.includes('hemogram') ||
          nameLower.includes('hemoglobin') ||
          nameLower.includes('esr') ||
          nameLower.includes('platelet');
      } else if (testCategory === 'Aarogyam') {
        matchesCategory =
          nameLower.includes('aarogyam') ||
          catLower.includes('aarogyam');
      } else if (testCategory === 'Full Body Checkups' || testCategory === 'Health Packages') {
        matchesCategory =
          catLower.includes('package') ||
          catLower.includes('checkup') ||
          catLower.includes('full body') ||
          catLower.includes('health package') ||
          (t.id && t.id.startsWith('pkg_')) ||
          nameLower.includes('aarogyam') ||
          nameLower.includes('package') ||
          nameLower.includes('profile') ||
          nameLower.includes('checkup');
      } else if (testCategory === 'Jaanch Packages') {
        matchesCategory =
          catLower.includes('jaanch') ||
          nameLower.includes('jaanch');
      } else if (testCategory === 'Blood Test') {
        matchesCategory =
          catLower.includes('blood') ||
          (t.sample_type || '').toLowerCase().includes('blood');
      } else {
        matchesCategory = catLower.includes(testCategory.toLowerCase());
      }
    }

    return matchesSearch && matchesCategory;
  });

  // Patient & Address state
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [confirmedAddress, setConfirmedAddress] = useState<AddressInput>({
    recipient_name: user?.name || '',
    recipient_phone: user?.phone || '',
    phone: user?.phone || '',
    address_line_1: '',
    address_line_2: '',
    locality: '',
    city: '',
    state: '',
    postal_code: '',
    latitude: 14.4644,
    longitude: 75.9218,
    landmark: '',
    access_instructions: '',
    label: 'Home',
    is_default: true,
  });

  const [patientNotes, setPatientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessRef, setBookingSuccessRef] = useState<string | null>(null);

  // Authoritative Pricing calculation
  const pricing = calculateOrderPricing(selectedTests.map((t) => t.id));

  // Step 1: Validations
  const canProceedStep1 = selectedTests.length > 0;
  // Step 2: Validations
  const canProceedStep2 = Boolean(selectedDate && selectedSlot);
  // Step 3: Validations
  const canProceedStep3 = Boolean(
    patientName.trim() && 
    patientPhone.trim() && 
    confirmedAddress.address_line_1 && 
    confirmedAddress.city
  );

  const handleConfirmAddressFromMap = (address: AddressInput) => {
    setConfirmedAddress(address);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const newBooking = createBooking({
        patient_id: user?.id || 'user_patient_1',
        patient_name: patientName,
        patient_phone: patientPhone,
        scheduled_date: selectedDate,
        scheduled_slot: selectedSlot,
        address_snapshot: confirmedAddress,
        items: pricing.items.map((it) => ({
          test_id: it.id,
          item_name: it.name,
          unit_price: it.price,
          quantity: 1,
          line_total: it.price
        })),
        subtotal: pricing.subtotal,
        collection_fee: pricing.collectionFee,
        discount: pricing.discount,
        tax_amount: pricing.tax,
        total_amount: pricing.total,
        payment_status: 'Unpaid',
        patient_notes: patientNotes
      });

      clearSelectedTests();
      setBookingSuccessRef(newBooking.booking_reference);
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccessRef) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-ivory-300 shadow-soft-lg space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-soft">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Booking Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950">
              Home Sample Collection Scheduled!
            </h1>
            <p className="text-sm text-botanical-700/80 max-w-md mx-auto">
              Your appointment has been registered with reference{' '}
              <strong className="text-botanical-950 font-bold">#{bookingSuccessRef}</strong>. A certified phlebotomist will arrive with a sterile cold-chain collection kit.
            </p>
          </div>

          <div className="p-4 bg-ivory-100 rounded-2xl border border-ivory-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-botanical-700">Scheduled Date:</span>
              <strong className="text-botanical-950">{selectedDate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-botanical-700">Time Slot:</span>
              <strong className="text-botanical-950">{selectedSlot}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-botanical-700">Collection Location:</span>
              <strong className="text-botanical-950 truncate max-w-[200px]">
                {confirmedAddress.locality}, {confirmedAddress.city}
              </strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-ivory-300 font-bold text-sm">
              <span className="text-botanical-950">Total Payable at Collection:</span>
              <span className="text-botanical-600">₹{pricing.total}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => router.push('/patient/bookings')}
              className="px-6 py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-sm shadow-soft transition-all"
            >
              View My Bookings
            </button>
            <button
              onClick={() => router.push('/patient/dashboard')}
              className="px-6 py-3 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-900 font-semibold text-sm border border-ivory-300 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Stepper Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950">
            Book Home Sample Collection
          </h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Certified phlebotomist • Barcoded cold-chain collection • Same-day digital lab reports
          </p>
        </div>

        {/* 4-Step Progress indicator */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-2">
          {[
            { step: 1, title: 'Select Tests' },
            { step: 2, title: 'Date & Slot' },
            { step: 3, title: 'Patient & Address' },
            { step: 4, title: 'Review & Confirm' }
          ].map((item) => (
            <div
              key={item.step}
              className={`p-3 rounded-2xl border text-center transition-all ${
                currentStep === item.step
                  ? 'bg-botanical-500 text-white border-botanical-500 shadow-soft font-bold'
                  : currentStep > item.step
                  ? 'bg-botanical-50 text-botanical-800 border-botanical-200 font-semibold'
                  : 'bg-white text-botanical-600/60 border-ivory-300'
              }`}
            >
              <div className="text-[10px] sm:text-xs uppercase tracking-wider">Step {item.step}</div>
              <div className="text-xs sm:text-sm truncate font-bold mt-0.5">{item.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT TESTS */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-botanical-950">
                Select Tests & Diagnostic Profiles ({selectedTests.length} Selected)
              </h2>
              <p className="text-xs text-botanical-700/80">
                Certified Thyrocare Davangere catalog with 190+ blood tests, health packages & Aarogyam profiles.
              </p>
            </div>
            {selectedTests.length > 0 && (
              <button
                onClick={clearSelectedTests}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 self-start sm:self-auto"
              >
                Clear Selections ({selectedTests.length})
              </button>
            )}
          </div>

          {/* Banner linking to full catalog */}
          <div className="p-4 sm:p-5 rounded-2xl bg-botanical-50 border border-botanical-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-botanical-500 text-white flex items-center justify-center flex-shrink-0 shadow-soft-xs">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-botanical-950">
                  Prefer browsing with detailed test drawers & Aarogyam breakdowns?
                </p>
                <p className="text-xs text-botanical-700/80">
                  Explore verified NABL diagnostic panels with sample requirements, fasting guidelines, and package overviews.
                </p>
              </div>
            </div>
            <Link
              href="/patient/tests"
              className="px-4 py-2 rounded-xl bg-botanical-500 text-white font-bold text-xs hover:bg-botanical-600 transition-colors shadow-soft inline-flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
            >
              <span>Browse Diagnostic Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Search Bar & Category Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-botanical-600/60 pointer-events-none" />
              <input
                type="text"
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                placeholder="Search tests or packages (e.g. Aarogyam, Thyroid, Sugar, CBC, Lipid)..."
                className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs sm:text-sm text-botanical-950 placeholder:text-botanical-700/40 focus:outline-none focus:border-botanical-500 shadow-soft-sm"
              />
              {testSearch && (
                <button
                  type="button"
                  onClick={() => setTestSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-botanical-600 hover:text-botanical-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category horizontal scrolling pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {BOOK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTestCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    testCategory === cat
                      ? 'bg-botanical-500 text-white shadow-soft'
                      : 'bg-white text-botanical-800 border border-ivory-300 hover:bg-ivory-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count info */}
          <div className="text-xs text-botanical-700/70">
            Showing <strong>{filteredTests.length}</strong> available diagnostic item{filteredTests.length === 1 ? '' : 's'}
          </div>

          {filteredTests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ivory-300 p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-botanical-950">No tests or packages match &quot;{testSearch}&quot;</p>
              <p className="text-xs text-botanical-700/70">Try searching for generic terms like &quot;Lipid&quot;, &quot;Aarogyam&quot;, or &quot;Fasting&quot;</p>
              <button
                type="button"
                onClick={() => { setTestSearch(''); setTestCategory('All'); }}
                className="px-4 py-2 rounded-xl bg-botanical-50 text-botanical-800 border border-botanical-200 text-xs font-bold hover:bg-botanical-100"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1">
              {filteredTests.map((test) => {
                const isSelected = selectedTests.some((t) => t.id === test.id);
                return (
                  <div
                    key={test.id}
                    onClick={() => toggleSelectTest(test)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-botanical-50/60 border-botanical-500 shadow-soft-sm ring-1 ring-botanical-500'
                        : 'bg-white border-ivory-300 hover:border-botanical-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ivory-200 text-botanical-800">
                            {test.category}
                          </span>
                          <h3 className="text-base font-bold text-botanical-950 mt-1">{test.name}</h3>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-extrabold text-botanical-600">₹{test.price}</p>
                          {test.original_price && (
                            <p className="text-xs text-botanical-700/60 line-through">₹{test.original_price}</p>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-botanical-700/80 line-clamp-2">{test.description}</p>

                      <div className="flex items-center gap-4 text-[11px] text-botanical-800/70 pt-1">
                        <span>Turnaround: <strong>{test.turnaround_description}</strong></span>
                        <span>•</span>
                        <span>Sample: <strong>{test.sample_type}</strong></span>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-ivory-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-botanical-700/70 italic">
                        {test.preparation_instructions || 'No special fasting needed'}
                      </span>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-botanical-600 text-white'
                            : 'bg-ivory-100 text-botanical-900 hover:bg-botanical-50'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : '+ Select Test'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Running Estimate Footer Bar */}
          <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-ivory-300 shadow-soft-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-botanical-700">Estimated Total ({selectedTests.length} tests):</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-botanical-950">₹{pricing.total}</span>
                {pricing.collectionFee === 0 ? (
                  <span className="text-xs font-bold text-emerald-700">Free Doorstep Collection</span>
                ) : (
                  <span className="text-xs text-botanical-700/80">+ ₹150 Home Collection Fee</span>
                )}
              </div>
            </div>

            <button
              disabled={!canProceedStep1}
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SCHEDULE COLLECTION */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-botanical-950">Select Preferred Date & Time Slot</h2>
            <p className="text-xs text-botanical-700/80">
              Phlebotomists operate daily from 6:00 AM to 8:00 PM with strict temperature monitoring.
            </p>
          </div>

          {/* Selected Tests Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-botanical-50/70 border border-botanical-200 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-botanical-950 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-botanical-600" />
                <span>Selected Tests for Home Collection ({selectedTests.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-botanical-700 hover:text-botanical-950 underline flex items-center gap-1"
              >
                <span>+ Modify / Add More Tests</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedTests.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-botanical-200 text-xs font-medium text-botanical-950 shadow-soft-xs"
                >
                  <span>{t.name}</span>
                  <span className="text-[11px] font-bold text-botanical-700 bg-botanical-50 px-1.5 py-0.5 rounded-md">
                    ₹{t.price}
                  </span>
                </span>
              ))}
            </div>

            <div className="text-[11px] text-botanical-700 flex items-center justify-between pt-1 border-t border-botanical-200/60">
              <span>Estimated Collection Total: <strong className="text-botanical-950 font-bold">₹{pricing.total}</strong></span>
              <Link href="/patient/tests" className="underline hover:text-botanical-950 font-semibold">
                Browse Full Catalog
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-botanical-900 mb-2">
                Collection Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-500 text-sm font-semibold text-botanical-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-botanical-900 mb-2">
                Select Available Phlebotomy Time Slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COLLECTION_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                      selectedSlot === slot
                        ? 'bg-botanical-500 text-white border-botanical-500 shadow-soft'
                        : 'bg-ivory-50 text-botanical-950 border-ivory-300 hover:border-botanical-300'
                    }`}
                  >
                    <span>{slot}</span>
                    {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-ivory-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-botanical-800 bg-ivory-100 hover:bg-ivory-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tests</span>
            </button>

            <button
              disabled={!canProceedStep2}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 text-white font-bold text-sm shadow-soft"
            >
              <span>Continue to Patient Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PATIENT & INTERACTIVE MAP ADDRESS */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Patient Details */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-ivory-300 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-botanical-950">Patient Details</h2>
                <p className="text-xs text-botanical-700/80">Information for diagnostic lab test record and sample vial barcode</p>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold bg-ivory-100 text-botanical-800 border border-ivory-200">
                Step 3 of 4
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setPatientName(newName);
                    setConfirmedAddress((prev) => ({
                      ...prev,
                      recipient_name: newName,
                    }));
                  }}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setPatientPhone(newPhone);
                    setConfirmedAddress((prev) => ({
                      ...prev,
                      recipient_phone: newPhone,
                      phone: newPhone,
                    }));
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">Age *</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">Gender *</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-botanical-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Leaflet Map Address Picker (Standalone 2-Column Component) */}
          <AddressMapPickerWrapper
            initialAddress={{
              ...confirmedAddress,
              recipient_name: patientName || confirmedAddress.recipient_name,
              recipient_phone: patientPhone || confirmedAddress.recipient_phone,
            }}
            onConfirmAddress={handleConfirmAddressFromMap}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-botanical-800 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Slot</span>
            </button>

            <button
              disabled={!canProceedStep3}
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all"
            >
              <span>Review Order Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
            <h2 className="text-lg font-bold text-botanical-950">Order Summary & Price Breakdown</h2>

            {/* Test Items Table */}
            <div className="border border-ivory-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory-100/80 border-b border-ivory-200 text-botanical-800 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Test Name</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100">
                  {pricing.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-botanical-950">{item.name}</td>
                      <td className="p-3 text-right font-bold text-botanical-950">₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Authoritative Price Calculation */}
            <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-2 text-xs">
              <div className="flex justify-between text-botanical-700">
                <span>Diagnostic Catalog Subtotal:</span>
                <span className="font-semibold text-botanical-950">₹{pricing.subtotal}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Multi-Test Bundle Discount (10%):</span>
                  <span>- ₹{pricing.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-botanical-700">
                <span>Doorstep Collection Fee:</span>
                {pricing.collectionFee === 0 ? (
                  <span className="font-bold text-emerald-700">FREE (Orders ≥ ₹999)</span>
                ) : (
                  <span className="font-semibold text-botanical-950">₹{pricing.collectionFee}</span>
                )}
              </div>
              <div className="flex justify-between text-botanical-700">
                <span>Diagnostic Health Taxes (GST):</span>
                <span className="font-semibold text-botanical-950">₹0 (Exempt)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-ivory-300 text-base font-extrabold text-botanical-950">
                <span>Total Authoritative Amount:</span>
                <span className="text-botanical-600">₹{pricing.total}</span>
              </div>
            </div>

            {/* Appointment & Confirmed Address Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-ivory-200 space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-botanical-600">
                  Collection Schedule
                </span>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Time Slot:</strong> {selectedSlot}</p>
                <p><strong>Patient:</strong> {patientName} ({patientAge}y, {patientGender})</p>
                <p><strong>Phone:</strong> {patientPhone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-ivory-200 space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-botanical-600">
                  Confirmed GPS Location
                </span>
                <p><strong>Address:</strong> {confirmedAddress.address_line_1}</p>
                <p><strong>Locality:</strong> {confirmedAddress.locality}, {confirmedAddress.city} - {confirmedAddress.postal_code}</p>
                <p><strong>Coordinates:</strong> {confirmedAddress.latitude?.toFixed(4)}, {confirmedAddress.longitude?.toFixed(4)}</p>
                {confirmedAddress.landmark && <p><strong>Landmark:</strong> {confirmedAddress.landmark}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-botanical-800 bg-ivory-100 hover:bg-ivory-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Details</span>
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleSubmitBooking}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all hover:-translate-y-0.5"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'Confirming Appointment...' : 'Submit Booking'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
