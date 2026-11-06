'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Navigation, 
  ChevronRight, 
  Calendar,
  Sparkles,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import DayFilterControl from '@/components/admin/DayFilterControl';
import { 
  DayFilterMode, 
  getTodayDateStr, 
  getYesterdayDateStr, 
  getTomorrowDateStr,
  isBookingMatchingDay, 
  formatFriendlyDate 
} from '@/lib/dateUtils';

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const { bookings, updateBookingStatus, syncBookings } = useData();

  // Day filter state: defaults strictly to TODAY, same as Admin Dashboard
  const [dayFilterMode, setDayFilterMode] = useState<DayFilterMode>('TODAY');
  const [customDate, setCustomDate] = useState<string>(getTodayDateStr());

  // Live polling so newly assigned orders from admin appear in real-time
  useEffect(() => {
    if (syncBookings) {
      syncBookings();
      const interval = setInterval(() => {
        syncBookings();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [syncBookings]);

  // STRICT ISOLATION: Driver only sees jobs assigned to their account (or demo driver)
  const allAssignedJobs = bookings.filter((b) => 
    b.driver_id === user?.id || 
    b.driver_name === user?.name ||
    user?.email === 'driver@wellness.com'
  );

  // Day filter counts for driver badges (Today, Tomorrow, Yesterday)
  const todayCount = allAssignedJobs.filter((b) => isBookingMatchingDay(b, 'TODAY')).length;
  const tomorrowCount = allAssignedJobs.filter((b) => isBookingMatchingDay(b, 'TOMORROW')).length;
  const yesterdayCount = allAssignedJobs.filter((b) => isBookingMatchingDay(b, 'YESTERDAY')).length;

  // Active filtered jobs matching chosen Day Filter
  const assignedJobs = allAssignedJobs.filter((b) => isBookingMatchingDay(b, dayFilterMode, customDate));

  const pendingPickups = assignedJobs.filter((b) =>
    ['Assigned', 'Collection Scheduled', 'Confirmed', 'Pending'].includes(b.status)
  );

  const completedToday = assignedJobs.filter((b) =>
    ['Sample Collected', 'Processing', 'Report Ready'].includes(b.status)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Driver Cockpit Header */}
      <div className="bg-gradient-to-r from-sky-900 to-botanical-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-soft">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Mobile Phlebotomy Cockpit</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300">Cold Chain Active (4°C)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Phlebotomist'}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/80">
            Badge ID: <strong className="font-mono text-white">{user?.badgeId || '001'}</strong> • Vehicle: Mobile Lab Van 04
          </p>
        </div>
      </div>

      {/* Date Filter Bar (Today, Tomorrow, Yesterday, Pick Date, All) - Same as Admin */}
      <DayFilterControl
        mode={dayFilterMode}
        customDate={customDate}
        onModeChange={setDayFilterMode}
        onCustomDateChange={setCustomDate}
        todayCount={todayCount}
        tomorrowCount={tomorrowCount}
        yesterdayCount={yesterdayCount}
        filteredCount={assignedJobs.length}
        totalCount={allAssignedJobs.length}
      />

      {/* 3 Metric Touch Cards for the selected day */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm text-center">
          <span className="text-[11px] font-semibold text-botanical-700">
            {dayFilterMode === 'TODAY'
              ? 'Today Assigned'
              : dayFilterMode === 'TOMORROW'
              ? 'Tomorrow Assigned'
              : dayFilterMode === 'YESTERDAY'
              ? 'Yesterday Assigned'
              : 'Assigned Pickups'}
          </span>
          <p className="text-2xl font-extrabold text-botanical-950 mt-1">{assignedJobs.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-soft-sm text-center">
          <span className="text-[11px] font-semibold text-amber-800">Pending Pickup</span>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">{pendingPickups.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-soft-sm text-center">
          <span className="text-[11px] font-semibold text-emerald-800">
            {dayFilterMode === 'YESTERDAY'
              ? 'Collected Yesterday'
              : dayFilterMode === 'TOMORROW'
              ? 'Completed Ahead'
              : 'Collected Today'}
          </span>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">{completedToday.length}</p>
        </div>
      </div>

      {/* Phlebotomy Queue List filtered by Selected Day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-botanical-950 flex items-center gap-2">
              <span>
                {dayFilterMode === 'TODAY'
                  ? "Today's Phlebotomy Queue"
                  : dayFilterMode === 'TOMORROW'
                  ? "Tomorrow's Scheduled Pickups"
                  : dayFilterMode === 'YESTERDAY'
                  ? "Yesterday's Completed & Past Pickups"
                  : dayFilterMode === 'CUSTOM'
                  ? `Pickups for ${formatFriendlyDate(customDate)}`
                  : 'All Assigned Historical Pickups'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-botanical-100 text-botanical-900 border border-botanical-200">
                {assignedJobs.length}
              </span>
            </h2>
            <p className="text-xs text-botanical-700/80">
              {dayFilterMode === 'TOMORROW'
                ? "Advance patient bookings scheduled for tomorrow morning"
                : dayFilterMode === 'YESTERDAY'
                ? "Patient home sample visits completed or scheduled yesterday"
                : "Your assigned patient visits for home sample collection"}
            </p>
          </div>
          <Link
            href="/driver/assignments"
            className="text-xs font-bold text-botanical-600 hover:text-botanical-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {assignedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-ivory-300 text-center space-y-3 shadow-soft-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-botanical-950">
              {dayFilterMode === 'TODAY'
                ? 'No Pending Pickups Assigned for Today'
                : dayFilterMode === 'TOMORROW'
                ? 'No Advance Pickups Scheduled for Tomorrow'
                : dayFilterMode === 'YESTERDAY'
                ? 'No Pickups Recorded for Yesterday'
                : 'No Pickups Found for this Selection'}
            </h3>
            <p className="text-xs text-botanical-700/70 max-w-sm mx-auto">
              {dayFilterMode === 'TOMORROW'
                ? 'Any patient bookings scheduled for tomorrow will appear here as soon as they are assigned to your badge.'
                : dayFilterMode === 'YESTERDAY'
                ? 'No past collections recorded under your badge for yesterday.'
                : 'You are currently caught up with all assigned collections. New home sample collection jobs dispatched by the diagnostic hub will appear here immediately.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-ivory-200 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-botanical-950">#{job.booking_reference}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {job.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ivory-200 text-botanical-800 border border-ivory-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-botanical-600" />
                      <span>{formatFriendlyDate(String(job.scheduled_date || job.created_at || ''))}</span>
                    </span>
                  </div>

                  <span className="text-xs font-bold text-botanical-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Slot: {job.scheduled_slot}</span>
                  </span>
                </div>

                <div className="space-y-1 text-xs text-botanical-800">
                  <p className="text-sm font-bold text-botanical-950">{job.patient_name}</p>
                  <p className="text-botanical-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-botanical-500" />
                    <span>{job.patient_phone}</span>
                  </p>
                  <p className="flex items-start gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-botanical-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {job.address_snapshot?.address_line_1}, {job.address_snapshot?.locality}, {job.address_snapshot?.city}
                    </span>
                  </p>
                </div>

                {/* Diagnostic Tests to Draw & Payment Badge */}
                <div className="pt-2 border-t border-ivory-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-botanical-900">
                      Tests ({(job.items?.length || job.tests?.length || 1)}):
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      job.payment_status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {job.payment_status === 'Paid' ? '✓ Prepaid' : `💵 Collect ₹${job.total_amount}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(job.items && job.items.length > 0 
                      ? job.items.map((i) => i.item_name) 
                      : (job.tests && job.tests.length > 0 
                        ? job.tests.map((t) => t.name) 
                        : ['Diagnostic Test Profile'])
                    ).map((testName, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 rounded-lg bg-ivory-100 text-[10px] font-bold text-botanical-950 border border-ivory-200 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{testName}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mobile Touch Action Button */}
                <div className="pt-2">
                  <Link
                    href={`/driver/assignments/${job.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all active:scale-[0.98]"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Open Collection Task File</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
