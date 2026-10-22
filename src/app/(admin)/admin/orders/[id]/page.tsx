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
  Truck, 
  FileText, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Send,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { BookingStatus, LabReportResultItem } from '@/types';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { bookings, drivers, reports, invoices, updateBookingStatus, assignDriverToBooking, addReportForBooking } = useData();

  const bookingId = params.id as string;
  const booking = bookings.find((b) => b.id === bookingId || b.booking_reference === bookingId);

  const [selectedDriver, setSelectedDriver] = useState<string>(drivers[0]?.id || '');
  const [showReportForm, setShowReportForm] = useState(false);
  const [pathologyRemarks, setPathologyRemarks] = useState('All biological analyte values verified within clinical limits. Cold chain maintained during transit.');
  
  // Analyte values for report generation
  const [analyteValues, setAnalyteValues] = useState<LabReportResultItem[]>([
    { parameter_name: 'Hemoglobin (Hb)', result_value: '14.2', unit: 'g/dL', normal_range: '12.0 - 15.5', status: 'Normal' },
    { parameter_name: 'Total Leukocyte Count (TLC)', result_value: '7200', unit: '/cumm', normal_range: '4000 - 11000', status: 'Normal' },
    { parameter_name: 'Fasting Blood Glucose', result_value: '92', unit: 'mg/dL', normal_range: '70 - 100', status: 'Normal' },
    { parameter_name: 'Serum Cholesterol', result_value: '185', unit: 'mg/dL', normal_range: '< 200', status: 'Normal' }
  ]);

  if (!booking) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-ivory-300 text-center space-y-4 max-w-lg mx-auto shadow-soft">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-botanical-950">Order Not Found</h2>
        <Link href="/admin/orders" className="inline-block px-4 py-2 bg-botanical-500 text-white font-bold text-xs rounded-xl">
          Return to Orders
        </Link>
      </div>
    );
  }

  const handleAssign = () => {
    if (selectedDriver) {
      assignDriverToBooking(booking.id, selectedDriver);
    }
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    updateBookingStatus(booking.id, newStatus);
  };

  const handleReleaseReport = () => {
    addReportForBooking(booking.id, analyteValues, pathologyRemarks);
    updateBookingStatus(booking.id, 'Report Ready');
    setShowReportForm(false);
    alert('Laboratory report signed and released to patient portal.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-700 hover:text-botanical-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-botanical-700">Change Status:</span>
          <select
            value={booking.status}
            onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
            className="px-3 py-1.5 rounded-xl border border-ivory-300 text-xs font-bold bg-white text-botanical-950 shadow-soft-sm"
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
        </div>
      </div>

      {/* Order Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-botanical-950">
              Order #{booking.booking_reference}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-botanical-100 text-botanical-900 border border-botanical-200">
              {booking.status}
            </span>
          </div>
          <p className="text-xs text-botanical-700/80 mt-1">
            Registered on {booking.created_at || 'Today'} • Scheduled for <strong>{booking.scheduled_date} ({booking.scheduled_slot})</strong>
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xs text-botanical-700">Total Billed</p>
          <p className="text-2xl font-extrabold text-botanical-950">₹{booking.total_amount}</p>
          <span className="text-[11px] font-semibold text-botanical-600">
            Payment: {booking.payment_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient & Address Info */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-botanical-950">Patient & Address Information</h2>
          <div className="space-y-2 text-xs text-botanical-800">
            <p><strong>Patient Name:</strong> {booking.patient_name}</p>
            <p><strong>Contact Phone:</strong> {booking.patient_phone}</p>
            <p className="pt-2"><strong>Confirmed Address:</strong></p>
            <p>{booking.address_snapshot?.address_line_1}</p>
            {booking.address_snapshot?.address_line_2 && <p>{booking.address_snapshot?.address_line_2}</p>}
            <p>{booking.address_snapshot?.locality}, {booking.address_snapshot?.city} - {booking.address_snapshot?.postal_code}</p>
            {booking.address_snapshot?.landmark && (
              <p className="text-botanical-700">Landmark: {booking.address_snapshot.landmark}</p>
            )}
            {booking.address_snapshot?.latitude && (
              <p className="text-[11px] font-mono text-botanical-600">
                GPS: {booking.address_snapshot.latitude.toFixed(4)}, {booking.address_snapshot.longitude?.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Phlebotomist Assignment Box */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-4">
          <h2 className="text-base font-bold text-botanical-950">Phlebotomist Assignment</h2>
          <div className="space-y-3">
            {booking.driver_name ? (
              <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
                <p className="text-xs font-bold text-sky-950">Currently Assigned:</p>
                <p className="text-sm font-extrabold text-sky-900 mt-0.5">{booking.driver_name}</p>
                <p className="text-xs text-sky-800">Contact: {booking.driver_phone || '+91 98111 22334'}</p>
              </div>
            ) : (
              <p className="text-xs text-amber-800 font-semibold p-3 bg-amber-50 rounded-xl border border-amber-200">
                ⚠ No staff member assigned yet. Please assign a certified phlebotomist.
              </p>
            )}

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-botanical-900">Reassign / Assign Staff</label>
              <div className="flex gap-2">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.badge_id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  className="px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Tests & Pricing Snapshot */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
        <h2 className="text-base font-bold text-botanical-950">Line Items & Financial Snapshot</h2>
        <div className="divide-y divide-ivory-100 border border-ivory-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 text-botanical-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Test / Package Name</th>
                <th className="p-3">Quantity</th>
                <th className="p-3 text-right">Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {(booking.items || []).map((it, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-semibold text-botanical-950">{it.item_name}</td>
                  <td className="p-3 text-botanical-800">{it.quantity}</td>
                  <td className="p-3 text-right font-extrabold text-botanical-950">₹{it.line_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-1.5 text-xs text-botanical-800">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-botanical-950">₹{booking.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Home Collection Fee:</span>
              <span className="font-semibold text-botanical-950">₹{booking.collection_fee}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-ivory-200 font-extrabold text-sm text-botanical-950">
              <span>Grand Total:</span>
              <span className="text-botanical-600">₹{booking.total_amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pathology Report Upload / Sign-off Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-botanical-950">Pathology Laboratory Report</h2>
            <p className="text-xs text-botanical-700/80">Authorize analyte values, enter doctor remarks, and release to patient</p>
          </div>

          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-50 hover:bg-botanical-100 text-botanical-800 font-bold text-xs border border-botanical-200"
          >
            <UploadCloud className="w-4 h-4 text-botanical-600" />
            <span>{showReportForm ? 'Close Form' : 'Upload / Authorize Report'}</span>
          </button>
        </div>

        {showReportForm && (
          <div className="p-5 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-botanical-900">
              Analyte Test Results Input
            </h3>

            <div className="space-y-3">
              {analyteValues.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <input
                    type="text"
                    value={item.parameter_name}
                    onChange={(e) => {
                      const next = [...analyteValues];
                      next[idx].parameter_name = e.target.value;
                      setAnalyteValues(next);
                    }}
                    className="p-2 rounded-xl border border-ivory-300 font-semibold"
                  />
                  <input
                    type="text"
                    value={item.result_value}
                    onChange={(e) => {
                      const next = [...analyteValues];
                      next[idx].result_value = e.target.value;
                      setAnalyteValues(next);
                    }}
                    placeholder="Value (e.g. 14.2)"
                    className="p-2 rounded-xl border border-ivory-300 font-bold text-botanical-950"
                  />
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => {
                      const next = [...analyteValues];
                      next[idx].unit = e.target.value;
                      setAnalyteValues(next);
                    }}
                    placeholder="Unit"
                    className="p-2 rounded-xl border border-ivory-300"
                  />
                  <input
                    type="text"
                    value={item.normal_range}
                    onChange={(e) => {
                      const next = [...analyteValues];
                      next[idx].normal_range = e.target.value;
                      setAnalyteValues(next);
                    }}
                    placeholder="Reference Range"
                    className="p-2 rounded-xl border border-ivory-300"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Chief Pathologist Remarks</label>
              <textarea
                rows={2}
                value={pathologyRemarks}
                onChange={(e) => setPathologyRemarks(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleReleaseReport}
                className="px-6 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft"
              >
                Sign & Release Report to Patient
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
