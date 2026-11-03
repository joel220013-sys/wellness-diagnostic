'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ChevronRight, 
  MapPin, 
  Users, 
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import OrderAlertBanner from '@/components/notifications/OrderAlertBanner';
import DayFilterControl from '@/components/admin/DayFilterControl';
import { 
  DayFilterMode, 
  getTodayDateStr, 
  getYesterdayDateStr, 
  isBookingMatchingDay,
  formatFriendlyDate 
} from '@/lib/dateUtils';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { bookings, reports, invoices, drivers } = useData();

  // Day filter state: defaults strictly to TODAY
  const [dayFilterMode, setDayFilterMode] = useState<DayFilterMode>('TODAY');
  const [customDate, setCustomDate] = useState<string>(getTodayDateStr());

  // Counts for Day filter badges
  const todayCount = bookings.filter((b) => isBookingMatchingDay(b, 'TODAY')).length;
  const tomorrowCount = bookings.filter((b) => isBookingMatchingDay(b, 'TOMORROW')).length;
  const yesterdayCount = bookings.filter((b) => isBookingMatchingDay(b, 'YESTERDAY')).length;

  // Active bookings filtered by chosen day (Today by default, past day only if explicitly chosen)
  const activeBookings = bookings.filter((b) => isBookingMatchingDay(b, dayFilterMode, customDate));

  // Metrics dynamically derived from the active day's orders
  const totalActiveOrders = activeBookings.length;
  const pendingConfirmation = activeBookings.filter((b) => b.status === 'Pending').length;
  const assignedJobs = activeBookings.filter((b) => ['Assigned', 'Collection Scheduled'].includes(b.status)).length;
  const collectionsCompleted = activeBookings.filter((b) => ['Sample Collected', 'Processing', 'Report Ready'].includes(b.status)).length;
  const reportsReady = dayFilterMode === 'ALL'
    ? reports.length
    : reports.filter((r) => activeBookings.some((b) => b.id === r.booking_id || b.booking_reference === r.booking_reference)).length;

  // Day revenue
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const paidRevenue = activeBookings
    .filter((b) => b.payment_status === 'Paid' || b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const activeDayLabel =
    dayFilterMode === 'TODAY'
      ? "Today's Orders"
      : dayFilterMode === 'TOMORROW'
      ? "Tomorrow's Orders"
      : dayFilterMode === 'YESTERDAY'
      ? "Yesterday's Orders"
      : dayFilterMode === 'CUSTOM'
      ? `Orders for ${formatFriendlyDate(customDate)}`
      : 'All Historical Orders';

  return (
    <div className="space-y-6 pb-12">
      {/* Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950">
            Laboratory Operations Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Real-time home phlebotomy dispatch, order intake, pathology turnarounds & revenue in INR
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/assignments"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-950 font-bold text-xs border border-ivory-300 shadow-soft-sm"
          >
            <Users className="w-4 h-4 text-botanical-600" />
            <span>Phlebotomist Dispatch</span>
          </Link>
          <Link
            href="/admin/map"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-950 font-bold text-xs border border-ivory-300 shadow-soft-sm"
          >
            <MapPin className="w-4 h-4 text-botanical-600" />
            <span>Live Dispatch Map</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Live Order Audio & Push Alert Banner with Master and Chime ON/OFF Toggles */}
      <OrderAlertBanner />

      {/* Primary Date Filter Bar */}
      <DayFilterControl
        mode={dayFilterMode}
        customDate={customDate}
        onModeChange={setDayFilterMode}
        onCustomDateChange={setCustomDate}
        todayCount={todayCount}
        tomorrowCount={tomorrowCount}
        yesterdayCount={yesterdayCount}
        filteredCount={totalActiveOrders}
        totalCount={bookings.length}
      />

      {/* 6 Key Operational Metrics (Filtered strictly by selected day) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-botanical-700">Total Orders</span>
          <p className="text-2xl font-extrabold text-botanical-950 mt-1">{totalActiveOrders}</p>
          <span className="text-[10px] text-botanical-600 font-medium">
            {dayFilterMode === 'TODAY' ? "Today's bookings" : activeDayLabel}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-amber-800">Pending Action</span>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">{pendingConfirmation}</p>
          <span className="text-[10px] text-amber-700 font-medium">Needs confirmation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-blue-800">Assigned / In Transit</span>
          <p className="text-2xl font-extrabold text-blue-950 mt-1">{assignedJobs}</p>
          <span className="text-[10px] text-blue-700 font-medium">Active phlebotomists</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-purple-800">Samples Collected</span>
          <p className="text-2xl font-extrabold text-purple-950 mt-1">{collectionsCompleted}</p>
          <span className="text-[10px] text-purple-700 font-medium">Lab processing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-emerald-800">Reports Released</span>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">{reportsReady}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Pathology signed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-peach-200 bg-peach-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-botanical-900">Total Billed</span>
          <p className="text-2xl font-extrabold text-botanical-950 mt-1">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-700 font-bold">₹{paidRevenue.toLocaleString()} Paid</span>
        </div>
      </div>

      {/* Orders Intake Feed for Selected Day */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-botanical-950">{activeDayLabel} Feed</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-botanical-100 text-botanical-800">
                {totalActiveOrders} {totalActiveOrders === 1 ? 'Order' : 'Orders'}
              </span>
            </div>
            <p className="text-xs text-botanical-700/80">
              {dayFilterMode === 'TODAY'
                ? "Live feed of today's incoming patient orders and home collections"
                : `Showing verified patient orders recorded for this day`}
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-botanical-600 hover:text-botanical-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Orders Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3 bg-ivory-50/50 rounded-2xl border border-dashed border-ivory-300">
            <div className="w-12 h-12 bg-ivory-200 text-botanical-700 rounded-full flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-botanical-950">
              No orders found for {activeDayLabel}
            </h3>
            <p className="text-xs text-botanical-700/80 max-w-sm mx-auto">
              {dayFilterMode === 'TODAY'
                ? 'No home blood collection appointments or bookings scheduled for today yet.'
                : 'There are no patient orders scheduled or booked on this selected day.'}
            </p>
            {dayFilterMode !== 'TODAY' && (
              <button
                type="button"
                onClick={() => setDayFilterMode('TODAY')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Return to Today&apos;s Orders</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/80 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Scheduled Slot</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Tests</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100">
                {activeBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-ivory-50/50 transition-colors">
                    <td className="p-3 font-bold text-botanical-950">#{booking.booking_reference}</td>
                    <td className="p-3">
                      <p className="font-semibold text-botanical-950">{booking.patient_name}</p>
                      {booking.patient_phone && (
                        <p className="text-[10px] text-botanical-600 font-medium">{booking.patient_phone}</p>
                      )}
                    </td>
                    <td className="p-3 text-botanical-700/80">
                      {booking.scheduled_date} <br />
                      <span className="text-[10px] text-botanical-600 font-medium">{booking.scheduled_slot}</span>
                    </td>
                    <td className="p-3 text-botanical-700/80 truncate max-w-[150px]">
                      {booking.address_snapshot?.locality || booking.address_snapshot?.street || 'Home Address'}, {booking.address_snapshot?.city || 'Davangere'}
                    </td>
                    <td className="p-3 text-botanical-800">
                      {booking.tests?.length ? booking.tests[0].name : booking.items?.length ? booking.items[0].item_name : 'Diagnostic Test'}
                      {((booking.tests?.length || booking.items?.length || 1) > 1) && (
                        <span className="text-[10px] text-botanical-500 ml-1">
                          (+{((booking.tests?.length || booking.items?.length || 1) - 1)})
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-botanical-950">₹{booking.total_amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ivory-200 text-botanical-800 border border-ivory-300">
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/orders/${booking.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-botanical-600 hover:text-botanical-800"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
