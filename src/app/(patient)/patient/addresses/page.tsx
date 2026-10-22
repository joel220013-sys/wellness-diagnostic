'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Home, 
  Briefcase, 
  Users, 
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AddressMapPickerWrapper from '@/components/map/AddressMapPickerWrapper';
import { AddressInput } from '@/lib/validations';

const INITIAL_SAVED_ADDRESSES: AddressInput[] = [
  {
    id: 'addr_1',
    recipient_name: 'Sarah Jenkins',
    recipient_phone: '+91 98765 43210',
    phone: '+91 98765 43210',
    label: 'Home',
    address_line_1: 'Tower B, Flat 402, Greenfield Residences',
    address_line_2: 'Golf Course Extension Road',
    locality: 'Sector 65',
    city: 'Gurugram',
    state: 'Haryana',
    postal_code: '122018',
    latitude: 28.4022,
    longitude: 77.0654,
    landmark: 'Near Club House Gate 2',
    access_instructions: 'Ring doorbell twice. Phlebotomist kit disinfection at entrance.',
    is_default: true
  },
  {
    id: 'addr_2',
    recipient_name: 'Sarah Jenkins',
    recipient_phone: '+91 98765 43210',
    phone: '+91 98765 43210',
    label: 'Work',
    address_line_1: 'Cyber Hub Building 10, 6th Floor',
    address_line_2: 'DLF Phase 2',
    locality: 'DLF Cyber City',
    city: 'Gurugram',
    state: 'Haryana',
    postal_code: '122002',
    latitude: 28.4952,
    longitude: 77.0892,
    landmark: 'Opposite Cyber Hub Amphitheatre',
    access_instructions: 'Inform reception for guest pass.',
    is_default: false
  }
];

export default function PatientAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressInput[]>(INITIAL_SAVED_ADDRESSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressInput | null>(null);

  const handleSetDefault = (id?: string) => {
    if (!id) return;
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        is_default: addr.id === id
      }))
    );
  };

  const handleDeleteAddress = (id?: string) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this saved collection address?')) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSaveAddress = (address: AddressInput) => {
    if (editingAddress?.id) {
      // Edit
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? { ...address, id: editingAddress.id } : a))
      );
    } else {
      // Add new
      const newAddress: AddressInput = {
        ...address,
        id: `addr_${Date.now()}`,
        is_default: addresses.length === 0
      };
      setAddresses((prev) => [...prev, newAddress]);
    }
    setShowAddModal(false);
    setEditingAddress(null);
  };

  const getLabelIcon = (label?: string) => {
    switch (label) {
      case 'Work':
        return <Briefcase className="w-4 h-4 text-sky-600" />;
      case 'Parents':
      case 'Other':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Home className="w-4 h-4 text-botanical-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-botanical-950">Saved Collection Addresses</h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Pre-saved verified GPS locations for fast home blood collection booking
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAddress(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 rounded-3xl border transition-all bg-white shadow-soft-sm relative flex flex-col justify-between ${
              addr.is_default
                ? 'border-botanical-500 ring-1 ring-botanical-500'
                : 'border-ivory-300 hover:border-botanical-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-ivory-100">
                    {getLabelIcon(addr.label)}
                  </div>
                  <span className="text-sm font-bold text-botanical-950">{addr.label || 'Address'}</span>
                </div>

                {addr.is_default ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-botanical-100 text-botanical-800 border border-botanical-200">
                    Default Address
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-botanical-600 hover:text-botanical-800 underline"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs text-botanical-800">
                <p className="font-bold text-sm text-botanical-950">{addr.recipient_name}</p>
                <p className="text-botanical-700">Phone: {addr.phone || addr.recipient_phone}</p>
                <p className="pt-1">{addr.address_line_1}</p>
                {addr.address_line_2 && <p>{addr.address_line_2}</p>}
                <p>{addr.locality}, {addr.city} - {addr.postal_code}, {addr.state}</p>
                {addr.landmark && (
                  <p className="text-[11px] text-botanical-700/80 mt-1">
                    Landmark: <strong>{addr.landmark}</strong>
                  </p>
                )}
                {addr.access_instructions && (
                  <p className="text-[11px] text-botanical-700/80 italic mt-1">
                    Instructions: {addr.access_instructions}
                  </p>
                )}
                {addr.latitude && addr.longitude && (
                  <p className="text-[10px] text-botanical-600/70 font-mono mt-1">
                    Pin: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingAddress(addr);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-botanical-700 hover:text-botanical-950"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Address Modal with Interactive Map */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-4 shadow-soft-lg my-8 max-h-[90vh] overflow-y-auto border border-ivory-300">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h2 className="text-lg font-bold text-botanical-950">
                {editingAddress ? 'Edit Collection Address' : 'Add New Collection Address'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-botanical-600 hover:bg-ivory-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AddressMapPickerWrapper
              initialAddress={editingAddress || undefined}
              onConfirmAddress={handleSaveAddress}
            />
          </div>
        </div>
      )}
    </div>
  );
}
