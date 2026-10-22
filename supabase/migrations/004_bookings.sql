-- Migration 004: Bookings and Booking Items
DO $$ BEGIN
    CREATE TYPE booking_status_type AS ENUM (
        'Pending', 
        'Confirmed', 
        'Assigned', 
        'Collection Scheduled', 
        'Sample Collected', 
        'Processing', 
        'Report Ready', 
        'Cancelled',
        'Failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    status booking_status_type NOT NULL DEFAULT 'Pending',
    scheduled_date DATE NOT NULL,
    scheduled_slot TEXT NOT NULL,
    address_id UUID REFERENCES public.patient_addresses(id) ON DELETE SET NULL,
    address_snapshot JSONB NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    collection_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'Unpaid' NOT NULL,
    patient_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    test_id TEXT REFERENCES public.tests(id) ON DELETE SET NULL,
    item_name_snapshot TEXT NOT NULL,
    unit_price_snapshot NUMERIC(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_patient ON public.bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(scheduled_date);
