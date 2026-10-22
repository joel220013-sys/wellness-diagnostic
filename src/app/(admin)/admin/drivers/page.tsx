'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin,
  X
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function AdminDriversPage() {
  const { drivers, bookings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.badge_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Phlebotomist Staff Directory</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Certified mobile phlebotomists with temperature-monitored cold chain transportation
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Phlebotomist</span>
        </button>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const activeJobs = bookings.filter(
            (b) => b.driver_id === driver.id && ['Assigned', 'Collection Scheduled', 'Sample Collected'].includes(b.status)
          );

          return (
            <div
              key={driver.id}
              className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm hover:border-botanical-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-800">On Duty</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-900 border border-sky-200">
                    Badge: {driver.badge_id}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-botanical-950">{driver.name}</h2>
                    <p className="text-xs text-botanical-700/80">Certified Senior Phlebotomist</p>
                    <p className="text-xs text-botanical-900 font-semibold mt-0.5">📞 {driver.phone}</p>
                  </div>
                </div>

                <div className="p-3 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs text-botanical-800 space-y-1">
                  <p>Vehicle: <strong>{driver.vehicle_details || 'Mobile Phlebotomy Van 04'}</strong></p>
                  <p>Cold Chain: <strong>4°C Insulated Cooler Box Verified</strong></p>
                  <p>Zone: <strong>Delhi NCR & Gurugram Hub</strong></p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-botanical-950">
                  <Clock className="w-3.5 h-3.5 text-botanical-600" />
                  <span>{activeJobs.length} Active Collections</span>
                </div>

                <button
                  onClick={() => alert(`Phlebotomist ${driver.name} file details.`)}
                  className="px-3 py-1.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-800 font-semibold"
                >
                  Manage
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-soft-lg border border-ivory-300">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="text-base font-bold text-botanical-950">Register New Phlebotomist</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input type="text" placeholder="e.g. Rahul Sharma" className="w-full p-2.5 rounded-xl border border-ivory-300" />
              </div>
              <div>
                <label className="block font-bold mb-1">Phone Number</label>
                <input type="text" placeholder="+91 98000 12345" className="w-full p-2.5 rounded-xl border border-ivory-300" />
              </div>
              <div>
                <label className="block font-bold mb-1">Certification Badge ID</label>
                <input type="text" defaultValue="WD-PHLEB-112" className="w-full p-2.5 rounded-xl border border-ivory-300 font-mono" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-ivory-200">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs text-botanical-700">Cancel</button>
              <button onClick={() => { setShowAddModal(false); alert('Phlebotomist registered.'); }} className="px-5 py-2 bg-botanical-500 text-white rounded-xl font-bold text-xs">Save Staff</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
