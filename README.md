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
- All products live in the `PRODUCTS` object (id → name, price, image, category, description, variants). Products with `hidden: true` exist in data but never render (kept around in case they come back in stock). Products with `soldOut: true` (or a custom string like `'Closed'`) render with a disabled "Sold Out" button. **Each visible product also needs its card written by hand in `index.html`** (`.pcard[data-id]`); the card's price/sold-out state is refreshed from `PRODUCTS` after the sheet sync.
- Product photos are hidden site-wide (compact list layout) — new products don't need an image.
- Variants are per product. Peptides use **Vial Only** (`priceAdd: -200`) + **Complete Set** (full price), some also **Vial and Bac** (`-100`). The Complete Set `desc` lists the kit contents — two kits exist: the 6-syringe kit (Tirzepatide, Eloralintide, Semax+Selank, NAD+, Snap-8, Cagrilintide) and the 25-syringe kit (KPV, GHK-Cu, GHK-Cu+KPV blends), both with BAC water. Selecting a variant changes `modalVariantIdx` and recalculates price live.
- **Manufacturer picker:** a product with `manufacturers: ['Jinbei', 'Avisala']` (the Tirzepatides) shows a required "Choose Manufacturer" row above the options — no default; Add to Cart is blocked until one is picked. Every manufacturer has the same options/prices; the choice only labels the cart line.
- **Per-option / per-manufacturer stock:** `variant.soldOut` greys out one option; `mfrSoldOut: { Avisala: true }` greys out one manufacturer. Both are normally set by the sheet sync (below); the modal pre-selects the first in-stock option.
- Cart is an array of `{ id, baseId, name, price, qty }` persisted to `localStorage['biopep_cart']`. `id` includes the label (e.g. `tirze-10mg__Jinbei · Complete Set`) so each manufacturer/variant is a separate cart line, and `name` carries it (`Tirzepatide 15mg (Jinbei · Complete Set)`) through checkout, payment, confirmation, the WhatsApp/Telegram message and the Orders sheet. `baseId` points back to the `PRODUCTS` entry.
- Cart total, sticky bar, and drawer all re-render from `renderCart()` any time the cart array changes.

