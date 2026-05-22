// BIOPEP PH — confirmation.js

const MESSENGER_PAGE = 'https://m.me/biopepph';   // TODO: update with your FB page URL
const VIBER_NUMBER   = '+63XXXXXXXXXX';             // TODO: update with your Viber number
const TELEGRAM_USER  = 'biopepph';                 // TODO: update with your Telegram username

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
  const msg = encodeURIComponent(
    `Hi BIOPEP PH! Here is my payment proof for Order #${order.orderId}.\n` +
    `Total Paid: ₱${order.total.toLocaleString('en-PH')}\n` +
    `Payment Method: ${order.paymentMethod || '—'}`
  );

  document.getElementById('confMessenger').href = MESSENGER_PAGE;
  document.getElementById('confViber').href     = `viber://chat?number=${encodeURIComponent(VIBER_NUMBER)}&text=${msg}`;
  document.getElementById('confTelegram').href  = `https://t.me/${TELEGRAM_USER}?text=${msg}`;
}
