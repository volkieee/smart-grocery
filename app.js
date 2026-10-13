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
    SOUND: 'smart_grocery_sound_enabled',
    PLANNER: 'smart_grocery_planner'
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

  // Default Shopping Planner (Kebutuhan yang Direncanakan Sebelum ke Supermarket)
  const DEFAULT_SAMPLE_PLANNER = [
    { id: 'plan-1', name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', qty: 1, isPurchased: true, createdAt: Date.now() - 3600000 },
    { id: 'plan-2', name: 'Minyak Goreng Sania 2L', category: 'Bahan Pokok', unit: 'pouch', qty: 2, isPurchased: true, createdAt: Date.now() - 3000000 },
    { id: 'plan-3', name: 'Telur Ayam Negeri 1kg', category: 'Bahan Pokok', unit: 'kg', qty: 1, isPurchased: true, createdAt: Date.now() - 2400000 },
    { id: 'plan-4', name: 'Sabun Pembersih Lantai 750ml', category: 'Kebersihan', unit: 'botol', qty: 1, isPurchased: true, createdAt: Date.now() - 1800000 },
    { id: 'plan-5', name: 'Mie Instan Goreng Spesial', category: 'Makanan & Minuman', unit: 'pcs', qty: 10, isPurchased: true, createdAt: Date.now() - 1200000 },
    { id: 'plan-6', name: 'Kecap Manis Refill 520ml', category: 'Dapur & Bumbu', unit: 'pouch', qty: 1, isPurchased: false, createdAt: Date.now() - 600000 },
    { id: 'plan-7', name: 'Pasta Gigi Herbal 190g', category: 'Kebersihan', unit: 'pcs', qty: 1, isPurchased: false, createdAt: Date.now() - 300000 }
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
      isPlanned: true,
      inPhysicalCart: true,
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
      isPlanned: true,
      inPhysicalCart: true,
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
      isPlanned: true,
      inPhysicalCart: true,
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
      isPlanned: true,
      inPhysicalCart: false,
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
      isPlanned: true,
      inPhysicalCart: false,
      createdAt: Date.now() - 1200000
    }
  ];

  // --- STATE MANAGEMENT ---
  let appState = {
    cart: [],
    planner: [],
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
      } catch (e) { }
    },
    playScan() {
      if (!appState.soundEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1900, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
        if (navigator.vibrate) {
          navigator.vibrate([40, 20, 40]);
        }
      } catch (e) { }
    },
    playCashier() {
      if (!appState.soundEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [987.77, 1318.51, 1975.53].forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          gain.gain.setValueAtTime(0.18, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.25);
        });
      } catch (e) { }
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
      } catch (e) { }
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
      } catch (e) { }
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
    initShelfAdderTray();
    initBarcodeScannerModule();
    initStoreSelectorModule();
    renderAll();
    initComparatorTool();
    initDockAutoHide();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- AUTO-HIDE BOTTOM DOCK ON SCROLL ---
  function initDockAutoHide() {
    const scrollArea = document.querySelector('.neo-main-content');
    const dock = document.querySelector('.neo-bottom-dock');
    if (!scrollArea || !dock) return;

    let lastScrollY = 0;
    let ticking = false;

    scrollArea.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = scrollArea.scrollTop;
          const delta = currentY - lastScrollY;

          // Selalu tampil di paling atas
          if (currentY <= 10) {
            dock.classList.remove('dock-hidden');
          } else if (delta > 5) {
            // Scroll ke BAWAH → sembunyikan dock
            dock.classList.add('dock-hidden');
          } else if (delta < -5) {
            // Scroll ke ATAS → tampilkan dock
            dock.classList.remove('dock-hidden');
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  // --- STORAGE ---
  function loadDataFromStorage() {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      const savedPlanner = localStorage.getItem(STORAGE_KEYS.PLANNER);
      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const savedMaster = localStorage.getItem(STORAGE_KEYS.MASTER);
      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);

      appState.cart = savedCart ? JSON.parse(savedCart) : DEFAULT_SAMPLE_CART;
      appState.planner = savedPlanner ? JSON.parse(savedPlanner) : DEFAULT_SAMPLE_PLANNER;
      appState.budgetLimit = savedBudget ? Number(savedBudget) : 350000;
      appState.history = savedHistory ? JSON.parse(savedHistory) : [];
      appState.masterItems = savedMaster ? JSON.parse(savedMaster) : DEFAULT_MASTER_ITEMS;
      appState.soundEnabled = savedSound !== null ? savedSound === 'true' : true;
      const savedStore = localStorage.getItem('smart_grocery_store');
      appState.activeStore = savedStore || 'GrandLucky SCBD';
      const storeEl = document.getElementById('activeStoreName');
      if (storeEl) storeEl.textContent = appState.activeStore;

      appState.supabaseUrl = SUPABASE_CONFIG.URL;
      appState.supabaseKey = SUPABASE_CONFIG.KEY;
    } catch (e) {
      appState.cart = DEFAULT_SAMPLE_CART;
      appState.planner = DEFAULT_SAMPLE_PLANNER;
      appState.budgetLimit = 350000;
      appState.masterItems = DEFAULT_MASTER_ITEMS;
      appState.activeStore = 'GrandLucky SCBD';
      appState.supabaseUrl = SUPABASE_CONFIG.URL;
      appState.supabaseKey = SUPABASE_CONFIG.KEY;
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(appState.cart));
  }
  function savePlanner() {
    localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(appState.planner));
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
        dot.title = 'Status: Sinkronisasi Aktif (Tersinkron di Semua HP)';
      }
      if (tag) tag.textContent = 'ONLINE';
      if (cloudIcon) cloudIcon.classList.add('connected');
      if (cloudTitle) cloudTitle.textContent = 'Data Belanja Tersinkron';
      if (cloudSub) cloudSub.textContent = 'Data belanja Anda otomatis tersimpan & sinkron di semua HP Anda.';
    } else {
      if (dot) {
        dot.classList.remove('connected');
        dot.title = 'Status: Mode Offline (Tersimpan di Ponsel)';
      }
      if (tag) tag.textContent = 'OFFLINE';
      if (cloudIcon) cloudIcon.classList.remove('connected');
      if (cloudTitle) cloudTitle.textContent = 'Tersimpan di Ponsel';
      if (cloudSub) cloudSub.textContent = 'Data aman tersimpan di penyimpanan perangkat ini.';
    }

    if (window.lucide) lucide.createIcons();
  }

  async function pushDataToSupabase(silent = false) {
    if (!appState.supabaseClient) {
      if (!silent) showToast('Koneksi sinkronisasi belum aktif!', 'warning');
      return;
    }

    try {
      if (!silent) showToast('Menyimpan data belanja...', 'info');

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
        showToast('Seluruh data belanja tersimpan aman!', 'success');
      }
    } catch (err) {
      console.error('Push error:', err);
      if (!silent) showToast('Gagal menyimpan data: ' + (err.message || 'Koneksi terputus'), 'danger');
    }
  }

  async function pullDataFromSupabase(silent = false) {
    if (!appState.supabaseClient) {
      if (!silent) showToast('Koneksi sinkronisasi belum aktif!', 'warning');
      return;
    }

    try {
      if (!silent) showToast('Menyinkronkan data belanja...', 'info');

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
        showToast('Data belanja berhasil disinkronkan!', 'success');
      }
    } catch (err) {
      console.error('Pull error:', err);
      if (!silent) showToast('Gagal menyinkronkan data: ' + (err.message || 'Error'), 'danger');
    }
  }

  async function syncCloudData() {
    if (!appState.supabaseClient) {
      initSupabaseClient();
    }
    if (!appState.supabaseClient) {
      showToast('Koneksi sinkronisasi belum aktif', 'danger');
      return;
    }
    AudioEngine.playTap();
    showToast('Menyinkronkan antar perangkat...', 'info');
    await pushDataToSupabase();
    await pullDataFromSupabase();
    showToast('Semua data belanja sudah sinkron!', 'success');
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
        text: `↑ +Rp ${formatNumber(diff)} (+${pct}%)`,
        icon: 'arrow-up',
        badgeClass: 'up'
      };
    } else if (diff < 0) {
      return {
        status: 'down',
        text: `↓ -Rp ${formatNumber(Math.abs(diff))} (${pct}%)`,
        icon: 'arrow-down',
        badgeClass: 'down'
      };
    } else {
      return {
        status: 'stable',
        text: `= Tetap (Rp ${formatNumber(cur)})`,
        icon: 'equal',
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
    const hudPercentEl = document.getElementById('budgetPercentLabel');
    if (hudPercentEl) hudPercentEl.textContent = `${percentage.toFixed(0)}% CAP`;

    const hudSavingsEl = document.getElementById('hudTotalSavingsText');
    if (hudSavingsEl) hudSavingsEl.textContent = `Hemat Rp ${formatNumber(totalSaved)}`;

    const hudSubtickMax = document.getElementById('hudSubtickMax');
    if (hudSubtickMax) hudSubtickMax.textContent = `Max ${formatNumber(Math.round(limit / 1000))}k`;

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

    // Dock Badges & Sticky Checkout Total
    const stickyGrandTotal = document.getElementById('cartBottomGrandTotal');
    if (stickyGrandTotal) stickyGrandTotal.textContent = formatNumber(totalSpent);

    const navCartBadge = document.getElementById('navCartBadge');
    if (navCartBadge) navCartBadge.textContent = appState.cart.length;

    const countAll = document.getElementById('countAll');
    if (countAll) countAll.textContent = appState.cart.length;

    // Macro Allocator & Budget Screen Sync
    const planSpend = document.getElementById('budgetCurrentSpend');
    if (planSpend) planSpend.textContent = `Rp ${formatNumber(totalSpent)}`;
    const planRemain = document.getElementById('budgetRemainingAmount');
    if (planRemain) planRemain.textContent = `Rp ${formatNumber(Math.max(0, remaining))}`;
    const planMeter = document.getElementById('budgetHealthMeter');
    if (planMeter) planMeter.style.width = `${clampedPercentage}%`;

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
    const headerCount = document.getElementById('cartHeaderPillCount');
    if (headerCount) headerCount.textContent = `${appState.cart.length} Produk`;

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
      const isChecked = !!item.inPhysicalCart;

      html += `
        <div class="neo-card-row ${isChecked ? 'in-physical-cart' : ''}" data-id="${item.id}">
          <div class="card-top-header">
            <div style="display:flex; align-items:center; gap:6px;">
              <button type="button" class="cart-check-btn ${isChecked ? 'checked' : ''}" onclick="window.toggleItemInCart('${item.id}')" title="Centang jika sudah di troli fisik">
                <i data-lucide="check"></i>
              </button>
              <span class="cat-mono-tag">${escapeHtml(item.category)}</span>
            </div>
            <div class="card-action-mini">
              <button class="btn-ico-subtle" onclick="window.editCartItem('${item.id}')" title="Edit">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-ico-subtle trash" onclick="window.deleteCartItem('${item.id}')" title="Hapus">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>

          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="card-item-title">${escapeHtml(item.name)}</h4>
              <span class="card-item-spec">Kemasan: ${escapeHtml(item.unit)}</span>
            </div>
            <!-- Status Sesuai Rencana vs Impulsif -->
            <div>
              ${item.isPlanned !== false ? `
                <span class="inline-flex items-center gap-1 font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span class="material-symbols-outlined text-[12px]">check_circle</span>
                  <span>Sesuai Rencana</span>
                </span>
              ` : `
                <span class="inline-flex items-center gap-1 font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200" title="Barang ini dimasukkan di luar daftar Shopping Planner">
                  <span class="material-symbols-outlined text-[12px]">warning</span>
                  <span>Di Luar Rencana</span>
                </span>
              `}
            </div>
          </div>

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
              <button type="button" class="stepper-tap-btn ${item.qty === 1 ? 'is-trash' : ''}" onclick="window.changeItemQty('${item.id}', -1)" title="${item.qty === 1 ? 'Hapus Barang' : 'Kurangi'}">
                <i data-lucide="${item.qty === 1 ? 'trash-2' : 'minus'}"></i>
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

  // Toggle Physical Cart Status
  window.toggleItemInCart = function (id) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;
    item.inPhysicalCart = !item.inPhysicalCart;
    AudioEngine.playTap();
    saveCart();
    renderCart();
  };

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
      }, { onConflict: 'name' }).then(() => { });
    }
  }

  // ==========================================================================
  // NAVIGATION & TABS
  // ==========================================================================
  function setupNavigation() {
    const navButtons = document.querySelectorAll('.dock-tab');
    const panes = document.querySelectorAll('.tab-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');
        if (!targetTabId) return;

        // Reset semua tombol nav ke gaya inaktif
        navButtons.forEach(b => {
          b.classList.remove('active', 'bg-primary', 'text-on-primary', 'shadow-[0_4px_16px_rgba(0,29,15,0.2)]');
          b.classList.add('text-on-surface-variant');
        });

        // Aktifkan tombol yang dipilih
        btn.classList.add('active', 'bg-primary', 'text-on-primary', 'shadow-[0_4px_16px_rgba(0,29,15,0.2)]');
        btn.classList.remove('text-on-surface-variant');

        // Toggle pane tampilan
        panes.forEach(p => {
          p.classList.remove('active');
          p.classList.add('hidden');
        });

        const targetPane = document.getElementById(targetTabId);
        if (targetPane) {
          targetPane.classList.add('active');
          targetPane.classList.remove('hidden');
        }

        AudioEngine.playTap();

        // Screen 2 Stitch: Scan Barcode & Promo Calculator
        if (targetTabId === 'tabScan') {
          renderBarcodePresets();
          startCameraScanner();
          if (!currentScannedItem && BARCODE_CATALOG.length > 0) {
            onBarcodeDetected(BARCODE_CATALOG[0].barcode, false);
          }
        } else {
          // Matikan kamera saat meninggalkan tab scan
          stopCameraScanner();
        }

        if (targetTabId === 'tabBudget') {
          renderBudgetBreakdown();
        } else if (targetTabId === 'tabHistory') {
          renderHistoryList();
          renderMasterList();
        } else if (targetTabId === 'tabCart') {
          renderCart();
        }

        if (window.lucide) lucide.createIcons();
      });
    });

    // Sub tabs in History (Screen 1 Stitch)
    const subTabHistory = document.getElementById('btnSubHistory');
    const subTabMaster = document.getElementById('btnSubMaster');
    const subViewHistory = document.getElementById('subViewHistory');
    const subViewMaster = document.getElementById('subViewMaster');

    if (subTabHistory && subTabMaster) {
      subTabHistory.addEventListener('click', () => {
        subTabHistory.classList.add('active', 'bg-primary-container', 'text-on-primary');
        subTabHistory.classList.remove('text-on-surface-variant');
        subTabMaster.classList.remove('active', 'bg-primary-container', 'text-on-primary');
        subTabMaster.classList.add('text-on-surface-variant');
        if (subViewHistory) subViewHistory.classList.remove('hidden');
        if (subViewMaster) subViewMaster.classList.add('hidden');
        AudioEngine.playTap();
        renderHistoryList();
      });

      subTabMaster.addEventListener('click', () => {
        subTabMaster.classList.add('active', 'bg-primary-container', 'text-on-primary');
        subTabMaster.classList.remove('text-on-surface-variant');
        subTabHistory.classList.remove('active', 'bg-primary-container', 'text-on-primary');
        subTabHistory.classList.add('text-on-surface-variant');
        if (subViewMaster) subViewMaster.classList.remove('hidden');
        if (subViewHistory) subViewHistory.classList.add('hidden');
        AudioEngine.playTap();
        renderMasterList();
      });
    }

    // Sub-mode tabs in Scan Screen (Screen 2 Stitch)
    const btnModeBarcode = document.getElementById('tab-scan-barcode');
    const btnModeMulti = document.getElementById('tab-scan-multibuy');
    const btnModeManual = document.getElementById('tab-scan-manual');

    if (btnModeBarcode && btnModeMulti && btnModeManual) {
      const modeButtons = [btnModeBarcode, btnModeMulti, btnModeManual];
      modeButtons.forEach(mBtn => {
        mBtn.addEventListener('click', () => {
          modeButtons.forEach(b => {
            b.classList.remove('active', 'bg-primary-container', 'text-on-primary', 'shadow-md');
            b.classList.add('text-on-surface-variant');
          });
          mBtn.classList.add('active', 'bg-primary-container', 'text-on-primary', 'shadow-md');
          mBtn.classList.remove('text-on-surface-variant');
          AudioEngine.playTap();

          if (mBtn.id === 'tab-scan-multibuy') {
            openComparatorToolModal();
          } else if (mBtn.id === 'tab-scan-manual') {
            openItemModal();
          }
        });
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

    // Header Utility Buttons
    const btnCompareHeader = document.getElementById('btnQuickCompareHeader');
    if (btnCompareHeader) {
      btnCompareHeader.addEventListener('click', () => {
        document.getElementById('navBtnCompare').click();
      });
    }

    const btnScanHeader = document.getElementById('btnOpenScannerHeader');
    if (btnScanHeader) {
      btnScanHeader.addEventListener('click', () => {
        const navScan = document.getElementById('navBtnScan');
        if (navScan) navScan.click();
      });
    }

    const btnGoToScanTab = document.getElementById('btnGoToScanTab');
    if (btnGoToScanTab) {
      btnGoToScanTab.addEventListener('click', () => {
        const navScan = document.getElementById('navBtnScan');
        if (navScan) navScan.click();
      });
    }

    const btnCheckoutSticky = document.getElementById('btnCheckoutCashierSticky');
    if (btnCheckoutSticky) {
      btnCheckoutSticky.addEventListener('click', handleCheckout);
    }

    const btnStore = document.getElementById('btnStoreSelector');
    if (btnStore) {
      btnStore.addEventListener('click', openStoreModal);
    }
    const btnCloseStore = document.getElementById('btnCloseStoreModal');
    if (btnCloseStore) {
      btnCloseStore.addEventListener('click', closeStoreModal);
    }

    // Scanner Modals Close & Submit
    const btnCloseScan = document.getElementById('btnCloseScannerModal');
    if (btnCloseScan) {
      btnCloseScan.addEventListener('click', closeBarcodeScanner);
    }
    const btnCloseScanRes = document.getElementById('btnCloseScanResultModal');
    if (btnCloseScanRes) {
      btnCloseScanRes.addEventListener('click', () => {
        document.getElementById('modalScanResultBackdrop').classList.add('hidden');
      });
    }
    const btnCancelScanRes = document.getElementById('btnCancelScanResult');
    if (btnCancelScanRes) {
      btnCancelScanRes.addEventListener('click', () => {
        document.getElementById('modalScanResultBackdrop').classList.add('hidden');
        openBarcodeScanner();
      });
    }
    const btnApplyScan = document.getElementById('btnApplyScanToCart');
    if (btnApplyScan) {
      btnApplyScan.addEventListener('click', applyScannedItemToCart);
    }

    // Flashlight & Flip Camera Toggles
    const btnFlash = document.getElementById('btnScannerFlash');
    if (btnFlash) {
      btnFlash.addEventListener('click', toggleScannerTorch);
    }
    const btnFlip = document.getElementById('btnScannerFlip');
    if (btnFlip) {
      btnFlip.addEventListener('click', flipScannerCamera);
    }

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

    // Node.js & TypeScript Cloud Insights
    const btnRunNode = document.getElementById('btnRunNodeAnalytics');
    if (btnRunNode) {
      btnRunNode.addEventListener('click', requestNodeSmartInsights);
    }

    // Shopping Planner & Shelf Price Modal Handlers
    const formPlan = document.getElementById('formAddPlannerItem');
    if (formPlan) formPlan.addEventListener('submit', addPlannerItemFromForm);

    const formShelf = document.getElementById('formShelfPriceModal');
    if (formShelf) formShelf.addEventListener('submit', applyShelfPriceModalSubmit);

    const inputShelf = document.getElementById('inputShelfPrice');
    if (inputShelf) {
      inputShelf.addEventListener('input', () => {
        const val = parseFloat(inputShelf.value) || 0;
        const last = currentShelfModalPlannerItem ?
          (appState.masterItems.find(m => m.name.toLowerCase() === currentShelfModalPlannerItem.name.toLowerCase())?.lastPrice || 0) : 0;
        updateShelfModalFluctuation(val, last);
      });
    }

    const btnCloseShelf = document.getElementById('btnCloseShelfModal');
    if (btnCloseShelf) {
      btnCloseShelf.addEventListener('click', () => {
        document.getElementById('modalShelfPriceBackdrop').classList.add('hidden');
      });
    }

    const btnCancelShelf = document.getElementById('btnCancelShelfModal');
    if (btnCancelShelf) {
      btnCancelShelf.addEventListener('click', () => {
        document.getElementById('modalShelfPriceBackdrop').classList.add('hidden');
      });
    }

    const btnGoPlan = document.getElementById('btnGoToPlannerTab');
    if (btnGoPlan) {
      btnGoPlan.addEventListener('click', () => {
        const tabBtn = document.getElementById('navBtnBudget');
        if (tabBtn) tabBtn.click();
      });
    }

    const btnClearPlan = document.getElementById('btnClearCompletedPlanner');
    if (btnClearPlan) {
      btnClearPlan.addEventListener('click', clearCompletedPlannerItems);
    }
  }

  // ==========================================================================
  // STITCH SHELF-ADDER TRAY MODULE ("Input Cepat di Rak")
  // ==========================================================================
  let traySelectedPromo = '0';
  let traySelectedCategory = 'Bahan Pokok';

  function initShelfAdderTray() {
    const promoChips = document.querySelectorAll('.tray-promo-chip');
    promoChips.forEach(chip => {
      chip.addEventListener('click', () => {
        promoChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        traySelectedPromo = chip.getAttribute('data-promo') || '0';
        AudioEngine.playTap();
      });
    });

    const catTags = document.querySelectorAll('.tray-cat-tag');
    catTags.forEach(tag => {
      tag.addEventListener('click', () => {
        catTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        traySelectedCategory = tag.getAttribute('data-cat') || 'Bahan Pokok';
        AudioEngine.playTap();
      });
    });

    const btnScanTray = document.getElementById('btnQuickScanTray');
    if (btnScanTray) {
      btnScanTray.addEventListener('click', openBarcodeScanner);
    }

    const btnAddTray = document.getElementById('btnTrayAddToCart');
    if (btnAddTray) {
      btnAddTray.addEventListener('click', () => {
        const priceInput = document.getElementById('trayItemPrice');
        const nameInput = document.getElementById('trayItemName');
        if (!priceInput || !nameInput) return;

        const priceVal = parseFloat(priceInput.value);
        if (!priceVal || priceVal <= 0) {
          showToast('Masukkan harga di rak terlebih dahulu!', 'warning');
          priceInput.focus();
          return;
        }

        const nameVal = nameInput.value.trim() || `${traySelectedCategory} Rak`;
        const newItem = {
          id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: nameVal,
          category: traySelectedCategory,
          unit: 'pcs',
          qty: 1,
          price: priceVal,
          lastMonthPrice: priceVal,
          discountRaw: (traySelectedPromo && traySelectedPromo !== '0') ? traySelectedPromo : '',
          createdAt: Date.now(),
          inPhysicalCart: false
        };

        appState.cart.unshift(newItem);
        updateMasterDatabaseItem(newItem.name, newItem.category, newItem.unit, newItem.price);
        saveCart();
        renderCart();

        priceInput.value = '';
        nameInput.value = '';
        AudioEngine.playSuccess();
        showToast(`"${nameVal}" masuk ke troli aktif!`, 'success');
      });
    }
  }

  // ==========================================================================
  // BARCODE DATABASE & REALTIME SCANNER MODULE (STITCH SPEC)
  // ==========================================================================
  const BARCODE_CATALOG = [
    {
      barcode: '84101970',
      name: 'Olive Oil Extra Virgin 500ml',
      brand: 'Borges Mediterranean Craft • Spanyol',
      category: 'Dapur & Bumbu',
      unit: 'botol',
      unitSize: '500ml',
      price: 125000,
      lastMonthPrice: 130000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr02p4i7QikyTt3l67LStzsEpbx6b5dkONS-XcxxFFfiASKe_AU8nrJelLfQ4dUBxeIKYD4Z5whmp0swAWtI9OkCH3u-4pcEwFjzInLqNc8mlKYPg0ap0BkVxTmAWc2jYP3Gi6ERtirta3o5sY0mX9bVOny3OQpMHvJgMtH7DnZgERkymPK4DwzFOU7142FDkjCh9mmG671eqGR6eQQ6uabRMRB42aiQ1suBXwW0BVRyKQIhIYHnB1Kg',
      unitPricingDesc: 'Rp 17.000 / 100ml',
      defaultDiscounts: [
        { id: 'katalog', label: 'Diskon Katalog Mingguan (-20%)', type: 'pct', value: 20, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Member Supermarket Club (-5%)', type: 'pct', value: 5, tag: 'Member', checked: true },
        { id: 'qris', label: 'Cashback Bank QRIS (Min. 100k)', type: 'nom', value: 10000, tag: 'Bank', checked: true }
      ]
    },
    {
      barcode: '89927531',
      name: 'Susu UHT Full Cream 1L',
      brand: 'Ultra Milk Dairy Farms • Lembang',
      category: 'Makanan & Minuman',
      unit: 'pack',
      unitSize: '1 Liter',
      price: 22000,
      lastMonthPrice: 20500,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX4hERzTA6DhuC2FLnb6P2eu1QiDZdRhb3ckzupgDiGgDWA2oDsD_UcS_eHGcv-h2eu-cNQJ5xxFeSdydTZ5yqhjqeU5MtXX-Ki63qqcrzs9a7SC-BHOnMYaLDBBTYgoonbrrdGX7s--77gJclOD5G1xj5cpwgdrepmIXUuzLqyTkzOdqOWokwJGe7zUWPYTgBS0NVZoxp7xAamjtavwPLE3io_h1yfvptOUSwKRS81fXljc8EmRObiQ',
      unitPricingDesc: 'Rp 18.700 / Liter',
      defaultDiscounts: [
        { id: 'katalog', label: 'Diskon Belanja Mingguan (-15%)', type: 'pct', value: 15, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Member Club Point (-5%)', type: 'pct', value: 5, tag: 'Member', checked: false }
      ]
    },
    {
      barcode: '20019280',
      name: 'Dada Ayam Fillet Segar 500g',
      brand: 'Fresh Butcher Farm Choice',
      category: 'Bahan Pokok',
      unit: 'pack',
      unitSize: '0.51 kg',
      price: 48500,
      lastMonthPrice: 52000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzra5PPTiPJt7jEUu4_x-LkTHhYmToF-wR8nLhrRmeRSJQ6u4dTmFKkkOfiBMHMGapoMc_HU-xwxjOYuHW0ogI9-MWhWyVzilurIAhs8VL6cJsZ8tTDh-44_X__xi7jzANSEvySd5THSgFSJXhQQaRLpWlRk7GnRCa_u6pbSELveNiOXHvGP-ZR5X2EWeS-zi9_hFO4FUyFrrv7dGMU7_qpBjzLfW6jFmpOnDC5L6S5iafMWunm045PA',
      unitPricingDesc: 'Rp 95 / gram',
      defaultDiscounts: [
        { id: 'katalog', label: 'Promo Protein Segar (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89938210',
      name: 'Apel Fuji Wang Shan 1kg',
      brand: 'Fresh Import Fruit Market',
      category: 'Makanan & Minuman',
      unit: 'kg',
      unitSize: '1 kg',
      price: 38000,
      lastMonthPrice: 38000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcqp4_nHG0hMnJd8CYsRtlh0iQ9ZNX8X7tqVMXZtTktDWdvQEF8_LcKciaJxB_Esx9XmR8DGXjQRu427JEeK1CQSllJ1Iq_5lVs9vV2k5E__89zNuvl-F8lNSc2XKHgZQNIIPQdtl7zs5A5VFv-nPlwL0phATCnkHySqWTGCAWvpU-MQuOwnz2QzXLpTxxp9yhUtyTm9D6OQ2Y_dUOmXJsqlnWOvpfpA2HdJJYctiS14_XTDxzeoDwjg',
      unitPricingDesc: 'Rp 34.200 / kg',
      defaultDiscounts: [
        { id: 'katalog', label: 'Diskon Buah Segar (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Diskon Member Fresh (-5%)', type: 'pct', value: 5, tag: 'Member', checked: true }
      ]
    },
    {
      barcode: '89927753',
      name: 'Minyak Goreng Sania 2L',
      brand: 'Sania Royale Kelapa Sawit',
      category: 'Bahan Pokok',
      unit: 'pouch',
      unitSize: '2 Liter',
      price: 38000,
      lastMonthPrice: 36000,
      image: '',
      unitPricingDesc: 'Rp 17.100 / Liter',
      defaultDiscounts: [
        { id: 'katalog', label: 'Katalog Minyak Hemat (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89910023',
      name: 'Beras Ramos Super 5kg',
      brand: 'Ramos Setra Super Premium',
      category: 'Bahan Pokok',
      unit: 'pack',
      unitSize: '5 kg',
      price: 75000,
      lastMonthPrice: 72000,
      image: '',
      unitPricingDesc: 'Rp 14.250 / kg',
      defaultDiscounts: [
        { id: 'katalog', label: 'Subsidi Pokok (-5%)', type: 'pct', value: 5, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89988662',
      name: 'Indomie Goreng Spesial',
      brand: 'Indofood Rasa Legendaris',
      category: 'Makanan & Minuman',
      unit: 'pcs',
      unitSize: '85g',
      price: 3100,
      lastMonthPrice: 3100,
      image: '',
      unitPricingDesc: 'Rp 3.100 / bks',
      defaultDiscounts: [
        { id: 'katalog', label: 'Beli 5 Potongan Rp 1.000', type: 'nom', value: 200, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89923456',
      name: 'Biore Guard Body Wash 400ml',
      brand: 'Kao Biore Antibacterial Clean',
      category: 'Kebersihan',
      unit: 'pouch',
      unitSize: '400ml',
      price: 24500,
      lastMonthPrice: 22000,
      image: '',
      unitPricingDesc: 'Rp 4.900 / 100ml',
      defaultDiscounts: [
        { id: 'katalog', label: 'Promo Kebersihan Rumah (-20%)', type: 'pct', value: 20, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Member Cashback (-5%)', type: 'pct', value: 5, tag: 'Member', checked: true }
      ]
    }
  ];

  let html5QrScannerInstance = null;
  let isScannerActive = false;
  let currentCameraFacing = 'environment';
  let isTorchOn = false;
  let currentScannedItem = null;
  let scannedDiscountsState = [];

  function initBarcodeScannerModule() {
    // Initializer
  }

  function openBarcodeScanner() {
    AudioEngine.playTap();
    const modal = document.getElementById('modalScannerBackdrop');
    if (!modal) return;
    modal.classList.remove('hidden');
    renderBarcodePresets();
    startCameraScanner();
    if (window.lucide) lucide.createIcons();
  }

  function closeBarcodeScanner() {
    stopCameraScanner();
    const modal = document.getElementById('modalScannerBackdrop');
    if (modal) modal.classList.add('hidden');
  }

  async function startCameraScanner() {
    const viewContainer = document.getElementById('interactiveScannerView');
    if (!viewContainer) return;

    if (window.Html5Qrcode && !isScannerActive) {
      try {
        html5QrScannerInstance = new Html5Qrcode('interactiveScannerView');
        isScannerActive = true;
        await html5QrScannerInstance.start(
          { facingMode: currentCameraFacing },
          {
            fps: 20,
            qrbox: { width: 220, height: 160 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            onBarcodeDetected(decodedText);
          },
          () => {
            // Frame search callback
          }
        );
      } catch (err) {
        console.warn('Camera could not start:', err);
        isScannerActive = false;
        showToast('Kamera tidak dapat diakses. Gunakan simulasi barcode di bawah!', 'info');
      }
    }
  }

  async function stopCameraScanner() {
    if (html5QrScannerInstance && isScannerActive) {
      try {
        await html5QrScannerInstance.stop();
        await html5QrScannerInstance.clear();
      } catch (e) { }
      isScannerActive = false;
      html5QrScannerInstance = null;
    }
  }

  async function toggleScannerTorch() {
    if (html5QrScannerInstance && isScannerActive) {
      try {
        isTorchOn = !isTorchOn;
        await html5QrScannerInstance.applyVideoConstraints({
          advanced: [{ torch: isTorchOn }]
        });
        showToast(isTorchOn ? 'Lampu flash aktif' : 'Lampu flash mati', 'info');
      } catch (e) {
        showToast('Fitur lampu flash tidak didukung perangkat', 'warning');
      }
    } else {
      showToast('Kamera belum aktif', 'info');
    }
  }

  async function flipScannerCamera() {
    currentCameraFacing = currentCameraFacing === 'environment' ? 'user' : 'environment';
    await stopCameraScanner();
    await startCameraScanner();
  }

  function renderBarcodePresets() {
    const container = document.getElementById('scannerPresetsList');
    if (!container) return;

    let html = '';
    BARCODE_CATALOG.forEach(prod => {
      html += `
        <div class="preset-card" onclick="window.selectBarcodePreset('${prod.barcode}')" title="Klik untuk simulasi scan">
          <div class="preset-img-wrap">
            ${prod.image ? `<img src="${prod.image}" alt="${escapeHtml(prod.name)}">` : `<div style="font-size:1.6rem; color:var(--volt-main);">🛒</div>`}
            <span class="preset-unit-tag">${escapeHtml(prod.unitSize)}</span>
          </div>
          <div class="preset-title">${escapeHtml(prod.name)}</div>
          <div class="preset-price-row">
            <span>Rp ${formatNumber(prod.price)}</span>
            <span class="preset-barcode-badge">EAN:${prod.barcode}</span>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  window.selectBarcodePreset = function (barcode) {
    onBarcodeDetected(barcode);
  };

  function onBarcodeDetected(code) {
    AudioEngine.playScan();
    stopCameraScanner();
    closeBarcodeScanner();

    let found = BARCODE_CATALOG.find(p => p.barcode === code || code.includes(p.barcode));
    if (!found) {
      const inMaster = appState.masterItems.find(m => m.name.toLowerCase().includes(code.toLowerCase()));
      if (inMaster) {
        found = {
          barcode: code,
          name: inMaster.name,
          brand: 'Produk Terdaftar di Riwayat',
          category: inMaster.category,
          unit: inMaster.unit,
          unitSize: inMaster.unit,
          price: inMaster.lastPrice || 25000,
          lastMonthPrice: inMaster.lastPrice || 25000,
          image: '',
          unitPricingDesc: `Rp ${formatNumber(inMaster.lastPrice || 25000)} / ${inMaster.unit}`,
          defaultDiscounts: [
            { id: 'katalog', label: 'Promo Toko Mingguan (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
          ]
        };
      } else {
        found = {
          barcode: code,
          name: `Item Barcode #${code}`,
          brand: 'Item Supermarket',
          category: 'Bahan Pokok',
          unit: 'pcs',
          unitSize: '1 pcs',
          price: 32000,
          lastMonthPrice: 32000,
          image: '',
          unitPricingDesc: 'Rp 32.000 / pcs',
          defaultDiscounts: [
            { id: 'katalog', label: 'Diskon Rak (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
          ]
        };
      }
    }

    currentScannedItem = JSON.parse(JSON.stringify(found));
    scannedDiscountsState = JSON.parse(JSON.stringify(found.defaultDiscounts || []));
    openScanResultModal();
  }

  function openScanResultModal() {
    if (!currentScannedItem) return;

    const titleEl = document.getElementById('scanResultTitle');
    if (titleEl) titleEl.textContent = currentScannedItem.name;

    const nameEl = document.getElementById('scanProductName');
    if (nameEl) nameEl.textContent = currentScannedItem.name;

    const brandEl = document.getElementById('scanProductBrand');
    if (brandEl) brandEl.textContent = currentScannedItem.brand || 'Item Supermarket';

    const catEl = document.getElementById('scanProductCategory');
    if (catEl) catEl.textContent = `Kategori: ${currentScannedItem.category}`;

    const unitEl = document.getElementById('scanProductUnit');
    if (unitEl) unitEl.textContent = currentScannedItem.unitSize || currentScannedItem.unit;

    const priceEl = document.getElementById('scanShelfPrice');
    if (priceEl) priceEl.textContent = `Rp ${formatNumber(currentScannedItem.price)}`;

    const imgEl = document.getElementById('scanProductImg');
    if (imgEl) {
      if (currentScannedItem.image) {
        imgEl.src = currentScannedItem.image;
        imgEl.style.display = 'block';
      } else {
        imgEl.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%2322c55e" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
      }
    }

    renderScanDiscountsChecklist();
    recalculateScanFinalResult();

    const modal = document.getElementById('modalScanResultBackdrop');
    if (modal) modal.classList.remove('hidden');

    if (window.lucide) lucide.createIcons();
  }

  function renderScanDiscountsChecklist() {
    const container = document.getElementById('scanDiscountsChecklist');
    if (!container) return;

    let html = '';
    scannedDiscountsState.forEach((d, idx) => {
      let savedPreview = 0;
      if (d.type === 'pct') {
        savedPreview = currentScannedItem.price * (d.value / 100);
      } else {
        savedPreview = d.value;
      }

      const tagClass = d.tag.toLowerCase();

      html += `
        <label class="discount-item-row flex items-center justify-between p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/30 cursor-pointer hover:border-secondary transition-all">
          <div class="discount-item-left flex items-center gap-2.5">
            <input type="checkbox" id="disc_chk_${idx}" ${d.checked ? 'checked' : ''} onchange="window.toggleScanDiscount(${idx}, this.checked)"
              class="w-4 h-4 accent-secondary rounded cursor-pointer">
            <div class="discount-item-text">
              <span class="font-headline-sm text-label-md text-primary font-bold block">${escapeHtml(d.label)}</span>
              <span class="font-numeric-sm text-body-sm text-secondary font-bold">Hemat Rp ${formatNumber(savedPreview)}</span>
            </div>
          </div>
          <span class="font-label-sm text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tagClass === 'katalog' ? 'bg-secondary-fixed text-on-secondary-fixed' : tagClass === 'member' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-high text-primary'}">
            ${escapeHtml(d.tag)}
          </span>
        </label>
      `;
    });
    container.innerHTML = html;
  }

  window.toggleScanDiscount = function (idx, isChecked) {
    if (scannedDiscountsState[idx]) {
      scannedDiscountsState[idx].checked = isChecked;
      recalculateScanFinalResult();
      AudioEngine.playTap();
    }
  };

  function recalculateScanFinalResult() {
    if (!currentScannedItem) return;
    const basePrice = currentScannedItem.price;
    let currentPrice = basePrice;
    let totalDiscount = 0;
    let activeCount = 0;

    scannedDiscountsState.forEach(d => {
      if (d.checked) {
        activeCount++;
        let cut = 0;
        if (d.type === 'pct') {
          cut = currentPrice * (d.value / 100);
        } else {
          cut = d.value;
        }
        totalDiscount += cut;
        currentPrice -= cut;
      }
    });

    if (currentPrice < 0) currentPrice = 0;
    currentPrice = Math.round(currentPrice);
    totalDiscount = Math.round(totalDiscount);

    const savingsPct = basePrice > 0 ? ((totalDiscount / basePrice) * 100).toFixed(0) : 0;

    const countEl = document.getElementById('scanActiveDiscountsCount');
    if (countEl) countEl.textContent = `${activeCount} Promo Aktif`;

    const finalPriceEl = document.getElementById('scanFinalPrice');
    if (finalPriceEl) finalPriceEl.textContent = `Rp ${formatNumber(currentPrice)}`;

    const pctEl = document.getElementById('scanSavingsPercent');
    if (pctEl) pctEl.textContent = `Hemat ${savingsPct}%`;

    const nomEl = document.getElementById('scanSavingsNominal');
    if (nomEl) nomEl.textContent = `Total Hemat: Rp ${formatNumber(totalDiscount)}`;

    const unitDescEl = document.getElementById('scanUnitPriceDetail');
    if (unitDescEl) unitDescEl.textContent = currentScannedItem.unitPricingDesc || `Rp ${formatNumber(currentPrice)} / ${currentScannedItem.unit}`;

    // Wallet Impact
    let currentTotalSpent = 0;
    appState.cart.forEach(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      currentTotalSpent += disc.finalUnitPrice * item.qty;
    });
    const newTotalSpent = currentTotalSpent + currentPrice;
    const limit = appState.budgetLimit;
    const sisa = limit - newTotalSpent;

    const tagEl = document.getElementById('scanImpactTag');
    const descEl = document.getElementById('scanImpactDesc');

    if (tagEl && descEl) {
      if (sisa >= 0) {
        tagEl.textContent = 'Aman ✅';
        tagEl.className = 'font-label-sm text-label-sm text-secondary font-bold';
        descEl.innerHTML = `Budget sisa menjadi <strong class="text-primary font-semibold">Rp ${formatNumber(sisa)}</strong> dari limit Rp ${formatNumber(Math.round(limit / 1000))}k`;
      } else {
        tagEl.textContent = 'Defisit ⚠️';
        tagEl.className = 'font-label-sm text-label-sm text-error font-bold';
        descEl.innerHTML = `<span class="text-error font-medium">Melebihi budget saku sebesar <strong class="font-bold">Rp ${formatNumber(Math.abs(sisa))}</strong>!</span>`;
      }
    }
  }

  function applyScannedItemToCart() {
    if (!currentScannedItem) return;

    const basePrice = currentScannedItem.price;
    let currentPrice = basePrice;
    let totalDiscount = 0;

    scannedDiscountsState.forEach(d => {
      if (d.checked) {
        let cut = d.type === 'pct' ? currentPrice * (d.value / 100) : d.value;
        totalDiscount += cut;
        currentPrice -= cut;
      }
    });

    if (currentPrice < 0) currentPrice = 0;
    currentPrice = Math.round(currentPrice);

    const discountEffective = totalDiscount > 0 ? `${Math.round((totalDiscount / basePrice) * 100)}%` : '';

    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: currentScannedItem.name,
      category: currentScannedItem.category,
      unit: currentScannedItem.unit,
      qty: 1,
      price: currentScannedItem.price,
      lastMonthPrice: currentScannedItem.lastMonthPrice || currentScannedItem.price,
      discountRaw: discountEffective,
      barcode: currentScannedItem.barcode,
      createdAt: Date.now(),
      inPhysicalCart: true
    };

    appState.cart.unshift(newItem);
    saveCart();
    updateMasterDatabaseItem(newItem.name, newItem.category, newItem.unit, newItem.price);
    renderCart();

    AudioEngine.playSuccess();
    if (window.confetti) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#006e2f', '#6bff8f', '#ffffff']
      });
    }

    showToast(`"${newItem.name}" dimasukkan ke troli!`, 'success');

    const modal = document.getElementById('modalScanResultBackdrop');
    if (modal) modal.classList.add('hidden');

    // Alihkan otomatis ke troli agar user langsung melihat item di keranjang
    const navCartBtn = document.getElementById('navBtnCart');
    if (navCartBtn) {
      setTimeout(() => navCartBtn.click(), 400);
    }
  }

  // ==========================================================================
  // SUPERMARKET STORE SELECTOR MODULE
  // ==========================================================================
  function initStoreSelectorModule() {
    const storeButtons = document.querySelectorAll('.store-item-btn');
    storeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const storeName = btn.getAttribute('data-store');
        if (storeName) {
          selectStore(storeName);
        }
      });
    });
  }

  function openStoreModal() {
    AudioEngine.playTap();
    const modal = document.getElementById('modalStoreBackdrop');
    if (modal) modal.classList.remove('hidden');
  }

  function closeStoreModal() {
    const modal = document.getElementById('modalStoreBackdrop');
    if (modal) modal.classList.add('hidden');
  }

  function selectStore(storeName) {
    appState.activeStore = storeName;
    localStorage.setItem('smart_grocery_store', storeName);

    const activeLabel = document.getElementById('activeStoreName');
    if (activeLabel) activeLabel.textContent = storeName;

    const storeButtons = document.querySelectorAll('.store-item-btn');
    storeButtons.forEach(btn => {
      const match = btn.getAttribute('data-store') === storeName;
      btn.classList.toggle('active', match);
      const chk = btn.querySelector('.store-check-icon');
      if (chk) chk.classList.toggle('hidden', !match);
    });

    closeStoreModal();
    AudioEngine.playSuccess();
    showToast(`Lokasi diubah: ${storeName}`, 'info');
  }

  // ==========================================================================
  // NODE.JS & TYPESCRIPT CLOUD INSIGHTS SERVICE (/api/insights)
  // ==========================================================================
  async function requestNodeSmartInsights() {
    const btn = document.getElementById('btnRunNodeAnalytics');
    const container = document.getElementById('nodeAnalyticsResult');
    if (!btn || !container) return;

    if (appState.cart.length === 0) {
      showToast('Keranjang masih kosong. Tambahkan barang dulu!', 'warning');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Memeriksa Pengeluaran Belanja...';
    if (window.lucide) lucide.createIcons();
    AudioEngine.playTap();

    try {
      let insightData = null;

      // Call live Node.js Serverless Function on Vercel / local Node server
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart: appState.cart,
            budgetLimit: appState.budgetLimit
          })
        });

        if (response.ok) {
          insightData = await response.json();
        }
      } catch (networkErr) {
        // Fallback for static file preview
      }

      // If offline/preview, calculate with matching TypeScript logic
      if (!insightData) {
        let totalSpent = 0;
        appState.cart.forEach(item => {
          const disc = calculateDiscount(item.price, item.discountRaw);
          totalSpent += disc.finalUnitPrice * item.qty;
        });

        const limit = appState.budgetLimit;
        const ratio = limit > 0 ? totalSpent / limit : 0;
        const status = ratio >= 1.0 ? 'DANGER' : ratio >= 0.8 ? 'WARNING' : 'SAFE';
        const healthScore = status === 'DANGER' ? Math.max(20, Math.round(100 - (ratio - 1) * 150))
          : status === 'WARNING' ? Math.round(85 - (ratio - 0.8) * 150)
          : Math.round(100 - ratio * 20);

        const recs = [];
        if (status === 'DANGER') {
          recs.push({
            type: 'WARNING',
            title: 'Defisit Anggaran Terdeteksi',
            description: `Keranjang Anda melebihi batas dompet sebesar Rp ${Math.round(totalSpent - limit).toLocaleString('id-ID')}. Disarankan memangkas barang non-pokok.`
          });
        }
        recs.push({
          type: 'SAVINGS',
          title: 'Saran & Optimasi Belanja Pintar',
          description: `Total belanjaan Rp ${totalSpent.toLocaleString('id-ID')} dengan skor kesehatan belanja ${healthScore}/100.`
        });

        insightData = {
          status,
          healthScore,
          summary: `Keranjang dianalisis (${healthScore}/100). Status dompet: ${status}.`,
          recommendations: recs
        };
      }

      // Render Insight Box
      const scoreClass = (insightData.status || 'SAFE').toLowerCase();
      let recomHtml = '';
      (insightData.recommendations || []).forEach(r => {
        const typeClass = r.type === 'WARNING' ? 'warning' : 'savings';
        recomHtml += `
          <div class="node-recom-item ${typeClass}">
            <div class="node-recom-title">${escapeHtml(r.title)}</div>
            <div class="node-recom-desc">${escapeHtml(r.description)}</div>
          </div>
        `;
      });

      container.innerHTML = `
        <div class="node-insight-deck">
          <div class="node-score-bar">
            <div>
              <span style="font-family:var(--font-mono); font-size:0.65rem; color:var(--text-muted); display:block;">HEALTH SCORE:</span>
              <strong style="font-family:var(--font-display); font-size:1.1rem; color:#ffffff;">${insightData.healthScore}/100</strong>
            </div>
            <span class="score-badge ${scoreClass}">${insightData.status}</span>
          </div>
          <p style="font-size:0.75rem; color:var(--text-main); line-height:1.4; margin:0;">
            ${escapeHtml(insightData.summary)}
          </p>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${recomHtml}
          </div>
          <small style="font-family:var(--font-mono); font-size:0.62rem; color:var(--text-muted); text-align:right;">
            💡 Panduan belanja bijak otomatis sesuai sisa uang saku
          </small>
        </div>
      `;

      container.classList.remove('hidden');
      AudioEngine.playSuccess();
      showToast('Pemeriksaan belanjaan selesai!', 'success');
    } catch (err) {
      showToast('Gagal memeriksa belanjaan: ' + err.message, 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="refresh-cw"></i> Perbarui Analisis Cerdas';
      if (window.lucide) lucide.createIcons();
    }
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
      }).then(() => { });
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
  // SHOPPING PLANNER MODULE (MENCATAT SEBELUM KE SUPERMARKET)
  // ==========================================================================
  let currentShelfModalPlannerItem = null;

  function renderShoppingPlannerSection() {
    // 1. Render di Tab 1 (Troli: #plannerPendingItemsList)
    const shelfContainer = document.getElementById('plannerPendingItemsList');
    const pill = document.getElementById('plannerProgressPill');

    const pendingItems = appState.planner.filter(p => !p.isPurchased);
    const purchasedItems = appState.planner.filter(p => p.isPurchased);

    if (pill) {
      pill.textContent = `${purchasedItems.length}/${appState.planner.length} Terbeli`;
    }

    if (shelfContainer) {
      if (pendingItems.length === 0) {
        shelfContainer.innerHTML = `
          <div class="p-3 bg-secondary-fixed/20 rounded-2xl text-center text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-2 border border-secondary/20">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            <span>Semua kebutuhan terencana sudah dimasukkan ke troli! 🎉</span>
          </div>
        `;
      } else {
        let html = '';
        pendingItems.forEach(item => {
          const master = appState.masterItems.find(m => m.name.toLowerCase() === item.name.toLowerCase());
          const refPrice = master ? master.lastPrice : 0;

          html += `
            <div class="p-3 bg-surface-container-low rounded-2xl flex items-center justify-between gap-2 border border-outline-variant/30">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <span class="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-surface-container text-secondary">
                    ${escapeHtml(item.category)}
                  </span>
                  ${refPrice > 0 ? `<span class="text-[10px] text-on-surface-variant font-mono">Acuan bulan lalu: Rp ${formatNumber(refPrice)}</span>` : ''}
                </div>
                <h4 class="font-headline-sm text-[14px] text-primary font-bold truncate">${escapeHtml(item.name)}</h4>
                <span class="font-body-sm text-[12px] text-on-surface-variant font-medium">Kebutuhan: <strong>${item.qty} ${escapeHtml(item.unit)}</strong></span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button class="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-[12px] font-bold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer hover:bg-primary-container"
                  onclick="window.openShelfPriceModal('${item.id}')" title="Ketik harga saat menemukan di rak">
                  <span class="material-symbols-outlined text-[15px]">price_change</span>
                  <span>Input Harga Rak</span>
                </button>
              </div>
            </div>
          `;
        });
        shelfContainer.innerHTML = html;
      }
    }

    // 2. Render di Tab 3 (Shopping Planner Full List: #shoppingPlannerFullList)
    const fullContainer = document.getElementById('shoppingPlannerFullList');
    const badgeCount = document.getElementById('plannerActiveCountBadge');
    const estCostEl = document.getElementById('plannerEstimatedCostTotal');

    if (badgeCount) badgeCount.textContent = `${appState.planner.length} Item`;

    let totalEstCost = 0;
    appState.planner.forEach(p => {
      const master = appState.masterItems.find(m => m.name.toLowerCase() === p.name.toLowerCase());
      if (master) totalEstCost += master.lastPrice * p.qty;
    });

    if (estCostEl) {
      estCostEl.textContent = `Estimasi acuan belanja bulan lalu: Rp ${formatNumber(totalEstCost)}`;
    }

    if (fullContainer) {
      if (appState.planner.length === 0) {
        fullContainer.innerHTML = `
          <div class="p-4 bg-surface-container-low rounded-xl text-center text-on-surface-variant font-body-sm text-body-sm">
            Belum ada rencana kebutuhan. Gunakan form di atas untuk mencatat barang sebelum ke supermarket.
          </div>
        `;
      } else {
        let html = '';
        appState.planner.forEach(item => {
          const master = appState.masterItems.find(m => m.name.toLowerCase() === item.name.toLowerCase());
          const estPrice = master ? master.lastPrice : 0;
          const isDone = item.isPurchased;

          html += `
            <div class="p-3 bg-surface-container-low rounded-xl flex items-center justify-between gap-2 border border-outline-variant/30 ${isDone ? 'opacity-70 bg-surface-container' : ''}">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="w-6 h-6 rounded-full ${isDone ? 'bg-secondary text-white' : 'bg-surface-container-highest text-outline'} flex items-center justify-center text-[13px] font-bold">
                  ${isDone ? '✓' : '•'}
                </span>
                <div class="min-w-0">
                  <h4 class="font-headline-sm text-[14px] text-primary font-bold truncate ${isDone ? 'line-through text-outline' : ''}">${escapeHtml(item.name)}</h4>
                  <div class="flex items-center gap-2 font-body-sm text-[11px] text-on-surface-variant">
                    <span>${item.qty} ${escapeHtml(item.unit)}</span>
                    <span>•</span>
                    <span>${escapeHtml(item.category)}</span>
                    ${estPrice > 0 ? `<span>• Est. Rp ${formatNumber(estPrice * item.qty)}</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span class="font-label-sm text-[11px] font-bold px-2 py-0.5 rounded-full ${isDone ? 'bg-secondary-fixed/30 text-secondary' : 'bg-surface-container-highest text-outline'}">
                  ${isDone ? 'Sudah di Troli' : 'Direncanakan'}
                </span>
                <button class="w-7 h-7 rounded-full text-error hover:bg-red-50 flex items-center justify-center cursor-pointer"
                  onclick="window.deletePlannerItem('${item.id}')" title="Hapus dari Rencana">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          `;
        });
        fullContainer.innerHTML = html;
      }
    }
  }

  window.openShelfPriceModal = function (plannerId) {
    const item = appState.planner.find(p => p.id === plannerId);
    if (!item) return;

    currentShelfModalPlannerItem = item;
    AudioEngine.playTap();

    document.getElementById('shelfModalPlannerId').value = item.id;
    document.getElementById('shelfModalItemName').textContent = item.name;
    document.getElementById('shelfModalItemSpec').textContent = `${item.qty} ${item.unit} • ${item.category}`;

    const master = appState.masterItems.find(m => m.name.toLowerCase() === item.name.toLowerCase());
    const lastPrice = master ? master.lastPrice : 0;
    document.getElementById('shelfModalLastPriceText').textContent = lastPrice > 0 ? `Rp ${formatNumber(lastPrice)} / ${item.unit}` : 'Belum ada catatan';

    const inputPrice = document.getElementById('inputShelfPrice');
    inputPrice.value = '';
    document.getElementById('inputShelfDiscount').value = '';

    updateShelfModalFluctuation(0, lastPrice);

    document.getElementById('modalShelfPriceBackdrop').classList.remove('hidden');
    inputPrice.focus();
  };

  function updateShelfModalFluctuation(currentPrice, lastPrice) {
    const box = document.getElementById('shelfModalFluctuationBox');
    const icon = document.getElementById('shelfFluctuationIcon');
    const title = document.getElementById('shelfFluctuationText');
    const sub = document.getElementById('shelfFluctuationSub');

    if (!box || !icon || !title || !sub) return;

    if (!currentPrice || currentPrice <= 0) {
      box.className = 'p-2.5 rounded-xl bg-surface-container flex items-center gap-2';
      icon.textContent = 'query_stats';
      icon.className = 'material-symbols-outlined text-[18px] text-secondary';
      title.textContent = 'Ketik harga rak untuk melihat fluktuasi';
      sub.textContent = 'Dibandingkan dengan catatan belanja bulan lalu';
      return;
    }

    if (!lastPrice || lastPrice <= 0) {
      box.className = 'p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2 text-blue-700';
      icon.textContent = 'sparkles';
      icon.className = 'material-symbols-outlined text-[18px] text-blue-600';
      title.textContent = 'Barang Baru (Belum ada catatan bulan lalu)';
      sub.textContent = `Harga Rp ${formatNumber(currentPrice)} akan dicatat sebagai acuan`;
      return;
    }

    const diff = currentPrice - lastPrice;
    const pct = ((diff / lastPrice) * 100).toFixed(1);

    if (diff > 0) {
      box.className = 'p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700';
      icon.textContent = 'trending_up';
      icon.className = 'material-symbols-outlined text-[18px] text-red-600';
      title.textContent = `↑ Harga Naik +Rp ${formatNumber(diff)} (+${pct}%)`;
      sub.textContent = `Bulan lalu Rp ${formatNumber(lastPrice)} ➔ Sekarang Rp ${formatNumber(currentPrice)}`;
    } else if (diff < 0) {
      box.className = 'p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800';
      icon.textContent = 'trending_down';
      icon.className = 'material-symbols-outlined text-[18px] text-emerald-600';
      title.textContent = `↓ Harga Turun -Rp ${formatNumber(Math.abs(diff))} (-${Math.abs(pct)}%)`;
      sub.textContent = `Lebih hemat dari bulan lalu (Rp ${formatNumber(lastPrice)})`;
    } else {
      box.className = 'p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2 text-gray-700';
      icon.textContent = 'drag_handle';
      icon.className = 'material-symbols-outlined text-[18px] text-gray-600';
      title.textContent = `= Harga Tetap Stabil (Rp ${formatNumber(currentPrice)})`;
      sub.textContent = 'Sama persis dengan belanjaan bulan lalu';
    }
  }

  function applyShelfPriceModalSubmit(e) {
    if (e) e.preventDefault();
    if (!currentShelfModalPlannerItem) return;

    const price = parseFloat(document.getElementById('inputShelfPrice').value) || 0;
    const discountRaw = document.getElementById('inputShelfDiscount').value.trim();
    if (price <= 0) {
      showToast('Masukkan harga di rak yang valid', 'warning');
      return;
    }

    const master = appState.masterItems.find(m => m.name.toLowerCase() === currentShelfModalPlannerItem.name.toLowerCase());
    const lastPrice = master ? master.lastPrice : price;

    const newCartItem = {
      id: 'item-' + Date.now(),
      name: currentShelfModalPlannerItem.name,
      category: currentShelfModalPlannerItem.category,
      unit: currentShelfModalPlannerItem.unit,
      qty: currentShelfModalPlannerItem.qty,
      price: price,
      lastMonthPrice: lastPrice,
      discountRaw: discountRaw,
      createdAt: Date.now(),
      inPhysicalCart: true,
      isPlanned: true,
      plannerItemId: currentShelfModalPlannerItem.id
    };

    appState.cart.unshift(newCartItem);
    currentShelfModalPlannerItem.isPurchased = true;

    saveCart();
    savePlanner();
    updateMasterDatabaseItem(newCartItem.name, newCartItem.category, newCartItem.unit, price);

    document.getElementById('modalShelfPriceBackdrop').classList.add('hidden');
    renderCart();
    renderShoppingPlannerSection();

    AudioEngine.playSuccess();
    showToast(`"${newCartItem.name}" dimasukkan ke troli sesuai rencana!`, 'success');
  }

  function addPlannerItemFromForm(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('inputPlannerName');
    const catSelect = document.getElementById('selectPlannerCategory');
    const unitSelect = document.getElementById('selectPlannerUnit');
    const qtyInput = document.getElementById('inputPlannerQty');

    const name = nameInput.value.trim();
    const category = catSelect.value;
    const unit = unitSelect.value;
    const qty = parseInt(qtyInput.value, 10) || 1;

    if (!name) return;

    const newPlan = {
      id: 'plan-' + Date.now(),
      name,
      category,
      unit,
      qty,
      isPurchased: false,
      createdAt: Date.now()
    };

    appState.planner.unshift(newPlan);
    savePlanner();
    renderShoppingPlannerSection();

    nameInput.value = '';
    qtyInput.value = '1';

    AudioEngine.playTap();
    showToast(`"${name}" dicatat ke Rencana Belanja`, 'success');
  }

  window.deletePlannerItem = function (id) {
    const item = appState.planner.find(p => p.id === id);
    if (!item) return;

    appState.planner = appState.planner.filter(p => p.id !== id);
    savePlanner();
    renderShoppingPlannerSection();
    showToast(`"${item.name}" dihapus dari rencana`, 'warning');
  };

  function clearCompletedPlannerItems() {
    const prevCount = appState.planner.length;
    appState.planner = appState.planner.filter(p => !p.isPurchased);
    if (appState.planner.length < prevCount) {
      savePlanner();
      renderShoppingPlannerSection();
      showToast('Item yang sudah terbeli dibersihkan', 'info');
    }
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS & HELPERS
  // ==========================================================================
  function showToast(message, type = 'info') {
    const toast = document.getElementById('neoToast');
    const msgEl = document.getElementById('toastMessage');
    const iconEl = document.getElementById('toastIcon');

    if (toast && msgEl) {
      msgEl.textContent = message;
      toast.className = `neo-toast show ${type}`;
      if (iconEl) {
        iconEl.textContent = type === 'success' ? 'check_circle' :
          type === 'danger' ? 'error' :
            type === 'warning' ? 'warning' : 'info';
      }
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2600);
      return;
    }

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    container.appendChild(t);

    setTimeout(() => {
      t.remove();
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
    renderShoppingPlannerSection();
    renderBudgetBreakdown();
    renderHistoryList();
    renderMasterList();
  }

})();
