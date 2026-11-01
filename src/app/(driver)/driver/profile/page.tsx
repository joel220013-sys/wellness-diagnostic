'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Truck, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DriverProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [vehicle, setVehicle] = useState('Mobile Diagnostics Lab Van (Davangere Hub)');
  const [coolerSerial, setCoolerSerial] = useState('MED-COOL-BOX-884');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-botanical-950">Phlebotomist Profile & Credentials</h1>
        <p className="text-xs sm:text-sm text-botanical-700/80">
          Mobile diagnostic equipment calibration, vehicle details, and certification credentials
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Phlebotomist profile updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-botanical-950">Staff Identity</h2>
              <p className="text-xs text-botanical-700/80">Authorized mobile phlebotomist credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-botanical-900 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">Phlebotomy Badge ID</label>
              <input
                type="text"
                disabled
                value={user?.badgeId || 'WD-PHLEB-104'}
                className="w-full p-2.5 rounded-xl border border-ivory-300 bg-ivory-50 font-mono text-botanical-800"
              />
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">Email Account</label>
              <input
                type="email"
                disabled
                value={user?.email || 'driver@wellness.com'}
                className="w-full p-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-botanical-800"
              />
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Cold-Chain & Vehicle Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
            <div className="w-10 h-10 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-botanical-950">Vehicle & Cold-Chain Equipment</h2>
              <p className="text-xs text-botanical-700/80">Pathology specimen integrity verification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-botanical-900 mb-1">Vehicle Unit & Registration</label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-botanical-900 mb-1">Cold Chain Box Serial Number</label>
              <input
                type="text"
                value={coolerSerial}
                onChange={(e) => setCoolerSerial(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-ivory-300 font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-ivory-100/80 border border-ivory-200 text-xs space-y-1">
            <p className="font-bold text-botanical-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Phlebotomist Safety Checklist:</span>
            </p>
            <p className="text-botanical-800">
              • Sterile single-use BD vacutainer needles verified
            </p>
            <p className="text-botanical-800">
              • Calibrated digital thermometer maintained at 2°C – 8°C
            </p>
            <p className="text-botanical-800">
              • Sharps disposal biohazard container mounted and secure
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-sm shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Update Phlebotomist Record</span>
          </button>
        </div>
      </form>
    </div>
  );
}
