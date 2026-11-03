import { Booking } from '@/types';

/**
 * Returns today's date in YYYY-MM-DD format (local time)
 */
export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date in YYYY-MM-DD format (local time)
 */
export function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts any Date object to YYYY-MM-DD format in local timezone
 */
export function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extracts normalized YYYY-MM-DD date strings from booking's scheduled_date and created_at
 */
export function getBookingNormalizedDates(booking: Booking): { scheduledDateStr: string; createdDateStr: string } {
  let scheduledDateStr = '';
  if (booking.scheduled_date) {
    const match = String(booking.scheduled_date).match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      scheduledDateStr = match[1];
    } else {
      const parsed = new Date(booking.scheduled_date);
      if (!isNaN(parsed.getTime())) {
        scheduledDateStr = toLocalDateStr(parsed);
      }
    }
  }

  let createdDateStr = '';
  if (booking.created_at) {
    const parsed = new Date(booking.created_at);
    if (!isNaN(parsed.getTime())) {
      createdDateStr = toLocalDateStr(parsed);
    }
  }

  return { scheduledDateStr, createdDateStr };
}

export type DayFilterMode = 'TODAY' | 'YESTERDAY' | 'CUSTOM' | 'ALL';

/**
 * Determines whether a booking matches the selected day filter mode.
 * Matches if scheduled collection date OR order creation date falls on target date.
 */
export function isBookingMatchingDay(booking: Booking, mode: DayFilterMode, customDate?: string): boolean {
  if (mode === 'ALL') return true;

  const targetDate =
    mode === 'TODAY'
      ? getTodayDateStr()
      : mode === 'YESTERDAY'
      ? getYesterdayDateStr()
      : customDate || getTodayDateStr();

  const { scheduledDateStr, createdDateStr } = getBookingNormalizedDates(booking);
  return scheduledDateStr === targetDate || createdDateStr === targetDate;
}

/**
 * Formats a YYYY-MM-DD string into a friendly readable label (e.g., "Tue, Nov 3, 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
