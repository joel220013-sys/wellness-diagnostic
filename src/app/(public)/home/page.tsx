'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import PublicHeader from '@/components/layout/public-header';
import PromoBannerCarousel from '@/components/home/PromoBannerCarousel';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-ivory-200 text-botanical-900 selection:bg-botanical-200">
      
      {/* 1. TOP HEADER WITH FULL MOBILE MENU */}
      <PublicHeader />

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-peach-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-botanical-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-200 text-botanical-900 text-xs font-bold shadow-soft-sm">
                <Sparkles className="w-3.5 h-3.5 text-peach-500" />
                <span>Doorstep Blood Collection at Your Convenience</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-botanical-950 tracking-tight leading-[1.15]">
                Better Health Today<br />
                <span className="text-peach-400">Brighter Tomorrows</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-botanical-800/80 max-w-xl leading-relaxed">
                Accurate tests. Home collection. Trusted reports. Wellness Diagnostic brings clinical quality diagnostics and verified NABL laboratory testing directly to your doorstep.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/patient/book"
                  className="px-6 py-3.5 rounded-full bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-bold text-sm sm:text-base shadow-soft transition-all flex items-center gap-2"
                >
                  <span>Book a Test</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/packages"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-ivory-100 border border-botanical-300 text-botanical-800 font-bold text-sm sm:text-base transition-all"
                >
                  View Packages
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-soft-lg border-4 border-white bg-peach-50 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                  alt="Certified phlebotomist taking blood sample at home"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-botanical-950/60 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white text-xs">
                    <span className="font-bold block text-sm">100% Sterile Vacuum Tubes</span>
                    <span>Cold-chain temperature managed sample transport</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Promotional Offers Banner Carousel (Thyrocare Style) */}
          <PromoBannerCarousel />

          {/* 4 Feature Badges */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            <div className="p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950">Home Collection</h4>
                <p className="text-[11px] text-botanical-700/80">at Your Convenience</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950">NABL Certified</h4>
                <p className="text-[11px] text-botanical-700/80">ISO 15189 Laboratory</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950">Accurate & Reliable</h4>
                <p className="text-[11px] text-botanical-700/80">Same-Day Digital Reports</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950">Affordable</h4>
                <p className="text-[11px] text-botanical-700/80">Transparent INR Pricing</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FOOTER */}
      <footer className="bg-botanical-950 text-white pt-12 pb-8 border-t border-botanical-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-botanical-900 text-xs">
            <div>
              <BrandLogo size="md" inverted={true} />
              <p className="text-ivory-300/80 mt-3 leading-relaxed">
                Accredited clinical pathology laboratory specializing in doorstep blood collection, preventive health panels, and fast digital reports.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-peach-300 uppercase tracking-wider mb-3">Quick Links</h4>
              <ul className="space-y-2 text-ivory-300/80">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/tests" className="hover:text-white">Diagnostic Tests</Link></li>
                <li><Link href="/packages" className="hover:text-white">Health Packages</Link></li>
                <li><Link href="/home-collection" className="hover:text-white">Home Collection</Link></li>
                <li><Link href="/about" className="hover:text-white">About Laboratory</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact & Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-peach-300 uppercase tracking-wider mb-3">Portals</h4>
              <ul className="space-y-2 text-ivory-300/80">
                <li><Link href="/portal" className="hover:text-white">Choose Access Portal</Link></li>
                <li><Link href="/patient/login" className="hover:text-white">Patient Portal</Link></li>
                <li><Link href="/admin/login" className="hover:text-white">Admin Console</Link></li>
                <li><Link href="/driver/login" className="hover:text-white">Phlebotomist Fleet</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-peach-300 uppercase tracking-wider mb-3">Contact Support</h4>
              <p className="text-ivory-300/80 mb-2">Operational 7 days a week: 06:00 AM – 09:00 PM</p>
              <div className="text-sm font-bold text-peach-300 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4" />
                <span>+91 98765 01234</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-300/60 gap-3">
            <span>© 2026 Wellness Diagnostic Inc. All medical rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/portal" className="hover:underline">Choose Access Portal</Link>
              <span>•</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
