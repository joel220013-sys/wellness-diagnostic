'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { 
  playOrderChime, 
  requestNotificationPermission, 
  getNotificationPermissionState, 
  isSoundAlertsEnabled, 
  setSoundAlertsEnabled,
  triggerOrderNotification
} from '@/lib/notificationService';

export default function NotificationQuickControl() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [testTriggered, setTestTriggered] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermissionState());
    setSoundEnabled(isSoundAlertsEnabled());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      triggerOrderNotification({
        id: 'test_demo',
        reference: 'TEST-DEMO',
        patientName: 'Notification Verification',
        totalAmount: 2995,
        testName: 'Aarogyam C Pro With Utsh'
      });
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundAlertsEnabled(next);
    if (next) {
      playOrderChime();
    }
  };

  const handleTestChime = () => {
    setTestTriggered(true);
    triggerOrderNotification({
      id: `test_${Date.now()}`,
      reference: `WD-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: 'Diagnostic Sample Patient',
      totalAmount: 1300,
      testName: 'Vitamin D & Lipid Profile',
      timeSlot: '07:30 AM – 09:00 AM'
    });
    setTimeout(() => setTestTriggered(false), 2500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Sound Chime Toggle */}
      <button
        onClick={handleToggleSound}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
          soundEnabled
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 shadow-soft-xs'
            : 'bg-ivory-200 text-botanical-700 border-ivory-300 hover:bg-ivory-300'
        }`}
        title={soundEnabled ? 'Order sound chime is active (click to mute)' : 'Order sound chime is muted (click to enable)'}
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audio Chime: ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-botanical-600" />
            <span>Audio Chime: OFF</span>
          </>
        )}
      </button>

      {/* Push Notification Status / Enable Button */}
      {permission === 'granted' ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-sky-50 text-sky-900 border border-sky-200">
          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
          <span>Screen Push: Enabled ✓</span>
        </span>
      ) : (
        <button
          onClick={handleRequestPermission}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-soft-xs"
          title="Enable lock-screen & desktop push notifications"
        >
          <BellRing className="w-3.5 h-3.5 animate-pulse" />
          <span>Enable Desktop & Mobile Push</span>
        </button>
      )}

      {/* Test Chime & Alert Button */}
      <button
        onClick={handleTestChime}
        disabled={testTriggered}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-white text-botanical-900 border border-ivory-300 hover:bg-ivory-100 active:scale-95 transition-all shadow-soft-xs"
        title="Test the ringtone sound and screen alert right now"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>{testTriggered ? 'Ringing Chime...' : 'Test Alert Sound'}</span>
      </button>
    </div>
  );
}

