'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  User, 
  Search,
  Calendar,
  Phone
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Booking } from '@/types';

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBookingId?: string;
}

export default function UploadReportModal({
  isOpen,
  onClose,
  preselectedBookingId,
}: UploadReportModalProps) {
  const { bookings, updateBookingStatus, syncReports, syncBookings } = useData();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(preselectedBookingId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [doctorName, setDoctorName] = useState('Dr. Joel Joyson, MD Pathology');
  const [labTechnician, setLabTechnician] = useState('Robert Thorne, B.Sc MLT');
  const [overallRemarks, setOverallRemarks] = useState(
    'NABL Verified Digital Pathology Report. All parameters clinically evaluated and signed.'
  );

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedBookingId) {
      setSelectedBookingId(preselectedBookingId);
    } else if (bookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(bookings[0].id);
    }
  }, [preselectedBookingId, bookings]);

  if (!isOpen) return null;

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.booking_reference || '').toLowerCase().includes(q) ||
      (b.patient_name || '').toLowerCase().includes(q) ||
      (b.patient_phone || '').includes(q) ||
      (b.tests?.some((t) => t.name.toLowerCase().includes(q)) ?? false) ||
      (b.items?.some((it) => (it.item_name || '').toLowerCase().includes(q)) ?? false)
    );
  });

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setErrorMsg('Please select a valid PDF document (.pdf)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedBooking) {
      setErrorMsg('Please select a patient / order for this report.');
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Please select a PDF report file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('booking_id', selectedBooking.id);
      formData.append('patient_id', selectedBooking.patient_id || 'user_patient_1');
      formData.append('doctor_name', doctorName.trim() || 'Chief Pathologist, MD');
      formData.append('lab_technician', labTechnician.trim() || 'Senior Laboratory Technician');
      formData.append('overall_remarks', overallRemarks.trim());

      const res = await fetch('/api/reports/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.error || 'Failed to upload report to storage');
      }

      const resData = await res.json();

      // Update booking status in local DataContext and trigger live DB sync
      updateBookingStatus(selectedBooking.id, 'Report Ready');
      syncReports();
      syncBookings();

      setSuccessMsg(
        `Report successfully uploaded & released for patient ${selectedBooking.patient_name}! Available immediately in the patient portal.`
      );

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading lab report');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-ivory-300 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ivory-200 bg-ivory-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-botanical-100 flex items-center justify-center text-botanical-700">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-botanical-950">
                Upload & Release Lab Report
              </h2>
              <p className="text-xs text-botanical-700">
                Upload pathologist-signed PDF stored permanently on Cloudflare R2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-botanical-400 hover:text-botanical-950 hover:bg-ivory-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 text-rose-900 border border-rose-200 rounded-2xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Patient & Order Selector */}
          <div className="space-y-2">
            <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
              1. Select Patient Order
            </label>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-botanical-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, mobile number, or order number..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-ivory-300 bg-ivory-50/50 text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
              />
            </div>

            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs bg-white text-botanical-950 focus:outline-none focus:border-botanical-500"
              required
            >
              <option value="" disabled>
                -- Choose Patient Booking ({filteredBookings.length} orders found) --
              </option>
              {filteredBookings.map((b) => {
                const testTitle =
                  b.tests?.[0]?.name || b.items?.[0]?.item_name || 'Diagnostic Package';
                return (
                  <option key={b.id} value={b.id}>
                    #{b.booking_reference} • {b.patient_name} ({b.patient_phone || 'No phone'}) — {testTitle} [Status: {b.status}]
                  </option>
                );
              })}
            </select>

            {/* Selected Patient Snapshot Card */}
            {selectedBooking && (
              <div className="p-3.5 bg-botanical-50/60 rounded-2xl border border-botanical-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-extrabold text-botanical-950 text-sm">
                    {selectedBooking.patient_name}
                  </p>
                  <p className="text-[11px] text-botanical-700 flex items-center gap-2 mt-0.5">
                    <span>📞 {selectedBooking.patient_phone || 'N/A'}</span>
                    <span>•</span>
                    <span>Order #{selectedBooking.booking_reference}</span>
                  </p>
                  <p className="text-[11px] text-botanical-800 font-semibold mt-1">
                    🔬 {selectedBooking.tests?.[0]?.name || selectedBooking.items?.[0]?.item_name || 'Health Diagnostic Profile'}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-botanical-900 border border-botanical-200">
                    Current: {selectedBooking.status}
                  </span>
                  <p className="text-[11px] font-bold text-botanical-950 mt-1">
                    Billed: ₹{selectedBooking.total_amount}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. PDF File Selector */}
          <div className="space-y-2">
            <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
              2. Official Lab Report Document (PDF)
            </label>

            <label className="border-2 border-dashed border-ivory-300 hover:border-botanical-500 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-ivory-50/40 hover:bg-ivory-50">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                required
              />
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>

              {selectedFile ? (
                <div className="text-center space-y-0.5">
                  <p className="font-bold text-botanical-950 text-xs flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedFile.name}</span>
                  </p>
                  <p className="text-[11px] text-botanical-600">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload to Cloudflare R2
                  </p>
                  <p className="text-[10px] text-botanical-500 underline mt-1">
                    Click to choose a different PDF
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="font-bold text-botanical-950 text-xs">
                    Click to select signed PDF report
                  </p>
                  <p className="text-[11px] text-botanical-600">
                    Supports any NABL or certified clinical laboratory report (PDF up to 25MB)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* 3. Pathologist Sign-Off Details */}
          <div className="space-y-3 pt-1">
            <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
              3. Verification & Sign-Off Metadata
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-botanical-800 mb-1">
                  Signing Pathologist
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs font-semibold text-botanical-950 focus:outline-none focus:border-botanical-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-botanical-800 mb-1">
                  Laboratory Technician
                </label>
                <input
                  type="text"
                  value={labTechnician}
                  onChange={(e) => setLabTechnician(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs font-semibold text-botanical-950 focus:outline-none focus:border-botanical-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-botanical-800 mb-1">
                Pathology Remarks & Interpretation
              </label>
              <textarea
                rows={2}
                value={overallRemarks}
                onChange={(e) => setOverallRemarks(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-ivory-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-botanical-700 hover:bg-ivory-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !selectedBookingId}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-soft transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Cloudflare R2...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Release Report to Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
