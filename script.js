// BIOPEP PH — script.js

const TELEGRAM_USER  = 'legitrche';
const VIBER_NUMBER   = '+639171132273';
const WHATSAPP_NUMBER = '639171132273';

// ─── PRODUCT DATA ─────────────────────────────
// variants: Complete Set = listed price (priceAdd:0), Vial Set = listed price - 200 (priceAdd:-200)
const PRODUCTS = {

  // ── AVAILABLE PRODUCTS ────────────────────────
  'retro-10mg': {
    name: 'Retatrutide 15mg', price: 1600, origPrice: null, emoji: '💉', image: 'images/retrutide15mg.jpg',
    tag: 'New', tagClass: 'new', cat: 'Weight Loss',
    desc: 'Triple receptor agonist targeting GLP-1, GIP, and Glucagon pathways simultaneously. Clinical trials report up to 24% body weight reduction — the most advanced weight loss peptide currently available.',
    variants: [
      { label: 'Complete Set', desc: 'Peptide vial + bacteriostatic water + insulin syringe', priceAdd: 0    },
      { label: 'Vial Set',     desc: 'Peptide Vial + BAC Water 3mL only',                                     priceAdd: -200 },
    ],
  },
  'tirze-10mg': {
    name: 'Tirzepatide 15mg', price: 1200, origPrice: null, emoji: '💉', image: 'images/tirzepatide15mg.jpg',
    tag: null, tagClass: '', cat: 'Weight Loss',
    desc: 'Dual GLP-1/GIP agonist from the landmark SURMOUNT trials. Reduces hunger, improves insulin sensitivity, and promotes fat oxidation. Clinical-grade weight management.',
    variants: [
      { label: 'Complete Set', desc: 'Peptide vial + bacteriostatic water + insulin syringe', priceAdd: 0    },
      { label: 'Vial Set',     desc: 'Peptide Vial + BAC Water 3mL only',                                     priceAdd: -200 },
    ],
  },
  'tirze-30mg': {
    name: 'Tirzepatide 30mg', price: 1350, origPrice: null, emoji: '💉', image: 'images/tirzepatide30mg.jpg',
    tag: 'New', tagClass: 'new', cat: 'Weight Loss',
    desc: 'Higher-dose dual GLP-1/GIP agonist for patients who have completed the 15mg titration phase. Designed for accelerated and sustained weight loss at advanced protocol stages.',
    variants: [
      { label: 'Complete Set', desc: 'Peptide vial + bacteriostatic water + insulin syringe', priceAdd: 0    },
      { label: 'Vial Set',     desc: 'Peptide Vial + BAC Water 3mL only',                     priceAdd: -200 },
    ],
  },
  'kpv-10mg': {
    name: 'KPV 10mg', price: 1250, origPrice: null, emoji: '🧬', image: 'images/kpv10mg.jpg',
    tag: null, tagClass: '', cat: 'Healing',
    desc: 'Alpha-MSH tripeptide fragment with potent anti-inflammatory and antimicrobial properties. Studied for gut healing, skin conditions, and wound repair.',
    variants: [
      { label: 'Complete Set', desc: 'Peptide vial + bacteriostatic water + insulin syringe', priceAdd: 0    },
      { label: 'Vial Set',     desc: 'Peptide Vial + BAC Water 3mL only',                                     priceAdd: -200 },
    ],
  },
  'snap8-10mg': {
    name: 'Snap-8 10mg', price: 1200, origPrice: null, emoji: '✨', image: 'images/snap810mg.jpg',
    tag: null, tagClass: '', cat: 'Anti-Aging',
    desc: 'Octapeptide-2 — peptide alternative to Botox. Reduces the depth of expression lines by relaxing facial muscle contractions. Popular in advanced anti-aging skincare protocols.',
    variants: [
      { label: 'Complete Set', desc: 'Peptide vial + bacteriostatic water + insulin syringe', priceAdd: 0    },
      { label: 'Vial Set',     desc: 'Peptide Vial + BAC Water 3mL only',                                     priceAdd: -200 },
    ],
  },
  'ghkcu-50mg': {
    name: 'GHK-Cu 50mg', price: 1120, origPrice: null, emoji: '✨', image: 'images/ghkcu50mg.jpg',
    tag: 'Top Pick', tagClass: '', cat: 'Anti-Aging',
    desc: 'Copper Peptide naturally found in human plasma. Promotes collagen synthesis, skin renewal, and anti-inflammatory effects. Reduces fine lines and improves skin density.',
    variants: [
      { label: 'Complete Set', desc: 'Peptide vial + bacteriostatic water + insulin syringe', priceAdd: 0    },
      { label: 'Vial Set',     desc: 'Peptide Vial + BAC Water 3mL only',                                        priceAdd: -200 },
    ],
  },
  'nad-100mg': {
    name: 'NAD+ 100mg', price: 1000, origPrice: null, emoji: '⚡', image: 'images/nad+100mg.jpg',
    tag: null, tagClass: '', cat: 'Anti-Aging',
    desc: 'Nicotinamide Adenine Dinucleotide — essential coenzyme for cellular energy production and DNA repair. Activates sirtuins for longevity benefits and supports mitochondrial function.',
    variants: [
      { label: 'Complete Set', desc: 'NAD+ vial + bacteriostatic water + insulin syringe', priceAdd: 0    },
      { label: 'Vial Set',     desc: 'NAD+ Vial + BAC Water 3mL only',                                     priceAdd: -200 },
    ],
  },
  'pharma-bac-10ml': {
    name: 'Pharma BAC Water 10mL', price: 150, origPrice: null, emoji: '💧', image: 'images/PharmaBac10ml.jpg',
    tag: 'New', tagClass: 'new', cat: 'Other',
    desc: 'Pharmaceutical-grade bacteriostatic water for injection. 10mL multi-use capacity — ideal for reconstituting larger peptide vials. Benzyl alcohol preservative maintains sterility for up to 4 weeks refrigerated.',
    variants: null,
  },
  'bac-water-3ml': {
    name: 'BAC Water 3mL', price: 100, origPrice: null, emoji: '💧', image: 'images/bacwater3ml.jpg',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Pharmaceutical-grade bacteriostatic water for injection. Ideal for small-volume peptide reconstitution. Preserves solution for up to 4 weeks refrigerated.',
    variants: null,
  },
  'bac-water': {
    name: 'BAC Water 10mL', price: 200, origPrice: null, emoji: '💧', image: 'images/bacwater10ml.jpg',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Pharmaceutical-grade 0.9% benzyl alcohol water for injection. Required for reconstituting all lyophilized peptides. Preserves solution for up to 4 weeks refrigerated.',
    variants: null,
  },
  'syringe-05ml': {
    name: 'Syringe 31G 0.5mL (10 pcs)', price: 120, origPrice: null, emoji: '💉', image: 'images/Syringe31G0.5mL.jpg',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Sungshim insulin syringe 31G × 8mm, 0.5mL capacity. Ideal for precise low-volume peptide dosing. Pack of 10.',
    variants: null,
  },
  'syringe-1ml': {
    name: 'Syringe 31G 1mL (10 pcs)', price: 120, origPrice: null, emoji: '💉', image: 'images/Syringe31G1mL.jpg',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Sungshim insulin syringe 31G × 8mm, 1mL capacity. Suitable for larger volume peptide injections. Pack of 10.',
    variants: null,
  },
  'alcohol-swab': {
    name: 'Alcohol Swab (10 pcs)', price: 10, origPrice: null, emoji: '🧴',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Sterile 70% isopropyl alcohol swabs. Essential for sanitizing injection sites before peptide administration. Pack of 10.',
    variants: null,
  },
  'glutathione-1200mg': {
    name: 'Korean Glutathione 1200mg', price: 700, origPrice: null, emoji: '✨', image: 'images/kgtt1200mg.jpg',
    tag: 'New', tagClass: 'new', cat: 'Anti-Aging',
    desc: 'High-dose Korean glutathione for skin brightening, antioxidant protection, and cellular detox. 1200mg pharmaceutical-grade — one of the most potent whitening formulations available.',
    variants: [
      { label: 'Complete Set', desc: 'Gtt Korean 1200mg + Saline water 50ml + 4x 1ml 25Gx5/8" needle + 4x 25G x 1" needle replacement', priceAdd: 0    },
      { label: 'Vial Only',    desc: 'Glutathione vial only',                                                                              priceAdd: -150 },
    ],
  },
  'glutathione-1200mg-box': {
    name: 'Korean Glutathione 1200mg Box', price: 4000, origPrice: null, emoji: '✨', image: 'images/kgttbox.jpg',
    tag: 'New', tagClass: 'new', cat: 'Anti-Aging',
    desc: 'Premium box set of Korean Glutathione 1200mg for extended whitening protocols. Pharmaceutical-grade, high-potency formulation for skin brightening and antioxidant support.',
    variants: null,
  },
  'glutathione-1200mg-box-preorder': {
    name: 'Korean Glutathione 1200mg Box', price: 3200, origPrice: null, emoji: '✨', image: 'images/kgttbox.jpg',
    tag: 'Pre-Order', tagClass: 'preorder', cat: 'Anti-Aging', soldOut: 'Closed',
    desc: 'Premium box set of Korean Glutathione 1200mg for extended whitening protocols. Pharmaceutical-grade, high-potency formulation for skin brightening and antioxidant support.',
    variants: null,
  },
  'glutathione-1200mg-box-preorder-10x': {
    name: 'Korean Glutathione 1200mg Box (10x)', price: 30000, origPrice: null, emoji: '✨', image: 'images/kgttbox.jpg',
    tag: 'Pre-Order', tagClass: 'preorder', cat: 'Anti-Aging', soldOut: 'Closed',
    desc: 'Bulk pre-order of 10 boxes of Korean Glutathione 1200mg. Pharmaceutical-grade, high-potency formulation for skin brightening and antioxidant support.',
    variants: null,
  },

  // ── HIDDEN (not currently available) ──────────
  'sema-5mg':       { hidden: true, name: 'Semaglutide 5mg',        price: 2500, emoji: '💉', cat: 'Weight Loss', desc: '', variants: null },
  'cagri-10mg':     { hidden: true, name: 'Cagrilintide 10mg',      price: 3800, emoji: '💉', cat: 'Weight Loss', desc: '', variants: null },
  'survo-10mg':     { hidden: true, name: 'Survodutide 10mg',       price: 4200, emoji: '💉', cat: 'Weight Loss', desc: '', variants: null },
  'bpc157-5mg':     { hidden: true, name: 'BPC-157 5mg',            price: 1800, emoji: '🧬', cat: 'Healing',    desc: '', variants: null },
  'tb500-5mg':      { hidden: true, name: 'TB-500 5mg',             price: 2000, emoji: '🧬', cat: 'Healing',    desc: '', variants: null },
  'bpc-tb-blend':   { hidden: true, name: 'BPC-157 + TB-500 Blend', price: 3200, emoji: '🧬', cat: 'Healing',    desc: '', variants: null },
  'epith-10mg':     { hidden: true, name: 'Epithalon 10mg',         price: 2800, emoji: '✨', cat: 'Anti-Aging', desc: '', variants: null },
  'ta1-1.6mg':      { hidden: true, name: 'Thymosin Alpha-1',       price: 3500, emoji: '✨', cat: 'Anti-Aging', desc: '', variants: null },
  'ipa-5mg':        { hidden: true, name: 'Ipamorelin 5mg',         price: 1600, emoji: '💪', cat: 'Growth',     desc: '', variants: null },
  'cjc-2mg':        { hidden: true, name: 'CJC-1295 2mg',           price: 1800, emoji: '💪', cat: 'Growth',     desc: '', variants: null },
  'hex-2mg':        { hidden: true, name: 'Hexarelin 2mg',          price: 1500, emoji: '💪', cat: 'Growth',     desc: '', variants: null },
  'igf1lr3-1mg':    { hidden: true, name: 'IGF-1 LR3 1mg',          price: 2500, emoji: '💪', cat: 'Growth',     desc: '', variants: null },
  'stack-fat-loss': { hidden: true, name: 'Fat Loss Starter Kit',   price: 2600, emoji: '🔥', cat: 'Stacks',     desc: '', variants: null },
  'stack-recovery': { hidden: true, name: 'Recovery Pro Stack',     price: 3500, emoji: '⚡', cat: 'Stacks',     desc: '', variants: null },
  'stack-glow':     { hidden: true, name: 'Anti-Aging Glow Stack',  price: 4500, emoji: '🌸', cat: 'Stacks',     desc: '', variants: null },
  'stack-gh':       { hidden: true, name: 'GH Optimizer Stack',     price: 3100, emoji: '💥', cat: 'Stacks',     desc: '', variants: null },
  'mt2-10mg':       { hidden: true, name: 'Melanotan II 10mg',      price: 1800, emoji: '🌙', cat: 'Other',      desc: '', variants: null },
  'pt141-10mg':     { hidden: true, name: 'PT-141 10mg',            price: 2000, emoji: '🌙', cat: 'Other',      desc: '', variants: null },
};

