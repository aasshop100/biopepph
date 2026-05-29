// BIOPEP PH — script.js

const MESSENGER_PAGE = 'biopepph';
const TELEGRAM_USER  = 'biopepph';
const VIBER_NUMBER   = '+63XXXXXXXXXX'; // ← Update with your Viber number

// ─── PRODUCT DATA ─────────────────────────────
// variants: array of { label, desc, priceAdd } — priceAdd is added to base price
const PRODUCTS = {
  'sema-5mg': {
    name: 'Semaglutide 5mg', price: 2500, origPrice: 3000, emoji: '💉',
    tag: 'Best Seller', tagClass: '', cat: 'Weight Loss',
    desc: 'GLP-1 Receptor Agonist — the gold standard in weight loss peptides. Clinically proven to reduce appetite and promote significant fat loss. Ideal for individuals targeting 5–15% body weight reduction.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'retro-10mg': {
    name: 'Retatrutide 10mg', price: 4500, origPrice: null, emoji: '💉',
    tag: 'New', tagClass: 'new', cat: 'Weight Loss',
    desc: 'Triple receptor agonist targeting GLP-1, GIP, and Glucagon pathways simultaneously. Clinical trials report up to 24% body weight reduction — the most advanced weight loss peptide currently available.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'tirze-10mg': {
    name: 'Tirzepatide 10mg', price: 4000, origPrice: null, emoji: '💉',
    tag: null, tagClass: '', cat: 'Weight Loss',
    desc: 'Dual GLP-1/GIP agonist from the landmark SURMOUNT trials. Reduces hunger, improves insulin sensitivity, and promotes fat oxidation. Clinical-grade weight management.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'cagri-10mg': {
    name: 'Cagrilintide 10mg', price: 3800, origPrice: null, emoji: '💉',
    tag: null, tagClass: '', cat: 'Weight Loss',
    desc: 'Amylin analogue designed to work synergistically with Semaglutide (CagriSema combo). Enhances satiety signals and complements GLP-1 agonists for dramatically enhanced weight loss.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'survo-10mg': {
    name: 'Survodutide 10mg', price: 4200, origPrice: null, emoji: '💉',
    tag: null, tagClass: '', cat: 'Weight Loss',
    desc: 'GLP-1/Glucagon dual agonist under clinical investigation for obesity. Promotes fat burning via glucagon signaling while suppressing appetite via GLP-1.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'bpc157-5mg': {
    name: 'BPC-157 5mg', price: 1800, origPrice: 2200, emoji: '🧬',
    tag: 'Popular', tagClass: '', cat: 'Healing',
    desc: 'Body Protective Compound — a potent healing peptide. Accelerates repair of gut lining, tendons, ligaments, and muscles. Reduces inflammation and promotes angiogenesis.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'tb500-5mg': {
    name: 'TB-500 5mg', price: 2000, origPrice: null, emoji: '🧬',
    tag: null, tagClass: '', cat: 'Healing',
    desc: 'Thymosin Beta-4 fragment. Promotes cell migration for accelerated healing of muscles, tendons, and ligaments. Works synergistically with BPC-157.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'bpc-tb-blend': {
    name: 'BPC-157 + TB-500 Blend', price: 3200, origPrice: null, emoji: '🧬',
    tag: null, tagClass: '', cat: 'Healing',
    desc: 'The ultimate healing stack combining both BPC-157 and TB-500 in one vial. Dual-action repair for athletes, post-surgery recovery, and chronic injury management.',
    variants: [
      { label: 'Vials Set',    desc: 'Blend vial + bacteriostatic water',                           priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'ghkcu-50mg': {
    name: 'GHK-Cu 50mg', price: 2200, origPrice: null, emoji: '✨',
    tag: 'Top Pick', tagClass: '', cat: 'Anti-Aging',
    desc: 'Copper Peptide naturally found in human plasma. Promotes collagen synthesis, skin renewal, and anti-inflammatory effects. Reduces fine lines and improves skin density.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + topical applicator & gloves',                     priceAdd: 200 },
    ],
  },
  'epith-10mg': {
    name: 'Epithalon 10mg', price: 2800, origPrice: null, emoji: '✨',
    tag: null, tagClass: '', cat: 'Anti-Aging',
    desc: 'Tetrapeptide from the pineal gland associated with telomere extension and cellular renewal. Research suggests improved sleep, immune modulation, and longevity benefits.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'ta1-1.6mg': {
    name: 'Thymosin Alpha-1', price: 3500, origPrice: null, emoji: '✨',
    tag: null, tagClass: '', cat: 'Anti-Aging',
    desc: 'Thymic peptide with powerful immune modulation and anti-inflammatory properties. Studied for immune support, infectious disease management, and longevity.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'ipa-5mg': {
    name: 'Ipamorelin 5mg', price: 1600, origPrice: 2000, emoji: '💪',
    tag: 'Popular', tagClass: '', cat: 'Growth',
    desc: 'Selective GHRP that stimulates pulsatile GH release with minimal side effects. Promotes lean muscle, fat loss, and improved recovery. Best stacked with CJC-1295.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'cjc-2mg': {
    name: 'CJC-1295 2mg', price: 1800, origPrice: null, emoji: '💪',
    tag: null, tagClass: '', cat: 'Growth',
    desc: 'Long-acting GHRH analogue that amplifies GH release over extended periods. Promotes muscle hypertrophy, fat loss, and improved sleep quality.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'hex-2mg': {
    name: 'Hexarelin 2mg', price: 1500, origPrice: null, emoji: '💪',
    tag: null, tagClass: '', cat: 'Growth',
    desc: 'Potent GHRP-6 analogue with strong GH releasing properties and cardioprotective effects. Promotes lean muscle and supports recovery from intense training.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'igf1lr3-1mg': {
    name: 'IGF-1 LR3 1mg', price: 2500, origPrice: null, emoji: '💪',
    tag: null, tagClass: '', cat: 'Growth',
    desc: 'IGF-1 Long Arg3 variant. Directly stimulates muscle cell proliferation and hypertrophy. Extended half-life vs. native IGF-1. Highly anabolic.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'stack-fat-loss': {
    name: 'Fat Loss Starter Kit', price: 2600, origPrice: 2800, emoji: '🔥',
    tag: 'Stack', tagClass: 'stack', cat: 'Stacks',
    desc: 'Everything you need to start your weight loss journey. Includes Semaglutide 5mg + Bacteriostatic Water 10mL. Perfect for first-time peptide users. Save ₱200 vs. buying separately.',
    variants: null,
  },
  'stack-recovery': {
    name: 'Recovery Pro Stack', price: 3500, origPrice: 3800, emoji: '⚡',
    tag: 'Stack', tagClass: 'stack', cat: 'Stacks',
    desc: 'Dual-action healing combination. BPC-157 5mg + TB-500 5mg for synergistic tissue repair. Ideal for athletes, post-surgery recovery, or chronic injury. Save ₱300.',
    variants: null,
  },
  'stack-glow': {
    name: 'Anti-Aging Glow Stack', price: 4500, origPrice: 5000, emoji: '🌸',
    tag: 'Stack', tagClass: 'stack', cat: 'Stacks',
    desc: 'Complete anti-aging protocol. GHK-Cu 50mg + Epithalon 10mg for collagen synthesis, skin renewal, and cellular longevity simultaneously. Save ₱500.',
    variants: null,
  },
  'stack-gh': {
    name: 'GH Optimizer Stack', price: 3100, origPrice: 3400, emoji: '💥',
    tag: 'Stack', tagClass: 'stack', cat: 'Stacks',
    desc: 'Classic GH stack. Ipamorelin 5mg + CJC-1295 2mg — GHRP + GHRH synergy for maximum GH pulse amplitude. Ideal for lean muscle and fat loss. Save ₱300.',
    variants: null,
  },
  'mt2-10mg': {
    name: 'Melanotan II 10mg', price: 1800, origPrice: null, emoji: '🌙',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Melanocortin receptor agonist that promotes skin tanning via melanin production. Also studied for libido enhancement and appetite suppression.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'pt141-10mg': {
    name: 'PT-141 10mg', price: 2000, origPrice: null, emoji: '🌙',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Bremelanotide — MC4 receptor agonist that specifically targets sexual desire and arousal pathways in the central nervous system. Studied for male and female sexual dysfunction.',
    variants: [
      { label: 'Vials Set',    desc: 'Peptide vial + bacteriostatic water',                         priceAdd: 0   },
      { label: 'Complete Kit', desc: 'Vials Set + 10 insulin syringes, alcohol pads & gloves',      priceAdd: 300 },
    ],
  },
  'bac-water': {
    name: 'Bacteriostatic Water 10mL', price: 300, origPrice: null, emoji: '💧',
    tag: null, tagClass: '', cat: 'Other',
    desc: 'Pharmaceutical-grade 0.9% benzyl alcohol water for injection. Required for reconstituting all lyophilized peptides. Preserves solution for up to 4 weeks refrigerated.',
    variants: null,
  },
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
    const thumb = prod.emoji || '🧬';
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

  document.getElementById('pmodalEmoji').textContent = prod.emoji;
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

  const allIds  = Object.keys(PRODUCTS);
  const sameCat = allIds.filter(id => id !== currentId && PRODUCTS[id].cat === current.cat);
  const diffCat = allIds.filter(id => id !== currentId && PRODUCTS[id].cat !== current.cat);
  const picks   = [...sameCat, ...diffCat].slice(0, 4);

  if (!picks.length) { wrap.style.display = 'none'; return; }

  grid.innerHTML = '';
  picks.forEach(id => {
    const p   = PRODUCTS[id];
    const div = document.createElement('div');
    div.className = 'pmodal-also-card';
    div.innerHTML = `
      <div class="pmodal-also-thumb">${p.emoji}</div>
      <p class="pmodal-also-name">${p.name}</p>
      <p class="pmodal-also-price">₱${p.price.toLocaleString('en-PH')}</p>
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

// ─── CHECKOUT PANEL ───────────────────────────
let checkoutSummaryOpen = true;

function openCheckout() {
  if (cart.length === 0) return;
  renderCheckoutSummary();
  document.getElementById('checkoutPanel').classList.add('open');
  document.getElementById('checkoutOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutPanel')?.classList.remove('open');
  document.getElementById('checkoutOverlay')?.classList.remove('active');
  if (!document.getElementById('cartDrawer')?.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function renderCheckoutSummary() {
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = getDeliveryFee();
  const total      = subtotal + deliveryFee;
  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);

  const itemsList = document.getElementById('coItemsList');
  itemsList.innerHTML = '';
  cart.forEach(item => {
    const prod  = PRODUCTS[item.baseId || item.id] || {};
    const div = document.createElement('div');
    div.className = 'co-item';
    div.innerHTML = `
      <div class="co-item-thumb">${prod.emoji || '🧬'}</div>
      <div class="co-item-info">
        <div class="co-item-name">${item.name}</div>
        <div class="co-item-qty">× ${item.qty}</div>
      </div>
      <div class="co-item-price">₱${(item.price * item.qty).toLocaleString('en-PH')}</div>
    `;
    itemsList.appendChild(div);
  });

  document.getElementById('coItemCount').textContent = `(${totalQty} item${totalQty !== 1 ? 's' : ''})`;
  document.getElementById('coSubtotal').textContent  = `₱${subtotal.toLocaleString('en-PH')}`;
  document.getElementById('coDeliveryFee').textContent = deliveryFee === 0 ? 'Free' : `₱${deliveryFee.toLocaleString('en-PH')}`;
  document.getElementById('coTotal').textContent = `₱${total.toLocaleString('en-PH')}`;
  document.getElementById('checkoutTotalDisplay').textContent = `₱${total.toLocaleString('en-PH')}`;
}

function getDeliveryFee() {
  const checked = document.querySelector('input[name="coDelivery"]:checked');
  return checked ? parseInt(checked.value, 10) : 200;
}

function toggleOrderSummary() {
  checkoutSummaryOpen = !checkoutSummaryOpen;
  const list = document.getElementById('coItemsList');
  const icon = document.getElementById('coToggleIcon');
  list.style.display = checkoutSummaryOpen ? '' : 'none';
  if (icon) icon.textContent = checkoutSummaryOpen ? '▲' : '▼';
}

// ─── PLACE ORDER (from checkout) ──────────────
function placeOrder(channel) {
  if (!validateCheckoutForm()) return;

  const name     = document.getElementById('coName').value.trim();
  const phone    = document.getElementById('coPhone').value.trim();
  const street   = document.getElementById('coStreet').value.trim();
  const city     = document.getElementById('coCity').value.trim();
  const province = document.getElementById('coProvince').value.trim();
  const notes    = document.getElementById('coNotes').value.trim();
  const payment  = document.querySelector('input[name="coPayment"]:checked')?.value || 'GCash';
  const deliveryFee = getDeliveryFee();
  const deliveryLabel = getDeliveryLabel();

  const lines    = cart.map(i => `• ${i.name} ×${i.qty} — ₱${(i.price * i.qty).toLocaleString('en-PH')}`).join('\n');
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + deliveryFee;
  const address  = [street, city, province].filter(Boolean).join(', ');

  const msg = [
    `🧬 BIOPEP ORDER`,
    ``,
    `📦 Items:`,
    lines,
    ``,
    `💰 Subtotal:  ₱${subtotal.toLocaleString('en-PH')}`,
    `🚚 Delivery:  ${deliveryFee === 0 ? 'Free' : `₱${deliveryFee.toLocaleString('en-PH')}`} (${deliveryLabel})`,
    `💳 Total:     ₱${total.toLocaleString('en-PH')}`,
    ``,
    `👤 Name:      ${name}`,
    `📱 Phone:     ${phone}`,
    `📍 Address:   ${address}`,
    `💳 Payment:   ${payment}`,
    notes ? `📝 Notes:     ${notes}` : null,
    ``,
    `— Sent via biopepph.com`,
  ].filter(l => l !== null).join('\n');

  const encoded = encodeURIComponent(msg);

  if (channel === 'messenger') {
    window.open(`https://m.me/${MESSENGER_PAGE}`, '_blank');
    showToast('Opening Messenger — paste your order!');
  } else if (channel === 'viber') {
    window.open(`viber://chat?number=${encodeURIComponent(VIBER_NUMBER)}&text=${encoded}`, '_blank');
    showToast('Opening Viber…');
  } else if (channel === 'telegram') {
    window.open(`https://t.me/${TELEGRAM_USER}?text=${encoded}`, '_blank');
    showToast('Opening Telegram…');
  }
}

function getDeliveryLabel() {
  const val = document.querySelector('input[name="coDelivery"]:checked')?.value;
  if (val === '150')  return 'Same-Day Metro Manila';
  if (val === '0')    return 'Pickup';
  return 'Nationwide J&T / Lalamove';
}

function validateCheckoutForm() {
  const fields = [
    { id: 'coName',   label: 'Full Name'    },
    { id: 'coPhone',  label: 'Phone Number' },
    { id: 'coStreet', label: 'Street & Barangay' },
    { id: 'coCity',   label: 'City / Municipality' },
  ];
  let valid = true;
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el.value.trim()) {
      el.classList.add('error');
      el.addEventListener('input', () => el.classList.remove('error'), { once: true });
      valid = false;
    }
  });
  if (!valid) {
    showToast('⚠️ Please fill in all required fields.');
    document.getElementById('checkoutBody').scrollTo({ top: 0, behavior: 'smooth' });
  }
  return valid;
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

// ─── PROMO BAR ────────────────────────────────
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
  initPromoBar();
  initSmoothScroll();

  // Cart
  document.getElementById('cartOpen')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('stickyBtn')?.addEventListener('click', openCart);

  // Product modal
  document.getElementById('pmodalClose')?.addEventListener('click', closeModal);
  document.getElementById('pmodalOverlay')?.addEventListener('click', closeModal);
  document.getElementById('pmodalAddBtn')?.addEventListener('click', addFromModal);

  // Checkout panel
  document.getElementById('checkoutBack')?.addEventListener('click', () => {
    closeCheckout();
    openCart();
  });
  document.getElementById('checkoutOverlay')?.addEventListener('click', closeCheckout);

  // Delivery fee update triggers checkout total refresh
  document.querySelectorAll('input[name="coDelivery"]').forEach(r => {
    r.addEventListener('change', renderCheckoutSummary);
  });

  // ESC key closes everything
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('checkoutPanel')?.classList.contains('open')) {
        closeCheckout(); openCart();
      } else if (document.getElementById('pmodal')?.classList.contains('open')) {
        closeModal();
      } else {
        closeCart();
      }
    }
  });
});
