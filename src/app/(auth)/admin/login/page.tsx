'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Eye,
  EyeOff,
  Building
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [adminEmail, setAdminEmail] = useState('admin@wellness.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await login(adminEmail, adminPassword, 'admin');
      if (result.success) {
        setSuccessMessage('Admin credentials verified. Launching Clinical Laboratory Management...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 400);
      } else {
        setErrorMessage(result.error || 'Admin authentication failed.');
      }
    } catch {
      setErrorMessage('Unexpected server error during admin authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-200 flex flex-col justify-between selection:bg-peach-200">
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
            <div className="w-12 h-12 rounded-2xl bg-peach-50 border border-peach-200 flex items-center justify-center text-peach-600 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-peach-600">
                Staff & Laboratory Administration
              </span>
              <h1 className="text-xl font-extrabold text-botanical-950">
                Admin Console Login
              </h1>
            </div>
          </div>

          <div className="mb-5 p-3 rounded-2xl bg-peach-50/70 border border-peach-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-peach-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-botanical-950">Medical Director:</span>
                <span className="text-botanical-700/80 ml-1">admin@wellness.com</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loginAsDemo('admin')}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-botanical-900 text-white hover:bg-black transition-colors flex-shrink-0"
            >
              1-Click Sign In
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

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-peach-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@wellness.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-peach-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white"
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
              className="w-full py-3 px-4 rounded-xl bg-botanical-900 hover:bg-black active:bg-black text-white font-bold text-sm shadow-soft transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-2xl bg-ivory-100 border border-ivory-300/80 text-xs text-botanical-800/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-botanical-950">
              <ShieldAlert className="w-4 h-4 text-peach-600 flex-shrink-0" />
              <span>Public Admin Registration Disabled</span>
            </div>
            <p className="leading-relaxed">
              Administrative credentials are provisioned by laboratory IT. Unauthorized access is audited.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Admin Gateway
      </footer>
    </div>
  );
}
