'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Booking, 
  DiagnosticTest, 
  DiagnosticPackage, 
  LabReport, 
  Invoice, 
  DriverProfile, 
  BookingStatus, 
  LabReportResultItem 
} from '@/types';
interface DataContextType {
  tests: DiagnosticTest[];
  packages: DiagnosticPackage[];
  bookings: Booking[];
  reports: LabReport[];
  invoices: Invoice[];
  drivers: DriverProfile[];
  selectedTests: DiagnosticTest[];
  toggleSelectTest: (test: DiagnosticTest) => void;
  removeSelectedTest: (testId: string) => void;
  clearSelectedTests: () => void;
  isTestSelected: (testId: string) => boolean;
  createBooking: (bookingData: Omit<Booking, 'id' | 'booking_reference' | 'created_at' | 'updated_at' | 'status'>) => Booking;
  assignDriverToBooking: (bookingId: string, driverId: string) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus, sampleDetails?: Booking['sample_details']) => void;
  addReportForBooking: (orderId: string, results: LabReportResultItem[], overallRemarks: string) => LabReport;
  addTestPackage: (test: Omit<DiagnosticTest, 'id'>) => void;
  updateTestPackage: (id: string, test: Partial<DiagnosticTest>) => void;
  deleteTestPackage: (id: string) => void;
  resetAllDataToDefault: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_TESTS = 'wellness_tests_data_v3';
