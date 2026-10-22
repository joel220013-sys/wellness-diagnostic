'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, CheckCircle2, Send } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-ivory-200 text-botanical-900 selection:bg-botanical-200 flex flex-col justify-between">
      <header className="bg-white/80 backdrop-blur-md border-b border-ivory-300 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />
          <Link href="/home" className="text-xs font-semibold text-botanical-800 hover:text-botanical-600">
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-botanical-950">
            Contact Laboratory & Support
          </h1>
          <p className="text-xs sm:text-sm text-botanical-800/80 mt-1">
            Questions regarding blood tests, sample preparation, or home collection booking? We are here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft space-y-5 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-botanical-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-botanical-950 block">Phone Support</span>
                <p className="text-botanical-700">+91 98765 01234 (7 Days, 6 AM - 9 PM)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-botanical-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-botanical-950 block">Email Desk</span>
                <p className="text-botanical-700">support@wellnessdiagnostic.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-botanical-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-botanical-950 block">Central Diagnostic Reference Laboratory</span>
                <p className="text-botanical-700">
                  740 Pathology Centre Blvd, Sector 4, HSR Layout, Bengaluru, Karnataka 560102
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft">
            {submitted ? (
              <div className="p-6 text-center text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-botanical-500 mx-auto" />
                <h3 className="font-extrabold text-sm text-botanical-950">Message Received</h3>
                <p className="text-botanical-700">Our medical support team will get in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-botanical-900 mb-1">Message / Inquiry *</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold shadow-soft flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-botanical-700/60 border-t border-ivory-300">
        Wellness Diagnostic Customer Helpdesk
      </footer>
    </div>
  );
}
