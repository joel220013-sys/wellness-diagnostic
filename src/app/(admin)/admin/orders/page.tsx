'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Truck, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Eye,
  RefreshCw,
  Plus,
  X,
  FileUp,
  FileText
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { BookingStatus } from '@/types';
import OrderAlertBanner from '@/components/notifications/OrderAlertBanner';
import UploadReportModal from '@/components/reports/UploadReportModal';
import DayFilterControl from '@/components/admin/DayFilterControl';
import { 
  DayFilterMode, 
  getTodayDateStr, 
  getYesterdayDateStr, 
  isBookingMatchingDay, 
  formatFriendlyDate 
} from '@/lib/dateUtils';

export default function AdminOrdersPage() {
  const { bookings, drivers, syncDrivers, syncBookings, addDriver, updateBookingStatus, assignDriverToBooking } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');
  const [dayFilterMode, setDayFilterMode] = useState<DayFilterMode>('TODAY');
  const [customDate, setCustomDate] = useState<string>(getTodayDateStr());
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync latest orders and phlebotomists from database on page mount
  useEffect(() => {
    syncBookings();
    syncDrivers();
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    syncBookings();
    syncDrivers();
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Day filter counts
  const todayCount = bookings.filter((b) => isBookingMatchingDay(b, 'TODAY')).length;
  const tomorrowCount = bookings.filter((b) => isBookingMatchingDay(b, 'TOMORROW')).length;
  const yesterdayCount = bookings.filter((b) => isBookingMatchingDay(b, 'YESTERDAY')).length;

  // Assign driver modal state
  const [assigningBookingId, setAssigningBookingId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [showQuickAddDriver, setShowQuickAddDriver] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickBadge, setQuickBadge] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [assignmentToast, setAssignmentToast] = useState<string | null>(null);

  // Upload report modal state
  const [uploadModalBookingId, setUploadModalBookingId] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchesDay = isBookingMatchingDay(b, dayFilterMode, customDate);
    if (!matchesDay) return false;

    const ref = b.booking_reference || (b as any).order_number || '';
    const pat = b.patient_name || '';
    const matchesSearch =
      ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.items?.some((it) => (it.item_name || '').toLowerCase().includes(searchQuery.toLowerCase())) || false);

    const matchesStatus = statusFilter === 'ALL' || String(b.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesDriver = driverFilter === 'ALL' || b.driver_id === driverFilter || b.assigned_driver_id === driverFilter;

    return matchesSearch && matchesStatus && matchesDriver;
  });

  // Split into Active Orders (in-progress) vs Completed Orders (Report Ready)
  const isCompletedOrder = (b: (typeof bookings)[0]) => {
    const s = String(b.status || '').toLowerCase();
    return s === 'report ready' || s === 'report_ready';
  };

  const activeOrders = filteredBookings.filter((b) => !isCompletedOrder(b));
  const completedOrders = filteredBookings.filter((b) => isCompletedOrder(b));

  // View mode tab state: 'ALL_SECTIONS' (show both), 'ACTIVE_ONLY', 'COMPLETED_ONLY'
  const [ordersViewMode, setOrdersViewMode] = useState<'ALL_SECTIONS' | 'ACTIVE_ONLY' | 'COMPLETED_ONLY'>('ALL_SECTIONS');

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
    const s = String(newStatus).toLowerCase();
    if (s === 'report ready' || s === 'report_ready') {
      setAssignmentToast(`Order marked "Report Ready" and moved to Completed Orders ✓`);
    } else {
      setAssignmentToast(`Order status updated to "${newStatus}"`);
    }
    setTimeout(() => setAssignmentToast(null), 3500);
  };

  const openAssignModal = (bookingId: string) => {
    setAssigningBookingId(bookingId);
    setShowQuickAddDriver(false);
    const foundOrder = bookings.find((b) => b.id === bookingId);
    const existingDriverId = foundOrder?.driver_id || foundOrder?.assigned_driver_id;
    if (existingDriverId && drivers.some((d) => d.id === existingDriverId)) {
      setSelectedDriverId(existingDriverId);
    } else if (drivers.length > 0) {
      setSelectedDriverId(drivers[0].id);
    } else {
      setSelectedDriverId('');
      syncDrivers();
    }
  };

  const handleConfirmAssignment = () => {
    const targetDriverId = selectedDriverId || drivers[0]?.id;
    if (assigningBookingId && targetDriverId) {
      const drv = drivers.find((d) => d.id === targetDriverId);
      assignDriverToBooking(assigningBookingId, targetDriverId);
      setAssignmentToast(`Order assigned to ${drv?.name || 'Phlebotomist'} successfully!`);
      setTimeout(() => setAssignmentToast(null), 3500);
      setAssigningBookingId(null);
    }
  };

  const handleQuickRegisterAndAssign = async () => {
    if (!quickName.trim() || !quickPhone.trim()) {
      alert('Please enter phlebotomist name and phone number.');
      return;
    }
    setQuickLoading(true);
    const res = await addDriver({
      name: quickName.trim(),
      phone: quickPhone.trim(),
      badge_id: quickBadge.trim() || undefined,
    });
    setQuickLoading(false);
    if (res.success && res.data && assigningBookingId) {
      assignDriverToBooking(assigningBookingId, res.data.id);
      setAssignmentToast(`Phlebotomist ${res.data.name} registered and assigned!`);
      setTimeout(() => setAssignmentToast(null), 3500);
      setAssigningBookingId(null);
      setQuickName('');
      setQuickPhone('');
      setQuickBadge('');
      setShowQuickAddDriver(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'report ready':
      case 'report_ready':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'processing':
      case 'sample collected':
      case 'sample_collected':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'assigned':
      case 'collection scheduled':
      case 'collection_scheduled':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'confirmed':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'cancelled':
      case 'failed':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-ivory-100 text-botanical-800 border-ivory-300';
    }
  };

  const renderOrderRow = (booking: (typeof bookings)[0], isCompletedView = false) => {
    const isPending = String(booking.status || '').toLowerCase() === 'pending';
    const isReportReady = String(booking.status || '').toLowerCase().includes('report');

    return (
      <tr 
        key={booking.id} 
        className={`transition-colors ${
          isCompletedView 
            ? 'hover:bg-emerald-50/60 bg-emerald-50/15' 
            : 'hover:bg-ivory-50/60'
        }`}
      >
        <td className="p-3.5 font-bold text-botanical-950">
          <div className="flex items-center gap-1.5">
            {isReportReady && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
            <span>#{booking.booking_reference}</span>
          </div>
        </td>

        <td className="p-3.5">
          <p className="font-bold text-botanical-950">{booking.patient_name}</p>
          <p className="text-[11px] text-botanical-700/80">{booking.patient_phone}</p>
        </td>

        <td className="p-3.5 text-botanical-800">
          <p className="font-semibold">{booking.scheduled_date}</p>
          <p className="text-[11px] text-botanical-600">{booking.scheduled_slot}</p>
        </td>

        <td className="p-3.5 text-botanical-800 truncate max-w-[180px]">
          {booking.address_snapshot?.locality || booking.address_snapshot?.address_line_1 || 'Davangere'}, {booking.address_snapshot?.city || 'Davangere'}
        </td>

        <td className="p-3.5">
          {booking.driver_name || booking.assigned_driver_name ? (
            <div className="inline-flex items-center gap-1.5 font-semibold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200">
              <Truck className="w-3.5 h-3.5 text-sky-700" />
              <span>{booking.driver_name || booking.assigned_driver_name}</span>
              <button
                onClick={() => openAssignModal(booking.id)}
                className="ml-1 text-[10px] text-sky-700 hover:underline font-bold"
                title="Change phlebotomist"
              >
                Change
              </button>
            </div>
          ) : isPending ? (
            <button
              onClick={() => handleStatusChange(booking.id, 'Confirmed')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-soft-xs transition-all flex items-center gap-1 active:scale-95"
              title="Click to confirm this pending order"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Confirm Order</span>
            </button>
          ) : (
            <button
              onClick={() => openAssignModal(booking.id)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Assign Phlebotomist</span>
            </button>
          )}
        </td>

        <td className="p-3.5 font-extrabold text-botanical-950">
          ₹{booking.total_amount}
        </td>

        <td className="p-3.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap inline-flex items-center gap-1 ${getStatusBadge(booking.status)}`}>
            {isReportReady && <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
            <span>{booking.status}</span>
          </span>
        </td>

        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
          <select
            value={booking.status}
            onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
            className="px-2 py-1 rounded-lg border border-ivory-300 text-[11px] font-semibold bg-white text-botanical-950"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Assigned">Assigned</option>
            <option value="Collection Scheduled">Collection Scheduled</option>
            <option value="Sample Collected">Sample Collected</option>
            <option value="Processing">Processing</option>
            <option value="Report Ready">Report Ready</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setUploadModalBookingId(booking.id)}
            className={`inline-flex items-center gap-1 p-1.5 rounded-lg transition-colors ${
              isReportReady 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft-xs' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
            title="Upload / Manage Lab Report PDF"
          >
            <FileUp className="w-3.5 h-3.5" />
          </button>

          <Link
            href={`/admin/orders/${booking.id}`}
            className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-botanical-800"
            title="Inspect order details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {assignmentToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-soft-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{assignmentToast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Diagnostic Orders Management</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Control order statuses, driver assignments, phlebotomy tracking, and clinical records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-ivory-300 text-botanical-800 hover:bg-ivory-100 text-xs font-bold shadow-soft-sm transition-all disabled:opacity-50"
            title="Sync live bookings and phlebotomists"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-botanical-600' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Fleet & Orders'}</span>
          </button>

          <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-botanical-100 text-botanical-900 border border-botanical-200">
            Total Orders: {bookings.length}
          </div>
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
        filteredCount={filteredBookings.length}
        totalCount={bookings.length}
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-botanical-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-botanical-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white text-botanical-950"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Assigned">Assigned</option>
            <option value="Collection Scheduled">Collection Scheduled</option>
            <option value="Sample Collected">Sample Collected</option>
            <option value="Processing">Processing</option>
            <option value="Report Ready">Report Ready</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white text-botanical-950"
          >
            <option value="ALL">All Phlebotomists ({drivers.length})</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.badge_id || 'PHLEB'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section View Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-ivory-200/80 rounded-2xl border border-ivory-300 text-xs font-bold w-fit">
          <button
            type="button"
            onClick={() => setOrdersViewMode('ALL_SECTIONS')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              ordersViewMode === 'ALL_SECTIONS'
                ? 'bg-botanical-500 text-white shadow-soft-xs'
                : 'text-botanical-800 hover:bg-ivory-100'
            }`}
          >
            All Sections ({filteredBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setOrdersViewMode('ACTIVE_ONLY')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              ordersViewMode === 'ACTIVE_ONLY'
                ? 'bg-botanical-500 text-white shadow-soft-xs'
                : 'text-botanical-800 hover:bg-ivory-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>In-Progress ({activeOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setOrdersViewMode('COMPLETED_ONLY')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              ordersViewMode === 'COMPLETED_ONLY'
                ? 'bg-emerald-600 text-white shadow-soft-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed Orders ({completedOrders.length})</span>
          </button>
        </div>

        <p className="text-xs text-botanical-700/80">
          • Orders marked &quot;Report Ready&quot; automatically move to the Completed section.
        </p>
      </div>

      {/* When 0 total bookings for this day/filter */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm p-12 text-center">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-ivory-200 text-botanical-700 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-botanical-950">
              No orders found for this view
            </h3>
            <p className="text-xs text-botanical-700/80">
              {dayFilterMode === 'TODAY'
                ? 'No home blood collection appointments or bookings scheduled for today yet.'
                : 'There are no patient orders matching the chosen date or search criteria.'}
            </p>
            {dayFilterMode !== 'TODAY' && (
              <button
                type="button"
                onClick={() => {
                  setDayFilterMode('TODAY');
                  setStatusFilter('ALL');
                  setDriverFilter('ALL');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
              >
                <span>Return to Today&apos;s Orders</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: Active In-Progress Orders */}
          {(ordersViewMode === 'ALL_SECTIONS' || ordersViewMode === 'ACTIVE_ONLY') && (
            <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm overflow-hidden">
              <div className="p-4 sm:p-5 bg-ivory-50/70 border-b border-ivory-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-botanical-950">
                      Active Orders In-Progress ({activeOrders.length})
                    </h2>
                    <p className="text-[11px] text-botanical-700/80">
                      Orders requiring confirmation, phlebotomy dispatch, or laboratory processing
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
                  {activeOrders.length} In-Progress
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100/80 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
                    <tr>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Patient Details</th>
                      <th className="p-3.5">Collection Slot</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Assigned Phlebotomist</th>
                      <th className="p-3.5">Amount (₹)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-100">
                    {activeOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-xs text-botanical-700/80 bg-ivory-50/50">
                          ✓ All active orders on this view have been processed and moved to Completed Orders below!
                        </td>
                      </tr>
                    ) : (
                      activeOrders.map((booking) => renderOrderRow(booking, false))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 2: Completed Orders (Report Ready) */}
          {(ordersViewMode === 'ALL_SECTIONS' || ordersViewMode === 'COMPLETED_ONLY') && (
            <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-soft-sm overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-emerald-100/30 to-white border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-soft-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-emerald-950">
                      Completed Orders — Report Ready ({completedOrders.length})
                    </h2>
                    <p className="text-[11px] text-emerald-800/80">
                      Diagnostic tests verified and reports published for patients
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 self-start sm:self-auto">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{completedOrders.length} Completed</span>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50/60 text-emerald-950 font-bold uppercase tracking-wider border-b border-emerald-200">
                    <tr>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Patient Details</th>
                      <th className="p-3.5">Collection Slot</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Phlebotomist</th>
                      <th className="p-3.5">Amount (₹)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/60">
                    {completedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-xs text-botanical-700/80 bg-emerald-50/20">
                          No orders marked as &quot;Report Ready&quot; on this view yet. Once you set an order to &quot;Report Ready&quot;, it will automatically move here.
                        </td>
                      </tr>
                    ) : (
                      completedOrders.map((booking) => renderOrderRow(booking, true))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Driver Assignment Modal */}
      {assigningBookingId && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-soft-lg border border-ivory-300">
            <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-botanical-600" />
                <h3 className="text-base font-bold text-botanical-950">Assign Phlebotomist to Collection</h3>
              </div>
              <button
                onClick={() => setAssigningBookingId(null)}
                className="p-1 rounded-lg text-botanical-400 hover:text-botanical-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-botanical-700/80">
              Select certified phlebotomist with cold-chain transportation for order #{bookings.find((b) => b.id === assigningBookingId)?.booking_reference}.
            </p>

            {drivers.length === 0 && !showQuickAddDriver ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>No Phlebotomist Staff in Directory</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  No active phlebotomists were found in your fleet. You can immediately load certified phlebotomists or register a phlebotomist below.
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => syncDrivers()}
                    className="px-3.5 py-1.5 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white font-bold text-xs shadow-soft-sm transition-all"
                  >
                    ⚡ Load Certified Phlebotomists
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddDriver(true)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold text-xs transition-all"
                  >
                    + Quick Register Staff
                  </button>
                </div>
              </div>
            ) : showQuickAddDriver ? (
              <div className="p-4 bg-ivory-50 rounded-2xl border border-ivory-300 text-xs space-y-3">
                <div className="flex items-center justify-between font-bold text-botanical-950">
                  <span>Quick Register Phlebotomist</span>
                  {drivers.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setShowQuickAddDriver(false)}
                      className="text-[11px] text-botanical-600 hover:underline"
                    >
                      Select from list
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-botanical-900 mb-0.5">Phlebotomist Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-ivory-300 text-xs text-botanical-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-botanical-900 mb-0.5">Mobile Phone *</label>
                    <input
                      type="text"
                      placeholder="+91 98111 22334"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-ivory-300 text-xs text-botanical-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-botanical-900 mb-0.5">Badge ID (optional)</label>
                    <input
                      type="text"
                      placeholder="WD-PHLEB-DEL-01"
                      value={quickBadge}
                      onChange={(e) => setQuickBadge(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-ivory-300 text-xs text-botanical-950 font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={quickLoading}
                  onClick={handleQuickRegisterAndAssign}
                  className="w-full py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all"
                >
                  {quickLoading ? 'Registering & Assigning...' : 'Save & Assign Phlebotomist'}
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-botanical-900">Select Available Phlebotomist</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddDriver(true)}
                    className="text-[11px] font-bold text-botanical-600 hover:text-botanical-800"
                  >
                    + Register New Staff
                  </button>
                </div>
                <select
                  value={selectedDriverId || drivers[0]?.id || ''}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 text-xs font-semibold bg-white text-botanical-950 focus:ring-2 focus:ring-botanical-500"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.badge_id || 'PHLEB'}) • 📞 {d.phone} • {d.assigned_orders_count || 0} active collections
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-ivory-200">
              <button
                type="button"
                onClick={() => setAssigningBookingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-botanical-700 hover:bg-ivory-100"
              >
                Cancel
              </button>
              {drivers.length > 0 && !showQuickAddDriver && (
                <button
                  type="button"
                  onClick={handleConfirmAssignment}
                  className="px-5 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
                >
                  Confirm Assignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Lab Report Modal */}
      <UploadReportModal
        isOpen={Boolean(uploadModalBookingId)}
        onClose={() => setUploadModalBookingId(null)}
        preselectedBookingId={uploadModalBookingId || undefined}
      />
    </div>
  );
}
