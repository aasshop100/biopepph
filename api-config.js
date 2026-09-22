// BIOPEP PH — the store back-office web app (Apps Script bound to the BIOPEP INVENTORY sheet).
// GET  → catalog JSON (Catalog tab: prices, stock, show/hide, sort, category)
// POST → place an order (reserves stock) / confirm payment method (emails the admin)
const ORDER_API_URL = 'https://script.google.com/macros/s/AKfycbxymMj2cO0im4PcTyBPScCkCVk5VvJFJRRA3QwvRJgoaERxG23EKyl987c-znAJgjTB6w/exec';
