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

const STORAGE_KEY_TESTS = 'wellness_tests_data_v4';
const STORAGE_KEY_PACKAGES = 'wellness_packages_data_v4';
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

  // Fetch live tests, packages, bookings, and invoices from Supabase backend API on mount
  useEffect(() => {
    fetch('/api/tests')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setTests(data.data);
          try {
            localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch(() => {});

    fetch('/api/packages')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setPackages(data.data);
          try {
            localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch(() => {});

    // Live Bookings sync with automatic cross-device synchronization
    const syncBookings = () => {
      fetch('/api/bookings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data && Array.isArray(data.data)) {
            const serverBookings: Booking[] = data.data;
            setBookings((prev) => {
              const serverRefs = new Set(serverBookings.map((b) => b.booking_reference || b.id));
              // Detect any bookings that exist locally on this device (e.g. mobile) but not yet on server
              const localUnsynced = prev.filter((b) => !serverRefs.has(b.booking_reference) && !serverRefs.has(b.id));

              // If there are unsynced bookings, push them to the backend API so all devices see them!
              if (localUnsynced.length > 0) {
                localUnsynced.forEach((lb) => {
                  fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      patient_id: lb.patient_id || 'user_patient_1',
                      patient_name: lb.patient_name || 'Patient',
                      patient_phone: lb.patient_phone || '',
                      scheduled_date: lb.scheduled_date || new Date().toISOString().split('T')[0],
                      scheduled_slot: lb.scheduled_slot || '07:30 AM – 09:00 AM',
                      address_snapshot: {
                        recipient_name: lb.address_snapshot?.recipient_name || lb.patient_name || 'Patient',
                        phone: lb.address_snapshot?.phone || lb.patient_phone || '',
                        address_line_1: lb.address_snapshot?.address_line_1 || 'Collection Address',
                        city: lb.address_snapshot?.city || 'Davangere',
                        postal_code: lb.address_snapshot?.postal_code || '577005',
                        latitude: lb.address_snapshot?.latitude || 14.4644,
                        longitude: lb.address_snapshot?.longitude || 75.9218,
                      },
                      items: (lb.items && lb.items.length > 0)
                        ? lb.items.map((it) => ({
                            test_id: it.test_id || 'test_pkg',
                            item_name: it.item_name,
                            unit_price: Math.round(it.unit_price || it.line_total || 0),
                            quantity: it.quantity || 1,
                            line_total: Math.round(it.line_total || 0),
                          }))
                        : (lb.tests || []).map((t) => ({
                            test_id: t.id,
                            item_name: t.name,
                            unit_price: Math.round(t.price),
                            quantity: 1,
                            line_total: Math.round(t.price),
                          })),
                      subtotal: Math.round(lb.subtotal || lb.total_amount || 0),
                      collection_fee: Math.round(lb.collection_fee || 0),
                      tax_amount: 0,
                      total_amount: Math.round(lb.total_amount || 0),
                    }),
                  }).catch(() => {});
                });
              }

              const merged = [...serverBookings, ...localUnsynced];
              try {
                localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        })
        .catch(() => {});
    };

    syncBookings();

    // Auto-refresh when switching tabs and every 8 seconds so Desktop & Mobile are always in sync
    const interval = setInterval(syncBookings, 8000);
    const onFocus = () => syncBookings();
    window.addEventListener('focus', onFocus);

    // Sync Invoices
    fetch('/api/invoices')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setInvoices((prev) => {
            const serverInvs: Invoice[] = data.data;
            const serverNums = new Set(serverInvs.map((i) => i.invoice_number || i.id));
            const localOnly = prev.filter((i) => !serverNums.has(i.invoice_number) && !serverNums.has(i.id));
            const merged = [...serverInvs, ...localOnly];
            try {
              localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
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

    // Sync to Python FastAPI Backend & Supabase
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: newBooking.patient_id,
        patient_name: newBooking.patient_name,
        patient_phone: newBooking.patient_phone,
        scheduled_date: newBooking.scheduled_date,
        scheduled_slot: newBooking.scheduled_slot,
        address_snapshot: {
          recipient_name: newBooking.address_snapshot?.recipient_name || newBooking.patient_name,
          phone: newBooking.address_snapshot?.phone || newBooking.address_snapshot?.recipient_phone || newBooking.patient_phone,
          address_line_1: newBooking.address_snapshot?.address_line_1 || newBooking.address_snapshot?.street || 'Home Collection Address',
          city: newBooking.address_snapshot?.city || 'Gurugram',
          postal_code: newBooking.address_snapshot?.postal_code || '122018',
          latitude: newBooking.address_snapshot?.latitude || 28.4595,
          longitude: newBooking.address_snapshot?.longitude || 77.0266,
          landmark: newBooking.address_snapshot?.landmark,
          access_instructions: newBooking.address_snapshot?.access_instructions || newBooking.address_snapshot?.instructions,
        },
        items: (newBooking.items && newBooking.items.length > 0)
          ? newBooking.items.map((it) => ({
              test_id: it.test_id || 'test_default',
              item_name: it.item_name,
              unit_price: Math.round(it.unit_price || it.line_total || 0),
              quantity: it.quantity || 1,
              line_total: Math.round(it.line_total || 0),
            }))
          : (newBooking.tests || []).map((t) => ({
              test_id: t.id,
              item_name: t.name,
              unit_price: Math.round(t.price),
              quantity: 1,
              line_total: Math.round(t.price),
            })),
        subtotal: Math.round(newBooking.subtotal),
        collection_fee: Math.round(newBooking.collection_fee),
        tax_amount: 0,
        total_amount: Math.round(newBooking.total_amount),
      }),
    }).catch(() => {});

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
