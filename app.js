/**
 * SMART GROCERY PRO - NEO-CYBER & SUPABASE CLOUD SYNC CORE
 * Menjawab seluruh kebutuhan SRS F-01 s/d F-06 & Cerita Belanja Rian
 * Terintegrasi Cloud Supabase Hybrid (LocalStorage + Cloud Sync)
 */

(function () {
  'use strict';

  // --- SUPABASE EMBEDDED CONFIG ---
  const SUPABASE_CONFIG = {
    URL: 'https://szhtgpjvudguknevurfh.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aHRncGp2dWRndWtuZXZ1cmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5OTcwNDcsImV4cCI6MjEwNjU3MzA0N30.qtqxVbdfU3RBz4cH2jr20w8JHiyhMs3NcppzIPGc1GA'
  };

  // --- STORAGE KEYS ---
  const STORAGE_KEYS = {
    CART: 'smart_grocery_cart',
    BUDGET: 'smart_grocery_budget',
    HISTORY: 'smart_grocery_history',
    MASTER: 'smart_grocery_master',
    SOUND: 'smart_grocery_sound_enabled'
  };

  // Default Master Reference Items for Rian
  const DEFAULT_MASTER_ITEMS = [
    { name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', lastPrice: 72000 },
    { name: 'Minyak Goreng Sania 2L', category: 'Bahan Pokok', unit: 'pouch', lastPrice: 36000 },
    { name: 'Telur Ayam Negeri 1kg', category: 'Bahan Pokok', unit: 'kg', lastPrice: 28000 },
    { name: 'Sabun Cuci Deterjen 800g', category: 'Kebersihan', unit: 'pack', lastPrice: 19500 },
    { name: 'Pasta Gigi Herbal 190g', category: 'Kebersihan', unit: 'pcs', lastPrice: 14000 },
    { name: 'Sabun Pembersih Lantai 750ml', category: 'Kebersihan', unit: 'botol', lastPrice: 16000 },
    { name: 'Mie Instan Goreng Spesial', category: 'Makanan & Minuman', unit: 'pcs', lastPrice: 3100 },
    { name: 'Kecap Manis Refill 520ml', category: 'Dapur & Bumbu', unit: 'pouch', lastPrice: 17500 },
    { name: 'Biskuit Cokelat Kaleng', category: 'Makanan & Minuman', unit: 'kaleng', lastPrice: 32000 }
  ];

  const DEFAULT_SAMPLE_CART = [
    {
      id: 'item-1',
      name: 'Beras Ramos 5kg',
      category: 'Bahan Pokok',
      unit: 'pack',
      qty: 1,
      price: 75000,
      lastMonthPrice: 72000,
      discountRaw: '',
      createdAt: Date.now() - 3600000
    },
    {
      id: 'item-2',
      name: 'Minyak Goreng Sania 2L',
      category: 'Bahan Pokok',
      unit: 'pouch',
      qty: 2,
      price: 38000,
      lastMonthPrice: 36000,
      discountRaw: '10%',
      createdAt: Date.now() - 3000000
    },
    {
      id: 'item-3',
      name: 'Telur Ayam Negeri 1kg',
      category: 'Bahan Pokok',
      unit: 'kg',
      qty: 1,
      price: 26000,
      lastMonthPrice: 28000,
      discountRaw: '',
      createdAt: Date.now() - 2400000
    },
    {
      id: 'item-4',
      name: 'Sabun Pembersih Lantai 750ml',
      category: 'Kebersihan',
      unit: 'botol',
      qty: 1,
      price: 20000,
      lastMonthPrice: 16000,
      discountRaw: '50+20',
      createdAt: Date.now() - 1800000
    },
    {
      id: 'item-5',
      name: 'Mie Instan Goreng Spesial',
      category: 'Makanan & Minuman',
      unit: 'pcs',
      qty: 10,
      price: 3100,
      lastMonthPrice: 3100,
      discountRaw: '',
      createdAt: Date.now() - 1200000
    }
  ];

  // --- STATE MANAGEMENT ---
  let appState = {
    cart: [],
    budgetLimit: 350000,
    history: [],
    masterItems: [],
    activeCategory: 'ALL',
    searchQuery: '',
    editingItemId: null,
    soundEnabled: true,
    supabaseUrl: '',
    supabaseKey: '',
    supabaseClient: null,
    isCloudConnected: false
  };

  // --- AUDIO SYNTHESIZER ---
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    },
    playTap() {
      if (!appState.soundEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
      } catch (e) {}
    },
    playSuccess() {
      if (!appState.soundEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 1046.50].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.1, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.15);
        });
      } catch (e) {}
    },
    playAlert() {
      if (!appState.soundEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.setValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    }
  };

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    loadDataFromStorage();
    initSupabaseClient();
    setupNavigation();
    setupEventListeners();
    setupSoundToggle();
    renderAll();
    initComparatorTool();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- STORAGE ---
  function loadDataFromStorage() {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const savedMaster = localStorage.getItem(STORAGE_KEYS.MASTER);
      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);

      appState.cart = savedCart ? JSON.parse(savedCart) : DEFAULT_SAMPLE_CART;
      appState.budgetLimit = savedBudget ? Number(savedBudget) : 350000;
      appState.history = savedHistory ? JSON.parse(savedHistory) : [];
      appState.masterItems = savedMaster ? JSON.parse(savedMaster) : DEFAULT_MASTER_ITEMS;
      appState.soundEnabled = savedSound !== null ? savedSound === 'true' : true;
      appState.supabaseUrl = SUPABASE_CONFIG.URL;
      appState.supabaseKey = SUPABASE_CONFIG.KEY;
    } catch (e) {
      appState.cart = DEFAULT_SAMPLE_CART;
      appState.budgetLimit = 350000;
      appState.masterItems = DEFAULT_MASTER_ITEMS;
      appState.supabaseUrl = SUPABASE_CONFIG.URL;
      appState.supabaseKey = SUPABASE_CONFIG.KEY;
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(appState.cart));
  }
  function saveBudget() {
    localStorage.setItem(STORAGE_KEYS.BUDGET, appState.budgetLimit.toString());
  }
  function saveHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(appState.history));
  }
  function saveMaster() {
    localStorage.setItem(STORAGE_KEYS.MASTER, JSON.stringify(appState.masterItems));
  }
  function saveSound() {
    localStorage.setItem(STORAGE_KEYS.SOUND, appState.soundEnabled.toString());
  }

  // ==========================================================================
  // SUPABASE CLOUD INTEGRATION MODULE (REALTIME HYBRID)
  // ==========================================================================
  function initSupabaseClient() {
    if (appState.supabaseUrl && appState.supabaseKey && window.supabase) {
      try {
        appState.supabaseClient = window.supabase.createClient(appState.supabaseUrl, appState.supabaseKey);
        appState.isCloudConnected = true;
        updateCloudStatusUI(true);
        subscribeToRealtimeChanges();
        pullDataFromSupabase(true);
      } catch (e) {
        console.error('Supabase init error:', e);
        appState.isCloudConnected = false;
        updateCloudStatusUI(false);
      }
    } else {
      appState.isCloudConnected = false;
      updateCloudStatusUI(false);
    }
  }

  function subscribeToRealtimeChanges() {
    if (!appState.supabaseClient) return;
    try {
      appState.supabaseClient
        .channel('public:groceries_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, (payload) => {
          pullDataFromSupabase(true);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'master_products' }, (payload) => {
          pullDataFromSupabase(true);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings' }, (payload) => {
          pullDataFromSupabase(true);
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel error:', e);
    }
  }

  function updateCloudStatusUI(isConnected) {
    const dot = document.getElementById('cloudStatusDot');
    const tag = document.getElementById('cloudStatusTag');
    const cloudIcon = document.getElementById('cloudIndicatorIcon');
    const cloudTitle = document.getElementById('cloudStatusTitle');
    const cloudSub = document.getElementById('cloudStatusSubtitle');

    if (isConnected) {
      if (dot) {
        dot.classList.add('connected');
        dot.title = 'Status: Terhubung ke Cloud Supabase (Realtime Sync)';
      }
      if (tag) tag.textContent = 'CLOUD';
      if (cloudIcon) cloudIcon.classList.add('connected');
      if (cloudTitle) cloudTitle.textContent = 'Cloud Database Terhubung';
      if (cloudSub) cloudSub.textContent = 'Supabase Realtime Sync • Data otomatis sinkron di semua HP.';
    } else {
      if (dot) {
        dot.classList.remove('connected');
        dot.title = 'Status: LocalStorage Mode';
      }
      if (tag) tag.textContent = 'LOCAL';
      if (cloudIcon) cloudIcon.classList.remove('connected');
      if (cloudTitle) cloudTitle.textContent = 'Mode LocalStorage';
      if (cloudSub) cloudSub.textContent = 'Data tersimpan di perangkat lokal.';
    }

    if (window.lucide) lucide.createIcons();
  }

  async function pushDataToSupabase(silent = false) {
    if (!appState.supabaseClient) {
      if (!silent) showToast('Koneksi Supabase belum dikonfigurasi!', 'danger');
      return;
    }

    try {
      if (!silent) showToast('Mengunggah data ke Supabase...', 'info');

      // 1. Sync User Settings / Budget
      await appState.supabaseClient.from('user_settings').upsert({
        id: 'rian_default_user',
        budget_limit: appState.budgetLimit,
        sound_enabled: appState.soundEnabled,
        updated_at: new Date().toISOString()
      });

      // 2. Sync Master Items
      if (appState.masterItems.length > 0) {
        const masterPayload = appState.masterItems.map(item => ({
          name: item.name,
          category: item.category,
          unit: item.unit,
          last_price: item.lastPrice,
          updated_at: new Date().toISOString()
        }));
        await appState.supabaseClient.from('master_products').upsert(masterPayload, { onConflict: 'name' });
      }

      // 3. Sync Receipts
      if (appState.history.length > 0) {
        const receiptsPayload = appState.history.map(rcp => ({
          id: rcp.id,
          date_label: rcp.date,
          budget_limit: rcp.budgetLimit,
          grand_total: rcp.grandTotal,
          total_saved: rcp.totalSaved,
          item_count: rcp.itemCount,
          items: rcp.items,
          created_at: new Date().toISOString()
        }));
        await appState.supabaseClient.from('receipts').upsert(receiptsPayload, { onConflict: 'id' });
      }

      if (!silent) {
        AudioEngine.playSuccess();
        showToast('Seluruh data berhasil dicadangkan ke Supabase!', 'success');
      }
    } catch (err) {
      console.error('Push error:', err);
      if (!silent) showToast('Gagal mengunggah: ' + (err.message || 'Error jaringan'), 'danger');
    }
  }

  async function pullDataFromSupabase(silent = false) {
    if (!appState.supabaseClient) {
      if (!silent) showToast('Koneksi Supabase belum dikonfigurasi!', 'danger');
      return;
    }

    try {
      if (!silent) showToast('Mengambil data dari Supabase...', 'info');

      // 1. Fetch Master Products
      const { data: masterData, error: masterErr } = await appState.supabaseClient
        .from('master_products')
        .select('*');

      if (!masterErr && masterData && masterData.length > 0) {
        appState.masterItems = masterData.map(m => ({
          name: m.name,
          category: m.category,
          unit: m.unit,
          lastPrice: Number(m.last_price)
        }));
        saveMaster();
      }

      // 2. Fetch Receipts History
      const { data: receiptsData, error: rcpErr } = await appState.supabaseClient
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!rcpErr && receiptsData && receiptsData.length > 0) {
        appState.history = receiptsData.map(r => ({
          id: r.id,
          date: r.date_label,
          budgetLimit: Number(r.budget_limit),
          grandTotal: Number(r.grand_total),
          totalSaved: Number(r.total_saved),
          itemCount: Number(r.item_count),
          items: r.items
        }));
        saveHistory();
      }

      // 3. Fetch Settings
      const { data: settingsData } = await appState.supabaseClient
        .from('user_settings')
        .select('*')
        .eq('id', 'rian_default_user')
        .single();

      if (settingsData) {
        appState.budgetLimit = Number(settingsData.budget_limit) || 350000;
        appState.soundEnabled = settingsData.sound_enabled ?? true;
        saveBudget();
        saveSound();
      }

      renderAll();
      if (!silent) {
        AudioEngine.playSuccess();
        showToast('Data berhasil disinkronkan dari Supabase!', 'success');
      }
    } catch (err) {
      console.error('Pull error:', err);
      if (!silent) showToast('Gagal menarik data: ' + (err.message || 'Error'), 'danger');
    }
  }

  async function syncCloudData() {
    if (!appState.supabaseClient) {
      initSupabaseClient();
    }
    if (!appState.supabaseClient) {
      showToast('Koneksi Supabase tidak aktif', 'danger');
      return;
    }
    AudioEngine.playTap();
    showToast('Menyinkronkan dengan Cloud...', 'info');
    await pushDataToSupabase();
    await pullDataFromSupabase();
    showToast('Sinkronisasi Cloud Berhasil!', 'success');
  }

  // ==========================================================================
  // F-03: LOGIKA KALKULATOR DISKON BERTINGKAT
  // ==========================================================================
  function calculateDiscount(originalPrice, discountString) {
    if (!originalPrice || originalPrice <= 0) {
      return { finalUnitPrice: 0, savedPerUnit: 0, discountLabel: '', formulaText: '' };
    }

    const price = Number(originalPrice);
    if (!discountString || typeof discountString !== 'string' || discountString.trim() === '') {
      return {
        finalUnitPrice: price,
        savedPerUnit: 0,
        discountLabel: '',
        formulaText: 'Harga Normal (Tanpa Promo)'
      };
    }

    const cleanStr = discountString.trim().toLowerCase();

    // Buy 2 Get 1
    if (cleanStr.includes('buy 2 get 1') || cleanStr.includes('beli 2 gratis 1')) {
      const discountedUnit = (price * 2) / 3;
      const saved = price - discountedUnit;
      return {
        finalUnitPrice: Math.round(discountedUnit),
        savedPerUnit: Math.round(saved),
        discountLabel: 'Beli 2 Gratis 1 (33.3%)',
        formulaText: `Beli 3 bayar 2: Rp ${(price * 2).toLocaleString('id-ID')} / 3 = Rp ${Math.round(discountedUnit).toLocaleString('id-ID')}`
      };
    }

    // Direct Nominal
    if (cleanStr.startsWith('rp') || (!cleanStr.includes('+') && !cleanStr.includes('%') && !isNaN(Number(cleanStr)))) {
      const nominal = Number(cleanStr.replace(/[^0-9]/g, ''));
      if (nominal > 0 && nominal < price) {
        const finalPrice = price - nominal;
        return {
          finalUnitPrice: finalPrice,
          savedPerUnit: nominal,
          discountLabel: `-Rp ${formatNumber(nominal)}`,
          formulaText: `Potongan Langsung: Rp ${formatNumber(price)} - Rp ${formatNumber(nominal)} = Rp ${formatNumber(finalPrice)}`
        };
      }
    }

    // Tiered Discount (50+20)
    if (cleanStr.includes('+') || cleanStr.includes('%') || !isNaN(Number(cleanStr))) {
      const parts = cleanStr.split('+').map(p => {
        const num = parseFloat(p.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      }).filter(num => num > 0);

      if (parts.length > 0) {
        let currentAmount = price;
        const steps = [];
        parts.forEach((pct, index) => {
          const cut = currentAmount * (pct / 100);
          const afterCut = currentAmount - cut;
          steps.push(`Lapis ${index + 1} (-${pct}%): Rp ${formatNumber(Math.round(currentAmount))} ➔ Rp ${formatNumber(Math.round(afterCut))}`);
          currentAmount = afterCut;
        });

        const finalPrice = Math.round(currentAmount);
        const saved = price - finalPrice;
        const totalEffectivePct = ((saved / price) * 100).toFixed(1);

        return {
          finalUnitPrice: finalPrice,
          savedPerUnit: saved,
          discountLabel: `Promo ${parts.join('% + ')}% (-${totalEffectivePct}%)`,
          formulaText: steps.join(' | ')
        };
      }
    }

    return {
      finalUnitPrice: price,
      savedPerUnit: 0,
      discountLabel: '',
      formulaText: 'Format diskon tidak dikenali'
    };
  }

  // ==========================================================================
  // F-04: DETEKSI FLUKTUASI HARGA REALTIME VS BULAN LALU
  // ==========================================================================
  function comparePriceWithLastMonth(currentPrice, lastMonthPrice) {
    const cur = Number(currentPrice) || 0;
    const last = Number(lastMonthPrice) || 0;

    if (!last || last <= 0) {
      return {
        status: 'new',
        text: 'BARU',
        icon: 'sparkles',
        badgeClass: 'new'
      };
    }

    const diff = cur - last;
    const pct = ((diff / last) * 100).toFixed(1);

    if (diff > 0) {
      return {
        status: 'up',
        text: `+Rp ${formatNumber(diff)} (+${pct}%)`,
        icon: 'trending-up',
        badgeClass: 'up'
      };
    } else if (diff < 0) {
      return {
        status: 'down',
        text: `-Rp ${formatNumber(Math.abs(diff))} (${pct}%)`,
        icon: 'trending-down',
        badgeClass: 'down'
      };
    } else {
      return {
        status: 'stable',
        text: 'STABIL',
        icon: 'minus',
        badgeClass: 'stable'
      };
    }
  }

  // ==========================================================================
  // F-05: PENGENDALI ANGGARAN (NEO-BENTO SAFETY CAP) CALCULATION & UI
  // ==========================================================================
  function updateBudgetHud() {
    let totalSpent = 0;
    let totalSaved = 0;
    let totalQty = 0;

    appState.cart.forEach(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      const lineTotal = disc.finalUnitPrice * item.qty;
      totalSpent += lineTotal;
      totalSaved += disc.savedPerUnit * item.qty;
      totalQty += item.qty;
    });

    const limit = appState.budgetLimit;
    const remaining = limit - totalSpent;
    const percentage = limit > 0 ? (totalSpent / limit) * 100 : 0;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Text Elements
    document.getElementById('hudTotalSpending').textContent = formatNumber(totalSpent);
    document.getElementById('hudBudgetLimit').textContent = `Rp ${formatNumber(limit)}`;
    document.getElementById('budgetPercentLabel').textContent = `${percentage.toFixed(0)}% CAP`;
    document.getElementById('summaryTotalItems').textContent = `${appState.cart.length} Jenis (${totalQty} Qty)`;
    document.getElementById('summaryTotalSaved').textContent = `Hemat Rp ${formatNumber(totalSaved)}`;

    // DOM Elements
    const hudCard = document.getElementById('budgetHudCard');
    const progressBar = document.getElementById('budgetProgressBar');
    const statusBadge = document.getElementById('hudStatusBadge');
    const statusText = document.getElementById('hudStatusText');
    const statusIcon = document.getElementById('hudStatusIcon');
    const remainingText = document.getElementById('hudRemainingText');
    const overBudgetBanner = document.getElementById('overBudgetBanner');

    progressBar.style.width = `${clampedPercentage}%`;

    // Reset Class Names
    hudCard.className = 'neo-hud-card';
    progressBar.className = 'hud-meter-fill';
    statusBadge.className = 'hud-status-chip';

    if (percentage < 80) {
      hudCard.classList.add('status-safe');
      progressBar.classList.add('status-safe');
      statusBadge.classList.add('status-safe');
      statusText.textContent = 'AMAN • SIAP KASIR';
      statusIcon.setAttribute('data-lucide', 'shield-check');
      remainingText.innerHTML = `SISA: <strong>Rp ${formatNumber(remaining)}</strong>`;
      overBudgetBanner.classList.add('hidden');
    } else if (percentage >= 80 && percentage < 100) {
      hudCard.classList.add('status-warn');
      progressBar.classList.add('status-warn');
      statusBadge.classList.add('status-warn');
      statusText.textContent = 'WASPADA • MELEBIHI 80%';
      statusIcon.setAttribute('data-lucide', 'alert-circle');
      remainingText.innerHTML = `TERTINGGAL: <strong style="color:var(--status-warn);">Rp ${formatNumber(remaining)}</strong>`;
      overBudgetBanner.classList.add('hidden');
    } else {
      hudCard.classList.add('status-danger');
      progressBar.classList.add('status-danger');
      statusBadge.classList.add('status-danger');
      statusText.textContent = 'BAHAYA • OVER BUDGET';
      statusIcon.setAttribute('data-lucide', 'triangle-alert');
      const overAmount = Math.abs(remaining);
      remainingText.innerHTML = `<span class="text-danger">DEFISIT: <strong>Rp ${formatNumber(overAmount)}</strong></span>`;
      overBudgetBanner.classList.remove('hidden');
      document.getElementById('trimDeficitAmount').textContent = `Rp ${formatNumber(overAmount)}`;
      AudioEngine.playAlert();
    }

    // Dock Badges
    document.getElementById('navCartBadge').textContent = appState.cart.length;
    document.getElementById('countAll').textContent = appState.cart.length;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ==========================================================================
  // RENDER CART ITEMS (NEO-BENTO CARDS)
  // ==========================================================================
  function renderCart() {
    const container = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('emptyCartState');
    const summaryBottom = document.getElementById('cartSummaryBottom');

    let filteredItems = appState.cart.filter(item => {
      const matchCat = appState.activeCategory === 'ALL' || item.category === appState.activeCategory;
      const matchSearch = appState.searchQuery === '' || item.name.toLowerCase().includes(appState.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (appState.cart.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      summaryBottom.classList.add('hidden');
      updateBudgetHud();
      return;
    }

    emptyState.classList.add('hidden');
    summaryBottom.classList.remove('hidden');

    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.78rem; font-family: var(--font-mono);">
          TIDAK ADA ITEM DITEMUKAN
        </div>
      `;
      updateBudgetHud();
      return;
    }

    let html = '';
    filteredItems.forEach(item => {
      const discount = calculateDiscount(item.price, item.discountRaw);
      const comparison = comparePriceWithLastMonth(item.price, item.lastMonthPrice);
      const lineTotal = discount.finalUnitPrice * item.qty;
      const hasDiscount = discount.savedPerUnit > 0;

      html += `
        <div class="neo-card-row" data-id="${item.id}">
          <div class="card-top-header">
            <span class="cat-mono-tag">${escapeHtml(item.category)}</span>
            <div class="card-action-mini">
              <button class="btn-ico-subtle" onclick="window.editCartItem('${item.id}')" title="Edit">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-ico-subtle trash" onclick="window.deleteCartItem('${item.id}')" title="Hapus">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>

          <h4 class="card-item-title">${escapeHtml(item.name)}</h4>
          <span class="card-item-spec">Kemasan: ${escapeHtml(item.unit)}</span>

          <!-- Badges Row -->
          <div class="card-badges-flow">
            <span class="unit-rate-mono">
              ${hasDiscount ? `<span class="strike">Rp ${formatNumber(item.price)}</span>` : ''}
              <strong>Rp ${formatNumber(discount.finalUnitPrice)}</strong>/${escapeHtml(item.unit)}
            </span>

            <!-- F-04: Comparison Badge -->
            <span class="neo-badge-indicator ${comparison.badgeClass}">
              <i data-lucide="${comparison.icon}"></i>
              <span>${comparison.text}</span>
            </span>

            <!-- F-03: Discount Badge -->
            ${hasDiscount ? `
              <span class="neo-promo-chip">
                <i data-lucide="tag"></i>
                <span>${discount.discountLabel}</span>
              </span>
            ` : ''}
          </div>

          <!-- Stepper & Subtotal -->
          <div class="card-bottom-line">
            <div class="neo-stepper-touch">
              <button type="button" class="stepper-tap-btn" onclick="window.changeItemQty('${item.id}', -1)" title="Kurangi">
                <i data-lucide="minus"></i>
              </button>
              <input type="number" value="${item.qty}" min="1" onchange="window.setItemQty('${item.id}', this.value)" inputmode="numeric">
              <button type="button" class="stepper-tap-btn" onclick="window.changeItemQty('${item.id}', 1)" title="Tambah">
                <i data-lucide="plus"></i>
              </button>
            </div>

            <div class="card-total-box">
              <div class="t-sub">SUBTOTAL (${item.qty} ${item.unit})</div>
              <div class="t-digits">Rp ${formatNumber(lineTotal)}</div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    updateBudgetHud();

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ==========================================================================
  // F-02: LOGIKA STEPPER & TOUCH
  // ==========================================================================
  window.changeItemQty = function (id, delta) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
      window.deleteCartItem(id);
      return;
    }

    item.qty = newQty;
    AudioEngine.playTap();
    saveCart();
    renderCart();
  };

  window.setItemQty = function (id, value) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;

    let parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) parsed = 1;
    item.qty = parsed;
    AudioEngine.playTap();
    saveCart();
    renderCart();
  };

  window.deleteCartItem = function (id) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;

    appState.cart = appState.cart.filter(i => i.id !== id);
    AudioEngine.playTap();
    saveCart();
    renderCart();
    showToast(`"${item.name}" dihapus dari troli`, 'warning');
  };

  // ==========================================================================
  // MODAL TAMBAH & EDIT ITEM
  // ==========================================================================
  const modalItemBackdrop = document.getElementById('modalItemBackdrop');
  const formItemModal = document.getElementById('formItemModal');
  const inputItemName = document.getElementById('inputItemName');
  const selectItemCategory = document.getElementById('selectItemCategory');
  const selectItemUnit = document.getElementById('selectItemUnit');
  const inputItemQty = document.getElementById('inputItemQty');
  const inputItemPrice = document.getElementById('inputItemPrice');
  const inputItemLastMonthPrice = document.getElementById('inputItemLastMonthPrice');
  const inputItemDiscount = document.getElementById('inputItemDiscount');
  const autoSuggestContainer = document.getElementById('autoSuggestContainer');

  function openItemModal(itemId = null) {
    appState.editingItemId = itemId;
    const title = document.getElementById('modalItemTitle');
    const submitText = document.getElementById('btnSubmitItemText');

    if (itemId) {
      const item = appState.cart.find(i => i.id === itemId);
      if (!item) return;
      title.textContent = 'Edit Produk';
      submitText.textContent = 'SIMPAN PERUBAHAN';

      document.getElementById('modalItemId').value = item.id;
      inputItemName.value = item.name;
      selectItemCategory.value = item.category;
      selectItemUnit.value = item.unit;
      inputItemQty.value = item.qty;
      inputItemPrice.value = item.price;
      inputItemLastMonthPrice.value = item.lastMonthPrice || '';
      inputItemDiscount.value = item.discountRaw || '';
    } else {
      title.textContent = 'Tambah ke Troli';
      submitText.textContent = 'SIMPAN KE TROLI';
      formItemModal.reset();
      document.getElementById('modalItemId').value = '';
      inputItemQty.value = 1;
    }

    updateModalLiveCalculations();
    modalItemBackdrop.classList.remove('hidden');
    inputItemName.focus();
    if (window.lucide) lucide.createIcons();
  }

  function closeItemModal() {
    modalItemBackdrop.classList.add('hidden');
    autoSuggestContainer.classList.add('hidden');
    appState.editingItemId = null;
  }

  window.editCartItem = function (id) {
    openItemModal(id);
  };

  function updateModalLiveCalculations() {
    const price = parseFloat(inputItemPrice.value) || 0;
    const lastPrice = parseFloat(inputItemLastMonthPrice.value) || 0;
    const qty = parseInt(inputItemQty.value, 10) || 1;
    const discountRaw = inputItemDiscount.value.trim();

    // 1. Discount Preview
    const disc = calculateDiscount(price, discountRaw);
    const discPreview = document.getElementById('modalDiscountPreview');
    const discText = document.getElementById('modalDiscountPreviewText');

    if (disc.savedPerUnit > 0) {
      discPreview.classList.remove('hidden');
      discText.textContent = `Harga Promo: Rp ${formatNumber(disc.finalUnitPrice)} (Hemat Rp ${formatNumber(disc.savedPerUnit)}/item)`;
    } else {
      discPreview.classList.add('hidden');
    }

    // 2. Comparison Badge
    const compPill = document.getElementById('modalComparePill');
    if (price > 0 && lastPrice > 0) {
      const comp = comparePriceWithLastMonth(price, lastPrice);
      compPill.className = `neo-badge-indicator ${comp.badgeClass}`;
      compPill.innerHTML = `<i data-lucide="${comp.icon}"></i> <span>${comp.text}</span>`;
    } else if (price > 0) {
      compPill.className = 'neo-badge-indicator new';
      compPill.innerHTML = `<i data-lucide="sparkles"></i> <span>Item baru atau tanpa acuan harga lalu</span>`;
    } else {
      compPill.className = 'neo-badge-indicator stable';
      compPill.innerHTML = `<i data-lucide="minus"></i> <span>Masukkan harga untuk cek fluktuasi</span>`;
    }

    // 3. Subtotal
    const lineTotal = disc.finalUnitPrice * qty;
    document.getElementById('modalLineTotal').textContent = `Rp ${formatNumber(lineTotal)}`;

    if (window.lucide) lucide.createIcons();
  }

  // Autocomplete Suggestions
  inputItemName.addEventListener('input', () => {
    const val = inputItemName.value.trim().toLowerCase();
    if (val.length < 1) {
      autoSuggestContainer.classList.add('hidden');
      return;
    }

    const matches = appState.masterItems.filter(m => m.name.toLowerCase().includes(val));
    if (matches.length === 0) {
      autoSuggestContainer.classList.add('hidden');
      return;
    }

    let html = '';
    matches.forEach(m => {
      html += `
        <div class="auto-row-neo" onclick="window.selectMasterSuggestion('${escapeHtml(m.name)}')">
          <div>
            <strong>${escapeHtml(m.name)}</strong>
            <small style="display:block; color:var(--text-muted); font-size:0.65rem;">${escapeHtml(m.category)} • ${escapeHtml(m.unit)}</small>
          </div>
          <span style="font-family:var(--font-mono); color:var(--volt-main); font-size:0.72rem;">
            Lalu: Rp ${formatNumber(m.lastPrice)}
          </span>
        </div>
      `;
    });

    autoSuggestContainer.innerHTML = html;
    autoSuggestContainer.classList.remove('hidden');
  });

  window.selectMasterSuggestion = function (name) {
    const item = appState.masterItems.find(m => m.name === name);
    if (!item) return;

    inputItemName.value = item.name;
    selectItemCategory.value = item.category;
    selectItemUnit.value = item.unit;
    inputItemLastMonthPrice.value = item.lastPrice;
    if (!inputItemPrice.value) {
      inputItemPrice.value = item.lastPrice;
    }
    autoSuggestContainer.classList.add('hidden');
    updateModalLiveCalculations();
    AudioEngine.playTap();
  };

  // Submit Modal
  formItemModal.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = inputItemName.value.trim();
    const category = selectItemCategory.value;
    const unit = selectItemUnit.value;
    const qty = parseInt(inputItemQty.value, 10) || 1;
    const price = parseFloat(inputItemPrice.value) || 0;
    const lastMonthPrice = parseFloat(inputItemLastMonthPrice.value) || 0;
    const discountRaw = inputItemDiscount.value.trim();

    if (!name || price <= 0) {
      showToast('Mohon lengkapi nama produk dan harga', 'danger');
      return;
    }

    if (appState.editingItemId) {
      const idx = appState.cart.findIndex(i => i.id === appState.editingItemId);
      if (idx !== -1) {
        appState.cart[idx] = {
          ...appState.cart[idx],
          name, category, unit, qty, price, lastMonthPrice, discountRaw
        };
        showToast(`"${name}" berhasil diubah`, 'success');
      }
    } else {
      const newItem = {
        id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name, category, unit, qty, price, lastMonthPrice, discountRaw,
        createdAt: Date.now()
      };
      appState.cart.unshift(newItem);
      showToast(`"${name}" ditambahkan ke troli`, 'success');
    }

    AudioEngine.playTap();
    updateMasterDatabaseItem(name, category, unit, lastMonthPrice || price);
    saveCart();
    renderCart();
    closeItemModal();
  });

  function updateMasterDatabaseItem(name, category, unit, price) {
    const existing = appState.masterItems.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.category = category;
      existing.unit = unit;
      if (price > 0) existing.lastPrice = price;
    } else {
      appState.masterItems.push({ name, category, unit, lastPrice: price });
    }
    saveMaster();

    // Auto-sync single item to Supabase if connected
    if (appState.supabaseClient) {
      appState.supabaseClient.from('master_products').upsert({
        name, category, unit, last_price: price, updated_at: new Date().toISOString()
      }, { onConflict: 'name' }).then(() => {});
    }
  }

  // ==========================================================================
  // NAVIGATION & TABS
  // ==========================================================================
  function setupNavigation() {
    const navButtons = document.querySelectorAll('.neo-bottom-dock .dock-tab');
    const panes = document.querySelectorAll('.tab-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');

        navButtons.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetTabId);
        if (targetPane) targetPane.classList.add('active');

        AudioEngine.playTap();

        if (targetTabId === 'tabBudget') {
          renderBudgetBreakdown();
        } else if (targetTabId === 'tabHistory') {
          renderHistoryList();
          renderMasterList();
        }

        if (window.lucide) lucide.createIcons();
      });
    });

    // Sub tabs in History
    const subTabHistory = document.getElementById('btnSubHistory');
    const subTabMaster = document.getElementById('btnSubMaster');
    const subViewHistory = document.getElementById('subViewHistory');
    const subViewMaster = document.getElementById('subViewMaster');

    if (subTabHistory && subTabMaster) {
      subTabHistory.addEventListener('click', () => {
        subTabHistory.classList.add('active');
        subTabMaster.classList.remove('active');
        subViewHistory.classList.add('active');
        subViewMaster.classList.remove('active');
        AudioEngine.playTap();
        renderHistoryList();
      });

      subTabMaster.addEventListener('click', () => {
        subTabMaster.classList.add('active');
        subTabHistory.classList.remove('active');
        subViewMaster.classList.add('active');
        subViewHistory.classList.remove('active');
        AudioEngine.playTap();
        renderMasterList();
      });
    }
  }

  function setupSoundToggle() {
    const btnSound = document.getElementById('btnSoundToggle');
    const iconSound = document.getElementById('soundIcon');
    if (!btnSound) return;

    btnSound.addEventListener('click', () => {
      appState.soundEnabled = !appState.soundEnabled;
      saveSound();
      if (appState.soundEnabled) {
        iconSound.setAttribute('data-lucide', 'volume-2');
        showToast('Efek suara aktif', 'info');
        AudioEngine.playTap();
      } else {
        iconSound.setAttribute('data-lucide', 'volume-x');
        showToast('Efek suara nonaktif', 'info');
      }
      if (window.lucide) lucide.createIcons();
    });
  }

  // ==========================================================================
  // EVENT LISTENERS & SUPABASE MODAL HANDLERS
  // ==========================================================================
  function setupEventListeners() {
    document.getElementById('btnOpenAddModal').addEventListener('click', () => openItemModal());
    document.getElementById('btnEmptyAdd').addEventListener('click', () => openItemModal());
    document.getElementById('btnCloseItemModal').addEventListener('click', closeItemModal);
    document.getElementById('btnCancelModalItem').addEventListener('click', closeItemModal);

    // Modal Qty Stepper
    document.getElementById('btnModalQtyMinus').addEventListener('click', () => {
      const q = parseInt(inputItemQty.value, 10) || 1;
      if (q > 1) inputItemQty.value = q - 1;
      AudioEngine.playTap();
      updateModalLiveCalculations();
    });
    document.getElementById('btnModalQtyPlus').addEventListener('click', () => {
      const q = parseInt(inputItemQty.value, 10) || 1;
      inputItemQty.value = q + 1;
      AudioEngine.playTap();
      updateModalLiveCalculations();
    });

    inputItemPrice.addEventListener('input', updateModalLiveCalculations);
    inputItemLastMonthPrice.addEventListener('input', updateModalLiveCalculations);
    inputItemDiscount.addEventListener('input', updateModalLiveCalculations);
    inputItemQty.addEventListener('input', updateModalLiveCalculations);

    // Category Tabs
    document.querySelectorAll('.neo-cat-chip').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.neo-cat-chip').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.activeCategory = pill.getAttribute('data-category');
        AudioEngine.playTap();
        renderCart();
      });
    });

    // Search
    const searchInput = document.getElementById('searchCartInput');
    const btnClearSearch = document.getElementById('btnClearSearch');

    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value.trim();
      if (appState.searchQuery) {
        btnClearSearch.classList.remove('hidden');
      } else {
        btnClearSearch.classList.add('hidden');
      }
      renderCart();
    });

    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      appState.searchQuery = '';
      btnClearSearch.classList.add('hidden');
      renderCart();
    });

    // Budget Quick Edit
    const budgetModal = document.getElementById('modalBudgetBackdrop');
    document.getElementById('btnEditBudgetTrigger').addEventListener('click', () => {
      document.getElementById('inputQuickBudget').value = appState.budgetLimit;
      budgetModal.classList.remove('hidden');
      AudioEngine.playTap();
    });

    document.getElementById('btnCloseBudgetModal').addEventListener('click', () => budgetModal.classList.add('hidden'));
    document.getElementById('btnCancelQuickBudget').addEventListener('click', () => budgetModal.classList.add('hidden'));
    document.getElementById('btnSaveQuickBudget').addEventListener('click', () => {
      const val = parseFloat(document.getElementById('inputQuickBudget').value) || 0;
      if (val > 0) {
        appState.budgetLimit = val;
        saveBudget();
        updateBudgetHud();
        budgetModal.classList.add('hidden');
        AudioEngine.playSuccess();
        showToast('Batas anggaran berhasil disimpan', 'success');
      }
    });

    // Budget Tab Save
    document.getElementById('btnSaveBudgetSetting').addEventListener('click', () => {
      const val = parseFloat(document.getElementById('inputBudgetSetting').value) || 0;
      if (val > 0) {
        appState.budgetLimit = val;
        saveBudget();
        updateBudgetHud();
        AudioEngine.playSuccess();
        showToast('Batas anggaran disimpan', 'success');
      }
    });

    // Cloud Sync Buttons
    const btnSyncHeader = document.getElementById('btnSyncCloudHeader');
    if (btnSyncHeader) btnSyncHeader.addEventListener('click', syncCloudData);

    const btnSyncNow = document.getElementById('btnSyncNow');
    if (btnSyncNow) btnSyncNow.addEventListener('click', syncCloudData);

    // Trim Helper
    document.getElementById('btnSuggestTrim').addEventListener('click', openTrimModal);
    document.getElementById('btnCloseTrimModal').addEventListener('click', () => {
      document.getElementById('modalTrimBackdrop').classList.add('hidden');
    });
    document.getElementById('btnCloseTrimDone').addEventListener('click', () => {
      document.getElementById('modalTrimBackdrop').classList.add('hidden');
      renderCart();
    });

    // Finish Shopping / Checkout
    document.getElementById('btnFinishShopping').addEventListener('click', handleCheckout);

    // Sample Data
    document.getElementById('btnLoadSampleData').addEventListener('click', () => {
      appState.cart = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_CART));
      saveCart();
      renderCart();
      AudioEngine.playSuccess();
      showToast('Data kebutuhan Rian dimuat', 'success');
    });

    document.getElementById('btnQuickCompareHeader').addEventListener('click', () => {
      document.getElementById('navBtnCompare').click();
    });

    // Master DB
    document.getElementById('searchMasterInput').addEventListener('input', (e) => {
      renderMasterList(e.target.value.trim().toLowerCase());
    });
    document.getElementById('btnAddMasterItem').addEventListener('click', () => {
      const name = prompt('Nama Barang Acuan:');
      if (!name) return;
      const price = parseFloat(prompt('Harga Acuan Bulan Lalu (Rp):', '10000')) || 0;
      const cat = prompt('Kategori (Bahan Pokok / Makanan & Minuman / Kebersihan / Dapur & Bumbu):', 'Bahan Pokok') || 'Lainnya';
      updateMasterDatabaseItem(name, cat, 'pcs', price);
      renderMasterList();
      showToast('Acuan harga ditambahkan', 'success');
    });

    // Sync
    document.getElementById('btnExportData').addEventListener('click', exportDataJson);
    document.getElementById('btnImportDataTrigger').addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importDataJson);
    document.getElementById('btnResetToDefaults').addEventListener('click', resetAllData);
    document.getElementById('btnCloseReceiptModal').addEventListener('click', () => {
      document.getElementById('modalReceiptBackdrop').classList.add('hidden');
    });
  }

  window.setQuickBudget = function (amount) {
    document.getElementById('inputQuickBudget').value = amount;
    AudioEngine.playTap();
  };
  window.setBudgetSetting = function (amount) {
    document.getElementById('inputBudgetSetting').value = amount;
    AudioEngine.playTap();
  };

  // ==========================================================================
  // SARAN PANGKAS BELANJAAN
  // ==========================================================================
  function openTrimModal() {
    const modal = document.getElementById('modalTrimBackdrop');
    const list = document.getElementById('trimSuggestionsList');

    const sorted = [...appState.cart].sort((a, b) => {
      const isAPokok = a.category === 'Bahan Pokok';
      const isBPokok = b.category === 'Bahan Pokok';
      if (isAPokok && !isBPokok) return 1;
      if (!isAPokok && isBPokok) return -1;

      const totalA = calculateDiscount(a.price, a.discountRaw).finalUnitPrice * a.qty;
      const totalB = calculateDiscount(b.price, b.discountRaw).finalUnitPrice * b.qty;
      return totalB - totalA;
    });

    let html = '';
    sorted.forEach(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      const lineTotal = disc.finalUnitPrice * item.qty;

      html += `
        <div class="trim-cell-neo">
          <div>
            <strong style="font-family:var(--font-display); font-size:0.82rem; color:#ffffff; display:block;">${escapeHtml(item.name)}</strong>
            <small style="font-family:var(--font-mono); color:var(--text-muted); font-size:0.68rem;">${item.qty} ${escapeHtml(item.unit)} • Rp ${formatNumber(lineTotal)}</small>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="neo-pill-btn" onclick="window.reduceItemFromTrim('${item.id}')">
              -1 Qty
            </button>
            <button class="neo-pill-btn" style="color:var(--status-danger);" onclick="window.removeItemFromTrim('${item.id}')">
              Batal
            </button>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  window.reduceItemFromTrim = function (id) {
    window.changeItemQty(id, -1);
    openTrimModal();
  };

  window.removeItemFromTrim = function (id) {
    window.deleteCartItem(id);
    openTrimModal();
  };

  // ==========================================================================
  // CHECKOUT & RIWAYAT (F-06)
  // ==========================================================================
  function handleCheckout() {
    if (appState.cart.length === 0) {
      showToast('Keranjang masih kosong', 'warning');
      return;
    }

    let grandTotal = 0;
    let totalSaved = 0;
    const receiptItems = appState.cart.map(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      const lineTotal = disc.finalUnitPrice * item.qty;
      grandTotal += lineTotal;
      totalSaved += disc.savedPerUnit * item.qty;
      updateMasterDatabaseItem(item.name, item.category, item.unit, item.price);

      return {
        name: item.name,
        category: item.category,
        unit: item.unit,
        qty: item.qty,
        originalPrice: item.price,
        finalUnitPrice: disc.finalUnitPrice,
        discountRaw: item.discountRaw,
        lineTotal
      };
    });

    const newReceipt = {
      id: 'rcp-' + Date.now(),
      date: new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      budgetLimit: appState.budgetLimit,
      grandTotal,
      totalSaved,
      itemCount: receiptItems.length,
      items: receiptItems
    };

    appState.history.unshift(newReceipt);
    appState.cart = [];

    saveHistory();
    saveCart();
    saveMaster();

    renderCart();

    // Auto push receipt to Supabase if connected
    if (appState.supabaseClient) {
      appState.supabaseClient.from('receipts').insert({
        id: newReceipt.id,
        date_label: newReceipt.date,
        budget_limit: newReceipt.budgetLimit,
        grand_total: newReceipt.grandTotal,
        total_saved: newReceipt.totalSaved,
        item_count: newReceipt.itemCount,
        items: newReceipt.items,
        created_at: new Date().toISOString()
      }).then(() => {});
    }

    if (window.confetti) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.85 },
        colors: ['#d4ff00', '#ffffff', '#10b981']
      });
    }

    AudioEngine.playSuccess();
    showToast('Belanja selesai! Struk digital disimpan.', 'success');
    showReceiptModal(newReceipt.id);
  }

  function renderHistoryList() {
    const container = document.getElementById('historyListContainer');
    if (!container) return;

    if (appState.history.length === 0) {
      container.innerHTML = `
        <div class="neo-empty-box">
          <div class="empty-glyph">🧾</div>
          <h3>Belum Ada Struk Riwayat</h3>
          <p>Setelah belanja selesai, klik "Selesaikan Belanja" untuk menyimpan struk digital di sini.</p>
        </div>
      `;
      return;
    }

    let html = '';
    appState.history.forEach(rcp => {
      html += `
        <div class="neo-history-card">
          <div class="h-top">
            <span class="h-date">
              <i data-lucide="calendar"></i> ${escapeHtml(rcp.date)}
            </span>
            <span class="h-price">Rp ${formatNumber(rcp.grandTotal)}</span>
          </div>
          <div class="h-sub">
            ${rcp.itemCount} Jenis • Hemat Promo: Rp ${formatNumber(rcp.totalSaved)}
          </div>
          <button class="btn-neo-secondary full-w" onclick="window.showReceiptModal('${rcp.id}')">
            <i data-lucide="file-text"></i> BUKA STRUK DIGITAL
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  window.showReceiptModal = function (receiptId) {
    const rcp = appState.history.find(h => h.id === receiptId);
    if (!rcp) return;

    const body = document.getElementById('receiptModalBody');
    let itemsHtml = '';

    rcp.items.forEach(item => {
      itemsHtml += `
        <div class="receipt-line-split">
          <span>${escapeHtml(item.name)} (${item.qty} ${escapeHtml(item.unit)})</span>
          <span>Rp ${formatNumber(item.lineTotal)}</span>
        </div>
      `;
    });

    body.innerHTML = `
      <div class="receipt-paper-slip">
        <div class="receipt-slip-top">
          <div class="receipt-market-name">SUPERMARKET GROSIR</div>
          <small>Struk Belanja Mandiri Kos Rian</small>
          <div class="receipt-meta-row">${escapeHtml(rcp.date)}</div>
        </div>
        <div class="receipt-lines-list">
          ${itemsHtml}
        </div>
        <div class="receipt-slip-total">
          <span>TOTAL:</span>
          <span>Rp ${formatNumber(rcp.grandTotal)}</span>
        </div>
        <div class="receipt-savings-banner">
          Hemat Promo: Rp ${formatNumber(rcp.totalSaved)}
        </div>
      </div>
    `;

    document.getElementById('modalReceiptBackdrop').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  };

  // ==========================================================================
  // MASTER PRICE DATABASE LIST
  // ==========================================================================
  function renderMasterList(search = '') {
    const container = document.getElementById('masterItemsList');
    if (!container) return;

    let items = appState.masterItems;
    if (search) {
      items = items.filter(i => i.name.toLowerCase().includes(search));
    }

    if (items.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:14px; color:var(--text-muted); font-size:0.75rem;">Belum ada acuan harga.</div>';
      return;
    }

    let html = '';
    items.forEach(item => {
      html += `
        <div class="neo-master-row">
          <div>
            <div class="m-name">${escapeHtml(item.name)}</div>
            <div class="m-spec">${escapeHtml(item.category)} • Satuan: ${escapeHtml(item.unit)}</div>
          </div>
          <div style="text-align:right;">
            <div class="m-price">Rp ${formatNumber(item.lastPrice)}</div>
            <small style="font-family:var(--font-mono); color:var(--text-muted); font-size:0.62rem;">Harga Acuan</small>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================================================
  // BUDGET TAB BREAKDOWN
  // ==========================================================================
  function renderBudgetBreakdown() {
    document.getElementById('inputBudgetSetting').value = appState.budgetLimit;
    const container = document.getElementById('categoryBreakdownList');
    if (!container) return;

    const catTotals = {};
    let grandTotal = 0;

    appState.cart.forEach(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      const line = disc.finalUnitPrice * item.qty;
      catTotals[item.category] = (catTotals[item.category] || 0) + line;
      grandTotal += line;
    });

    const categories = ['Bahan Pokok', 'Makanan & Minuman', 'Kebersihan', 'Dapur & Bumbu', 'Lainnya'];
    let html = '';
    categories.forEach(cat => {
      const total = catTotals[cat] || 0;
      const pct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0;

      html += `
        <div class="cat-neo-row">
          <div class="cat-neo-meta">
            <span><strong>${cat}</strong> (${pct}%)</span>
            <span>Rp ${formatNumber(total)}</span>
          </div>
          <div class="cat-track-neo">
            <div class="cat-fill-neo" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================================================
  // TAB 2: PROMO & VALUE COMPARATOR TOOL
  // ==========================================================================
  function initComparatorTool() {
    const calcOrigPrice = document.getElementById('calcOrigPrice');
    const calcDiscountInput = document.getElementById('calcDiscountInput');

    function runPromoCalc() {
      const price = parseFloat(calcOrigPrice.value) || 0;
      const discStr = calcDiscountInput.value;
      const res = calculateDiscount(price, discStr);

      document.getElementById('calcFinalPrice').textContent = `Rp ${formatNumber(res.finalUnitPrice)}`;
      const savedPct = price > 0 ? ((res.savedPerUnit / price) * 100).toFixed(1) : 0;
      document.getElementById('calcSavedAmount').textContent = `Hemat Rp ${formatNumber(res.savedPerUnit)} (${savedPct}%)`;
      document.getElementById('calcFormulaBreakdown').textContent = res.formulaText;
    }

    if (calcOrigPrice && calcDiscountInput) {
      calcOrigPrice.addEventListener('input', runPromoCalc);
      calcDiscountInput.addEventListener('input', runPromoCalc);
      calcOrigPrice.value = '100000';
      calcDiscountInput.value = '50+20';
      runPromoCalc();
    }

    // Unit Price Comparison
    const cmpSizeA = document.getElementById('cmpSizeA');
    const cmpUnitA = document.getElementById('cmpUnitA');
    const cmpPriceA = document.getElementById('cmpPriceA');
    const cmpSizeB = document.getElementById('cmpSizeB');
    const cmpUnitB = document.getElementById('cmpUnitB');
    const cmpPriceB = document.getElementById('cmpPriceB');

    function runUnitComparison() {
      const sizeA = parseFloat(cmpSizeA.value) || 1;
      const priceA = parseFloat(cmpPriceA.value) || 0;
      const sizeB = parseFloat(cmpSizeB.value) || 1;
      const priceB = parseFloat(cmpPriceB.value) || 0;

      let normSizeA = sizeA;
      if (cmpUnitA.value === 'ml' || cmpUnitA.value === 'gram') normSizeA = sizeA / 1000;

      let normSizeB = sizeB;
      if (cmpUnitB.value === 'ml' || cmpUnitB.value === 'gram') normSizeB = sizeB / 1000;

      const unitCostA = normSizeA > 0 ? priceA / normSizeA : 0;
      const unitCostB = normSizeB > 0 ? priceB / normSizeB : 0;

      const unitName = (cmpUnitA.value === 'ml' || cmpUnitA.value === 'liter') ? 'Liter' :
                       (cmpUnitA.value === 'gram' || cmpUnitA.value === 'kg') ? 'Kg' : 'pcs';

      document.getElementById('unitCostA').textContent = `Rp ${formatNumber(Math.round(unitCostA))} / ${unitName}`;
      document.getElementById('unitCostB').textContent = `Rp ${formatNumber(Math.round(unitCostB))} / ${unitName}`;

      const title = document.getElementById('cmpVerdictTitle');
      const desc = document.getElementById('cmpVerdictDesc');

      if (unitCostA > 0 && unitCostB > 0) {
        if (unitCostA < unitCostB) {
          const diff = unitCostB - unitCostA;
          const pct = ((diff / unitCostB) * 100).toFixed(1);
          title.textContent = 'Opsi A Lebih Hemat!';
          desc.textContent = `Hemat Rp ${formatNumber(Math.round(diff))}/${unitName} (${pct}% lebih murah).`;
        } else if (unitCostB < unitCostA) {
          const diff = unitCostA - unitCostB;
          const pct = ((diff / unitCostA) * 100).toFixed(1);
          title.textContent = 'Opsi B Lebih Hemat!';
          desc.textContent = `Hemat Rp ${formatNumber(Math.round(diff))}/${unitName} (${pct}% lebih murah).`;
        } else {
          title.textContent = 'Nilai Ekonomis Sama';
          desc.textContent = 'Harga per satuan kedua opsi persis sama.';
        }
      }
    }

    [cmpSizeA, cmpUnitA, cmpPriceA, cmpSizeB, cmpUnitB, cmpPriceB].forEach(el => {
      if (el) el.addEventListener('input', runUnitComparison);
    });
    runUnitComparison();
  }

  window.setCalcDiscount = function (str) {
    const input = document.getElementById('calcDiscountInput');
    if (input) {
      input.value = str;
      input.dispatchEvent(new Event('input'));
      AudioEngine.playTap();
    }
  };

  // ==========================================================================
  // DATA EXPORT / IMPORT / RESET
  // ==========================================================================
  function exportDataJson() {
    const data = {
      cart: appState.cart,
      budgetLimit: appState.budgetLimit,
      history: appState.history,
      masterItems: appState.masterItems,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-grocery-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data berhasil diekspor', 'success');
  }

  function importDataJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (data.cart) appState.cart = data.cart;
        if (data.budgetLimit) appState.budgetLimit = data.budgetLimit;
        if (data.history) appState.history = data.history;
        if (data.masterItems) appState.masterItems = data.masterItems;

        saveCart();
        saveBudget();
        saveHistory();
        saveMaster();
        renderAll();
        showToast('Data berhasil diimpor', 'success');
      } catch (err) {
        showToast('Gagal membaca file JSON', 'danger');
      }
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (confirm('Reset seluruh data ke pengaturan awal?')) {
      appState.cart = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_CART));
      appState.budgetLimit = 350000;
      appState.history = [];
      appState.masterItems = JSON.parse(JSON.stringify(DEFAULT_MASTER_ITEMS));

      saveCart();
      saveBudget();
      saveHistory();
      saveMaster();
      renderAll();
      AudioEngine.playSuccess();
      showToast('Data direset', 'success');
    }
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS & HELPERS
  // ==========================================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconName = type === 'success' ? 'check' :
                     type === 'danger' ? 'alert-triangle' :
                     type === 'warning' ? 'alert-circle' : 'info';

    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2500);
  }

  function formatNumber(num) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('id-ID');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderAll() {
    renderCart();
    renderBudgetBreakdown();
    renderHistoryList();
    renderMasterList();
  }

})();
