-- Migration: 20261026000001_initial_schema.sql
-- Description: Core 12 Tables for 4-Sided Event Ecosystem (EO, Vendor, Crew, Tenant) & Escrow Ledger
-- Reference: SRS_Arsitektur_Teknis_Ekosistem_Event.pdf & Proposal_Konsep_Produk_Ekosistem_Event.pdf

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_wa VARCHAR(50),
    password_hash TEXT,
    kyc_status VARCHAR(20) DEFAULT 'UNVERIFIED' CHECK (kyc_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER PROFILES / ROLES (Multi-Role Support: EO, VENDOR, CREW, TENANT)
CREATE TABLE IF NOT EXISTS public.user_profiles_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('EO', 'VENDOR', 'CREW', 'TENANT')),
    business_name VARCHAR(255),
    city_region VARCHAR(100),
    rating_avg NUMERIC(3,2) DEFAULT 0.00,
    bank_account JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_role UNIQUE (user_id, role_type)
);

-- 3. EVENTS (Project Hub)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('CONCERT', 'PENSI', 'EXPO', 'BAZAAR')),
    venue_name VARCHAR(255) NOT NULL,
    gps_lat_lng VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget NUMERIC(15,2) DEFAULT 0.00,
    venue_map_url TEXT,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. WALLETS (Real-time Escrow & Available Balance)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    escrow_locked NUMERIC(15,2) DEFAULT 0.00 CHECK (escrow_locked >= 0),
    available_bal NUMERIC(15,2) DEFAULT 0.00 CHECK (available_bal >= 0),
    currency CHAR(3) DEFAULT 'IDR',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. VENDOR PACKAGES (Equipment & Production Catalog)
CREATE TABLE IF NOT EXISTS public.vendor_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    package_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('SOUND', 'STAGE', 'LIGHTING', 'TENT')),
    base_price NUMERIC(15,2) NOT NULL CHECK (base_price >= 0),
    tech_specs JSONB DEFAULT '{}'::jsonb,
    daily_quota INT NOT NULL DEFAULT 1 CHECK (daily_quota >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- GIN Index for rapid tech_specs JSONB filtering (< 50ms requirement)
CREATE INDEX IF NOT EXISTS idx_vendor_packages_tech_specs ON public.vendor_packages USING gin (tech_specs);

-- 6. VENDOR BOOKINGS (Contracts, Quota Locking, & SPK)
CREATE TABLE IF NOT EXISTS public.vendor_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.vendor_packages(id) ON DELETE RESTRICT,
    booked_date DATE NOT NULL,
    agreed_price NUMERIC(15,2) NOT NULL CHECK (agreed_price >= 0),
    dp_pct NUMERIC(5,2) DEFAULT 50.00 CHECK (dp_pct >= 0 AND dp_pct <= 100),
    spk_document TEXT,
    booking_status VARCHAR(30) DEFAULT 'REQUESTED' CHECK (
        booking_status IN ('REQUESTED', 'QUOTED', 'ESCROW_PAID', 'DP_RELEASED', 'BAST_SUBMITTED', 'SETTLED', 'DISPUTED', 'CANCELLED')
    ),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CREW SHIFTS (Daily Crew Job Vacancies)
CREATE TABLE IF NOT EXISTS public.crew_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    role_title VARCHAR(50) NOT NULL CHECK (role_title IN ('LO', 'USHER', 'STAGEHAND')),
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    headcount_req INT NOT NULL DEFAULT 1 CHECK (headcount_req > 0),
    rate_per_shift NUMERIC(15,2) NOT NULL CHECK (rate_per_shift >= 0),
    qr_checkin_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CREW APPLICATIONS & ATTENDANCE (Anti-Bentrok & Payout Tracking)
CREATE TABLE IF NOT EXISTS public.crew_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES public.crew_shifts(id) ON DELETE CASCADE,
    crew_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    selection_status VARCHAR(20) DEFAULT 'APPLIED' CHECK (selection_status IN ('APPLIED', 'HIRED', 'REJECTED')),
    checkin_time TIMESTAMPTZ,
    checkout_time TIMESTAMPTZ,
    payout_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payout_status IN ('PENDING', 'ESCROW_LOCKED', 'PAID', 'DISPUTED')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Anti-Bentrok Composite Unique Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_crew_shift ON public.crew_applications (shift_id, crew_user_id);

-- 9. TENANT BOOTHS (Floorplan Lots & Allocation)
CREATE TABLE IF NOT EXISTS public.tenant_booths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    booth_code VARCHAR(50) NOT NULL,
    booth_category VARCHAR(50) NOT NULL CHECK (booth_category IN ('FNB', 'FASHION', 'SPONSOR')),
    size_dimension VARCHAR(50),
    rental_price NUMERIC(15,2) NOT NULL CHECK (rental_price >= 0),
    is_occupied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Anti Double-Booking Unique Index for Booths
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_booth_event ON public.tenant_booths (event_id, booth_code);

-- 10. TENANT REGISTRATIONS (Curation & Invoicing)
CREATE TABLE IF NOT EXISTS public.tenant_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booth_id UUID NOT NULL REFERENCES public.tenant_booths(id) ON DELETE CASCADE,
    tenant_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    product_photos JSONB DEFAULT '[]'::jsonb,
    curation_status VARCHAR(20) DEFAULT 'PENDING' CHECK (curation_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    invoice_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. ESCROW TRANSACTIONS (Master Escrow Financial Ledger)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    payer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    payee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    ref_type VARCHAR(30) NOT NULL CHECK (ref_type IN ('VENDOR_ORDER', 'CREW_PAYROLL', 'TENANT_BOOTH')),
    ref_id UUID,
    gross_amount NUMERIC(15,2) NOT NULL CHECK (gross_amount >= 0),
    platform_fee NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (platform_fee >= 0),
    escrow_state VARCHAR(30) DEFAULT 'INITIATED' CHECK (
        escrow_state IN ('INITIATED', 'ESCROW_HELD', 'PARTIALLY_RELEASED', 'SETTLED', 'DISPUTED', 'REFUNDED')
    ),
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ESCROW DISBURSEMENTS (Milestone & Step-by-Step Release Logs)
CREATE TABLE IF NOT EXISTS public.escrow_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_tx_id UUID NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
    milestone_stage VARCHAR(30) NOT NULL CHECK (milestone_stage IN ('DP_RELEASE', 'FINAL_SETTLEMENT', 'REFUND')),
    release_amount NUMERIC(15,2) NOT NULL CHECK (release_amount >= 0),
    bast_proof_url TEXT,
    pg_reference_id VARCHAR(255),
    released_at TIMESTAMPTZ DEFAULT now()
);

-- Automatic Wallet Initialization Trigger when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, escrow_locked, available_bal, currency)
    VALUES (NEW.id, 0.00, 0.00, 'IDR')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_wallet ON public.users;
CREATE TRIGGER on_user_created_wallet
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
