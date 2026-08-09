# BIOPEP PH

Peptide e-commerce storefront for BIOPEP PH — research-grade peptides, BAC water, syringes, and related supplies, sold to Philippine customers with manual order processing (no payment gateway integration; proof-of-payment is sent by the buyer via chat).

**Live site:** https://biopep.shop
**Repo:** https://github.com/aasshop100/biopepph
**Hosting:** GitHub Pages, custom domain via Namecheap DNS (CNAME → `aasshop100.github.io`, A records → GitHub Pages IPs)
**Stack:** Plain HTML/CSS/JS — no framework, no build step, no backend server. State lives in `localStorage`. Order notifications are handled by a Google Apps Script Web App acting as a lightweight backend.

Deploying is just `git push origin master` — GitHub Pages rebuilds automatically within a minute or two.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` + `script.js` | Storefront — product grid, category tabs, search, product detail modal, cart drawer |
| `checkout.html` + `checkout.js` | Delivery method, customer details/address, promo code, order totals |
| `payment.html` + `payment.js` | Payment method selection (GCash / Maya / Maribank / GoTyme), shows QR codes |
| `confirmation.html` + `confirmation.js` | Order summary, sends order to Google Sheet + admin email, pre-filled WhatsApp/Viber/Telegram message to send proof of payment |
| `calculator.html` | Standalone peptide dosage calculator (mg / BAC water / desired dose → units to draw) |
| `guidelines.html` | Peptide protocol reference pages (reconstitution, dosing, storage, reminders per peptide) |
| `ph-address-data.js` | Static dataset — 84 PH provinces (incl. Metro Manila/NCR) + ~1,600 cities/municipalities, each province tagged with a delivery region (`ncr`/`luzon`/`visayas`/`mindanao`) |

---

## How the order flow works

### 1. Product catalog & cart (`script.js`)
- All products live in the `PRODUCTS` object (id → name, price, image, category, description, variants). Products with `hidden: true` exist in data but never render (kept around in case they come back in stock). Products with `soldOut: true` (or a custom string like `'Closed'`) render with a disabled "Sold Out" button.
- Two-variant products (most peptides) offer **Complete Set** (full price) and **Vial Set** (`priceAdd: -200`, cheaper, fewer accessories) — selecting a variant in the product modal changes `modalVariantIdx` and recalculates price live.
- Cart is an array of `{ id, baseId, name, price, qty }` persisted to `localStorage['biopep_cart']`. `id` includes the variant label (e.g. `tirze-10mg__Vial Set`) so each variant is a separate cart line; `baseId` points back to the `PRODUCTS` entry for image/emoji lookup.
- Cart total, sticky bar, and drawer all re-render from `renderCart()` any time the cart array changes.

### 2. Checkout (`checkout.html` + `checkout.js`)
- **Delivery method:** J&T Express (flat regional fee) or Lalamove (fee shouldered by buyer, confirmed at dispatch — not fixed, so it's excluded from all totals/breakdowns until then).
- **Province/City fields are searchable comboboxes**, not native `<select>` — typing filters the option list live (`setupCombo()` in checkout.js). Selecting a province populates the City combobox from `PH_CITIES_BY_PROVINCE[provinceCode]` and unlocks it. A field must be **selected from the list**, not just typed — if the hidden value never gets set, required-field validation blocks checkout. This guarantees the exact province name reaches WhatsApp/email/sheet (not a typo or free-text variant).
- **J&T fee auto-detection:** each province in `ph-address-data.js` is tagged with a region (`ncr: ₱160`, `luzon: ₱190`, `visayas: ₱200`, `mindanao: ₱220`). Selecting a province sets `selectedProvinceObj`, and `updateJntFee()` reads its `.region` to set the J&T radio's `data-fee` and update the visible fee text — no fuzzy text matching involved.
- Promo codes (`PROMO_CODES` object — percent or fixed discount) persist in `localStorage['biopep_promo']` across back-navigation, cleared on order placement or cart clear.
- `placeOrder()` builds the full order object (name, phone, address, delivery method + fee, promo, cart, totals) and stores it in `localStorage['biopep_order']`, then redirects to `payment.html`.

### 3. Payment (`payment.html` + `payment.js`)
- Reads `biopep_order` from localStorage, renders cart + totals, shows QR code + account number for the selected method.
- `confirmPayment()` stamps the chosen payment method onto the order object and redirects to `confirmation.html`. No actual payment verification happens here — it's a "here's where to send money" screen; the buyer manually sends proof of payment via chat afterward.

### 4. Confirmation & admin notification (`confirmation.html` + `confirmation.js`)
On load, this page:
1. Clears the cart (order is considered placed).
2. Renders the order summary + delivery/payment info on-page.
3. Builds a pre-filled order summary message and wires it into WhatsApp (`wa.me` link), Viber (copy-to-clipboard, since `viber://` can't pre-fill text reliably), and Telegram (`t.me` link) buttons — the buyer taps one and manually attaches their payment screenshot.
4. Fires `sendToSheet(order)` — a `fetch(..., {mode:'no-cors'})` POST to a Google Apps Script Web App webhook. This **only fires once per order** — a `localStorage['biopep_sent_' + orderId]` flag guards against duplicate sends on page refresh.

