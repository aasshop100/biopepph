// BIOPEP PH — confirmation.js

const WHATSAPP_NUMBER = '639171132273';
const VIBER_NUMBER    = '+639171132273';
const TELEGRAM_USER   = 'legitrche';

document.addEventListener('DOMContentLoaded', () => {
  const order = JSON.parse(localStorage.getItem('biopep_order'));

  if (!order) {
    window.location.href = 'index.html';
    return;
  }

  // Cart cleared once order reaches confirmation
  localStorage.removeItem('biopep_cart');

  renderHero(order);
  renderCartItems(order);
  renderTotals(order);
  renderDeliveryInfo(order);
  renderContactLinks(order);
  renderExternalStep(order);

  const sentKey = 'biopep_sent_' + order.orderId;
  if (!localStorage.getItem(sentKey)) {
    sendToSheet(order).then(ok => { if (ok) localStorage.setItem(sentKey, '1'); });
  }
});

/**
 * Shopee and Lalamove orders. For both, the items are paid on the payment page and the delivery is
 * arranged outside this site — which is why the delivery fee is ₱0 at checkout for either one. One
 * fixed link serves every order, so the buyer has nothing to pick or look up.
 *
 * Keyed on deliveryValue, never on the fee: Lalamove and Shopee are both ₱0, so a fee check would
 * fire on the wrong one.
 */
const EXTERNAL_STEPS = {
  shopee: {
    config:  () => (typeof SHOPEE !== 'undefined' ? SHOPEE : null),
    card:    'confShopeeCard',
    note:    'confShopeeNote',
    link:    'confShopeeLink',
    copyBtn: 'confShopeeCopyLink',
    copyMsg: 'Shopee link copied',
  },
  lalamove: {
    config:  () => (typeof LALAMOVE !== 'undefined' ? LALAMOVE : null),
    card:    'confLalamoveCard',
    note:    'confLalamoveNote',
    link:    'confLalamoveLink',
    copyBtn: 'confLalamoveCopyLink',
    copyMsg: 'Lalamove link copied',
  },
};

function renderExternalStep(order) {
  const step = EXTERNAL_STEPS[order.deliveryValue];
  if (!step) return;

  const card = document.getElementById(step.card);
  const cfg  = step.config() || {};
  const url  = cfg.url || '';
  if (!card || !url) return;

  document.getElementById(step.note).textContent = cfg.note || '';
  document.getElementById(step.link).href        = url;

  copyOnClick(step.copyBtn, url, step.copyMsg);

  card.style.display = '';

  // Actions first, reference last. Re-stack the cards between this card and Continue Shopping.
  const parent = card.parentNode;
  const anchor = document.getElementById('confContinueCard');
  ['confProofCard', 'confNextCard', 'confSummaryCard', 'confDeliveryCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el && anchor) parent.insertBefore(el, anchor);
  });
}

// Shopee and Lalamove both carry a ₱0 fee because the delivery is paid outside the site — never
// show that as "Free". Keyed on deliveryValue, not on the fee.
const EXTERNAL_FEE_LABELS = {
  shopee:   'Paid on Shopee',
  lalamove: 'Paid via Lalamove',
};

// The buyer gives the address to Shopee / to the Lalamove form, so a blank address here is expected
// rather than missing. Say which, so the admin message is not read as an incomplete order.
const EXTERNAL_ADDRESS_FALLBACKS = {
  shopee:   'N/A — Shopee Checkout',
  lalamove: 'N/A — Lalamove form',
};

function deliveryAddressText(order) {
  const parts = [order.street, order.city, order.province].filter(Boolean);
  return parts.join(', ')
      || EXTERNAL_ADDRESS_FALLBACKS[order.deliveryValue]
      || 'N/A';
}

function copyOnClick(btnId, text, okMsg) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e2) { /* ignore */ }
      ta.remove();
    }
    btn.textContent = '✓ ' + okMsg;
    setTimeout(() => { btn.textContent = label; }, 2000);
  });
}

function renderHero(order) {
  document.getElementById('confOrderId').textContent = `Order #${order.orderId}`;

  const placedAt = new Date(order.placedAt);
  document.getElementById('confPlacedAt').textContent =
    placedAt.toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
}

