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
  User,
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function DriverLoginPage() {
  const router = useRouter();
  const { login, registerAccount } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !phone || !email || !newPassword) {
      setErrorMessage('Please fill in all phlebotomist details.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerAccount({
        name,
        email,
        phone,
        password: newPassword,
        role: 'driver',
        badgeId: badgeId || `WD-PHLEB-${Math.floor(100 + Math.random() * 900)}`,
        designation: 'Senior Phlebotomist'
      });

      if (res.success) {
        setSuccessMessage('Phlebotomist account registered! Loading active route...');
        setTimeout(() => {
          router.push('/driver/dashboard');
        }, 400);
      } else {
        setErrorMessage(res.error || 'Failed to register phlebotomist account.');
      }
    } catch {
      setErrorMessage('Unexpected error during registration.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-ivory-200">
            <div className="w-12 h-12 rounded-2xl bg-botanical-50 border border-botanical-200 flex items-center justify-center text-botanical-700 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-botanical-600">
                Phlebotomy Field Gateway
              </span>
              <h1 className="text-xl font-extrabold text-botanical-950">
                {isRegisterMode ? 'Register Phlebotomist' : 'Phlebotomist Sign In'}
              </h1>
            </div>
          </div>

          {/* Toggle between Login and Registration */}
          <div className="grid grid-cols-2 p-1 bg-ivory-100 rounded-xl mb-5 border border-ivory-300/80">
            <button
              type="button"
              onClick={() => { setIsRegisterMode(false); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isRegisterMode ? 'bg-white text-botanical-950 shadow-soft-sm' : 'text-botanical-700 hover:text-botanical-950'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsRegisterMode(true); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isRegisterMode ? 'bg-white text-botanical-950 shadow-soft-sm' : 'text-botanical-700 hover:text-botanical-950'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Staff</span>
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

          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="e.g. phleb@wellness.com or 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-400 bg-white"
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
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-400 bg-white"
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
                className="w-full py-3 px-4 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white font-bold text-sm shadow-soft transition-all disabled:opacity-60 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In as Phlebotomist'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">Mobile Phone (Calling & GPS)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 11223"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">Staff Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@wellness.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">Vehicle / Badge ID (Optional)</label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. VAN-01 or KA-17-HB-1234"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-botanical-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-botanical-400 bg-white"
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
                className="w-full py-3 px-4 rounded-xl bg-botanical-600 hover:bg-botanical-700 text-white font-bold text-sm shadow-soft transition-all disabled:opacity-60 mt-2"
              >
                {loading ? 'Registering...' : 'Register Phlebotomist'}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Phlebotomy Field Gateway
      </footer>
    </div>
  );
}
