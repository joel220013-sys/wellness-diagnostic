'use client';

import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { BookingStatus } from '@/types';

export default function AdminOrdersPage() {
  const { bookings, drivers, updateBookingStatus, assignDriverToBooking } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [driverFilter, setDriverFilter] = useState<string>('ALL');

  // Assign driver modal state
  const [assigningBookingId, setAssigningBookingId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');

  const filteredBookings = bookings.filter((b) => {
    const ref = b.booking_reference || (b as any).order_number || '';
    const pat = b.patient_name || '';
    const matchesSearch =
      ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.items?.some((it) => (it.item_name || '').toLowerCase().includes(searchQuery.toLowerCase())) || false);

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesDriver = driverFilter === 'ALL' || b.driver_id === driverFilter;

    return matchesSearch && matchesStatus && matchesDriver;
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
  };

  const handleConfirmAssignment = () => {
    if (assigningBookingId && selectedDriverId) {
      assignDriverToBooking(assigningBookingId, selectedDriverId);
      setAssigningBookingId(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Report Ready':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Processing':
      case 'Sample Collected':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Assigned':
      case 'Collection Scheduled':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Confirmed':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Cancelled':
      case 'Failed':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-ivory-100 text-botanical-800 border-ivory-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Diagnostic Orders Management</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Control order statuses, driver assignments, phlebotomy tracking, and clinical records
          </p>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-botanical-100 text-botanical-900 border border-botanical-200">
          Total Orders: {bookings.length}
        </div>
      </div>

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
            <option value="ALL">All Phlebotomists</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/90 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-3.5">Reference</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Scheduled Slot</th>
                <th className="p-3.5">Confirmed Address</th>
                <th className="p-3.5">Assigned Staff</th>
                <th className="p-3.5">Amount (₹)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-ivory-50/60 transition-colors">
                  <td className="p-3.5 font-bold text-botanical-950">
                    #{booking.booking_reference}
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
                    {booking.address_snapshot?.locality}, {booking.address_snapshot?.city}
                  </td>

                  <td className="p-3.5">
                    {booking.driver_name ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                        <Truck className="w-3 h-3" />
                        <span>{booking.driver_name}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setAssigningBookingId(booking.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200"
                      >
                        + Assign Phlebotomist
                      </button>
                    )}
                  </td>

                  <td className="p-3.5 font-extrabold text-botanical-950">
                    ₹{booking.total_amount}
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(booking.status)}`}>
                      {booking.status}
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

                    <Link
                      href={`/admin/orders/${booking.id}`}
                      className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-botanical-800"
                      title="Inspect order details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {assigningBookingId && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-soft-lg border border-ivory-300">
            <h3 className="text-base font-bold text-botanical-950">Assign Phlebotomist to Collection</h3>
            <p className="text-xs text-botanical-700/80">
              Select certified phlebotomist with cold-chain transportation for order #{bookings.find((b) => b.id === assigningBookingId)?.booking_reference}.
            </p>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-botanical-900">Select Available Phlebotomist</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 text-xs font-semibold bg-white text-botanical-950"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.badge_id}) • {d.assigned_orders_count || 0} Active Collections
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-ivory-200">
              <button
                onClick={() => setAssigningBookingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-botanical-700 hover:bg-ivory-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-5 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
