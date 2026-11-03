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
import { useAuth } from '@/context/AuthContext';
import { 
  playOrderChime, 
  requestNotificationPermission, 
  getNotificationPermissionState, 
  isSoundAlertsEnabled, 
  setSoundAlertsEnabled,
  triggerOrderNotification
} from '@/lib/notificationService';
import { registerPushDevice } from '@/lib/pushSubscriptionService';

export default function NotificationQuickControl() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [testTriggered, setTestTriggered] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    const currentPerm = getNotificationPermissionState();
    setPermission(currentPerm);
    setSoundEnabled(isSoundAlertsEnabled());

    // Auto-register device if permission is already granted on this phone/browser
    if (currentPerm === 'granted') {
      registerPushDevice({ userId: user?.id, role: user?.role })
        .then((ok) => setIsSubscribed(ok))
        .catch(() => {});
    }
  }, [user]);

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

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundAlertsEnabled(next);
    if (next) {
      playOrderChime();
    }
  };

  const handleTestChime = async () => {
    setTestTriggered(true);
    setTestStatus('Sending Alert...');

    // 1. Local chime test
    triggerOrderNotification({
      id: `test_${Date.now()}`,
      reference: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: 'Mobile Screen Alert Test',
      totalAmount: 1499,
      testName: 'Aarogyam Profile Test',
      timeSlot: 'Immediate Test'
    }, { broadcast: false, force: true });

    // 2. Cloud Web Push dispatch to physical phone screens
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
        setTestStatus('No Phone Enrolled Yet');
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
          <span>Screen Push: {isSubscribed ? 'Mobile Registered ✓' : 'Enabled ✓'}</span>
        </span>
      ) : (
        <button
          onClick={handleRequestPermission}
          disabled={isRegistering}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-soft-xs"
          title="Enable lock-screen & desktop push notifications"
        >
          <BellRing className={`w-3.5 h-3.5 ${isRegistering ? 'animate-spin' : 'animate-pulse'}`} />
          <span>{isRegistering ? 'Registering Device...' : 'Enable Desktop & Mobile Push'}</span>
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
        <span>{testStatus || 'Test Alert Sound'}</span>
      </button>
    </div>
  );
}

