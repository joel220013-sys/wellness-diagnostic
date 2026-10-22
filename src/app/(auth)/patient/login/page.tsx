'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UserCheck, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function PatientLoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Default demo patient credentials
  const [identifier, setIdentifier] = useState('patient@wellness.com');
  const [password, setPassword] = useState('patient123');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await login(identifier, password, 'patient');
      if (result.success) {
        setSuccessMessage('Authentication verified. Redirecting to Patient Dashboard...');
        setTimeout(() => {
          router.push('/patient/dashboard');
        }, 400);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-200 flex flex-col justify-between selection:bg-botanical-200">
      {/* Top Header */}
      <header className="px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <BrandLogo size="md" />

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-botanical-800 hover:text-botanical-600 transition-colors bg-white/80 px-3.5 py-1.5 rounded-full border border-ivory-300 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal Selection</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-lg relative">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-ivory-200">
            <div className="w-12 h-12 rounded-2xl bg-botanical-50 border border-botanical-100 flex items-center justify-center text-botanical-600 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-botanical-600">
                Patient Portal Gateway
              </span>
              <h1 className="text-xl font-extrabold text-botanical-950">
                Sign In to Your Account
              </h1>
            </div>
          </div>

          {/* Quick Demo Sign-in */}
          <div className="mb-5 p-3 rounded-2xl bg-botanical-50/70 border border-botanical-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-botanical-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-botanical-900">Demo Patient:</span>
                <span className="text-botanical-700/80 ml-1">patient@wellness.com</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loginAsDemo('patient')}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-botanical-500 text-white hover:bg-botanical-600 transition-colors flex-shrink-0"
            >
              1-Click Sign In
            </button>
          </div>

          {/* Tab Switch to Register */}
          <div className="grid grid-cols-2 p-1 bg-ivory-100 rounded-xl mb-5 border border-ivory-300/80">
            <button
              type="button"
              className="py-2 text-xs sm:text-sm font-bold rounded-lg bg-white text-botanical-950 shadow-soft-sm"
            >
              Sign In
            </button>
            <Link
              href="/patient/register"
              className="py-2 text-xs sm:text-sm font-bold rounded-lg text-center text-botanical-700/70 hover:text-botanical-900 transition-all"
            >
              New Registration
            </Link>
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

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1.5">
                Email Address or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-botanical-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. patient@wellness.com or mobile"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-botanical-900">Password</label>
                <Link
                  href="/patient/forgot-password"
                  className="text-xs font-semibold text-botanical-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-botanical-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              className="w-full py-3 px-4 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-bold text-sm shadow-soft transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In as Patient'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-ivory-200 text-center text-xs text-botanical-700/70 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-botanical-500" />
            <span>End-to-end encrypted clinical health records</span>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Patient Security Gateway
      </footer>
    </div>
  );
}
