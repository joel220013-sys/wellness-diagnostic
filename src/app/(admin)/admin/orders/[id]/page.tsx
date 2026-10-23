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
  ChevronRight,
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { BookingStatus, LabReportResultItem } from '@/types';
import LabReportModal from '@/components/reports/LabReportModal';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { bookings, drivers, reports, invoices, updateBookingStatus, assignDriverToBooking, addReportForBooking } = useData();

  const bookingId = params.id as string;
  const booking = bookings.find((b) => b.id === bookingId || b.booking_reference === bookingId);

  const linkedReport = reports.find((r) => r.booking_id === booking?.id || r.order_id === booking?.id || (booking?.report_id && r.id === booking.report_id));

  const [selectedDriver, setSelectedDriver] = useState<string>(drivers[0]?.id || '');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
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

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !booking) return;

    setSelectedPdfName(file.name);
    setIsUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('booking_id', booking.id);
      formData.append('patient_id', booking.patient_id || 'user_patient_1');
      formData.append('doctor_name', 'Dr. Eleanor Vance, MD (Chief Pathologist)');
      formData.append('lab_technician', 'Robert Thorne, B.Sc MLT');
      formData.append('overall_remarks', pathologyRemarks || 'NABL Signed Diagnostic Lab Report');

      const res = await fetch('/api/reports/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        updateBookingStatus(booking.id, 'Report Ready');
        alert(`Successfully uploaded "${file.name}" to Cloudflare R2! The verified report is now instantly accessible.`);
        setShowReportForm(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'Failed to upload report to Cloudflare R2');
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingPdf(false);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-botanical-950">Pathology Laboratory Report</h2>
              {linkedReport && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Report Active (Cloudflare R2)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-botanical-700/80">Authorize analyte values or upload signed PDF report stored permanently on Cloudflare R2</p>
          </div>

          <div className="flex items-center gap-2">
            {linkedReport && (
              <button
                onClick={() => setShowPreviewModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-botanical-100 hover:bg-botanical-200 text-botanical-900 font-bold text-xs"
              >
                <FileText className="w-4 h-4 text-botanical-600" />
                <span>View Online</span>
              </button>
            )}
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-50 hover:bg-botanical-100 text-botanical-800 font-bold text-xs border border-botanical-200"
            >
              <UploadCloud className="w-4 h-4 text-botanical-600" />
              <span>{showReportForm ? 'Close Form' : 'Upload / Authorize Report'}</span>
            </button>
          </div>
        </div>

        {/* If linkedReport exists with R2 download link */}
        {linkedReport && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-950">
                Report #{linkedReport.report_number} • Verified by {linkedReport.doctor_name || 'Chief Pathologist'}
              </p>
              <p className="text-emerald-800/80 text-[11px]">
                Released: {linkedReport.released_at} • Storage: Cloudflare R2 Object Store (10 GB Free Tier)
              </p>
            </div>
            {linkedReport.download_url && (
              <a
                href={linkedReport.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors shadow-soft-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download R2 PDF</span>
              </a>
            )}
          </div>
        )}

        {showReportForm && (
          <div className="p-5 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-5">
            {/* Direct PDF Upload to Cloudflare R2 */}
            <div className="p-4 rounded-2xl bg-white border border-ivory-300 space-y-2">
              <div>
                <h4 className="text-xs font-bold text-botanical-950 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-botanical-600" />
                  <span>Option 1: Upload Lab Report PDF Directly to Cloudflare R2</span>
                </h4>
                <p className="text-[11px] text-botanical-700/80">
                  Upload official signed PDF report. Uploads instantly to Cloudflare R2 bucket with secure 24h presigned download links.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-botanical-700 hover:bg-botanical-800 text-white font-bold text-xs shadow-soft transition-all">
                  {isUploadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>{isUploadingPdf ? 'Uploading to R2...' : 'Select PDF File'}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={isUploadingPdf}
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
                {selectedPdfName && (
                  <span className="text-xs text-botanical-800 font-mono">
                    {selectedPdfName}
                  </span>
                )}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-ivory-300"></div>
              <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-wider text-botanical-500">OR Enter Analyte Values</span>
              <div className="flex-grow border-t border-ivory-300"></div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-botanical-900">
                Option 2: Analyte Test Results Input
              </h3>

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

      {/* Lab Report Modal Preview */}
      {showPreviewModal && linkedReport && (
        <LabReportModal
          report={linkedReport}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
}
