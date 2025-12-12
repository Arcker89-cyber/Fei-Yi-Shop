/**
 * Fei Yi Shop v3 - Stock Management System
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const CONFIG = {
    STORE_NAME: 'Fei Yi Shop',
    STORE_SLOGAN: 'เครื่องมือดี คู่ช่างไทย',
    LINE_ID: '@feiyi',
    PHONE: '089-123-4567',
    CART_STORAGE_KEY: 'feiyi_cart_v3',
    PRODUCTS_STORAGE_KEY: 'feiyi_products_v3',
    LINE_MSG_URL: 'https://line.me/R/msg/text/',
    CURRENCY: '฿',
    LOCALE: 'th-TH',
    FEATURED_COUNT: 4
  };

  const CATEGORIES = {
    electric: { name: 'เครื่องมือไฟฟ้า', icon: '⚡' },
    auto: { name: 'เครื่องมือซ่อมรถ', icon: '🚗' },
    hand: { name: 'เครื่องมือช่างทั่วไป', icon: '🔧' }
  };

  // ============================================================
  // DEFAULT PRODUCTS
  // ============================================================
  const DEFAULT_PRODUCTS = [
    {
      id: "drill48",
      title: "สว่านไฟฟ้าไร้สาย 48V",
      price: 1290,
      img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop",
      category: "electric",
      desc: "สว่านไร้สายพลังสูง เหมาะงานหนัก แบตอึด ทนทาน",
      stock: 25,
      featured: true
    },
    {
      id: "airImpact",
      title: "บล๊อกลมแรงบิดสูง",
      price: 2590,
      img: "https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=800&h=600&fit=crop",
      category: "auto",
      desc: "บล๊อกลมสำหรับงานอู่รถ มั่นใจแรงบิดสูง ประหยัดเวลา",
      stock: 12,
      featured: true
    },
    {
      id: "plier",
      title: "คีมปากจิ้งจกเหล็กกล้า",
      price: 190,
      img: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop",
      category: "hand",
      desc: "คีมปากจิ้งจก ออกแบบจับถนัด ทนทาน ไม่ลื่น",
      stock: 100,
      featured: false
    },
    {
      id: "wrenchSet",
      title: "ประแจหกเหลี่ยมชุด 12 ตัว",
      price: 890,
      img: "https://images.unsplash.com/photo-1581147036324-c17ac41f3e6b?w=800&h=600&fit=crop",
      category: "hand",
      desc: "ชุดประแจครบทุกขนาด เหมาะสำหรับงานบ้านและอู่ช่าง",
      stock: 45,
      featured: true
    },
    {
      id: "grinder4",
      title: "ลูกหมู (เครื่องเจียร) 4 นิ้ว",
      price: 450,
      img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop",
      category: "electric",
      desc: "เครื่องเจียร 4 นิ้วกำลังดี ใช้งานต่อเนื่อง แข็งแรง",
      stock: 30,
      featured: false
    },
    {
      id: "jackStand",
      title: "แม่แรงตั้งพื้น 3 ตัน",
      price: 1850,
      img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop",
      category: "auto",
      desc: "แม่แรงตั้งพื้นคุณภาพสูง รับน้ำหนักได้ 3 ตัน ปลอดภัย",
      stock: 8,
      featured: true
    },
    {
      id: "socketSet",
      title: "ชุดบล็อกเบอร์ 40 ชิ้น",
      price: 1290,
      img: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop",
      category: "hand",
      desc: "ชุดบล็อกครบเซ็ต 40 ชิ้น พร้อมกล่องเก็บ",
      stock: 20,
      featured: false
    },
    {
      id: "heatGun",
      title: "ปืนเป่าลมร้อน 2000W",
      price: 890,
      img: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&h=600&fit=crop",
      category: "electric",
      desc: "ปืนเป่าลมร้อนกำลังสูง ปรับอุณหภูมิได้",
      stock: 15,
      featured: false
    }
  ];

  // ============================================================
  // PRODUCT SERVICE
  // ============================================================
  const ProductService = {
    loadProducts() {
      const saved = localStorage.getItem(CONFIG.PRODUCTS_STORAGE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } 
        catch (e) { console.error('Error loading products:', e); }
      }
      this.saveProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    },

    saveProducts(products) {
      localStorage.setItem(CONFIG.PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    },

    getAll() { return this.loadProducts(); },

    getById(id) {
      return this.loadProducts().find(p => p.id === id) || null;
    },

    getByCategory(category) {
      return this.loadProducts().filter(p => p.category === category);
    },

    getFeatured() {
      return this.loadProducts().filter(p => p.featured === true);
    },

    search(keyword) {
      const lk = keyword.toLowerCase();
      return this.loadProducts().filter(p =>
        p.title.toLowerCase().includes(lk) || p.desc.toLowerCase().includes(lk)
      );
    },

    addProduct(product) {
      const products = this.loadProducts();
      product.id = 'prod_' + Date.now();
      products.push(product);
      this.saveProducts(products);
      return product;
    },

    updateProduct(id, updates) {
      const products = this.loadProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...updates };
        this.saveProducts(products);
        return products[idx];
      }
      return null;
    },

    deleteProduct(id) {
      let products = this.loadProducts();
      products = products.filter(p => p.id !== id);
      this.saveProducts(products);
    },

    resetToDefault() {
      this.saveProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    },

    getStats() {
      const products = this.loadProducts();
      return {
        total: products.length,
        totalStock: products.reduce((s, p) => s + (p.stock || 0), 0),
        lowStock: products.filter(p => p.stock <= 10).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        byCategory: Object.keys(CATEGORIES).map(cat => ({
          category: cat,
          name: CATEGORIES[cat].name,
          count: products.filter(p => p.category === cat).length
        }))
      };
    }
  };

  // ============================================================
  // CART MANAGER
  // ============================================================
  const Cart = {
    listeners: [],
    load() {
      const raw = localStorage.getItem(CONFIG.CART_STORAGE_KEY);
      if (!raw) return [];
      try { return JSON.parse(raw); } catch (e) { return []; }
    },
    save(cart) {
      localStorage.setItem(CONFIG.CART_STORAGE_KEY, JSON.stringify(cart));
      this.notifyListeners();
    },
    clear() {
      localStorage.removeItem(CONFIG.CART_STORAGE_KEY);
      this.notifyListeners();
    },
    addItem(productId, qty = 1) {
      const product = ProductService.getById(productId);
      if (!product) return false;
      const cart = this.load();
      const existing = cart.find(item => item.id === productId);
      if (existing) existing.qty += qty;
      else cart.push({ id: productId, qty });
      this.save(cart);
      return true;
    },
    removeItem(productId) {
      let cart = this.load();
      cart = cart.filter(item => item.id !== productId);
      this.save(cart);
    },
    updateQuantity(productId, qty) {
      const cart = this.load();
      const item = cart.find(i => i.id === productId);
      if (item) {
        if (qty <= 0) this.removeItem(productId);
        else { item.qty = qty; this.save(cart); }
      }
    },
    getTotalItems() {
      return this.load().reduce((s, i) => s + i.qty, 0);
    },
    getTotalPrice() {
      return this.load().reduce((s, i) => {
        const p = ProductService.getById(i.id);
        return s + (p ? p.price * i.qty : 0);
      }, 0);
    },
    getCartDetails() {
      return this.load().map(item => {
        const product = ProductService.getById(item.id);
        return { ...item, product, subtotal: product ? product.price * item.qty : 0 };
      }).filter(item => item.product !== null);
    },
    isEmpty() { return this.load().length === 0; },
    subscribe(cb) { this.listeners.push(cb); },
    notifyListeners() {
      const data = { items: this.getCartDetails(), totalItems: this.getTotalItems(), totalPrice: this.getTotalPrice() };
      this.listeners.forEach(cb => cb(data));
    },
    getCheckoutLineUrl() {
      const details = this.getCartDetails();
      if (details.length === 0) return null;
      const lines = details.map(i => `${i.product.title} x${i.qty} = ${CONFIG.CURRENCY}${i.subtotal.toLocaleString()}`);
      const msg = `สั่งซื้อจาก ${CONFIG.STORE_NAME}:\n${lines.join('\n')}\nรวม ${this.getTotalPrice().toLocaleString()} บาท\nLINE: ${CONFIG.LINE_ID}`;
      return `${CONFIG.LINE_MSG_URL}?${encodeURIComponent(msg)}`;
    }
  };

  // ============================================================
  // UI HELPERS
  // ============================================================
  const UI = {
    formatPrice(price) {
      return `${CONFIG.CURRENCY}${price.toLocaleString(CONFIG.LOCALE)}`;
    },
    showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `toast-notification ${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }
  };

  function generateLineUrl(productId, qty = 1) {
    const p = ProductService.getById(productId);
    if (!p) return null;
    const msg = `ต้องการสั่งซื้อ: ${p.title} จำนวน ${qty} ชิ้น (${CONFIG.STORE_NAME})`;
    return `${CONFIG.LINE_MSG_URL}?${encodeURIComponent(msg)}`;
  }

  // ============================================================
  // PRODUCT GRID (หน้า Home)
  // ============================================================
  const ProductGrid = {
    render(containerId, products = null, showAll = false) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const list = products || ProductService.getAll();
      container.innerHTML = list.map(p => this.renderCard(p)).join('');
      this.attachEvents(container);
    },

    renderFeatured(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const featured = ProductService.getFeatured();
      container.innerHTML = featured.map(p => this.renderCard(p)).join('');
      this.attachEvents(container);
    },

    renderByCategory(containerId, category) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const products = ProductService.getByCategory(category);
      if (products.length === 0) {
        container.innerHTML = '<div class="no-products">ไม่มีสินค้าในหมวดนี้</div>';
        return;
      }
      container.innerHTML = products.map(p => this.renderCard(p)).join('');
      this.attachEvents(container);
    },

    renderCard(product) {
      const stockClass = product.stock === 0 ? 'out-of-stock' : product.stock <= 10 ? 'low-stock' : '';
      const stockText = product.stock === 0 ? 'สินค้าหมด' : `เหลือ ${product.stock} ชิ้น`;
      const catInfo = CATEGORIES[product.category] || { name: product.category, icon: '📦' };
      
      return `
        <div class="product-card ${stockClass}" data-product-id="${product.id}">
          ${product.featured ? '<span class="featured-badge">แนะนำ</span>' : ''}
          <img src="${product.img}" alt="${product.title}" loading="lazy"
               onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
          <div class="card-content">
            <span class="category-label">${catInfo.icon} ${catInfo.name}</span>
            <h3>${product.title}</h3>
            <div class="price">${UI.formatPrice(product.price)}</div>
            <div class="stock-badge ${stockClass}">${stockText}</div>
            <p class="desc">${product.desc}</p>
            <div class="card-actions">
              <button class="buy-btn" data-action="add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                🛒 Add to Cart
              </button>
              <button class="line-btn" data-action="line-order" data-id="${product.id}">LINE</button>
              <a href="product.html?id=${product.id}"><button class="detail-btn">ดูเพิ่ม</button></a>
            </div>
          </div>
        </div>
      `;
    },

    attachEvents(container) {
      container.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          Cart.addItem(id, 1);
          CartPanel.open();
          UI.showToast('เพิ่มลงตะกร้าแล้ว ✓');
        });
      });
      container.querySelectorAll('[data-action="line-order"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const url = generateLineUrl(e.currentTarget.dataset.id, 1);
          if (url) window.open(url, '_blank');
        });
      });
    }
  };

  // ============================================================
  // CATEGORY TABS
  // ============================================================
  const CategoryTabs = {
    render(containerId, gridId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      let html = `<button class="cat-tab active" data-category="all">📦 ทั้งหมด</button>`;
      Object.keys(CATEGORIES).forEach(cat => {
        const info = CATEGORIES[cat];
        html += `<button class="cat-tab" data-category="${cat}">${info.icon} ${info.name}</button>`;
      });
      container.innerHTML = html;

      container.querySelectorAll('.cat-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          container.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
          e.target.classList.add('active');
          const cat = e.target.dataset.category;
          if (cat === 'all') ProductGrid.render(gridId);
          else ProductGrid.renderByCategory(gridId, cat);
        });
      });
    }
  };

  // ============================================================
  // PRODUCT DETAIL PAGE
  // ============================================================
  const ProductDetail = {
    render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      const product = ProductService.getById(id);

      if (!product) {
        container.innerHTML = `<div class="not-found"><h2>ไม่พบสินค้า</h2><a href="index.html" class="btn btn-primary">← กลับหน้าหลัก</a></div>`;
        return;
      }

      const catInfo = CATEGORIES[product.category] || { name: product.category, icon: '📦' };
      const stockClass = product.stock === 0 ? 'out-of-stock' : product.stock <= 10 ? 'low-stock' : '';

      container.innerHTML = `
        <div class="detail-image">
          <img src="${product.img}" alt="${product.title}">
          ${product.featured ? '<span class="featured-badge large">⭐ แนะนำ</span>' : ''}
        </div>
        <div class="detail-info">
          <span class="category-tag">${catInfo.icon} ${catInfo.name}</span>
          <h1>${product.title}</h1>
          <div class="price">${UI.formatPrice(product.price)}</div>
          <div class="stock-info ${stockClass}">${product.stock > 0 ? `✓ มีสินค้า (${product.stock} ชิ้น)` : '✗ สินค้าหมด'}</div>
          <p class="desc">${product.desc}</p>
          <div class="detail-actions">
            <button id="detail-add" class="buy-btn large" ${product.stock === 0 ? 'disabled' : ''}>🛒 เพิ่มลงตะกร้า</button>
            <button id="detail-line" class="line-btn large">💬 สั่งผ่าน LINE</button>
          </div>
        </div>`;

      document.getElementById('detail-add')?.addEventListener('click', () => {
        Cart.addItem(product.id, 1);
        UI.showToast('เพิ่มลงตะกร้าแล้ว ✓');
        CartBadge.update();
      });
      document.getElementById('detail-line')?.addEventListener('click', () => {
        const url = generateLineUrl(product.id, 1);
        if (url) window.open(url, '_blank');
      });
    }
  };

  // ============================================================
  // CART BADGE & PANEL
  // ============================================================
  const CartBadge = {
    update() {
      document.querySelectorAll('#cart-count, #cart-count-2').forEach(el => el.textContent = Cart.getTotalItems());
      document.querySelectorAll('#cart-total, #cart-total-2').forEach(el => el.textContent = UI.formatPrice(Cart.getTotalPrice()));
    }
  };

  const CartPanel = {
    open() {
      ['cart-panel', 'cart-panel-2'].forEach(id => document.getElementById(id)?.classList.remove('hidden'));
      this.renderItems();
    },
    close() {
      ['cart-panel', 'cart-panel-2'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
    },
    toggle() {
      const panel = document.getElementById('cart-panel') || document.getElementById('cart-panel-2');
      if (panel) { panel.classList.toggle('hidden'); if (!panel.classList.contains('hidden')) this.renderItems(); }
    },
    renderItems() {
      const containers = [document.getElementById('cart-items'), document.getElementById('cart-items-2')].filter(Boolean);
      const details = Cart.getCartDetails();
      containers.forEach(container => {
        if (details.length === 0) {
          container.innerHTML = `<div class="empty-cart">🛒<br>ตะกร้าว่าง<br><a href="index.html">เลือกซื้อสินค้า →</a></div>`;
          return;
        }
        container.innerHTML = details.map(item => `
          <div class="cart-item">
            <img src="${item.product.img}" alt="${item.product.title}">
            <div class="meta"><div class="item-title">${item.product.title}</div>
            <div class="item-price">${UI.formatPrice(item.product.price)} x <input type="number" min="1" value="${item.qty}" data-action="change-qty" data-id="${item.product.id}"></div></div>
            <div class="item-subtotal">${UI.formatPrice(item.subtotal)}</div>
            <button class="remove-btn" data-action="remove" data-id="${item.product.id}">✕</button>
          </div>`).join('');
        container.querySelectorAll('[data-action="change-qty"]').forEach(inp => {
          inp.addEventListener('change', (e) => { Cart.updateQuantity(e.target.dataset.id, parseInt(e.target.value) || 1); this.renderItems(); });
        });
        container.querySelectorAll('[data-action="remove"]').forEach(btn => {
          btn.addEventListener('click', (e) => { Cart.removeItem(e.currentTarget.dataset.id); this.renderItems(); });
        });
      });
      CartBadge.update();
    },
    checkout() { if (Cart.isEmpty()) { alert('ตะกร้าว่าง'); return; } const url = Cart.getCheckoutLineUrl(); if (url) window.open(url, '_blank'); },
    clearCart() { if (confirm('ล้างตะกร้า?')) { Cart.clear(); this.renderItems(); } },
    init() {
      ['cart-toggle', 'cart-toggle-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.toggle()));
      ['cart-close', 'cart-close-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.close()));
      ['checkout-btn', 'checkout-btn-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.checkout()));
      ['clear-cart', 'clear-cart-2'].forEach(id => document.getElementById(id)?.addEventListener('click', () => this.clearCart()));
      Cart.subscribe(() => CartBadge.update());
      CartBadge.update();
    }
  };

  // ============================================================
  // ADMIN PANEL
  // ============================================================
  const AdminPanel = {
    currentEditId: null,
    render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const stats = ProductService.getStats();
      container.innerHTML = `
        <div class="admin-header">
          <h2>📦 จัดการสินค้า</h2>
          <div class="admin-stats">
            <div class="stat-box"><span class="stat-num">${stats.total}</span><span class="stat-label">สินค้าทั้งหมด</span></div>
            <div class="stat-box"><span class="stat-num">${stats.totalStock}</span><span class="stat-label">สต๊อกรวม</span></div>
            <div class="stat-box warning"><span class="stat-num">${stats.lowStock}</span><span class="stat-label">ใกล้หมด</span></div>
            <div class="stat-box danger"><span class="stat-num">${stats.outOfStock}</span><span class="stat-label">หมดสต๊อก</span></div>
          </div>
        </div>
        <div class="admin-actions">
          <button id="btn-add-product" class="btn btn-primary">➕ เพิ่มสินค้าใหม่</button>
          <button id="btn-reset-products" class="btn btn-ghost">🔄 รีเซ็ตข้อมูล</button>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table"><thead><tr><th>รูป</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต๊อก</th><th>แนะนำ</th><th>จัดการ</th></tr></thead>
          <tbody id="admin-product-list"></tbody></table>
        </div>
        <div id="product-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header"><h3 id="modal-title">เพิ่มสินค้าใหม่</h3><button class="close-btn" id="modal-close">✕</button></div>
            <form id="product-form">
              <div class="form-group"><label>ชื่อสินค้า *</label><input type="text" id="f-title" required></div>
              <div class="form-row"><div class="form-group"><label>ราคา (บาท) *</label><input type="number" id="f-price" min="0" required></div>
              <div class="form-group"><label>สต๊อก *</label><input type="number" id="f-stock" min="0" required></div></div>
              <div class="form-group"><label>หมวดหมู่ *</label><select id="f-category" required><option value="">-- เลือก --</option>
              ${Object.keys(CATEGORIES).map(k => `<option value="${k}">${CATEGORIES[k].icon} ${CATEGORIES[k].name}</option>`).join('')}</select></div>
              <div class="form-group"><label>URL รูปภาพ</label><input type="url" id="f-img" placeholder="https://..."></div>
              <div class="form-group"><label>คำอธิบาย</label><textarea id="f-desc" rows="3"></textarea></div>
              <div class="form-group checkbox"><label><input type="checkbox" id="f-featured"> ⭐ สินค้าแนะนำ</label></div>
              <div class="form-actions"><button type="submit" class="btn btn-primary">💾 บันทึก</button><button type="button" class="btn btn-ghost" id="modal-cancel">ยกเลิก</button></div>
            </form>
          </div>
        </div>`;
      this.renderProductList();
      this.attachEvents();
    },
    renderProductList() {
      const tbody = document.getElementById('admin-product-list');
      if (!tbody) return;
      const products = ProductService.getAll();
      tbody.innerHTML = products.map(p => {
        const cat = CATEGORIES[p.category] || { name: p.category, icon: '📦' };
        const stockClass = p.stock === 0 ? 'danger' : p.stock <= 10 ? 'warning' : '';
        return `<tr><td><img src="${p.img}" class="thumb"></td><td><strong>${p.title}</strong></td><td>${cat.icon} ${cat.name}</td>
        <td>${UI.formatPrice(p.price)}</td><td class="${stockClass}">${p.stock}</td><td>${p.featured ? '⭐' : '-'}</td>
        <td class="actions"><button class="btn-sm edit" data-action="edit" data-id="${p.id}">✏️</button>
        <button class="btn-sm delete" data-action="delete" data-id="${p.id}">🗑️</button></td></tr>`;
      }).join('');
      tbody.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener('click', () => this.openEditModal(btn.dataset.id)));
      tbody.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener('click', () => this.deleteProduct(btn.dataset.id)));
    },
    attachEvents() {
      document.getElementById('btn-add-product')?.addEventListener('click', () => this.openAddModal());
      document.getElementById('btn-reset-products')?.addEventListener('click', () => this.resetProducts());
      document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
      document.getElementById('modal-cancel')?.addEventListener('click', () => this.closeModal());
      document.getElementById('product-form')?.addEventListener('submit', (e) => this.handleSubmit(e));
      document.getElementById('product-modal')?.addEventListener('click', (e) => { if (e.target.id === 'product-modal') this.closeModal(); });
    },
    openAddModal() {
      this.currentEditId = null;
      document.getElementById('modal-title').textContent = '➕ เพิ่มสินค้าใหม่';
      document.getElementById('product-form').reset();
      document.getElementById('product-modal').classList.remove('hidden');
    },
    openEditModal(id) {
      const p = ProductService.getById(id);
      if (!p) return;
      this.currentEditId = id;
      document.getElementById('modal-title').textContent = '✏️ แก้ไขสินค้า';
      document.getElementById('f-title').value = p.title;
      document.getElementById('f-price').value = p.price;
      document.getElementById('f-stock').value = p.stock;
      document.getElementById('f-category').value = p.category;
      document.getElementById('f-img').value = p.img || '';
      document.getElementById('f-desc').value = p.desc || '';
      document.getElementById('f-featured').checked = p.featured || false;
      document.getElementById('product-modal').classList.remove('hidden');
    },
    closeModal() { document.getElementById('product-modal')?.classList.add('hidden'); this.currentEditId = null; },
    handleSubmit(e) {
      e.preventDefault();
      const data = {
        title: document.getElementById('f-title').value.trim(),
        price: parseInt(document.getElementById('f-price').value) || 0,
        stock: parseInt(document.getElementById('f-stock').value) || 0,
        category: document.getElementById('f-category').value,
        img: document.getElementById('f-img').value.trim() || 'https://via.placeholder.com/400x300?text=No+Image',
        desc: document.getElementById('f-desc').value.trim(),
        featured: document.getElementById('f-featured').checked
      };
      if (this.currentEditId) {
        ProductService.updateProduct(this.currentEditId, data);
        UI.showToast('อัปเดตสินค้าแล้ว ✓');
      } else {
        ProductService.addProduct(data);
        UI.showToast('เพิ่มสินค้าแล้ว ✓');
      }
      this.closeModal();
      this.render('admin-panel');
    },
    deleteProduct(id) {
      const p = ProductService.getById(id);
      if (confirm(`ลบสินค้า "${p?.title}" ?`)) {
        ProductService.deleteProduct(id);
        UI.showToast('ลบสินค้าแล้ว');
        this.renderProductList();
        this.render('admin-panel');
      }
    },
    resetProducts() {
      if (confirm('รีเซ็ตสินค้าทั้งหมดเป็นค่าเริ่มต้น?')) {
        ProductService.resetToDefault();
        UI.showToast('รีเซ็ตข้อมูลแล้ว');
        this.render('admin-panel');
      }
    }
  };

  // ============================================================
  // APP INIT
  // ============================================================
  function initApp() {
    console.log('🛠️ Fei Yi Shop v3 - Initializing...');

    // Home page
    if (document.getElementById('featured-grid')) {
      ProductGrid.renderFeatured('featured-grid');
    }
    if (document.getElementById('category-tabs')) {
      CategoryTabs.render('category-tabs', 'all-products-grid');
    }
    if (document.getElementById('all-products-grid')) {
      ProductGrid.render('all-products-grid');
    }

    // Product detail page
    if (document.getElementById('product-detail')) {
      ProductDetail.render('product-detail');
    }

    // Admin page
    if (document.getElementById('admin-panel')) {
      AdminPanel.render('admin-panel');
    }

    CartPanel.init();
    CartBadge.update();
    console.log('✅ Fei Yi Shop v3 - Ready!');
  }

  // Expose API
  window.FeiyiApp = { cart: Cart, products: ProductService, ui: UI, admin: AdminPanel };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
  else initApp();

})();