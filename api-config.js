// BIOPEP PH — the store back-office web app (Apps Script bound to the BIOPEP INVENTORY sheet).
// GET  → catalog JSON (Catalog tab: prices, stock, show/hide, sort, category)
// POST → place an order (reserves stock) / confirm payment method (emails the admin)
const ORDER_API_URL = 'https://script.google.com/macros/s/AKfycbxymMj2cO0im4PcTyBPScCkCVk5VvJFJRRA3QwvRJgoaERxG23EKyl987c-znAJgjTB6w/exec';

// Fast read-only feed: the Catalog tab ONLY, via File → Share → Publish to web (CSV).
// Never publish the whole document — Orders holds customer names, phones and addresses.
const CATALOG_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmelUkRZGeLM__8raUt5ZZdpGteIaMrCcENdlEcS-10oIEiQzcG0cXisT8-94AQoy2Lajcg2V6wYlg/pub?gid=1366575825&single=true&output=csv';
