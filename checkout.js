// BIOPEP PH — checkout.js

const PROMO_CODES = {
  'WELCOME10': { type: 'percent', value: 10,  label: '10% off — Welcome discount!' },
  'BIOPEP20':  { type: 'percent', value: 20,  label: '20% off — BIOPEP20 applied!'  },
  'FREESHIP':  { type: 'ship',    value: 0,   label: 'Free shipping applied!'        },
  'SAVE200':   { type: 'fixed',   value: 200, label: '₱200 off your order!'          },
};

let cart        = JSON.parse(localStorage.getItem('biopep_cart')) || [];
let appliedPromo = null;

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
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

  document.querySelectorAll('input[name="coDelivery"]').forEach(r => {
    r.addEventListener('change', () => {
      updateTotals();
    });
  });

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
  return checked ? checked.dataset.label : 'Via Lalamove';
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
  document.getElementById('coPageDelivery').textContent = delivery === 0 ? 'Free' : `₱${delivery.toLocaleString('en-PH')}`;
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
    result.textContent  = '✓ ' + promo.label;
    result.className    = 'co-promo-result success';
    input.disabled      = true;
  } else {
    appliedPromo = null;
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
    { id: 'coStreet', label: 'Street & Barangay'  },
    { id: 'coCity',   label: 'City / Municipality'},
  ];
  let valid = true;
  required.forEach(f => {
    const el = document.getElementById(f.id);
    el.classList.remove('error');
    if (!el.value.trim()) {
      el.classList.add('error');
      el.addEventListener('input', () => el.classList.remove('error'), { once: true });
      valid = false;
    }
  });
  if (!valid) {
    showToast('⚠️ Please fill in all required fields.');
    document.querySelector('.co-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return valid;
}

// ─── PLACE ORDER ──────────────────────────────
function placeOrder() {
  if (cart.length === 0) return;
  if (!validateForm()) return;

  const subtotal     = getSubtotal();
  const deliveryFee  = getDeliveryFee();
  const deliveryLabel = getDeliveryLabel();
  const discount     = getDiscount(subtotal);
  const total        = Math.max(0, subtotal + deliveryFee - discount);

  const orderId = 'BP-' + Date.now().toString(36).toUpperCase().slice(-6);

  const order = {
    orderId,
    name:          document.getElementById('coName').value.trim(),
    phone:         document.getElementById('coPhone').value.trim(),
    street:        document.getElementById('coStreet').value.trim(),
    city:          document.getElementById('coCity').value.trim(),
    province:      document.getElementById('coProvince').value.trim(),
    notes:         document.getElementById('coNotes').value.trim(),
    deliveryValue: document.querySelector('input[name="coDelivery"]:checked')?.value,
    deliveryLabel,
    deliveryFee,
    promo:         appliedPromo,
    discount,
    subtotal,
    total,
    cart:          [...cart],
    placedAt:      new Date().toISOString(),
  };

  localStorage.setItem('biopep_order', JSON.stringify(order));
  window.location.href = 'payment.html';
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
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}
