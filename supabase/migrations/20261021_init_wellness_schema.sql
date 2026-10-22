-- ==============================================================================
-- WELLNESS DIAGNOSTIC — DATABASE SCHEMA & ROW LEVEL SECURITY POLICIES
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'admin', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'pending', 
        'confirmed', 
        'assigned', 
        'collection_scheduled', 
        'sample_collected', 
        'processing_in_lab', 
        'report_ready', 
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    badge_id TEXT,
    designation TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Patient Details Table
CREATE TABLE IF NOT EXISTS public.patient_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group TEXT,
    emergency_contact TEXT,
    medical_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Patient Addresses Table (With latitude and longitude numeric coordinates)
CREATE TABLE IF NOT EXISTS public.patient_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home' NOT NULL, -- 'Home', 'Work', 'Other'
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    landmark TEXT,
    locality TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    access_instructions TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tests and Health Packages Catalog
CREATE TABLE IF NOT EXISTS public.tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    fasting_required BOOLEAN DEFAULT false,
    fasting_hours INTEGER DEFAULT 0,
    tat TEXT NOT NULL, -- Turnaround Time e.g. "12 Hours"
    description TEXT NOT NULL,
    parameters_count INTEGER DEFAULT 1,
    parameters_list JSONB DEFAULT '[]'::jsonb,
    sample_type TEXT DEFAULT 'Blood (EDTA & Serum)' NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    icon_name TEXT DEFAULT 'heart',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Bookings Table (Stores immutable address snapshot including exact latitude and longitude)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    collection_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status booking_status DEFAULT 'pending' NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'cash_on_collection')) DEFAULT 'pending' NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('card', 'upi', 'cash')) DEFAULT 'card' NOT NULL,
    
    -- Immutable address snapshot with confirmed GPS coordinates
    address_snapshot JSONB NOT NULL,
    confirmed_latitude NUMERIC(10, 7),
    confirmed_longitude NUMERIC(10, 7),
    
    assigned_driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sample_details JSONB,
    report_id UUID,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Booking Items (Mapping orders to specific tests/packages)
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL REFERENCES public.tests(id),
    price_charged NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Collection Assignments & Logs
CREATE TABLE IF NOT EXISTS public.collection_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Collection Events (Audit trail for sample lifecycle)
CREATE TABLE IF NOT EXISTS public.collection_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    event_status booking_status NOT NULL,
    barcode TEXT,
    tube_count INTEGER,
    temperature_normal BOOLEAN,
    phlebotomist_notes TEXT,
    recorded_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Diagnostic Lab Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number TEXT UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT, -- Storage path inside private 'reports' bucket
    status TEXT CHECK (status IN ('ready', 'pending', 'draft')) DEFAULT 'ready' NOT NULL,
    results JSONB NOT NULL,
    overall_remarks TEXT,
    doctor_name TEXT NOT NULL,
    lab_technician TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'paid' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions to check role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.get_user_role() = 'admin');

-- 2. Patient Addresses Policies
CREATE POLICY "Patients can view and edit their own addresses"
    ON public.patient_addresses FOR ALL
    USING (auth.uid() = patient_id);

CREATE POLICY "Admins can view all patient addresses"
    ON public.patient_addresses FOR SELECT
    USING (public.get_user_role() = 'admin');

-- 3. Tests Catalog Policies
CREATE POLICY "Public read access to active tests"
    ON public.tests FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins have full manage access to tests"
    ON public.tests FOR ALL
    USING (public.get_user_role() = 'admin');

-- 4. Bookings Policies
CREATE POLICY "Patients can view their own bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Drivers can view bookings assigned to them"
    ON public.bookings FOR SELECT
    USING (auth.uid() = assigned_driver_id);

CREATE POLICY "Drivers can update status of their assigned bookings"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = assigned_driver_id)
    WITH CHECK (auth.uid() = assigned_driver_id);

CREATE POLICY "Admins have full access to bookings"
    ON public.bookings FOR ALL
    USING (public.get_user_role() = 'admin');

-- 5. Reports Policies (Strict Privacy)
CREATE POLICY "Patients can view their own published reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = patient_id AND status = 'ready');

CREATE POLICY "Admins have full access to reports"
    ON public.reports FOR ALL
    USING (public.get_user_role() = 'admin');

-- 6. Invoices Policies
CREATE POLICY "Patients can view their own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Admins have full access to invoices"
    ON public.invoices FOR ALL
    USING (public.get_user_role() = 'admin');

-- Storage Bucket Setup for Private Reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Patients can download their own report files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'reports' 
    AND (
        auth.uid()::text = (storage.foldername(name))[1] 
        OR public.get_user_role() = 'admin'
    )
);

CREATE POLICY "Only admins can upload report files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'reports' 
    AND public.get_user_role() = 'admin'
);
