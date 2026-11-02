'use client';

import React from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Activity, 
  FileText, 
  HeartPulse, 
  Sun, 
  Microscope, 
  Award,
  Layers
} from 'lucide-react';

interface CategoryPillIconProps {
  category: string;
  isSelected?: boolean;
}

export default function CategoryPillIcon({ category, isSelected = false }: CategoryPillIconProps) {
  const norm = category.toLowerCase().trim();

  // Selected state: frosted white badge with crisp white icon
  if (isSelected) {
    return (
      <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 text-white">
        {renderIcon(norm, true)}
      </span>
    );
  }

  // Unselected state: vivid themed background pill badge
  const badgeStyle = getCategoryBadgeStyle(norm);

  return (
    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${badgeStyle}`}>
      {renderIcon(norm, false)}
    </span>
  );
}

function getCategoryBadgeStyle(norm: string): string {
  if (norm.includes('popular')) return 'bg-amber-100 text-orange-600';
  if (norm.includes('full body')) return 'bg-teal-100 text-teal-700';
  if (norm.includes('package') || norm.includes('health')) return 'bg-blue-100 text-blue-600';
  if (norm.includes('blood')) return 'bg-rose-100 text-rose-600';
  if (norm.includes('jaanch')) return 'bg-emerald-100 text-emerald-700';
  if (norm.includes('diabetes') || norm.includes('sugar')) return 'bg-violet-100 text-violet-600';
  if (norm.includes('thyroid')) return 'bg-pink-100 text-pink-600';
  if (norm.includes('lipid') || norm.includes('cholesterol') || norm.includes('cardiac')) return 'bg-red-100 text-red-600';
  if (norm.includes('liver')) return 'bg-amber-100 text-amber-800';
  if (norm.includes('kidney') || norm.includes('renal')) return 'bg-purple-100 text-purple-700';
  if (norm.includes('vitamin')) return 'bg-yellow-100 text-amber-600';
  if (norm.includes('hematology') || norm.includes('cbc')) return 'bg-fuchsia-100 text-fuchsia-700';
  if (norm.includes('aarogyam')) return 'bg-orange-100 text-orange-600';
  return 'bg-botanical-100 text-botanical-700';
}

function renderIcon(norm: string, isWhite: boolean) {
  const iconCls = isWhite ? 'w-3 h-3 text-white' : 'w-3 h-3';

  if (norm === 'all') {
    return <Layers className={iconCls} />;
  }

  if (norm.includes('popular')) {
    return <Flame className={iconCls} />;
  }

  if (norm.includes('aarogyam')) {
    return <Award className={iconCls} />;
  }

  if (norm.includes('full body')) {
    return <Activity className={iconCls} />;
  }

  if (norm.includes('health') || norm.includes('package')) {
    return <ShieldCheck className={iconCls} />;
  }

  if (norm.includes('jaanch')) {
    return <FileText className={iconCls} />;
  }

  // Blood Test - Droplet SVG
  if (norm.includes('blood')) {
    return (
      <svg viewBox="0 0 24 24" className={`${iconCls} fill-current`}>
        <path d="M12 2.5c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" />
      </svg>
    );
  }

  // Diabetes - Blood drop with glucose curve / plus
  if (norm.includes('diabetes') || norm.includes('sugar')) {
    return (
      <svg viewBox="0 0 24 24" className={`${iconCls} fill-none stroke-current stroke-2`}>
        <path d="M12 3l-5 6a7 7 0 1 0 10 0L12 3z" />
        <path d="M9 14h6" />
        <path d="M12 11v6" />
      </svg>
    );
  }

  // Thyroid - Butterfly-shaped endocrine gland
  if (norm.includes('thyroid')) {
    return (
      <svg viewBox="0 0 24 24" className={`${iconCls} fill-current`}>
        <path d="M12 8c-.8-2-3-3-5.5-2.5S3 8 3 11c0 3.5 2 6 4.5 6 1.8 0 3-1.2 3.8-3 .2-.5.5-.7.7-.7s.5.2.7.7c.8 1.8 2 3 3.8 3 2.5 0 4.5-2.5 4.5-6 0-3-2-5-3.5-5.5S12.8 6 12 8z" />
      </svg>
    );
  }

  // Lipid - Cardiac Heart Pulse
  if (norm.includes('lipid') || norm.includes('cardiac') || norm.includes('heart')) {
    return <HeartPulse className={iconCls} />;
  }

  // Liver - Anatomical liver lobe
  if (norm.includes('liver')) {
    return (
      <svg viewBox="0 0 24 24" className={`${iconCls} fill-current`}>
        <path d="M4 8.5C4 6 6.5 4 12 4c5.5 0 8 2 8 5.5 0 4.5-3.5 8.5-9 8.5-4 0-7-2-7-5.5V8.5z" />
      </svg>
    );
  }

  // Kidney - Renal pair
  if (norm.includes('kidney') || norm.includes('renal')) {
    return (
      <svg viewBox="0 0 24 24" className={`${iconCls} fill-current`}>
        <path d="M7 6c-2 0-3.5 2-3.5 5s1 5 3 5 3-1.5 3-3.5c0-.8-.5-1.5-1-2-.5-.5-.5-1 0-1.5.5-.5 1-1.2 1-2C9.5 6.5 8.5 6 7 6zm10 0c-1.5 0-2.5.5-2.5 1 0 .8.5 1.5 1 2 .5.5.5 1 0 1.5-.5.5-1 1.2-1 2 0 2 1 3.5 3 3.5s3-2 3-5-1.5-5-3.5-5z" />
      </svg>
    );
  }

  // Vitamins - Sunshine / Capsule
  if (norm.includes('vitamin')) {
    return <Sun className={iconCls} />;
  }

  // Hematology - Clinical Microscope
  if (norm.includes('hematology') || norm.includes('cbc')) {
    return <Microscope className={iconCls} />;
  }

  return <Sparkles className={iconCls} />;
}