### Live price & stock sheet (`syncCatalogFromSheet()` in `script.js`)
Prices and stock are pulled on **every page load** from the [pricing/inventory Google Sheet](https://docs.google.com/spreadsheets/d/1uzA0Hyg0Y-c9irJKrL-IFZXjxrGjDM_2ozueOP6B3mo) (published CSV, `Sheet1`). Columns: `Name | SRP vial only | SRP vial/bac | SRP complete set | STOCKS LEFT`. Stock `<= 0` / `Sold out` → sold out; `Soon` / `Closed` → that label; blank → untouched.

⚠️ **Editing the sheet changes the LIVE site immediately — no deploy.** And rows are matched to products **by name**, so renaming a product in code without renaming its sheet row silently stops it syncing (it falls back to the hardcoded price/stock). When renaming or replacing products, add the new rows first, push, and only then delete the old rows.

| Row name pattern | Example | What it sets |
|---|---|---|
| `Product Name` + vial-only & complete prices (vial/bac optional) | `KPV 30mg · 1200 · · 1500 · 3` | product price, Vial Only/Vial and Bac offsets, card stock |
| `Product Name` + one price | `Pink Insulin Syringe (10 pcs) · · · 50` | flat-price product |
| `Product Name - Option` + one price | `FUAN GTT 1500mg - Box · · · 5000 · 0` | that option's price **and its own stock**; card is sold out only when every option row is |
| `Product Name - Manufacturer`, no price | `Tirzepatide 30mg - Avisala · · · · 0` | that manufacturer's stock; card sold out only when all are 0 |

Rows with no price that match nothing (e.g. inventory-only `Retatrutide 10mg`, `Semax 5mg`) are ignored silently; rows for hidden products log a harmless `Sheet sync: no product match` warning.

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

### 2026-09-19 — Manufacturer picker, per-option stock, new products, glutathione/BAC consolidation
- **Forges GTT 1500mg:** options are now Vial & Saline (₱650) and Box (10 vials & 10 saline) (₱6,000).
- **Storefront cache bust:** versioned the `script.js` URL so browser caches pick up catalog/modal copy updates immediately.
- **FUAN Reduced Glutathione pre-order card:** description now says “Always open, ETA: 7 days upon payment.”
- **NAD+ 100mg:** removed the Vial and Bac option; only Vial Only and Complete Set remain.
- **Lalamove checkout card:** updated the dispatch window from 3PM–12AM to 3PM–9PM.
- **Shopee checkout card:** added “Shopee link will be provided upon check-out” to the delivery option description.
- **Follow-up catalog update:** GHK-Cu 50mg now offers Vial Only and Complete Set; the Vial and Bac option was removed. KPV 10mg now also offers only Vial Only and Complete Set; commit `2cdb529` contains the GHK-Cu change, and the KPV follow-up is in the current commit.
- **Tirzepatide 15/30mg:** Jinbei/Avisala manufacturer picker with per-manufacturer stock; "Vial and Bac" option removed (Vial Only + Complete Set). **Tirzepatide 60mg** added (₱1,600 / ₱1,800, sold out).
- **New products:** Eloralintide 10mg (₱1,200 / ₱1,400, sold out), Semax 5mg + Selank 5mg (₱1,200 / ₱1,400), KPV 30mg (₱1,200 / ₱1,500), China Lemon Bottle 10mL/50mL (₱800 / ₱1,500, sold out), Forges GTT 1500mg (₱550 / ₱1,500, sold out), Generic GTT 2500mg (₱600 / ₱5,500 kit).
- **Complete Set contents** now itemized: 6-syringe kit (Tirzepatide, Eloralintide, Semax+Selank, NAD+, Snap-8, Cagrilintide) and 25-syringe kit (KPV 10/30mg, GHK-Cu 50/100mg, both GHK-Cu+KPV blends), both incl. BAC water.
- **Glutathione consolidated:** Korean Glutathione 1200mg, KGTT w/ Vial Case, Korean Glutathione Box, Fuan Glutathione 1500mg and FUAN Box cards → **Korean Glutaone 1200mg** (Vial ₱450 / Box ₱4,000) and **FUAN GTT 1500mg** (Vial ₱550 / Box ₱5,000). Old entries kept as `hidden`.
- **BAC water consolidated** into one **BAC Water** card (3mL ₱60 / 5mL ₱70 / 10mL ₱80); Pharma BAC renamed **Pharma Bac 10ml Amp** and repriced ₱60.
- **Hidden:** Retatrutide 15mg, AOD-9604 5mg, 5-Amino-1MQ 5mg. Alcohol Swab card icon removed.
- Category tabs centered on desktop (≥768px); phones keep them left-aligned for swiping.
- **Sheet sync:** new per-option stock (`Name - Option` rows) and per-manufacturer rows (`Name - Manufacturer`); tiered rows no longer need the vial/bac column.

### 2026-07-04 — Searchable Province/City address fields + J&T auto fee + shipping breakdown
- Replaced free-text Province/City checkout fields with searchable comboboxes (`ph-address-data.js`, `checkout.js`) — typing filters live, selecting a province auto-detects its delivery region and sets the correct J&T Express fee (NCR ₱160 / Luzon ₱190 / Visayas ₱200 / Mindanao ₱220) instead of a flat ₱160 regardless of location.
- Added `subtotal` and `shippingFee` fields to the order webhook payload (`confirmation.js`) and a 🚚 Shipping line to the WhatsApp/Telegram message — previously the shipping fee was invisible in both the admin email and the chat message.
- Added `Subtotal` / `Shipping Fee` header columns (L/M) to the Orders Google Sheet, and updated the Apps Script webhook to write those columns and show them in the admin email's price breakdown.
- Removed a stray `.netlify/` folder (leftover Netlify CLI state — BIOPEP is hosted on GitHub Pages, not Netlify) and confirmed it was untracked/unused.
