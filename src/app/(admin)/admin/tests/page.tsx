'use client';

import React, { useState } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X,
  Filter
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { DiagnosticTest } from '@/types';

export default function AdminTestsPage() {
  const { tests, addTestPackage, updateTestPackage, deleteTestPackage } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<DiagnosticTest | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Routine Hemogram');
  const [formPrice, setFormPrice] = useState('499');
  const [formTurnaround, setFormTurnaround] = useState('12 Hours');
  const [formSampleType, setFormSampleType] = useState('Blood (EDTA & Serum)');
  const [formPrep, setFormPrep] = useState('Fasting 8-10 hours required.');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);

  const categories = ['ALL', ...Array.from(new Set(tests.map((t) => t.category)))];

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingTest(null);
    setFormName('');
    setFormCategory('Routine Hemogram');
    setFormPrice('499');
    setFormTurnaround('12 Hours');
    setFormSampleType('Blood (EDTA & Serum)');
    setFormPrep('Fasting 8-10 hours required.');
    setFormDesc('Comprehensive blood analysis parameter test.');
    setFormActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (test: DiagnosticTest) => {
    setEditingTest(test);
    setFormName(test.name);
    setFormCategory(test.category);
    setFormPrice(test.price.toString());
    setFormTurnaround(test.turnaround_description);
    setFormSampleType(test.sample_type);
    setFormPrep(test.preparation_instructions || '');
    setFormDesc(test.description);
    setFormActive(test.active);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingTest) {
        await updateTestPackage(editingTest.id, {
          name: formName,
          category: formCategory as any,
          price: Number(formPrice),
          turnaround_description: formTurnaround,
          sample_type: formSampleType,
          preparation_instructions: formPrep,
          description: formDesc,
          active: formActive
        });
        setToastMessage(`Test "${formName}" updated successfully in database!`);
      } else {
        await addTestPackage({
          name: formName,
          slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: formCategory as any,
          price: Number(formPrice),
          turnaround_description: formTurnaround,
          sample_type: formSampleType,
          preparation_instructions: formPrep,
          description: formDesc,
          active: formActive,
          popular: false
        });
        setToastMessage(`Test "${formName}" created successfully in database!`);
      }
      setShowModal(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to save test:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-900 shadow-soft animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Diagnostic Test Catalog</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Configure laboratory tests, fasting instructions, sample vials, and pricing in INR (₹)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Test</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-botanical-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ivory-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-botanical-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-botanical-500 text-white font-bold shadow-soft-sm'
                  : 'bg-ivory-100 text-botanical-800 hover:bg-ivory-200 border border-ivory-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/90 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-3.5">Test Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Sample Tube</th>
                <th className="p-3.5">Turnaround</th>
                <th className="p-3.5">Price (₹)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-ivory-50/60 transition-colors">
                  <td className="p-3.5 font-bold text-botanical-950">
                    <p>{test.name}</p>
                    <p className="text-[11px] font-normal text-botanical-700/70 truncate max-w-xs">{test.description}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ivory-200 text-botanical-800">
                      {test.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-botanical-800">{test.sample_type}</td>
                  <td className="p-3.5 font-semibold text-botanical-700">{test.turnaround_description}</td>
                  <td className="p-3.5 font-extrabold text-botanical-950 text-sm">₹{test.price}</td>
                  <td className="p-3.5">
                    <button
                      onClick={async () => {
                        const newActive = !test.active;
                        await updateTestPackage(test.id, { active: newActive });
                        setToastMessage(`Test "${test.name}" marked ${newActive ? 'Active' : 'Inactive'}.`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        test.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {test.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(test)}
                      className="p-1.5 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-botanical-800"
                      title="Edit Test"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete ${test.name} permanently from database?`)) {
                          await deleteTestPackage(test.id);
                          setToastMessage(`Test "${test.name}" deleted permanently.`);
                          setTimeout(() => setToastMessage(null), 4000);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete Test"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-soft-lg border border-ivory-300">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="text-base font-bold text-botanical-950">
                {editingTest ? 'Edit Diagnostic Test' : 'Add Diagnostic Test'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-botanical-500 hover:text-botanical-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Test Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ivory-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Price (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ivory-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Turnaround Time</label>
                  <input
                    type="text"
                    required
                    value={formTurnaround}
                    onChange={(e) => setFormTurnaround(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Sample / Tube Type</label>
                  <input
                    type="text"
                    required
                    value={formSampleType}
                    onChange={(e) => setFormSampleType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Fasting Instructions</label>
                  <input
                    type="text"
                    value={formPrep}
                    onChange={(e) => setFormPrep(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-botanical-900 mb-1">Test Description</label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded text-botanical-600"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-botanical-900">
                  Active for Online Home Collection Booking
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-botanical-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all inline-flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>{editingTest ? 'Save Changes' : 'Create Test'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
