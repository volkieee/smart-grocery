import type { VercelRequest, VercelResponse } from '@vercel/node';
import type {
  BasketAnalyticsPayload,
  SmartBasketInsight,
  BudgetHealthStatus
} from '../types/grocery.js';

/**
 * Node.js Serverless Function (TypeScript) - Vercel Endpoint
 * POST /api/insights
 * Menganalisis keranjang belanja secara cerdas:
 * 1. Deteksi laju inflasi keranjang vs bulan lalu (F-04)
 * 2. Evaluasi kesehatan anggaran dompet (F-05)
 * 3. Memberikan rekomendasi penghematan cerdas
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      runtime: 'Node.js ' + process.version,
      engine: 'TypeScript Vercel Serverless Core',
      message: 'Smart Grocery Pro Intelligence API siap menerima analisis keranjang belanja.'
    });
  }

  try {
    const payload = (req.body || {}) as BasketAnalyticsPayload;
    const cart = Array.isArray(payload.cart) ? payload.cart : [];
    const budgetLimit = Number(payload.budgetLimit) || 350000;

    // 1. Analisis Pengeluaran & Alokasi Kategori
    let totalSpent = 0;
    let totalSaved = 0;
    const categoryAllocation: Record<string, { spent: number; percentage: number }> = {};

    cart.forEach(item => {
      const lineCost = (Number(item.price) || 0) * (Number(item.qty) || 1);
      totalSpent += lineCost;

      const cat = item.category || 'Lainnya';
      if (!categoryAllocation[cat]) {
        categoryAllocation[cat] = { spent: 0, percentage: 0 };
      }
      categoryAllocation[cat].spent += lineCost;
    });

    Object.keys(categoryAllocation).forEach(cat => {
      const spent = categoryAllocation[cat].spent;
      categoryAllocation[cat].percentage = totalSpent > 0
        ? Math.round((spent / totalSpent) * 100)
        : 0;
    });

    // 2. Analisis Inflasi Keranjang vs Bulan Lalu (F-04 Deep Comparison)
    let itemsIncreased = 0;
    let itemsDecreased = 0;
    let itemsStable = 0;
    let totalItemsCompared = 0;
    let netInflationAmount = 0;

    cart.forEach(item => {
      const currentPrice = Number(item.price) || 0;
      const lastPrice = Number(item.lastMonthPrice) || 0;

      if (lastPrice > 0 && currentPrice > 0) {
        totalItemsCompared++;
        const diff = currentPrice - lastPrice;
        netInflationAmount += diff * (item.qty || 1);

        if (diff > 0) itemsIncreased++;
        else if (diff < 0) itemsDecreased++;
        else itemsStable++;
      }
    });

    const netInflationPct = totalSpent > 0
      ? Number(((netInflationAmount / totalSpent) * 100).toFixed(1))
      : 0;

    // 3. Evaluasi Status Anggaran (Health Score 0 - 100)
    const ratio = budgetLimit > 0 ? totalSpent / budgetLimit : 0;
    let status: BudgetHealthStatus = 'SAFE';
    let healthScore = 100;

    if (ratio >= 1.0) {
      status = 'DANGER';
      healthScore = Math.max(20, Math.round(100 - (ratio - 1) * 150));
    } else if (ratio >= 0.8) {
      status = 'WARNING';
      healthScore = Math.round(85 - (ratio - 0.8) * 150);
    } else {
      status = 'SAFE';
      healthScore = Math.round(100 - ratio * 20);
    }

    // 4. Rekomendasi Cerdas Node.js
    const recommendations: SmartBasketInsight['recommendations'] = [];

    if (status === 'DANGER') {
      const deficit = totalSpent - budgetLimit;
      recommendations.push({
        type: 'WARNING',
        title: 'Defisit Anggaran Terdeteksi',
        description: `Keranjang Anda melebihi batas dompet sebesar Rp ${deficit.toLocaleString('id-ID')}. Pertimbangkan untuk membatalkan item sekunder atau mengurangi kuantitas item non-pokok.`,
        estimatedSavings: deficit
      });
    }

    if (itemsIncreased > 0) {
      recommendations.push({
        type: 'SAVINGS',
        title: 'Kenaikan Harga Terdeteksi (F-04)',
        description: `Terdapat ${itemsIncreased} barang yang mengalami kenaikan harga dibanding bulan lalu dengan dampak inflasi keranjang sebesar Rp ${Math.abs(netInflationAmount).toLocaleString('id-ID')}. Cek promo rak untuk alternatif.`,
        estimatedSavings: Math.max(0, netInflationAmount)
      });
    }

    // Periksa proporsi Bahan Pokok vs Jajan
    const nonPokokSpent = (categoryAllocation['Makanan & Minuman']?.spent || 0) + (categoryAllocation['Lainnya']?.spent || 0);
    if (nonPokokSpent > (budgetLimit * 0.4) && status !== 'SAFE') {
      recommendations.push({
        type: 'SUBSTITUTION',
        title: 'Optimasi Belanja Non-Pokok',
        description: `Alokasi makanan ringan & barang lainnya mencapai Rp ${nonPokokSpent.toLocaleString('id-ID')}. Mengurangi 1 atau 2 camilan dapat langsung mengembalikan dompet ke zona AMAN.`,
        estimatedSavings: Math.round(nonPokokSpent * 0.3)
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'SAVINGS',
        title: 'Keranjang Belanja Sangat Sehat',
        description: 'Komposisi belanjaan Anda sangat disiplin dan berada jauh di bawah limit saku. Siap melangkah ke kasir!'
      });
    }

    const insight: SmartBasketInsight = {
      status,
      healthScore,
      summary: status === 'SAFE'
        ? `Keranjang belanja sehat (${healthScore}/100). Sisa uang dompet Rp ${(budgetLimit - totalSpent).toLocaleString('id-ID')}.`
        : status === 'WARNING'
          ? `Mendekati limit dompet (${Math.round(ratio * 100)}%). Berhati-hatilah saat menambah barang baru.`
          : `Defisit Rp ${(totalSpent - budgetLimit).toLocaleString('id-ID')}. Disarankan memangkas barang sebelum kasir.`,
      inflationSummary: {
        totalItemsCompared,
        itemsIncreased,
        itemsDecreased,
        itemsStable,
        netInflationPct
      },
      recommendations,
      categoryAllocation,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(insight);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Gagal memproses analitik keranjang',
      message: error?.message || 'Internal Server Error'
    });
  }
}
