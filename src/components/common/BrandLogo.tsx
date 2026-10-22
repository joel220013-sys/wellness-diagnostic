import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export default function BrandLogo({ size = 'md', showTagline = false, className = '' }: BrandLogoProps) {
  const pixelSizes = {
    sm: { box: 28, svg: 16 },
    md: { box: 36, svg: 20 },
    lg: { box: 48, svg: 28 },
    xl: { box: 64, svg: 38 }
  };

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg md:text-xl font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight'
  };

  const currentPixels = pixelSizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon Matching Reference Graphic */}
      <div 
        style={{
          width: `${currentPixels.box}px`,
          height: `${currentPixels.box}px`,
          minWidth: `${currentPixels.box}px`,
          minHeight: `${currentPixels.box}px`,
          maxWidth: `${currentPixels.box}px`,
          maxHeight: `${currentPixels.box}px`,
          display: 'flex',
          flexShrink: 0
        }}
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-botanical-500 to-botanical-700 flex items-center justify-center text-white shadow-soft relative overflow-hidden flex-shrink-0`}
      >
        {/* Subtle leaf shine */}
        <div className="absolute inset-0 bg-white/10 opacity-30 transform -rotate-45 pointer-events-none" />
        <svg
          width={currentPixels.svg}
          height={currentPixels.svg}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            width: `${currentPixels.svg}px`,
            height: `${currentPixels.svg}px`,
            maxWidth: `${currentPixels.svg}px`,
            maxHeight: `${currentPixels.svg}px`,
            display: 'block'
          }}
          className="text-ivory-50 transform -rotate-12 pointer-events-none"
        >
          {/* Stylized healthcare leaf with drop */}
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.5 3 8.3 7 9.5 0-3 1.5-6 4-7.5" />
          <path d="M12 2c5.5 0 10 4.5 10 10 0 4.5-3 8.3-7 9.5 0-3-1.5-6-4-7.5" />
          <path d="M12 2v20" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span className={`text-botanical-900 ${textSizes[size]}`}>
          Wellness <span className="text-botanical-500">Diagnostic</span>
        </span>
        {showTagline && (
          <span className="text-xs font-medium text-botanical-700/75 tracking-wider uppercase mt-0.5">
            Pathology & Home Collection
          </span>
        )}
      </div>
    </div>
  );
}