function renderCartItems(order) {
  const container = document.getElementById('confCartItems');
  order.cart.forEach(item => {
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

function renderTotals(order) {
  document.getElementById('confSubtotal').textContent = `₱${order.subtotal.toLocaleString('en-PH')}`;
  document.getElementById('confDelivery').textContent =
    EXTERNAL_FEE_LABELS[order.deliveryValue]
    || (order.deliveryFee === 0 ? 'Free' : `₱${order.deliveryFee.toLocaleString('en-PH')}`);
  document.getElementById('confTotal').textContent    = `₱${order.total.toLocaleString('en-PH')}`;

  if (order.discount > 0) {
    document.getElementById('confDiscountRow').style.display = 'flex';
    document.getElementById('confDiscount').textContent      = `-₱${order.discount.toLocaleString('en-PH')}`;
  }
}

function renderDeliveryInfo(order) {
  document.getElementById('confName').textContent          = order.name;
  document.getElementById('confPhone').textContent         = order.phone;
  document.getElementById('confDeliveryOpt').textContent   = order.deliveryLabel  || '—';
  document.getElementById('confPaymentMethod').textContent = order.paymentMethod  || '—';

  document.getElementById('confAddress').textContent = deliveryAddressText(order);

  if (order.notes) {
    document.getElementById('confNotesRow').style.display = 'block';
    document.getElementById('confNotes').textContent      = order.notes;
  }
}

function renderContactLinks(order) {
  const items = order.cart.map(i => `  • ${i.name} ×${i.qty} — ₱${(i.price * i.qty).toLocaleString('en-PH')}`).join('\n');
  const address = deliveryAddressText(order);

  const lines = [
    `🧬 NEW ORDER — BIOPEP PH`,
    ``,
    `🆔 Order ID: ${order.orderId}`,
    `📅 Date: ${new Date(order.placedAt).toLocaleString('en-PH')}`,
    ``,
    `📦 ITEMS:`,
    items,
    ``,
    `💰 Subtotal:  ₱${order.subtotal.toLocaleString('en-PH')}`,
    order.deliveryFee > 0 ? `🚚 Shipping:  ₱${order.deliveryFee.toLocaleString('en-PH')} (${order.deliveryLabel || 'Delivery'})` : null,
    order.discount > 0 ? `🎟️ Discount:  -₱${order.discount.toLocaleString('en-PH')}` : null,
    `💳 TOTAL:     ₱${order.total.toLocaleString('en-PH')}`,
    ``,
    `👤 Name:      ${order.name}`,
    `📱 Phone:     ${order.phone}`,
    `📍 Address:   ${address}`,
    `🚚 Delivery:  ${order.deliveryLabel || '—'}`,
    `💳 Payment:   ${order.paymentMethod || '—'}`,
    order.notes ? `📝 Notes:     ${order.notes}` : null,
    ``,
    `📸 Proof of payment attached.`,
  ].filter(l => l !== null).join('\n');

  const msg = encodeURIComponent(lines);

  document.getElementById('confMessenger').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  document.getElementById('confViber').href     = `viber://chat?number=${encodeURIComponent(VIBER_NUMBER)}`;
  document.getElementById('confTelegram').href  = `https://t.me/${TELEGRAM_USER}?text=${msg}`;

  document.getElementById('confCopyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(lines).then(() => {
      showConfToast('📋 Copied! Now open Viber and paste.');
    }).catch(() => {
      showConfToast('⚠️ Could not copy automatically. Please screenshot your order summary.');
    });
  });
}

// The order is already in the store sheet (placed at checkout, stock reserved).
// Here we only record the payment method the buyer chose; the sheet then emails the admin once.
async function sendToSheet(order) {
  if (!order.orderKey) return true; // an order from before the sheet switch — nothing to confirm
  const body = JSON.stringify({ action: 'confirm', orderId: order.orderId, key: order.orderKey, payment: order.paymentMethod || '' });
  // Safe to repeat: the sheet emails the admin only once per order. Google's hand-off sometimes
  // answers with a "page not found" page, so retry a few times before giving up.
  for (let attempt = 1; attempt <= 4; attempt++) {
    if (attempt > 1) await new Promise(r => setTimeout(r, 3000));
    try {
      const r = await fetch(ORDER_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body });
      const res = JSON.parse(await r.text());
      if (res && typeof res.ok === 'boolean') return res.ok;
    } catch (err) { /* retry */ }
  }
  console.warn('Could not confirm the order with the store sheet — will retry on the next visit.');
  return false;
}

function showConfToast(msg) {
  const existing = document.querySelector('.conf-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'conf-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
