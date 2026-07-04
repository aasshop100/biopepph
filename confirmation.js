// BIOPEP PH — confirmation.js

const WHATSAPP_NUMBER = '639171132273';
const VIBER_NUMBER    = '+639171132273';
const TELEGRAM_USER   = 'legitrche';
const WEBHOOK_URL     = 'https://script.google.com/macros/s/AKfycbwq6RPckD4svmh2G41NZPO9ekULuPGn4BTyBgXsmbeq7_fW7-nRWjzQBVMahGlAehnT/exec';

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

  const sentKey = 'biopep_sent_' + order.orderId;
  if (!localStorage.getItem(sentKey)) {
    sendToSheet(order);
    localStorage.setItem(sentKey, '1');
  }
});

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
  document.getElementById('confDelivery').textContent = order.deliveryFee === 0 ? 'Free' : `₱${order.deliveryFee.toLocaleString('en-PH')}`;
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

  const addrParts = [order.street, order.city, order.province].filter(Boolean);
  document.getElementById('confAddress').textContent = addrParts.join(', ');

  if (order.notes) {
    document.getElementById('confNotesRow').style.display = 'block';
    document.getElementById('confNotes').textContent      = order.notes;
  }
}

function renderContactLinks(order) {
  const items = order.cart.map(i => `  • ${i.name} ×${i.qty} — ₱${(i.price * i.qty).toLocaleString('en-PH')}`).join('\n');
  const address = [order.street, order.city, order.province].filter(Boolean).join(', ');

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

function sendToSheet(order) {
  const address = [order.street, order.city, order.province].filter(Boolean).join(', ');
  const items = order.cart.map(i => `${i.name} ×${i.qty} — ₱${(i.price * i.qty).toLocaleString('en-PH')}`).join('\n');
  const date = new Date(order.placedAt).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const payload = {
    orderId:      order.orderId,
    date:         date,
    name:         order.name,
    phone:        order.phone,
    address:      address,
    items:        items,
    subtotal:     '₱' + order.subtotal.toLocaleString('en-PH'),
    shippingFee:  order.deliveryFee > 0 ? '₱' + order.deliveryFee.toLocaleString('en-PH') : '',
    total:        '₱' + order.total.toLocaleString('en-PH'),
    payment:      order.paymentMethod || '—',
    delivery:     order.deliveryLabel || '—',
    notes:        order.notes || '',
  };

  fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(payload),
  }).catch(() => {});
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
