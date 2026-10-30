'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  src: string;
  alt: string;
  href: string;
  badge: string;
  offer: string;
  testsCount: string;
  price1: string;
  price2: string;
}

const BANNERS: BannerItem[] = [
  {
    id: 'aarogyam-x',
    title: 'Aarogyam X With UTSH',
    src: '/banners/banner-aarogyam-x.png',
    alt: 'Diwali Special Buy 1 Get 1 FREE - Aarogyam X With UTSH (139 Tests)',
    href: '/packages',
    badge: 'Diwali Special',
    offer: 'Buy 1 Get 1 FREE',
    testsCount: '139 Tests',
    price1: '₹5,524',
    price2: '₹8,499',
  },
  {
    id: 'healthy-2026',
    title: 'Healthy 2026 Package',
    src: '/banners/banner-healthy-2026.png',
    alt: 'Diwali Special Buy 1 Get 1 FREE - Healthy 2026 Package (106 Tests)',
    href: '/packages',
    badge: 'Diwali Special',
    offer: 'Buy 1 Get 1 FREE',
    testsCount: '106 Tests',
    price1: '₹1,759',
    price2: '₹3,000',
  },
  {
    id: 'aarogyam-xl',
    title: 'Aarogyam XL With UTSH',
    src: '/banners/banner-aarogyam-xl.png',
    alt: 'Diwali Special Buy 1 Get 1 FREE - Aarogyam XL With UTSH (150 Tests)',
    href: '/packages',
    badge: 'Diwali Special',
    offer: 'Buy 1 Get 1 FREE',
    testsCount: '150 Tests',
    price1: '₹6,499',
    price2: '₹9,999',
  },
  {
    id: 'healthy-2026-repeat',
    title: 'Healthy 2026 Package',
    src: '/banners/banner-healthy-2026.png',
    alt: 'Diwali Special Buy 1 Get 1 FREE - Healthy 2026 Package (106 Tests)',
    href: '/packages',
    badge: 'Diwali Special',
    offer: 'Buy 1 Get 1 FREE',
    testsCount: '106 Tests',
    price1: '₹1,759',
    price2: '₹3,000',
  },
  {
    id: 'aarogyam-x-repeat',
    title: 'Aarogyam X With UTSH',
    src: '/banners/banner-aarogyam-x.png',
    alt: 'Diwali Special Buy 1 Get 1 FREE - Aarogyam X With UTSH (139 Tests)',
    href: '/packages',
    badge: 'Diwali Special',
    offer: 'Buy 1 Get 1 FREE',
    testsCount: '139 Tests',
    price1: '₹5,524',
    price2: '₹8,499',
  },
];

export default function PromoBannerCarousel() {
  // Start at index 1 (2/5) just like in the user's reference picture!
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = BANNERS.length;

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
      className="relative w-full my-6 sm:my-10 select-none overflow-hidden"
      aria-label="Thyrocare Special Health Package Offers"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        <div className="w-full overflow-hidden py-3">
          <div
            className="flex items-center transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              // Center the current card:
              // On desktop: card width is 62%, gap is 3%, center offset is (100 - 62)/2 = 19%
              // Formula: calc(19% - (index * 65%))
              transform: `translateX(calc(var(--carousel-offset) - (${currentIndex} * var(--carousel-step))))`,
            }}
          >
            {BANNERS.map((banner, index) => {
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
                        ? 'border-red-200/70 shadow-soft-xl scale-100 opacity-100 ring-2 ring-red-400/20'
                        : 'border-gray-200/60 shadow-soft-sm scale-[0.94] opacity-80 hover:opacity-95'
                    }`}
                  >
                    <div className="relative w-full aspect-[1048/482] bg-amber-50/50">
                      <Image
                        src={banner.src}
                        alt={banner.alt}
                        fill
                        priority={index === 1}
                        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 72vw, 750px"
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
            {BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full h-1.5 focus:outline-none ${
                  idx === currentIndex
                    ? 'w-7 bg-slate-700'
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
