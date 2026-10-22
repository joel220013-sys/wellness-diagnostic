'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function AdminPackagesPage() {
  const { packages } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Diagnostic Health Packages</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Bundled pathology checkup profiles with promotional package pricing in INR (₹)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Package Profile</span>
        </button>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm hover:border-botanical-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-peach-100 text-botanical-900 border border-peach-200">
                  {pkg.parameters_count || 50}+ Parameters
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>

              <h2 className="text-lg font-bold text-botanical-950">{pkg.name}</h2>
              <p className="text-xs text-botanical-700/80 line-clamp-2">{pkg.description}</p>

              <div className="p-3 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs text-botanical-800 space-y-1">
                <p>Turnaround: <strong>{pkg.turnaround_description || '24 Hours'}</strong></p>
                <p>Sample: <strong>{pkg.sample_type || 'Blood & Urine'}</strong></p>
                <p>Fasting: <strong>{pkg.preparation_instructions || '10-12 hours overnight'}</strong></p>
              </div>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-2xl font-extrabold text-botanical-950">₹{pkg.price}</span>
                {pkg.original_price && (
                  <>
                    <span className="text-xs text-botanical-700/60 line-through">₹{pkg.original_price}</span>
                    <span className="text-xs font-bold text-emerald-700">
                      Save {Math.round(((pkg.original_price - pkg.price) / pkg.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-botanical-600 font-semibold">
                Available for Home Collection
              </span>
              <button
                onClick={() => alert(`Package ${pkg.name} editor ready.`)}
                className="px-3 py-1.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-800 font-semibold"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-soft-lg border border-ivory-300">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="text-base font-bold text-botanical-950">Create Health Package</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-botanical-700/80">Configure comprehensive multi-test profile.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Package Name</label>
                <input type="text" placeholder="e.g. Senior Citizen Complete Care" className="w-full p-2.5 rounded-xl border border-ivory-300" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Price (₹)</label>
                  <input type="number" defaultValue="1499" className="w-full p-2.5 rounded-xl border border-ivory-300 font-bold" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Original Price (₹)</label>
                  <input type="number" defaultValue="2999" className="w-full p-2.5 rounded-xl border border-ivory-300" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-ivory-200">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs text-botanical-700">Cancel</button>
              <button onClick={() => { setShowAddModal(false); alert('Package added successfully.'); }} className="px-5 py-2 bg-botanical-500 text-white rounded-xl font-bold text-xs">Save Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
