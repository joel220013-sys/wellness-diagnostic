'use client';

import React, { useState } from 'react';
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
  ShieldCheck 
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/security/sanitize';

export default function PatientRegisterPage() {
  const router = useRouter();
  const { registerPatient } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

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

    setLoading(true);
    try {
      const res = await registerPatient({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
        address: cleanAddress
      });

      if (res.success) {
        setSuccessMessage('Account registered successfully! Redirecting to Patient Dashboard...');
        setTimeout(() => {
          router.push('/patient/dashboard');
        }, 500);
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } catch {
      setErrorMessage('Unable to complete registration. Please try again.');
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

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Mobile Number (India +91) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-botanical-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-ivory-300 focus:ring-2 focus:ring-botanical-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-botanical-900 mb-1">Home Collection Address (Optional)</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-botanical-500 hover:bg-botanical-600 active:bg-botanical-700 text-white font-bold text-sm shadow-soft transition-all disabled:opacity-60 mt-3"
            >
              {loading ? 'Creating Account...' : 'Complete Patient Registration'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-ivory-200 text-center text-xs text-botanical-700/70 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-botanical-500" />
            <span>Encrypted clinical records & data protection</span>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60">
        Wellness Diagnostic Patient Security Gateway
      </footer>
    </div>
  );
}
