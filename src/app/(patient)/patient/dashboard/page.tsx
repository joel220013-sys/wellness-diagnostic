'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CalendarPlus, 
  FileText, 
  Receipt, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight,
  Download,
  Eye,
  ShieldCheck,
  Calendar,
  XCircle,
  ShoppingBag,
  ArrowRight,
  FlaskConical,
  Plus,
  Check,
  Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import LabReportModal from '@/components/reports/LabReportModal';
import InvoiceModal from '@/components/invoices/InvoiceModal';
import { LabReport, Invoice, Booking, DiagnosticTest } from '@/types';
import PackageOverviewDrawer from '@/components/packages/PackageOverviewDrawer';
import MobileBottomCartBar from '@/components/cart/MobileBottomCartBar';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const { 
    tests,
    bookings, 
    reports, 
    invoices, 
    selectedTests, 
    toggleSelectTest,
    isTestSelected,
    removeSelectedTest, 
    clearSelectedTests,
    setIsCartOpen 
  } = useData();

  const [activeReport, setActiveReport] = useState<LabReport | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [overviewTest, setOverviewTest] = useState<DiagnosticTest | null>(null);

  const popularTests = React.useMemo(() => {
    const uniqueMap = new Map();
    for (const t of tests) {
      const key = (t.name || '').toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, t);
      }
    }
    const all = Array.from(uniqueMap.values());
    const popular = all.filter((t: any) => t.popular);
    return (popular.length > 0 ? popular : all).slice(0, 4);
  }, [tests]);

  // Filter bookings, reports, invoices for current authenticated patient
  const patientBookings = bookings.filter(
    (b) => b.patient_id === user?.id || b.patient_name === user?.name || user?.email === 'patient@wellness.com'
  );

  const patientReports = reports.filter(
    (r) => r.patient_id === user?.id || r.patient_name === user?.name || user?.email === 'patient@wellness.com'
  );

  const patientInvoices = invoices.filter(
    (inv) => inv.patient_id === user?.id || inv.patient_name === user?.name || user?.email === 'patient@wellness.com'
  );

  const upcomingBookings = patientBookings.filter(
    (b) => !['Report Ready', 'Cancelled', 'Failed'].includes(b.status)
  );

  const completedBookings = patientBookings.filter(
    (b) => ['Report Ready', 'Completed'].includes(b.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Report Ready':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Processing':
      case 'Sample Collected':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Assigned':
      case 'Collection Scheduled':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Confirmed':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Cancelled':
      case 'Failed':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-ivory-100 text-botanical-800 border-ivory-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#18352E] to-botanical-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-soft">
        <div className="absolute right-0 top-0 w-80 h-80 bg-peach-300/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-peach-300 text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome Back, {user?.name?.split(' ')[0] || 'Patient'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Your Health & Diagnostics Portal
            </h1>
            <p className="text-sm text-ivory-200/80 max-w-xl">
              Track upcoming home blood collections, inspect verified pathology reports, and view itemized invoices.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/patient/settings"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-sm border border-white/15 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Settings & Security</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Cart Notification for Patient */}
      {selectedTests.length > 0 && (
        <div className="bg-gradient-to-r from-peach-50 to-amber-50/70 border border-peach-200/90 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-peach-100 text-peach-700 shadow-soft-sm">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-botanical-950 text-base sm:text-lg">
                  You have {selectedTests.length} {selectedTests.length === 1 ? 'test' : 'tests'} saved in your Cart
                </h3>
                <p className="text-xs text-botanical-800/80">
                  Ready for doorstep sample collection appointment.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedTests.map((test) => (
                <span
                  key={test.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-peach-200 text-botanical-900 shadow-soft-sm"
                >
                  <span>{test.name}</span>
                  <span className="font-bold text-botanical-600">₹{test.price}</span>
                  <button
                    onClick={() => removeSelectedTest(test.id)}
                    className="ml-1 text-gray-400 hover:text-red-500 text-sm font-bold leading-none"
                    title="Remove test"
                    aria-label={`Remove ${test.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-botanical-900 hover:text-botanical-950 bg-white hover:bg-ivory-50 border border-peach-200 transition-colors shadow-soft-xs flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-peach-600" />
              <span>Review Cart</span>
            </button>
            <button
              onClick={clearSelectedTests}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-600 bg-white/80 hover:bg-white border border-gray-200 transition-colors"
            >
              Clear Cart
            </button>
            <Link
              href="/patient/book"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all hover:-translate-y-0.5"
            >
              <span>Complete Booking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-ivory-300 shadow-soft-sm">
          <div className="flex items-center justify-between text-botanical-700 mb-1.5">
            <span className="text-xs font-semibold">Active Bookings</span>
            <Clock className="w-4 h-4 text-botanical-500" />
          </div>
          <p className="text-2xl font-extrabold text-botanical-950">{upcomingBookings.length}</p>
          <p className="text-[10px] text-botanical-700/70 mt-0.5">Sample appointments</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-ivory-300 shadow-soft-sm">
          <div className="flex items-center justify-between text-botanical-700 mb-1.5">
            <span className="text-xs font-semibold">Lab Reports</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-botanical-950">{patientReports.length}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Verified & Ready</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-ivory-300 shadow-soft-sm">
          <div className="flex items-center justify-between text-botanical-700 mb-1.5">
            <span className="text-xs font-semibold">Total Invoices</span>
            <Receipt className="w-4 h-4 text-peach-600" />
          </div>
          <p className="text-2xl font-extrabold text-botanical-950">{patientInvoices.length}</p>
          <p className="text-[10px] text-botanical-700/70 mt-0.5">Itemized receipts in ₹</p>
        </div>

        <Link 
          href="/patient/tests"
          className="bg-white p-4.5 rounded-2xl border border-ivory-300 shadow-soft-sm hover:border-botanical-400 hover:shadow-soft transition-all group"
        >
          <div className="flex items-center justify-between text-botanical-700 mb-1.5">
            <span className="text-xs font-semibold group-hover:text-botanical-900 transition-colors">All Tests</span>
            <FlaskConical className="w-4 h-4 text-botanical-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-botanical-950">{tests.length > 0 ? `${tests.length}+` : '0'}</p>
          <p className="text-[10px] text-botanical-600 font-semibold mt-0.5 flex items-center gap-0.5">
            <span>Browse Catalog</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </Link>

        <div className="bg-white p-4.5 rounded-2xl border border-ivory-300 shadow-soft-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-botanical-700 mb-1.5">
            <span className="text-xs font-semibold">Patient ID</span>
            <ShieldCheck className="w-4 h-4 text-botanical-600" />
          </div>
          <p className="text-lg font-extrabold text-botanical-950 truncate">{user?.patientId || user?.badgeId || 'WD-PT-001'}</p>
          <p className="text-[10px] text-botanical-700/70 mt-0.5">Verified Clinical File</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Bookings & Lab Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active & Upcoming Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-botanical-950">Active Collection Appointments</h2>
              <p className="text-xs text-botanical-700/80">Real-time phlebotomist tracking & timeline</p>
            </div>
            <Link
              href="/patient/bookings"
              className="text-xs font-bold text-botanical-600 hover:text-botanical-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-ivory-300 text-center space-y-4 shadow-soft-sm">
              <div className="w-12 h-12 rounded-full bg-botanical-50 text-botanical-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-botanical-950">No Active Bookings Scheduled</h3>
                <p className="text-xs text-botanical-700/70 max-w-sm mx-auto mt-1">
                  You do not have any pending home sample appointments. Book a routine checkup or specialized profile today.
                </p>
              </div>
              <Link
                href={selectedTests.length > 0 ? "/patient/book" : "/patient/tests"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-botanical-500 text-white font-bold text-xs shadow-soft"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>{selectedTests.length > 0 ? `Book Collection (${selectedTests.length} in Cart)` : 'Schedule Home Collection'}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-5 border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-botanical-950">
                          Ref: #{booking.booking_reference}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-botanical-700/80 mt-1">
                        Scheduled: <strong>{booking.scheduled_date}</strong> • Slot: <strong>{booking.scheduled_slot}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-botanical-950">₹{booking.total_amount}</p>
                      <span className="text-[10px] text-botanical-600 font-semibold">
                        {booking.payment_status === 'Paid' ? 'Paid Online' : 'Pay at Collection'}
                      </span>
                    </div>
                  </div>

                  {/* Test items preview */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-botanical-800">Diagnostic Tests Included:</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(booking.items || []).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-ivory-100 text-[11px] font-medium text-botanical-900 border border-ivory-200"
                        >
                          {item.item_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Phlebotomist & Address Details */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-botanical-800/80 gap-2 border-t border-ivory-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-botanical-500 flex-shrink-0" />
                      <span className="truncate max-w-xs">{booking.address_snapshot?.locality || 'Home Address'}, {booking.address_snapshot?.city || 'Delhi'}</span>
                    </div>

                    <Link
                      href={`/patient/bookings/${booking.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-botanical-600 hover:text-botanical-700"
                    >
                      <span>Track Status Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick-browse Diagnostic Tests & Packages */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-botanical-950">Book Diagnostic Tests & Packages</h2>
                <p className="text-xs text-botanical-700/80">Select routine checkups or full-body diagnostic panels</p>
              </div>
              <Link
                href="/patient/tests"
                className="text-xs font-bold text-botanical-600 hover:text-botanical-700 flex items-center gap-1 group"
              >
                <span>View All Tests ({tests.length})</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {popularTests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-ivory-300 shadow-soft-sm space-y-2">
                <FlaskConical className="w-8 h-8 text-botanical-400 mx-auto" />
                <p className="text-xs font-bold text-botanical-950">No diagnostic tests currently in catalog</p>
                <p className="text-[11px] text-botanical-700/80">New specialized tests and health checkup profiles will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {popularTests.map((t: any) => {
                const selected = isTestSelected(t.id);
                return (
                  <div
                    key={t.id}
                    className={`bg-white rounded-2xl p-4 border transition-all ${
                      selected
                        ? 'border-botanical-600 ring-2 ring-botanical-500/20 shadow-soft'
                        : 'border-ivory-300 hover:border-botanical-300 shadow-soft-sm'
                    } flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-ivory-100 text-botanical-700">
                          {t.category || 'Clinical Profile'}
                        </span>
                        <span className="text-xs font-extrabold text-botanical-950">₹{t.price}</span>
                      </div>
                      <h3 
                        onClick={() => setOverviewTest(t)}
                        className="font-bold text-botanical-950 text-sm mt-2 line-clamp-1 cursor-pointer hover:text-botanical-600 transition-colors"
                      >
                        {t.name}
                      </h3>
                      <p className="text-[11px] text-botanical-700/80 line-clamp-2 mt-1">{t.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-ivory-100">
                      <button
                        type="button"
                        onClick={() => setOverviewTest(t)}
                        className="text-[10px] text-botanical-600 hover:text-botanical-800 font-bold hover:underline"
                      >
                        {t.parameters_count || (t.parameters?.length) || 1} Tests Included &gt;
                      </button>
                      <button
                        onClick={() => toggleSelectTest(t)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selected
                            ? 'bg-botanical-700 text-white shadow-soft-sm'
                            : 'bg-ivory-100 text-botanical-800 hover:bg-botanical-50 hover:text-botanical-700 border border-ivory-300'
                        }`}
                      >
                        {selected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>

        {/* Right Col: Latest Lab Reports & Actions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-botanical-950">Recent Lab Reports</h2>
            <Link
              href="/patient/reports"
              className="text-xs font-bold text-botanical-600 hover:text-botanical-700 flex items-center gap-1"
            >
              <span>All Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {patientReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-ivory-300 text-center space-y-3 shadow-soft-sm">
              <FileText className="w-8 h-8 text-botanical-400 mx-auto" />
              <p className="text-xs font-semibold text-botanical-800">No Laboratory Reports Released Yet</p>
              <p className="text-[11px] text-botanical-700/70">
                Reports will appear here automatically once our clinical pathologists verify your blood sample.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {patientReports.slice(0, 3).map((report) => (
                <div
                  key={report.id}
                  className="bg-white p-4 rounded-2xl border border-ivory-300 hover:border-botanical-300 transition-all shadow-soft-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-botanical-950 truncate max-w-[160px]">
                        {report.test_name}
                      </p>
                      <p className="text-[10px] text-botanical-700/70">
                        Released: {report.released_at}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveReport(report)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-botanical-800 bg-ivory-100 hover:bg-botanical-50 hover:text-botanical-700 border border-ivory-300 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="bg-peach-50/60 rounded-3xl p-5 border border-peach-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-botanical-900">
              Quick Patient Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/patient/tests"
                className="flex items-center justify-between p-3 rounded-xl bg-white text-xs font-semibold text-botanical-950 border border-peach-100 hover:border-peach-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-botanical-600" />
                  <span>Browse All Diagnostic Tests ({tests.length})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-botanical-400" />
              </Link>

              <Link
                href="/patient/addresses"
                className="flex items-center justify-between p-3 rounded-xl bg-white text-xs font-semibold text-botanical-950 border border-peach-100 hover:border-peach-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-botanical-600" />
                  <span>Manage Collection Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-botanical-400" />
              </Link>

              <Link
                href="/patient/invoices"
                className="flex items-center justify-between p-3 rounded-xl bg-white text-xs font-semibold text-botanical-950 border border-peach-100 hover:border-peach-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-botanical-600" />
                  <span>View All Invoices & Receipts</span>
                </div>
                <ChevronRight className="w-4 h-4 text-botanical-400" />
              </Link>

              <Link
                href="/patient/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-white text-xs font-semibold text-botanical-950 border border-peach-100 hover:border-peach-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-botanical-600" />
                  <span>Emergency Contact & Medical Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-botanical-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Report Modal */}
      {activeReport && (
        <LabReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}

      {/* Invoice Modal */}
      {activeInvoice && (
        <InvoiceModal
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}

      {/* Package Overview Drawer */}
      <PackageOverviewDrawer
        test={overviewTest}
        isOpen={!!overviewTest}
        onClose={() => setOverviewTest(null)}
      />

      {/* Mobile Sticky Bottom Cart Bar */}
      <MobileBottomCartBar />
    </div>
  );
}
