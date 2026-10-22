'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ChevronRight, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Link from 'next/link';

export default function AdminPatientsPage() {
  const { usersList } = useAuth();
  const { bookings } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only patients
  const patients = usersList.filter((u) => u.role === 'patient');

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.patientId && p.patientId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Patient Clinical Registry</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Authorized operational patient records for sample verification and pathology reporting
          </p>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-botanical-100 text-botanical-900 border border-botanical-200">
          Registered Patients: {patients.length}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-botanical-400" />
        <input
          type="text"
          placeholder="Search by patient ID, name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none text-botanical-950"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/90 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-3.5">Patient ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Total Bookings</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {filteredPatients.map((patient) => {
                const patientBookings = bookings.filter(
                  (b) => b.patient_id === patient.id || b.patient_name === patient.name
                );

                return (
                  <tr key={patient.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-botanical-950">
                      {patient.patientId || 'WD-PT-8842'}
                    </td>
                    <td className="p-3.5 font-bold text-botanical-950">
                      {patient.name}
                    </td>
                    <td className="p-3.5 text-botanical-800">
                      <p>{patient.email}</p>
                      <p className="text-[11px] text-botanical-700/80">{patient.phone}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-ivory-200 text-botanical-900">
                        {patientBookings.length} Orders
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-botanical-700/80">
                      {patient.createdAt ? patient.createdAt.split('T')[0] : '2026-01-15'}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/orders?search=${encodeURIComponent(patient.name)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-botanical-800 bg-ivory-100 hover:bg-ivory-200"
                      >
                        <ShoppingBag className="w-3 h-3 text-botanical-600" />
                        <span>Orders</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
