// ============================================================
// SHARED UTILITIES & SERVICES
// Fei Yi Shop v5
// ============================================================

const CONFIG = {
  STORE_NAME: 'Fei Yi Shop',
  STORE_SLOGAN: 'เครื่องมือดี คู่ช่างไทย',
  LINE_ID: '@feiyi',
  PHONE: '089-123-4567',
  CURRENCY: '฿',
  PRODUCTS_STORAGE_KEY: 'feiyi_products_v5',
  CATEGORIES_STORAGE_KEY: 'feiyi_categories_v5',
  CART_STORAGE_KEY: 'feiyi_cart_v5'
};

// Default Data
const DEFAULT_CATEGORIES = {
  electric: { name: 'เครื่องมือไฟฟ้า', icon: '⚡' },
  auto: { name: 'เครื่องมือซ่อมรถ', icon: '🚗' },
  hand: { name: 'เครื่องมือช่างทั่วไป', icon: '🔧' },
  carpenter: { name: 'เครื่องมือช่างไม้', icon: '🪚' }
};

const DEFAULT_PRODUCTS = [
  { id: 'prod_1', title: 'สว่านไฟฟ้าไร้สาย 48V', price: 1290, category: 'electric', stock: 25, featured: true, desc: 'สว่านไร้สายพลังสูง แบตอึด ทนทาน เหมาะงานหนัก', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', images: [] },
  { id: 'prod_2', title: 'บล็อกลมแรงบิดสูง', price: 2590, category: 'auto', stock: 12, featured: true, desc: 'บล็อกลมสำหรับงานอู่รถ แรงบิดสูง ประหยัดเวลา', img: 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=400', images: [] },
  { id: 'prod_3', title: 'ชุดประแจหกเหลี่ยม 12 ตัว', price: 890, category: 'hand', stock: 45, featured: true, desc: 'ชุดประแจครบทุกขนาด เหมาะสำหรับงานบ้านและอู่ช่าง', img: 'https://images.unsplash.com/photo-1581147036324-c17ac41f4e85?w=400', images: [] },
  { id: 'prod_4', title: 'เครื่องเจียร 4 นิ้ว', price: 450, category: 'electric', stock: 30, featured: false, desc: 'เครื่องเจียร 4 นิ้วกำลังดี ใช้งานต่อเนื่อง แข็งแรง', img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400', images: [] },
  { id: 'prod_5', title: 'คีมปากจิ้งจกเหล็กกล้า', price: 190, category: 'hand', stock: 100, featured: false, desc: 'คีมปากจิ้งจก ออกแบบจับถนัด ทนทาน ไม่ลื่น', img: 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=400', images: [] }
];

// ============================================================
// UI UTILITIES
// ============================================================
const UI = {
  formatPrice(price) {
    return CONFIG.CURRENCY + price.toLocaleString();
  },
  
  toast(msg, type = 'success') {
    let t = document.querySelector('.toast-notification');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast-notification';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = `toast-notification show ${type}`;
    setTimeout(() => t.classList.remove('show'), 3000);
  }
};

// ============================================================
// FIREBASE SERVICE
// ============================================================
const FirebaseService = {
  async getProducts() {
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
    try {
      if (product.id && !product.id.startsWith('prod_')) {
        await db.collection('products').doc(product.id).set(product);
      } else {
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
    try {
      await db.collection('products').doc(id).delete();
      return true;
    } catch (e) {
      console.error('Error deleting product:', e);
      return false;
    }
  },

  async setAllProducts(products) {
    try {
      const batch = db.batch();
      const snapshot = await db.collection('products').get();
      snapshot.forEach(doc => batch.delete(doc.ref));
      products.forEach(p => {
        const ref = db.collection('products').doc(p.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
        batch.set(ref, p);
      });
      await batch.commit();
      return true;
    } catch (e) {
      console.error('Error setting products:', e);
      return false;
    }
  },

  async getCategories() {
    try {
      const doc = await db.collection('settings').doc('categories').get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error('Error getting categories:', e);
      return null;
    }
  },

  async saveCategories(categories) {
    try {
      await db.collection('settings').doc('categories').set(categories);
      return true;
    } catch (e) {
      console.error('Error saving categories:', e);
      return false;
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
    return DEFAULT_CATEGORIES;
  },
  
  save(categories) {
    localStorage.setItem(CONFIG.CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    FirebaseService.saveCategories(categories);
  },
  
  getAll() {
    const cats = this.load();
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
    return DEFAULT_PRODUCTS;
  },
  
  save(products) {
    localStorage.setItem(CONFIG.PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    FirebaseService.setAllProducts(products);
  },
  
  getAll() {
    return this.load().sort((a, b) => a.title.localeCompare(b.title, 'th'));
  },
  
  getById(id) { return this.load().find(p => p.id === id) || null; },
  
  getByCategory(cat) {
    return this.load().filter(p => p.category === cat).sort((a, b) => a.title.localeCompare(b.title, 'th'));
  },
  
  getFeatured() {
    return this.load().filter(p => p.featured).sort((a, b) => a.title.localeCompare(b.title, 'th'));
  },
  
  add(product) {
    const products = this.load();
    product.id = 'prod_' + Date.now();
    products.push(product);
    this.save(products);
    return product;
  },
  
  update(id, data) {
    const products = this.load();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...data };
      this.save(products);
    }
  },
  
  delete(id) {
    let products = this.load();
    products = products.filter(p => p.id !== id);
    this.save(products);
    FirebaseService.deleteProduct(id);
  },
  
  reset() {
    this.save(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
};

// ============================================================
// CART SERVICE
// ============================================================
const Cart = {
  listeners: [],
  
  load() {
    const saved = localStorage.getItem(CONFIG.CART_STORAGE_KEY);
    if (saved) try { return JSON.parse(saved); } catch(e) {}
    return [];
  },
  
  save(cart) {
    localStorage.setItem(CONFIG.CART_STORAGE_KEY, JSON.stringify(cart));
    this.listeners.forEach(fn => fn());
  },
  
  add(productId, qty = 1) {
    const cart = this.load();
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += qty;
    else cart.push({ id: productId, qty });
    this.save(cart);
  },
  
  updateQty(productId, qty) {
    const cart = this.load();
    const item = cart.find(i => i.id === productId);
    if (item) { item.qty = Math.max(1, qty); this.save(cart); }
  },
  
  remove(productId) {
    let cart = this.load();
    cart = cart.filter(i => i.id !== productId);
    this.save(cart);
  },
  
  clear() { this.save([]); },
  
  getTotal() { return this.load().reduce((s, i) => s + i.qty, 0); },
  
  getTotalPrice() {
    return this.load().reduce((s, i) => {
      const p = ProductService.getById(i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  },
  
  getDetails() {
    return this.load().map(i => {
      const p = ProductService.getById(i.id);
      return p ? { product: p, qty: i.qty, subtotal: p.price * i.qty } : null;
    }).filter(Boolean);
  },
  
  isEmpty() { return this.load().length === 0; },
  
  subscribe(fn) { this.listeners.push(fn); }
};

// ============================================================
// DATA SYNC
// ============================================================
const DataSync = {
  async syncAll() {
    console.log('🔄 Syncing from Firebase...');
    try {
      const [products, categories] = await Promise.all([
        FirebaseService.getProducts(),
        FirebaseService.getCategories()
      ]);
      
      if (products && products.length > 0) {
        localStorage.setItem(CONFIG.PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        console.log(`✅ Synced ${products.length} products`);
      }
      
      if (categories && Object.keys(categories).length > 0) {
        localStorage.setItem(CONFIG.CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        console.log(`✅ Synced categories`);
      }
      
      return { products: !!products, categories: !!categories };
    } catch (e) {
      console.error('Sync error:', e);
      return { products: false, categories: false };
    }
  },

  async initializeFirebaseData() {
    try {
      const products = await FirebaseService.getProducts();
      if (!products || products.length === 0) {
        console.log('📤 Uploading default data to Firebase...');
        await FirebaseService.setAllProducts(DEFAULT_PRODUCTS);
        await FirebaseService.saveCategories(DEFAULT_CATEGORIES);
        console.log('✅ Default data uploaded');
      }
    } catch (e) {
      console.error('Initialize error:', e);
    }
  }
};

console.log('📦 Shared utilities loaded');
