const http = require('http');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Menghubungkan Akun Google...</title>
  <style>
    body { background-color: #202124; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .spinner { width: 36px; height: 36px; border: 3px solid #3c4043; border-top-color: #8ab4f8; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div style="font-size: 15px; font-weight: 500;">Menghubungkan akun Google ke KeranjangPintar...</div>
  <script>
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'SUPABASE_OAUTH_TOKEN_TRANSFER',
        hash: hash,
        search: search
      }, '*');
      setTimeout(() => window.close(), 300);
    } else {
      window.location.href = 'http://127.0.0.1:5500/index.html' + search + hash;
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(html);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('KeranjangPintar OAuth Helper listening on http://localhost:3000');
});
