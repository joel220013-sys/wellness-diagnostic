'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  Calendar, 
  Search, 
  Navigation, 
  ChevronRight, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function DriverAssignmentsPage() {
  const { user } = useAuth();
  const { bookings } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Isolated to current driver
  const assignedJobs = bookings.filter((b) =>
    b.driver_id === user?.id || 
    b.driver_name === user?.name || 
    user?.email === 'driver@wellness.com'
  );

  const filteredJobs = assignedJobs.filter((j) =>
    j.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.address_snapshot?.locality && j.address_snapshot.locality.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Assigned Collection Tasks</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Verified patient locations, test specifications, and sample collection protocols
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
          Total Assigned: {assignedJobs.length}
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-ivory-300 shadow-soft-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-botanical-400" />
        <input
          type="text"
          placeholder="Search by patient, order ref, or locality..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none text-botanical-950"
        />
      </div>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-ivory-300 text-center space-y-3 shadow-soft-sm">
          <Truck className="w-10 h-10 text-botanical-300 mx-auto" />
          <h3 className="text-base font-bold text-botanical-950">No Assignments Found</h3>
          <p className="text-xs text-botanical-700/70 max-w-sm mx-auto">
            You currently have no tasks matching your search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const lat = job.address_snapshot?.latitude || 28.4595;
            const lng = job.address_snapshot?.longitude || 77.0266;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ivory-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-botanical-950">#{job.booking_reference}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-botanical-700">
                    <Calendar className="w-3.5 h-3.5 text-botanical-500" />
                    <span>{job.scheduled_date}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-botanical-500" />
                    <span>{job.scheduled_slot}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-botanical-950">{job.patient_name}</p>
                    <a
                      href={`tel:${job.patient_phone}`}
                      className="inline-flex items-center gap-1.5 text-botanical-700 font-semibold hover:text-botanical-950"
                    >
                      <Phone className="w-3.5 h-3.5 text-botanical-500" />
                      <span>{job.patient_phone} (Tap to Call)</span>
                    </a>
                    {job.address_snapshot?.access_instructions && (
                      <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2">
                        <strong>Gate/Door Instructions:</strong> {job.address_snapshot.access_instructions}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-botanical-900">Destination Address:</p>
                    <p className="text-botanical-800">
                      {job.address_snapshot?.address_line_1}, {job.address_snapshot?.locality}, {job.address_snapshot?.city} - {job.address_snapshot?.postal_code}
                    </p>
                    {job.address_snapshot?.landmark && (
                      <p className="text-botanical-700 text-[11px]">
                        Landmark: <strong>{job.address_snapshot.landmark}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Tests to be drawn */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-botanical-900 mb-1">
                    Samples / Tubes to Draw:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.items || []).map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-ivory-100 text-[11px] font-bold text-botanical-950 border border-ivory-200"
                      >
                        🩸 {it.item_name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-ivory-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-950 font-bold text-xs border border-ivory-300"
                  >
                    <Navigation className="w-3.5 h-3.5 text-botanical-600" />
                    <span>Open Navigation GPS</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <Link
                    href={`/driver/assignments/${job.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
                  >
                    <span>Execute Collection</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
