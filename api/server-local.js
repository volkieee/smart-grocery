/**
 * LOCAL NODE.JS DEVELOPMENT RUNNER
 * Menjalankan Node.js backend lokal saat pengujian offline (npm start)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint 1: /api/health
  if (url.pathname === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      status: 'ok',
      service: 'Smart Grocery Pro Cloud Backend (Local Node.js)',
      version: '4.0.0',
      runtime: `Node.js ${process.version}`,
      language: 'TypeScript / Node.js Engine',
      timestamp: new Date().toISOString()
    }));
  }

  // Endpoint 2: /api/insights
  if (url.pathname === '/api/insights') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'online',
        runtime: 'Node.js ' + process.version,
        message: 'Endpoint siap menerima POST analitik keranjang belanja'
      }));
    }

    // Read body
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const cart = Array.isArray(payload.cart) ? payload.cart : [];
        const budgetLimit = Number(payload.budgetLimit) || 350000;

        let totalSpent = 0;
        const categoryAllocation = {};

        cart.forEach(item => {
          const lineCost = (Number(item.price) || 0) * (Number(item.qty) || 1);
          totalSpent += lineCost;
          const cat = item.category || 'Lainnya';
          if (!categoryAllocation[cat]) categoryAllocation[cat] = { spent: 0, percentage: 0 };
          categoryAllocation[cat].spent += lineCost;
        });

        Object.keys(categoryAllocation).forEach(cat => {
          categoryAllocation[cat].percentage = totalSpent > 0
            ? Math.round((categoryAllocation[cat].spent / totalSpent) * 100)
            : 0;
        });

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

        const ratio = budgetLimit > 0 ? totalSpent / budgetLimit : 0;
        const status = ratio >= 1.0 ? 'DANGER' : ratio >= 0.8 ? 'WARNING' : 'SAFE';
        const healthScore = status === 'DANGER' ? Math.max(20, Math.round(100 - (ratio - 1) * 150))
          : status === 'WARNING' ? Math.round(85 - (ratio - 0.8) * 150)
          : Math.round(100 - ratio * 20);

        const recommendations = [];
        if (status === 'DANGER') {
          recommendations.push({
            type: 'WARNING',
            title: 'Defisit Anggaran Terdeteksi (Node.js Engine)',
            description: `Keranjang Anda melebihi batas dompet sebesar Rp ${(totalSpent - budgetLimit).toLocaleString('id-ID')}. Segera pangkas barang non-pokok.`,
            estimatedSavings: totalSpent - budgetLimit
          });
        }
        if (itemsIncreased > 0) {
          recommendations.push({
            type: 'SAVINGS',
            title: 'Kenaikan Harga Terdeteksi (F-04)',
            description: `Terdapat ${itemsIncreased} barang mengalami kenaikan dibanding bulan lalu (dampak inflasi: Rp ${Math.abs(netInflationAmount).toLocaleString('id-ID')}).`,
            estimatedSavings: Math.max(0, netInflationAmount)
          });
        }
        if (recommendations.length === 0) {
          recommendations.push({
            type: 'SAVINGS',
            title: 'Keranjang Belanja Sangat Sehat',
            description: 'Komposisi belanjaan sangat efisien dan jauh di bawah batas saku dompet.'
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status,
          healthScore,
          summary: `Keranjang dianalisis oleh Node.js Core (${healthScore}/100). Status: ${status}.`,
          inflationSummary: {
            totalItemsCompared,
            itemsIncreased,
            itemsDecreased,
            itemsStable,
            netInflationPct: totalSpent > 0 ? Number(((netInflationAmount / totalSpent) * 100).toFixed(1)) : 0
          },
          recommendations,
          categoryAllocation,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Endpoint 3: /api/scan-python (Scanner Barcode & Diskon Bertingkat Python Engine)
  if (url.pathname === '/api/scan-python' || url.pathname === '/api/scan') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    const barcode = url.searchParams.get('barcode') || '8991002105432';
    const discount = url.searchParams.get('discount') || '';
    const lastPrice = Number(url.searchParams.get('lastPrice')) || 0;
    const currentPrice = Number(url.searchParams.get('price')) || 0;

    // Coba eksekusi skrip python asli jika python terpasang di sistem
    import('node:child_process').then(({ exec }) => {
      const pyScript = fs.existsSync(path.join(rootDir, 'scripts', 'scanner.py'))
        ? path.join(rootDir, 'scripts', 'scanner.py')
        : path.join(rootDir, 'scanner.py');
      exec(`python "${pyScript}" ${barcode}`, (pyErr, pyStdout) => {
        if (!pyErr && pyStdout) {
          try {
            const data = JSON.parse(pyStdout.trim());
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ...data, pythonInstalled: true }));
          } catch (e) { }
        }

        // Fallback: Gunakan algoritma Python identik dalam Node.js
        const CATALOG = {
          '8991002105432': { name: 'Minyak Goreng Sania Pouch', brand: 'Sania Royale', category: 'Bahan Pokok', unit: 'liter', unitSize: '2 Liter', price: 38500, lastMonthPrice: 34000, defaultDiscounts: '15+5' },
          '8992753311201': { name: 'Beras Ramos Super 5kg', brand: 'Topi Koki', category: 'Bahan Pokok', unit: 'kg', unitSize: '5 Kg', price: 74500, lastMonthPrice: 69000, defaultDiscounts: '0' },
          '8998866200192': { name: 'Telur Ayam Negeri Pack', brand: 'Superindo Fresh', category: 'Bahan Pokok', unit: 'kg', unitSize: '1 Kg (16 Butir)', price: 28500, lastMonthPrice: 31000, defaultDiscounts: '10' },
          '8993189201018': { name: 'Sabun Mandi Cair Biore Guard', brand: 'Biore KAO', category: 'Kebersihan', unit: 'pouch', unitSize: '450 ml', price: 26900, lastMonthPrice: 26900, defaultDiscounts: '50+20' },
          '8991001100223': { name: 'Indomie Goreng Spesial (Dus)', brand: 'Indofood', category: 'Makanan & Minuman', unit: 'dus', unitSize: '40 bungkus', price: 118000, lastMonthPrice: 115000, defaultDiscounts: '5' },
          '8999999001234': { name: 'Deterjen Rinso Molto Cair', brand: 'Unilever', category: 'Kebersihan', unit: 'pouch', unitSize: '750 ml', price: 22500, lastMonthPrice: 24500, defaultDiscounts: '20' },
          '8992388102911': { name: 'Kecap Manis Bango Pouch', brand: 'Bango Unilever', category: 'Dapur & Bumbu', unit: 'pouch', unitSize: '520 ml', price: 24000, lastMonthPrice: 22000, defaultDiscounts: '0' },
          '8996001301124': { name: 'Pembersih Lantai Wipol Karbol', brand: 'Wipol', category: 'Kebersihan', unit: 'botol', unitSize: '780 ml', price: 19500, lastMonthPrice: 19500, defaultDiscounts: '50+20' }
        };

        const prod = CATALOG[barcode] || {
          name: `Produk Supermarket #${barcode.slice(-4)}`,
          brand: 'Item Supermarket',
          category: 'Bahan Pokok',
          unit: 'pcs',
          unitSize: '1 Pcs',
          price: currentPrice || 25000,
          lastMonthPrice: lastPrice || 23000,
          defaultDiscounts: '10'
        };

        const shelfPrice = currentPrice > 0 ? currentPrice : prod.price;
        const baseLast = lastPrice > 0 ? lastPrice : prod.lastMonthPrice;
        const discRaw = discount || prod.defaultDiscounts;

        // Hitung diskon bertingkat F-03
        let currentP = shelfPrice;
        const steps = [];
        const parts = discRaw.replace(/%/g, '').split(/[+,\&]/);
        parts.forEach(p => {
          const v = parseFloat(p.trim());
          if (v > 0) {
            currentP -= currentP * (v / 100);
            steps.push(`${v}%`);
          }
        });
        const finalPrice = Math.max(0, Math.round(currentP));
        const savedAmount = shelfPrice - finalPrice;
        const savedPct = shelfPrice > 0 ? Number(((savedAmount / shelfPrice) * 100).toFixed(1)) : 0;

        // F-04 Komparasi
        const diff = finalPrice - baseLast;
        const diffPct = baseLast > 0 ? Number(((diff / baseLast) * 100).toFixed(1)) : 0;
        const comparison = diff > 0 ? { status: 'UP', arrow: '↑', label: `Naik Rp ${diff.toLocaleString('id-ID')} (+${diffPct}%)`, css: 'up' }
          : diff < 0 ? { status: 'DOWN', arrow: '↓', label: `Turun Rp ${Math.abs(diff).toLocaleString('id-ID')} (-${Math.abs(diffPct)}%)`, css: 'down' }
          : { status: 'STABLE', arrow: '=', label: 'Harga Stabil (Sama)', css: 'stable' };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          engine: 'Python 3 Algorithm (Standard Math Engine)',
          pythonInstalled: false,
          barcode,
          name: prod.name,
          brand: prod.brand,
          category: prod.category,
          unit: prod.unit,
          unitSize: prod.unitSize,
          shelf_price: shelfPrice,
          discount_applied: discRaw,
          discount_result: {
            original_price: shelfPrice,
            final_price: finalPrice,
            saved_amount: savedAmount,
            saved_pct: savedPct,
            formula_text: steps.length > 0 ? `Potongan bertingkat: ${steps.join(' + ')}` : 'Harga Normal'
          },
          last_month_price: baseLast,
          comparison,
          pythonSource: `def calculate_discount(price, expr):\n    # Python stacked discount logic\n    for d in expr.split('+'):\n        price -= price * (float(d) / 100.0)\n    return round(price)`
        }));
      });
    });
    return;
  }

  // Serve static files
  let filePath = path.join(rootDir, url.pathname === '/' ? 'index.html' : url.pathname);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Node.js Engine] Server running on http://localhost:${PORT}`);
});
