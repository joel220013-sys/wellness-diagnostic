'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Search, 
  MapPin, 
  ChevronRight, 
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function DriverHistoryPage() {
  const { user } = useAuth();
  const { bookings } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Completed or historic jobs for this driver
  const historicJobs = bookings.filter((b) =>
    (b.driver_id === user?.id || b.driver_name === user?.name || user?.email === 'driver@wellness.com') &&
    ['Sample Collected', 'Processing', 'Report Ready', 'Completed', 'Failed'].includes(b.status)
  );

  const filteredJobs = historicJobs.filter((j) =>
    j.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Phlebotomy Collection History</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Log of completed domestic sample visits, barcodes, and cold-chain audit handoffs
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
          Completed Jobs: {historicJobs.length}
        </span>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-ivory-300 shadow-soft-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-botanical-400" />
        <input
          type="text"
          placeholder="Search by patient name or booking reference..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none text-botanical-950"
        />
      </div>

      {/* List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-ivory-300 text-center space-y-3 shadow-soft-sm">
          <Clock className="w-10 h-10 text-botanical-300 mx-auto" />
          <h3 className="text-base font-bold text-botanical-950">No Completed Records Yet</h3>
          <p className="text-xs text-botanical-700/70 max-w-sm mx-auto">
            Completed sample collections will automatically record into your historical archive here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-ivory-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-botanical-950">#{job.booking_reference}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    job.status === 'Failed'
                      ? 'bg-rose-100 text-rose-900 border-rose-200'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <span className="text-xs text-botanical-700">
                  {job.scheduled_date} • {job.scheduled_slot}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-botanical-800">
                <div>
                  <p className="font-bold text-botanical-950">{job.patient_name}</p>
                  <p className="text-botanical-700">Phone: {job.patient_phone}</p>
                  <p className="pt-1">
                    📍 {job.address_snapshot?.locality}, {job.address_snapshot?.city}
                  </p>
                </div>

                <div className="p-3 bg-ivory-50 rounded-2xl border border-ivory-200 space-y-1">
                  <p>Barcode: <strong>{job.sample_details?.sample_barcode || 'WD-BAR-882194'}</strong></p>
                  <p>Transit Temp: <strong>{job.sample_details?.temperature_recorded || '4.2°C Cold Box'}</strong></p>
                  {job.sample_details?.notes && (
                    <p className="text-[11px] text-botanical-700/80 italic">Notes: {job.sample_details.notes}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/driver/assignments/${job.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-botanical-600 hover:text-botanical-800"
                >
                  <span>Review File</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
