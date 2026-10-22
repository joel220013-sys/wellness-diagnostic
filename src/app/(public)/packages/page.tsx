'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useData } from '@/context/DataContext';

export default function PackagesPage() {
  const router = useRouter();
  const { packages, tests, toggleSelectTest } = useData();

  return (
    <div className="min-h-screen bg-ivory-200 text-botanical-900 selection:bg-botanical-200 flex flex-col justify-between">
      <header className="bg-white/80 backdrop-blur-md border-b border-ivory-300 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-xs font-semibold text-botanical-800 hover:text-botanical-600">
              Home
            </Link>
            <Link
              href="/patient/book"
              className="px-4 py-2 rounded-full bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft"
            >
              Book Test
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-peach-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-peach-500" />
            <span>Value Preventive Health Packages</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-botanical-950">
            Comprehensive Health Packages
          </h1>
          <p className="text-xs sm:text-sm text-botanical-800/80 mt-1">
            Carefully curated medical screening profiles designed for full-body assessments, chronic condition monitoring, and senior vitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-card hover:shadow-soft flex flex-col justify-between"
            >
              <div>
                {pkg.popular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-peach-100 text-peach-800 mb-2">
                    RECOMMENDED
                  </span>
                )}
                <h3 className="font-extrabold text-lg text-botanical-950">{pkg.name}</h3>
                <p className="text-xs text-botanical-800/75 mt-1 leading-relaxed">{pkg.description}</p>

                <div className="my-4 p-3 rounded-2xl bg-ivory-50 border border-ivory-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-botanical-900">
                    <span>Parameters Covered:</span>
                    <span className="font-bold text-botanical-600">{pkg.parameters_count} Tests</span>
                  </div>
                  <div className="flex justify-between text-botanical-700">
                    <span>Sample Type:</span>
                    <span>{pkg.sample_type}</span>
                  </div>
                  <div className="flex justify-between text-botanical-700">
                    <span>Turnaround Time:</span>
                    <span>{pkg.turnaround_description}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-ivory-200 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-botanical-950 font-mono block">
                    ₹{pkg.price.toLocaleString('en-IN')}
                  </span>
                  {Boolean(pkg.original_price && pkg.original_price > pkg.price) && (
                    <span className="text-xs text-botanical-600/60 line-through">
                      ₹{pkg.original_price?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    toggleSelectTest(pkg as any);
                    router.push('/patient/book');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
                >
                  Book Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60 border-t border-ivory-300">
        Wellness Diagnostic Preventive Care
      </footer>
    </div>
  );
}
