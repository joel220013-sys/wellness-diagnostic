'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  Truck, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function AdminAssignmentsPage() {
  const { bookings, drivers, assignDriverToBooking } = useData();

  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const unassignedBookings = bookings.filter((b) => !b.driver_id && b.status !== 'Cancelled');
  const assignedBookings = bookings.filter((b) => Boolean(b.driver_id) && b.status !== 'Cancelled');

  const handleAssign = (bookingId: string) => {
    if (selectedDriverId) {
      assignDriverToBooking(bookingId, selectedDriverId);
      setActiveBookingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Phlebotomist Dispatch & Assignments</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Dispatch laboratory certified phlebotomists for confirmed home blood sample collection slots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            {unassignedBookings.length} Unassigned Orders
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            {assignedBookings.length} Assigned Orders
          </span>
        </div>
      </div>

      {/* Unassigned Urgent Queue */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-soft-sm space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-botanical-950">
            Pending Dispatch Queue ({unassignedBookings.length})
          </h2>
        </div>

        {unassignedBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-botanical-700">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-sm text-botanical-950">All Current Appointments Assigned!</p>
            <p>Every confirmed booking currently has a phlebotomist assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-botanical-950">#{b.booking_reference}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Needs Phlebotomist
                    </span>
                  </div>
                  <p className="text-xs font-bold text-botanical-950">{b.patient_name}</p>
                  <p className="text-[11px] text-botanical-700">
                    {b.scheduled_date} • <strong>{b.scheduled_slot}</strong>
                  </p>
                  <p className="text-[11px] text-botanical-800/80 truncate">
                    📍 {b.address_snapshot?.locality}, {b.address_snapshot?.city}
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-200/60 flex items-center gap-2">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.badge_id})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssign(b.id)}
                    className="px-3.5 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft whitespace-nowrap"
                  >
                    Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Phlebotomy Assignments Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm overflow-hidden space-y-4 p-6">
        <h2 className="text-base font-bold text-botanical-950">Active Phlebotomist Assignments ({assignedBookings.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/90 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Date & Slot</th>
                <th className="p-3">Assigned Phlebotomist</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Reassign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {assignedBookings.map((b) => (
                <tr key={b.id} className="hover:bg-ivory-50/60">
                  <td className="p-3 font-bold text-botanical-950">#{b.booking_reference}</td>
                  <td className="p-3 font-semibold text-botanical-950">{b.patient_name}</td>
                  <td className="p-3 text-botanical-700">
                    {b.scheduled_date} <br />
                    <span className="text-[10px] text-botanical-600">{b.scheduled_slot}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 inline-flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-sky-700" />
                      <span>{b.driver_name}</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ivory-200 text-botanical-800">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        const newDriver = prompt(`Enter Phlebotomist ID to reassign order #${b.booking_reference}:`, drivers[0]?.id);
                        if (newDriver) assignDriverToBooking(b.id, newDriver);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-botanical-700 bg-ivory-100 hover:bg-ivory-200"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
