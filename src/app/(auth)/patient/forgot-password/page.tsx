'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    setMessage(res.message);
  };

  return (
    <div className="min-h-screen bg-ivory-200 flex flex-col justify-between selection:bg-botanical-200">
      <header className="px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between">
        <BrandLogo size="md" />
        <Link
          href="/patient/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-botanical-800 hover:text-botanical-600 transition-colors bg-white/80 px-3.5 py-1.5 rounded-full border border-ivory-300 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-lg">
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-ivory-200">
            <div className="w-12 h-12 rounded-2xl bg-peach-50 border border-peach-200 flex items-center justify-center text-peach-600 flex-shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-botanical-600">
                Security Recovery
              </span>
              <h1 className="text-xl font-extrabold text-botanical-950">Reset Password</h1>
            </div>
          </div>

          <p className="text-xs text-botanical-800/80 mb-5 leading-relaxed">
            Enter your registered patient email address. We will send you an authorized verification token to reset your password.
          </p>

          {message ? (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Verification Link Sent</span>
              </div>
              <p>{message}</p>
              <Link
                href="/patient/login"
                className="inline-block mt-2 font-bold text-botanical-700 underline"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@wellness.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-sm shadow-soft transition-all disabled:opacity-60"
              >
                {loading ? 'Sending Instructions...' : 'Send Recovery Link'}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Security
      </footer>
    </div>
  );
}
