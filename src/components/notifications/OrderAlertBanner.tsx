'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Smartphone,
  Power
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  playOrderChime, 
  requestNotificationPermission, 
  getNotificationPermissionState, 
  isSoundAlertsEnabled, 
  setSoundAlertsEnabled,
  isMasterAlertsEnabled,
  setMasterAlertsEnabled,
  triggerOrderNotification
} from '@/lib/notificationService';
import { registerPushDevice } from '@/lib/pushSubscriptionService';

export default function OrderAlertBanner() {
  const { user } = useAuth();
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [testTriggered, setTestTriggered] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    setMasterEnabled(isMasterAlertsEnabled());
    setSoundEnabled(isSoundAlertsEnabled());

    const currentPerm = getNotificationPermissionState();
    setPermission(currentPerm);

    if (currentPerm === 'granted') {
      registerPushDevice({ userId: user?.id, role: user?.role })
        .then((ok) => setIsSubscribed(ok))
        .catch(() => {});
    }
  }, [user]);

  // Master System Toggle ON / OFF
  const handleToggleMaster = () => {
    const next = !masterEnabled;
    setMasterEnabled(next);
    setMasterAlertsEnabled(next);

    // If master is being enabled, also ensure sound context is ready and chime plays
    if (next && soundEnabled) {
      playOrderChime();
    }
  };

  // Sound Chime Toggle ON / OFF
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundAlertsEnabled(next);
    if (next && masterEnabled) {
      playOrderChime();
    }
  };

  const handleRequestPermission = async () => {
    setIsRegistering(true);
    try {
      const res = await requestNotificationPermission();
      setPermission(res);
      if (res === 'granted') {
        const ok = await registerPushDevice({ userId: user?.id, role: user?.role });
        setIsSubscribed(ok);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestChime = async () => {
    setTestTriggered(true);
    setTestStatus('Sending Alert...');

    // 1. Local chime test (forced so it rings even if testing)
    triggerOrderNotification({
      id: `test_${Date.now()}`,
      reference: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: 'Mobile Screen Alert Test',
      totalAmount: 1499,
      testName: 'Aarogyam Profile Test',
      timeSlot: 'Immediate Test'
    }, { broadcast: false, force: true });

    // 2. Cloud Web Push dispatch
    try {
      const res = await fetch('/api/push/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `test_${Date.now()}`,
          reference: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: 'Mobile Screen Alert Test',
          phone: '+91 98111 22334',
          totalAmount: 1499,
          testName: 'Aarogyam Profile Test',
          timeSlot: 'Immediate Test',
          targetUrl: '/admin/orders',
        }),
      });
      const data = await res.json();
      if (data.sentCount > 0) {
        setTestStatus(`Alert Sent to ${data.sentCount} Phone(s) ✓`);
      } else {
        setTestStatus('Chime Played');
      }
    } catch {
      setTestStatus('Chime Played');
    }

    setTimeout(() => {
      setTestTriggered(false);
      setTestStatus(null);
    }, 3000);
  };

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-soft-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        masterEnabled
          ? 'bg-white/90 backdrop-blur border-ivory-300'
          : 'bg-ivory-100/90 border-ivory-300 opacity-90'
      }`}
    >
      {/* Left Side: Master System Toggle Switch & Live Status */}
      <div className="flex items-center gap-3.5">
        {/* Physical Sliding Toggle Switch (ON / OFF) */}
        <button
          type="button"
          role="switch"
          aria-checked={masterEnabled}
          onClick={handleToggleMaster}
          className={`relative inline-flex h-7 w-[52px] flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-botanical-500 shadow-inner select-none ${
            masterEnabled ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
          title={masterEnabled ? 'Click to switch Order Alert System OFF' : 'Click to switch Order Alert System ON'}
        >
          <span
            className={`pointer-events-none inline-flex h-6 w-6 items-center justify-center transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
              masterEnabled ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-gray-400'
            }`}
          >
            <Power className="w-3 h-3 stroke-[2.5]" />
          </span>
        </button>

        <div>
          <div className="flex items-center gap-2">
            {/* Status indicator dot */}
            <span className="relative flex h-2.5 w-2.5">
              {masterEnabled ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400"></span>
              )}
            </span>

            <span className="text-xs font-bold text-botanical-950">
              Real-Time Order Alert System
            </span>

            {/* Visual State Tag */}
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                masterEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {masterEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          <p className="text-[11px] text-botanical-700/80 mt-0.5">
            {masterEnabled
              ? '• Loud audio chime & lock-screen push notifications enabled for desk staff'
              : '• System paused: chimes and floating notifications are silenced'}
          </p>
        </div>
      </div>

      {/* Right Side: Quick Controls & Secondary Toggles */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Audio Chime Sliding Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={soundEnabled}
          onClick={handleToggleSound}
          disabled={!masterEnabled}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all border select-none ${
            !masterEnabled
              ? 'opacity-40 cursor-not-allowed bg-ivory-100 text-botanical-400 border-ivory-200'
              : soundEnabled
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 shadow-soft-xs cursor-pointer'
              : 'bg-ivory-200 text-botanical-800 border-ivory-300 hover:bg-ivory-300 cursor-pointer'
          }`}
          title={soundEnabled ? 'Click to toggle Audio Chime OFF' : 'Click to toggle Audio Chime ON'}
        >
          {soundEnabled && masterEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-botanical-600 flex-shrink-0" />
          )}
          <span>Audio Chime:</span>

          {/* Sliding switch track & thumb */}
          <span
            className={`relative inline-flex h-4 w-7 flex-shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
              soundEnabled && masterEnabled ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ${
                soundEnabled && masterEnabled ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </span>

          <span
            className={`text-[10px] font-extrabold uppercase ${
              soundEnabled && masterEnabled ? 'text-emerald-700' : 'text-botanical-600'
            }`}
          >
            {soundEnabled && masterEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Screen Push Notification Status / Enable Button */}
        {permission === 'granted' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-sky-50 text-sky-900 border border-sky-200">
            <Smartphone className="w-3.5 h-3.5 text-sky-600" />
            <span>Screen Push: {isSubscribed ? 'Mobile Registered ✓' : 'Enabled ✓'}</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleRequestPermission}
            disabled={isRegistering}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-soft-xs"
            title="Enable lock-screen & desktop push notifications"
          >
            <BellRing className={`w-3.5 h-3.5 ${isRegistering ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isRegistering ? 'Registering...' : 'Enable Screen Push'}</span>
          </button>
        )}

        {/* Test Chime & Alert Button */}
        <button
          type="button"
          onClick={handleTestChime}
          disabled={testTriggered}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-white text-botanical-900 border border-ivory-300 hover:bg-ivory-100 active:scale-95 transition-all shadow-soft-xs"
          title="Test ringtone sound and screen alert right now"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{testStatus || 'Test Alert Sound'}</span>
        </button>
      </div>
    </div>
  );
}
