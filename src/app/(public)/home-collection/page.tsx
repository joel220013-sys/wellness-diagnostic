'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

export default function HomeCollectionPage() {
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
              Book Collection
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-100 text-botanical-800 text-xs font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>Trained Mobile Phlebotomy Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-botanical-950">
            Hassle-Free Home Sample Collection
          </h1>
          <p className="text-xs sm:text-sm text-botanical-800/80 leading-relaxed">
            Get your diagnostic blood and urine samples collected safely in the comfort and privacy of your home by certified healthcare professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-botanical-950">100% Sterile Kits</h3>
            <p className="text-xs text-botanical-800/75 leading-relaxed">
              Every phlebotomist uses freshly unsealed vacutainer vacuum needles and single-use latex gloves.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-botanical-950">Cold-Chain Temperature Box</h3>
            <p className="text-xs text-botanical-800/75 leading-relaxed">
              Samples are stored in gel-pack chilled containers maintaining 2°C – 8°C throughout transit to prevent hemolysis.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-botanical-950">Barcoded Identification</h3>
            <p className="text-xs text-botanical-800/75 leading-relaxed">
              Unique sample barcodes are assigned and scanned right in front of you to eliminate sample misidentification.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-botanical-950">Ready to schedule your home visit?</h2>
            <p className="text-xs text-botanical-800/80">Available 7 days a week from 6:30 AM to 11:30 AM for fasting collections.</p>
          </div>

          <Link
            href="/patient/book"
            className="px-6 py-3 rounded-full bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-sm shadow-soft flex items-center gap-2"
          >
            <span>Book Home Visit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60 border-t border-ivory-300">
        Wellness Diagnostic Phlebotomy Logistics
      </footer>
    </div>
  );
}
