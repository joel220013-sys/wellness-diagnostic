import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-9 h-9 text-botanical-500 animate-spin" />
        <p className="text-sm font-bold text-botanical-950">Wellness Diagnostic</p>
        <p className="text-xs text-botanical-700/80">Loading secure pathology portal...</p>
      </div>
    </div>
  );
}
