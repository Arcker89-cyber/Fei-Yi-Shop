/**
 * Fei Yi Shop v4 - Upload Image + Custom Categories
 */
(function() {
  'use strict';

  const CONFIG = {
    STORE_NAME: 'Fei Yi Shop',
    CART_STORAGE_KEY: 'feiyi_cart_v4',
    PRODUCTS_STORAGE_KEY: 'feiyi_products_v4',
    CATEGORIES_STORAGE_KEY: 'feiyi_categories_v4',
    LINE_MSG_URL: 'https://line.me/R/msg/text/',
    CURRENCY: '฿',
    LOCALE: 'th-TH',
    // Firebase Config
    FIREBASE: {
      apiKey: "AIzaSyCT5kSOqkWZPxuxtNWhGHKCqeaIJNPgEws",
      authDomain: "feiyi-shop.firebaseapp.com",
      projectId: "feiyi-shop",
      storageBucket: "feiyi-shop.firebasestorage.app",
      messagingSenderId: "37475395232",
      appId: "1:37475395232:web:326ec0d4299c8778f0cbc5"
    },
    // SVG placeholder
    PLACEHOLDER_IMG: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e8f4fc' width='400' height='300'/%3E%3Ctext fill='%230057A0' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E",
    PLACEHOLDER_THUMB: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='45' viewBox='0 0 60 45'%3E%3Crect fill='%23e8f4fc' width='60' height='45'/%3E%3Ctext fill='%230057A0' font-family='sans-serif' font-size='10' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo%3C/text%3E%3C/svg%3E"
  };

  // ============================================================
  // FIREBASE SERVICE
  // ============================================================
  let db = null;
  
  const FirebaseService = {
    async init() {
      if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded');
        return false;
      }
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(CONFIG.FIREBASE);
        }
        db = firebase.firestore();
        console.log('✅ Firebase connected');
        return true;
      } catch (e) {
        console.error('❌ Firebase init error:', e);
        return false;
      }
    },

    // Products
    async getProducts() {
      if (!db) return null;
      try {
        const snapshot = await db.collection('products').get();
        const products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        return products;
      } catch (e) {
        console.error('Error getting products:', e);
        return null;
      }
    },

    async saveProduct(product) {
      if (!db) return null;
      try {
        if (product.id && !product.id.startsWith('prod_')) {
          // Update existing
          await db.collection('products').doc(product.id).set(product);
        } else {
          // Add new
          const docRef = await db.collection('products').add(product);
          product.id = docRef.id;
        }
        return product;
      } catch (e) {
        console.error('Error saving product:', e);
        return null;
      }
    },

    async deleteProduct(id) {
      if (!db) return false;
      try {
        await db.collection('products').doc(id).delete();
        return true;
      } catch (e) {
        console.error('Error deleting product:', e);
        return false;
      }
    },

    async setAllProducts(products) {
      if (!db) return false;
      try {
        const batch = db.batch();
        // Delete all existing
        const snapshot = await db.collection('products').get();
        snapshot.forEach(doc => batch.delete(doc.ref));
        // Add new products
        products.forEach(p => {
          const ref = db.collection('products').doc(p.id);
          batch.set(ref, p);
        });
        await batch.commit();
        return true;
      } catch (e) {
        console.error('Error setting products:', e);
        return false;
      }
    },

    // Categories
    async getCategories() {
      if (!db) return null;
      try {
        const doc = await db.collection('settings').doc('categories').get();
        return doc.exists ? doc.data() : null;
      } catch (e) {
        console.error('Error getting categories:', e);
        return null;
      }
    },

    async saveCategories(categories) {
      if (!db) return false;
      try {
        await db.collection('settings').doc('categories').set(categories);
        return true;
      } catch (e) {
        console.error('Error saving categories:', e);
        return false;
      }
    }
  };

  // Default Categories
  const DEFAULT_CATEGORIES = {
    electric: { name: 'เครื่องมือไฟฟ้า', icon: '⚡' },
    auto: { name: 'เครื่องมือซ่อมรถ', icon: '🚗' },
    hand: { name: 'เครื่องมือช่างทั่วไป', icon: '🔧' }
  };

  // Default Products
  const DEFAULT_PRODUCTS = [
    {"id":"drill48","title":"สว่านไฟฟ้าไร้สาย 48V","price":1290,"img":"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop","category":"electric","desc":"สว่านไร้สายพลังสูง เหมาะงานหนัก แบตอึด ทนทาน","stock":25,"featured":true},
    {"id":"airImpact","title":"บล๊อกลมแรงบิดสูง","price":2590,"img":"https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=800&h=600&fit=crop","category":"auto","desc":"บล๊อกลมสำหรับงานอู่รถ มั่นใจแรงบิดสูง","stock":12,"featured":true},
    {"id":"plier","title":"คีมปากจิ้งจกเหล็กกล้า","price":190,"img":"https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop","category":"hand","desc":"คีมปากจิ้งจก ออกแบบจับถนัด ทนทาน","stock":100,"featured":false},
    {"id":"wrenchSet","title":"ประแจหกเหลี่ยมชุด 12 ตัว","price":890,"img":"https://raw.githubusercontent.com/Arcker89-cyber/Fei-Yi-Shop/main/Photo/images.jfif","category":"hand","desc":"ชุดประแจครบทุกขนาด","stock":45,"featured":true},
    {"id":"grinder4","title":"ลูกหมู (เครื่องเจียร) 4 นิ้ว","price":450,"img":"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop","category":"electric","desc":"เครื่องเจียร 4 นิ้ว กำลังดี","stock":30,"featured":false},
    {"id":"jackStand","title":"แม่แรงตั้งพื้น 3 ตัน","price":1850,"img":"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop","category":"auto","desc":"แม่แรงตั้งพื้นคุณภาพสูง รับน้ำหนักได้ 3 ตัน","stock":8,"featured":true},
    {"id":"socketSet","title":"ชุดบล็อกเบอร์ 40 ชิ้น","price":1290,"img":"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop","category":"hand","desc":"ชุดบล็อกครบเซ็ต 40 ชิ้น","stock":20,"featured":false},
    {"id":"heatGun","title":"ปืนเป่าลมร้อน 2000W","price":890,"img":"https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&h=600&fit=crop","category":"electric","desc":"ปืนเป่าลมร้อนกำลังสูง","stock":15,"featured":false}
  ];

  // ============================================================
  // DATA SYNC SERVICE - โหลดข้อมูลจาก Firebase
  // ============================================================
  const DataSync = {
    async syncAll() {
      // Try Firebase first
      const products = await FirebaseService.getProducts();
      const categories = await FirebaseService.getCategories();
      
      if (products && products.length > 0) {
        localStorage.setItem(CONFIG.PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        console.log('✅ Synced products from Firebase:', products.length, 'items');
      }
      
      if (categories) {
        localStorage.setItem(CONFIG.CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        console.log('✅ Synced categories from Firebase');
      }
      
      return { products, categories };
    },

    async initializeFirebaseData() {
      // Check if Firebase has data, if not, upload defaults
      const products = await FirebaseService.getProducts();
      if (!products || products.length === 0) {
        console.log('📤 Uploading default products to Firebase...');
        await FirebaseService.setAllProducts(DEFAULT_PRODUCTS);
      }
      
      const categories = await FirebaseService.getCategories();
      if (!categories) {
        console.log('📤 Uploading default categories to Firebase...');
        await FirebaseService.saveCategories(DEFAULT_CATEGORIES);
      }
    }
  };

  // ============================================================
  // CATEGORY SERVICE
  // ============================================================
  const CategoryService = {
    load() {
      const saved = localStorage.getItem(CONFIG.CATEGORIES_STORAGE_KEY);
      if (saved) try { return JSON.parse(saved); } catch(e) {}
      this.save(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    },
    save(categories) {
      localStorage.setItem(CONFIG.CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      // Save to Firebase (async)
      FirebaseService.saveCategories(categories);
    },
    getAll() { 
      const cats = this.load();
      // เรียงตามชื่อหมวดหมู่ (ก-ฮ)
      const sortedEntries = Object.entries(cats).sort((a, b) => 
        a[1].name.localeCompare(b[1].name, 'th')
      );
      return Object.fromEntries(sortedEntries);
    },
    get(id) { return this.load()[id] || null; },
    add(id, name, icon) {
      const cats = this.load();
      cats[id] = { name, icon };
      this.save(cats);
    },
    update(id, name, icon) {
      const cats = this.load();
      if (cats[id]) { cats[id] = { name, icon }; this.save(cats); }
    },
    delete(id) {
      const cats = this.load();
      delete cats[id];
      this.save(cats);
    },
    reset() {
      this.save(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
  };

  // ============================================================
  // PRODUCT SERVICE
  // ============================================================
  const ProductService = {
    load() {
      const saved = localStorage.getItem(CONFIG.PRODUCTS_STORAGE_KEY);
      if (saved) try { return JSON.parse(saved); } catch(e) {}
      this.save(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    },
    save(products) {
      localStorage.setItem(CONFIG.PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      // Save to Firebase (async)
      FirebaseService.setAllProducts(products);
    },
    getAll() { 
      const products = this.load();
      // เรียงตามชื่อสินค้า
      return products.sort((a, b) => a.title.localeCompare(b.title, 'th'));
    },
    getById(id) { return this.load().find(p => p.id === id) || null; },
    getByCategory(cat) { 
      return this.load().filter(p => p.category === cat).sort((a, b) => a.title.localeCompare(b.title, 'th'));
    },
    getFeatured() { 
      return this.load().filter(p => p.featured).sort((a, b) => a.title.localeCompare(b.title, 'th'));
    },
    search(kw) {
      const lk = kw.toLowerCase();
      return this.load().filter(p => p.title.toLowerCase().includes(lk) || p.desc.toLowerCase().includes(lk));
    },
    add(product) {
      const products = this.load();
      product.id = 'prod_' + Date.now();
      products.push(product);
      this.save(products);
      return product;
    },
    update(id, updates) {
      const products = this.load();
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) { products[idx] = { ...products[idx], ...updates }; this.save(products); return products[idx]; }
      return null;
    },
    delete(id) {
      let products = this.load();
      products = products.filter(p => p.id !== id);
      this.save(products);
    },
    reset() {
      this.save(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    },
    getStats() {
      const products = this.load();
      const cats = CategoryService.getAll();
      return {
        total: products.length,
        totalStock: products.reduce((s, p) => s + (p.stock || 0), 0),
        lowStock: products.filter(p => p.stock <= 10 && p.stock > 0).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        byCategory: Object.keys(cats).map(cat => ({
          category: cat, name: cats[cat].name,
          count: products.filter(p => p.category === cat).length
        }))
      };
    }
  };

  // ============================================================
  // CART
  // ============================================================
  const Cart = {
    listeners: [],
    load() { try { return JSON.parse(localStorage.getItem(CONFIG.CART_STORAGE_KEY)) || []; } catch(e) { return []; }},
    save(cart) { localStorage.setItem(CONFIG.CART_STORAGE_KEY, JSON.stringify(cart)); this.notify(); },
    clear() { localStorage.removeItem(CONFIG.CART_STORAGE_KEY); this.notify(); },
    add(id, qty=1) {
      const cart = this.load();
      const item = cart.find(i => i.id === id);
      if (item) item.qty += qty; else cart.push({id, qty});
      this.save(cart);
    },
    remove(id) { this.save(this.load().filter(i => i.id !== id)); },
    updateQty(id, qty) {
      if (qty <= 0) { this.remove(id); return; }
      const cart = this.load();
      const item = cart.find(i => i.id === id);
      if (item) { item.qty = qty; this.save(cart); }
    },
    getTotal() { return this.load().reduce((s,i) => s + i.qty, 0); },
    getTotalPrice() {
      return this.load().reduce((s,i) => {
        const p = ProductService.getById(i.id);
        return s + (p ? p.price * i.qty : 0);
      }, 0);
    },
    getDetails() {
      return this.load().map(i => {
        const p = ProductService.getById(i.id);
        return { ...i, product: p, subtotal: p ? p.price * i.qty : 0 };
      }).filter(i => i.product);
    },
    isEmpty() { return this.load().length === 0; },
    subscribe(cb) { this.listeners.push(cb); },
    notify() { this.listeners.forEach(cb => cb()); },
    getCheckoutUrl() {
      const d = this.getDetails();
      if (!d.length) return null;
      const lines = d.map(i => `${i.product.title} x${i.qty} = ${CONFIG.CURRENCY}${i.subtotal.toLocaleString()}`);
      const msg = `สั่งซื้อจาก ${CONFIG.STORE_NAME}:\n${lines.join('\n')}\nรวม ${this.getTotalPrice().toLocaleString()} บาท`;
      return `${CONFIG.LINE_MSG_URL}?${encodeURIComponent(msg)}`;
    }
  };

  // ============================================================
  // UI HELPERS
  // ============================================================
  const UI = {
    formatPrice: (p) => `${CONFIG.CURRENCY}${p.toLocaleString(CONFIG.LOCALE)}`,
    toast(msg, type='success') {
      const t = document.createElement('div');
      t.className = `toast-notification ${type}`;
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.classList.add('show'), 10);
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
    }
  };

  function lineUrl(id, qty=1) {
    const p = ProductService.getById(id);
    if (!p) return null;
    return `${CONFIG.LINE_MSG_URL}?${encodeURIComponent(`สั่งซื้อ: ${p.title} x${qty} (${CONFIG.STORE_NAME})`)}`;
  }

  // ============================================================
  // IMAGE HANDLER - แปลงไฟล์รูปเป็น base64
  // ============================================================
  const ImageHandler = {
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    resize(base64, maxWidth=800, maxHeight=600) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = h * maxWidth / w; w = maxWidth; }
          if (h > maxHeight) { w = w * maxHeight / h; h = maxHeight; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = base64;
      });
    }
  };

  // ============================================================
  // PRODUCT GRID
  // ============================================================
  const ProductGrid = {
    render(containerId, products=null) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const list = products || ProductService.getAll();
      c.innerHTML = list.map(p => this.card(p)).join('');
      this.events(c);
    },
    renderFeatured(containerId) {
      const c = document.getElementById(containerId);
      if (!c) return;
      c.innerHTML = ProductService.getFeatured().map(p => this.card(p)).join('');
      this.events(c);
    },
    renderByCategory(containerId, cat) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const list = ProductService.getByCategory(cat);
      c.innerHTML = list.length ? list.map(p => this.card(p)).join('') : '<div class="no-products">ไม่มีสินค้าในหมวดนี้</div>';
      this.events(c);
    },
    card(p) {
      const cats = CategoryService.getAll();
      const cat = cats[p.category] || { name: p.category, icon: '📦' };
      const stockClass = p.stock === 0 ? 'out-of-stock' : p.stock <= 10 ? 'low-stock' : '';
      const stockText = p.stock === 0 ? 'สินค้าหมด' : `เหลือ ${p.stock} ชิ้น`;
      return `
        <div class="product-card ${stockClass}">
          ${p.featured ? '<span class="featured-badge">⭐ แนะนำ</span>' : ''}
          <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect fill=%27%23e8f4fc%27 width=%27400%27 height=%27300%27/%3E%3Ctext fill=%27%230057A0%27 font-family=%27sans-serif%27 font-size=%2720%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ENo Image%3C/text%3E%3C/svg%3E'">
          <div class="card-content">
            <span class="category-label">${cat.icon} ${cat.name}</span>
            <h3>${p.title}</h3>
            <div class="price">${UI.formatPrice(p.price)}</div>
            <div class="stock-badge ${stockClass}">${stockText}</div>
            <p class="desc">${p.desc}</p>
            <div class="card-actions">
              <button class="buy-btn" data-add="${p.id}" ${p.stock===0?'disabled':''}>🛒 Add</button>
              <button class="line-btn" data-line="${p.id}">LINE</button>
              <a href="product.html?id=${p.id}"><button class="detail-btn">ดูเพิ่ม</button></a>
            </div>
          </div>
        </div>`;
    },
    events(c) {
      c.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { Cart.add(b.dataset.add); CartPanel.open(); UI.toast('เพิ่มลงตะกร้าแล้ว ✓'); });
      c.querySelectorAll('[data-line]').forEach(b => b.onclick = () => { const u = lineUrl(b.dataset.line); if(u) window.open(u,'_blank'); });
    }
  };

  // ============================================================
  // CATEGORY TABS
  // ============================================================
  const CategoryTabs = {
    render(containerId, gridId) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const cats = CategoryService.getAll();
      let html = `<button class="cat-tab active" data-cat="all">📦 ทั้งหมด</button>`;
      Object.keys(cats).forEach(k => { html += `<button class="cat-tab" data-cat="${k}">${cats[k].icon} ${cats[k].name}</button>`; });
      c.innerHTML = html;
      c.querySelectorAll('.cat-tab').forEach(t => {
        t.onclick = () => {
          c.querySelectorAll('.cat-tab').forEach(x => x.classList.remove('active'));
          t.classList.add('active');
          if (t.dataset.cat === 'all') ProductGrid.render(gridId);
          else ProductGrid.renderByCategory(gridId, t.dataset.cat);
        };
      });
    }
  };

  // ============================================================
  // PRODUCT DETAIL
  // ============================================================
  const ProductDetail = {
    render(containerId) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const id = new URLSearchParams(location.search).get('id');
      const p = ProductService.getById(id);
      if (!p) { c.innerHTML = `<div class="not-found"><h2>ไม่พบสินค้า</h2><a href="index.html" class="btn btn-primary">← กลับหน้าหลัก</a></div>`; return; }
      const cats = CategoryService.getAll();
      const cat = cats[p.category] || { name: p.category, icon: '📦' };
      const stockClass = p.stock === 0 ? 'out-of-stock' : p.stock <= 10 ? 'low-stock' : '';
      c.innerHTML = `
        <div class="detail-image">
          <img src="${p.img}" alt="${p.title}">
          ${p.featured ? '<span class="featured-badge large">⭐ แนะนำ</span>' : ''}
        </div>
        <div class="detail-info">
          <span class="category-tag">${cat.icon} ${cat.name}</span>
          <h1>${p.title}</h1>
          <div class="price">${UI.formatPrice(p.price)}</div>
          <div class="stock-info ${stockClass}">${p.stock > 0 ? `✓ มีสินค้า (${p.stock} ชิ้น)` : '✗ สินค้าหมด'}</div>
          <p class="desc">${p.desc}</p>
          <div class="detail-actions">
            <button id="d-add" class="buy-btn large" ${p.stock===0?'disabled':''}>🛒 เพิ่มลงตะกร้า</button>
            <button id="d-line" class="line-btn large">💬 สั่งผ่าน LINE</button>
          </div>
        </div>`;
      document.getElementById('d-add')?.addEventListener('click', () => { Cart.add(p.id); UI.toast('เพิ่มลงตะกร้าแล้ว ✓'); CartBadge.update(); });
      document.getElementById('d-line')?.addEventListener('click', () => { const u = lineUrl(p.id); if(u) window.open(u,'_blank'); });
    }
  };

  // ============================================================
  // CART BADGE & PANEL
  // ============================================================
  const CartBadge = {
    update() {
      document.querySelectorAll('#cart-count, #cart-count-2').forEach(e => e.textContent = Cart.getTotal());
      document.querySelectorAll('#cart-total, #cart-total-2').forEach(e => e.textContent = UI.formatPrice(Cart.getTotalPrice()));
    }
  };

  const CartPanel = {
    open() { ['cart-panel','cart-panel-2'].forEach(id => document.getElementById(id)?.classList.remove('hidden')); this.render(); },
    close() { ['cart-panel','cart-panel-2'].forEach(id => document.getElementById(id)?.classList.add('hidden')); },
    toggle() { const p = document.getElementById('cart-panel') || document.getElementById('cart-panel-2'); if(p) { p.classList.toggle('hidden'); if(!p.classList.contains('hidden')) this.render(); }},
    render() {
      const containers = [document.getElementById('cart-items'), document.getElementById('cart-items-2')].filter(Boolean);
      const items = Cart.getDetails();
      containers.forEach(c => {
        if (!items.length) { c.innerHTML = `<div class="empty-cart">🛒<br>ตะกร้าว่าง<br><a href="index.html">เลือกซื้อสินค้า →</a></div>`; return; }
        c.innerHTML = items.map(i => `
          <div class="cart-item">
            <img src="${i.product.img}" alt="${i.product.title}">
            <div class="meta"><div class="item-title">${i.product.title}</div>
            <div class="item-price">${UI.formatPrice(i.product.price)} x <input type="number" min="1" value="${i.qty}" data-qty="${i.product.id}"></div></div>
            <div class="item-subtotal">${UI.formatPrice(i.subtotal)}</div>
            <button class="remove-btn" data-rm="${i.product.id}">✕</button>
          </div>`).join('');
        c.querySelectorAll('[data-qty]').forEach(inp => inp.onchange = () => { Cart.updateQty(inp.dataset.qty, parseInt(inp.value)||1); this.render(); });
        c.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { Cart.remove(b.dataset.rm); this.render(); });
      });
      CartBadge.update();
    },
    checkout() { if (Cart.isEmpty()) { alert('ตะกร้าว่าง'); return; } const u = Cart.getCheckoutUrl(); if(u) window.open(u,'_blank'); },
    clearCart() { if (confirm('ล้างตะกร้า?')) { Cart.clear(); this.render(); }},
    init() {
      ['cart-toggle','cart-toggle-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.toggle()));
      ['cart-close','cart-close-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.close()));
      ['checkout-btn','checkout-btn-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.checkout()));
      ['clear-cart','clear-cart-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.clearCart()));
      Cart.subscribe(() => CartBadge.update());
      CartBadge.update();
    }
  };

  // ============================================================
  // ADMIN PANEL
  // ============================================================
  const AdminPanel = {
    editId: null,
    editCatId: null,

    render(containerId) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const stats = ProductService.getStats();
      const cats = CategoryService.getAll();

      c.innerHTML = `
        <div class="admin-header">
          <h2>📦 จัดการสินค้า</h2>
          <div class="admin-stats">
            <div class="stat-box"><span class="stat-num">${stats.total}</span><span class="stat-label">สินค้าทั้งหมด</span></div>
            <div class="stat-box"><span class="stat-num">${stats.totalStock}</span><span class="stat-label">สต๊อกรวม</span></div>
            <div class="stat-box warning"><span class="stat-num">${stats.lowStock}</span><span class="stat-label">ใกล้หมด</span></div>
            <div class="stat-box danger"><span class="stat-num">${stats.outOfStock}</span><span class="stat-label">หมดสต๊อก</span></div>
          </div>
        </div>

        <!-- Category Management -->
        <div class="admin-section">
          <h3>🏷️ จัดการหมวดหมู่</h3>
          <div class="category-list" id="category-list"></div>
          <button id="btn-add-cat" class="btn btn-ghost" style="margin-top:12px;">➕ เพิ่มหมวดหมู่ใหม่</button>
        </div>

        <div class="admin-section">
          <h3>📦 รายการสินค้า</h3>
          
          <div class="admin-actions">
            <button id="btn-add-product" class="btn btn-primary">➕ เพิ่มสินค้าใหม่</button>
            <button id="btn-sync" class="btn btn-success">🔄 Sync จาก Firebase</button>
            <button id="btn-export" class="btn btn-ghost">📤 Export</button>
            <button id="btn-import" class="btn btn-ghost">📥 Import</button>
            <button id="btn-reset" class="btn btn-ghost">🗑️ ลบข้อมูลทั้งหมด</button>
          </div>

          <div class="sync-info" style="background:#d4edda;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;border:1px solid #28a745;">
            <strong>🔥 Firebase Connected!</strong> ข้อมูลจะอัปเดตอัตโนมัติทุก Browser/User<br>
            เพิ่ม/แก้ไข/ลบสินค้าได้เลย → ทุกคนจะเห็นข้อมูลเดียวกันทันที!<br>
            <small style="color:#666;">กด <strong>🔄 Sync</strong> เพื่อโหลดข้อมูลล่าสุดจาก Firebase</small>
          </div>

          <div class="filter-bar" style="display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
            <label style="font-weight:600;color:var(--dark);">🔍 กรองหมวดหมู่:</label>
            <select id="admin-category-filter" class="filter-dropdown"></select>
            <span id="product-count" style="margin-left:auto;color:var(--muted);font-size:14px;"></span>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table"><thead><tr><th>รูป</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต๊อก</th><th>แนะนำ</th><th>จัดการ</th></tr></thead>
            <tbody id="product-list"></tbody></table>
          </div>
        </div>

        <!-- Product Modal -->
        <div id="product-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header"><h3 id="modal-title">เพิ่มสินค้า</h3><button class="close-btn" id="modal-close">✕</button></div>
            <form id="product-form">
              <div class="form-group"><label>ชื่อสินค้า *</label><input type="text" id="f-title" required></div>
              <div class="form-row">
                <div class="form-group"><label>ราคา (บาท) *</label><input type="number" id="f-price" min="0" required></div>
                <div class="form-group"><label>สต๊อก *</label><input type="number" id="f-stock" min="0" required></div>
              </div>
              <div class="form-group"><label>หมวดหมู่ *</label><select id="f-category" required></select></div>
              
              <!-- Image Upload Section -->
              <div class="form-group">
                <label>รูปภาพ</label>
                <div class="image-upload-box">
                  <div class="upload-tabs">
                    <button type="button" class="upload-tab active" data-tab="upload">📁 อัปโหลดไฟล์</button>
                    <button type="button" class="upload-tab" data-tab="url">🔗 ใส่ลิงก์</button>
                  </div>
                  <div class="upload-content" id="tab-upload">
                    <input type="file" id="f-img-file" accept="image/*">
                    <p class="upload-hint">รองรับ JPG, PNG, GIF (ขนาดไม่เกิน 2MB)</p>
                  </div>
                  <div class="upload-content hidden" id="tab-url">
                    <input type="url" id="f-img-url" placeholder="https://example.com/image.jpg">
                  </div>
                  <div class="image-preview" id="img-preview"></div>
                </div>
              </div>

              <div class="form-group"><label>คำอธิบาย</label><textarea id="f-desc" rows="3"></textarea></div>
              <div class="form-group checkbox"><label><input type="checkbox" id="f-featured"> ⭐ สินค้าแนะนำ</label></div>
              <div class="form-actions"><button type="submit" class="btn btn-primary">💾 บันทึก</button><button type="button" class="btn btn-ghost" id="modal-cancel">ยกเลิก</button></div>
            </form>
          </div>
        </div>

        <!-- Category Modal -->
        <div id="cat-modal" class="modal hidden">
          <div class="modal-content small">
            <div class="modal-header"><h3 id="cat-modal-title">เพิ่มหมวดหมู่</h3><button class="close-btn" id="cat-modal-close">✕</button></div>
            <form id="cat-form">
              <div class="form-group"><label>รหัสหมวดหมู่ (ภาษาอังกฤษ) *</label><input type="text" id="cf-id" pattern="[a-zA-Z0-9_]+" required></div>
              <div class="form-group"><label>ชื่อหมวดหมู่ *</label><input type="text" id="cf-name" required></div>
              <div class="form-group"><label>ไอคอน (Emoji) *</label><input type="text" id="cf-icon" maxlength="4" required placeholder="⚡"></div>
              <div class="form-actions"><button type="submit" class="btn btn-primary">💾 บันทึก</button><button type="button" class="btn btn-ghost" id="cat-modal-cancel">ยกเลิก</button></div>
            </form>
          </div>
        </div>

        <!-- Export Modal -->
        <div id="export-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header"><h3>📤 Export ข้อมูล</h3><button class="close-btn" id="export-modal-close">✕</button></div>
            <div style="padding:20px;">
              <p style="margin-bottom:16px;color:#666;">ส่งออกข้อมูลสินค้าเป็นไฟล์ CSV (เปิดด้วย Excel ได้)</p>
              <div class="form-group">
                <label>ตัวอย่างข้อมูล CSV</label>
                <textarea id="export-data" rows="10" style="font-family:monospace;font-size:12px;" readonly></textarea>
              </div>
              <div class="form-actions">
                <button id="btn-export-products" class="btn btn-primary">📦 ดาวน์โหลด CSV สินค้า</button>
                <button id="btn-export-categories" class="btn btn-ghost">🏷️ ดาวน์โหลด JSON หมวดหมู่</button>
              </div>
              <div class="export-guide" style="margin-top:20px;padding:16px;background:#e8f4fc;border-radius:8px;">
                <h4 style="margin-bottom:8px;">📖 วิธีใช้งาน:</h4>
                <ol style="margin-left:20px;font-size:14px;line-height:1.8;">
                  <li>กดปุ่ม <strong>ดาวน์โหลด CSV สินค้า</strong></li>
                  <li>เปิดไฟล์ด้วย <strong>Excel</strong> หรือ <strong>Google Sheets</strong></li>
                  <li>แก้ไขข้อมูลตามต้องการ</li>
                  <li>บันทึกเป็น CSV แล้วกลับมา Import</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- Import Modal -->
        <div id="import-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header"><h3>📥 Import ข้อมูล</h3><button class="close-btn" id="import-modal-close">✕</button></div>
            <div style="padding:20px;">
              <p style="margin-bottom:16px;color:#666;">นำเข้าข้อมูลสินค้าจากไฟล์ CSV (จาก Excel)</p>
              <div class="form-group">
                <label>อัปโหลดไฟล์ CSV</label>
                <input type="file" id="import-file" accept=".csv,.json" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div class="form-group">
                <label>ตัวอย่างข้อมูลที่จะนำเข้า</label>
                <textarea id="import-data" rows="8" style="font-family:monospace;font-size:12px;" placeholder="อัปโหลดไฟล์ CSV แล้วจะแสดงตัวอย่างที่นี่..." readonly></textarea>
              </div>
              <div class="form-group checkbox">
                <label><input type="checkbox" id="import-replace"> แทนที่ข้อมูลเดิมทั้งหมด (ถ้าไม่ติ๊ก จะเพิ่มต่อท้าย)</label>
              </div>
              <div class="form-actions">
                <button id="btn-do-import" class="btn btn-primary">📥 นำเข้าข้อมูล</button>
                <button id="btn-import-cancel" class="btn btn-ghost">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      `;

      this.renderCategoryList();
      this.renderCategoryFilterTabs();
      this.renderProductList();
      this.attachEvents();
    },

    renderCategoryList() {
      const c = document.getElementById('category-list');
      if (!c) return;
      const cats = CategoryService.getAll();
      c.innerHTML = Object.keys(cats).map(k => `
        <div class="category-item">
          <span class="cat-icon">${cats[k].icon}</span>
          <span class="cat-name">${cats[k].name}</span>
          <span class="cat-id">(${k})</span>
          <div class="cat-actions">
            <button class="btn-sm edit" data-edit-cat="${k}">✏️</button>
            <button class="btn-sm delete" data-del-cat="${k}">🗑️</button>
          </div>
        </div>
      `).join('');

      c.querySelectorAll('[data-edit-cat]').forEach(b => b.onclick = () => this.openCatModal(b.dataset.editCat));
      c.querySelectorAll('[data-del-cat]').forEach(b => b.onclick = () => this.deleteCat(b.dataset.delCat));
    },

    currentCategoryFilter: 'all',

    renderCategoryFilterTabs() {
      const select = document.getElementById('admin-category-filter');
      if (!select) return;
      const cats = CategoryService.getAll();
      const allProducts = ProductService.load();
      
      let html = `<option value="all">📦 ทั้งหมด (${allProducts.length})</option>`;
      
      Object.entries(cats).forEach(([id, cat]) => {
        const count = allProducts.filter(p => p.category === id).length;
        const selected = this.currentCategoryFilter === id ? 'selected' : '';
        html += `<option value="${id}" ${selected}>${cat.icon} ${cat.name} (${count})</option>`;
      });
      
      select.innerHTML = html;
      select.value = this.currentCategoryFilter;
      
      // Attach event
      select.onchange = () => {
        this.currentCategoryFilter = select.value;
        this.renderProductList();
      };
    },

    renderProductList() {
      const tbody = document.getElementById('product-list');
      if (!tbody) return;
      
      let products = ProductService.getAll();
      const cats = CategoryService.getAll();
      
      // Filter by category
      if (this.currentCategoryFilter !== 'all') {
        products = products.filter(p => p.category === this.currentCategoryFilter);
      }
      
      // Update count
      const countEl = document.getElementById('product-count');
      if (countEl) {
        countEl.textContent = `แสดง ${products.length} รายการ`;
      }
      
      if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--muted);">ไม่พบสินค้าในหมวดหมู่นี้</td></tr>`;
        return;
      }
      
      tbody.innerHTML = products.map(p => {
        const cat = cats[p.category] || { name: p.category, icon: '📦' };
        const stockClass = p.stock === 0 ? 'danger' : p.stock <= 10 ? 'warning' : '';
        return `<tr>
          <td><img src="${p.img}" class="thumb" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2745%27%3E%3Crect fill=%27%23e8f4fc%27 width=%2760%27 height=%2745%27/%3E%3Ctext fill=%27%230057A0%27 font-family=%27sans-serif%27 font-size=%278%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ENo%3C/text%3E%3C/svg%3E'"></td>
          <td><strong>${p.title}</strong></td>
          <td>${cat.icon} ${cat.name}</td>
          <td>${UI.formatPrice(p.price)}</td>
          <td class="${stockClass}">${p.stock}</td>
          <td>${p.featured ? '⭐' : '-'}</td>
          <td class="actions">
            <button class="btn-sm edit" data-edit="${p.id}">✏️</button>
            <button class="btn-sm delete" data-del="${p.id}">🗑️</button>
          </td>
        </tr>`;
      }).join('');

      tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => this.openProductModal(b.dataset.edit));
      tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => this.deleteProduct(b.dataset.del));
    },

    updateCategorySelect() {
      const sel = document.getElementById('f-category');
      if (!sel) return;
      const cats = CategoryService.getAll();
      sel.innerHTML = '<option value="">-- เลือกหมวดหมู่ --</option>' +
        Object.keys(cats).map(k => `<option value="${k}">${cats[k].icon} ${cats[k].name}</option>`).join('');
    },

    attachEvents() {
      // Product modal
      document.getElementById('btn-add-product')?.addEventListener('click', () => this.openProductModal());
      document.getElementById('modal-close')?.addEventListener('click', () => this.closeProductModal());
      document.getElementById('modal-cancel')?.addEventListener('click', () => this.closeProductModal());
      document.getElementById('product-modal')?.addEventListener('click', e => { if(e.target.id === 'product-modal') this.closeProductModal(); });
      document.getElementById('product-form')?.addEventListener('submit', e => this.submitProduct(e));

      // Category modal
      document.getElementById('btn-add-cat')?.addEventListener('click', () => this.openCatModal());
      document.getElementById('cat-modal-close')?.addEventListener('click', () => this.closeCatModal());
      document.getElementById('cat-modal-cancel')?.addEventListener('click', () => this.closeCatModal());
      document.getElementById('cat-modal')?.addEventListener('click', e => { if(e.target.id === 'cat-modal') this.closeCatModal(); });
      document.getElementById('cat-form')?.addEventListener('submit', e => this.submitCat(e));

      // Sync from GitHub
      document.getElementById('btn-sync')?.addEventListener('click', async () => {
        UI.toast('กำลัง Sync จาก GitHub...');
        const result = await DataSync.syncAll();
        if (result.products || result.categories) {
          UI.toast('✅ Sync สำเร็จ!');
          this.render('admin-panel');
          // Refresh other grids if exist
          if (document.getElementById('featured-grid')) ProductGrid.renderFeatured('featured-grid');
          if (document.getElementById('all-products-grid')) ProductGrid.render('all-products-grid');
        } else {
          UI.toast('⚠️ ไม่สามารถ Sync ได้ (ตรวจสอบไฟล์บน GitHub)');
        }
      });

      // Reset / ลบข้อมูลทั้งหมด
      document.getElementById('btn-reset')?.addEventListener('click', () => {
        if (confirm('⚠️ คุณต้องการลบข้อมูลสินค้าและหมวดหมู่ทั้งหมดหรือไม่?\n\nข้อมูลจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้น\nการกระทำนี้ไม่สามารถยกเลิกได้!')) {
          ProductService.reset();
          CategoryService.reset();
          UI.toast('ลบข้อมูลทั้งหมดแล้ว');
          this.render('admin-panel');
        }
      });

      // Image upload tabs
      document.querySelectorAll('.upload-tab').forEach(tab => {
        tab.onclick = () => {
          document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById('tab-upload')?.classList.toggle('hidden', tab.dataset.tab !== 'upload');
          document.getElementById('tab-url')?.classList.toggle('hidden', tab.dataset.tab !== 'url');
        };
      });

      // File input preview
      document.getElementById('f-img-file')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) { alert('ไฟล์ใหญ่เกิน 2MB'); return; }
          const base64 = await ImageHandler.toBase64(file);
          const resized = await ImageHandler.resize(base64);
          this.showPreview(resized);
          this.tempImage = resized;
        }
      });

      // URL input preview
      document.getElementById('f-img-url')?.addEventListener('blur', (e) => {
        const url = e.target.value.trim();
        if (url) this.showPreview(url);
      });

      // Export modal
      document.getElementById('btn-export')?.addEventListener('click', () => this.openExportModal());
      document.getElementById('export-modal-close')?.addEventListener('click', () => this.closeExportModal());
      document.getElementById('export-modal')?.addEventListener('click', e => { if(e.target.id === 'export-modal') this.closeExportModal(); });
      document.getElementById('btn-export-products')?.addEventListener('click', () => this.exportProducts());
      document.getElementById('btn-export-categories')?.addEventListener('click', () => this.exportCategories());

      // Import modal
      document.getElementById('btn-import')?.addEventListener('click', () => this.openImportModal());
      document.getElementById('import-modal-close')?.addEventListener('click', () => this.closeImportModal());
      document.getElementById('btn-import-cancel')?.addEventListener('click', () => this.closeImportModal());
      document.getElementById('import-modal')?.addEventListener('click', e => { if(e.target.id === 'import-modal') this.closeImportModal(); });
      document.getElementById('import-file')?.addEventListener('change', (e) => this.handleImportFile(e));
      document.getElementById('btn-do-import')?.addEventListener('click', () => this.doImport());
    },

    showPreview(src) {
      const preview = document.getElementById('img-preview');
      if (preview) preview.innerHTML = src ? `<img src="${src}" alt="Preview"><button type="button" class="remove-preview" onclick="this.parentElement.innerHTML='';document.getElementById('f-img-file').value='';document.getElementById('f-img-url').value='';">✕</button>` : '';
    },

    tempImage: null,

    openProductModal(id = null) {
      this.editId = id;
      this.tempImage = null;
      const form = document.getElementById('product-form');
      form?.reset();
      this.updateCategorySelect();
      document.getElementById('img-preview').innerHTML = '';
      document.getElementById('modal-title').textContent = id ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่';

      if (id) {
        const p = ProductService.getById(id);
        if (p) {
          document.getElementById('f-title').value = p.title;
          document.getElementById('f-price').value = p.price;
          document.getElementById('f-stock').value = p.stock;
          document.getElementById('f-category').value = p.category;
          document.getElementById('f-img-url').value = p.img.startsWith('data:') ? '' : p.img;
          document.getElementById('f-desc').value = p.desc || '';
          document.getElementById('f-featured').checked = p.featured;
          this.showPreview(p.img);
          if (p.img.startsWith('data:')) this.tempImage = p.img;
        }
      }
      document.getElementById('product-modal')?.classList.remove('hidden');
    },

    closeProductModal() {
      document.getElementById('product-modal')?.classList.add('hidden');
      this.editId = null;
      this.tempImage = null;
    },

    async submitProduct(e) {
      e.preventDefault();
      let img = this.tempImage || document.getElementById('f-img-url').value.trim() || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e8f4fc' width='400' height='300'/%3E%3Ctext fill='%230057A0' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

      const data = {
        title: document.getElementById('f-title').value.trim(),
        price: parseInt(document.getElementById('f-price').value) || 0,
        stock: parseInt(document.getElementById('f-stock').value) || 0,
        category: document.getElementById('f-category').value,
        img,
        desc: document.getElementById('f-desc').value.trim(),
        featured: document.getElementById('f-featured').checked
      };

      if (this.editId) {
        ProductService.update(this.editId, data);
        UI.toast('อัปเดตสินค้าแล้ว ✓');
      } else {
        ProductService.add(data);
        UI.toast('เพิ่มสินค้าแล้ว ✓');
      }
      this.closeProductModal();
      this.render('admin-panel');
    },

    deleteProduct(id) {
      const p = ProductService.getById(id);
      if (confirm(`ลบสินค้า "${p?.title}"?`)) {
        ProductService.delete(id);
        UI.toast('ลบสินค้าแล้ว');
        this.renderProductList();
        this.render('admin-panel');
      }
    },

    openCatModal(id = null) {
      this.editCatId = id;
      const form = document.getElementById('cat-form');
      form?.reset();
      document.getElementById('cat-modal-title').textContent = id ? '✏️ แก้ไขหมวดหมู่' : '➕ เพิ่มหมวดหมู่ใหม่';
      const idInput = document.getElementById('cf-id');

      if (id) {
        const cat = CategoryService.get(id);
        if (cat) {
          idInput.value = id;
          idInput.disabled = true;
          document.getElementById('cf-name').value = cat.name;
          document.getElementById('cf-icon').value = cat.icon;
        }
      } else {
        idInput.disabled = false;
      }
      document.getElementById('cat-modal')?.classList.remove('hidden');
    },

    closeCatModal() {
      document.getElementById('cat-modal')?.classList.add('hidden');
      this.editCatId = null;
    },

    submitCat(e) {
      e.preventDefault();
      const id = document.getElementById('cf-id').value.trim().toLowerCase();
      const name = document.getElementById('cf-name').value.trim();
      const icon = document.getElementById('cf-icon').value.trim();

      if (this.editCatId) {
        CategoryService.update(this.editCatId, name, icon);
        UI.toast('อัปเดตหมวดหมู่แล้ว ✓');
      } else {
        if (CategoryService.get(id)) { alert('รหัสหมวดหมู่นี้มีอยู่แล้ว'); return; }
        CategoryService.add(id, name, icon);
        UI.toast('เพิ่มหมวดหมู่แล้ว ✓');
      }
      this.closeCatModal();
      this.render('admin-panel');
    },

    deleteCat(id) {
      const cat = CategoryService.get(id);
      const productCount = ProductService.getByCategory(id).length;
      if (productCount > 0) {
        alert(`ไม่สามารถลบได้ มีสินค้า ${productCount} รายการในหมวดนี้`);
        return;
      }
      if (confirm(`ลบหมวดหมู่ "${cat?.name}"?`)) {
        CategoryService.delete(id);
        UI.toast('ลบหมวดหมู่แล้ว');
        this.render('admin-panel');
      }
    },

    // ============================================================
    // EXPORT FUNCTIONS
    // ============================================================
    currentExportType: 'products',

    openExportModal() {
      document.getElementById('export-modal')?.classList.remove('hidden');
      // แสดงตัวอย่าง CSV
      const products = ProductService.getAll();
      const preview = products.slice(0, 3).map(p => 
        `${p.title}, ฿${p.price}, ${p.stock} ชิ้น`
      ).join('\n');
      document.getElementById('export-data').value = `ตัวอย่างข้อมูล (${products.length} รายการ):\n\n${preview}\n\n...และอื่นๆ`;
    },

    closeExportModal() {
      document.getElementById('export-modal')?.classList.add('hidden');
    },

    exportProducts() {
      const products = ProductService.getAll();
      
      // CSV Header
      const headers = ['id', 'title', 'price', 'category', 'stock', 'featured', 'desc', 'img'];
      
      // CSV Rows
      const rows = products.map(p => {
        return [
          p.id || '',
          `"${(p.title || '').replace(/"/g, '""')}"`,
          p.price || 0,
          p.category || '',
          p.stock || 0,
          p.featured ? 'TRUE' : 'FALSE',
          `"${(p.desc || '').replace(/"/g, '""')}"`,
          `"${(p.img || '').replace(/"/g, '""')}"`
        ].join(',');
      });
      
      const csv = [headers.join(','), ...rows].join('\n');
      
      // Add BOM for Excel UTF-8 support
      const bom = '\uFEFF';
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feiyi_products_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      UI.toast('ดาวน์โหลด CSV แล้ว ✓');
      this.closeExportModal();
    },

    exportCategories() {
      const categories = CategoryService.getAll();
      const json = JSON.stringify(categories, null, 2);
      
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feiyi_categories_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      UI.toast('ดาวน์โหลด JSON หมวดหมู่แล้ว ✓');
      this.closeExportModal();
    },

    // ============================================================
    // IMPORT FUNCTIONS
    // ============================================================
    importedData: null,
    importFileType: null,

    openImportModal() {
      document.getElementById('import-modal')?.classList.remove('hidden');
      document.getElementById('import-data').value = '';
      document.getElementById('import-file').value = '';
      document.getElementById('import-replace').checked = false;
      this.importedData = null;
      this.importFileType = null;
    },

    closeImportModal() {
      document.getElementById('import-modal')?.classList.add('hidden');
    },

    parseCSV(csvText) {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) return [];
      
      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const products = [];
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;
        
        const product = {};
        headers.forEach((header, idx) => {
          let value = values[idx] || '';
          
          // Remove quotes
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"');
          }
          
          // Convert types
          if (header === 'price' || header === 'stock') {
            product[header] = parseInt(value) || 0;
          } else if (header === 'featured') {
            product[header] = value.toUpperCase() === 'TRUE' || value === '1';
          } else {
            product[header] = value;
          }
        });
        
        // Generate ID if missing
        if (!product.id) {
          product.id = 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        }
        
        products.push(product);
      }
      
      return products;
    },

    parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      
      return result;
    },

    handleImportFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const isCSV = file.name.toLowerCase().endsWith('.csv');
      const isJSON = file.name.toLowerCase().endsWith('.json');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        
        if (isCSV) {
          this.importFileType = 'csv';
          const products = this.parseCSV(content);
          this.importedData = products;
          
          // Show preview
          const preview = products.slice(0, 5).map(p => 
            `• ${p.title} - ฿${p.price} (${p.stock} ชิ้น)`
          ).join('\n');
          document.getElementById('import-data').value = `พบ ${products.length} รายการ:\n\n${preview}${products.length > 5 ? '\n...และอื่นๆ' : ''}`;
          
        } else if (isJSON) {
          this.importFileType = 'json';
          try {
            this.importedData = JSON.parse(content);
            document.getElementById('import-data').value = `พบข้อมูล JSON (หมวดหมู่)\n\n${content.substring(0, 500)}...`;
          } catch (err) {
            alert('ไฟล์ JSON ไม่ถูกต้อง');
            return;
          }
        }
        
        UI.toast('โหลดไฟล์แล้ว ✓');
      };
      reader.readAsText(file);
    },

    doImport() {
      if (!this.importedData) { 
        alert('กรุณาอัปโหลดไฟล์ CSV หรือ JSON ก่อน'); 
        return; 
      }

      const replace = document.getElementById('import-replace').checked;

      try {
        if (this.importFileType === 'csv') {
          // Import products from CSV
          const data = this.importedData;
          if (!Array.isArray(data) || data.length === 0) { 
            alert('ไม่พบข้อมูลสินค้าในไฟล์'); 
            return; 
          }
          
          if (replace) {
            ProductService.save(data);
          } else {
            const existing = ProductService.getAll();
            data.forEach(p => {
              p.id = 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
              existing.push(p);
            });
            ProductService.save(existing);
          }
          UI.toast(`นำเข้าสินค้า ${data.length} รายการแล้ว ✓`);
          
        } else if (this.importFileType === 'json') {
          // Import categories from JSON
          const data = this.importedData;
          if (typeof data !== 'object' || Array.isArray(data)) { 
            alert('หมวดหมู่ต้องเป็น Object'); 
            return; 
          }
          
          if (replace) {
            CategoryService.save(data);
          } else {
            const existing = CategoryService.getAll();
            Object.keys(data).forEach(k => { existing[k] = data[k]; });
            CategoryService.save(existing);
          }
          UI.toast('นำเข้าหมวดหมู่แล้ว ✓');
        }

        this.closeImportModal();
        this.render('admin-panel');
      } catch (e) {
        alert('เกิดข้อผิดพลาด: ' + e.message);
      }
    }
  };

  // ============================================================
  // INIT
  // ============================================================
  async function init() {
    console.log('🛠️ Fei Yi Shop v4 - Init');
    
    // Initialize Firebase
    const firebaseReady = await FirebaseService.init();
    
    if (firebaseReady) {
      // Initialize default data if empty
      await DataSync.initializeFirebaseData();
      // Sync data from Firebase
      await DataSync.syncAll();
    } else {
      console.log('⚠️ Firebase not available, using local data');
    }
    
    if (document.getElementById('featured-grid')) ProductGrid.renderFeatured('featured-grid');
    if (document.getElementById('category-tabs')) CategoryTabs.render('category-tabs', 'all-products-grid');
    if (document.getElementById('all-products-grid')) ProductGrid.render('all-products-grid');
    if (document.getElementById('product-detail')) ProductDetail.render('product-detail');
    if (document.getElementById('admin-panel')) AdminPanel.render('admin-panel');
    CartPanel.init();
    console.log('✅ Fei Yi Shop v4 - Ready');
  }

  window.FeiyiApp = { products: ProductService, categories: CategoryService, cart: Cart, sync: DataSync, firebase: FirebaseService };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
