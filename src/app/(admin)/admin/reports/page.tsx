'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Eye, 
  Download, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  User,
  Plus
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { LabReport } from '@/types';
import LabReportModal from '@/components/reports/LabReportModal';
import Link from 'next/link';

export default function AdminReportsPage() {
  const { reports } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<LabReport | null>(null);

  const filteredReports = reports.filter((r) =>
    r.report_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.test_name && r.test_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Laboratory Pathology Reports</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Pathologist-verified digital reports, signed analyte findings & audit timestamps
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Report for Order</span>
        </Link>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-botanical-400" />
        <input
          type="text"
          placeholder="Search by report number, patient name or test profile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none text-botanical-950"
        />
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/90 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-3.5">Report #</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Diagnostic Profile</th>
                <th className="p-3.5">Parameters</th>
                <th className="p-3.5">Signing Pathologist</th>
                <th className="p-3.5">Released Date</th>
                <th className="p-3.5">Release Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-ivory-50/60 transition-colors">
                  <td className="p-3.5 font-bold font-mono text-botanical-950">
                    #{report.report_number}
                  </td>
                  <td className="p-3.5 font-bold text-botanical-950">
                    {report.patient_name}
                  </td>
                  <td className="p-3.5 font-semibold text-botanical-800">
                    {report.test_name}
                  </td>
                  <td className="p-3.5 text-botanical-700">
                    {report.results.length} Analytes
                  </td>
                  <td className="p-3.5 text-botanical-800">
                    {report.verified_by_name || 'Chief Pathologist, MD'}
                  </td>
                  <td className="p-3.5 text-botanical-700">
                    {report.released_at}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Released ✓
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setActiveReport(report)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-800 font-bold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-botanical-600" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
