-- ==========================================================================
-- SMART GROCERY PRO - SUPABASE DATABASE SCHEMA
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================================================

-- 1. TABEL MASTER HARGA ACUAN PRODUK (F-06 & F-04)
CREATE TABLE IF NOT EXISTS public.master_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Bahan Pokok',
    unit TEXT NOT NULL DEFAULT 'pcs',
    last_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL STRUK RIWAYAT BELANJA (F-06)
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    date_label TEXT NOT NULL,
    budget_limit NUMERIC NOT NULL DEFAULT 350000,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    total_saved NUMERIC NOT NULL DEFAULT 0,
    item_count INTEGER NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL PENGATURAN ANGGARAN USER (F-05)
CREATE TABLE IF NOT EXISTS public.user_settings (
    id TEXT PRIMARY KEY DEFAULT 'rian_default_user',
    budget_limit NUMERIC NOT NULL DEFAULT 350000,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ==========================================================================
ALTER TABLE public.master_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Allow Anon/Public Read & Write for Demo/Personal App
CREATE POLICY "Allow public all access on master_products" 
ON public.master_products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all access on receipts" 
ON public.receipts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all access on user_settings" 
ON public.user_settings FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================================
-- DATA AWAL CONTOH KEBUTUHAN BELANJA RIAN (SEED DATA)
-- ==========================================================================
INSERT INTO public.master_products (name, category, unit, last_price)
VALUES
    ('Beras Ramos 5kg', 'Bahan Pokok', 'pack', 72000),
    ('Minyak Goreng Sania 2L', 'Bahan Pokok', 'pouch', 36000),
    ('Telur Ayam Negeri 1kg', 'Bahan Pokok', 'kg', 28000),
    ('Sabun Cuci Deterjen 800g', 'Kebersihan', 'pack', 19500),
    ('Pasta Gigi Herbal 190g', 'Kebersihan', 'pcs', 14000),
    ('Sabun Pembersih Lantai 750ml', 'Kebersihan', 'botol', 16000),
    ('Mie Instan Goreng Spesial', 'Makanan & Minuman', 'pcs', 3100),
    ('Kecap Manis Refill 520ml', 'Dapur & Bumbu', 'pouch', 17500),
    ('Biskuit Cokelat Kaleng', 'Makanan & Minuman', 'kaleng', 32000)
ON CONFLICT (name) DO UPDATE 
SET last_price = EXCLUDED.last_price,
    category = EXCLUDED.category,
    unit = EXCLUDED.unit;

INSERT INTO public.user_settings (id, budget_limit, sound_enabled)
VALUES ('rian_default_user', 350000, true)
ON CONFLICT (id) DO NOTHING;
