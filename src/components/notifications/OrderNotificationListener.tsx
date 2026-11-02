'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  ShoppingBag, 
  X, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  playOrderChime, 
  triggerOrderNotification, 
  registerServiceWorker, 
  listenForOrderAlerts,
  markOrderAsSeen,
  isOrderAlreadySeen,
  OrderNotificationPayload
} from '@/lib/notificationService';
import { getWhatsAppDirectUrl } from '@/lib/whatsappService';

export default function OrderNotificationListener() {
  const { user } = useAuth();
  const { bookings } = useData();

  // Floating toast notification state
  const [activeAlert, setActiveAlert] = useState<OrderNotificationPayload | null>(null);
  
  // Track seen booking IDs to only alert on genuinely new bookings
  const seenBookingIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Initialize service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Listen to BroadcastChannel for real-time same-browser cross-tab events
  useEffect(() => {
    // Only listen if user is admin or driver
    if (user?.role !== 'admin' && user?.role !== 'driver') return;

    const cleanup = listenForOrderAlerts((order) => {
      seenBookingIdsRef.current.add(order.id);
      markOrderAsSeen(order.id);
      setActiveAlert(order);
      // Trigger local sound & notification without re-broadcasting back to BroadcastChannel!
      triggerOrderNotification(order, { broadcast: false });
    });

    return cleanup;
  }, [user]);

  // Track DataContext bookings for background database polling
  useEffect(() => {
    if (!bookings || bookings.length === 0) return;

    // On initial mount, seed all existing booking IDs so we NEVER alert on past history
    if (isInitialLoadRef.current) {
      bookings.forEach((b) => {
        seenBookingIdsRef.current.add(b.id);
        markOrderAsSeen(b.id);
      });
      isInitialLoadRef.current = false;
      return;
    }

    // Only alert if current role is admin or driver
    if (user?.role !== 'admin' && user?.role !== 'driver') {
      bookings.forEach((b) => {
        seenBookingIdsRef.current.add(b.id);
        markOrderAsSeen(b.id);
      });
      return;
    }

    // Check for any newly arrived booking
    const now = Date.now();
    for (const b of bookings) {
      if (seenBookingIdsRef.current.has(b.id) || isOrderAlreadySeen(b.id)) {
        seenBookingIdsRef.current.add(b.id);
        continue;
      }

      // Check creation timestamp: only alert on orders placed in the last 2 minutes
      const createdTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      const isRecent = createdTime > 0 && (now - createdTime < 2 * 60 * 1000);

      // If it is an older historical order, mark it as seen silently
      if (!isRecent) {
        seenBookingIdsRef.current.add(b.id);
        markOrderAsSeen(b.id);
        continue;
      }

      seenBookingIdsRef.current.add(b.id);
      markOrderAsSeen(b.id);

      const payload: OrderNotificationPayload = {
        id: b.id,
        reference: b.booking_reference,
        patientName: b.patient_name,
        phone: b.patient_phone,
        totalAmount: b.total_amount,
        testName: b.tests?.[0]?.name || b.items?.[0]?.item_name || 'Health Diagnostic Checkup',
        timeSlot: b.scheduled_slot
      };

      setActiveAlert(payload);
      triggerOrderNotification(payload, { broadcast: true });
      break; // Alert only one at a time to prevent alert storms
    }
  }, [bookings, user]);

  // Auto-dismiss floating toast after 12 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 12000);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  if (!activeAlert) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-botanical-950 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-amber-400 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
              <span>Incoming Patient Order!</span>
            </span>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Details */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <p className="font-extrabold text-sm text-white">
              #{activeAlert.reference}
            </p>
            <p className="font-mono font-bold text-amber-400 text-sm">
              ₹{activeAlert.totalAmount}
            </p>
          </div>
          <p className="text-xs text-ivory-200 font-semibold truncate">
            {activeAlert.patientName} {activeAlert.phone ? `(${activeAlert.phone})` : ''}
          </p>
          <p className="text-[11px] text-ivory-300/80 truncate">
            {activeAlert.testName}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <Link
            href={`/admin/orders/${activeAlert.id}`}
            onClick={() => setActiveAlert(null)}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-botanical-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-soft"
          >
            <span>Open Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={getWhatsAppDirectUrl({
              orderId: activeAlert.id,
              reference: activeAlert.reference,
              patientName: activeAlert.patientName,
              phone: activeAlert.phone || '',
              totalAmount: activeAlert.totalAmount,
              testName: activeAlert.testName || 'Diagnostic Package',
              timeSlot: activeAlert.timeSlot || 'Scheduled Home Collection'
            }, '917899514777')}
            target="_blank"
            rel="noopener noreferrer"
            title="Open WhatsApp Alert for +91 7899514777"
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <span>WhatsApp</span>
          </a>
          <button
            onClick={() => playOrderChime()}
            title="Replay Chime Sound"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