const STORAGE_KEY_PACKAGES = 'wellness_packages_data_v3';
const STORAGE_KEY_BOOKINGS = 'wellness_bookings_data_v3';
const STORAGE_KEY_REPORTS = 'wellness_reports_data_v3';
const STORAGE_KEY_INVOICES = 'wellness_invoices_data_v3';
const STORAGE_KEY_DRIVERS = 'wellness_drivers_data_v3';
const STORAGE_KEY_CART = 'wellness_cart_tests_v3';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [packages, setPackages] = useState<DiagnosticPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [selectedTests, setSelectedTests] = useState<DiagnosticTest[]>([]);

  // Fetch live tests from Supabase backend API on mount
  useEffect(() => {
    fetch('/api/tests')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setTests(data.data);
        }
      })
      .catch(() => {});

    fetch('/api/packages')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setPackages(data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const storedTests = localStorage.getItem(STORAGE_KEY_TESTS);
      if (storedTests) setTests(JSON.parse(storedTests));

      const storedPackages = localStorage.getItem(STORAGE_KEY_PACKAGES);
      if (storedPackages) setPackages(JSON.parse(storedPackages));

      const storedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (storedBookings) setBookings(JSON.parse(storedBookings));

      const storedReports = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (storedReports) setReports(JSON.parse(storedReports));

      const storedInvoices = localStorage.getItem(STORAGE_KEY_INVOICES);
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));

      const storedDrivers = localStorage.getItem(STORAGE_KEY_DRIVERS);
      if (storedDrivers) setDrivers(JSON.parse(storedDrivers));

      const storedCart = localStorage.getItem(STORAGE_KEY_CART);
      if (storedCart) setSelectedTests(JSON.parse(storedCart));
    } catch (e) {
      console.error('Failed to load data from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(selectedTests));
  }, [selectedTests]);

  const toggleSelectTest = (test: DiagnosticTest) => {
    setSelectedTests((prev) => {
      const exists = prev.some((t) => t.id === test.id);
      if (exists) {
        return prev.filter((t) => t.id !== test.id);
      } else {
        return [...prev, test];
      }
    });
  };

  const removeSelectedTest = (testId: string) => {
    setSelectedTests((prev) => prev.filter((t) => t.id !== testId));
  };

  const clearSelectedTests = () => {
    setSelectedTests([]);
  };

  const isTestSelected = (testId: string) => {
    return selectedTests.some((t) => t.id === testId);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'booking_reference' | 'created_at' | 'updated_at' | 'status'>): Booking => {
    const timestamp = Date.now();
    const booking_reference = `WD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: `ord_${timestamp}`,
      booking_reference,
      status: 'assigned',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));

    // Create corresponding invoice in INR
    const newInvoice: Invoice = {
      id: `inv_${timestamp}`,
      invoice_number: `INV-${booking_reference}`,
      booking_id: newBooking.id,
      patient_id: newBooking.patient_id,
      patient_name: newBooking.patient_name,
      subtotal: newBooking.subtotal,
      collection_fee: newBooking.collection_fee,
      tax_amount: 0,
      discount: newBooking.discount_amount,
      total_amount: newBooking.total_amount,
      issued_at: new Date().toISOString().split('T')[0],
      payment_method: newBooking.payment_method,
      status: newBooking.payment_status === 'paid' ? 'paid' : 'pending'
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(updatedInvoices));

    clearSelectedTests();
    return newBooking;
  };

  const assignDriverToBooking = (bookingId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          assigned_driver_id: driver.id,
          assigned_driver_name: driver.name,
          driver_phone: driver.phone,
          status: 'assigned' as BookingStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
  };

  const updateBookingStatus = (
    bookingId: string,
    status: BookingStatus,
    sampleDetails?: Booking['sample_details']
  ) => {
    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        const mergedDetails = sampleDetails ? { ...b.sample_details, ...sampleDetails } : b.sample_details;
        return {
          ...b,
          status,
          sample_details: mergedDetails,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
  };

  const addReportForBooking = (
    orderId: string,
    results: LabReportResultItem[],
    overallRemarks: string
  ): LabReport => {
    const booking = bookings.find((b) => b.id === orderId);
    if (!booking) throw new Error('Order not found');

    const reportId = `rep_${Date.now()}`;
    const report_number = `WDL-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newReport: LabReport = {
      id: reportId,
      report_number,
      booking_id: booking.id,
      booking_reference: booking.booking_reference,
      patient_id: booking.patient_id,
      patient_name: booking.patient_name,
      patient_age: booking.patient_age || 35,
      patient_gender: booking.patient_gender || 'Female',
      released_at: new Date().toISOString(),
      doctor_name: 'Dr. Eleanor Vance, MD (Chief Pathologist)',
      lab_technician: 'Robert Thorne, B.Sc MLT',
      tests_included: booking.tests?.map((t) => t.name) || booking.items?.map((it) => it.item_name) || ['Routine Checkup'],
      results,
      overall_remarks: overallRemarks
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updatedReports));

    const updatedBookings = bookings.map((b) => {
      if (b.id === orderId) {
        return {
          ...b,
          status: 'report_ready' as BookingStatus,
          report_id: newReport.id,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));

    return newReport;
  };

  const addTestPackage = (test: Omit<DiagnosticTest, 'id'>) => {
    const newTest: DiagnosticTest = {
      ...test,
      id: `pkg_${Date.now()}`
    };
    const updated = [...tests, newTest];
    setTests(updated);
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
  };

  const updateTestPackage = (id: string, updatedFields: Partial<DiagnosticTest>) => {
    const updated = tests.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTests(updated);
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
  };

  const deleteTestPackage = (id: string) => {
    const updated = tests.filter((t) => t.id !== id);
    setTests(updated);
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
  };

  const resetAllDataToDefault = () => {
    setBookings([]);
    setReports([]);
    setInvoices([]);
    setDrivers([]);
    setSelectedTests([]);
    localStorage.removeItem(STORAGE_KEY_CART);
    localStorage.removeItem(STORAGE_KEY_BOOKINGS);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
    localStorage.removeItem(STORAGE_KEY_INVOICES);
  };

  return (
    <DataContext.Provider
      value={{
        tests,
        packages,
        bookings,
        reports,
        invoices,
        drivers,
        selectedTests,
        toggleSelectTest,
        removeSelectedTest,
        clearSelectedTests,
        isTestSelected,
        createBooking,
        assignDriverToBooking,
        updateBookingStatus,
        addReportForBooking,
        addTestPackage,
        updateTestPackage,
        deleteTestPackage,
        resetAllDataToDefault
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
