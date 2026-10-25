import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  showText?: boolean;
  inverted?: boolean;
}

export default function BrandLogo({
  size = 'md',
  showTagline = false,
  className = '',
  showText = true,
  inverted = false
}: BrandLogoProps) {
  const dimensions = {
    sm: {
      emblem: 36,
      text: 'text-base font-extrabold tracking-tight',
      tagline: 'text-[10px]'
    },
    md: {
      emblem: 46,
      text: 'text-lg sm:text-xl font-extrabold tracking-tight',
      tagline: 'text-[11px]'
    },
    lg: {
      emblem: 60,
      text: 'text-2xl font-extrabold tracking-tight',
      tagline: 'text-xs'
    },
    xl: {
      emblem: 80,
      text: 'text-3xl font-extrabold tracking-tight',
      tagline: 'text-sm'
    }
  };

  const current = dimensions[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Wellness Diagnostic Circular Emblem Logo */}
      <div
        className="relative flex-shrink-0 rounded-full bg-white shadow-soft-sm border border-ivory-300/80 overflow-hidden transition-transform duration-200 hover:scale-105"
        style={{
          width: `${current.emblem}px`,
          height: `${current.emblem}px`,
          minWidth: `${current.emblem}px`,
          minHeight: `${current.emblem}px`
        }}
      >
        <Image
          src="/logo.png"
          alt="Wellness Diagnostic Official Logo"
          width={current.emblem}
          height={current.emblem}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={
              inverted
                ? `text-white ${current.text}`
                : `text-botanical-950 ${current.text}`
            }
          >
            Wellness{' '}
            <span
              className={
                inverted ? 'text-peach-300 font-extrabold' : 'text-botanical-600 font-extrabold'
              }
            >
              Diagnostic
            </span>
          </span>
          {showTagline && (
            <span
              className={`font-semibold tracking-wider uppercase mt-0.5 ${current.tagline} ${
                inverted ? 'text-ivory-200/80' : 'text-botanical-700/80'
              }`}
            >
              Pathology & Home Collection
            </span>
          )}
        </div>
      )}
    </div>
  );
}
