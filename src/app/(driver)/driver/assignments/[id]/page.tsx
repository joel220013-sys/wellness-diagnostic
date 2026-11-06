'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
  TestTube2,
  DollarSign,
  AlertTriangle,
  Play,
  Truck,
  RotateCcw,
  Check,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { BookingStatus } from '@/types';
import { formatFriendlyDate } from '@/lib/dateUtils';

const DynamicDriverMap = dynamic(() => import('@/components/map/DriverDirectionsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-ivory-100 rounded-2xl flex items-center justify-center text-xs text-botanical-700 border border-ivory-300">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      <span>Loading route map & GPS coordinates...</span>
    </div>
  ),
});

type WorkflowStep = 1 | 2 | 3 | 4;

export default function DriverAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { bookings, tests, updateBookingStatus, syncBookings } = useData();

  const bookingId = params.id as string;
  const booking = bookings.find((b) => b.id === bookingId || b.booking_reference === bookingId);

  // Determine starting step based on booking status & stored details
  const getInitialStep = (): WorkflowStep => {
    if (!booking) return 1;
    const s = (booking.status || '').toLowerCase().trim();
    if (
      s === 'sample collected' || 
      s === 'sample_collected' || 
      s === 'processing' || 
      s === 'report ready' || 
      s === 'report_ready'
    ) {
      return 4;
    }
    if (s === 'arrived' || s === 'at location' || booking.sample_details?.temperature_recorded) {
      return 3;
    }
    if (s === 'collection scheduled' || s === 'collection_scheduled' || s === 'in transit' || s === 'in_transit') {
      return 2;
    }
    return 1;
  };

  const [activeStep, setActiveStep] = useState<WorkflowStep>(getInitialStep);
  const [cashCollected, setCashCollected] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  // Collection completion inputs
  const [barcode, setBarcode] = useState(
    booking?.sample_details?.sample_barcode || 
    booking?.sample_details?.barcode || 
    `WD-BAR-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [tubeCount, setTubeCount] = useState(
    String(booking?.sample_details?.tube_count || '2')
  );
  const [fastingVerified, setFastingVerified] = useState(true);
  const [operationalNotes, setOperationalNotes] = useState(
    booking?.sample_details?.notes || 
    'Sterile venipuncture successful. Placed in 4°C cool box.'
  );

  // Failure inputs
  const [failReason, setFailReason] = useState('Patient Not Available at Address');
  const [failNotes, setFailNotes] = useState('Arrived on site, waited 15 minutes, called patient phone 3 times without answer.');

  // Keep step in sync if booking status changes externally
  useEffect(() => {
    if (booking) {
      const s = (booking.status || '').toLowerCase().trim();
      if (s === 'sample collected' || s === 'sample_collected' || s === 'processing' || s === 'report ready') {
        setActiveStep(4);
      }
    }
  }, [booking?.status]);

  if (!booking) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-ivory-300 text-center space-y-4 max-w-md mx-auto shadow-soft">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-botanical-950">Job Assignment Not Found</h2>
        <p className="text-xs text-botanical-700">The requested phlebotomy task could not be loaded or was reassigned.</p>
        <Link href="/driver/dashboard" className="inline-block px-5 py-2.5 bg-botanical-500 text-white font-bold text-xs rounded-xl shadow-soft">
          Return to Cockpit
        </Link>
      </div>
    );
  }

  const lat = booking.address_snapshot?.latitude || 14.4673; // Default Davangere center
  const lng = booking.address_snapshot?.longitude || 75.9242;
  const addressText = [
    booking.address_snapshot?.address_line_1,
    booking.address_snapshot?.locality,
    booking.address_snapshot?.city || 'Davangere',
    booking.address_snapshot?.postal_code
  ].filter(Boolean).join(', ');

  // Diagnostic tests breakdown
  const appointmentTests = (booking.items && booking.items.length > 0)
    ? booking.items.map((it) => {
        const match = tests.find(
          (t) => t.id === it.test_id || t.id === it.id || t.name.toLowerCase() === (it.item_name || '').toLowerCase()
        );
        return {
          name: it.item_name,
          price: it.line_total || it.unit_price,
          sampleType: match?.sample_type || 'Venous Blood (EDTA Lavender & Serum Gel Gold Top)',
          fasting: match?.fasting_required ? `Mandatory (${match.fasting_hours || 10}h overnight)` : 'No Fasting Required (Random)',
          isFasting: Boolean(match?.fasting_required),
          category: match?.category || 'Clinical Pathology',
          instructions: match?.preparation_instructions || 'Standard sterile venipuncture protocol. Invert tubes gently.',
          parametersCount: match?.parameters_count || (Array.isArray(match?.parameters_list) ? match.parameters_list.length : null)
        };
      })
    : (booking.tests && booking.tests.length > 0)
    ? booking.tests.map((t) => ({
        name: t.name,
        price: t.price,
        sampleType: t.sample_type || 'Venous Blood (EDTA Lavender & Serum Gel Gold Top)',
        fasting: t.fasting_required ? `Mandatory (${t.fasting_hours || 10}h overnight)` : 'No Fasting Required (Random)',
        isFasting: Boolean(t.fasting_required),
        category: t.category || 'Clinical Pathology',
        instructions: t.preparation_instructions || 'Standard sterile venipuncture protocol. Invert tubes gently.',
        parametersCount: t.parameters_count || (Array.isArray(t.parameters_list) ? t.parameters_list.length : null)
      }))
    : [{
        name: 'Diagnostic Blood Profile',
        price: booking.total_amount,
        sampleType: 'Venous Blood (EDTA Lavender & Serum Gel Gold Top)',
        fasting: 'Verify Fasting on Arrival',
        isFasting: false,
        category: 'General Pathology',
        instructions: 'Standard sterile venipuncture protocol.',
        parametersCount: null
      }];

  // Check payment status: Razorpay Online vs Cash on Collection
  const isPaidOnline = 
    booking.payment_status?.toLowerCase() === 'paid' || 
    (booking.payment_method && booking.payment_method.toLowerCase().includes('razorpay')) ||
    cashCollected;

  // STEP TRANSITION HANDLERS
  const handleStartOrder = () => {
    updateBookingStatus(booking.id, 'Collection Scheduled', {
      notes: `Trip started at ${new Date().toLocaleTimeString()}`
    });
    setActiveStep(2);
  };

  const handleReachedDestination = () => {
    updateBookingStatus(booking.id, 'Collection Scheduled', {
      temperature_recorded: '4.0°C Active',
      notes: `Driver reached patient destination at ${new Date().toLocaleTimeString()}`
    });
    setActiveStep(3);
  };

  const handleCompleteCollection = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookingStatus(booking.id, 'Sample Collected', {
      collected_at: new Date().toLocaleTimeString(),
      sample_barcode: barcode,
      tube_count: Number(tubeCount) || 2,
      temperature_recorded: '4.2°C Cold Chain',
      notes: operationalNotes
    });
    setActiveStep(4);
  };

  const handleConfirmCashPayment = () => {
    updateBookingStatus(
      booking.id, 
      'Sample Collected', 
      {
        collected_at: new Date().toLocaleTimeString(),
        sample_barcode: barcode,
        tube_count: Number(tubeCount) || 2,
        notes: `Cash of ₹${booking.total_amount} collected at doorstep by phlebotomist.`
      },
      {
        payment_status: 'Paid',
        payment_method: 'Cash Collected at Doorstep'
      }
    );
    setCashCollected(true);
  };

  const handleFailCollection = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookingStatus(booking.id, 'Failed', {
      notes: `Failed: ${failReason}. ${failNotes}`
    });
    setShowFailModal(false);
    router.push('/driver/dashboard');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/driver/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-botanical-700 hover:text-botanical-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cockpit Queue</span>
        </Link>

        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-botanical-100 text-botanical-900 border border-botanical-200">
          Order #{booking.booking_reference}
        </span>
      </div>

      {/* 4-Step Progress Stepper Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-ivory-300 shadow-soft-xs">
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeStep === 1 
                ? 'bg-botanical-600 text-white font-bold shadow-soft' 
                : activeStep > 1 
                ? 'bg-botanical-50 text-botanical-900 font-semibold hover:bg-botanical-100' 
                : 'text-botanical-400 opacity-60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
              activeStep === 1 
                ? 'bg-white text-botanical-950' 
                : activeStep > 1 
                ? 'bg-botanical-200 text-botanical-900' 
                : 'bg-ivory-200 text-botanical-600'
            }`}>
              {activeStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className="text-[11px] leading-tight">Patient Details</span>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (activeStep >= 2 || booking.status !== 'Assigned') setActiveStep(2);
            }}
            disabled={activeStep < 2 && booking.status === 'Assigned'}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeStep === 2 
                ? 'bg-botanical-600 text-white font-bold shadow-soft' 
                : activeStep > 2 
                ? 'bg-botanical-50 text-botanical-900 font-semibold hover:bg-botanical-100' 
                : 'text-botanical-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
              activeStep === 2 
                ? 'bg-white text-botanical-950' 
                : activeStep > 2 
                ? 'bg-botanical-200 text-botanical-900' 
                : 'bg-ivory-200 text-botanical-600'
            }`}>
              {activeStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span className="text-[11px] leading-tight">Route & Map</span>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (activeStep >= 3) setActiveStep(3);
            }}
            disabled={activeStep < 3}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeStep === 3 
                ? 'bg-botanical-600 text-white font-bold shadow-soft' 
                : activeStep > 3 
                ? 'bg-botanical-50 text-botanical-900 font-semibold hover:bg-botanical-100' 
                : 'text-botanical-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
              activeStep === 3 
                ? 'bg-white text-botanical-950' 
                : activeStep > 3 
                ? 'bg-botanical-200 text-botanical-900' 
                : 'bg-ivory-200 text-botanical-600'
            }`}>
              {activeStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
            </div>
            <span className="text-[11px] leading-tight">Tests & Draw</span>
          </button>

          {/* Step 4 */}
          <button
            type="button"
            onClick={() => {
              if (activeStep >= 4) setActiveStep(4);
            }}
            disabled={activeStep < 4}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeStep === 4 
                ? 'bg-botanical-600 text-white font-bold shadow-soft' 
                : 'text-botanical-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
              activeStep === 4 
                ? 'bg-white text-botanical-950' 
                : 'bg-ivory-200 text-botanical-600'
            }`}>
              4
            </div>
            <span className="text-[11px] leading-tight">Payment</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: PATIENT DETAILS, SCHEDULE & ADDRESS (START THE ORDER)           */}
      {/* ========================================================================= */}
      {activeStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
          {/* Header Row: Patient Name & Call Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ivory-200">
            <div>
              <span className="text-xs font-bold text-botanical-700">Phlebotomy Assignment #{booking.booking_reference}</span>
              <h1 className="text-2xl sm:text-3xl font-black text-botanical-950 mt-0.5">{booking.patient_name}</h1>
              <p className="text-xs text-botanical-700 mt-1">
                Assigned Phlebotomist: <strong>{user?.name || 'On-Duty Mobile Phlebotomist'}</strong>
              </p>
            </div>

            <a
              href={`tel:${booking.patient_phone}`}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-soft transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Patient ({booking.patient_phone})</span>
            </a>
          </div>

          {/* Scheduled Date & Time Slot Card */}
          <div className="p-5 rounded-2xl bg-botanical-50/70 border border-botanical-200/80 space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-botanical-800">
              Appointment Schedule
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-botanical-200">
                <Calendar className="w-4 h-4 text-botanical-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-botanical-600 uppercase font-bold block">Scheduled Date</span>
                  <strong className="text-botanical-950 text-sm">
                    {formatFriendlyDate(String(booking.scheduled_date || booking.created_at || ''))}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-botanical-200">
                <Clock className="w-4 h-4 text-botanical-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-botanical-600 uppercase font-bold block">Time Slot</span>
                  <strong className="text-botanical-950 text-sm">
                    {booking.scheduled_slot || '07:00 AM - 07:30 AM'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Collection Address Card */}
          <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-botanical-700" />
              <p className="text-xs font-bold uppercase tracking-wider text-botanical-900">
                Patient Home Collection Address
              </p>
            </div>

            <div className="text-xs space-y-1.5 pl-6">
              <p className="text-sm font-bold text-botanical-950 leading-snug">
                {booking.address_snapshot?.address_line_1 || 'Address Line 1'}
              </p>
              {booking.address_snapshot?.locality && (
                <p className="text-botanical-800 font-medium">
                  {booking.address_snapshot.locality}
                </p>
              )}
              <p className="text-botanical-700">
                {booking.address_snapshot?.city || 'Davangere'}, Karnataka {booking.address_snapshot?.postal_code ? `- ${booking.address_snapshot.postal_code}` : ''}
              </p>
              {booking.address_snapshot?.landmark && (
                <div className="mt-2 pt-2 border-t border-ivory-200 text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                  <span className="font-bold text-[11px] block">Landmark / Directions:</span>
                  <span className="font-semibold">{booking.address_snapshot.landmark}</span>
                </div>
              )}
              {booking.address_snapshot?.access_instructions && (
                <p className="text-botanical-600 italic pt-1">
                  Access Note: {booking.address_snapshot.access_instructions}
                </p>
              )}
            </div>
          </div>

          {/* Tests Preview Summary */}
          <div className="p-4 rounded-2xl bg-white border border-ivory-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <TestTube2 className="w-4 h-4 text-botanical-600" />
              <div>
                <p className="font-bold text-botanical-950">
                  {appointmentTests.length} Diagnostic {appointmentTests.length === 1 ? 'Test' : 'Tests'} Booked
                </p>
                <p className="text-[11px] text-botanical-700">
                  {appointmentTests.map(t => t.name).join(', ')}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-ivory-100 text-botanical-800 border border-ivory-200 whitespace-nowrap">
              Vacutainer Required
            </span>
          </div>

          {/* Action Button: START THE ORDER */}
          <div className="pt-2">
            <button
              onClick={handleStartOrder}
              className="w-full py-4 rounded-2xl bg-botanical-600 hover:bg-botanical-700 active:scale-[0.99] text-white font-extrabold text-base shadow-soft flex items-center justify-center gap-3 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start the Order (Begin Trip)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Cancel/Issue link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowFailModal(true)}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Unable to service visit? Report operational issue
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: IN TRANSIT / ROUTE MAP & REACHED DESTINATION                    */}
      {/* ========================================================================= */}
      {activeStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
          {/* Quick Patient Banner */}
          <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-botanical-50 border border-botanical-200">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-botanical-700">
                En Route to Patient
              </span>
              <h2 className="text-base font-extrabold text-botanical-950">{booking.patient_name}</h2>
              <p className="text-xs text-botanical-700 line-clamp-1">{addressText}</p>
            </div>

            <a
              href={`tel:${booking.patient_phone}`}
              className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-soft flex-shrink-0"
              title="Call Patient"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Interactive Route Map */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-botanical-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-botanical-600" />
                <span>Live Route & GPS Navigation</span>
              </p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 underline"
              >
                <span>Open in Google Maps App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <DynamicDriverMap
              latitude={lat}
              longitude={lng}
              patientName={booking.patient_name}
              addressText={addressText}
            />
          </div>

          {/* Primary Action Button: REACHED DESTINATION (BELOW MAP) */}
          <div className="pt-2">
            <button
              onClick={handleReachedDestination}
              className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-extrabold text-base shadow-soft flex items-center justify-center gap-3 transition-all"
            >
              <MapPin className="w-5 h-5" />
              <span>Reached the Destination</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Fallback back button */}
          <div className="flex justify-between items-center pt-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="text-botanical-700 hover:text-botanical-950 font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Review Patient Details</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFailModal(true)}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Patient unreachable? Report issue
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: AT LOCATION / PATIENT TESTS & SAMPLE COLLECTED                   */}
      {/* ========================================================================= */}
      {activeStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
          {/* Destination Reached Confirmation Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                ✓
              </div>
              <div>
                <p className="font-extrabold text-xs uppercase tracking-wide text-emerald-800">
                  At Patient Location
                </p>
                <p className="text-xs font-semibold text-emerald-950">
                  Verify vacutainer specs with {booking.patient_name} & proceed with venipuncture.
                </p>
              </div>
            </div>

            <a
              href={`tel:${booking.patient_phone}`}
              className="p-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 flex-shrink-0 flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call</span>
            </a>
          </div>

          {/* Clinical Test Specifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube2 className="w-4 h-4 text-botanical-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-botanical-950">
                  Tests to Draw ({appointmentTests.length} Items):
                </p>
              </div>
              <span className="text-[11px] text-botanical-700 font-semibold">
                Verify Vacutainers
              </span>
            </div>

            <div className="space-y-3">
              {appointmentTests.map((t, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-white border border-ivory-300 shadow-soft-xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-ivory-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-botanical-100 text-botanical-800 text-[11px] font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-botanical-950">{t.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ivory-100 text-botanical-800 border border-ivory-200">
                        {t.category}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border self-start sm:self-auto ${
                      t.isFasting 
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {t.isFasting ? '⚠️ Mandatory Fasting' : '✓ No Fasting Needed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1 bg-ivory-50/70 p-2.5 rounded-xl border border-ivory-200">
                      <p className="text-[11px] font-bold text-botanical-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Required Specimen / Vacutainer:</span>
                      </p>
                      <p className="text-botanical-800 font-semibold pl-3.5">{t.sampleType}</p>
                      {t.parametersCount && (
                        <p className="text-[10px] text-botanical-600 pl-3.5">
                          Biomarkers Tested: <strong>{t.parametersCount} Parameters</strong>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 bg-ivory-50/70 p-2.5 rounded-xl border border-ivory-200">
                      <p className="text-[11px] font-bold text-botanical-900 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-botanical-600" />
                        <span>Patient Fasting & Dietary Protocol:</span>
                      </p>
                      <p className="text-botanical-800 pl-4">{t.fasting}</p>
                      <p className="text-[10px] text-botanical-600 italic pl-4">
                        Protocol: {t.instructions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Logging Inputs */}
          <form onSubmit={handleCompleteCollection} className="space-y-4 pt-2 border-t border-ivory-200">
            <p className="text-xs font-bold uppercase tracking-wider text-botanical-900">
              Sample Barcode & Cold-Chain Intake:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-botanical-900 mb-1">
                  Vial Barcode ID
                </label>
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-ivory-300 font-mono font-bold text-botanical-950 focus:border-botanical-500 outline-none"
                  placeholder="WD-BAR-XXXXXX"
                />
              </div>

              <div>
                <label className="block font-bold text-botanical-900 mb-1">
                  Number of Tubes Drawn
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={tubeCount}
                  onChange={(e) => setTubeCount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-ivory-300 font-bold text-botanical-950 focus:border-botanical-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="fastingCheckStep3"
                checked={fastingVerified}
                onChange={(e) => setFastingVerified(e.target.checked)}
                className="w-4 h-4 rounded text-botanical-600 focus:ring-botanical-500"
              />
              <label htmlFor="fastingCheckStep3" className="text-xs font-semibold text-botanical-900">
                Verified patient identity & confirmed mandatory fasting protocol followed
              </label>
            </div>

            {/* Primary Action Button: SAMPLE COLLECTED */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base shadow-soft flex items-center justify-center gap-3 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Sample Collected (Seal in Cold Box)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Back to map button */}
          <div className="flex justify-between items-center pt-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="text-botanical-700 hover:text-botanical-950 font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Map</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFailModal(true)}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Patient refused blood draw?
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: PAYMENT VERIFICATION & TRIP COMPLETION                           */}
      {/* ========================================================================= */}
      {activeStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
          {/* Sample Sealed Status Banner */}
          <div className="p-4 rounded-2xl bg-botanical-50 border border-botanical-200 text-botanical-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Blood Sample Successfully Collected & Logged</p>
                <p className="text-[11px] text-botanical-700">
                  Barcode: <strong className="font-mono">{barcode}</strong> • Stored at 4.2°C Cold Chain Box
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              Sample Sealed
            </span>
          </div>

          {/* SMART PAYMENT VERIFICATION SECTION */}
          {isPaidOnline ? (
            /* CASE A: PAID ONLINE BY RAZORPAY */
            <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-4 shadow-soft-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-soft">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Razorpay Verified Payment
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                      ₹{booking.total_amount} Paid Online
                    </h2>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-soft">
                  ✓ PAID
                </span>
              </div>

              {/* Explicit directive not to collect cash */}
              <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200 text-xs space-y-1.5">
                <p className="text-emerald-900 font-extrabold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>DO NOT COLLECT CASH FROM PATIENT</span>
                </p>
                <p className="text-emerald-800 font-medium">
                  The patient has already settled this order online via Razorpay (UPI / NetBanking / Card). No payment is due at the doorstep.
                </p>
                {booking.payment_method && (
                  <p className="text-[11px] text-emerald-700 pt-1 border-t border-emerald-100">
                    Payment Gateway: <strong>{booking.payment_method}</strong>
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* CASE B: CASH ON COLLECTION / UNPAID */
            <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-4 shadow-soft-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-soft">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400">
                      Doorstep Collection Required
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                      Collect ₹{booking.total_amount} Cash / UPI
                    </h2>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-600 text-white shadow-soft">
                  DUE NOW
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-amber-200 text-xs space-y-1.5">
                <p className="text-amber-900 font-extrabold text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Payment Pending: Collect Before Handover</span>
                </p>
                <p className="text-amber-800 font-medium">
                  This booking was requested as Cash on Collection. Please collect exact ₹{booking.total_amount} or display your official UPI QR code.
                </p>
              </div>

              {/* Button to confirm Cash Received */}
              <button
                type="button"
                onClick={handleConfirmCashPayment}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-soft flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Cash Received (₹{booking.total_amount})</span>
              </button>
            </div>
          )}

          {/* Job Completion Actions */}
          <div className="pt-4 border-t border-ivory-200 space-y-3">
            <Link
              href="/driver/dashboard"
              className="w-full py-4 rounded-2xl bg-botanical-600 hover:bg-botanical-700 active:scale-[0.99] text-white font-extrabold text-base shadow-soft flex items-center justify-center gap-3 transition-all"
            >
              <Check className="w-5 h-5" />
              <span>Complete Task & Return to Cockpit</span>
            </Link>

            <div className="flex justify-center text-xs">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="text-botanical-700 hover:text-botanical-950 font-semibold"
              >
                Need to re-edit sample barcodes?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT VISIT FAILURE OR RESCHEDULE                                */}
      {/* ========================================================================= */}
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
                  className="w-full p-2.5 rounded-xl border border-ivory-300 bg-white font-semibold outline-none"
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
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setShowFailModal(false)}
                  className="px-4 py-2 text-botanical-700 font-semibold"
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