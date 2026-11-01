'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall,
  CalendarCheck,
  ShieldCheck,
  FileCheck2,
  Phone,
  ChevronRight
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
      <section className="relative overflow-hidden pt-6 pb-10 sm:pt-12 sm:pb-16">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-peach-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-botanical-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-peach-100 border border-peach-200 text-botanical-900 text-xs font-bold shadow-soft-sm">
                <Sparkles className="w-3.5 h-3.5 text-peach-500 flex-shrink-0" />
                <span className="truncate">Doorstep Blood Collection at Your Convenience</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-botanical-950 tracking-tight leading-[1.15]">
                Better Health Today<br />
                <span className="text-peach-400">Brighter Tomorrows</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-botanical-800/80 max-w-xl leading-relaxed">
                Accurate tests. Home collection. Trusted reports. Wellness Diagnostic brings clinical quality diagnostics and verified NABL laboratory testing directly to your doorstep in Davangere.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/patient/book"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-bold text-xs sm:text-base shadow-soft transition-all flex items-center gap-2"
                >
                  <span>Book Home Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/packages"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-ivory-100 border border-botanical-300 text-botanical-800 font-bold text-xs sm:text-base transition-all"
                >
                  View Packages
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-soft-lg border-4 border-white bg-peach-50 flex items-center justify-center">
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
          <div className="mt-6 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950 truncate sm:overflow-visible">Home Collection</h4>
                <p className="text-[10px] sm:text-[11px] text-botanical-700/80 truncate sm:overflow-visible">at Your Convenience</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950 truncate sm:overflow-visible">NABL Certified</h4>
                <p className="text-[10px] sm:text-[11px] text-botanical-700/80 truncate sm:overflow-visible">ISO 15189 Laboratory</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950 truncate sm:overflow-visible">Accurate Reports</h4>
                <p className="text-[10px] sm:text-[11px] text-botanical-700/80 truncate sm:overflow-visible">Same-Day Digital Delivery</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-sm flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-botanical-50 text-botanical-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-botanical-950 truncate sm:overflow-visible">Affordable</h4>
                <p className="text-[10px] sm:text-[11px] text-botanical-700/80 truncate sm:overflow-visible">Transparent INR Pricing</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW HOME COLLECTION WORKS (3 SIMPLE STEPS) */}
      <section className="py-12 sm:py-16 bg-white border-y border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold text-botanical-600 uppercase tracking-widest bg-botanical-50 px-3.5 py-1.5 rounded-full border border-botanical-100">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-botanical-950 tracking-tight mt-3">
              How Home Sample Collection Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-botanical-800/80 leading-relaxed">
              Experience seamless healthcare diagnostics without standing in clinic queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-ivory-50/60 rounded-3xl p-6 sm:p-7 border border-ivory-300 relative flex flex-col justify-between hover:shadow-soft transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-peach-100 text-peach-600 flex items-center justify-center font-extrabold text-lg mb-4">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-bold text-botanical-950 mb-2">
                  Select Tests & Pick a Slot
                </h3>
                <p className="text-xs sm:text-sm text-botanical-800/75 leading-relaxed">
                  Choose from verified specialized tests or preventive health packages. Select your preferred date and convenient morning time slot.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ivory-200">
                <Link href="/packages" className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-600 hover:text-botanical-700">
                  <span>Explore Health Packages</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-ivory-50/60 rounded-3xl p-6 sm:p-7 border border-ivory-300 relative flex flex-col justify-between hover:shadow-soft transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-botanical-100 text-botanical-700 flex items-center justify-center font-extrabold text-lg mb-4">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-bold text-botanical-950 mb-2">
                  Certified Phlebotomist Arrives
                </h3>
                <p className="text-xs sm:text-sm text-botanical-800/75 leading-relaxed">
                  Our certified, vaccinated healthcare professional arrives with sealed vacuum tubes, sterile collection gear, and cold-chain sample storage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ivory-200">
                <Link href="/home-collection" className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-600 hover:text-botanical-700">
                  <span>Learn About Collection Safety</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-ivory-50/60 rounded-3xl p-6 sm:p-7 border border-ivory-300 relative flex flex-col justify-between hover:shadow-soft transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-lg mb-4">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-bold text-botanical-950 mb-2">
                  Digital Report in 8–12 Hours
                </h3>
                <p className="text-xs sm:text-sm text-botanical-800/75 leading-relaxed">
                  Your blood sample is analyzed in our NABL accredited laboratory. Verified PDF lab reports are delivered to your portal, email, and WhatsApp.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ivory-200">
                <Link href="/patient/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-600 hover:text-botanical-700">
                  <span>Access Patient Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#18352E] via-[#1F433A] to-[#122A24] text-white p-8 sm:p-12 shadow-soft-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                ISO 15189 Certified Diagnostic Quality
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Take Charge of Your Health With Routine Blood Diagnostics
              </h2>
              <p className="text-xs sm:text-sm text-ivory-200/80 leading-relaxed">
                Book comprehensive full-body checkups, diabetic profiles, thyroid panels, and vitamin screenings. Doorstep phlebotomist dispatch available across Davangere.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/patient/book"
                  className="px-6 py-3 rounded-full bg-peach-400 hover:bg-peach-500 text-botanical-950 font-bold text-xs sm:text-sm shadow-soft transition-all"
                >
                  Book Home Collection Now
                </Link>
                <Link
                  href="/packages"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
                >
                  Browse Packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
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
