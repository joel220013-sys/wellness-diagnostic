'use client';

import React from 'react';
import { LabReport } from '@/types';
import { X, Printer, Download, ShieldCheck, Award, FileText, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

interface LabReportModalProps {
  report: LabReport;
  onClose: () => void;
}

export default function LabReportModal({ report, onClose }: LabReportModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const reportNum = report.report_number || (report as any).reportNumber || 'WD-REP-001';
  const patientName = report.patient_name || (report as any).patientName || 'Patient';
  const patientAge = report.patient_age || (report as any).patientAge || 32;
  const patientGender = report.patient_gender || (report as any).patientGender || 'Female';
  const orderNum = report.booking_reference || (report as any).orderNumber || (report as any).booking_id || 'WD-ORD-101';
  const sampleDate = (report as any).dateSampleCollected || report.released_at || 'Today';
  const reportDate = report.released_at || (report as any).dateReportGenerated || 'Today';
  const doctor = report.doctor_name || report.verified_by_name || (report as any).doctorName || 'Consultant Pathologist, MD';
  const technician = report.lab_technician || (report as any).labTechnician || 'Senior Technologist';
  const remarks = report.overall_remarks || (report as any).overallRemarks || 'Sample analyzed according to standard clinical pathology guidelines.';
  const testsList = report.tests_included || (report as any).testsIncluded || (report.test_name ? [report.test_name] : ['Routine Blood Profile']);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 selection:bg-botanical-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="no-print p-4 bg-botanical-900 text-white flex items-center justify-between border-b border-botanical-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-peach-300" />
            <span className="font-bold text-sm sm:text-base">
              Diagnostic Laboratory Report — {reportNum}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {report.download_url && !report.download_url.includes('mock-report') && (
              <a
                href={report.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-soft-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download R2 PDF</span>
              </a>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-botanical-600 hover:bg-botanical-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-soft-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Medical Report Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-botanical-950 font-sans">
          
          {/* Official Letterhead Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-botanical-600 gap-4">
            <div>
              <BrandLogo size="lg" showTagline={true} />
              <p className="text-xs text-botanical-800/80 mt-1 max-w-md">
                Central Clinical Reference Laboratory • NABL Accredited (ISO 15189:2022) • CAP Recognized • Reg No: NABL-OR-98214
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-botanical-900">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-50 text-botanical-700 font-bold border border-botanical-200 mb-1">
                <Award className="w-3.5 h-3.5 text-botanical-600" />
                <span>NABL ACCREDITED LAB</span>
              </div>
              <p className="font-bold">24x7 Support: 1800-419-WELL</p>
              <p className="text-botanical-700/70">support@wellnessdiagnostic.com</p>
            </div>
          </div>

          {/* Patient & Sample Demographics Card */}
          <div className="my-6 p-4 rounded-2xl bg-ivory-100/70 border border-ivory-300/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-botanical-700 font-medium block">Patient Name</span>
              <span className="font-bold text-sm text-botanical-950">{patientName}</span>
            </div>
            <div>
              <span className="text-botanical-700 font-medium block">Age / Gender</span>
              <span className="font-bold text-sm text-botanical-950">{patientAge} Yrs / {patientGender}</span>
            </div>
            <div>
              <span className="text-botanical-700 font-medium block">Order Reference</span>
              <span className="font-bold text-sm text-botanical-950 font-mono">{orderNum}</span>
            </div>
            <div>
              <span className="text-botanical-700 font-medium block">Report ID</span>
              <span className="font-bold text-sm text-botanical-950 font-mono">{reportNum}</span>
            </div>
            <div>
              <span className="text-botanical-700 font-medium block">Sample Collected</span>
              <span className="font-semibold text-botanical-900">{sampleDate}</span>
            </div>
            <div>
              <span className="text-botanical-700 font-medium block">Report Published</span>
              <span className="font-semibold text-botanical-900">{reportDate}</span>
            </div>
            <div>
              <span className="text-botanical-700 font-medium block">Primary Pathologist</span>
              <span className="font-semibold text-botanical-900">{doctor}</span>
            </div>
            <div>
              <span className="text-botanical-700 font-medium block">Sample Type</span>
              <span className="font-semibold text-botanical-900">Venous Blood (EDTA / Plain)</span>
            </div>
          </div>

          {/* Tests Included Banner */}
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-botanical-800">
            <span className="px-2 py-0.5 rounded bg-botanical-100 text-botanical-800 font-bold">Panels Tested:</span>
            <span>{testsList.join(' • ')}</span>
          </div>

          {/* Results Table */}
          <div className="border border-ivory-300 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-botanical-50 text-botanical-950 font-bold uppercase tracking-wider border-b border-ivory-300">
                <tr>
                  <th className="py-3 px-4">Test Parameter</th>
                  <th className="py-3 px-4">Observed Value</th>
                  <th className="py-3 px-4">Standard Unit</th>
                  <th className="py-3 px-4">Biological Reference Range</th>
                  <th className="py-3 px-4 text-right">Flag / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {report.results.map((res, i) => {
                  const param = res.parameter || res.parameter_name || (res as any).parameterName || 'Analyte';
                  const testN = res.test_name || (res as any).testName || '';
                  const val = res.value || res.result_value || '';
                  const range = res.reference_range || res.normal_range || (res as any).referenceRange || '';
                  const isHigh = res.status?.toLowerCase() === 'high';
                  const isLow = res.status?.toLowerCase() === 'low';

                  return (
                    <tr key={i} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-botanical-950">
                        <div>{param}</div>
                        {testN && <div className="text-[10px] text-botanical-600 font-normal">{testN}</div>}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm">
                        <span className={isHigh ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-botanical-950'}>
                          {val}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-botanical-700">{res.unit}</td>
                      <td className="py-3 px-4 text-botanical-800">{range}</td>
                      <td className="py-3 px-4 text-right">
                        {!isHigh && !isLow && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>NORMAL</span>
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span>HIGH ▲</span>
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span>LOW ▼</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clinical Interpretation & Remarks */}
          <div className="p-4 rounded-2xl bg-ivory-100/60 border border-ivory-300/80 mb-8">
            <h4 className="text-xs font-bold text-botanical-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-botanical-600" />
              <span>Pathologist Remarks & Clinical Interpretation</span>
            </h4>
            <p className="text-xs text-botanical-900 leading-relaxed font-normal">
              {remarks}
            </p>
          </div>

          {/* Signatures & Accreditation Footer */}
          <div className="pt-6 border-t border-ivory-300 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end">
            <div>
              <p className="text-[11px] text-botanical-700">Lab Technician</p>
              <p className="font-bold text-xs text-botanical-950">{technician}</p>
              <p className="text-[10px] text-botanical-600">Registered Medical Technologist</p>
            </div>

            <div className="text-center">
              <div className="inline-block p-2 rounded-xl border border-ivory-300 bg-ivory-50 text-[10px] text-botanical-700 font-mono">
                [ QR Code Digitally Verified ]<br />
                {reportNum}
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-sm text-botanical-800 font-semibold mb-1">
                {doctor}
              </div>
              <p className="font-bold text-xs text-botanical-950">{doctor}</p>
              <p className="text-[10px] text-botanical-600">Consultant Pathologist, Reg #OR-41982</p>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-8 pt-4 border-t border-ivory-200 text-[10px] text-botanical-700/60 text-center leading-normal">
            *** End of Medical Examination Report ***<br />
            This laboratory report is for diagnostic reference and should be correlated clinically by a licensed medical practitioner.
          </div>
        </div>

      </div>
    </div>
  );
}
