'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UserCheck,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';

// ─── OTP Resend Countdown Timer ───────────────────────────────────────────────
function ResendCountdown({
  onResend,
  disabled,
}: {
  onResend: () => void;
  disabled: boolean;
}) {
  const [seconds, setSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    setSeconds(60);
    setCanResend(false);
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [disabled]); // re-trigger when a new OTP is sent (disabled toggles)

  if (canResend) {
    return (
      <button
        type="button"
        onClick={onResend}
        className="text-xs text-botanical-600 font-semibold hover:underline flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        Resend OTP
      </button>
    );
  }

  return (
    <span className="text-xs text-botanical-700/60">
      Resend OTP in <span className="font-bold text-botanical-800">{seconds}s</span>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientRegisterPage() {
  const router = useRouter();
  const { registerPatient } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [testOtpHide, setTestOtpHide] = useState<string | null>(null);
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendKey, setResendKey] = useState(0); // triggers countdown reset

  // General state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Focus OTP input when it appears
  useEffect(() => {
    if (otpSent && !otpVerified) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [otpSent, otpVerified]);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    setErrorMessage('');
    const cleanPhone = sanitizePhone(phone);

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number before sending OTP.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, purpose: 'register' }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtp(data.devOtp || '');
        setTestOtpHide(data.devOtp || null);
        setGatewayNotice(data.gatewayNotice || null);
        setOtpVerified(false);
        setResendKey((k) => k + 1);
      } else {
        setErrorMessage(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setErrorMessage('');
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP sent to your phone.');
      return;
    }

    const cleanPhone = sanitizePhone(phone);
    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp, purpose: 'register' }),
      });
      const data = await res.json();
      if (data.valid) {
        setOtpVerified(true);
        setErrorMessage('');
      } else {
        setErrorMessage(data.error || 'Invalid OTP. Please try again.');
      }
    } catch {
      setErrorMessage('Network error while verifying OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Register (only after OTP verified) ───────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phone);
    const cleanAddress = sanitizeInput(address);

    if (!cleanName || !cleanEmail || !cleanPhone || !password) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!otpVerified) {
      setErrorMessage('Please verify your phone number via OTP before registering.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerPatient({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        address: cleanAddress,
      });

      if (res.success) {
        setSuccessMessage('Account registered successfully! Redirecting to Patient Dashboard...');
        setTimeout(() => router.push('/patient/dashboard'), 500);
      } else {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMessage('Unable to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cleanPhone = sanitizePhone(phone);
  const phoneMask = cleanPhone.replace(/\D/g, '').slice(-4).padStart(10, '*');

  return (
    <div className="min-h-screen bg-ivory-200 flex flex-col justify-between selection:bg-botanical-200">
      <header className="px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="hover:opacity-95 transition-opacity">
          <BrandLogo size="md" />
        </Link>
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-botanical-800 hover:text-botanical-600 transition-colors bg-white/80 px-3.5 py-1.5 rounded-full border border-ivory-300 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portals</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-lg">
          {/* Header */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-ivory-200">
            <div className="w-12 h-12 rounded-2xl bg-botanical-50 border border-botanical-100 flex items-center justify-center text-botanical-600 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-botanical-600">
                New Patient Sign-Up
              </span>
              <h1 className="text-xl font-extrabold text-botanical-950">Create Patient Account</h1>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="grid grid-cols-2 p-1 bg-ivory-100 rounded-xl mb-5 border border-ivory-300/80">
            <Link
              href="/patient/login"
              className="py-2 text-xs sm:text-sm font-bold rounded-lg text-center text-botanical-700/70 hover:text-botanical-900 transition-all"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="py-2 text-xs sm:text-sm font-bold rounded-lg bg-white text-botanical-950 shadow-soft-sm"
            >
              New Registration
            </button>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            {/* Phone + Send OTP */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">
                Mobile Number (India +91) *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      // Reset OTP if phone changes
                      if (otpSent) {
                        setOtpSent(false);
                        setOtpVerified(false);
                        setOtp('');
                      }
                    }}
                    placeholder="+91 98765 43210"
                    disabled={otpVerified}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white disabled:opacity-60"
                  />
                </div>
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp || !phone}
                    className="px-3 py-2 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white text-xs font-bold whitespace-nowrap disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-soft"
                  >
                    {sendingOtp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                )}
                {otpVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-700 font-bold px-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* OTP Entry */}
            {otpSent && !otpVerified && (
              <div className="p-4 rounded-2xl bg-botanical-50 border border-botanical-200">
                <p className="text-xs text-botanical-800 font-semibold mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-botanical-600" />
                  OTP sent to <span className="font-black">+91 ****{phoneMask.slice(-4)}</span>
                  <span className="text-botanical-600 font-normal">(valid 5 mins)</span>
                </p>

                {testOtpHide && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span>Fast2SMS DLT Pending — Test Code:</span>
                      <span className="font-mono bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded font-black tracking-widest text-sm">
                        {testOtpHide}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/80 mt-1">
                      Carrier SMS delivery is held by Fast2SMS pending website/DLT approval. Your test code has been prefilled below.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit OTP"
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-botanical-300 focus:ring-2 focus:ring-botanical-500 bg-white text-center tracking-[0.3em] font-bold text-botanical-900"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={verifyingOtp || otp.length !== 6}
                    className="px-4 py-2 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white text-xs font-bold disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-soft"
                  >
                    {verifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Verify
                  </button>
                </div>
                <div className="mt-2.5 flex justify-end">
                  <ResendCountdown key={resendKey} onResend={handleSendOTP} disabled={sendingOtp} />
                </div>
              </div>
            )}

            {/* OTP Verified Banner */}
            {otpVerified && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                Phone number verified ✓ — You can now complete your registration.
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">
                Home Collection Address (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House, Street, City"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Set Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full py-3 px-4 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-bold text-sm shadow-soft transition-all disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Complete Patient Registration'}
            </button>

            {!otpVerified && (
              <p className="text-center text-xs text-botanical-700/60 mt-1">
                You need to verify your phone number via OTP before registering.
              </p>
            )}
          </form>

          <div className="mt-6 pt-4 border-t border-ivory-200 text-center text-xs text-botanical-700/70 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-botanical-500" />
            <span>Encrypted clinical records &amp; data protection</span>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Patient Security Gateway
      </footer>
    </div>
  );
}
