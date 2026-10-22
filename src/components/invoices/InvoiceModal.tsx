'use client';

import React from 'react';
import { Invoice } from '@/types';
import { X, Printer, Receipt, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

interface InvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNum = invoice.invoice_number || (invoice as any).invoiceNumber || 'WD-INV-001';
  const patient = invoice.patient_name || (invoice as any).patientName || 'Sarah Jenkins';
  const orderRef = (invoice as any).orderNumber || (invoice as any).booking_reference || invoice.booking_id || 'WD-ORD-101';
  const issueDate = invoice.issued_at || (invoice as any).date || 'Today';
  const subtotal = invoice.subtotal || (invoice as any).amount || 0;
  const discount = invoice.discount || 0;
  const total = invoice.total_amount || (invoice as any).total || subtotal;
  const payMethod = invoice.payment_method || (invoice as any).paymentMethod || 'Online / Card';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 selection:bg-botanical-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden flex flex-col">
        
        {/* Top Controls (Hidden in Print) */}
        <div className="no-print p-4 bg-botanical-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-peach-300" />
            <span className="font-bold text-sm">
              Official Tax Invoice — {invoiceNum}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-botanical-600 hover:bg-botanical-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-soft-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white text-botanical-950 font-sans">
          
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-ivory-300">
            <div>
              <BrandLogo size="md" showTagline={true} />
              <p className="text-xs text-botanical-700 mt-1">
                Sector 14 Diagnostic Hub, Connaught Place, New Delhi 110001<br />
                GST Exempt (Clinical Pathology) • Support: 1800-419-WELL
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-botanical-600 uppercase tracking-widest block">
                INVOICE
              </span>
              <span className="text-base font-extrabold text-botanical-950 font-mono">
                {invoiceNum}
              </span>
              <p className="text-xs text-botanical-700 mt-1">Date: {issueDate}</p>
            </div>
          </div>

          {/* Bill To & Booking Info */}
          <div className="my-6 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-botanical-700 font-semibold block">Billed To:</span>
              <p className="font-bold text-sm text-botanical-950">{patient}</p>
              <p className="text-botanical-800">Doorstep Blood Sample Collection Service</p>
            </div>
            <div className="text-right">
              <span className="text-botanical-700 font-semibold block">Order Reference:</span>
              <p className="font-bold text-sm text-botanical-950 font-mono">{orderRef}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                <span>Payment {invoice.status.toUpperCase()}</span>
              </span>
            </div>
          </div>

          {/* Charges Breakdown */}
          <div className="border border-ivory-300 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-botanical-950 font-bold border-b border-ivory-300">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-semibold text-botanical-950">
                        {it.name}
                      </td>
                      <td className="py-3 px-4 text-center">{it.quantity || 1}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">₹{it.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-botanical-950">
                      Diagnostic Blood Test Panels & Doorstep Sample Collection
                    </td>
                    <td className="py-3 px-4 text-center">1</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">₹{subtotal}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 px-4 text-botanical-700">Home Phlebotomist Visit & Sterile Kit</td>
                  <td className="py-2.5 px-4 text-center">1</td>
                  <td className="py-2.5 px-4 text-right text-botanical-600 font-semibold">
                    {invoice.collection_fee === 0 ? 'FREE' : `₹${invoice.collection_fee}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-botanical-800">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">₹{subtotal + discount}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Special Health Discount:</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-botanical-800">
                <span>Healthcare GST (Exempt):</span>
                <span className="font-mono">₹0</span>
              </div>
              <div className="pt-2 border-t border-ivory-300 flex justify-between text-sm font-extrabold text-botanical-950">
                <span>Total Amount:</span>
                <span className="font-mono text-botanical-600 text-base">₹{total}</span>
              </div>
              <p className="text-[11px] text-botanical-600 text-right uppercase">
                Payment Method: {payMethod.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-ivory-200 text-center text-[11px] text-botanical-700/60">
            Thank you for choosing Wellness Diagnostic for your healthcare needs.<br />
            This is an authoritative computer-generated tax invoice.
          </div>
        </div>

      </div>
    </div>
  );
}
