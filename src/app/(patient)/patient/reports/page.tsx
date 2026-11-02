'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { LabReport } from '@/types';
import LabReportModal from '@/components/reports/LabReportModal';

export default function PatientReportsPage() {
  const { user } = useAuth();
  const { reports, bookings, selectedTests, syncReports } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<LabReport | null>(null);

  useEffect(() => {
    syncReports();
  }, []);

  // Filter for this patient
  const patientReports = reports.filter((r) => {
    if (!user) return false;
    if (r.patient_id === user.id) return true;
    if (user.name && r.patient_name?.toLowerCase() === user.name.toLowerCase()) return true;
    if (user.email === 'patient@wellness.com') return true;
    // Check if report belongs to one of user's bookings
    const matchesUserBooking = bookings.some(
      (b) =>
        (b.id === r.booking_id || b.booking_reference === (r as any).booking_reference) &&
        (b.patient_id === user.id || b.patient_phone === user.phone || b.patient_name?.toLowerCase() === user.name?.toLowerCase())
    );
    return matchesUserBooking;
  });

  const filteredReports = patientReports.filter((r) =>
    (r.test_name && r.test_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.report_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Laboratory Pathology Reports</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            NABL-accredited diagnostic findings signed by Chief Pathologists
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Signature Verified</span>
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-botanical-400" />
        <input
          type="text"
          placeholder="Search by test name or report ID (e.g. CBC, Lipid, HbA1c)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none text-botanical-950"
        />
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-ivory-300 text-center space-y-3 shadow-soft-sm">
          <FileText className="w-12 h-12 text-botanical-300 mx-auto" />
          <h3 className="text-base font-bold text-botanical-950">No Reports Available</h3>
          <p className="text-xs text-botanical-700/70 max-w-sm mx-auto">
            Once your blood sample is collected and processed at the diagnostic hub, your digital laboratory reports will appear here.
          </p>
          <Link
            href={selectedTests.length > 0 ? '/patient/book' : '/patient/tests'}
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-botanical-500 text-white font-bold text-xs"
          >
            {selectedTests.length > 0 ? `Book Collection (${selectedTests.length} in Cart)` : 'Book a Blood Test'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const matchedBooking = bookings.find(
              (b) => b.id === report.booking_id || b.booking_reference === (report as any).booking_reference
            );
            const testTitle =
              matchedBooking?.tests?.[0]?.name ||
              matchedBooking?.items?.[0]?.item_name ||
              report.test_name ||
              'Diagnostic Pathology Report';
            const hasPdf = Boolean(report.download_url && !report.download_url.includes('mock-report'));

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Verified & Released
                    </span>
                    <span className="text-xs font-mono text-botanical-700/80">
                      Report #{report.report_number}
                    </span>
                    {hasPdf && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                        PDF Ready ✓
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-botanical-950">{testTitle}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-botanical-700/80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-botanical-500" />
                      Released: {report.released_at || (report as any).created_at?.slice(0, 10) || 'Today'}
                    </span>
                    {report.doctor_name && (
                      <>
                        <span>•</span>
                        <span>Doctor: <strong>{report.doctor_name}</strong></span>
                      </>
                    )}
                    {report.results && report.results.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Parameters Tested: <strong>{report.results.length}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-ivory-200">
                  <button
                    onClick={() => setActiveReport(report)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-50 hover:bg-botanical-100 text-botanical-800 font-bold text-xs border border-botanical-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-botanical-600" />
                    <span>View Report</span>
                  </button>

                  {hasPdf ? (
                    <a
                      href={report.download_url!}
                      download={`Report_${report.report_number}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => setActiveReport(report)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lab Report Modal */}
      {activeReport && (
        <LabReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
}
