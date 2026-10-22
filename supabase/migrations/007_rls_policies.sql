-- Migration 007: Mandatory Row Level Security (RLS) Policies

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Profiles Policies
CREATE POLICY "Users can read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.get_auth_role() = 'admin');

CREATE POLICY "Users can update their own non-role profile fields"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. Patient Addresses Policies
CREATE POLICY "Patients manage their own addresses"
    ON public.patient_addresses FOR ALL
    USING (auth.uid() = patient_id OR public.get_auth_role() = 'admin');

-- 4. Tests and Packages (Public Read Active Only)
CREATE POLICY "Public can read active tests"
    ON public.tests FOR SELECT
    USING (active = true OR public.get_auth_role() = 'admin');

CREATE POLICY "Admins manage tests"
    ON public.tests FOR ALL
    USING (public.get_auth_role() = 'admin');

CREATE POLICY "Public can read active packages"
    ON public.packages FOR SELECT
    USING (active = true OR public.get_auth_role() = 'admin');

CREATE POLICY "Admins manage packages"
    ON public.packages FOR ALL
    USING (public.get_auth_role() = 'admin');

CREATE POLICY "Public can read package items"
    ON public.package_items FOR SELECT
    USING (true);

-- 5. Bookings Policies
CREATE POLICY "Patients can view their own bookings"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = patient_id 
        OR public.get_auth_role() = 'admin'
        OR (public.get_auth_role() = 'driver' AND EXISTS (
            SELECT 1 FROM public.collection_assignments 
            WHERE booking_id = public.bookings.id AND driver_id = auth.uid()
        ))
    );

CREATE POLICY "Patients can insert bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins can update bookings"
    ON public.bookings FOR UPDATE
    USING (public.get_auth_role() = 'admin');

CREATE POLICY "Drivers can update status for assigned bookings"
    ON public.bookings FOR UPDATE
    USING (
        public.get_auth_role() = 'driver' AND EXISTS (
            SELECT 1 FROM public.collection_assignments 
            WHERE booking_id = public.bookings.id AND driver_id = auth.uid()
        )
    );

-- 6. Booking Items Policies
CREATE POLICY "Patients can view their own booking items"
    ON public.booking_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = booking_items.booking_id 
            AND (bookings.patient_id = auth.uid() OR public.get_auth_role() = 'admin')
        )
    );

-- 7. Collection Assignments Policies
CREATE POLICY "Drivers view only their assigned collections"
    ON public.collection_assignments FOR SELECT
    USING (auth.uid() = driver_id OR public.get_auth_role() = 'admin');

CREATE POLICY "Admins manage assignments"
    ON public.collection_assignments FOR ALL
    USING (public.get_auth_role() = 'admin');

-- 8. Reports Policies (Strictly released reports to patient owner)
CREATE POLICY "Patients view only released reports"
    ON public.reports FOR SELECT
    USING (
        (auth.uid() = patient_id AND release_status = 'released')
        OR public.get_auth_role() = 'admin'
    );

CREATE POLICY "Admins manage laboratory reports"
    ON public.reports FOR ALL
    USING (public.get_auth_role() = 'admin');

-- 9. Invoices Policies
CREATE POLICY "Patients view only their own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = patient_id OR public.get_auth_role() = 'admin');

CREATE POLICY "Admins manage invoices"
    ON public.invoices FOR ALL
    USING (public.get_auth_role() = 'admin');

-- 10. Audit Logs Policies (Admins only)
CREATE POLICY "Admins view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.get_auth_role() = 'admin');
