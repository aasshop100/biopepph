// BIOPEP PH — checkout.js

const PROMO_CODES = {
  'WELCOME10': { type: 'percent', value: 10,  label: '10% off — Welcome discount!' },
  'BIOPEP20':  { type: 'percent', value: 20,  label: '20% off — BIOPEP20 applied!'  },
  'SAVE200':   { type: 'fixed',   value: 200, label: '₱200 off your order!'          },
  '100OFF':    { type: 'fixed',   value: 100, label: '₱100 off your order!'          },
};

let cart         = JSON.parse(localStorage.getItem('biopep_cart')) || [];
let appliedPromo = localStorage.getItem('biopep_promo') || null;

// ─── J&T REGION RATES ─────────────────────────
const JNT_REGION_FEES   = { ncr: 160, luzon: 190, visayas: 200, mindanao: 220 };
const JNT_REGION_LABELS = { ncr: 'NCR', luzon: 'Luzon', visayas: 'Visayas', mindanao: 'Mindanao' };

// ─── PROVINCE / CITY SEARCHABLE COMBOBOXES ────
let selectedProvinceObj = null; // { code, name, region }

function setupCombo({ inputId, hiddenId, listId, getOptions, onSelect, emptyText }) {
  const input  = document.getElementById(inputId);
  const hidden = document.getElementById(hiddenId);
  const list   = document.getElementById(listId);
  if (!input || !hidden || !list) return;

  function render(query) {
    const options = getOptions();
    const q = (query || '').trim().toLowerCase();
    const filtered = q ? options.filter(o => o.toLowerCase().includes(q)) : options;

    list.innerHTML = '';
    if (filtered.length === 0) {
      list.innerHTML = `<div class="co-combo-empty">${emptyText || 'No matches found'}</div>`;
    } else {
      filtered.slice(0, 200).forEach(name => {
        const item = document.createElement('div');
        item.className = 'co-combo-option';
        item.textContent = name;
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = name;
          hidden.value = name;
          list.classList.remove('show');
          onSelect(name);
        });
        list.appendChild(item);
      });
    }
    list.classList.add('show');
  }

  input.addEventListener('input', () => {
    hidden.value = '';
    render(input.value);
  });

  input.addEventListener('focus', () => {
    if (!input.disabled) render(input.value);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => list.classList.remove('show'), 150);
  });

  return { render };
}

function resetCityCombo(placeholderText) {
  const cityInput  = document.getElementById('coCityInput');
  const cityHidden = document.getElementById('coCity');
  cityInput.value  = '';
  cityHidden.value = '';
  cityInput.placeholder = placeholderText;
  cityInput.disabled = !selectedProvinceObj;
}

function initProvinceCombo() {
  if (typeof PH_PROVINCES === 'undefined') return;

  setupCombo({
    inputId: 'coProvinceInput',
    hiddenId: 'coProvince',
    listId: 'coProvinceList',
    getOptions: () => PH_PROVINCES.map(p => p.name),
    emptyText: 'No province found',
    onSelect: (name) => {
      selectedProvinceObj = PH_PROVINCES.find(p => p.name === name) || null;
      resetCityCombo('Type to search city / municipality...');
      updateJntFee();
    },
  });
}

function initCityCombo() {
  setupCombo({
    inputId: 'coCityInput',
    hiddenId: 'coCity',
    listId: 'coCityList',
    getOptions: () => {
      if (!selectedProvinceObj || typeof PH_CITIES_BY_PROVINCE === 'undefined') return [];
      return PH_CITIES_BY_PROVINCE[selectedProvinceObj.code] || [];
    },
    emptyText: 'No city found',
    onSelect: () => {},
  });
}

