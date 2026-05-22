// BIOPEP PH — script.js

const MESSENGER_PAGE = 'biopepph';
const TELEGRAM_USER  = 'biopepph';
const VIBER_NUMBER   = '+63XXXXXXXXXX'; // Update with your actual Viber number

// ─── PRODUCT DATA ─────────────────────────────
const PRODUCTS = {
  'sema-5mg':       { name: 'Semaglutide 5mg',          price: 2500, origPrice: 3000, emoji: '💉', tag: 'Best Seller', tagClass: '',      cat: 'Weight Loss',  desc: 'GLP-1 Receptor Agonist — the gold standard in weight loss peptides. Clinically proven to reduce appetite significantly and promote fat loss. Ideal for individuals targeting 5–15% body weight reduction when combined with dietary changes.' },
  'retro-10mg':     { name: 'Retatrutide 10mg',          price: 4500, origPrice: null, emoji: '💉', tag: 'New',         tagClass: 'new',   cat: 'Weight Loss',  desc: 'Triple receptor agonist targeting GLP-1, GIP, and Glucagon pathways simultaneously. The most advanced weight loss peptide currently available. Clinical trials report up to 24% body weight reduction — next-generation fat loss technology.' },
  'tirze-10mg':     { name: 'Tirzepatide 10mg',          price: 4000, origPrice: null, emoji: '💉', tag: null,          tagClass: '',      cat: 'Weight Loss',  desc: 'Dual GLP-1/GIP agonist used in the landmark SURMOUNT clinical trials. Reduces hunger, improves insulin sensitivity, and promotes fat oxidation. One of the most effective clinical-grade weight management peptides available today.' },
  'cagri-10mg':     { name: 'Cagrilintide 10mg',         price: 3800, origPrice: null, emoji: '💉', tag: null,          tagClass: '',      cat: 'Weight Loss',  desc: 'Amylin analogue designed to work synergistically with Semaglutide (the CagriSema combination). Enhances satiety signals and complements GLP-1 agonists for significantly enhanced weight loss outcomes.' },
  'survo-10mg':     { name: 'Survodutide 10mg',          price: 4200, origPrice: null, emoji: '💉', tag: null,          tagClass: '',      cat: 'Weight Loss',  desc: 'GLP-1/Glucagon dual agonist under active clinical investigation for obesity treatment. Promotes fat burning via glucagon signaling while suppressing appetite via GLP-1. A promising next-generation option.' },
  'bpc157-5mg':     { name: 'BPC-157 5mg',               price: 1800, origPrice: 2200, emoji: '🧬', tag: 'Popular',    tagClass: '',      cat: 'Healing',      desc: 'Body Protective Compound — a potent healing peptide derived from gastric juice protein. Accelerates repair of gut lining, tendons, ligaments, and muscles. Reduces inflammation and promotes angiogenesis. Widely researched for injury recovery.' },
  'tb500-5mg':      { name: 'TB-500 5mg',                price: 2000, origPrice: null, emoji: '🧬', tag: null,          tagClass: '',      cat: 'Healing',      desc: 'Thymosin Beta-4 fragment. Promotes cell migration and proliferation for accelerated tissue healing. Targets muscle fibers, tendons, ligaments, and joints. Works synergistically with BPC-157 for dramatically enhanced recovery.' },
  'bpc-tb-blend':   { name: 'BPC-157 + TB-500 Blend',   price: 3200, origPrice: null, emoji: '🧬', tag: null,          tagClass: '',      cat: 'Healing',      desc: 'The ultimate healing stack combining two of the most powerful repair peptides. BPC-157 handles gut and soft tissue repair while TB-500 accelerates muscle and joint recovery. Ideal for athletes and post-injury rehabilitation.' },
  'ghkcu-50mg':     { name: 'GHK-Cu 50mg',               price: 2200, origPrice: null, emoji: '✨', tag: 'Top Pick',   tagClass: '',      cat: 'Anti-Aging',   desc: 'Copper Peptide naturally found in human plasma. Promotes collagen synthesis, skin renewal, and anti-inflammatory effects. Research shows it can reduce fine lines, improve skin density, stimulate wound healing, and even support hair growth.' },
  'epith-10mg':     { name: 'Epithalon 10mg',             price: 2800, origPrice: null, emoji: '✨', tag: null,          tagClass: '',      cat: 'Anti-Aging',   desc: 'Tetrapeptide derived from the pineal gland, associated with telomere extension and cellular renewal. Research suggests improved sleep quality, immune modulation, and potential longevity benefits.' },
  'ta1-1.6mg':      { name: 'Thymosin Alpha-1',           price: 3500, origPrice: null, emoji: '✨', tag: null,          tagClass: '',      cat: 'Anti-Aging',   desc: 'Thymic peptide with powerful immune modulation and anti-inflammatory properties. Extensively studied for immune system support, infectious disease management, and as a longevity-focused intervention.' },
  'ipa-5mg':        { name: 'Ipamorelin 5mg',             price: 1600, origPrice: 2000, emoji: '💪', tag: 'Popular',    tagClass: '',      cat: 'Growth',       desc: 'Selective GHRP (Growth Hormone Releasing Peptide) that stimulates pulsatile GH release with minimal side effects. Promotes lean muscle growth, fat loss, and improved recovery. Commonly stacked with CJC-1295 for synergistic results.' },
  'cjc-2mg':        { name: 'CJC-1295 2mg',              price: 1800, origPrice: null, emoji: '💪', tag: null,          tagClass: '',      cat: 'Growth',       desc: 'Long-acting GHRH analogue that amplifies growth hormone release over extended periods. Promotes muscle hypertrophy, fat loss, and improved sleep quality. The ideal pairing with Ipamorelin for body composition optimization.' },
  'hex-2mg':        { name: 'Hexarelin 2mg',              price: 1500, origPrice: null, emoji: '💪', tag: null,          tagClass: '',      cat: 'Growth',       desc: 'Potent GHRP-6 analogue with strong GH releasing properties. Shows cardioprotective effects in research. Promotes lean muscle development, reduces body fat, and supports recovery from intense training.' },
  'igf1lr3-1mg':    { name: 'IGF-1 LR3 1mg',             price: 2500, origPrice: null, emoji: '💪', tag: null,          tagClass: '',      cat: 'Growth',       desc: 'Insulin-like Growth Factor 1 Long Arg3 variant. Directly stimulates muscle cell proliferation and hypertrophy. Extended half-life vs. native IGF-1. Highly anabolic muscle-building peptide suitable for advanced users.' },
  'stack-fat-loss': { name: 'Fat Loss Starter Kit',       price: 2600, origPrice: 2800, emoji: '🔥', tag: 'Stack',      tagClass: 'stack', cat: 'Stacks',       desc: 'Everything you need to start your weight loss journey. Includes Semaglutide 5mg + Bacteriostatic Water 10mL. Perfect for first-time peptide users. Save ₱200 vs. buying items separately.' },
  'stack-recovery': { name: 'Recovery Pro Stack',         price: 3500, origPrice: 3800, emoji: '⚡', tag: 'Stack',      tagClass: 'stack', cat: 'Stacks',       desc: 'The ultimate dual-action healing combination. BPC-157 5mg + TB-500 5mg working in synergy for accelerated tissue repair. Ideal for athletes, post-surgery recovery, or managing chronic injury. Save ₱300.' },
  'stack-glow':     { name: 'Anti-Aging Glow Stack',      price: 4500, origPrice: 5000, emoji: '🌸', tag: 'Stack',      tagClass: 'stack', cat: 'Stacks',       desc: 'The complete anti-aging protocol. GHK-Cu 50mg + Epithalon 10mg working together to combat skin aging, boost collagen synthesis, and support cellular longevity simultaneously. Save ₱500.' },
  'stack-gh':       { name: 'GH Optimizer Stack',         price: 3100, origPrice: 3400, emoji: '💥', tag: 'Stack',      tagClass: 'stack', cat: 'Stacks',       desc: 'The classic growth hormone stack. Ipamorelin 5mg + CJC-1295 2mg — combined GHRP + GHRH synergy for maximum GH pulse amplitude. Ideal for lean muscle building and fat loss simultaneously. Save ₱300.' },
  'mt2-10mg':       { name: 'Melanotan II 10mg',          price: 1800, origPrice: null, emoji: '🌙', tag: null,          tagClass: '',      cat: 'Other',        desc: 'Melanocortin receptor agonist that promotes skin tanning via melanin production. Also studied for libido enhancement and appetite suppression effects. Popular for sun-free tanning protocols.' },
  'pt141-10mg':     { name: 'PT-141 10mg',                price: 2000, origPrice: null, emoji: '🌙', tag: null,          tagClass: '',      cat: 'Other',        desc: 'Bremelanotide — melanocortin-4 receptor agonist that specifically targets sexual desire and arousal pathways in the central nervous system. Studied for both male and female sexual dysfunction.' },
  'bac-water':      { name: 'Bacteriostatic Water 10mL',  price: 300,  origPrice: null, emoji: '💧', tag: null,          tagClass: '',      cat: 'Other',        desc: 'Pharmaceutical-grade 0.9% benzyl alcohol water for injection. Required for reconstituting all lyophilized (freeze-dried) peptides. Preserves reconstituted solution for up to 4 weeks when refrigerated.' },
};

