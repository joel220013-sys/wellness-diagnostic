'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Navigation, 
  ExternalLink,
  ShieldCheck,
  XCircle,
  X,
  FileCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { BookingStatus } from '@/types';

const DynamicDriverMap = dynamic(() => import('@/components/map/DriverDirectionsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-ivory-100 rounded-2xl flex items-center justify-center text-xs text-botanical-700">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      <span>Loading route map...</span>
    </div>
  ),
});

export default function DriverAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useData();

  const bookingId = params.id as string;
  const booking = bookings.find((b) => b.id === bookingId || b.booking_reference === bookingId);

  // Modals state
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  // Collection completion inputs
  const [barcode, setBarcode] = useState(`WD-BAR-${Math.floor(100000 + Math.random() * 900000)}`);
  const [tubeCount, setTubeCount] = useState('2');
  const [fastingVerified, setFastingVerified] = useState(true);
  const [operationalNotes, setOperationalNotes] = useState('Sterile venipuncture successful at left antecubital vein. Inverted tubes 8 times. Placed in 4°C cool box.');

  // Failure inputs
  const [failReason, setFailReason] = useState('Patient Not Available at Address');
  const [failNotes, setFailNotes] = useState('Arrived on site, waited 15 minutes, called patient phone 3 times without answer.');

  if (!booking) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-ivory-300 text-center space-y-4 max-w-md mx-auto shadow-soft">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-botanical-950">Job Assignment Not Found</h2>
        <Link href="/driver/assignments" className="inline-block px-4 py-2 bg-botanical-500 text-white font-bold text-xs rounded-xl">
          Return to My Tasks
        </Link>
      </div>
    );
  }

  const lat = booking.address_snapshot?.latitude || 28.4595;
  const lng = booking.address_snapshot?.longitude || 77.0266;
  const addressText = `${booking.address_snapshot?.address_line_1}, ${booking.address_snapshot?.locality}, ${booking.address_snapshot?.city}`;

  const handleStartCollection = () => {
    updateBookingStatus(booking.id, 'Collection Scheduled');
    alert('Collection started! Status updated to in-transit.');
  };

  const handleCompleteCollection = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookingStatus(booking.id, 'Sample Collected', {
      collected_at: new Date().toLocaleTimeString(),
      sample_barcode: barcode,
      temperature_recorded: '4.2°C Cold Chain',
      notes: operationalNotes
    });
    setShowCollectModal(false);
    alert('Sample collection recorded successfully! Cold chain audit timestamp generated.');
  };

  const handleFailCollection = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookingStatus(booking.id, 'Failed', {
      notes: `Failed: ${failReason}. ${failNotes}`
    });
    setShowFailModal(false);
    alert('Collection marked as Failed with operational reason.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/driver/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-700 hover:text-botanical-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Tasks</span>
        </Link>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-200">
          Status: {booking.status}
        </span>
      </div>

      {/* Main Task Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
          <div>
            <span className="text-xs font-bold text-botanical-950">Collection Task #{booking.booking_reference}</span>
            <h1 className="text-2xl font-extrabold text-botanical-950 mt-0.5">{booking.patient_name}</h1>
            <p className="text-xs text-botanical-700 mt-1">
              Scheduled Date: <strong>{booking.scheduled_date}</strong> • Slot: <strong>{booking.scheduled_slot}</strong>
            </p>
          </div>

          <a
            href={`tel:${booking.patient_phone}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft"
          >
            <Phone className="w-4 h-4" />
            <span>Call Patient</span>
          </a>
        </div>

        {/* Map Preview & GPS Navigation */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-botanical-900">
            Confirmed Patient Location & Route
          </p>
          <DynamicDriverMap
            latitude={lat}
            longitude={lng}
            patientName={booking.patient_name}
            addressText={addressText}
          />
        </div>

        {/* Patient Instructions & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-1">
            <p className="font-bold text-botanical-900">Patient Details:</p>
            <p><strong>Name:</strong> {booking.patient_name}</p>
            <p><strong>Phone:</strong> {booking.patient_phone}</p>
            {booking.address_snapshot?.landmark && (
              <p className="text-botanical-700 pt-1">
                Landmark: <strong>{booking.address_snapshot.landmark}</strong>
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1 text-amber-950">
            <p className="font-bold">Access & Phlebotomist Instructions:</p>
            <p>{booking.address_snapshot?.access_instructions || 'Standard domestic sample pickup. Sanitize kit at entry.'}</p>
            {booking.patient_notes && (
              <p className="italic pt-1 font-medium">Notes: {booking.patient_notes}</p>
            )}
          </div>
        </div>

        {/* Required Blood Tubes & Tests */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-botanical-900">
            Pathology Tests Required for this Appointment:
          </p>
          <div className="divide-y divide-ivory-100 border border-ivory-200 rounded-2xl overflow-hidden">
            {(booking.items || []).map((it, idx) => (
              <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-botanical-950">{it.item_name}</p>
                  <p className="text-[11px] text-botanical-700/80">Tube: EDTA Lavender & Serum Gel Gold Top</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ivory-100 text-botanical-800">
                  Fasting Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-ivory-200 flex flex-col sm:flex-row gap-3">
          {booking.status === 'Assigned' && (
            <button
              onClick={handleStartCollection}
              className="flex-1 py-3.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-sm shadow-soft transition-all"
            >
              Start Trip / En Route
            </button>
          )}

          {['Assigned', 'Collection Scheduled'].includes(booking.status) && (
            <>
              <button
                onClick={() => setShowCollectModal(true)}
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark Sample Collected</span>
              </button>

              <button
                onClick={() => setShowFailModal(true)}
                className="px-5 py-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Collection Failed</span>
              </button>
            </>
          )}

          {booking.status === 'Sample Collected' && (
            <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Blood sample collected and logged in cold chain transportation box.</span>
              </div>
              <span className="font-mono text-xs">Vial: {booking.sample_details?.sample_barcode || 'WD-BAR-9901'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Mark Sample Collected */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-soft-lg border border-ivory-300">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="text-base font-bold text-botanical-950">Confirm Sample Collection</h3>
              <button onClick={() => setShowCollectModal(false)}><X className="w-5 h-5 text-botanical-500" /></button>
            </div>

            <form onSubmit={handleCompleteCollection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-botanical-900 mb-1">Assigned Vial Barcode ID</label>
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 font-mono font-bold text-botanical-950"
                />
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">Number of Tubes Collected</label>
                <input
                  type="number"
                  required
                  value={tubeCount}
                  onChange={(e) => setTubeCount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fastingCheck"
                  checked={fastingVerified}
                  onChange={(e) => setFastingVerified(e.target.checked)}
                  className="rounded text-botanical-600"
                />
                <label htmlFor="fastingCheck" className="font-semibold text-botanical-900">
                  Confirmed patient fasting protocol followed
                </label>
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">Phlebotomist Operational Notes</label>
                <textarea
                  rows={3}
                  value={operationalNotes}
                  onChange={(e) => setOperationalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 text-botanical-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-soft"
                >
                  Confirm & Log Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mark Collection Failed */}
      {showFailModal && (
        <div className="fixed inset-0 z-50 bg-botanical-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-soft-lg border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="text-base font-bold text-rose-950">Record Collection Failure</h3>
              <button onClick={() => setShowFailModal(false)}><X className="w-5 h-5 text-botanical-500" /></button>
            </div>

            <form onSubmit={handleFailCollection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-botanical-900 mb-1">Reason for Inability to Collect</label>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 bg-white font-semibold"
                >
                  <option value="Patient Not Available at Address">Patient Not Available at Address</option>
                  <option value="Patient Refused Blood Collection">Patient Refused Blood Collection</option>
                  <option value="Inadequate Fasting / Protocol Broken">Inadequate Fasting / Protocol Broken</option>
                  <option value="Incorrect Address / Inaccessible Location">Incorrect Address / Inaccessible Location</option>
                  <option value="Patient Requested Reschedule">Patient Requested Reschedule</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">Operational Incident Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={failNotes}
                  onChange={(e) => setFailNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setShowFailModal(false)}
                  className="px-4 py-2 text-botanical-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-soft"
                >
                  Log Failed Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
