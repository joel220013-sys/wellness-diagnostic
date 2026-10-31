'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, ArrowRight, ChevronRight, Clock, Droplet, ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import PublicHeader from '@/components/layout/public-header';
import { useData } from '@/context/DataContext';
import { DiagnosticTest } from '@/types';
import PackageOverviewDrawer from '@/components/packages/PackageOverviewDrawer';
import { getPackageDetails } from '@/data/package-details';

export default function PackagesPage() {
  const router = useRouter();
  const { packages, tests, toggleSelectTest } = useData();
  const [overviewTest, setOverviewTest] = useState<DiagnosticTest | null>(null);

  return (
    <div className="min-h-screen bg-ivory-200 text-botanical-900 selection:bg-botanical-200 flex flex-col justify-between">
      <PublicHeader />

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const pkgInfo = getPackageDetails(pkg.name, pkg.parameters_count, pkg.description);
            const isFasting = Boolean(
              (pkg as any).fasting_required || 
              pkg.preparation_instructions?.toLowerCase().includes('fasting')
            );
            const fastingText = isFasting ? `${(pkg as any).fasting_hours || 10}-12 Hrs Fasting` : 'Non-Fasting';

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-card hover:shadow-soft flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {pkg.popular ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-peach-100 text-peach-800 border border-peach-200">
                        RECOMMENDED
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-botanical-50 text-botanical-800 border border-botanical-200">
                        Health Package
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-botanical-600 bg-ivory-100 px-2 py-0.5 rounded-md">
                      {pkg.turnaround_description || '24-38 Hrs'}
                    </span>
                  </div>

                  <h3 
                    onClick={() => setOverviewTest(pkg as any)}
                    className="font-extrabold text-lg text-botanical-950 cursor-pointer hover:text-botanical-700 transition-colors"
                  >
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-botanical-800/75 mt-1 leading-relaxed line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Includes Section with Show All Tests Link */}
                  <div className="my-3 pt-3 border-t border-ivory-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-botanical-950">
                        Includes {pkg.parameters_count || 1} Tests
                      </span>
                      <button
                        type="button"
                        onClick={() => setOverviewTest(pkg as any)}
                        className="text-xs font-bold text-botanical-600 hover:text-botanical-800 inline-flex items-center gap-0.5 hover:underline"
                      >
                        <span>Show All Tests</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {pkgInfo.previewBullets && (
                      <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
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

                  <div className="my-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200 text-xs space-y-1">
                    <div className="flex justify-between text-botanical-700">
                      <span>Sample Type:</span>
                      <span className="font-semibold text-botanical-900">{pkg.sample_type || 'Blood & Urine'}</span>
                    </div>
                    <div className="flex justify-between text-botanical-700">
                      <span>Fasting:</span>
                      <span className="font-semibold text-botanical-900">{fastingText}</span>
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOverviewTest(pkg as any)}
                      className="px-3 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-900 font-bold text-xs border border-ivory-300 transition-all"
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => {
                        toggleSelectTest(pkg as any);
                        router.push('/patient/book');
                      }}
                      className="px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Package Overview Drawer */}
      <PackageOverviewDrawer
        test={overviewTest}
        isOpen={!!overviewTest}
        onClose={() => setOverviewTest(null)}
      />

      <footer className="py-4 text-center text-xs text-botanical-700/60 border-t border-ivory-300">
        Wellness Diagnostic Preventive Care
      </footer>
    </div>
  );
}
