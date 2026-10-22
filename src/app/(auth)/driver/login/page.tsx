'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Truck, 
  Mail, 
  Lock, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  KeyRound, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function DriverLoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [identifier, setIdentifier] = useState('driver@wellness.com');
  const [password, setPassword] = useState('driver123');

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('7492');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await login(identifier, password, 'driver');
      if (result.success) {
        setSuccessMessage('Phlebotomist verified. Loading route assignments...');
        setTimeout(() => {
          router.push('/driver/dashboard');
        }, 400);
      } else {
        setErrorMessage(result.error || 'Driver authentication failed.');
      }
    } catch {
      setErrorMessage('Unexpected system error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier) {
      setErrorMessage('Please enter registered mobile number or email.');
      return;
    }
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedOtp(generated);
    setOtpSent(true);
    setSuccessMessage(`OTP sent! Simulator code: ${generated}`);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (otpCode !== simulatedOtp && otpCode !== '1234') {
      setErrorMessage(`Invalid OTP code entered. Please enter ${simulatedOtp}`);
      return;
    }

    setLoading(true);
    try {
      const result = await login('driver@wellness.com', 'driver123', 'driver');
      if (result.success) {
        setSuccessMessage('OTP confirmed! Navigating to collection dashboard...');
        setTimeout(() => {
          router.push('/driver/dashboard');
        }, 400);
      } else {
        setErrorMessage(result.error || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-200 flex flex-col justify-between selection:bg-botanical-200">
      <header className="px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <BrandLogo size="md" />

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-botanical-800 hover:text-botanical-600 transition-colors bg-white/80 px-3.5 py-1.5 rounded-full border border-ivory-300 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portals</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-lg">
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-ivory-200">
            <div className="w-12 h-12 rounded-2xl bg-botanical-50 border border-botanical-200 flex items-center justify-center text-botanical-700 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-botanical-600">
                Phlebotomy Field Gateway
              </span>
              <h1 className="text-xl font-extrabold text-botanical-950">
                Phlebotomist Sign In
              </h1>
            </div>
          </div>

          <div className="mb-5 p-3 rounded-2xl bg-botanical-50/70 border border-botanical-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-botanical-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-botanical-950">Active Phleb:</span>
                <span className="text-botanical-700/80 ml-1">Marcus Cole (VAN-04)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loginAsDemo('driver')}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-botanical-600 text-white hover:bg-botanical-700 transition-colors flex-shrink-0"
            >
              1-Click Sign In
            </button>
          </div>

          <div className="grid grid-cols-2 p-1 bg-ivory-100 rounded-xl mb-5 border border-ivory-300/80">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setErrorMessage('');
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                authMethod === 'password'
                  ? 'bg-white text-botanical-950 shadow-soft-sm'
                  : 'text-botanical-700/70 hover:text-botanical-900'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setErrorMessage('');
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                authMethod === 'otp'
                  ? 'bg-white text-botanical-950 shadow-soft-sm'
                  : 'text-botanical-700/70 hover:text-botanical-900'
              }`}
            >
              Mobile OTP Code
            </button>
          </div>

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

          {authMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">
                  Phlebotomist Email or Mobile Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="driver@wellness.com or mobile"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-botanical-400 hover:text-botanical-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-botanical-600 hover:bg-botanical-700 active:bg-botanical-800 text-white font-bold text-sm shadow-soft transition-all disabled:opacity-60 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In as Driver'}
              </button>
            </form>
          )}

          {authMethod === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-botanical-900 mb-1.5">
                      Phlebotomist Mobile Phone (+91)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="+91 98111 22334"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white font-bold text-sm shadow-soft"
                  >
                    Send 4-Digit OTP Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-botanical-900 mb-1.5">
                      Enter 4-Digit OTP Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={4}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="7492"
                        className="w-full pl-9 pr-3 py-2.5 text-lg font-bold tracking-widest text-center rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white font-bold text-sm shadow-soft disabled:opacity-60"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Start Shift'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 p-3 rounded-2xl bg-ivory-100 border border-ivory-300/80 text-xs text-botanical-800/80">
            <span className="font-bold text-botanical-950 block">Assigned Routes Only</span>
            <p className="mt-0.5 leading-relaxed">
              Phlebotomists have role-scoped access to assigned patient addresses, contact info, and collection checklists only.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Field Operations Gateway
      </footer>
    </div>
  );
}
