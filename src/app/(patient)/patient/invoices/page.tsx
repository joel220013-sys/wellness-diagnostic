'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Download, 
  Eye, 
  Search, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Printer 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Invoice } from '@/types';
import InvoiceModal from '@/components/invoices/InvoiceModal';

export default function PatientInvoicesPage() {
  const { user } = useAuth();
  const { invoices, syncInvoices } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    syncInvoices();
  }, []);

  // Filter for this patient
  const patientInvoices = invoices.filter(
    (inv) => 
      inv.patient_id === user?.id || 
      (user?.name && inv.patient_name?.toLowerCase() === user.name.toLowerCase()) || 
      user?.email === 'patient@wellness.com'
  );

  const filteredInvoices = patientInvoices.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Invoices & Billing Receipts</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Authoritative clinical itemized invoices with GST exemption breakdown
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-peach-100 text-botanical-900 border border-peach-200">
          Total Receipts: {patientInvoices.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-botanical-400" />
        <input
          type="text"
          placeholder="Search by invoice number (e.g. WD-INV-2026-001)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none text-botanical-950"
        />
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-ivory-300 text-center space-y-3 shadow-soft-sm">
          <Receipt className="w-12 h-12 text-botanical-300 mx-auto" />
          <h3 className="text-base font-bold text-botanical-950">No Invoices Available</h3>
          <p className="text-xs text-botanical-700/70 max-w-sm mx-auto">
            Once you book an appointment or sample collection, your itemized invoice will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-botanical-950">
                    Invoice #{invoice.invoice_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {invoice.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-botanical-700/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-botanical-500" />
                    Issued: {invoice.issued_at}
                  </span>
                  <span>•</span>
                  <span>Patient: <strong>{invoice.patient_name}</strong></span>
                  <span>•</span>
                  <span>Diagnostic Tests: <strong>{invoice.items ? invoice.items.length : 0} Items</strong></span>
                </div>

                <div className="text-xs text-botanical-800/80 pt-1">
                  Catalog Subtotal: ₹{invoice.subtotal} • Collection Fee: {invoice.collection_fee === 0 ? 'FREE' : `₹${invoice.collection_fee}`}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-ivory-200">
                <div className="text-left md:text-right">
                  <p className="text-lg font-extrabold text-botanical-950">₹{invoice.total_amount}</p>
                  <span className="text-[11px] text-botanical-600 font-medium">
                    {invoice.status === 'Paid' ? 'Paid Online' : 'Pay at Collection'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveInvoice(invoice)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-50 hover:bg-botanical-100 text-botanical-800 font-bold text-xs border border-botanical-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-botanical-600" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => setActiveInvoice(invoice)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
