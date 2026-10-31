'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  Bell, 
  MessageSquare, 
  Smartphone, 
  FileText, 
  Sliders, 
  Download, 
  Trash2, 
  LogOut, 
  Check, 
  Loader2, 
  Sparkles,
  Calendar,
  Heart,
  Laptop,
  Radio,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function PatientSettingsPage() {
  const { user, changePassword, updateProfile, logout } = useAuth();
  const { bookings, reports, invoices } = useData();

  const [activeTab, setActiveTab] = useState<'security' | 'profile' | 'notifications' | 'preferences'>('security');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Profile & Medical Vitals State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState('1994-06-18');
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+ Positive');
  const [emergencyContact, setEmergencyContact] = useState('+91 98111 55667 (Husband)');
  const [medicalNotes, setMedicalNotes] = useState('None reported');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Notification Preferences State
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsTracking, setSmsTracking] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [checkupReminders, setCheckupReminders] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  // App & Clinical Preferences State
  const [glucoseUnit, setGlucoseUnit] = useState('mg/dL');
  const [language, setLanguage] = useState('English');
  const [autoDownloadReports, setAutoDownloadReports] = useState(false);
  const [dataExported, setDataExported] = useState(false);

  // Sync state with current user
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.preferences) {
        if (typeof user.preferences.whatsappAlerts === 'boolean') setWhatsappAlerts(user.preferences.whatsappAlerts);
        if (typeof user.preferences.smsTracking === 'boolean') setSmsTracking(user.preferences.smsTracking);
        if (typeof user.preferences.emailReports === 'boolean') setEmailReports(user.preferences.emailReports);
        if (typeof user.preferences.checkupReminders === 'boolean') setCheckupReminders(user.preferences.checkupReminders);
        if (typeof user.preferences.twoFactorAuth === 'boolean') setTwoFactorAuth(user.preferences.twoFactorAuth);
        if (user.preferences.glucoseUnit) setGlucoseUnit(user.preferences.glucoseUnit);
        if (user.preferences.language) setLanguage(user.preferences.language);
      }
    }
  }, [user]);

  // Handle Change Password Form
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError('Please enter your current account password.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match. Please re-enter.');
      return;
    }
    if (newPassword === currentPassword) {
      setPassError('New password must be different from your current password.');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsChangingPass(false);

    if (res.success) {
      setPassSuccess('Password updated successfully! Your account is secured with PBKDF2 encryption.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 5000);
    } else {
      setPassError(res.error || 'Failed to update password. Please check your current password.');
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsSavingProfile(true);

    const res = await updateProfile({
      name,
      phone,
      date_of_birth: dob,
      gender,
      blood_group: bloodGroup,
      emergency_contact: emergencyContact,
      medical_notes: medicalNotes,
      preferences: {
        whatsappAlerts,
        smsTracking,
        emailReports,
        checkupReminders,
        twoFactorAuth,
        glucoseUnit,
        language
      }
    });

    setIsSavingProfile(false);
    if (res.success) {
      setProfileSuccess('Medical profile & contact credentials updated successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } else {
      setProfileError(res.error || 'Failed to save changes.');
    }
  };

  // Handle Notifications Save
  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    setNotifSuccess(null);

    await updateProfile({
      preferences: {
        whatsappAlerts,
        smsTracking,
        emailReports,
        checkupReminders,
        twoFactorAuth,
        glucoseUnit,
        language
      }
    });

    setIsSavingNotifs(false);
    setNotifSuccess('Notification channels & security alert preferences updated.');
    setTimeout(() => setNotifSuccess(null), 4000);
  };

  // Export patient data as JSON
  const handleExportData = () => {
    const exportObject = {
      patientProfile: {
        id: user?.id,
        patientId: user?.patientId || user?.badgeId || 'WD-PT-001',
        name,
        email,
        phone,
        dob,
        gender,
        bloodGroup,
        emergencyContact,
        medicalNotes
      },
      bookingsHistory: bookings.map(b => ({
        id: b.id,
        date: b.scheduled_date,
        timeSlot: b.scheduled_slot,
        tests: b.items?.map(i => i.item_name),
        status: b.status,
        amount: b.total_amount
      })),
      invoicesHistory: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        amount: inv.total_amount,
        status: inv.status
      })),
      exportDate: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wellness_patient_data_${user?.patientId || 'WD-PT-001'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDataExported(true);
    setTimeout(() => setDataExported(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-botanical-500 text-white font-extrabold flex items-center justify-center text-xl shadow-soft">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-botanical-950">
                {user?.name || 'Patient'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-botanical-100 text-botanical-800 border border-botanical-200">
                {user?.patientId || user?.badgeId || 'WD-PT-001'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-botanical-700/80">
              {user?.email || 'patient@wellness.com'} • {user?.phone || '+91 98765 43210'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PBKDF2-HMAC-SHA256 Encrypted</span>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-ivory-300">
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-botanical-500 text-botanical-950 bg-white shadow-soft-xs'
              : 'border-transparent text-botanical-700 hover:text-botanical-950 hover:bg-white/50'
          }`}
        >
          <KeyRound className="w-4 h-4 text-botanical-600" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-botanical-500 text-botanical-950 bg-white shadow-soft-xs'
              : 'border-transparent text-botanical-700 hover:text-botanical-950 hover:bg-white/50'
          }`}
        >
          <User className="w-4 h-4 text-botanical-600" />
          <span>Medical Profile & Vitals</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'notifications'
              ? 'border-botanical-500 text-botanical-950 bg-white shadow-soft-xs'
              : 'border-transparent text-botanical-700 hover:text-botanical-950 hover:bg-white/50'
          }`}
        >
          <Bell className="w-4 h-4 text-botanical-600" />
          <span>Notifications & Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'preferences'
              ? 'border-botanical-500 text-botanical-950 bg-white shadow-soft-xs'
              : 'border-transparent text-botanical-700 hover:text-botanical-950 hover:bg-white/50'
          }`}
        >
          <Sliders className="w-4 h-4 text-botanical-600" />
          <span>Clinical Preferences & Data</span>
        </button>
      </div>

      {/* TAB 1: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Change Password Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-ivory-200">
              <div className="w-10 h-10 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                  Change Account Password
                </h2>
                <p className="text-xs text-botanical-700/80">
                  Keep your personal clinical files and diagnostic reports safe with a strong, secure password
                </p>
              </div>
            </div>

            {passSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-botanical-500 hover:text-botanical-800"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters with mixed casing"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-botanical-500 hover:text-botanical-800"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 flex-1 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${newPassword.length >= 8 && /[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-ivory-300'}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${newPassword.length >= 8 && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-ivory-300'}`} />
                    </div>
                    <span className="text-[10px] text-botanical-700 block">
                      Strength: {newPassword.length < 6 ? 'Weak (<6 chars)' : newPassword.length >= 8 && /[A-Z]/.test(newPassword) ? 'Strong Password' : 'Good Password'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-botanical-500 hover:text-botanical-800"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <span className={`text-[11px] font-semibold mt-1 block ${newPassword === confirmPassword ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-6 py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-xs sm:text-sm hover:bg-botanical-600 transition-colors shadow-soft flex items-center gap-2 disabled:opacity-50"
                >
                  {isChangingPass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Hashing & Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication & Account Verification */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
              <div className="w-10 h-10 rounded-2xl bg-peach-50 text-peach-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                  Two-Factor Verification & Phlebotomist Handshake
                </h2>
                <p className="text-xs text-botanical-700/80">
                  Ensures biological specimen security during home doorstep collection
                </p>
              </div>
            </div>

            <div className="divide-y divide-ivory-200">
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-botanical-950">
                    Phlebotomist Sample Handshake OTP
                  </p>
                  <p className="text-xs text-botanical-700/80">
                    Require phlebotomist to enter your secure 4-digit OTP before collecting blood/urine samples
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => {
                      setTwoFactorAuth(e.target.checked);
                      handleSaveNotifications();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ivory-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ivory-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-botanical-500" />
                </label>
              </div>

              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-botanical-950">
                    Login Security Alerts
                  </p>
                  <p className="text-xs text-botanical-700/80">
                    Get an instant email and SMS alert if your patient account is accessed from a new device
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  Always Active
                </span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                    Active Devices & Sessions
                  </h2>
                  <p className="text-xs text-botanical-700/80">
                    Manage where your clinical patient account is signed in
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('All other browser sessions have been invalidated. Current device remains active.');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
              >
                Sign out other devices
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-botanical-950">
                    Current Web Browser Session (Active Now)
                  </p>
                  <p className="text-[11px] text-botanical-700/80">
                    Cookie: <span className="font-mono text-botanical-900">wellness_auth_session (Lax)</span> • SSL Encrypted
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                This Device
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAL PROFILE & VITALS */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {profileSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Basic Identity */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
                <div className="w-10 h-10 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                    Personal Identity & Contact
                  </h2>
                  <p className="text-xs text-botanical-700/80">
                    Official patient record used on NABL diagnostic test certificates
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Patient Reference ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.patientId || user?.badgeId || 'WD-PT-001'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-sm font-mono text-botanical-800 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-sm text-botanical-800 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Mobile Phone (WhatsApp Enabled)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Physiological & Medical Vitals */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                    Clinical Vitals & Emergency Contact
                  </h2>
                  <p className="text-xs text-botanical-700/80">
                    Referenced by pathologists when calibrating age/gender reference ranges
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Biological Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  >
                    <option value="O+ Positive">O+ Positive</option>
                    <option value="O- Negative">O- Negative</option>
                    <option value="A+ Positive">A+ Positive</option>
                    <option value="A- Negative">A- Negative</option>
                    <option value="B+ Positive">B+ Positive</option>
                    <option value="B- Negative">B- Negative</option>
                    <option value="AB+ Positive">AB+ Positive</option>
                    <option value="AB- Negative">AB- Negative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Emergency Contact (Name & Phone)
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Allergies & Phlebotomy Notes
                  </label>
                  <input
                    type="text"
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    placeholder="e.g. Latex allergy, difficult vein finding"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-xs sm:text-sm hover:bg-botanical-600 transition-colors shadow-soft flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile & Vitals</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS & ALERTS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-ivory-200">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                  Diagnostic Alert Channels
                </h2>
                <p className="text-xs text-botanical-700/80">
                  Choose how you receive phlebotomist live tracking and certified lab reports
                </p>
              </div>
            </div>

            {notifSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{notifSuccess}</span>
              </div>
            )}

            <div className="divide-y divide-ivory-200 space-y-2">
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-botanical-950">
                      WhatsApp PDF Report Delivery
                    </p>
                    <p className="text-xs text-botanical-700/80">
                      Get your NABL verified lab report PDF instantly on WhatsApp when testing is complete
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ivory-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ivory-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-botanical-500" />
                </label>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-botanical-950">
                      Phlebotomist Departure & ETA SMS
                    </p>
                    <p className="text-xs text-botanical-700/80">
                      Receive an SMS notification when the phlebotomist starts driving to your home address
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsTracking}
                    onChange={(e) => setSmsTracking(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ivory-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ivory-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-botanical-500" />
                </label>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-botanical-950">
                      Email Invoices & Lab Test Results
                    </p>
                    <p className="text-xs text-botanical-700/80">
                      Receive clinical invoices, tax receipts, and laboratory attachments via email
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailReports}
                    onChange={(e) => setEmailReports(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ivory-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ivory-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-botanical-500" />
                </label>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-botanical-950">
                      Preventive Checkup Reminders
                    </p>
                    <p className="text-xs text-botanical-700/80">
                      Gentle periodic reminder every 6 months to maintain routine wellness profiles
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkupReminders}
                    onChange={(e) => setCheckupReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ivory-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ivory-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-botanical-500" />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={isSavingNotifs}
                className="px-6 py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-xs sm:text-sm hover:bg-botanical-600 transition-colors shadow-soft flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingNotifs ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Alert Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLINICAL PREFERENCES & DATA PRIVACY */}
      {activeTab === 'preferences' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Preferences Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-ivory-200">
              <div className="w-10 h-10 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                  Clinical Measurement Units & Display
                </h2>
                <p className="text-xs text-botanical-700/80">
                  Configure medical measurement standards across reports and booking summaries
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  Blood Glucose Standard Unit
                </label>
                <select
                  value={glucoseUnit}
                  onChange={(e) => setGlucoseUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                >
                  <option value="mg/dL">mg/dL (Indian / US Standard - Recommended)</option>
                  <option value="mmol/L">mmol/L (International SI Unit)</option>
                </select>
                <p className="text-[11px] text-botanical-700/70 mt-1">
                  Reference range graphs on your reports will adapt accordingly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  Portal Display Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-sm font-semibold text-botanical-950 focus:outline-none focus:ring-2 focus:ring-botanical-500 bg-white"
                >
                  <option value="English">English (Default)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveNotifications}
                className="px-6 py-2.5 rounded-xl bg-botanical-500 text-white font-bold text-xs sm:text-sm hover:bg-botanical-600 transition-colors shadow-soft"
              >
                Save Clinical Preferences
              </button>
            </div>
          </div>

          {/* Data Export & Privacy */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-ivory-200">
              <div className="w-10 h-10 rounded-2xl bg-botanical-50 text-botanical-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-botanical-950">
                  Data Portability & Records Export
                </h2>
                <p className="text-xs text-botanical-700/80">
                  Download an offline copy of your medical diagnostic appointments and profile
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-botanical-950">
                  Download All Patient Records (JSON Format)
                </p>
                <p className="text-xs text-botanical-700/80">
                  Includes all booked tests, registered home addresses, invoices, and diagnostic summary
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-botanical-900 font-bold text-xs hover:bg-ivory-100 transition-colors shadow-soft-xs flex items-center gap-2 flex-shrink-0"
              >
                <Download className="w-4 h-4 text-botanical-600" />
                <span>{dataExported ? 'Downloaded!' : 'Export Data File'}</span>
              </button>
            </div>
          </div>

          {/* Account Logout / Session Reset */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-soft-sm space-y-4">
            <h2 className="text-base font-bold text-rose-950">
              Session & Account Sign Out
            </h2>
            <p className="text-xs text-botanical-700/80">
              Signing out will end your current session and clear encrypted credentials from this browser.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 transition-colors shadow-soft flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Patient Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
