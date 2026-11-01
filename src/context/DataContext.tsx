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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleSelectTest: (test: DiagnosticTest) => void;
  addSelectedTest: (test: DiagnosticTest) => void;
  removeSelectedTest: (testId: string) => void;
  clearSelectedTests: () => void;
  isTestSelected: (testId: string) => boolean;
  createBooking: (bookingData: Omit<Booking, 'id' | 'booking_reference' | 'created_at' | 'updated_at' | 'status'>) => Booking;
  assignDriverToBooking: (bookingId: string, driverId: string) => void;
  addDriver: (driverData: {
    name: string;
    phone: string;
    email?: string;
    badge_id?: string;
    vehicle_details?: string;
    designation?: string;
  }) => Promise<{ success: boolean; data?: DriverProfile; error?: string }>;
  updateDriver: (driverId: string, data: Partial<DriverProfile>) => Promise<{ success: boolean; data?: DriverProfile; error?: string }>;
  deleteDriver: (driverId: string) => Promise<{ success: boolean; error?: string }>;
  syncDrivers: () => void;
  syncBookings: () => void;
  syncTests: () => void;
  syncPackages: () => void;
  syncReports: () => void;
  syncInvoices: () => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus, sampleDetails?: Booking['sample_details']) => void;
  addReportForBooking: (orderId: string, results: LabReportResultItem[], overallRemarks: string) => LabReport;
  addTestPackage: (test: Omit<DiagnosticTest, 'id'>) => Promise<DiagnosticTest | null> | void;
  updateTestPackage: (id: string, test: Partial<DiagnosticTest>) => Promise<DiagnosticTest | null> | void;
  deleteTestPackage: (id: string) => Promise<boolean> | void;
  resetAllDataToDefault: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_TESTS = 'wellness_tests_data_v9';
