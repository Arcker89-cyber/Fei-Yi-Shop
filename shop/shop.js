// ============================================================
// SHOP.JS - Frontend Store Logic
// Fei Yi Shop v5
// ============================================================

(function() {
  'use strict';

  // ============================================================
  // PRODUCT GRID
  // ============================================================
  const ProductGrid = {
    render(containerId, products = null) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const list = products || ProductService.getAll();
      if (list.length === 0) {
        c.innerHTML = '<div class="no-products">ไม่พบสินค้า</div>';
        return;
      }
      c.innerHTML = list.map(p => this.card(p)).join('');
      this.attachEvents(c);
    },

    renderFeatured(containerId) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const list = ProductService.getFeatured();
      c.innerHTML = list.map(p => this.card(p)).join('');
      this.attachEvents(c);
    },

    renderByCategory(containerId, cat) {
      const c = document.getElementById(containerId);
      if (!c) return;
      const list = ProductService.getByCategory(cat);
      c.innerHTML = list.length ? list.map(p => this.card(p)).join('') : '<div class="no-products">ไม่มีสินค้าในหมวดนี้</div>';
      this.attachEvents(c);
    },

    card(p) {
      const cat = CategoryService.get(p.category) || { name: p.category, icon: '📦' };
      const stockClass = p.stock === 0 ? 'out-of-stock' : '';
      return `
        <div class="product-card ${stockClass}">
          <a href="product.html?id=${p.id}">
            <img src="${p.img}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            ${p.featured ? '<span class="featured-badge">⭐ แนะนำ</span>' : ''}
            ${p.stock === 0 ? '<span class="stock-badge">สินค้าหมด</span>' : ''}
          </a>
          <div class="card-content">
            <span class="card-category">${cat.icon} ${cat.name}</span>
            <h3><a href="product.html?id=${p.id}">${p.title}</a></h3>
            <div class="price">${UI.formatPrice(p.price)}</div>
            <p class="desc">${p.desc || ''}</p>
            <div class="card-actions">
              <button class="buy-btn" data-add="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>🛒 หยิบใส่ตะกร้า</button>
            </div>
          </div>
        </div>`;
    },

    attachEvents(container) {
      container.querySelectorAll('[data-add]').forEach(btn => {
        btn.onclick = () => {
          Cart.add(btn.dataset.add);
          UI.toast('เพิ่มลงตะกร้าแล้ว ✓');
          CartBadge.update();
        };
      });
    }
  };

  // ============================================================
  // CATEGORY TABS
  // ============================================================
  const CategoryTabs = {
    render(tabsId, gridId) {
      const tabs = document.getElementById(tabsId);
      const grid = document.getElementById(gridId);
      if (!tabs || !grid) return;

      const cats = CategoryService.getAll();
      tabs.innerHTML = `<button class="cat-tab active" data-cat="all">📦 ทั้งหมด</button>` +
        Object.entries(cats).map(([k, v]) => 
          `<button class="cat-tab" data-cat="${k}">${v.icon} ${v.name}</button>`
        ).join('');

      tabs.querySelectorAll('.cat-tab').forEach(btn => {
        btn.onclick = () => {
          tabs.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (btn.dataset.cat === 'all') ProductGrid.render(gridId);
          else ProductGrid.renderByCategory(gridId, btn.dataset.cat);
        };
      });

      ProductGrid.render(gridId);
    }
  };

  // ============================================================
  // PRODUCT DETAIL
  // ============================================================
  const ProductDetail = {
    currentImageIndex: 0,

    render(containerId) {
      const c = document.getElementById(containerId);
      if (!c) return;

      const id = new URLSearchParams(location.search).get('id');
      const p = ProductService.getById(id);
      
      if (!p) {
        c.innerHTML = `<div class="not-found"><h2>ไม่พบสินค้า</h2><a href="index.html" class="btn btn-primary">← กลับหน้าหลัก</a></div>`;
        return;
      }

      const cat = CategoryService.get(p.category) || { name: p.category, icon: '📦' };
      const stockClass = p.stock === 0 ? 'out-of-stock' : p.stock <= 10 ? 'low-stock' : '';
      const images = p.images && p.images.length > 0 ? p.images : [p.img];
      this.currentImageIndex = 0;

      c.innerHTML = `
        <div class="detail-image-section">
          <div class="main-image-container">
            <img id="main-product-image" src="${images[0]}" alt="${p.title}" class="main-image">
            <button class="zoom-btn" id="btn-zoom">🔍 ขยาย</button>
            ${p.featured ? '<span class="featured-badge large">⭐ แนะนำ</span>' : ''}
            ${images.length > 1 ? `
              <button class="gallery-nav prev" id="gallery-prev">❮</button>
              <button class="gallery-nav next" id="gallery-next">❯</button>
            ` : ''}
          </div>
          ${images.length > 1 ? `
            <div class="thumbnail-gallery" id="thumbnail-gallery">
              ${images.map((img, i) => `
                <img src="${img}" class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" alt="รูปที่ ${i + 1}">
              `).join('')}
            </div>
          ` : ''}
          <p class="image-hint">📷 คลิกที่รูปเพื่อขยายดูรายละเอียด</p>
        </div>
        <div class="detail-info">
          <span class="category-tag">${cat.icon} ${cat.name}</span>
          <h1>${p.title}</h1>
          <div class="price">${UI.formatPrice(p.price)}</div>
          <div class="stock-info ${stockClass}">${p.stock > 0 ? `✓ มีสินค้า (${p.stock} ชิ้น)` : '✗ สินค้าหมด'}</div>
          <p class="desc">${p.desc || ''}</p>
          <div class="detail-actions">
            <button id="d-add" class="buy-btn large" ${p.stock === 0 ? 'disabled' : ''}>🛒 เพิ่มลงตะกร้า</button>
            <button id="d-line" class="line-btn large">💬 สั่งผ่าน LINE</button>
          </div>
        </div>
        
        <!-- Lightbox Modal -->
        <div id="lightbox" class="lightbox hidden">
          <div class="lightbox-content">
            <button class="lightbox-close" id="lightbox-close">✕</button>
            <img id="lightbox-image" src="" alt="Zoom">
            ${images.length > 1 ? `
              <button class="lightbox-nav prev" id="lightbox-prev">❮</button>
              <button class="lightbox-nav next" id="lightbox-next">❯</button>
              <div class="lightbox-counter"><span id="lightbox-counter">1</span> / ${images.length}</div>
            ` : ''}
          </div>
        </div>
      `;

      this.attachEvents(p, images);
    },

    attachEvents(product, images) {
      const mainImg = document.getElementById('main-product-image');
      const lightbox = document.getElementById('lightbox');
      const lightboxImg = document.getElementById('lightbox-image');
      const lightboxCounter = document.getElementById('lightbox-counter');
      const self = this;

      // Lightbox
      const openLightbox = () => {
        lightboxImg.src = images[self.currentImageIndex];
        lightbox.classList.remove('hidden');
        if (lightboxCounter) lightboxCounter.textContent = self.currentImageIndex + 1;
      };

      mainImg?.addEventListener('click', openLightbox);
      document.getElementById('btn-zoom')?.addEventListener('click', openLightbox);
      document.getElementById('lightbox-close')?.addEventListener('click', () => lightbox.classList.add('hidden'));
      lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.add('hidden'); });

      // Gallery Navigation
      const updateMainImage = (index) => {
        self.currentImageIndex = index;
        mainImg.src = images[index];
        document.querySelectorAll('.thumbnail').forEach((t, i) => t.classList.toggle('active', i === index));
        if (lightboxImg) lightboxImg.src = images[index];
        if (lightboxCounter) lightboxCounter.textContent = index + 1;
      };

      document.querySelectorAll('.thumbnail').forEach(t => {
        t.addEventListener('click', () => updateMainImage(parseInt(t.dataset.index)));
      });

      document.getElementById('gallery-prev')?.addEventListener('click', () => {
        updateMainImage(self.currentImageIndex > 0 ? self.currentImageIndex - 1 : images.length - 1);
      });

      document.getElementById('gallery-next')?.addEventListener('click', () => {
        updateMainImage(self.currentImageIndex < images.length - 1 ? self.currentImageIndex + 1 : 0);
      });

      document.getElementById('lightbox-prev')?.addEventListener('click', () => {
        updateMainImage(self.currentImageIndex > 0 ? self.currentImageIndex - 1 : images.length - 1);
      });

      document.getElementById('lightbox-next')?.addEventListener('click', () => {
        updateMainImage(self.currentImageIndex < images.length - 1 ? self.currentImageIndex + 1 : 0);
      });

      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('hidden')) {
          if (e.key === 'Escape') lightbox.classList.add('hidden');
          if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev')?.click();
          if (e.key === 'ArrowRight') document.getElementById('lightbox-next')?.click();
        }
      });

      // Add to cart / LINE
      document.getElementById('d-add')?.addEventListener('click', () => {
        Cart.add(product.id);
        UI.toast('เพิ่มลงตะกร้าแล้ว ✓');
        CartBadge.update();
      });

      document.getElementById('d-line')?.addEventListener('click', () => {
        const msg = `สั่งซื้อ: ${product.title} x1 (${CONFIG.STORE_NAME})`;
        window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
      });
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
    open() { 
      ['cart-panel', 'cart-panel-2'].forEach(id => document.getElementById(id)?.classList.remove('hidden')); 
      this.render(); 
    },
    
    close() { 
      ['cart-panel', 'cart-panel-2'].forEach(id => document.getElementById(id)?.classList.add('hidden')); 
    },
    
    toggle() { 
      const p = document.getElementById('cart-panel') || document.getElementById('cart-panel-2'); 
      if (p) { 
        p.classList.toggle('hidden'); 
        if (!p.classList.contains('hidden')) this.render(); 
      }
    },
    
    render() {
      const containers = [document.getElementById('cart-items'), document.getElementById('cart-items-2')].filter(Boolean);
      const items = Cart.getDetails();
      
      containers.forEach(c => {
        if (!items.length) { 
          c.innerHTML = `<div class="empty-cart">🛒<br>ตะกร้าว่าง<br><a href="index.html">เลือกซื้อสินค้า →</a></div>`; 
          return; 
        }
        c.innerHTML = items.map(i => `
          <div class="cart-item">
            <img src="${i.product.img}" alt="${i.product.title}">
            <div class="meta">
              <div class="item-title">${i.product.title}</div>
              <div class="item-price">${UI.formatPrice(i.product.price)} x 
                <input type="number" min="1" value="${i.qty}" data-qty="${i.product.id}">
              </div>
            </div>
            <div class="item-subtotal">${UI.formatPrice(i.subtotal)}</div>
            <button class="remove-btn" data-rm="${i.product.id}">✕</button>
          </div>
        `).join('');
        
        c.querySelectorAll('[data-qty]').forEach(inp => inp.onchange = () => { 
          Cart.updateQty(inp.dataset.qty, parseInt(inp.value) || 1); 
          this.render(); 
        });
        c.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { 
          Cart.remove(b.dataset.rm); 
          this.render(); 
        });
      });
      
      CartBadge.update();
    },
    
    checkout() { 
      if (Cart.isEmpty()) { alert('ตะกร้าว่าง'); return; } 
      const items = Cart.getDetails();
      const lines = items.map(i => `${i.product.title} x${i.qty} = ${UI.formatPrice(i.subtotal)}`);
      const total = Cart.getTotalPrice();
      const msg = `สั่งซื้อจาก ${CONFIG.STORE_NAME}:\n${lines.join('\n')}\nรวม ${UI.formatPrice(total)}\nLINE: ${CONFIG.LINE_ID}`;
      window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
    },
    
    clearCart() { 
      if (confirm('ล้างตะกร้า?')) { 
        Cart.clear(); 
        this.render(); 
      }
    },
    
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
  // INIT
  // ============================================================
  async function init() {
    console.log('🛒 Shop v5 - Initializing...');
    
    // Sync data from Firebase
    await DataSync.initializeFirebaseData();
    await DataSync.syncAll();
    
    // Render components
    if (document.getElementById('featured-grid')) ProductGrid.renderFeatured('featured-grid');
    if (document.getElementById('category-tabs')) CategoryTabs.render('category-tabs', 'all-products-grid');
    if (document.getElementById('all-products-grid') && !document.getElementById('category-tabs')) ProductGrid.render('all-products-grid');
    if (document.getElementById('product-detail')) ProductDetail.render('product-detail');
    
    CartPanel.init();
    
    console.log('✅ Shop v5 - Ready');
  }

  // Start
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
