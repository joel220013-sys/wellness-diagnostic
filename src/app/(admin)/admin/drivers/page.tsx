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
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function AdminDriversPage() {
  const { drivers, bookings, addDriver, syncDrivers } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('Davangere Cold-Chain Van (4°C Insulated)');

  const filteredDrivers = drivers.filter((d) =>
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.badge_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.phone || '').includes(searchQuery)
  );

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFeedback({ type: 'error', message: 'Name and Phone number are required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const generatedBadge = badgeId.trim() || `WD-PHLEB-${Math.floor(100 + Math.random() * 900)}`;
    const result = await addDriver({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      badge_id: generatedBadge,
      vehicle_details: vehicleDetails,
      designation: 'Certified Senior Phlebotomist',
    });

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: `Phlebotomist ${name} registered successfully!` });
      setTimeout(() => {
        setName('');
        setPhone('');
        setEmail('');
        setBadgeId('');
        setShowAddModal(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to register phlebotomist.' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Phlebotomist Staff Directory</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Certified mobile phlebotomists with temperature-monitored cold chain transportation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => syncDrivers()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-ivory-300 text-botanical-800 hover:bg-ivory-100 font-bold text-xs shadow-soft-sm transition-all"
            title="Refresh fleet list from Supabase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Fleet</span>
          </button>

          <button
            onClick={() => {
              setFeedback(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Phlebotomist</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-ivory-300 shadow-soft-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-botanical-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, badge ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-ivory-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-botanical-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto border border-ivory-300 shadow-soft-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Truck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-botanical-950">No Phlebotomists Listed</h3>
          <p className="text-xs text-botanical-700/80 leading-relaxed">
            There are currently no phlebotomists registered in the directory. You can load certified staff or register new mobile collection specialists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => syncDrivers()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
            >
              ⚡ Load Certified Phlebotomists
            </button>
            <button
              onClick={() => {
                setFeedback(null);
                setShowAddModal(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-900 font-bold text-xs transition-all"
            >
              + Register New Staff
            </button>
          </div>
        </div>
      ) : (
        /* Driver Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => {
            const activeJobs = bookings.filter(
              (b) => (b.driver_id === driver.id || b.assigned_driver_id === driver.id) && 
                ['Assigned', 'Collection Scheduled', 'Sample Collected'].includes(b.status)
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
                      Badge: {driver.badge_id || 'WD-PHLEB'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                      {(driver.name || 'P').charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-botanical-950">{driver.name}</h2>
                      <p className="text-xs text-botanical-700/80">{driver.designation || 'Certified Senior Phlebotomist'}</p>
                      <p className="text-xs text-botanical-900 font-semibold mt-0.5">📞 {driver.phone}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs text-botanical-800 space-y-1">
                    <p>Vehicle: <strong>{driver.vehicle_details || 'Davangere Cold-Chain Van'}</strong></p>
                    <p>Cold Chain: <strong>4°C Insulated Cooler Box Verified</strong></p>
                    <p>Zone: <strong>Davangere Hub & Rural Outreaches</strong></p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-botanical-950">
                    <Clock className="w-3.5 h-3.5 text-botanical-600" />
                    <span>{activeJobs.length} Active Collections</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-[11px] border border-emerald-200">
                    Active Phlebotomist
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Phlebotomist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-soft-lg border border-ivory-300">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-botanical-600" />
                <h3 className="text-base font-bold text-botanical-950">Register New Phlebotomist</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-botanical-400 hover:text-botanical-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleRegisterDriver} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-botanical-900 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="ramesh.phleb@wellness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">Certification Badge ID</label>
                <input
                  type="text"
                  placeholder="WD-PHLEB-DVG-01"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 font-mono text-xs text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">Transport Vehicle & Cold-Chain Box</label>
                <input
                  type="text"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-botanical-700 hover:bg-ivory-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-soft transition-all"
                >
                  {isSubmitting ? 'Registering...' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