**What the webhook does (lives on script.google.com, not in this repo):** appends a row to the "Orders" tab of the [Orders Google Sheet](https://docs.google.com/spreadsheets/d/1jGcwayWGuoa-Pj8Fv8eMAsma4gD6K2jaSrfoE2m4qvQ), and emails a formatted HTML summary to the admin inbox. Sheet columns: `Order ID | Date | Name | Phone | Address | Items | Total | Payment | Shipping | Status | Notes | Subtotal | Shipping Fee`.

⚠️ **Editing that Apps Script requires two extra steps beyond saving:** (1) if the sheet gains new columns, add matching headers in the sheet manually — the script writes by position, not by header name; (2) **Deploy → Manage deployments → edit → New version → Deploy** — saving in the editor alone does *not* update the live webhook URL.

---

## Known constraints / gotchas

- **No backend, no database** — every "server-side" behavior (order storage, admin email) is done via a Google Apps Script Web App triggered by a `fetch()` call from the confirmation page. If that webhook fails silently (the `fetch` call swallows errors with `.catch(() => {})`), the order is still placed from the buyer's perspective but never reaches the sheet/email — there's no retry.
- **Cart/order data lives entirely in `localStorage`** — clearing browser data mid-checkout loses the cart; there's no server-side cart recovery.
- **Lalamove's fee is never itemized** — it's confirmed manually at dispatch, so it's intentionally left out of the subtotal/shipping breakdown everywhere (checkout totals, WhatsApp message, admin email). Only J&T's fee (auto-detected by province region) shows as a line item.
- **GitHub Pages deploy has no staging environment** — pushing to `master` goes straight to the live domain. Test locally (or push and verify quickly) before pushing changes that touch checkout/payment/confirmation logic.

---

## Changelog

Changes are appended here as they're made, most recent first.

### 2026-07-04 — Searchable Province/City address fields + J&T auto fee + shipping breakdown
- Replaced free-text Province/City checkout fields with searchable comboboxes (`ph-address-data.js`, `checkout.js`) — typing filters live, selecting a province auto-detects its delivery region and sets the correct J&T Express fee (NCR ₱160 / Luzon ₱190 / Visayas ₱200 / Mindanao ₱220) instead of a flat ₱160 regardless of location.
- Added `subtotal` and `shippingFee` fields to the order webhook payload (`confirmation.js`) and a 🚚 Shipping line to the WhatsApp/Telegram message — previously the shipping fee was invisible in both the admin email and the chat message.
- Added `Subtotal` / `Shipping Fee` header columns (L/M) to the Orders Google Sheet, and updated the Apps Script webhook to write those columns and show them in the admin email's price breakdown.
- Removed a stray `.netlify/` folder (leftover Netlify CLI state — BIOPEP is hosted on GitHub Pages, not Netlify) and confirmed it was untracked/unused.