// ─── CART STATE ────────────────────────────────
let cart = JSON.parse(localStorage.getItem('biopep_cart')) || [];

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

  body.querySelectorAll('.cart-item').forEach(el => el.remove());

  cart.forEach(item => {
    const lineTotal = (item.price * item.qty).toLocaleString('en-PH');
    const el = document.createElement('div');
    el.className = 'cart-item';
    const prod = PRODUCTS[item.id];
    const thumb = prod ? prod.emoji : '🧬';
    el.innerHTML = `
      <div class="cart-item-thumb">${thumb}</div>
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
  const bar     = document.getElementById('stickyBar');
  const countEl = document.getElementById('stickyCount');
  const itemsEl = document.getElementById('stickyItems');
  const totalEl = document.getElementById('stickyTotal');

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
  window.open(`https://m.me/${MESSENGER_PAGE}`, '_blank');
  showToast('Opening Messenger… paste your order!');
}

function orderViaViber() {
  if (cart.length === 0) return;
  const msg = encodeURIComponent(buildOrderMessage());
  window.open(`viber://chat?number=${encodeURIComponent(VIBER_NUMBER)}&text=${msg}`, '_blank');
  showToast('Opening Viber…');
}

function orderViaTelegram() {
  if (cart.length === 0) return;
  const msg = encodeURIComponent(buildOrderMessage());
  window.open(`https://t.me/${TELEGRAM_USER}?text=${msg}`, '_blank');
}

// ─── PRODUCT DETAIL MODAL ────────────────────
let modalCurrentId = null;
let modalQty = 1;

function openModal(id) {
  const prod = PRODUCTS[id];
  if (!prod) return;

  modalCurrentId = id;
  modalQty = 1;

  document.getElementById('pmodalEmoji').textContent  = prod.emoji;
  document.getElementById('pmodalCat').textContent    = prod.cat;
  document.getElementById('pmodalName').textContent   = prod.name;
  document.getElementById('pmodalDesc').textContent   = prod.desc;
  document.getElementById('pmodalPrice').textContent  = `₱${prod.price.toLocaleString('en-PH')}`;
  document.getElementById('pmodalQtyNum').textContent = 1;

  const badge = document.getElementById('pmodalBadge');
  badge.textContent = prod.tag || '';
  badge.className   = 'pmodal-badge' + (prod.tagClass ? ` ${prod.tagClass}` : '');

  const origEl = document.getElementById('pmodalOrigPrice');
  const saveEl = document.getElementById('pmodalSaveBadge');
  if (prod.origPrice) {
    origEl.textContent = `₱${prod.origPrice.toLocaleString('en-PH')}`;
    const saved = prod.origPrice - prod.price;
    saveEl.textContent = `Save ₱${saved.toLocaleString('en-PH')}`;
  } else {
    origEl.textContent = '';
    saveEl.textContent = '';
  }

  // Match the card gradient color to the modal image background
  const imgWrap = document.getElementById('pmodalImgWrap');
  const gradients = {
    WeightLoss: 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    Healing:    'linear-gradient(135deg,#fce7f3,#f9a8d4)',
    'Anti-Aging': 'linear-gradient(135deg,#fdf2f8,#fce7f3)',
    Growth:     'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    Stacks:     'linear-gradient(135deg,#fdf4ff,#fce7f3)',
    Other:      'linear-gradient(135deg,#fdf2f8,#fce7f3)',
  };
  imgWrap.style.background = gradients[prod.cat] || gradients['Other'];

  document.getElementById('pmodalAddBtn').onclick = () => addFromModal();
  document.getElementById('pmodal').classList.add('open');
  document.getElementById('pmodalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('pmodal')?.classList.remove('open');
  document.getElementById('pmodalOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
  modalCurrentId = null;
  modalQty = 1;
}

function updateModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById('pmodalQtyNum').textContent = modalQty;
}

function addFromModal() {
  if (!modalCurrentId) return;
  const prod = PRODUCTS[modalCurrentId];
  if (!prod) return;
  const existing = cart.find(i => i.id === modalCurrentId);
  if (existing) {
    existing.qty += modalQty;
  } else {
    cart.push({ id: modalCurrentId, name: prod.name, price: prod.price, qty: modalQty });
  }
  saveCart();
  renderCart();
  showToast(`✓ ${prod.name} × ${modalQty} added!`);
  closeModal();
  openCart();
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

// ─── SMOOTH SCROLL ───────────────────────────
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

  document.getElementById('pmodalClose')?.addEventListener('click', closeModal);
  document.getElementById('pmodalOverlay')?.addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeCart();
    }
  });
});
