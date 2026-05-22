// BIOPEP PH — script.js

const MESSENGER_PAGE = 'biopepph';
const TELEGRAM_USER  = 'biopepph';

let cart = JSON.parse(localStorage.getItem('biopep_cart')) || [];

// ─── CART PERSISTENCE ───────────────────────
function saveCart() {
  localStorage.setItem('biopep_cart', JSON.stringify(cart));
}

// ─── ADD ITEM ────────────────────────────────
function addItem(id, name, price) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`✓ ${name} added!`);
  openCart();
}

// ─── QUANTITY CONTROLS ───────────────────────
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

// ─── RENDER CART ─────────────────────────────
function renderCart() {
  const body      = document.getElementById('drawerBody');
  const emptyEl   = document.getElementById('cartEmpty');
  const foot      = document.getElementById('drawerFoot');
  const badge     = document.getElementById('cartBadge');
  const countTag  = document.getElementById('drawerCount');
  const itemCount = document.getElementById('drawerItemCount');
  const subtotal  = document.getElementById('drawerSubtotal');
  const totalEl   = document.getElementById('drawerTotal');

  const totalQty  = cart.reduce((s, i) => s + i.qty, 0);
  const totalAmt  = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (badge)    badge.textContent    = totalQty;
  if (countTag) countTag.textContent = totalQty;

  if (totalQty === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (foot)    foot.classList.remove('show');
    updateStickyBar(0, 0);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (foot)    foot.classList.add('show');

  // Rebuild items (remove existing .cart-item elements)
  body.querySelectorAll('.cart-item').forEach(el => el.remove());

  cart.forEach(item => {
    const lineTotal = (item.price * item.qty).toLocaleString('en-PH');
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-thumb">🧬</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">₱${item.price.toLocaleString('en-PH')} each</p>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
          <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
        </div>
      </div>
      <span class="cart-item-total">₱${lineTotal}</span>
    `;
    body.insertBefore(el, emptyEl);
  });

  if (itemCount) itemCount.textContent = totalQty;
  if (subtotal)  subtotal.textContent  = `₱${totalAmt.toLocaleString('en-PH')}`;
  if (totalEl)   totalEl.textContent   = `₱${totalAmt.toLocaleString('en-PH')}`;

  updateStickyBar(totalQty, totalAmt);
}

// ─── STICKY BAR ──────────────────────────────
function updateStickyBar(qty, total) {
  const bar       = document.getElementById('stickyBar');
  const countEl   = document.getElementById('stickyCount');
  const itemsEl   = document.getElementById('stickyItems');
  const totalEl   = document.getElementById('stickyTotal');

  if (!bar) return;
  if (countEl) countEl.textContent = qty;
  if (itemsEl) itemsEl.textContent = `${qty} item${qty !== 1 ? 's' : ''}`;
  if (totalEl) totalEl.textContent = `₱${total.toLocaleString('en-PH')}`;

  if (qty > 0) bar.classList.add('show');
  else         bar.classList.remove('show');
}

// ─── CART DRAWER OPEN/CLOSE ──────────────────
function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// ─── ORDER MESSAGES ──────────────────────────
function buildOrderMessage() {
  const lines = cart.map(i =>
    `• ${i.name} x${i.qty} — ₱${(i.price * i.qty).toLocaleString('en-PH')}`
  ).join('\n');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return `🧬 BIOPEP ORDER\n\n📦 Items:\n${lines}\n\n💰 Total: ₱${total.toLocaleString('en-PH')}\n\n👤 Name: [Please fill in]\n📍 Address: [Please fill in]\n📱 Contact No.: [Please fill in]\n💳 Payment: GCash / Bank / COD\n\n— Sent via biopepph.com`;
}

function orderViaMessenger() {
  if (cart.length === 0) return;
  const msg = buildOrderMessage();
  window.open(`https://m.me/${MESSENGER_PAGE}`, '_blank');
  showToast('Opening Messenger... paste your order!');
}

function orderViaTelegram() {
  if (cart.length === 0) return;
  const msg = encodeURIComponent(buildOrderMessage());
  window.open(`https://t.me/${TELEGRAM_USER}?text=${msg}`, '_blank');
}

// ─── CATEGORY TABS ───────────────────────────
function initCategoryTabs() {
  const tabs  = document.querySelectorAll('.cat-tab');
  const items = document.querySelectorAll('#productGrid .pgrid-item');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      items.forEach(item => {
        item.classList.toggle('hidden', cat !== 'all' && item.dataset.cat !== cat);
      });
    });
  });
}

function filterCat(cat) {
  const tabs  = document.querySelectorAll('.cat-tab');
  const items = document.querySelectorAll('#productGrid .pgrid-item');
  tabs.forEach(t => { t.classList.toggle('active', t.dataset.cat === cat); });
  items.forEach(i => { i.classList.toggle('hidden', i.dataset.cat !== cat); });
}

// ─── TOAST ───────────────────────────────────
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

// ─── MOBILE MENU ─────────────────────────────
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.mobile-nav-link').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ─── PROMO BAR ───────────────────────────────
function initPromoBar() {
  const bar = document.getElementById('promo-bar');
  const btn = document.getElementById('closePromoBar');
  if (!bar || !btn) return;
  if (sessionStorage.getItem('promoClosed')) bar.style.display = 'none';
  btn.addEventListener('click', () => {
    bar.style.display = 'none';
    sessionStorage.setItem('promoClosed', '1');
  });
}

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ─── INIT ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initCategoryTabs();
  initMobileMenu();
  initPromoBar();
  initSmoothScroll();

  document.getElementById('cartOpen')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('stickyBtn')?.addEventListener('click', openCart);
});