function updateJntFee() {
  const jntInput = document.querySelector('input[name="coDelivery"][value="jnt"]');
  if (!jntInput) return;

  const region = selectedProvinceObj?.region || null;
  const fee    = region ? JNT_REGION_FEES[region] : 160;
  const label  = region ? JNT_REGION_LABELS[region] : null;

  jntInput.dataset.fee = fee;

  const feeDisplay = document.getElementById('jntFeeDisplay');
  const feeSummary = document.getElementById('jntFeeSummary');
  const detectedNote = document.getElementById('jntDetectedNote');
  if (feeDisplay) feeDisplay.textContent = `₱${fee}`;
  if (feeSummary) feeSummary.textContent = `Flat rate — ₱${fee}`;
  if (detectedNote) {
    detectedNote.textContent = label
      ? `📌 Detected area: ${label} — J&T fee automatically set to ₱${fee}.`
      : `📌 Select your Province below and we'll auto-select the right rate for your area.`;
  }

  if (jntInput.checked) updateTotals();
}

// ─── SHOPEE CHECKOUT: ADDRESS NOT REQUIRED ────
function isShopeeDelivery() {
  return document.querySelector('input[name="coDelivery"]:checked')?.value === 'shopee';
}

function updateAddressRequirement() {
  const isShopee     = isShopeeDelivery();
  const addressFields = document.getElementById('coAddressFields');
  const shopeeNote     = document.getElementById('coAddressShopeeNote');
  if (addressFields) addressFields.style.display = isShopee ? 'none' : '';
  if (shopeeNote)     shopeeNote.style.display    = isShopee ? 'block' : 'none';
}

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initProvinceCombo();
  initCityCombo();

  if (cart.length === 0) {
    document.getElementById('coCartItems').style.display = 'none';
    document.getElementById('coEmptyMsg').style.display  = 'block';
    document.getElementById('btnPlaceOrder').disabled    = true;
    document.getElementById('btnPlaceOrder').textContent = 'Cart is Empty';
    document.getElementById('btnPlaceOrder').style.opacity = '0.5';
  } else {
    renderCartItems();
  }
  updateTotals();

  if (appliedPromo && PROMO_CODES[appliedPromo]) {
    const input  = document.getElementById('coPromo');
    const result = document.getElementById('coPromoResult');
    input.value      = appliedPromo;
    input.disabled   = true;
    result.textContent = '✓ ' + PROMO_CODES[appliedPromo].label;
    result.className   = 'co-promo-result success';
  }

  document.querySelectorAll('input[name="coDelivery"]').forEach(r => {
    r.addEventListener('change', () => {
      updateTotals();
      updateAddressRequirement();
    });
  });
  updateAddressRequirement();

  document.getElementById('coPromo').addEventListener('keydown', e => {
    if (e.key === 'Enter') applyPromo();
  });
});

// ─── RENDER CART ITEMS ────────────────────────
function renderCartItems() {
  const container = document.getElementById('coCartItems');
  container.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'co-cart-item';
    div.innerHTML = `
      <div class="co-cart-item-info">
        <span class="co-cart-item-name">${item.name}</span>
        <span class="co-cart-item-qty">× ${item.qty}</span>
      </div>
      <span class="co-cart-item-price">₱${(item.price * item.qty).toLocaleString('en-PH')}</span>
    `;
    container.appendChild(div);
  });
}

// ─── TOTALS ───────────────────────────────────
function getDeliveryFee() {
  const checked = document.querySelector('input[name="coDelivery"]:checked');
  return checked ? parseInt(checked.dataset.fee, 10) : 0;
}

function getDeliveryLabel() {
  const checked = document.querySelector('input[name="coDelivery"]:checked');
  return checked ? checked.dataset.label : 'Via J&T Express';
}

function getSubtotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function getDiscount(subtotal) {
  if (!appliedPromo) return 0;
  const p = PROMO_CODES[appliedPromo];
  if (!p) return 0;
  if (p.type === 'percent') return Math.round(subtotal * p.value / 100);
  if (p.type === 'fixed')   return p.value;
  if (p.type === 'ship')    return getDeliveryFee();
  return 0;
}

