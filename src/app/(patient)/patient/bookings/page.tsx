'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Truck, 
  Phone, 
  MessageSquare, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  CalendarPlus, 
  Ban,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react';
import { downloadReportFile } from '@/lib/downloadUtils';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { BookingStatus } from '@/types';

export default function PatientBookingsPage() {
  const { user } = useAuth();
  const { bookings, drivers, reports, updateBookingStatus, selectedTests, syncBookings } = useData();
  const [downloadingBookingId, setDownloadingBookingId] = useState<string | null>(null);

  const handleDownloadReport = async (b: any) => {
    const rep = reports.find(
      (r) =>
        (b.report_id && r.id === b.report_id) ||
        r.booking_id === b.id ||
        r.order_id === b.id ||
        (r as any).booking_reference === b.booking_reference
    );
    if (!rep) {
      // Direct report request using booking reference or id
      try {
        setDownloadingBookingId(b.id);
        await downloadReportFile({ id: b.id, report_number: b.booking_reference });
      } finally {
        setTimeout(() => setDownloadingBookingId(null), 1000);
      }
      return;
    }
    try {
      setDownloadingBookingId(b.id);
      await downloadReportFile(rep);
    } catch (err) {
      console.error('Download report error:', err);
    } finally {
      setTimeout(() => setDownloadingBookingId(null), 1000);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    syncBookings();
  }, []);

  // Filter for this patient by ID, Name, or Phone
  const patientBookings = bookings.filter(
    (b) => 
      b.patient_id === user?.id || 
      (user?.name && b.patient_name?.toLowerCase() === user.name.toLowerCase()) || 
      (user?.phone && b.patient_phone && b.patient_phone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) ||
      user?.email === 'patient@wellness.com'
  );

  const filteredBookings = patientBookings.filter((b) => {
    const matchesSearch = 
      b.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.items || []).some((it) => it.item_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Report Ready':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Processing':
      case 'Sample Collected':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Assigned':
      case 'Collection Scheduled':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Confirmed':
        return 'bg-teal-100 text-teal-900 border-teal-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Cancelled':
      case 'Failed':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      default:
        return 'bg-ivory-100 text-botanical-800 border-ivory-300';
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this home sample collection appointment?')) {
      updateBookingStatus(bookingId, 'Cancelled');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">My Booking History</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Track status progression, view phlebotomist assignments, and access reports
          </p>
        </div>

        <Link
          href={selectedTests.length > 0 ? '/patient/book' : '/patient/tests'}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>{selectedTests.length > 0 ? `Book Collection (${selectedTests.length} in Cart)` : 'Book New Collection'}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-botanical-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference or test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-botanical-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'Pending', 'Confirmed', 'Assigned', 'Sample Collected', 'Report Ready', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-botanical-500 text-white font-bold shadow-soft-sm'
                  : 'bg-ivory-100 text-botanical-800 hover:bg-ivory-200 border border-ivory-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-ivory-300 text-center space-y-3 shadow-soft-sm">
          <Calendar className="w-12 h-12 text-botanical-300 mx-auto" />
          <h3 className="text-base font-bold text-botanical-950">No Bookings Found</h3>
          <p className="text-xs text-botanical-700/70 max-w-sm mx-auto">
            No collection bookings match your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const assignedDriver = drivers.find((d) => 
              (booking.driver_id && d.id === booking.driver_id) || 
              (booking.assigned_driver_id && d.id === booking.assigned_driver_id) ||
              (booking.driver_name && d.name.toLowerCase() === booking.driver_name.toLowerCase())
            );
            const driverName = assignedDriver?.name || booking.driver_name || booking.assigned_driver_name;
            const driverPhone = assignedDriver?.phone || booking.driver_phone;

            return (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-botanical-950">
                      #{booking.booking_reference}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-botanical-700/80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-botanical-500" />
                      {booking.scheduled_date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-botanical-500" />
                      {booking.scheduled_slot}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-lg font-extrabold text-botanical-950">₹{booking.total_amount}</p>
                  <span className="text-[11px] font-semibold text-botanical-600">
                    Payment: {booking.payment_status}
                  </span>
                </div>
              </div>

              {/* Items & Address details */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-botanical-900 mb-1.5">Diagnostic Tests Booked:</p>
                  <ul className="space-y-1 text-botanical-800">
                    {(booking.items || []).map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>• {it.item_name}</span>
                        <span className="font-semibold text-botanical-950">₹{it.line_total}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-botanical-900 mb-1.5">Confirmed Address:</p>
                  <div className="flex items-start gap-1.5 text-botanical-800/80">
                    <MapPin className="w-4 h-4 text-botanical-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {booking.address_snapshot?.address_line_1}, {booking.address_snapshot?.locality}, {booking.address_snapshot?.city} - {booking.address_snapshot?.postal_code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Phlebotomist Banner */}
              {driverName ? (
                <div className="my-3 p-3 bg-gradient-to-r from-sky-50 via-sky-50/50 to-white rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-soft-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800">
                          Assigned Phlebotomist:
                        </span>
                        <span className="text-xs font-bold text-botanical-950">{driverName}</span>
                        {assignedDriver?.badge_id && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-sky-200 text-sky-900 font-bold">
                            #{assignedDriver.badge_id}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-botanical-700/80">
                        {assignedDriver?.vehicle_details || 'Mobile Phlebotomy Unit'} • Cold Chain Verified
                      </p>
                    </div>
                  </div>

                  {driverPhone && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <a
                        href={`tel:${driverPhone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-soft-xs transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${driverPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(driverName)}%2C%20regarding%20my%20Wellness%20Diagnostic%20home%20collection%20booking%20%23${booking.booking_reference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft-xs transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-2 p-2.5 bg-ivory-50 rounded-xl border border-dashed border-ivory-300 text-[11px] text-botanical-700/80 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-botanical-400 flex-shrink-0" />
                  <span>Phlebotomist will be assigned by the lab for slot <strong>{booking.scheduled_slot}</strong></span>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-ivory-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {['Pending', 'Confirmed'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Cancel Appointment</span>
                    </button>
                  )}

                  {booking.status === 'Report Ready' && (
                    <button
                      onClick={() => handleDownloadReport(booking)}
                      disabled={downloadingBookingId === booking.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-soft-xs transition-all disabled:opacity-75"
                    >
                      {downloadingBookingId === booking.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Report PDF</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <Link
                  href={`/patient/bookings/${booking.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-50 hover:bg-botanical-100 text-botanical-800 font-bold text-xs border border-botanical-200 transition-colors"
                >
                  <span>View Details & Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}
