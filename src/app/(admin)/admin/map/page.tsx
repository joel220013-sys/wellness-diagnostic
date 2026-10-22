'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useData } from '@/context/DataContext';
import { Booking } from '@/types';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const DynamicAdminMap = dynamic(() => import('@/components/map/AdminCollectionsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-ivory-100 rounded-3xl border border-ivory-300 flex flex-col items-center justify-center gap-3 text-botanical-700">
      <Loader2 className="w-8 h-8 animate-spin text-botanical-500" />
      <span className="text-sm font-semibold">Loading live collection map...</span>
    </div>
  ),
});

export default function AdminMapPage() {
  const { bookings, drivers, assignDriverToBooking } = useData();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0] || null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');

  const handleAssign = () => {
    if (selectedBooking && selectedDriverId) {
      assignDriverToBooking(selectedBooking.id, selectedDriverId);
      alert(`Phlebotomist assigned to order #${selectedBooking.booking_reference}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-botanical-950">Live Collection Map & Dispatch</h1>
        <p className="text-xs sm:text-sm text-botanical-700/80">
          Split-screen geospatial dispatch view of active home sample appointments and phlebotomists
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Left 2 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-2 min-h-[520px]">
          <DynamicAdminMap
            bookings={bookings}
            drivers={drivers}
            onSelectBooking={(b) => setSelectedBooking(b)}
          />
        </div>

        {/* Right 1 Col: Selected Job Details & Fast Assignment */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-4">
            <h2 className="text-base font-bold text-botanical-950">Collection Point Details</h2>

            {selectedBooking ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
                  <div>
                    <span className="text-xs font-bold text-botanical-950">#{selectedBooking.booking_reference}</span>
                    <p className="text-xs text-botanical-700 font-semibold">{selectedBooking.patient_name}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-botanical-100 text-botanical-800 border border-botanical-200">
                    {selectedBooking.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-botanical-800">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-botanical-500" />
                    <span>{selectedBooking.scheduled_date}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-botanical-500" />
                    <span>{selectedBooking.scheduled_slot}</span>
                  </p>
                  <p className="flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-botanical-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {selectedBooking.address_snapshot?.address_line_1}, {selectedBooking.address_snapshot?.locality}, {selectedBooking.address_snapshot?.city}
                    </span>
                  </p>
                </div>

                {/* Assigned Phlebotomist */}
                <div className="pt-3 border-t border-ivory-200 space-y-2">
                  <label className="block text-xs font-bold text-botanical-900">Assigned Phlebotomist</label>
                  {selectedBooking.driver_name ? (
                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-950 font-bold">
                      {selectedBooking.driver_name} (Active)
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800 font-medium">Unassigned</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-ivory-300 text-xs font-semibold bg-white"
                    >
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.badge_id})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      className="px-4 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/admin/orders/${selectedBooking.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-950 font-bold text-xs border border-ivory-300"
                  >
                    <span>Open Full Order File</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-botanical-700/80">Click any marker pin on the map to inspect collection details.</p>
            )}
          </div>

          {/* Quick List */}
          <div className="bg-white rounded-3xl p-5 border border-ivory-300 shadow-soft-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-botanical-900">
              Active Collection Points ({bookings.length})
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedBooking?.id === b.id
                      ? 'bg-botanical-50 border-botanical-500 font-bold'
                      : 'bg-ivory-50/50 border-ivory-200 hover:bg-ivory-100'
                  }`}
                >
                  <div>
                    <p className="text-botanical-950">#{b.booking_reference}</p>
                    <p className="text-[10px] text-botanical-700">{b.patient_name}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-ivory-200">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
