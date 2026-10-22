-- Migration 003: Tests and Packages Catalog
CREATE TABLE IF NOT EXISTS public.tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    preparation_instructions TEXT,
    turnaround_description TEXT NOT NULL,
    sample_type TEXT DEFAULT 'Blood (EDTA & Serum)' NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.package_items (
    package_id TEXT NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, test_id)
);
