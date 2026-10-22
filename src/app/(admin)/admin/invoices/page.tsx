'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  Download, 
  CheckCircle2, 
  Calendar, 
  DollarSign,
  Filter
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Invoice } from '@/types';
import InvoiceModal from '@/components/invoices/InvoiceModal';

export default function AdminInvoicesPage() {
  const { invoices } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const paidRevenue = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const pendingRevenue = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Invoices & Financial Revenue</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Authoritative clinical billing, itemized receipts, and door-collection accounting in INR (₹)
          </p>
        </div>
      </div>

      {/* 3 Summary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ivory-300 shadow-soft-sm">
          <span className="text-xs font-semibold text-botanical-700">Total Billed Invoices</span>
          <p className="text-2xl font-extrabold text-botanical-950 mt-1">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-botanical-600 font-medium">{invoices.length} Invoices Issued</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-soft-sm">
          <span className="text-xs font-semibold text-emerald-800">Collected / Paid Online</span>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">₹{paidRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Reconciled payments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-soft-sm">
          <span className="text-xs font-semibold text-amber-800">Pending at Home Collection</span>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">₹{pendingRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-amber-700 font-medium">Payable upon sample pickup</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-botanical-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'Paid', 'Pending', 'Unpaid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-botanical-500 text-white font-bold shadow-soft-sm'
                  : 'bg-ivory-100 text-botanical-800 hover:bg-ivory-200 border border-ivory-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/90 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Issued Date</th>
                <th className="p-3.5">Catalog Subtotal</th>
                <th className="p-3.5">Collection Fee</th>
                <th className="p-3.5">Total Amount (₹)</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-ivory-50/60 transition-colors">
                  <td className="p-3.5 font-bold font-mono text-botanical-950">
                    #{inv.invoice_number}
                  </td>
                  <td className="p-3.5 font-bold text-botanical-950">
                    {inv.patient_name}
                  </td>
                  <td className="p-3.5 text-botanical-700">
                    {inv.issued_at}
                  </td>
                  <td className="p-3.5 text-botanical-800">
                    ₹{inv.subtotal}
                  </td>
                  <td className="p-3.5 text-botanical-800">
                    {inv.collection_fee === 0 ? 'FREE' : `₹${inv.collection_fee}`}
                  </td>
                  <td className="p-3.5 font-extrabold text-botanical-950 text-sm">
                    ₹{inv.total_amount}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => setActiveInvoice(inv)}
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
