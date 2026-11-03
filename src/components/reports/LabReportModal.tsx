'use client';

import React from 'react';
import { LabReport } from '@/types';
import { X, Printer, Download, ExternalLink, FileText, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { downloadReportFile } from '@/lib/downloadUtils';
import BrandLogo from '@/components/common/BrandLogo';

interface LabReportModalProps {
  report: LabReport;
  onClose: () => void;
}

export default function LabReportModal({ report, onClose }: LabReportModalProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadReportFile(report);
    } catch (err) {
      console.error('Modal download error:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const reportNum = report.report_number || (report as any).reportNumber || 'WD-REP-001';
  const hasUploadedPdf = Boolean(
    report.download_url && !report.download_url.includes('mock-report')
  );

  const patientName = report.patient_name || (report as any).patientName || 'Patient';
  const orderNum = report.booking_reference || (report as any).orderNumber || (report as any).booking_id || '';
  const reportDate = report.released_at || (report as any).created_at?.slice(0, 10) || 'Today';
  const doctor = report.doctor_name || report.verified_by_name || 'Chief Pathologist, MD';
  const technician = report.lab_technician || 'Senior Laboratory Technician';
  const remarks = report.overall_remarks || '';
  const hasNumericResults = Array.isArray(report.results) && report.results.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 selection:bg-botanical-200 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden flex flex-col h-[94vh] max-h-[94vh]">
        
        {/* Top Header Bar */}
        <div className="no-print px-5 py-3.5 bg-botanical-950 text-white flex items-center justify-between border-b border-botanical-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-botanical-800 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-bold text-sm sm:text-base text-white block truncate">
                Diagnostic Pathology Report — {reportNum}
              </span>
              <span className="text-[11px] text-ivory-300 font-medium">
                {hasUploadedPdf ? 'Verified Official Signed PDF' : 'Laboratory Finding Record'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasUploadedPdf && (
              <a
                href={report.download_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-soft-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Fullscreen</span>
              </a>
            )}

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-soft-sm disabled:opacity-75"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {hasUploadedPdf ? (
              <button
                onClick={() => {
                  const win = window.open(report.download_url!, '_blank');
                  if (win) win.focus();
                }}
                className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-botanical-800 hover:bg-botanical-700 text-white text-xs font-bold transition-all items-center gap-1.5 shadow-soft-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-botanical-800 hover:bg-botanical-700 text-white text-xs font-bold transition-all items-center gap-1.5 shadow-soft-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content: ONLY SHOW WHAT WAS UPLOADED */}
        {hasUploadedPdf ? (
          <div className="flex-1 w-full bg-slate-900 flex flex-col relative overflow-hidden">
            <object
              data={`${(report as any).view_url || report.download_url!}#toolbar=1`}
              type="application/pdf"
              className="w-full flex-1 h-full border-0 min-h-[500px]"
            >
              <iframe
                src={`${(report as any).view_url || report.download_url!}#toolbar=1`}
                className="w-full flex-1 h-full border-0 min-h-[500px]"
                title={`Laboratory Report ${reportNum}`}
              >
                <div className="p-8 text-center text-white space-y-4 my-auto">
                  <p className="text-sm">Click below to open the official laboratory report PDF:</p>
                  <a
                    href={report.download_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open PDF Report</span>
                  </a>
                </div>
              </iframe>
            </object>
            {/* Fallback Bar */}
            <div className="no-print px-4 py-2.5 bg-botanical-900 text-ivory-100 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-botanical-800">
              <span className="text-[11px] text-ivory-300">
                Official signed pathology report uploaded by laboratory
              </span>
              <a
                href={report.download_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1"
              >
                <span>Tap here to open full PDF directly</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : hasNumericResults ? (
          /* Fallback ONLY for legacy manual numeric parameter tests */
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-botanical-950 font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-ivory-300 mb-6">
              <BrandLogo size="md" showTagline={true} />
              <div className="text-right text-xs">
                <p className="font-bold">Report #{reportNum}</p>
                <p className="text-botanical-700">Released: {reportDate}</p>
              </div>
            </div>

            <div className="border border-ivory-300 rounded-2xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-botanical-50 text-botanical-950 font-bold uppercase tracking-wider border-b border-ivory-300">
                  <tr>
                    <th className="py-3 px-4">Test Parameter</th>
                    <th className="py-3 px-4">Observed Value</th>
                    <th className="py-3 px-4">Standard Unit</th>
                    <th className="py-3 px-4">Reference Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {report.results.map((res, i) => (
                    <tr key={i} className="hover:bg-ivory-50/50">
                      <td className="py-3 px-4 font-semibold text-botanical-950">
                        {res.parameter || (res as any).parameter_name || 'Analyte'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm">
                        {res.value || (res as any).result_value || ''}
                      </td>
                      <td className="py-3 px-4 text-botanical-700">{res.unit}</td>
                      <td className="py-3 px-4 text-botanical-800">
                        {res.reference_range || (res as any).normal_range || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {remarks && (
              <div className="p-4 rounded-2xl bg-ivory-100/60 border border-ivory-300/80 mb-6">
                <h4 className="text-xs font-bold text-botanical-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-botanical-600" />
                  <span>Pathologist Remarks</span>
                </h4>
                <p className="text-xs text-botanical-900">{remarks}</p>
              </div>
            )}

            <div className="pt-4 border-t border-ivory-300 flex justify-between items-center text-xs">
              <div>
                <p className="text-botanical-600">Technician</p>
                <p className="font-bold text-botanical-950">{technician}</p>
              </div>
              <div className="text-right">
                <p className="text-botanical-600">Pathologist</p>
                <p className="font-bold text-botanical-950">{doctor}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State if no PDF attached */
          <div className="p-8 text-center space-y-4 my-auto">
            <AlertCircle className="w-12 h-12 text-botanical-400 mx-auto" />
            <h3 className="text-base font-bold text-botanical-950">No Document Attached</h3>
            <p className="text-xs text-botanical-700 max-w-md mx-auto">
              The official signed PDF report for this order has not been attached yet. Please upload the PDF via the admin portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
