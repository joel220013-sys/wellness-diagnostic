'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, Heart, Award } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useData } from '@/context/DataContext';

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tests, toggleSelectTest, isTestSelected } = useData();

  const testId = params?.id as string;
  const test = tests.find((t) => t.id === testId || t.slug === testId);

  if (!test) {
    return (
      <div className="min-h-screen bg-ivory-200 text-botanical-900 flex flex-col justify-between">
        <header className="bg-white/80 backdrop-blur-md border-b border-ivory-300 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <BrandLogo size="md" />
            <Link
              href="/tests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-800 hover:text-botanical-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Tests</span>
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 text-center">
          <div className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-soft max-w-md mx-auto">
            <h2 className="text-lg font-bold text-botanical-950 mb-2">Loading Diagnostic Test...</h2>
            <p className="text-xs text-botanical-700/80 mb-6">
              Fetching clinical test details and preparation requirements.
            </p>
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View All Tests</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isSelected = isTestSelected(test.id);

  return (
    <div className="min-h-screen bg-ivory-200 text-botanical-900 selection:bg-botanical-200 flex flex-col justify-between">
      <header className="bg-white/80 backdrop-blur-md border-b border-ivory-300 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />
          <Link
            href="/tests"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-800 hover:text-botanical-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tests</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-200">
            <div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-botanical-50 text-botanical-700 border border-botanical-100">
                {test.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950 mt-2">
                {test.name}
              </h1>
              <p className="text-xs text-botanical-700 mt-1">Sample Type: {test.sample_type}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold text-botanical-950 font-mono block">
                ₹{test.price.toLocaleString('en-IN')}
              </span>
              {Boolean(test.original_price && test.original_price > test.price) && (
                <span className="text-xs text-botanical-600/60 line-through">
                  MRP: ₹{test.original_price?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-botanical-950 mb-1.5">Description</h3>
            <p className="text-xs sm:text-sm text-botanical-800 leading-relaxed">{test.description}</p>
          </div>

          {test.preparation_instructions && (
            <div className="p-4 rounded-2xl bg-peach-50/70 border border-peach-200 text-xs">
              <span className="font-bold text-botanical-950 block mb-1">Preparation Instructions:</span>
              <p className="text-botanical-800">{test.preparation_instructions}</p>
            </div>
          )}

          {test.parameters_list && (
            <div>
              <h3 className="text-sm font-bold text-botanical-950 mb-2">
                Biomarkers & Parameters ({test.parameters_count})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {test.parameters_list.map((param, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-botanical-500 flex-shrink-0" />
                    <span className="text-botanical-900">{param}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-ivory-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-botanical-700">
              <Clock className="w-4 h-4 text-botanical-500" />
              <span>Report Delivery: {test.turnaround_description}</span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => toggleSelectTest(test)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-botanical-100 text-botanical-800 border border-botanical-300'
                    : 'bg-ivory-100 text-botanical-900 hover:bg-ivory-200 border border-ivory-300'
                }`}
              >
                {isSelected ? '✓ Added to Cart' : '+ Add to Selection'}
              </button>

              <button
                onClick={() => {
                  if (!isSelected) toggleSelectTest(test);
                  router.push('/patient/book');
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Laboratory • Doorstep Blood Collection
      </footer>
    </div>
  );
}