const STORAGE_KEY_PACKAGES = 'wellness_packages_data_v9';
const STORAGE_KEY_BOOKINGS = 'wellness_bookings_data_v5';
const STORAGE_KEY_REPORTS = 'wellness_reports_data_v5';
const STORAGE_KEY_INVOICES = 'wellness_invoices_data_v5';
const STORAGE_KEY_DRIVERS = 'wellness_drivers_data_v5';
const STORAGE_KEY_CART = 'wellness_cart_tests_v5';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [packages, setPackages] = useState<DiagnosticPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [selectedTests, setSelectedTests] = useState<DiagnosticTest[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Clear obsolete cached test catalog versions on client start
  useEffect(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k && 
          (k.startsWith('wellness_tests_data') || k.startsWith('wellness_packages_data')) && 
          k !== STORAGE_KEY_TESTS && 
          k !== STORAGE_KEY_PACKAGES
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }, []);

  // Fetch live tests, packages, bookings, and invoices from Supabase backend API on mount
  useEffect(() => {
    // Sync live tests from Supabase PostgreSQL database
    const syncTests = () => {
      fetch(`/api/tests?all=true&_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            // Deduplicate tests by unique normalized name so there are never double entries
            const uniqueTests: DiagnosticTest[] = [];
            const seen = new Set<string>();
            for (const item of data.data) {
              const key = (item.name || '').toLowerCase().trim();
              if (!seen.has(key)) {
                seen.add(key);
                uniqueTests.push(item);
              }
            }
            setTests(uniqueTests);
            try {
              localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(uniqueTests));
            } catch {}
          }
        })
        .catch(() => {});
    };

    // Sync live packages from Supabase
    const syncPackages = () => {
      fetch(`/api/packages?_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            const uniquePkgs: DiagnosticPackage[] = [];
            const seenPkgs = new Set<string>();
            for (const pkg of data.data) {
              const key = (pkg.name || '').toLowerCase().trim();
              if (!seenPkgs.has(key)) {
                seenPkgs.add(key);
                uniquePkgs.push(pkg);
              }
            }
            setPackages(uniquePkgs);
            try {
              localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(uniquePkgs));
            } catch {}
          }
        })
        .catch(() => {});
    };

    // Initial fetch on mount
    syncTests();
    syncPackages();

    // Live Bookings sync with automatic cross-device synchronization (Read-only polling)
    const syncBookingsInternal = () => {
      fetch(`/api/bookings?_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data && Array.isArray(data.data)) {
            setBookings(data.data);
            try {
              localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(data.data));
            } catch {}
          }
        })
        .catch(() => {});
    };

    syncBookingsInternal();

    // Sync Invoices (Read-only polling)
    const syncInvoices = () => {
      fetch(`/api/invoices?_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            setInvoices(data.data);
            try {
              localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(data.data));
            } catch {}
          }
        })
        .catch(() => {});
    };

    syncInvoices();
    const invInterval = setInterval(syncInvoices, 12000);

    // Sync Reports from Supabase & Cloudflare R2 (Read-only polling)
    const syncReports = () => {
      fetch(`/api/reports?_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            setReports(data.data);
            try {
              localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(data.data));
            } catch {}
          }
        })
        .catch(() => {});
    };

    syncReports();
    const repInterval = setInterval(syncReports, 12000);

    // Sync Phlebotomist Drivers from Supabase (Read-only polling)
    const syncDriversInternal = () => {
      fetch(`/api/admin/drivers?_t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.data) && data.data.length > 0) {
            setDrivers(data.data);
            try {
              localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(data.data));
            } catch {}
          }
        })
        .catch(() => {});
    };

    syncDriversInternal();
    const drvInterval = setInterval(syncDriversInternal, 10000);

    // Auto-refresh when switching tabs and every 10-15 seconds so Desktop & Mobile are always in sync
    const interval = setInterval(syncBookingsInternal, 10000);
    const testInterval = setInterval(syncTests, 15000);
    const onFocus = () => {
      syncTests();
      syncPackages();
      syncBookingsInternal();
      syncInvoices();
      syncReports();
      syncDriversInternal();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      clearInterval(testInterval);
      clearInterval(invInterval);
      clearInterval(repInterval);
      clearInterval(drvInterval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    try {
      const storedTests = localStorage.getItem(STORAGE_KEY_TESTS);
      if (storedTests) setTests((prev) => (prev.length === 0 ? JSON.parse(storedTests) : prev));

      const storedPackages = localStorage.getItem(STORAGE_KEY_PACKAGES);
      if (storedPackages) setPackages((prev) => (prev.length === 0 ? JSON.parse(storedPackages) : prev));

      const storedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (storedBookings) setBookings((prev) => (prev.length === 0 ? JSON.parse(storedBookings) : prev));

      const storedReports = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (storedReports) setReports((prev) => (prev.length === 0 ? JSON.parse(storedReports) : prev));

      const storedInvoices = localStorage.getItem(STORAGE_KEY_INVOICES);
      if (storedInvoices) setInvoices((prev) => (prev.length === 0 ? JSON.parse(storedInvoices) : prev));

      const storedDrivers = localStorage.getItem(STORAGE_KEY_DRIVERS);
      if (storedDrivers) setDrivers((prev) => (prev.length === 0 ? JSON.parse(storedDrivers) : prev));

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
      const exists = prev.some((t) => t.id === test.id || (t.name && t.name.toLowerCase().trim() === test.name.toLowerCase().trim()));
      if (exists) {
        return prev.filter((t) => t.id !== test.id && t.name.toLowerCase().trim() !== test.name.toLowerCase().trim());
      } else {
        return [...prev, test];
      }
    });
  };

  const addSelectedTest = (test: DiagnosticTest) => {
    setSelectedTests((prev) => {
      // If already present by id or name, replace with latest without duplicating
      const filtered = prev.filter((t) => t.id !== test.id && t.name.toLowerCase().trim() !== test.name.toLowerCase().trim());
      return [...filtered, test];
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
          city: newBooking.address_snapshot?.city || 'Davangere',
          postal_code: newBooking.address_snapshot?.postal_code || '577005',
          latitude: newBooking.address_snapshot?.latitude || 14.4644,
          longitude: newBooking.address_snapshot?.longitude || 75.9218,
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
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.data) {
          setBookings((prev) => {
            const updated = prev.map((b) =>
              b.id === newBooking.id
                ? { ...b, id: resData.data.id, booking_reference: resData.data.booking_reference || b.booking_reference }
                : b
            );
            try {
              localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      })
      .catch(() => {});

    clearSelectedTests();
    return newBooking;
  };

  const syncBookings = () => {
    fetch(`/api/bookings?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setBookings(data.data);
          try {
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch(() => {});
  };

  const syncTests = () => {
    fetch(`/api/tests?all=true&_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const uniqueTests: DiagnosticTest[] = [];
          const seen = new Set<string>();
          for (const item of data.data) {
            const key = (item.name || '').toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              uniqueTests.push(item);
            }
          }
          setTests(uniqueTests);
          try {
            localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(uniqueTests));
          } catch {}
        }
      })
      .catch(() => {});
  };

  const syncPackages = () => {
    fetch(`/api/packages?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const uniquePkgs: DiagnosticPackage[] = [];
          const seenPkgs = new Set<string>();
          for (const pkg of data.data) {
            const key = (pkg.name || '').toLowerCase().trim();
            if (!seenPkgs.has(key)) {
              seenPkgs.add(key);
              uniquePkgs.push(pkg);
            }
          }
          setPackages(uniquePkgs);
          try {
            localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(uniquePkgs));
          } catch {}
        }
      })
      .catch(() => {});
  };

  const syncReports = () => {
    fetch(`/api/reports?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setReports(data.data);
          try {
            localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch(() => {});
  };

  const syncInvoices = () => {
    fetch(`/api/invoices?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setInvoices(data.data);
          try {
            localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch(() => {});
  };

  const syncDrivers = () => {
    fetch(`/api/admin/drivers?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          setDrivers(data.data);
          try {
            localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch(() => {});
  };

  const addDriver = async (driverData: {
    name: string;
    phone: string;
    email?: string;
    badge_id?: string;
    vehicle_details?: string;
    designation?: string;
  }): Promise<{ success: boolean; data?: DriverProfile; error?: string }> => {
    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });
      if (res.ok) {
        const json = await res.json();
        const created: DriverProfile = json.data;
        setDrivers((prev) => {
          const updated = [created, ...prev.filter((d) => d.id !== created.id)];
          try {
            localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
          } catch {}
          return updated;
        });
        syncDrivers();
        return { success: true, data: created };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.detail || 'Failed to register driver' };
      }
    } catch {
      const fallbackId = `drv_${Date.now()}`;
      const newDriver: DriverProfile = {
        id: fallbackId,
        name: driverData.name,
        phone: driverData.phone,
        email: driverData.email || '',
        badge_id: driverData.badge_id || `WD-PHLEB-${Math.floor(100 + Math.random() * 900)}`,
        assigned_orders_count: 0,
        is_active: true,
        vehicle_details: driverData.vehicle_details || 'Davangere Cold-Chain Van',
      };
      setDrivers((prev) => {
        const updated = [newDriver, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return { success: true, data: newDriver };
    }
  };

  const updateDriver = async (
    driverId: string, 
    updatedFields: Partial<DriverProfile>
  ): Promise<{ success: boolean; data?: DriverProfile; error?: string }> => {
    setDrivers((prev) => {
      const updated = prev.map((d) => (d.id === driverId || d.badge_id === driverId ? { ...d, ...updatedFields } : d));
      try {
        localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const res = await fetch(`/api/admin/drivers/${encodeURIComponent(driverId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const json = await res.json();
        syncDrivers();
        return { success: true, data: json.data };
      }
      return { success: false, error: 'Failed to update driver' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteDriver = async (driverId: string): Promise<{ success: boolean; error?: string }> => {
    setDrivers((prev) => {
      const updated = prev.filter((d) => d.id !== driverId && d.badge_id !== driverId);
      try {
        localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const res = await fetch(`/api/admin/drivers/${encodeURIComponent(driverId)}`, {
        method: 'DELETE',
      });
      syncDrivers();
      return { success: res.ok };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const assignDriverToBooking = (bookingId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          driver_id: driver.id,
          assigned_driver_id: driver.id,
          driver_name: driver.name,
          assigned_driver_name: driver.name,
          driver_phone: driver.phone,
          status: 'Assigned' as BookingStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));

    // Persist assignment to FastAPI backend & Supabase
    fetch('/api/admin/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        driver_id: driver.id,
        driver_name: driver.name,
        driver_phone: driver.phone,
      }),
    }).catch(() => {});
  };

  const updateBookingStatus = (
    bookingId: string,
    status: BookingStatus,
    sampleDetails?: Booking['sample_details']
  ) => {
    const cleanId = String(bookingId).replace(/^#/, '').trim();
    const updatedBookings = bookings.map((b) => {
      if (
        b.id === bookingId || 
        b.booking_reference === bookingId || 
        b.id === cleanId || 
        b.booking_reference === cleanId ||
        `#${b.booking_reference}` === bookingId
      ) {
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
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
    } catch {}

    // Persist status change to FastAPI backend & Supabase PostgreSQL
    const payload = {
      status,
      sample_details: sampleDetails,
    };

    fetch(`/api/admin/orders/${encodeURIComponent(cleanId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return fetch(`/api/bookings/${encodeURIComponent(cleanId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
      })
      .then(() => {
        // Synchronize driver active counts and live bookings
        syncDrivers();
      })
      .catch((err) => {
        console.error('Failed to update booking status in database:', err);
      });
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
      doctor_name: 'Chief Pathologist, MD',
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

    // Persist to Python FastAPI backend & Supabase
    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: booking.id,
        patient_id: booking.patient_id,
        report_number,
        results,
        overall_remarks: overallRemarks,
        doctor_name: newReport.doctor_name,
        lab_technician: newReport.lab_technician
      })
    }).catch(() => {});

    return newReport;
  };

  const addTestPackage = async (test: Omit<DiagnosticTest, 'id'>): Promise<DiagnosticTest | null> => {
    const tempId = `pkg_${Date.now()}`;
    const newTest: DiagnosticTest = {
      ...test,
      id: tempId,
    };
    const updated = [...tests, newTest];
    setTests(updated);
    try {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
    } catch {}

    // Persist directly to FastAPI backend & Supabase database
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTests((prev) => prev.map((t) => (t.id === tempId ? json.data : t)));
          return json.data;
        }
      }
    } catch (err) {
      console.error('Failed to create test in database:', err);
    }
    return newTest;
  };

  const updateTestPackage = async (id: string, updatedFields: Partial<DiagnosticTest>): Promise<DiagnosticTest | null> => {
    // 1. Optimistic update in UI
    const updated = tests.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTests(updated);
    try {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
    } catch {}

    // 2. Persist directly to FastAPI backend & Supabase database
    try {
      const res = await fetch(`/api/tests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // Sync canonical record returned from database
          setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...json.data } : t)));
          return json.data;
        }
      } else {
        console.error('Failed to update test in database:', await res.text());
      }
    } catch (err) {
      console.error('Failed to persist test update to database:', err);
    }
    return null;
  };

  const deleteTestPackage = async (id: string): Promise<boolean> => {
    // 1. Optimistic remove
    const updated = tests.filter((t) => t.id !== id);
    setTests(updated);
    try {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(updated));
    } catch {}

    // 2. Persist deletion to FastAPI backend & Supabase database
    try {
      const res = await fetch(`/api/tests/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete test from database:', err);
      return false;
    }
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
        isCartOpen,
        setIsCartOpen,
        toggleSelectTest,
        addSelectedTest,
        removeSelectedTest,
        clearSelectedTests,
        isTestSelected,
        createBooking,
        assignDriverToBooking,
        addDriver,
        updateDriver,
        deleteDriver,
        syncDrivers,
        syncBookings,
        syncTests,
        syncPackages,
        syncReports,
        syncInvoices,
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
