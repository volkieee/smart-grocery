#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
SMART GROCERY & PRICE TRACKER - PYTHON SCANNER ENGINE
ICT Codehub SMA Mutiara Bangsa 2 • Modul Pertemuan 15 (Academic Year 2026/2027)
Siswa: Rian (Kasus Belanja Bulanan Anak Rantau)
=============================================================================
Fitur Wajib Sesuai SRS:
- F-01: Pencatatan Item Belanja Lengkap (Nama, Kategori, Satuan, Qty, Harga)
- F-02: Perhitungan Kuantitas Otomatis
- F-03: Kalkulator Diskon Bertingkat (Contoh: Promo 50% + 20%)
- F-04: Komparator Harga Realtime vs Bulan Lalu (↑ Naik, ↓ Turun, = Stabil)
- F-05: Pengendali Anggaran (Budget Safety Cap)
- F-06: Riwayat & Database Acuan Belanja
=============================================================================
"""

import sys
import json
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# ---------------------------------------------------------------------------
# KATALOG BARCODE PRODUK SUPERMARKET (EAN-13)
# ---------------------------------------------------------------------------
BARCODE_CATALOG = {
    "8991002105432": {
        "barcode": "8991002105432",
        "name": "Minyak Goreng Sania Pouch",
        "brand": "Sania Royale",
        "category": "Bahan Pokok",
        "unit": "liter",
        "unitSize": "2 Liter",
        "price": 38500.0,
        "lastMonthPrice": 34000.0,
        "defaultDiscounts": "15+5"
    },
    "8992753311201": {
        "barcode": "8992753311201",
        "name": "Beras Ramos Super 5kg",
        "brand": "Topi Koki",
        "category": "Bahan Pokok",
        "unit": "kg",
        "unitSize": "5 Kg",
        "price": 74500.0,
        "lastMonthPrice": 69000.0,
        "defaultDiscounts": "0"
    },
    "8998866200192": {
        "barcode": "8998866200192",
        "name": "Telur Ayam Negeri Pack",
        "brand": "Superindo Fresh",
        "category": "Bahan Pokok",
        "unit": "kg",
        "unitSize": "1 Kg (16 Butir)",
        "price": 28500.0,
        "lastMonthPrice": 31000.0,
        "defaultDiscounts": "10"
    },
    "8993189201018": {
        "barcode": "8993189201018",
        "name": "Sabun Mandi Cair Biore Guard",
        "brand": "Biore KAO",
        "category": "Kebersihan",
        "unit": "pouch",
        "unitSize": "450 ml",
        "price": 26900.0,
        "lastMonthPrice": 26900.0,
        "defaultDiscounts": "50+20"
    },
    "8991001100223": {
        "barcode": "8991001100223",
        "name": "Indomie Goreng Spesial (Dus)",
        "brand": "Indofood",
        "category": "Makanan & Minuman",
        "unit": "dus",
        "unitSize": "40 bungkus",
        "price": 118000.0,
        "lastMonthPrice": 115000.0,
        "defaultDiscounts": "5"
    },
    "8999999001234": {
        "barcode": "8999999001234",
        "name": "Deterjen Rinso Molto Cair",
        "brand": "Unilever",
        "category": "Kebersihan",
        "unit": "pouch",
        "unitSize": "750 ml",
        "price": 22500.0,
        "lastMonthPrice": 24500.0,
        "defaultDiscounts": "20"
    },
    "8992388102911": {
        "barcode": "8992388102911",
        "name": "Kecap Manis Bango Pouch",
        "brand": "Bango Unilever",
        "category": "Dapur & Bumbu",
        "unit": "pouch",
        "unitSize": "520 ml",
        "price": 24000.0,
        "lastMonthPrice": 22000.0,
        "defaultDiscounts": "0"
    },
    "8996001301124": {
        "barcode": "8996001301124",
        "name": "Pembersih Lantai Wipol Karbol",
        "brand": "Wipol",
        "category": "Kebersihan",
        "unit": "botol",
        "unitSize": "780 ml",
        "price": 19500.0,
        "lastMonthPrice": 19500.0,
        "defaultDiscounts": "50+20"
    }
}

# ---------------------------------------------------------------------------
# LOGIKA F-03: KALKULATOR DISKON BERTINGKAT (STACKED DISCOUNT FORMULA)
# ---------------------------------------------------------------------------
def calculate_discount(original_price: float, discount_expr: str):
    """
    Menghitung diskon tunggal (contoh: '25%') maupun bertumpuk (contoh: '50+20').
    Rumus: Harga Akhir = P * (1 - d1/100) * (1 - d2/100)...
    Contoh: Rp 100.000 dengan promo 50% + 20%
    Tahap 1: 100.000 * (1 - 0.50) = Rp 50.000
    Tahap 2: 50.000 * (1 - 0.20) = Rp 40.000 (Bukan diskon 70% = Rp 30.000)
    """
    if not discount_expr or original_price <= 0:
        return {
            "original_price": original_price,
            "final_price": original_price,
            "saved_amount": 0.0,
            "saved_pct": 0.0,
            "formula_text": "Tanpa diskon (Harga Normal)"
        }

    # Bersihkan string diskon (contoh: '50% + 20%' -> ['50', '20'])
    clean_str = str(discount_expr).replace("%", "").strip()
    parts = re.split(r"[\+\,\&]", clean_str)

    current_price = float(original_price)
    steps = []

    for part in parts:
        part = part.strip()
        if not part:
            continue
        try:
            val = float(part)
            if val > 0:
                cut = current_price * (val / 100.0)
                current_price -= cut
                steps.append(f"{val:g}%")
        except ValueError:
            pass

    final_price = max(0.0, round(current_price))
    saved_amount = original_price - final_price
    saved_pct = (saved_amount / original_price * 100.0) if original_price > 0 else 0.0

    formula_text = f"Potongan bertingkat: {' + '.join(steps)}" if steps else "Harga Normal"

    return {
        "original_price": original_price,
        "final_price": final_price,
        "saved_amount": saved_amount,
        "saved_pct": round(saved_pct, 1),
        "formula_text": formula_text
    }

# ---------------------------------------------------------------------------
# LOGIKA F-04: KOMPARATOR HARGA REALTIME VS BULAN LALU
# ---------------------------------------------------------------------------
def compare_price(current_price: float, last_month_price: float):
    """
    Membandingkan harga inputan rak dengan data acuan bulan lalu.
    Output:
    - Panah Merah Naik (↑): Jika harga naik
    - Panah Hijau Turun (↓): Jika harga turun
    - Tanda Setara (=): Jika harga stabil
    """
    if last_month_price <= 0:
        return {
            "status": "NEW",
            "arrow": "•",
            "delta": 0.0,
            "delta_pct": 0.0,
            "label": "Produk Baru",
            "css_class": "neutral"
        }

    diff = current_price - last_month_price
    diff_pct = (diff / last_month_price) * 100.0

    if diff > 0:
        return {
            "status": "UP",
            "arrow": "↑",
            "delta": diff,
            "delta_pct": round(diff_pct, 1),
            "label": f"Naik Rp {int(diff):,} (+{round(diff_pct, 1)}%)",
            "css_class": "up"
        }
    elif diff < 0:
        return {
            "status": "DOWN",
            "arrow": "↓",
            "delta": abs(diff),
            "delta_pct": round(abs(diff_pct), 1),
            "label": f"Turun Rp {int(abs(diff)):,} (-{round(abs(diff_pct), 1)}%)",
            "css_class": "down"
        }
    else:
        return {
            "status": "STABLE",
            "arrow": "=",
            "delta": 0.0,
            "delta_pct": 0.0,
            "label": "Harga Stabil (Sama)",
            "css_class": "stable"
        }

# ---------------------------------------------------------------------------
# LOGIKA F-05: PENGENDALI ANGGARAN (BUDGET SAFETY CAP)
# ---------------------------------------------------------------------------
def evaluate_budget_cap(current_spending: float, new_item_cost: float, budget_limit: float = 350000.0):
    """
    Menghitung pemakaian limit dompet secara realtime dan memberikan sinyal bahaya.
    """
    projected = current_spending + new_item_cost
    ratio = (projected / budget_limit) if budget_limit > 0 else 0.0
    remaining = budget_limit - projected

    if ratio >= 1.0:
        status = "DANGER"
        tag = "Over-Budget 🚨"
        desc = f"Melebihi limit dompet sebesar Rp {int(abs(remaining)):,}!"
    elif ratio >= 0.8:
        status = "WARNING"
        tag = "Waspada ⚠️"
        desc = f"Mendekati limit saku dompet ({round(ratio*100, 1)}% terpakai)."
    else:
        status = "SAFE"
        tag = "Aman ✅"
        desc = f"Sisa saku aman: Rp {int(remaining):,} ({round((1-ratio)*100, 1)}% cadangan)."

    return {
        "budget_limit": budget_limit,
        "projected_total": projected,
        "remaining": remaining,
        "ratio_pct": round(ratio * 100.0, 1),
        "status": status,
        "tag": tag,
        "description": desc
    }

# ---------------------------------------------------------------------------
# LOGIKA BANDINGKAN KEMASAN (UNIT ECONOMY: KEMASAN KECIL VS JERIGEN)
# ---------------------------------------------------------------------------
def compare_package_economy(size_a: float, price_a: float, size_b: float, price_b: float, unit_name: str = "Liter"):
    """
    Menyelesaikan dilema Rian: 1L @ 18.000 vs 5L @ 85.000
    """
    cost_per_unit_a = (price_a / size_a) if size_a > 0 else 0
    cost_per_unit_b = (price_b / size_b) if size_b > 0 else 0

    if cost_per_unit_a < cost_per_unit_b:
        cheaper = "A"
        diff = cost_per_unit_b - cost_per_unit_a
        pct = (diff / cost_per_unit_b) * 100
        verdict = f"Opsi A Lebih Hemat Rp {int(diff):,} / {unit_name} ({round(pct, 1)}% lebih murah)"
    elif cost_per_unit_b < cost_per_unit_a:
        cheaper = "B"
        diff = cost_per_unit_a - cost_per_unit_b
        pct = (diff / cost_per_unit_a) * 100
        verdict = f"Opsi B Lebih Hemat Rp {int(diff):,} / {unit_name} ({round(pct, 1)}% lebih murah)"
    else:
        cheaper = "EQUAL"
        diff = 0
        verdict = "Nilai ekonomis kedua opsi sama persis"

    return {
        "cost_per_unit_a": round(cost_per_unit_a),
        "cost_per_unit_b": round(cost_per_unit_b),
        "cheaper_option": cheaper,
        "savings_per_unit": round(diff),
        "verdict": verdict,
        "unit_name": unit_name
    }

# ---------------------------------------------------------------------------
# PIPELINE UTAMA SCANNER PYTHON
# ---------------------------------------------------------------------------
def analyze_scanned_barcode(barcode: str, discount_input: str = None, current_cart_spending: float = 0.0, budget_limit: float = 350000.0):
    """
    Menganalisis barcode inputan:
    1. Pencarian di katalog EAN-13
    2. Perhitungan diskon bertingkat (F-03)
    3. Komparasi harga bulan lalu (F-04)
    4. Evaluasi dampak saku dompet (F-05)
    """
    product = BARCODE_CATALOG.get(barcode)
    if not product:
        # Fallback jika barcode acak
        product = {
            "barcode": barcode,
            "name": f"Produk Rak Supermarket #{barcode[-4:] if len(barcode)>=4 else barcode}",
            "brand": "Supermarket Lokal",
            "category": "Bahan Pokok",
            "unit": "pcs",
            "unitSize": "1 Pcs",
            "price": 25000.0,
            "lastMonthPrice": 23000.0,
            "defaultDiscounts": "10"
        }

    shelf_price = product["price"]
    last_price = product["lastMonthPrice"]
    discount_expr = discount_input if discount_input is not None else product.get("defaultDiscounts", "0")

    # Hitung diskon F-03
    discount_res = calculate_discount(shelf_price, discount_expr)
    final_price = discount_res["final_price"]

    # Komparasi F-04
    comp_res = compare_price(final_price, last_price)

    # Budget Cap F-05
    budget_res = evaluate_budget_cap(current_cart_spending, final_price, budget_limit)

    return {
        "engine": "Python 3.x - Native Scanner Core",
        "barcode": product["barcode"],
        "name": product["name"],
        "brand": product["brand"],
        "category": product["category"],
        "unit": product["unit"],
        "unitSize": product["unitSize"],
        "shelf_price": shelf_price,
        "discount_applied": discount_expr,
        "discount_result": discount_res,
        "last_month_price": last_price,
        "comparison": comp_res,
        "budget_evaluation": budget_res
    }

# ---------------------------------------------------------------------------
# CLI RUNNER & HTTP SERVER
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 5000

        class ScanHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                parsed = urllib.parse.urlparse(self.path)
                if parsed.path == "/api/scan":
                    params = urllib.parse.parse_qs(parsed.query)
                    barcode = params.get("barcode", ["8991002105432"])[0]
                    discount = params.get("discount", [None])[0]
                    res = analyze_scanned_barcode(barcode, discount)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(res, indent=2).encode("utf-8"))
                else:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "Python Scanner Server Online", "port": port}).encode("utf-8"))

        server = HTTPServer(("localhost", port), ScanHandler)
        print(f"[Python Engine] Server berjalan di http://localhost:{port}")
        server.serve_forever()

    elif len(sys.argv) > 1 and sys.argv[1] == "--demo":
        print("="*65)
        print("DEMO PYTHON SCANNER ENGINE - SMART GROCERY RIAN")
        print("="*65)
        for code, prod in list(BARCODE_CATALOG.items())[:3]:
            res = analyze_scanned_barcode(code)
            print(f"Barcode: {code} | {res['name']}")
            print(f"  Harga Rak: Rp {res['shelf_price']:,} -> Diskon: {res['discount_applied']}")
            print(f"  Harga Akhir: Rp {res['discount_result']['final_price']:,} (Hemat Rp {res['discount_result']['saved_amount']:,})")
            print(f"  Komparasi Bulan Lalu: {res['comparison']['label']}")
            print(f"  Status Dompet: {res['budget_evaluation']['tag']}")
            print("-" * 65)

    elif len(sys.argv) > 1 and sys.argv[1].isdigit():
        code = sys.argv[1]
        res = analyze_scanned_barcode(code)
        print(json.dumps(res, indent=2))

    else:
        # Default: print JSON untuk sampel Sania
        res = analyze_scanned_barcode("8991002105432")
        print(json.dumps(res, indent=2))
