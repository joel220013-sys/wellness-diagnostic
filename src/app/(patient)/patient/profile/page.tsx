'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Heart, 
  Save, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PatientProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Sarah Jenkins');
  const [email, setEmail] = useState(user?.email || 'patient@wellness.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [dob, setDob] = useState('1994-06-18');
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+ Positive');
  const [emergencyContact, setEmergencyContact] = useState('+91 98111 55667 (Husband)');
  const [allergies, setAllergies] = useState('None reported');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-botanical-950">Patient Medical Profile</h1>
        <p className="text-xs sm:text-sm text-botanical-700/80">
          Manage your contact credentials, clinical file identity, and physiological details
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Patient profile updated successfully in secure database.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
            <div className="w-10 h-10 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-botanical-950">Basic Information</h2>
              <p className="text-xs text-botanical-700/80">Verified clinical patient file</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Patient ID Reference</label>
              <input
                type="text"
                disabled
                value={user?.patientId || 'WD-PT-8842'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-sm font-mono text-botanical-800 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-sm text-botanical-800 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500"
              />
            </div>
          </div>
        </div>

        {/* Clinical & Physiological Record */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
            <div className="w-10 h-10 rounded-2xl bg-peach-50 text-peach-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-botanical-950">Physiological & Emergency Details</h2>
              <p className="text-xs text-botanical-700/80">Used by laboratory pathologists for reference ranges</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold bg-white text-botanical-950"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold bg-white text-botanical-950"
              >
                <option value="A+ Positive">A+ Positive</option>
                <option value="A- Negative">A- Negative</option>
                <option value="B+ Positive">B+ Positive</option>
                <option value="B- Negative">B- Negative</option>
                <option value="O+ Positive">O+ Positive</option>
                <option value="O- Negative">O- Negative</option>
                <option value="AB+ Positive">AB+ Positive</option>
                <option value="AB- Negative">AB- Negative</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Known Allergies / Clinical Notes</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-sm shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
}