function updateTotals() {
  const subtotal  = getSubtotal();
  const delivery  = getDeliveryFee();
  const discount  = getDiscount(subtotal);
  const total     = Math.max(0, subtotal + delivery - discount);

  document.getElementById('coPageSubtotal').textContent = `₱${subtotal.toLocaleString('en-PH')}`;
  document.getElementById('coPageDelivery').textContent = `₱${delivery.toLocaleString('en-PH')}`;
  document.getElementById('coPageTotal').textContent    = `₱${total.toLocaleString('en-PH')}`;

  const discRow = document.getElementById('coDiscountRow');
  if (discount > 0) {
    discRow.style.display = 'flex';
    document.getElementById('coDiscount').textContent = `-₱${discount.toLocaleString('en-PH')}`;
  } else {
    discRow.style.display = 'none';
  }
}

// ─── PROMO CODE ───────────────────────────────
function applyPromo() {
  const input  = document.getElementById('coPromo');
  const result = document.getElementById('coPromoResult');
  const code   = input.value.trim().toUpperCase();

  if (!code) {
    result.textContent = '';
    return;
  }

  const promo = PROMO_CODES[code];
  if (promo) {
    appliedPromo = code;
    localStorage.setItem('biopep_promo', code);
    result.textContent  = '✓ ' + promo.label;
    result.className    = 'co-promo-result success';
    input.disabled      = true;
  } else {
    appliedPromo = null;
    localStorage.removeItem('biopep_promo');
    result.textContent = '✗ Invalid promo code.';
    result.className   = 'co-promo-result error';
  }
  updateTotals();
}

