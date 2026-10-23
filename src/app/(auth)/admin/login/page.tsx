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
  User,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, registerAccount, usersList } = useAuth();

  const hasExistingAdmin = usersList.some((u) => u.role === 'admin');
  const [isSetupMode, setIsSetupMode] = useState(!hasExistingAdmin);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Laboratory Director');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSetupMode) {
        if (!name || !email || !phone || !password) {
          setErrorMessage('Please fill in all administrator details.');
          setLoading(false);
          return;
        }

        const res = await registerAccount({
          name,
          email,
          phone,
          password,
          role: 'admin',
          designation
        });

        if (res.success) {
          setSuccessMessage('Administrator account initialized successfully! Loading console...');
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 400);
        } else {
          setErrorMessage(res.error || 'Failed to initialize admin account.');
        }
      } else {
        const result = await login(email, password, 'admin');
        if (result.success) {
          setSuccessMessage('Admin credentials verified. Launching Clinical Laboratory Management...');
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 400);
        } else {
          setErrorMessage(result.error || 'Admin authentication failed.');
        }
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
                {isSetupMode ? 'Create Admin Account' : 'Admin Console Login'}
              </h1>
            </div>
          </div>

          {/* Toggle between Login and Setup */}
          <div className="grid grid-cols-2 p-1 bg-ivory-100 rounded-xl mb-5 border border-ivory-300/80">
            <button
              type="button"
              onClick={() => { setIsSetupMode(false); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isSetupMode ? 'bg-white text-botanical-950 shadow-soft-sm' : 'text-botanical-700 hover:text-botanical-950'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsSetupMode(true); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isSetupMode ? 'bg-white text-botanical-950 shadow-soft-sm' : 'text-botanical-700 hover:text-botanical-950'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New Admin</span>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetupMode && (
              <>
                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-peach-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Joel Joyson"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1.5">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Managing Director / Chief Administrator"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-peach-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-peach-400 bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-peach-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (minimum 4 characters)"
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
              {loading 
                ? (isSetupMode ? 'Creating Account...' : 'Authenticating...') 
                : (isSetupMode ? 'Create Administrator Account' : 'Sign In to Admin Console')}
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Admin Gateway • Davangere Clinical Hub
      </footer>
    </div>
  );
}
