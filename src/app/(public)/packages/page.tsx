'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, ArrowRight, ChevronRight, Clock, Droplet, ShieldCheck, FlaskConical } from 'lucide-react';
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

        {packages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 shadow-soft-sm space-y-3">
            <FlaskConical className="w-12 h-12 text-botanical-400 mx-auto" />
            <h3 className="text-base font-bold text-botanical-950">No health packages currently available</h3>
            <p className="text-xs text-botanical-700/80 max-w-sm mx-auto">
              Comprehensive preventive wellness checkup packages will appear here once updated by the laboratory.
            </p>
            <Link
              href="/patient/tests"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-botanical-500 text-white font-bold text-xs shadow-soft"
            >
              Browse Pathology Tests
            </Link>
          </div>
        ) : (
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
                className="bg-white rounded-3xl border border-ivory-300 shadow-soft-card hover:shadow-soft flex flex-col justify-between overflow-hidden transition-all"
              >
                {/* Dark Header Banner (Reports in XX Hrs) - Verbatim like Pic 1 */}
                <div className="bg-botanical-950 text-white px-5 py-2.5 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-peach-400" />
                    <span className="font-medium tracking-wide">
                      {pkgInfo.reportsIn || pkg.turnaround_description || 'Reports In 24-38 Hrs'}
                    </span>
                  </div>
                  {pkg.popular ? (
                    <span className="px-2 py-0.5 rounded-full bg-peach-500 text-white text-[10px] font-extrabold tracking-tight">
                      RECOMMENDED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-botanical-200">
                      Health Package
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Title & Description */}
                    <div>
                      <h3 
                        onClick={() => setOverviewTest(pkg as any)}
                        className="font-extrabold text-lg sm:text-xl text-botanical-950 cursor-pointer hover:text-botanical-700 transition-colors"
                      >
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-botanical-800/80 mt-1.5 leading-relaxed line-clamp-3">
                        {pkgInfo.description || pkg.description}
                      </p>
                    </div>

                    {/* Includes Section with Show All Tests Link (Verbatim like Pic 1 & Pic 3) */}
                    <div className="pt-3 border-t border-ivory-200">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-extrabold text-botanical-950">
                          Includes {pkgInfo.parametersCount || pkg.parameters_count || 1} Tests
                        </span>
                        <button
                          type="button"
                          onClick={() => setOverviewTest(pkg as any)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 hover:underline"
                        >
                          <span>Show All Tests</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Preview Bullets like Pic 1 & Pic 3 */}
                      {pkgInfo.previewBullets && pkgInfo.previewBullets.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-1 text-[11px] text-botanical-800 font-medium">
                          {pkgInfo.previewBullets.slice(0, 4).map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-1.5 truncate">
                              <span className="text-botanical-400 font-bold">•</span>
                              <span className="truncate">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fasting & Sample pills row verbatim like Pic 1 */}
                    <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-botanical-600 block mb-1">
                          Fasting
                        </span>
                        <span className="px-3 py-1 rounded-full bg-ivory-100 text-botanical-900 font-bold text-xs border border-ivory-300 inline-block">
                          {pkgInfo.fasting || fastingText}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-botanical-600 block mb-1 text-right">
                          Sample
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(pkgInfo.samples || (pkg.sample_type ? (pkg.sample_type.includes('&') ? ['Blood', 'Urine'] : [pkg.sample_type]) : ['Blood'])).map((s, sIdx) => (
                            <span 
                              key={sIdx}
                              className="px-2.5 py-1 rounded-full bg-ivory-100 text-botanical-900 font-bold text-xs border border-ivory-300 inline-block"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
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
                        className="px-3.5 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-900 font-bold text-xs border border-ivory-300 transition-all"
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => {
                          toggleSelectTest(pkg as any);
                          router.push('/patient/book');
                        }}
                        className="px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-extrabold text-xs shadow-soft transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
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
