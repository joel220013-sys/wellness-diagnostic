'use client';

import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  DayFilterMode, 
  getTodayDateStr, 
  getYesterdayDateStr, 
  formatFriendlyDate 
} from '@/lib/dateUtils';

interface DayFilterControlProps {
  mode: DayFilterMode;
  customDate: string;
  onModeChange: (mode: DayFilterMode) => void;
  onCustomDateChange: (dateStr: string) => void;
  todayCount?: number;
  yesterdayCount?: number;
  filteredCount?: number;
  totalCount?: number;
}

export default function DayFilterControl({
  mode,
  customDate,
  onModeChange,
  onCustomDateChange,
  todayCount = 0,
  yesterdayCount = 0,
  filteredCount = 0,
  totalCount = 0,
}: DayFilterControlProps) {
  const todayStr = getTodayDateStr();
  const yesterdayStr = getYesterdayDateStr();

  const activeDateLabel = 
    mode === 'TODAY' 
      ? `Today (${formatFriendlyDate(todayStr)})`
      : mode === 'YESTERDAY' 
      ? `Yesterday (${formatFriendlyDate(yesterdayStr)})`
      : mode === 'CUSTOM' && customDate 
      ? formatFriendlyDate(customDate)
      : 'All Historical Orders';

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-ivory-300 shadow-soft-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Today (Default) */}
          <button
            type="button"
            onClick={() => onModeChange('TODAY')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              mode === 'TODAY'
                ? 'bg-botanical-500 text-white border-botanical-600 shadow-soft'
                : 'bg-ivory-100 hover:bg-ivory-200 text-botanical-800 border-ivory-300'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${mode === 'TODAY' ? 'text-amber-300' : 'text-botanical-600'}`} />
            <span>Today</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                mode === 'TODAY'
                  ? 'bg-white/20 text-white'
                  : 'bg-ivory-200 text-botanical-900 border border-ivory-300'
              }`}
            >
              {todayCount}
            </span>
          </button>

          {/* Yesterday */}
          <button
            type="button"
            onClick={() => onModeChange('YESTERDAY')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              mode === 'YESTERDAY'
                ? 'bg-botanical-500 text-white border-botanical-600 shadow-soft'
                : 'bg-ivory-100 hover:bg-ivory-200 text-botanical-800 border-ivory-300'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${mode === 'YESTERDAY' ? 'text-amber-300' : 'text-botanical-600'}`} />
            <span>Yesterday</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                mode === 'YESTERDAY'
                  ? 'bg-white/20 text-white'
                  : 'bg-ivory-200 text-botanical-900 border border-ivory-300'
              }`}
            >
              {yesterdayCount}
            </span>
          </button>

          {/* Specific Date Picker */}
          <div className="relative inline-flex items-center">
            <label
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                mode === 'CUSTOM'
                  ? 'bg-botanical-500 text-white border-botanical-600 shadow-soft'
                  : 'bg-ivory-100 hover:bg-ivory-200 text-botanical-800 border-ivory-300'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${mode === 'CUSTOM' ? 'text-amber-300' : 'text-botanical-600'}`} />
              <span>{mode === 'CUSTOM' && customDate ? formatFriendlyDate(customDate) : 'Pick Date'}</span>
              <input
                type="date"
                value={customDate || todayStr}
                onChange={(e) => {
                  if (e.target.value) {
                    onCustomDateChange(e.target.value);
                    onModeChange('CUSTOM');
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select a specific day to view past orders"
              />
            </label>
          </div>

          {/* All History */}
          <button
            type="button"
            onClick={() => onModeChange('ALL')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              mode === 'ALL'
                ? 'bg-botanical-500 text-white border-botanical-600 shadow-soft'
                : 'bg-ivory-50 hover:bg-ivory-100 text-botanical-700 border-ivory-200'
            }`}
            title="View all orders across all dates"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All History</span>
            <span className="text-[10px] text-botanical-500 font-semibold">({totalCount})</span>
          </button>
        </div>

        {/* Right Side: Active Filter Status & Reset Pill */}
        <div className="flex items-center gap-2 self-start lg:self-auto text-xs">
          <span className="text-botanical-700 font-medium">Active View:</span>
          <span className="font-extrabold text-botanical-950 bg-ivory-100 px-2.5 py-1 rounded-lg border border-ivory-300">
            {activeDateLabel}
          </span>
          <span className="font-bold text-botanical-800 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
            {filteredCount} {filteredCount === 1 ? 'Order' : 'Orders'}
          </span>

          {mode !== 'TODAY' && (
            <button
              type="button"
              onClick={() => onModeChange('TODAY')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors ml-1"
              title="Return to today's orders"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Today</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
