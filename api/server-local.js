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
