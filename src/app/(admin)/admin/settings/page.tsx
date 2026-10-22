'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  DollarSign, 
  Save, 
  CheckCircle2 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [labName, setLabName] = useState('Wellness Diagnostic Central Pathology Hub');
  const [labAddress, setLabAddress] = useState('Sector 14 Diagnostic Hub, Connaught Place, New Delhi 110001');
  const [labPhone, setLabPhone] = useState('1800-419-WELL (Toll Free)');
  const [labEmail, setLabEmail] = useState('support@wellnessdiagnostic.com');
  const [nablCode, setNablCode] = useState('NABL-MC-2026-9041');
  const [freeThreshold, setFreeThreshold] = useState('999');
  const [collectionFee, setCollectionFee] = useState('150');
  const [slotCapacity, setSlotCapacity] = useState('25');
  const [operatingHours, setOperatingHours] = useState('06:00 AM – 08:00 PM Daily');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-botanical-950">Laboratory Operational Settings</h1>
        <p className="text-xs sm:text-sm text-botanical-700/80">
          Configure home phlebotomy dispatch thresholds, service slots, accreditation notes, and pricing rules
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Operational parameters updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Pricing Rules */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-ivory-200">
            <DollarSign className="w-5 h-5 text-botanical-600" />
            <h2 className="text-base font-bold text-botanical-950">Doorstep Collection Pricing Rules (INR)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-botanical-900 mb-1">
                Free Collection Minimum Cart Threshold (₹)
              </label>
              <input
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-bold text-sm text-botanical-950"
              />
              <p className="text-[11px] text-botanical-700/70 mt-1">Orders at or above this amount receive free home sample collection.</p>
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">
                Standard Home Collection Fee (₹)
              </label>
              <input
                type="number"
                value={collectionFee}
                onChange={(e) => setCollectionFee(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-bold text-sm text-botanical-950"
              />
              <p className="text-[11px] text-botanical-700/70 mt-1">Charged when the order subtotal is below the free threshold.</p>
            </div>
          </div>
        </div>

        {/* Dispatch & Capacities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-ivory-200">
            <Clock className="w-5 h-5 text-botanical-600" />
            <h2 className="text-base font-bold text-botanical-950">Phlebotomy Slot Capacity & Operating Hours</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-botanical-900 mb-1">Maximum Phlebotomy Capacity Per Slot</label>
              <input
                type="number"
                value={slotCapacity}
                onChange={(e) => setSlotCapacity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-bold text-sm text-botanical-950"
              />
              <p className="text-[11px] text-botanical-700/70 mt-1">Prevents overbooking when mobile phlebotomist capacity is reached.</p>
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">Laboratory Operating Hours</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-semibold text-sm text-botanical-950"
              />
            </div>
          </div>
        </div>

        {/* Laboratory Info & Accreditations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-ivory-200">
            <ShieldCheck className="w-5 h-5 text-botanical-600" />
            <h2 className="text-base font-bold text-botanical-950">Laboratory Accreditations & Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-botanical-900 mb-1">Licensed Entity Name</label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">NABL Accreditation Certificate ID</label>
              <input
                type="text"
                value={nablCode}
                onChange={(e) => setNablCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-botanical-900 mb-1">Registered Pathology Hub Address</label>
              <input
                type="text"
                value={labAddress}
                onChange={(e) => setLabAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300"
              />
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">Support Phone</label>
              <input
                type="text"
                value={labPhone}
                onChange={(e) => setLabPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300"
              />
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">Official Clinical Email</label>
              <input
                type="email"
                value={labEmail}
                onChange={(e) => setLabEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-sm shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Laboratory Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