// ─── CART STATE ───────────────────────────────
let cart = JSON.parse(localStorage.getItem('biopep_cart')) || [];

function saveCart() {
  localStorage.setItem('biopep_cart', JSON.stringify(cart));
}

// ─── ADD ITEM ─────────────────────────────────
// variantLabel is optional (e.g. "Complete Kit")
function addItem(id, name, price, variantLabel) {
  const cartId = variantLabel ? `${id}__${variantLabel}` : id;
  const displayName = variantLabel ? `${name} (${variantLabel})` : name;
  const existing = cart.find(i => i.id === cartId);
  if (existing) {
    if (existing.qty >= 20) { showToast('⚠️ Maximum 20 per item.'); return; }
    existing.qty += 1;
  } else {
    cart.push({ id: cartId, baseId: id, name: displayName, price, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`✓ ${displayName} added to cart!`);
}

function changeQty(cartId, delta) {
  const item = cart.find(i => i.id === cartId);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) cart = cart.filter(i => i.id !== cartId);
  saveCart();
  renderCart();
}

function removeItem(cartId) {
  cart = cart.filter(i => i.id !== cartId);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  localStorage.removeItem('biopep_promo');
}

// ─── RENDER CART ──────────────────────────────
function renderCart() {
  const body     = document.getElementById('drawerBody');
  const emptyEl  = document.getElementById('cartEmpty');
  const foot     = document.getElementById('drawerFoot');
  const badge    = document.getElementById('cartBadge');
  const countTag = document.getElementById('drawerCount');
  const countEl  = document.getElementById('drawerItemCount');
  const totalEl  = document.getElementById('drawerTotal');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalAmt = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (badge)    badge.textContent    = totalQty;
  if (countTag) countTag.textContent = totalQty;

  // Always clear rendered items first
  body.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (totalQty === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (foot)    foot.classList.remove('show');
    updateStickyBar(0, 0);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (foot)    foot.classList.add('show');

  cart.forEach(item => {
    const lineTotal = (item.price * item.qty).toLocaleString('en-PH');
    const prod  = PRODUCTS[item.baseId || item.id] || {};
    const thumb = prod.image
      ? `<img src="${prod.image}" alt="${prod.name}" class="cart-item-img">`
      : (prod.emoji || '🧬');
    const el = document.createElement('div');
    el.className = 'cart-item';
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

  if (countEl) countEl.textContent = totalQty;
  if (totalEl) totalEl.textContent = `₱${totalAmt.toLocaleString('en-PH')}`;

  updateStickyBar(totalQty, totalAmt);
}

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

// ─── CART OPEN / CLOSE ────────────────────────
function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('active');
  if (!document.getElementById('checkoutPanel')?.classList.contains('open') &&
      !document.getElementById('pmodal')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

// ─── PRODUCT DETAIL MODAL ─────────────────────
let modalCurrentId  = null;
let modalQty        = 1;
let modalVariantIdx = 0;

function openModal(id) {
  const prod = PRODUCTS[id];
  if (!prod) return;

  modalCurrentId  = id;
  modalQty        = 1;
  modalVariantIdx = 0;

  const emojiEl  = document.getElementById('pmodalEmoji');
  const imgWrap  = document.getElementById('pmodalImgWrap');
  let   photoEl  = imgWrap.querySelector('.pmodal-photo');
  if (prod.image) {
    if (!photoEl) { photoEl = document.createElement('img'); photoEl.className = 'pmodal-photo'; imgWrap.prepend(photoEl); }
    photoEl.src = prod.image; photoEl.alt = prod.name;
    photoEl.style.display = 'block'; emojiEl.style.display = 'none';
    imgWrap.style.background = 'none';
  } else {
    if (photoEl) photoEl.style.display = 'none';
    emojiEl.textContent = prod.emoji; emojiEl.style.display = '';
    imgWrap.style.background = '';
  }
  document.getElementById('pmodalCat').textContent   = prod.cat;
  document.getElementById('pmodalName').textContent  = prod.name;
  document.getElementById('pmodalDesc').textContent  = prod.desc;
  document.getElementById('pmodalQtyNum').textContent = 1;

  const badge = document.getElementById('pmodalBadge');
  badge.textContent = prod.tag || '';
  badge.className   = 'pmodal-badge' + (prod.tagClass ? ` ${prod.tagClass}` : '');

  const origEl = document.getElementById('pmodalOrigPrice');
  const saveEl = document.getElementById('pmodalSaveBadge');
  if (prod.origPrice) {
    origEl.textContent = `₱${prod.origPrice.toLocaleString('en-PH')}`;
    saveEl.textContent = `Save ₱${(prod.origPrice - prod.price).toLocaleString('en-PH')}`;
  } else {
    origEl.textContent = '';
    saveEl.textContent = '';
  }

  updateModalPrice();
  renderVariants(prod);

  const gradients = {
    'Weight Loss': 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    'Healing':     'linear-gradient(135deg,#fce7f3,#f9a8d4)',
    'Anti-Aging':  'linear-gradient(135deg,#fdf2f8,#fce7f3)',
    'Growth':      'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    'Stacks':      'linear-gradient(135deg,#fdf4ff,#fce7f3)',
    'Other':       'linear-gradient(135deg,#fdf2f8,#fce7f3)',
  };
  document.getElementById('pmodalImgWrap').style.background =
    gradients[prod.cat] || gradients['Other'];

  const addBtn = document.getElementById('pmodalAddBtn');
  if (prod.soldOut) {
    addBtn.textContent = typeof prod.soldOut === 'string' ? prod.soldOut : 'Sold Out';
    addBtn.classList.add('sold-out');
    addBtn.disabled = true;
  } else {
    addBtn.textContent = 'Add to Cart';
    addBtn.classList.remove('sold-out');
    addBtn.disabled = false;
  }

  document.getElementById('pmodal').classList.add('open');
  document.getElementById('pmodalOverlay').classList.add('active');
  document.getElementById('pmodal').scrollTop = 0;
  document.body.style.overflow = 'hidden';

  renderAlsoLike(id);
}

function renderVariants(prod) {
  const wrap = document.getElementById('pmodalVariants');
  const opts = document.getElementById('pmodalVariantOpts');
  if (!prod.variants || prod.variants.length === 0) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'block';
  opts.innerHTML = '';
  prod.variants.forEach((v, i) => {
    const price = prod.price + v.priceAdd;
    const div = document.createElement('label');
    div.className = 'pmodal-variant-opt' + (i === modalVariantIdx ? ' selected' : '');
    div.innerHTML = `
      <input type="radio" name="pmodalVariant" value="${i}" ${i === modalVariantIdx ? 'checked' : ''}>
      <div class="pmodal-variant-info">
        <span class="pmodal-variant-name">${v.label}</span>
        <span class="pmodal-variant-desc">${v.desc}</span>
      </div>
      <span class="pmodal-variant-price">₱${price.toLocaleString('en-PH')}</span>
    `;
    div.addEventListener('click', () => selectVariant(i));
    opts.appendChild(div);
  });
}

function selectVariant(idx) {
  modalVariantIdx = idx;
  document.querySelectorAll('.pmodal-variant-opt').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  updateModalPrice();
}

function updateModalPrice() {
  const prod = PRODUCTS[modalCurrentId];
  if (!prod) return;
  const add  = prod.variants ? (prod.variants[modalVariantIdx]?.priceAdd || 0) : 0;
  const price = prod.price + add;
  document.getElementById('pmodalPrice').textContent = `₱${price.toLocaleString('en-PH')}`;
}

function closeModal() {
  document.getElementById('pmodal')?.classList.remove('open');
  document.getElementById('pmodalOverlay')?.classList.remove('active');
  if (!document.getElementById('cartDrawer')?.classList.contains('open') &&
      !document.getElementById('checkoutPanel')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
  modalCurrentId = null;
  modalQty = 1;
  modalVariantIdx = 0;
}

function updateModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById('pmodalQtyNum').textContent = modalQty;
}

function renderAlsoLike(currentId) {
  const grid = document.getElementById('pmodalAlsoGrid');
  const wrap = document.getElementById('pmodalAlso');
  if (!grid || !wrap) return;

  const current = PRODUCTS[currentId];
  if (!current) { wrap.style.display = 'none'; return; }

  const allIds  = Object.keys(PRODUCTS).filter(id => !PRODUCTS[id].hidden);
  const sameCat = allIds.filter(id => id !== currentId && PRODUCTS[id].cat === current.cat);
  const diffCat = allIds.filter(id => id !== currentId && PRODUCTS[id].cat !== current.cat);
  const picks   = [...sameCat, ...diffCat].slice(0, 4);

  if (!picks.length) { wrap.style.display = 'none'; return; }

  grid.innerHTML = '';
  picks.forEach(id => {
    const p   = PRODUCTS[id];
    const div = document.createElement('div');
    div.className = 'pmodal-also-card';
    const thumb = p.image
      ? `<div class="pmodal-also-thumb"><img src="${p.image}" alt="${p.name}" class="pmodal-also-img"></div>`
      : `<div class="pmodal-also-thumb">${p.emoji}</div>`;
    div.innerHTML = `
      ${thumb}
      <p class="pmodal-also-name">${p.name}</p>
      <p class="pmodal-also-price">${p.variants ? '<small style="font-size:.75em;opacity:.7">from </small>' : ''}₱${(p.variants ? p.price + p.variants[1].priceAdd : p.price).toLocaleString('en-PH')}</p>
    `;
    div.addEventListener('click', () => {
      document.getElementById('pmodal').scrollTop = 0;
      openModal(id);
    });
    grid.appendChild(div);
  });
  wrap.style.display = 'block';
}

function addFromModal() {
  if (!modalCurrentId) return;
  const prod = PRODUCTS[modalCurrentId];
  if (!prod) return;
  const variant = prod.variants ? prod.variants[modalVariantIdx] : null;
  const price   = prod.price + (variant?.priceAdd || 0);
  addItem(modalCurrentId, prod.name, price, variant?.label || null);
  closeModal();
}

// ─── CATEGORY TABS ────────────────────────────
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

function filterSearch(query) {
  const q = query.trim().toLowerCase();
  const items = document.querySelectorAll('#productGrid .pgrid-item');
  if (!q) {
    const activeTab = document.querySelector('.cat-tab.active');
    const cat = activeTab?.dataset.cat || 'all';
    filterCat(cat);
    return;
  }
  items.forEach(item => {
    const name = item.querySelector('.pcard-name')?.textContent.toLowerCase() || '';
    const desc = item.querySelector('.pcard-desc')?.textContent.toLowerCase() || '';
    item.classList.toggle('hidden', !name.includes(q) && !desc.includes(q));
  });
}

function filterCat(cat) {
  const tabs  = document.querySelectorAll('.cat-tab');
  const items = document.querySelectorAll('#productGrid .pgrid-item');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  items.forEach(i => i.classList.toggle('hidden', cat !== 'all' && i.dataset.cat !== cat));
}

// ─── TOAST ────────────────────────────────────
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }
  }, 2800);
}

// ─── MOBILE NAV ───────────────────────────────
function initMobileNav() {
  const openBtn  = document.getElementById('mnavOpen');
  const drawer   = document.getElementById('mnavDrawer');
  const overlay  = document.getElementById('mnavOverlay');
  const closeBtn = document.getElementById('mnavClose');
  if (!openBtn || !drawer) return;

  const open  = () => { drawer.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const close = () => { drawer.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow = ''; };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  drawer.querySelectorAll('.mnav-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      filterCat(btn.dataset.cat);
      close();
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.getElementById('mnavSearch')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#productGrid .pgrid-item').forEach(item => {
      const name = item.querySelector('.pcard-name')?.textContent.toLowerCase() || '';
      item.classList.toggle('hidden', !!q && !name.includes(q));
    });
    if (!q) {
      const activeTab = document.querySelector('.cat-tab.active');
      const cat = activeTab?.dataset.cat || 'all';
      filterCat(cat);
    }
  });
}

// ─── SMOOTH SCROLL ────────────────────────────
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

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initCategoryTabs();
  initMobileNav();
  initSmoothScroll();

  // Search
  const searchBar   = document.getElementById('headerSearchBar');
  const searchInput = document.getElementById('headerSearchInput');
  document.getElementById('searchToggle')?.addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) searchInput.focus();
    else { searchInput.value = ''; filterSearch(''); }
  });
  document.getElementById('searchClose')?.addEventListener('click', () => {
    searchBar.classList.remove('open');
    searchInput.value = '';
    filterSearch('');
  });
  searchInput?.addEventListener('input', e => filterSearch(e.target.value));

  // Cart
  document.getElementById('cartOpen')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('stickyBtn')?.addEventListener('click', openCart);

  // Product modal
  document.getElementById('pmodalClose')?.addEventListener('click', closeModal);
  document.getElementById('pmodalOverlay')?.addEventListener('click', closeModal);
  document.getElementById('pmodalAddBtn')?.addEventListener('click', addFromModal);

  // ESC key closes modal or cart
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('pmodal')?.classList.contains('open')) {
        closeModal();
      } else {
        closeCart();
      }
    }
  });
});
