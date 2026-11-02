'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface BannerItem {
  id: string;
  title: string;
  src: string;
  alt: string;
  href: string;
  badge?: string;
  offer?: string;
  testsCount?: string;
  price1?: string;
  price2?: string;
}

export const SPECIAL_OFFER_BANNERS: BannerItem[] = [
  {
    id: 'women-basic-profile',
    title: 'Women Basic Profile With UTSH',
    src: '/banners/banner-women-basic-profile.jpg',
    alt: 'Women Basic Profile With UTSH (73 Parameters) - Offer Price ₹1,599 (MRP ₹3,400)',
    href: '/patient/tests',
    badge: 'Women Special',
    offer: 'Special Offer Price',
    testsCount: '73 Parameters',
    price1: '₹1,599',
    price2: '₹3,400',
  },
  {
    id: 'aarogyam-purush',
    title: 'Aarogyam Purush Package With UTSH',
    src: '/banners/banner-aarogyam-purush.jpg',
    alt: 'Aarogyam Purush Package (108 Parameters) - Special Offer Price ₹2,799 (MRP ₹5,500)',
    href: '/patient/tests',
    badge: 'Men Special',
    offer: 'Special Offer Price',
    testsCount: '108 Parameters',
    price1: '₹2,799',
    price2: '₹5,500',
  },
  {
    id: 'aarogyam-c-plus',
    title: 'Aarogyam C Plus Profile With UTSH',
    src: '/banners/banner-aarogyam-c-plus.jpg',
    alt: 'Aarogyam C Plus Profile With UTSH (97 Parameters) - Special Offer Price ₹1,599 (MRP ₹3,265)',
    href: '/patient/tests',
    badge: 'Special Offer',
    offer: 'Special Offer Price',
    testsCount: '97 Parameters',
    price1: '₹1,599',
    price2: '₹3,265',
  },
  {
    id: 'aarogyam-c-pro',
    title: 'Aarogyam C Pro Package',
    src: '/banners/banner-aarogyam-c-pro.jpg',
    alt: 'Aarogyam C Pro Package (71 Parameters) - Special Offer Price ₹1,399 (MRP ₹2,999)',
    href: '/patient/tests',
    badge: 'Special Offer',
    offer: 'Special Offer Price',
    testsCount: '71 Parameters',
    price1: '₹1,399',
    price2: '₹2,999',
  },
  {
    id: 'aarogyam-d-pro',
    title: 'Aarogyam D Pro With UTSH',
    src: '/banners/banner-aarogyam-d-pro.jpg',
    alt: 'Aarogyam D Pro With UTSH (86 Parameters) - Special Offer Price ₹2,199 (MRP ₹4,499)',
    href: '/patient/tests',
    badge: 'Special Offer',
    offer: 'Special Offer Price',
    testsCount: '86 Parameters',
    price1: '₹2,199',
    price2: '₹4,499',
  },
];

interface PromoBannerCarouselProps {
  banners?: BannerItem[];
  title?: string;
  badge?: string;
  subtitle?: string;
  viewAllHref?: string;
}

export default function PromoBannerCarousel({
  banners = SPECIAL_OFFER_BANNERS,
  title,
  badge,
  subtitle,
  viewAllHref = '/patient/tests',
}: PromoBannerCarouselProps = {}) {
  // Start at index 0 or 1
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeBanners = banners && banners.length > 0 ? banners : SPECIAL_OFFER_BANNERS;
  const total = activeBanners.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-play timer (every 4.5 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative w-full my-4 sm:my-8 select-none overflow-hidden"
      aria-label="Thyrocare Special Health Package Offers"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Optional Top Section Header */}
      {(title || badge) && (
        <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center justify-between gap-4">
          <div>
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 mb-1.5 shadow-soft-xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>{badge}</span>
              </span>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl font-extrabold text-botanical-950 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-botanical-700/80 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 flex items-center gap-1 flex-shrink-0"
          >
            <span>View All Packages</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Outer wrapper with edge shadow/fade and arrows */}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">
        
        {/* Navigation Arrow: Left (Thyrocare Circular Button - Tablet & Desktop) */}
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-soft-lg hover:shadow-soft-xl items-center justify-center transition-all border border-gray-200/90 active:scale-90 focus:outline-none"
          title="Previous Banner"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 -ml-0.5" />
        </button>

        {/* Navigation Arrow: Right (Thyrocare Circular Button - Tablet & Desktop) */}
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-soft-lg hover:shadow-soft-xl items-center justify-center transition-all border border-gray-200/90 active:scale-90 focus:outline-none"
          title="Next Banner"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 -mr-0.5" />
        </button>

        {/* Multi-Card Peeking Carousel Track */}
        <div className="w-full overflow-hidden py-2 sm:py-3">
          <div
            className="flex items-center transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              transform: `translateX(calc(var(--carousel-offset) - (${currentIndex} * var(--carousel-step))))`,
            }}
          >
            {activeBanners.map((banner, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={`${banner.id}-${index}`}
                  className="carousel-slide flex-shrink-0 px-2 sm:px-3.5 transition-all duration-500"
                  style={{
                    width: 'var(--carousel-width)',
                  }}
                >
                  <Link
                    href={banner.href}
                    className={`group relative block w-full rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-500 ${
                      isActive
                        ? 'border-orange-300 shadow-soft-xl scale-100 opacity-100 ring-2 ring-orange-400/30'
                        : 'border-gray-200/60 shadow-soft-sm scale-[0.94] opacity-80 hover:opacity-95'
                    }`}
                  >
                    <div className="relative w-full aspect-[16/9.5] sm:aspect-[16/9.2] bg-amber-50/50">
                      <Image
                        src={banner.src}
                        alt={banner.alt}
                        fill
                        priority={index === 0 || index === 1}
                        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 72vw, 780px"
                        className="object-cover rounded-2xl sm:rounded-3xl transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Indicator (Counter + Animated Dots) */}
        <div className="mt-2 flex items-center justify-center gap-3">
          {/* Active / Total counter pill */}
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/5 text-gray-700 border border-black/5">
            {currentIndex + 1}/{total}
          </span>

          {/* Dots Indicator with animated active pill */}
          <div className="flex items-center gap-1.5">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full h-1.5 focus:outline-none ${
                  idx === currentIndex
                    ? 'w-7 bg-orange-500'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Responsive CSS variables for exact Thyrocare peeking slide width */}
      <style jsx>{`
        :global(:root) {
          --carousel-width: 86%;
          --carousel-step: 86%;
          --carousel-offset: 7%;
        }
        @media (min-width: 640px) {
          :global(:root) {
            --carousel-width: 72%;
            --carousel-step: 72%;
            --carousel-offset: 14%;
          }
        }
        @media (min-width: 1024px) {
          :global(:root) {
            --carousel-width: 62%;
            --carousel-step: 62%;
            --carousel-offset: 19%;
          }
        }
      `}</style>
    </section>
  );
}
