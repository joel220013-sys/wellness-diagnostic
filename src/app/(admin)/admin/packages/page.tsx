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
  Sparkles,
  AlertCircle,
  Loader2,
  Clock,
  Droplet,
  Coffee,
  Tag
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { DiagnosticPackage } from '@/types/test';

export default function AdminPackagesPage() {
  const { packages, addPackage, updatePackage, deletePackage, syncPackages } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<DiagnosticPackage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('499');
  const [formOriginalPrice, setFormOriginalPrice] = useState('999');
  const [formParametersCount, setFormParametersCount] = useState('10');
  const [formTurnaround, setFormTurnaround] = useState('24-38 Hours');
  const [formSampleType, setFormSampleType] = useState('Blood');
  const [formPrep, setFormPrep] = useState('10-12 hours overnight fasting required.');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formPopular, setFormPopular] = useState(false);

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setFormName('');
    setFormPrice('999');
    setFormOriginalPrice('1999');
    setFormParametersCount('30');
    setFormTurnaround('24-38 Hours');
    setFormSampleType('Blood & Urine');
    setFormPrep('10-12 hours overnight fasting required.');
    setFormDesc('Comprehensive preventive health checkup package screening multiple vital organs.');
    setFormActive(true);
    setFormPopular(false);
    setShowModal(true);
  };

  const handleOpenEdit = (pkg: DiagnosticPackage) => {
    setEditingPkg(pkg);
    setFormName(pkg.name);
    setFormPrice(pkg.price.toString());
    setFormOriginalPrice(pkg.original_price ? pkg.original_price.toString() : '');
    setFormParametersCount((pkg.parameters_count || 10).toString());
    setFormTurnaround(pkg.turnaround_description || '24-38 Hours');
    setFormSampleType(pkg.sample_type || 'Blood');
    setFormPrep(pkg.preparation_instructions || '10-12 hours overnight fasting required.');
    setFormDesc(pkg.description || '');
    setFormActive(pkg.active);
    setFormPopular(Boolean(pkg.popular));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const priceNum = Number(formPrice) || 0;
      const origPriceNum = formOriginalPrice ? Number(formOriginalPrice) : undefined;
      const paramCountNum = Number(formParametersCount) || 1;

      if (editingPkg) {
        await updatePackage(editingPkg.id, {
          name: formName.trim(),
          price: priceNum,
          original_price: origPriceNum,
          parameters_count: paramCountNum,
          turnaround_description: formTurnaround.trim(),
          sample_type: formSampleType.trim(),
          preparation_instructions: formPrep.trim(),
          description: formDesc.trim(),
          active: formActive,
          popular: formPopular,
        });
        setToastMessage(`Package "${formName}" updated successfully in live database!`);
      } else {
        await addPackage({
          name: formName.trim(),
          slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          price: priceNum,
          original_price: origPriceNum,
          parameters_count: paramCountNum,
          turnaround_description: formTurnaround.trim(),
          sample_type: formSampleType.trim(),
          preparation_instructions: formPrep.trim(),
          description: formDesc.trim(),
          active: formActive,
          popular: formPopular,
        });
        setToastMessage(`New package "${formName}" added successfully to live catalog!`);
      }
      setShowModal(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(`Error saving package: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (pkgId: string, pkgName: string) => {
    if (!confirm(`Are you sure you want to delete the package "${pkgName}" permanently from the database?`)) {
      return;
    }
    setIsSaving(true);
    try {
      await deletePackage(pkgId);
      setShowModal(false);
      setToastMessage(`Package "${pkgName}" deleted successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(`Error deleting package: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Diagnostic Health Packages</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Bundled pathology checkup profiles with promotional package pricing in INR (₹)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Package Profile</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-botanical-400" />
        <input
          type="text"
          placeholder="Search packages by title or analyte details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none text-botanical-950 bg-transparent"
        />
        <span className="text-xs font-bold text-botanical-600 whitespace-nowrap">
          {filteredPackages.length} Packages Found
        </span>
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
                  {pkg.parameters_count || 10}+ Parameters
                </span>
                <div className="flex items-center gap-1.5">
                  {pkg.popular && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                      Popular
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pkg.active ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                    {pkg.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-botanical-950">{pkg.name}</h2>
              <p className="text-xs text-botanical-700/80 line-clamp-2">{pkg.description}</p>

              <div className="p-3 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs text-botanical-800 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-botanical-500" />
                  <span>Turnaround: <strong>{pkg.turnaround_description || '24-38 Hours'}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-botanical-500" />
                  <span>Sample: <strong>{pkg.sample_type || 'Blood'}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-botanical-500" />
                  <span>Fasting: <strong>{pkg.preparation_instructions || '10-12 hours overnight'}</strong></span>
                </p>
              </div>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-2xl font-extrabold text-botanical-950">₹{pkg.price}</span>
                {pkg.original_price && pkg.original_price > pkg.price && (
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
                onClick={() => handleOpenEdit(pkg)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-botanical-50 hover:bg-botanical-100 text-botanical-900 border border-botanical-200 font-bold transition-colors"
                title="Edit Package Details"
              >
                <Edit3 className="w-3.5 h-3.5 text-botanical-600" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Package Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-ivory-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-botanical-100 text-botanical-700 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-botanical-950">
                    {editingPkg ? `Edit Package: ${editingPkg.name}` : 'Create New Health Package'}
                  </h3>
                  <p className="text-xs text-botanical-700/80">
                    Changes sync immediately with Supabase database & patient catalog
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-botanical-400 hover:text-botanical-950 hover:bg-ivory-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Package Name */}
              <div>
                <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Senior Citizen Comprehensive Checkup"
                  className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
                />
              </div>

              {/* Pricing & Parameter Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                    Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="499"
                    className="w-full p-3 rounded-2xl border border-ivory-300 font-extrabold text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                    MRP / Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="999"
                    className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs text-botanical-700 focus:outline-none focus:border-botanical-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                    Parameters Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formParametersCount}
                    onChange={(e) => setFormParametersCount(e.target.value)}
                    placeholder="10"
                    className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
                  />
                </div>
              </div>

              {/* Turnaround & Sample */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                    Turnaround Time
                  </label>
                  <input
                    type="text"
                    value={formTurnaround}
                    onChange={(e) => setFormTurnaround(e.target.value)}
                    placeholder="24-38 Hours"
                    className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                    Sample Type
                  </label>
                  <input
                    type="text"
                    value={formSampleType}
                    onChange={(e) => setFormSampleType(e.target.value)}
                    placeholder="Blood, Urine"
                    className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
                  />
                </div>
              </div>

              {/* Fasting / Preparation */}
              <div>
                <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                  Preparation / Fasting Instructions
                </label>
                <input
                  type="text"
                  value={formPrep}
                  onChange={(e) => setFormPrep(e.target.value)}
                  placeholder="10-12 hours overnight fasting required."
                  className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-botanical-950 uppercase tracking-wider text-[11px] mb-1">
                  Package Description
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detailed description of what vital bodily systems are evaluated..."
                  className="w-full p-3 rounded-2xl border border-ivory-300 font-semibold text-xs text-botanical-950 focus:outline-none focus:border-botanical-500"
                />
              </div>

              {/* Toggles */}
              <div className="p-4 bg-ivory-50/70 rounded-2xl border border-ivory-200 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-botanical-600 focus:ring-botanical-500 border-ivory-300"
                  />
                  <span className="font-bold text-botanical-950">Active in Patient Booking Catalog</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPopular}
                    onChange={(e) => setFormPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-ivory-300"
                  />
                  <span className="font-bold text-amber-950">Highlight as Popular Package</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-ivory-200">
                {editingPkg ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingPkg.id, editingPkg.name)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Package</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-botanical-700 hover:bg-ivory-100 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingPkg ? 'Save Changes' : 'Create Package'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
