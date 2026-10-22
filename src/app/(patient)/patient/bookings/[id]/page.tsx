'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  FileText, 
  Receipt, 
  Truck, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Ban
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { BookingStatus, LabReport, Invoice } from '@/types';
import LabReportModal from '@/components/reports/LabReportModal';
import InvoiceModal from '@/components/invoices/InvoiceModal';

const TIMELINE_STEPS: BookingStatus[] = [
  'Pending',
  'Confirmed',
  'Assigned',
  'Collection Scheduled',
  'Sample Collected',
  'Processing',
  'Report Ready'
];

export default function PatientBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { bookings, reports, invoices, updateBookingStatus } = useData();

  const [activeReport, setActiveReport] = useState<LabReport | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const bookingId = params.id as string;
  const booking = bookings.find((b) => b.id === bookingId || b.booking_reference === bookingId);

  if (!booking) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-ivory-300 text-center space-y-4 max-w-lg mx-auto shadow-soft">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-botanical-950">Booking Not Found</h2>
        <p className="text-xs text-botanical-700/80">
          The booking reference could not be located in your patient account.
        </p>
        <Link
          href="/patient/bookings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-botanical-500 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Bookings</span>
        </Link>
      </div>
    );
  }

  // Linked report & invoice if ready
  const linkedReport = reports.find((r) => r.order_id === booking.id || r.patient_id === booking.patient_id);
  const linkedInvoice = invoices.find((inv) => inv.order_id === booking.id);

  const currentStepIndex = TIMELINE_STEPS.indexOf(booking.status);
  const isCancelled = booking.status === 'Cancelled' || booking.status === 'Failed';

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      updateBookingStatus(booking.id, 'Cancelled');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/patient/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-700 hover:text-botanical-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Bookings</span>
        </Link>

        <div className="flex items-center gap-2">
          {linkedInvoice && (
            <button
              onClick={() => setActiveInvoice(linkedInvoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-peach-100 text-botanical-950 hover:bg-peach-200 border border-peach-200"
            >
              <Receipt className="w-3.5 h-3.5 text-peach-700" />
              <span>View Invoice</span>
            </button>
          )}

          {booking.status === 'Report Ready' && linkedReport && (
            <button
              onClick={() => setActiveReport(linkedReport)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-soft"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Lab Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-botanical-950">
              Booking Ref: #{booking.booking_reference}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isCancelled 
                ? 'bg-rose-100 text-rose-900 border-rose-200' 
                : 'bg-botanical-100 text-botanical-900 border-botanical-200'
            }`}>
              {booking.status}
            </span>
          </div>
          <p className="text-xs text-botanical-700/80 mt-1">
            Booked on {booking.created_at || 'Today'} • Scheduled for <strong>{booking.scheduled_date} ({booking.scheduled_slot})</strong>
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xs text-botanical-700">Total Amount</p>
          <p className="text-2xl font-extrabold text-botanical-950">₹{booking.total_amount}</p>
          <span className="text-[11px] font-semibold text-botanical-600">
            Payment Status: {booking.payment_status}
          </span>
        </div>
      </div>

      {/* Status Progress Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
        <h2 className="text-base font-bold text-botanical-950">Progress Timeline</h2>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>This booking was marked as {booking.status}. Please contact laboratory support if you need to reschedule.</span>
          </div>
        ) : (
          <div className="relative pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-botanical-500 text-white border-botanical-500 shadow-soft font-bold'
                        : isPassed
                        ? 'bg-botanical-50 text-botanical-900 border-botanical-200 font-semibold'
                        : 'bg-ivory-50 text-botanical-500/50 border-ivory-200 text-xs'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold">
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className="text-[11px] sm:text-xs block leading-tight">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Details Grid: Tests, Phlebotomist, Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diagnostic Tests Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-botanical-950">Diagnostic Tests Included</h2>
          <div className="divide-y divide-ivory-100">
            {(booking.items || []).map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-botanical-950">{item.item_name}</p>
                  <p className="text-[11px] text-botanical-700/70">Quantity: {item.quantity}</p>
                </div>
                <p className="font-extrabold text-botanical-950">₹{item.line_total}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-ivory-200 text-xs space-y-1.5">
            <div className="flex justify-between text-botanical-700">
              <span>Catalog Subtotal:</span>
              <span className="font-semibold text-botanical-950">₹{booking.subtotal}</span>
            </div>
            <div className="flex justify-between text-botanical-700">
              <span>Home Sample Collection:</span>
              <span className="font-semibold text-botanical-950">
                {booking.collection_fee === 0 ? 'FREE' : `₹${booking.collection_fee}`}
              </span>
            </div>
            {booking.discount && booking.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Bundle Discount:</span>
                <span>- ₹{booking.discount}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-ivory-200 font-extrabold text-sm text-botanical-950">
              <span>Grand Total:</span>
              <span className="text-botanical-600">₹{booking.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Phlebotomist & Address Snapshot */}
        <div className="space-y-6">
          {/* Phlebotomist Card */}
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-botanical-600" />
              <h2 className="text-base font-bold text-botanical-950">Assigned Phlebotomist</h2>
            </div>
            {booking.driver_name ? (
              <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-botanical-950">{booking.driver_name}</p>
                  <p className="text-[11px] text-botanical-700/80">Certified Mobile Phlebotomist</p>
                  <p className="text-[11px] text-sky-800 font-semibold mt-0.5">📞 {booking.driver_phone || '+91 98111 22334'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Assigned
                </span>
              </div>
            ) : (
              <p className="text-xs text-botanical-700/80 italic">
                A phlebotomist will be assigned shortly by the laboratory dispatcher.
              </p>
            )}
          </div>

          {/* Confirmed Address Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-botanical-600" />
              <h2 className="text-base font-bold text-botanical-950">Collection Address Snapshot</h2>
            </div>
            <div className="text-xs text-botanical-800 space-y-1">
              <p className="font-semibold text-botanical-950">{booking.address_snapshot?.recipient_name} ({booking.address_snapshot?.phone})</p>
              <p>{booking.address_snapshot?.address_line_1}</p>
              {booking.address_snapshot?.address_line_2 && <p>{booking.address_snapshot?.address_line_2}</p>}
              <p>{booking.address_snapshot?.locality}, {booking.address_snapshot?.city} - {booking.address_snapshot?.postal_code}</p>
              {booking.address_snapshot?.landmark && (
                <p className="text-botanical-700">Landmark: {booking.address_snapshot?.landmark}</p>
              )}
              {booking.address_snapshot?.latitude && booking.address_snapshot?.longitude && (
                <p className="text-[11px] text-botanical-600 font-mono pt-1">
                  GPS: {booking.address_snapshot.latitude.toFixed(4)}, {booking.address_snapshot.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {['Pending', 'Confirmed'].includes(booking.status) && (
              <div className="pt-2">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel this Appointment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lab Report Modal */}
      {activeReport && (
        <LabReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}

      {/* Invoice Modal */}
      {activeInvoice && (
        <InvoiceModal
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}
    </div>
  );
}
