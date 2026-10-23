'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Heart, Building, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import PublicHeader from '@/components/layout/public-header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory-200 text-botanical-900 selection:bg-botanical-200 flex flex-col justify-between">
      <PublicHeader />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-botanical-600">
            Clinical Diagnostic Excellence
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-botanical-950 mt-1">
            About Wellness Diagnostic
          </h1>
          <p className="text-xs sm:text-sm text-botanical-800/80 mt-2 leading-relaxed">
            Wellness Diagnostic was established to bring certified pathology laboratory diagnostics right to patient homes, removing transit stress, long hospital queues, and clinical waiting times.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft space-y-4 text-xs sm:text-sm text-botanical-900 leading-relaxed">
          <h3 className="font-extrabold text-base text-botanical-950">Our Laboratory Quality Commitment</h3>
          <p>
            Operating in compliance with <b>NABL (ISO 15189:2022)</b> standard guidelines, our central reference lab operates fully automated six-part hematology counters, dry-chemistry biochemistry analyzers, and high-sensitivity chemiluminescence immunoassay platforms.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-botanical-500" />
              <span>Certified Pathologist Sign-Off</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-botanical-500" />
              <span>Daily Internal Quality Controls (IQC)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-botanical-500" />
              <span>Standard Calibrated Cold Chain</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-botanical-500" />
              <span>Encrypted Digital Medical Reports</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60 border-t border-ivory-300">
        Wellness Diagnostic Laboratory Standards
      </footer>
    </div>
  );
}
