# Database Schema & Konfigurasi - Smart Grocery & Price Tracker

Direktori ini berisi seluruh skrip database SQL dan panduan konfigurasi cloud database untuk aplikasi Smart Grocery.

## Berkas yang Tersedia
- `schema.sql`: Skrip DDL PostgreSQL / Supabase untuk membuat tabel, index, kebijakan RLS (Row Level Security), dan data awal (seed data).

## Tabel Utama (SRS F-04, F-05, F-06)

1. **`public.master_products`**
   - Menyimpan daftar harga acuan belanja bulan lalu untuk perbandingan inflasi dan deteksi kenaikan harga.
   - Kolom: `id`, `name`, `category`, `unit`, `last_price`, `created_at`, `updated_at`.

2. **`public.receipts`**
   - Menyimpan riwayat struk belanja yang telah dibayar di kasir sebagai arsip resmi dan pembanding bulan berikutnya.
   - Kolom: `id`, `date_label`, `budget_limit`, `grand_total`, `total_saved`, `item_count`, `items (JSONB)`, `created_at`.

3. **`public.user_settings`**
   - Menyimpan batas anggaran dompet bulanan pengguna (Budget Safety Cap) dan preferensi suara/notifikasi.
   - Kolom: `id`, `budget_limit`, `sound_enabled`, `updated_at`.

## Cara Menjalankan di Supabase
1. Buka dashboard proyek Supabase di [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Masuk ke menu **SQL Editor**.
3. Buat New Query, lalu salin isi file `database/schema.sql` ke dalamnya.
4. Tekan tombol **Run**. Seluruh tabel dan data acuan otomatis siap digunakan.
