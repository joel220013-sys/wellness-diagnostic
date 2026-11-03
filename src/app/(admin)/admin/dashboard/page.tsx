'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ChevronRight, 
  MapPin, 
  Users, 
  CalendarDays,
  Sparkles,
  CheckCircle2,
  BellRing,
  Phone,
  MessageSquare,
  Clock,
  Calendar
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
import { 
  playOrderChime, 
  isMasterAlertsEnabled, 
  isSoundAlertsEnabled 
} from '@/lib/notificationService';
import { getWhatsAppDirectUrl } from '@/lib/whatsappService';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { bookings, reports, invoices, drivers, updateBookingStatus } = useData();
  const [dashboardToast, setDashboardToast] = useState<string | null>(null);

  // Day filter state: defaults strictly to TODAY
  const [dayFilterMode, setDayFilterMode] = useState<DayFilterMode>('TODAY');
  const [customDate, setCustomDate] = useState<string>(getTodayDateStr());

  // All pending orders across the clinic awaiting admin confirmation (pinned until confirmed)
  const allPendingOrders = bookings.filter((b) => String(b.status || '').toLowerCase() === 'pending');

  const handleConfirmOrder = (bookingId: string) => {
    updateBookingStatus(bookingId, 'Confirmed');
    const order = bookings.find((b) => b.id === bookingId);
    setDashboardToast(`Order #${order?.booking_reference || bookingId} confirmed! Phlebotomist can now be assigned.`);
    setTimeout(() => setDashboardToast(null), 3500);
  };

  const handleConfirmAllPending = () => {
    allPendingOrders.forEach((b) => {
      updateBookingStatus(b.id, 'Confirmed');
    });
    setDashboardToast(`All ${allPendingOrders.length} pending orders confirmed successfully!`);
    setTimeout(() => setDashboardToast(null), 3500);
  };

  // Periodic reminder chime for unconfirmed pending orders (every 90s)
  useEffect(() => {
    if (allPendingOrders.length === 0) return;
    const interval = setInterval(() => {
      if (isMasterAlertsEnabled() && isSoundAlertsEnabled()) {
        playOrderChime();
      }
    }, 90000);
    return () => clearInterval(interval);
  }, [allPendingOrders.length]);

  // Counts for Day filter badges
  const todayCount = bookings.filter((b) => isBookingMatchingDay(b, 'TODAY')).length;
  const tomorrowCount = bookings.filter((b) => isBookingMatchingDay(b, 'TOMORROW')).length;
  const yesterdayCount = bookings.filter((b) => isBookingMatchingDay(b, 'YESTERDAY')).length;

  // Active bookings filtered by chosen day (Today by default, past day only if explicitly chosen)
  const activeBookings = bookings.filter((b) => isBookingMatchingDay(b, dayFilterMode, customDate));

  // Metrics dynamically derived from the active day's orders
  const totalActiveOrders = activeBookings.length;
  const pendingConfirmation = activeBookings.filter((b) => String(b.status || '').toLowerCase() === 'pending').length;
  const assignedJobs = activeBookings.filter((b) => ['assigned', 'collection scheduled', 'collection_scheduled'].includes(String(b.status || '').toLowerCase())).length;
  const collectionsCompleted = activeBookings.filter((b) => ['sample collected', 'sample_collected', 'processing', 'report ready', 'report_ready'].includes(String(b.status || '').toLowerCase())).length;
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
      {/* Toast Notification */}
      {dashboardToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-soft-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{dashboardToast}</span>
        </div>
      )}

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

      {/* Pinned Action Queue: Incoming Orders Awaiting Admin Confirmation */}
      {allPendingOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-500/10 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-soft-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-soft flex-shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-botanical-950">
                    Orders Awaiting Confirmation ({allPendingOrders.length})
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white tracking-wider">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-botanical-700/80 mt-0.5">
                  These patient bookings will remain pinned here until you click Confirm. They will not be dismissed or lost.
                </p>
              </div>
            </div>

            {allPendingOrders.length > 1 && (
              <button
                type="button"
                onClick={handleConfirmAllPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-soft transition-all active:scale-95 self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Confirm All ({allPendingOrders.length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {allPendingOrders.map((booking) => {
              const cleanPhone = booking.patient_phone || '';
              const whatsappUrl = getWhatsAppDirectUrl({
                orderId: booking.id,
                reference: booking.booking_reference,
                patientName: booking.patient_name,
                phone: cleanPhone,
                totalAmount: booking.total_amount,
                testName: booking.tests?.[0]?.name || booking.items?.[0]?.item_name || 'Diagnostic Package',
                timeSlot: `${booking.scheduled_date} • ${booking.scheduled_slot}`,
              });

              return (
                <div 
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 border border-amber-300 shadow-soft-sm hover:shadow-soft transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-botanical-950">
                          #{booking.booking_reference}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Pending Confirmation
                        </span>
                      </div>
                      <p className="font-bold text-xs text-botanical-900 mt-1">
                        {booking.patient_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-botanical-950">
                        ₹{booking.total_amount}
                      </span>
                      <p className="text-[10px] text-botanical-600 font-medium">
                        {booking.payment_method || 'Cash on Collection'}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-ivory-100/70 rounded-xl border border-ivory-200 text-[11px] space-y-1 text-botanical-800">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-botanical-500 flex-shrink-0" />
                      <span>{booking.scheduled_date}</span>
                      <span className="text-botanical-400">•</span>
                      <Clock className="w-3.5 h-3.5 text-botanical-500 flex-shrink-0" />
                      <span className="truncate">{booking.scheduled_slot}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-botanical-500 flex-shrink-0" />
                      <span className="truncate">
                        {booking.address_snapshot?.locality || booking.address_snapshot?.address_line_1 || 'Home Collection Address'}, {booking.address_snapshot?.city || 'Davangere'}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-botanical-900 pt-0.5 truncate">
                      Tests: {booking.tests?.length ? booking.tests.map((t) => t.name).join(', ') : booking.items?.length ? booking.items.map((it) => it.item_name).join(', ') : 'Diagnostic Profile'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-ivory-200">
                    <div className="flex items-center gap-1.5">
                      {cleanPhone && (
                        <>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-800 text-[11px] font-semibold border border-ivory-300 transition-colors"
                            title="Call Patient"
                          >
                            <Phone className="w-3 h-3 text-botanical-600" />
                            <span className="hidden sm:inline">Call</span>
                          </a>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${booking.id}`}
                        className="px-2.5 py-1.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-800 text-xs font-semibold border border-ivory-300 transition-colors"
                      >
                        Inspect
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleConfirmOrder(booking.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-soft transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Confirm Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap inline-flex items-center gap-1 ${
                        String(booking.status || '').toLowerCase() === 'pending'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : String(booking.status || '').toLowerCase() === 'confirmed'
                          ? 'bg-teal-100 text-teal-900 border-teal-300'
                          : String(booking.status || '').toLowerCase() === 'assigned'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : String(booking.status || '').toLowerCase().includes('report')
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-ivory-200 text-botanical-800 border-ivory-300'
                      }`}>
                        {String(booking.status || '').toLowerCase().includes('report') && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        )}
                        <span>{booking.status}</span>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {String(booking.status || '').toLowerCase() === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmOrder(booking.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft-xs transition-all active:scale-95"
                            title="Confirm this pending order"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Confirm</span>
                          </button>
                          <Link
                            href={`/admin/orders/${booking.id}`}
                            className="inline-flex items-center gap-0.5 text-xs font-semibold text-botanical-600 hover:text-botanical-800"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href={`/admin/orders/${booking.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-botanical-600 hover:text-botanical-800"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
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
