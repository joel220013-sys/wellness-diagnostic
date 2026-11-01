'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Receipt, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  MapPin, 
  Users, 
  Truck,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import NotificationQuickControl from '@/components/notifications/NotificationQuickControl';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { bookings, reports, invoices, drivers } = useData();

  // Metrics derived from actual database records
  const totalBookings = bookings.length;
  const pendingConfirmation = bookings.filter((b) => b.status === 'Pending').length;
  const assignedJobs = bookings.filter((b) => ['Assigned', 'Collection Scheduled'].includes(b.status)).length;
  const collectionsCompleted = bookings.filter((b) => ['Sample Collected', 'Processing', 'Report Ready'].includes(b.status)).length;
  const reportsReady = reports.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const paidRevenue = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  // Recharts Chart Data: Collections by Status
  const statusDistributionData = [
    { name: 'Pending', count: bookings.filter((b) => b.status === 'Pending').length, color: '#F59E0B' },
    { name: 'Confirmed', count: bookings.filter((b) => b.status === 'Confirmed').length, color: '#0D9488' },
    { name: 'Assigned', count: assignedJobs, color: '#2563EB' },
    { name: 'Collected', count: bookings.filter((b) => b.status === 'Sample Collected').length, color: '#8B5CF6' },
    { name: 'Report Ready', count: reportsReady, color: '#08784E' },
  ];

  // Recharts Weekly Volume Trend
  const weeklyTrendData = [
    { day: 'Mon', collections: 12, revenue: 18500 },
    { day: 'Tue', collections: 18, revenue: 26400 },
    { day: 'Wed', collections: 15, revenue: 22100 },
    { day: 'Thu', collections: 22, revenue: 34800 },
    { day: 'Fri', collections: 26, revenue: 41200 },
    { day: 'Sat', collections: 31, revenue: 49500 },
    { day: 'Sun', collections: 19, revenue: 28900 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950">
            Laboratory Operations Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-botanical-700/80">
            Real-time home phlebotomy dispatch, order intake, pathology turnarounds & revenue in INR
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/map"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-botanical-950 font-bold text-xs border border-ivory-300 shadow-soft-sm"
          >
            <MapPin className="w-4 h-4 text-botanical-600" />
            <span>Live Dispatch Map</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-botanical-500 hover:bg-botanical-600 text-white font-bold text-xs shadow-soft transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Live Order Audio & Push Alert Banner */}
      <div className="bg-white/80 backdrop-blur p-3.5 sm:p-4 rounded-2xl border border-ivory-300 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-botanical-950">
            Real-Time Order Alert System
          </span>
          <span className="text-[11px] text-botanical-700/70 hidden md:inline">
            • Loud audio chime & lock-screen push notifications enabled for desk staff
          </span>
        </div>
        <NotificationQuickControl />
      </div>

      {/* 6 Key Operational Metrics (Database Derived) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-ivory-300 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-botanical-700">Total Orders</span>
          <p className="text-2xl font-extrabold text-botanical-950 mt-1">{totalBookings}</p>
          <span className="text-[10px] text-botanical-600 font-medium">All patient orders</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-amber-800">Pending Action</span>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">{pendingConfirmation}</p>
          <span className="text-[10px] text-amber-700 font-medium">Needs confirmation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-blue-800">Assigned / In Transit</span>
          <p className="text-2xl font-extrabold text-blue-950 mt-1">{assignedJobs}</p>
          <span className="text-[10px] text-blue-700 font-medium">Active phlebotomists</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-purple-800">Samples Collected</span>
          <p className="text-2xl font-extrabold text-purple-950 mt-1">{collectionsCompleted}</p>
          <span className="text-[10px] text-purple-700 font-medium">Lab processing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-emerald-800">Reports Released</span>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">{reportsReady}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Pathology signed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-peach-200 bg-peach-50/30 shadow-soft-sm">
          <span className="text-[11px] font-semibold text-botanical-900">Total Billed</span>
          <p className="text-2xl font-extrabold text-botanical-950 mt-1">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-700 font-bold">₹{paidRevenue.toLocaleString()} Paid</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weekly Revenue & Collection Trend */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-botanical-950">Weekly Diagnostic Collections & Volume</h2>
              <p className="text-xs text-botanical-700/80">Completed home phlebotomy visits over the past 7 days</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFF0E0" />
                <XAxis dataKey="day" stroke="#18352E" fontSize={12} />
                <YAxis stroke="#18352E" fontSize={12} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? `₹${value}` : `${value} Collections`,
                    name === 'revenue' ? 'Revenue' : 'Collections'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2D9CF' }}
                />
                <Bar dataKey="collections" fill="#08784E" radius={[6, 6, 0, 0]} name="collections" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Status Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-soft-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-botanical-950">Order Status Breakdown</h2>
            <p className="text-xs text-botanical-700/80">Current state of all bookings</p>
          </div>

          <div className="space-y-3 pt-2">
            {statusDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-botanical-950">{item.name}</span>
                </div>
                <span className="font-bold text-botanical-900 px-2 py-0.5 rounded-lg bg-ivory-100">
                  {item.count} Orders
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-ivory-200">
            <Link
              href="/admin/assignments"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-botanical-50 hover:bg-botanical-100 text-botanical-800 font-bold text-xs border border-botanical-200 transition-colors"
            >
              <Users className="w-4 h-4 text-botanical-600" />
              <span>Phlebotomist Dispatch Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Intake Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-botanical-950">Recent Orders Feed</h2>
            <p className="text-xs text-botanical-700/80">Incoming bookings awaiting verification and dispatch</p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-botanical-600 hover:text-botanical-700 flex items-center gap-1"
          >
            <span>View All ({bookings.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/80 text-botanical-800 font-bold uppercase tracking-wider border-b border-ivory-200">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Scheduled Slot</th>
                <th className="p-3">Location</th>
                <th className="p-3">Tests</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-ivory-50/50 transition-colors">
                  <td className="p-3 font-bold text-botanical-950">#{booking.booking_reference}</td>
                  <td className="p-3 font-semibold text-botanical-900">{booking.patient_name}</td>
                  <td className="p-3 text-botanical-700/80">
                    {booking.scheduled_date} <br />
                    <span className="text-[10px] text-botanical-600 font-medium">{booking.scheduled_slot}</span>
                  </td>
                  <td className="p-3 text-botanical-700/80 truncate max-w-[150px]">
                    {booking.address_snapshot?.locality}, {booking.address_snapshot?.city}
                  </td>
                  <td className="p-3 text-botanical-800">{booking.items ? booking.items.length : 0} Tests</td>
                  <td className="p-3 font-bold text-botanical-950">₹{booking.total_amount}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ivory-200 text-botanical-800 border border-ivory-300">
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/orders/${booking.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-botanical-600 hover:text-botanical-800"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