// ─── VALIDATION ───────────────────────────────
function validateForm() {
  const deliveryChecked = document.querySelector('input[name="coDelivery"]:checked');
  if (!deliveryChecked) {
    showToast('⚠️ Please select a delivery option first.');
    document.querySelector('.co-delivery-opts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return false;
  }

  const required = [
    { id: 'coName',   label: 'Full Name'         },
    { id: 'coPhone',  label: 'Phone Number'       },
  ];
  if (!isShopeeDelivery()) {
    required.push(
      { id: 'coStreet', label: 'Street & Barangay'  },
      { id: 'coProvince', label: 'Province',          display: 'coProvinceInput' },
      { id: 'coCity',   label: 'City / Municipality', display: 'coCityInput'     },
    );
  }
  let valid = true;
  required.forEach(f => {
    const el = document.getElementById(f.id);
    const displayEl = document.getElementById(f.display || f.id);
    displayEl.classList.remove('error');
    if (!el.value.trim()) {
      displayEl.classList.add('error');
      displayEl.addEventListener('input', () => displayEl.classList.remove('error'), { once: true });
      valid = false;
    }
  });

  const phoneEl = document.getElementById('coPhone');
  const phoneRaw = phoneEl.value.trim().replace(/[\s\-]/g, '');
  if (phoneRaw && !/^(09|\+639)\d{9}$/.test(phoneRaw)) {
    phoneEl.classList.add('error');
    phoneEl.addEventListener('input', () => phoneEl.classList.remove('error'), { once: true });
    showToast('⚠️ Enter a valid PH number (e.g. 09XX XXX XXXX).');
    return false;
  }

  if (!valid) {
    showToast('⚠️ Please fill in all required fields.');
    document.querySelector('.co-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return valid;
}

// ─── PLACE ORDER ──────────────────────────────
// The order is sent to the store sheet HERE: the sheet checks stock, reserves it, and decides the
// prices, delivery fee and discount. The amounts shown on the payment page are the sheet's.
const ORDER_ERRORS = {
  not_enough_stock: 'Some items just sold out — your cart has been updated. Please review it.',
  too_many_pending: 'You already have unpaid orders with this number. Please pay or contact us first.',
  missing_customer: 'Please check your name, phone number and address.',
  bad_items:        'Your cart has an item that can\'t be ordered. Please remove it and add it again.',
  bad_delivery:     'Please choose a delivery option.',
  busy:             'The store is busy — please try again in a few seconds.',
};
let placingOrder = false;

async function placeOrder() {
  if (cart.length === 0 || placingOrder) return;
  if (!validateForm()) return;

  // Every cart line needs its store id (set when the shop page loads the catalog).
  const stale = cart.filter(i => !i.optionId);
  if (stale.length) {
    cart = cart.filter(i => i.optionId);
    localStorage.setItem('biopep_cart', JSON.stringify(cart));
    showToast('⚠️ Please add these again from the shop: ' + stale.map(i => i.name).join(', '));
    setTimeout(() => { window.location.href = 'index.html#products'; }, 2500);
    return;
  }

  const btn = document.getElementById('btnPlaceOrder');
  const btnText = btn.textContent;
  placingOrder = true;
  btn.disabled = true;
  btn.textContent = 'Placing order…';

  const deliveryValue = document.querySelector('input[name="coDelivery"]:checked')?.value;
  const body = {
    customer: {
      name:     document.getElementById('coName').value.trim(),
      phone:    document.getElementById('coPhone').value.trim(),
      street:   document.getElementById('coStreet').value.trim(),
      city:     document.getElementById('coCity').value.trim(),
      province: document.getElementById('coProvince').value.trim(),
    },
    delivery: deliveryValue,
    region:   selectedProvinceObj?.region || '',
    promo:    appliedPromo || '',
    notes:    document.getElementById('coNotes').value.trim(),
    website:  document.getElementById('coWebsite')?.value || '',
    items:    cart.map(i => ({ optionId: i.optionId, qty: i.qty })),
  };

  let res;
  try {
    const r = await fetch(ORDER_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
    res = await r.json();
  } catch (err) {
    res = { ok: false, error: 'network' };
  }
  placingOrder = false;
  btn.disabled = false;
  btn.textContent = btnText;

  if (!res.ok) {
    if (res.error === 'not_enough_stock') trimCartToStock(res.items || []);
    showToast('⚠️ ' + (ORDER_ERRORS[res.error] || 'Could not place the order. Please check your connection and try again.'));
    return;
  }

  // Keep the buyer's cart names (they show the manufacturer/option) with the sheet's prices.
  const priceById = Object.fromEntries(res.lines.map(l => [l.optionId, l.price]));
  const order = {
    orderId:       res.orderId,
    orderKey:      res.key,
    name:          body.customer.name,
    phone:         body.customer.phone,
    street:        body.customer.street,
    city:          body.customer.city,
    province:      body.customer.province,
    notes:         body.notes,
    deliveryValue,
    deliveryLabel: res.deliveryLabel,
    deliveryFee:   res.shippingFee,
    promo:         res.promo || null,
    discount:      res.discount,
    subtotal:      res.subtotal,
    total:         res.total,
    holdHours:     res.holdHours,
    cart:          cart.map(i => ({ ...i, price: priceById[i.optionId] ?? i.price })),
    placedAt:      new Date().toISOString(),
  };

  localStorage.setItem('biopep_order', JSON.stringify(order));
  localStorage.removeItem('biopep_promo');
  window.location.href = 'payment.html';
}

/** After a "not enough stock" answer: lower or remove the lines that can't be filled. */
// Options of one product share its stock, so the limit is spent once across all their lines.
function trimCartToStock(problems) {
  const left = {};
  problems.forEach(p => {
    const key = p.productId || p.optionId;
    if (!(key in left)) left[key] = p.available;
    cart.filter(i => i.optionId === p.optionId).forEach(i => {
      const keep = Math.min(i.qty, Math.max(0, left[key]));
      left[key] -= keep;
      i.qty = keep;
    });
  });
  cart = cart.filter(i => i.qty > 0);
  localStorage.setItem('biopep_cart', JSON.stringify(cart));
  if (cart.length === 0) { window.location.href = 'index.html#products'; return; }
  renderCartItems();
  updateTotals();
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
