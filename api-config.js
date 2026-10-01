// BIOPEP PH — the store back-office web app (Apps Script bound to the BIOPEP INVENTORY sheet).
// GET  → catalog JSON (Catalog tab: prices, stock, show/hide, sort, category)
// POST → place an order (reserves stock) / confirm payment method (emails the admin)
const ORDER_API_URL = 'https://script.google.com/macros/s/AKfycbxymMj2cO0im4PcTyBPScCkCVk5VvJFJRRA3QwvRJgoaERxG23EKyl987c-znAJgjTB6w/exec';

// Fast read-only feed: the Catalog tab ONLY, via File → Share → Publish to web (CSV).
// Never publish the whole document — Orders holds customer names, phones and addresses.
const CATALOG_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmelUkRZGeLM__8raUt5ZZdpGteIaMrCcENdlEcS-10oIEiQzcG0cXisT8-94AQoy2Lajcg2V6wYlg/pub?gid=1366575825&single=true&output=csv';

// Shown on the confirmation page ONLY when the buyer chose "Via Shopee Checkout".
// The items are paid on the payment page; the SHIPPING is paid on Shopee — which is why the
// delivery fee is ₱0 at checkout. One fixed listing serves every order from this site, so the
// link goes straight to the item and the buyer has nothing to pick.
const SHOPEE = {
  url: 'https://s.shopee.ph/8pmDDhvjWF',
  note: 'Your delivery fee is paid through Shopee. Open the link below and complete the Shopee checkout — it already points to the right item, so you just need to check out.',
};
