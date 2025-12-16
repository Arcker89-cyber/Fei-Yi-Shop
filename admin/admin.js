// ============================================================
// ADMIN.JS - Backend Admin Logic with Firebase Auth
// Fei Yi Shop v5
// ============================================================

(function() {
  'use strict';

  // ============================================================
  // AUTH SERVICE
  // ============================================================
  const AuthService = {
    currentUser: null,

    init() {
      return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
          this.currentUser = user;
          if (user) {
            console.log('✅ Logged in as:', user.email);
          } else {
            console.log('❌ Not logged in');
          }
          resolve(user);
        });
      });
    },

    async login(email, password) {
      try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        this.currentUser = result.user;
        return { success: true, user: result.user };
      } catch (error) {
        console.error('Login error:', error);
        let message = 'เข้าสู่ระบบไม่สำเร็จ';
        switch (error.code) {
          case 'auth/invalid-email':
            message = 'รูปแบบอีเมลไม่ถูกต้อง';
            break;
          case 'auth/user-disabled':
            message = 'บัญชีนี้ถูกระงับ';
            break;
          case 'auth/user-not-found':
            message = 'ไม่พบบัญชีนี้ในระบบ';
            break;
          case 'auth/wrong-password':
            message = 'รหัสผ่านไม่ถูกต้อง';
            break;
          case 'auth/invalid-credential':
            message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            break;
        }
        return { success: false, error: message };
      }
    },

    async logout() {
      try {
        await auth.signOut();
        this.currentUser = null;
        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
      }
    },

    isLoggedIn() {
      return !!this.currentUser;
    },

    getUser() {
      return this.currentUser;
    }
  };

  // ============================================================
  // IMAGE HANDLER
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
    
    resize(base64, maxWidth = 800, maxHeight = 600) {
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
  // LOGIN PAGE
  // ============================================================
  const LoginPage = {
    render() {
      const container = document.getElementById('login-container');
      if (!container) return;

      container.innerHTML = `
        <div class="login-box">
          <div class="login-header">
            <div class="logo-box">FY</div>
            <h1>Fei Yi Shop</h1>
            <p>ระบบจัดการร้านค้า</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label>📧 อีเมล</label>
              <input type="email" id="login-email" required placeholder="admin@example.com">
            </div>
            <div class="form-group">
              <label>🔒 รหัสผ่าน</label>
              <input type="password" id="login-password" required placeholder="••••••••">
            </div>
            <div id="login-error" class="error-message hidden"></div>
            <button type="submit" class="btn btn-primary btn-block" id="login-btn">
              🔐 เข้าสู่ระบบ
            </button>
          </form>
          <div class="login-footer">
            <a href="../shop/index.html">← กลับหน้าร้านค้า</a>
          </div>
        </div>
      `;

      document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');

        btn.disabled = true;
        btn.textContent = '⏳ กำลังเข้าสู่ระบบ...';
        errorDiv.classList.add('hidden');

        const result = await AuthService.login(email, password);

        if (result.success) {
          window.location.href = 'admin.html';
        } else {
          errorDiv.textContent = result.error;
          errorDiv.classList.remove('hidden');
          btn.disabled = false;
          btn.textContent = '🔐 เข้าสู่ระบบ';
        }
      });
    }
  };

  // ============================================================
  // ADMIN PANEL
  // ============================================================
  const AdminPanel = {
    editId: null,
    editCatId: null,
    tempImages: [],
    currentCategoryFilter: 'all',

    render(containerId) {
      const c = document.getElementById(containerId);
      if (!c) return;

      const user = AuthService.getUser();
      const products = ProductService.getAll();
      const cats = CategoryService.getAll();
      const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = products.filter(p => p.stock === 0).length;

      c.innerHTML = `
        <!-- Admin Header -->
        <div class="admin-header">
          <div class="admin-user-info">
            <span>👤 ${user?.email || 'Admin'}</span>
            <button id="btn-logout" class="btn btn-ghost btn-sm">🚪 ออกจากระบบ</button>
          </div>
          <h2>🛠️ ระบบจัดการสินค้า</h2>
          <div class="admin-stats">
            <div class="stat-box"><span class="stat-num">${products.length}</span><span class="stat-label">สินค้าทั้งหมด</span></div>
            <div class="stat-box"><span class="stat-num">${Object.keys(cats).length}</span><span class="stat-label">หมวดหมู่</span></div>
            <div class="stat-box warning"><span class="stat-num">${lowStock}</span><span class="stat-label">ใกล้หมด</span></div>
            <div class="stat-box danger"><span class="stat-num">${outOfStock}</span><span class="stat-label">หมดสต๊อก</span></div>
          </div>
        </div>

        <!-- Category Section -->
        <div class="admin-section">
          <h3>🏷️ จัดการหมวดหมู่</h3>
          <div class="category-list" id="category-list"></div>
          <button id="btn-add-cat" class="btn btn-ghost" style="margin-top:12px;">➕ เพิ่มหมวดหมู่</button>
        </div>

        <!-- Products Section -->
        <div class="admin-section">
          <h3>📦 รายการสินค้า</h3>
          
          <div class="admin-actions">
            <button id="btn-add-product" class="btn btn-primary">➕ เพิ่มสินค้าใหม่</button>
            <button id="btn-sync" class="btn btn-success">🔄 Sync จาก Firebase</button>
            <button id="btn-export" class="btn btn-ghost">📤 Export CSV</button>
            <button id="btn-import" class="btn btn-ghost">📥 Import CSV</button>
            <button id="btn-reset" class="btn btn-ghost">🗑️ ลบข้อมูลทั้งหมด</button>
          </div>

          <div class="filter-bar">
            <label>🔍 กรองหมวดหมู่:</label>
            <select id="admin-category-filter" class="filter-dropdown"></select>
            <span id="product-count" class="product-count"></span>
          </div>

          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead><tr><th>รูป</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต๊อก</th><th>แนะนำ</th><th>จัดการ</th></tr></thead>
              <tbody id="product-list"></tbody>
            </table>
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
              
              <div class="form-group">
                <label>รูปภาพสินค้า (สูงสุด 5 รูป)</label>
                <div class="image-upload-box">
                  <div class="upload-tabs">
                    <button type="button" class="upload-tab active" data-tab="upload">📁 อัปโหลดไฟล์</button>
                    <button type="button" class="upload-tab" data-tab="url">🔗 ใส่ลิงก์</button>
                  </div>
                  <div class="upload-content" id="tab-upload">
                    <input type="file" id="f-img-file" accept="image/*" multiple>
                    <p class="upload-hint">รองรับ JPG, PNG, GIF (เลือกได้หลายไฟล์)</p>
                  </div>
                  <div class="upload-content hidden" id="tab-url">
                    <input type="url" id="f-img-url" placeholder="https://example.com/image.jpg">
                    <button type="button" id="btn-add-url" class="btn btn-ghost" style="margin-top:8px;">➕ เพิ่มลิงก์</button>
                  </div>
                  <div class="image-gallery-preview" id="img-gallery-preview"></div>
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

        <!-- Confirm Delete Modal -->
        <div id="confirm-modal" class="modal hidden">
          <div class="modal-content" style="max-width:480px;text-align:center;">
            <div style="padding:30px;">
              <div style="font-size:60px;margin-bottom:16px;">⚠️</div>
              <h3 style="margin-bottom:16px;color:#dc3545;">ยืนยันการลบข้อมูล</h3>
              <p style="color:#333;margin-bottom:12px;font-size:16px;">คุณต้องการลบข้อมูลสินค้าและหมวดหมู่ทั้งหมดหรือไม่?</p>
              <p style="color:#999;font-size:14px;margin-bottom:24px;">ข้อมูลจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้น<br>การกระทำนี้ไม่สามารถยกเลิกได้!</p>
              <div style="display:flex;gap:12px;justify-content:center;">
                <button id="btn-confirm-delete" class="btn" style="background:#dc3545;color:white;">🗑️ ลบข้อมูลทั้งหมด</button>
                <button id="btn-confirm-cancel" class="btn btn-ghost">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Modal -->
        <div id="export-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header"><h3>📤 Export ข้อมูล</h3><button class="close-btn" id="export-modal-close">✕</button></div>
            <div style="padding:20px;">
              <p style="margin-bottom:16px;color:#666;">ส่งออกข้อมูลสินค้าเป็นไฟล์ CSV (เปิดด้วย Excel ได้)</p>
              <div class="form-actions">
                <button id="btn-export-products" class="btn btn-primary">📦 ดาวน์โหลด CSV สินค้า</button>
                <button id="btn-export-categories" class="btn btn-ghost">🏷️ ดาวน์โหลด JSON หมวดหมู่</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Import Modal -->
        <div id="import-modal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header"><h3>📥 Import ข้อมูล</h3><button class="close-btn" id="import-modal-close">✕</button></div>
            <div style="padding:20px;">
              <p style="margin-bottom:16px;color:#666;">นำเข้าข้อมูลสินค้าจากไฟล์ CSV</p>
              <div class="form-group">
                <label>อัปโหลดไฟล์ CSV</label>
                <input type="file" id="import-file" accept=".csv,.json">
              </div>
              <div class="form-group">
                <label>ตัวอย่างข้อมูล</label>
                <textarea id="import-data" rows="6" readonly placeholder="อัปโหลดไฟล์แล้วจะแสดงตัวอย่างที่นี่..."></textarea>
              </div>
              <div class="form-group checkbox">
                <label><input type="checkbox" id="import-replace"> แทนที่ข้อมูลเดิมทั้งหมด</label>
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
      this.renderCategoryFilter();
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

    renderCategoryFilter() {
      const select = document.getElementById('admin-category-filter');
      if (!select) return;
      const cats = CategoryService.getAll();
      const allProducts = ProductService.load();

      let html = `<option value="all">📦 ทั้งหมด (${allProducts.length})</option>`;
      Object.entries(cats).forEach(([id, cat]) => {
        const count = allProducts.filter(p => p.category === id).length;
        html += `<option value="${id}">${cat.icon} ${cat.name} (${count})</option>`;
      });

      select.innerHTML = html;
      select.value = this.currentCategoryFilter;

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

      if (this.currentCategoryFilter !== 'all') {
        products = products.filter(p => p.category === this.currentCategoryFilter);
      }

      const countEl = document.getElementById('product-count');
      if (countEl) countEl.textContent = `แสดง ${products.length} รายการ`;

      if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#999;">ไม่พบสินค้า</td></tr>`;
        return;
      }

      tbody.innerHTML = products.map(p => {
        const cat = cats[p.category] || { name: p.category, icon: '📦' };
        const stockClass = p.stock === 0 ? 'danger' : p.stock <= 10 ? 'warning' : '';
        return `<tr>
          <td><img src="${p.img}" class="thumb" onerror="this.src='https://via.placeholder.com/60x45?text=No'"></td>
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
      // Logout
      document.getElementById('btn-logout')?.addEventListener('click', async () => {
        if (confirm('ต้องการออกจากระบบ?')) {
          await AuthService.logout();
          window.location.href = 'login.html';
        }
      });

      // Product modal
      document.getElementById('btn-add-product')?.addEventListener('click', () => this.openProductModal());
      document.getElementById('modal-close')?.addEventListener('click', () => this.closeProductModal());
      document.getElementById('modal-cancel')?.addEventListener('click', () => this.closeProductModal());
      document.getElementById('product-modal')?.addEventListener('click', e => { if (e.target.id === 'product-modal') this.closeProductModal(); });
      document.getElementById('product-form')?.addEventListener('submit', e => this.submitProduct(e));

      // Category modal
      document.getElementById('btn-add-cat')?.addEventListener('click', () => this.openCatModal());
      document.getElementById('cat-modal-close')?.addEventListener('click', () => this.closeCatModal());
      document.getElementById('cat-modal-cancel')?.addEventListener('click', () => this.closeCatModal());
      document.getElementById('cat-modal')?.addEventListener('click', e => { if (e.target.id === 'cat-modal') this.closeCatModal(); });
      document.getElementById('cat-form')?.addEventListener('submit', e => this.submitCat(e));

      // Sync
      document.getElementById('btn-sync')?.addEventListener('click', async () => {
        UI.toast('กำลัง Sync จาก Firebase...');
        await DataSync.syncAll();
        UI.toast('Sync สำเร็จ ✓');
        this.render('admin-panel');
      });

      // Reset
      document.getElementById('btn-reset')?.addEventListener('click', () => {
        document.getElementById('confirm-modal')?.classList.remove('hidden');
      });

      document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
        ProductService.reset();
        CategoryService.reset();
        document.getElementById('confirm-modal')?.classList.add('hidden');
        UI.toast('ลบข้อมูลทั้งหมดแล้ว');
        this.render('admin-panel');
      });

      document.getElementById('btn-confirm-cancel')?.addEventListener('click', () => {
        document.getElementById('confirm-modal')?.classList.add('hidden');
      });

      // Upload tabs
      document.querySelectorAll('.upload-tab').forEach(tab => {
        tab.onclick = () => {
          document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById('tab-upload')?.classList.toggle('hidden', tab.dataset.tab !== 'upload');
          document.getElementById('tab-url')?.classList.toggle('hidden', tab.dataset.tab !== 'url');
        };
      });

      // Multiple file upload
      document.getElementById('f-img-file')?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          if (this.tempImages.length >= 5) { alert('สูงสุด 5 รูป'); break; }
          if (file.size > 2 * 1024 * 1024) { alert(`ไฟล์ ${file.name} ใหญ่เกิน 2MB`); continue; }
          const base64 = await ImageHandler.toBase64(file);
          const resized = await ImageHandler.resize(base64);
          this.tempImages.push(resized);
        }
        this.renderGalleryPreview();
      });

      // URL add button
      document.getElementById('btn-add-url')?.addEventListener('click', () => {
        const url = document.getElementById('f-img-url').value.trim();
        if (url && this.tempImages.length < 5) {
          this.tempImages.push(url);
          this.renderGalleryPreview();
          document.getElementById('f-img-url').value = '';
        } else if (this.tempImages.length >= 5) {
          alert('สูงสุด 5 รูป');
        }
      });

      // Export
      document.getElementById('btn-export')?.addEventListener('click', () => {
        document.getElementById('export-modal')?.classList.remove('hidden');
      });
      document.getElementById('export-modal-close')?.addEventListener('click', () => {
        document.getElementById('export-modal')?.classList.add('hidden');
      });
      document.getElementById('btn-export-products')?.addEventListener('click', () => this.exportProducts());
      document.getElementById('btn-export-categories')?.addEventListener('click', () => this.exportCategories());

      // Import
      document.getElementById('btn-import')?.addEventListener('click', () => {
        document.getElementById('import-modal')?.classList.remove('hidden');
      });
      document.getElementById('import-modal-close')?.addEventListener('click', () => {
        document.getElementById('import-modal')?.classList.add('hidden');
      });
      document.getElementById('btn-import-cancel')?.addEventListener('click', () => {
        document.getElementById('import-modal')?.classList.add('hidden');
      });
      document.getElementById('import-file')?.addEventListener('change', (e) => this.handleImportFile(e));
      document.getElementById('btn-do-import')?.addEventListener('click', () => this.doImport());
    },

    renderGalleryPreview() {
      const container = document.getElementById('img-gallery-preview');
      if (!container) return;

      if (this.tempImages.length === 0) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = `
        <div class="gallery-preview-grid">
          ${this.tempImages.map((img, i) => `
            <div class="gallery-preview-item ${i === 0 ? 'main' : ''}">
              <img src="${img}" alt="รูปที่ ${i + 1}">
              <button type="button" class="remove-img-btn" data-idx="${i}">✕</button>
              ${i === 0 ? '<span class="main-badge">รูปหลัก</span>' : ''}
            </div>
          `).join('')}
        </div>
        <p class="gallery-hint">🖼️ รูปแรกจะเป็นรูปหลัก (${this.tempImages.length}/5)</p>
      `;

      container.querySelectorAll('.remove-img-btn').forEach(btn => {
        btn.onclick = () => {
          this.tempImages.splice(parseInt(btn.dataset.idx), 1);
          this.renderGalleryPreview();
        };
      });
    },

    openProductModal(id = null) {
      this.editId = id;
      this.tempImages = [];
      const form = document.getElementById('product-form');
      form?.reset();
      this.updateCategorySelect();
      document.getElementById('img-gallery-preview').innerHTML = '';
      document.getElementById('modal-title').textContent = id ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่';

      if (id) {
        const p = ProductService.getById(id);
        if (p) {
          document.getElementById('f-title').value = p.title;
          document.getElementById('f-price').value = p.price;
          document.getElementById('f-stock').value = p.stock;
          document.getElementById('f-category').value = p.category;
          document.getElementById('f-desc').value = p.desc || '';
          document.getElementById('f-featured').checked = p.featured;
          
          if (p.images && p.images.length > 0) {
            this.tempImages = [...p.images];
          } else if (p.img) {
            this.tempImages = [p.img];
          }
          this.renderGalleryPreview();
        }
      }
      document.getElementById('product-modal')?.classList.remove('hidden');
    },

    closeProductModal() {
      document.getElementById('product-modal')?.classList.add('hidden');
      this.editId = null;
      this.tempImages = [];
    },

    async submitProduct(e) {
      e.preventDefault();
      
      const defaultImg = "https://via.placeholder.com/400x300?text=No+Image";
      const images = this.tempImages.length > 0 ? this.tempImages : [defaultImg];
      const img = images[0];

      const data = {
        title: document.getElementById('f-title').value.trim(),
        price: parseInt(document.getElementById('f-price').value) || 0,
        stock: parseInt(document.getElementById('f-stock').value) || 0,
        category: document.getElementById('f-category').value,
        img,
        images,
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
        this.render('admin-panel');
      }
    },

    openCatModal(id = null) {
      this.editCatId = id;
      const form = document.getElementById('cat-form');
      form?.reset();
      document.getElementById('cat-modal-title').textContent = id ? '✏️ แก้ไขหมวดหมู่' : '➕ เพิ่มหมวดหมู่ใหม่';
      document.getElementById('cf-id').disabled = !!id;

      if (id) {
        const cat = CategoryService.get(id);
        if (cat) {
          document.getElementById('cf-id').value = id;
          document.getElementById('cf-name').value = cat.name;
          document.getElementById('cf-icon').value = cat.icon;
        }
      }
      document.getElementById('cat-modal')?.classList.remove('hidden');
    },

    closeCatModal() {
      document.getElementById('cat-modal')?.classList.add('hidden');
      this.editCatId = null;
    },

    submitCat(e) {
      e.preventDefault();
      const id = document.getElementById('cf-id').value.trim();
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

    exportProducts() {
      const products = ProductService.getAll();
      const headers = ['id', 'title', 'price', 'category', 'stock', 'featured', 'desc', 'img', 'images'];
      
      const rows = products.map(p => {
        const imagesStr = (p.images && p.images.length > 0) ? p.images.join('|') : (p.img || '');
        return [
          p.id || '',
          `"${(p.title || '').replace(/"/g, '""')}"`,
          p.price || 0,
          p.category || '',
          p.stock || 0,
          p.featured ? 'TRUE' : 'FALSE',
          `"${(p.desc || '').replace(/"/g, '""')}"`,
          `"${(p.img || '').replace(/"/g, '""')}"`,
          `"${imagesStr.replace(/"/g, '""')}"`
        ].join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      const bom = '\uFEFF';
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `feiyi_products_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      
      UI.toast('ดาวน์โหลด CSV แล้ว ✓');
      document.getElementById('export-modal')?.classList.add('hidden');
    },

    exportCategories() {
      const categories = CategoryService.getAll();
      const json = JSON.stringify(categories, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `feiyi_categories_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      
      UI.toast('ดาวน์โหลด JSON แล้ว ✓');
      document.getElementById('export-modal')?.classList.add('hidden');
    },

    importedData: null,
    importFileType: null,

    handleImportFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      const isCSV = file.name.toLowerCase().endsWith('.csv');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target.result;
        
        if (isCSV) {
          this.importFileType = 'csv';
          const products = this.parseCSV(content);
          this.importedData = products;
          
          const preview = products.slice(0, 5).map(p => `• ${p.title} - ฿${p.price}`).join('\n');
          document.getElementById('import-data').value = `พบ ${products.length} รายการ:\n\n${preview}${products.length > 5 ? '\n...และอื่นๆ' : ''}`;
        } else {
          this.importFileType = 'json';
          try {
            this.importedData = JSON.parse(content);
            document.getElementById('import-data').value = `พบข้อมูล JSON\n\n${content.substring(0, 300)}...`;
          } catch (err) {
            alert('ไฟล์ JSON ไม่ถูกต้อง');
            return;
          }
        }
        UI.toast('โหลดไฟล์แล้ว ✓');
      };
      reader.readAsText(file);
    },

    parseCSV(csvText) {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) return [];

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const products = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const product = {};
        headers.forEach((header, idx) => {
          let value = values[idx] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"');
          }
          if (header === 'price' || header === 'stock') {
            product[header] = parseInt(value) || 0;
          } else if (header === 'featured') {
            product[header] = value.toUpperCase() === 'TRUE' || value === '1';
          } else if (header === 'images') {
            product[header] = value ? value.split('|').filter(img => img.trim()) : [];
          } else {
            product[header] = value;
          }
        });

        if (!product.id) {
          product.id = 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        }
        if ((!product.images || product.images.length === 0) && product.img) {
          product.images = [product.img];
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

    doImport() {
      if (!this.importedData) {
        alert('กรุณาอัปโหลดไฟล์ก่อน');
        return;
      }

      const replace = document.getElementById('import-replace').checked;

      try {
        if (this.importFileType === 'csv') {
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
          const data = this.importedData;
          if (typeof data === 'object' && !Array.isArray(data)) {
            if (replace) {
              CategoryService.save(data);
            } else {
              const existing = CategoryService.getAll();
              Object.keys(data).forEach(k => { existing[k] = data[k]; });
              CategoryService.save(existing);
            }
            UI.toast('นำเข้าหมวดหมู่แล้ว ✓');
          }
        }

        document.getElementById('import-modal')?.classList.add('hidden');
        this.render('admin-panel');
      } catch (e) {
        alert('เกิดข้อผิดพลาด: ' + e.message);
      }
    }
  };

  // ============================================================
  // INIT
  // ============================================================
  async function initLogin() {
    console.log('🔐 Login Page - Initializing...');
    const user = await AuthService.init();
    
    if (user) {
      // Already logged in, redirect to admin
      window.location.href = 'admin.html';
      return;
    }
    
    LoginPage.render();
    console.log('✅ Login Page - Ready');
  }

  async function initAdmin() {
    console.log('🛠️ Admin Panel - Initializing...');
    const user = await AuthService.init();
    
    if (!user) {
      // Not logged in, redirect to login
      window.location.href = 'login.html';
      return;
    }

    // Sync data
    await DataSync.initializeFirebaseData();
    await DataSync.syncAll();
    
    // Render admin panel
    AdminPanel.render('admin-panel');
    
    console.log('✅ Admin Panel - Ready');
  }

  // Determine which page we're on
  if (document.getElementById('login-container')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLogin);
    else initLogin();
  } else if (document.getElementById('admin-panel')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAdmin);
    else initAdmin();
  }

})();
