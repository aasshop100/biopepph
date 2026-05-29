// BIOPEP PH — payment.js

const order = JSON.parse(localStorage.getItem('biopep_order'));

document.addEventListener('DOMContentLoaded', () => {
  if (!order) {
    window.location.href = 'index.html';
    return;
  }

  renderOrder();
  renderTotals();

  document.querySelectorAll('input[name="payMethod"]').forEach(r => {
    r.addEventListener('change', () => {
      switchPanel(r.value);
    });
  });

  updateAmounts();
});

function renderOrder() {
  document.getElementById('payOrderId').textContent = `Order #${order.orderId}`;

  const container = document.getElementById('payCartItems');
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

function renderTotals() {
  document.getElementById('paySubtotal').textContent      = `₱${order.subtotal.toLocaleString('en-PH')}`;
  document.getElementById('payDeliveryLabel').textContent = order.deliveryLabel || '—';
  document.getElementById('payDelivery').textContent      = `₱${order.deliveryFee.toLocaleString('en-PH')}`;
  document.getElementById('payTotal').textContent         = `₱${order.total.toLocaleString('en-PH')}`;

  if (order.discount > 0) {
    document.getElementById('payDiscountRow').style.display = 'flex';
    document.getElementById('payDiscount').textContent      = `-₱${order.discount.toLocaleString('en-PH')}`;
  }
}

function switchPanel(method) {
  document.querySelectorAll('.pay-detail-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`panel-${method}`);
  if (panel) panel.classList.add('active');
}

function updateAmounts() {
  const amount = `₱${order.total.toLocaleString('en-PH')}`;
  ['gcash', 'maya', 'bank', 'gotyme'].forEach(m => {
    const el = document.getElementById(`${m}Amount`);
    if (el) el.textContent = amount;
  });
}

function confirmPayment() {
  const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'gcash';

  const methodLabels = {
    gcash:  'GCash',
    maya:   'Maya',
    bank:   'Bank Transfer',
    gotyme: 'GoTyme',
  };

  const updated = { ...order, paymentMethod: methodLabels[method] || method };
  localStorage.setItem('biopep_order', JSON.stringify(updated));
  window.location.href = 'confirmation.html';
}
