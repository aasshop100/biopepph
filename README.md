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

### Store back office — the BIOPEP INVENTORY sheet (`syncCatalogFromSheet()` in `script.js`)
Prices, stock, show/hide, category and card order come from the **Catalog** tab of the [BIOPEP INVENTORY sheet](https://docs.google.com/spreadsheets/d/1uzA0Hyg0Y-c9irJKrL-IFZXjxrGjDM_2ozueOP6B3mo), served as JSON by the sheet's own Apps Script web app (`ORDER_API_URL` in `api-config.js`). The script source, its flow tests and the sheet tools live **outside this repo** in `Desktop\BIOPEP-backoffice\`.

- **Catalog tab:** one row per option. A product's own fields (Product Name, Category, Stock, Show on Site, Sort Order) are only on its first row; rows under it with a blank name are its other options. Hidden columns A/B hold `P-0001` / `O-0001` ids.
- **Stock is per sheet product**, shared by its options (Vial Only + Complete Set). Blank stock = not counted, always orderable (pre-orders).
- **Cards are wired to sheet products by id, never by name** — `SHEET_MAP` in `script.js`: `'P-0011'` (options match the card's variant labels), `{ mfr: { Jinbei: 'P-0001', Avisala: 'P-0002' } }` (one sheet product per manufacturer, own stock + price), or `{ variants: { 'Vial Only': 'P-0024', 'Box': 'P-0025' } }` (one sheet product per card option). Renaming in the sheet can't break the site.
- Sheet **Category** sets the card's filter tab (`CATEGORY_KEYS`; `Other` is labelled "Add-ons"). **Sort Order** sets card order (sold-out cards still sink to the bottom). A card whose sheet products are all unticked disappears.
- **Where the shop page reads it from:** first the **published Catalog tab** (`CATALOG_CSV_URL` in `api-config.js` — File → Share → Publish to web, Catalog tab only, CSV; ~1 s, may lag edits by a few minutes); if that fails, the web app (`ORDER_API_URL`, always current but 2–40 s). Stock is re-checked live when an order is placed, so the lag is safe. The last good catalog is kept in `localStorage['biopep_catalog_v1']` and shown instantly while the fresh one loads.
- 🔒 **The sheet must stay "Restricted" and only the Catalog tab may be published** — Orders holds customer names, phones and addresses.
- Checkout retries lost web-app replies with the same `ref`; the script returns the already-saved order instead of a duplicate.
- **Adding a product** = sheet rows (ids fill in automatically) + a card in `index.html` + a `PRODUCTS` entry + a `SHEET_MAP` line.

⚠️ **Editing the sheet changes the LIVE site within about a minute — no deploy.**

### 2. Checkout (`checkout.html` + `checkout.js`)
- **Delivery method:** J&T Express (flat regional fee) or Lalamove (fee shouldered by buyer, confirmed at dispatch — not fixed, so it's excluded from all totals/breakdowns until then).
- **Province/City fields are searchable comboboxes**, not native `<select>` — typing filters the option list live (`setupCombo()` in checkout.js). Selecting a province populates the City combobox from `PH_CITIES_BY_PROVINCE[provinceCode]` and unlocks it. A field must be **selected from the list**, not just typed — if the hidden value never gets set, required-field validation blocks checkout. This guarantees the exact province name reaches WhatsApp/email/sheet (not a typo or free-text variant).
- **J&T fee auto-detection:** each province in `ph-address-data.js` is tagged with a region (`ncr: ₱160`, `luzon: ₱190`, `visayas: ₱200`, `mindanao: ₱220`). Selecting a province sets `selectedProvinceObj`, and `updateJntFee()` reads its `.region` to set the J&T radio's `data-fee` and update the visible fee text — no fuzzy text matching involved.
- Promo codes (`PROMO_CODES` object — percent or fixed discount) persist in `localStorage['biopep_promo']` across back-navigation, cleared on order placement or cart clear.
- `placeOrder()` **POSTs the order to the sheet** (`{ customer, delivery, region, promo, notes, website (bot trap), items: [{ optionId, qty }] }`). The sheet checks and **reserves stock**, computes prices / delivery fee / discount itself (`DELIVERY` and `PROMO_CODES` are mirrored in the Apps Script — change both), writes the Orders row and returns `BP-0001`-style order id + a secret `key`. The sheet's totals are stored in `localStorage['biopep_order']` and shown on the payment page. On `not_enough_stock` the cart is trimmed and the buyer sees a message.

### 3. Payment (`payment.html` + `payment.js`)
- Reads `biopep_order` from localStorage, renders cart + totals, shows QR code + account number for the selected method.
- `confirmPayment()` stamps the chosen payment method onto the order object and redirects to `confirmation.html`. No actual payment verification happens here — it's a "here's where to send money" screen; the buyer manually sends proof of payment via chat afterward.

### 4. Confirmation & admin notification (`confirmation.html` + `confirmation.js`)
On load, this page:
1. Clears the cart (order is considered placed).
2. Renders the order summary + delivery/payment info on-page.
3. Builds a pre-filled order summary message and wires it into WhatsApp (`wa.me` link), Viber (copy-to-clipboard, since `viber://` can't pre-fill text reliably), and Telegram (`t.me` link) buttons — the buyer taps one and manually attaches their payment screenshot.
4. Calls `sendToSheet(order)` — POSTs `{ action: 'confirm', orderId, key, payment }`. The sheet writes the Payment column and **emails the admin once** (Settings → Admin email). A `localStorage['biopep_sent_' + orderId]` flag is set only after success, so a failed call retries on the next visit.

**In the sheet:** Orders tab `Status` Pending → Paid → Shipped; **Cancelled puts the stock back once**; Pending orders older than Settings "Unpaid order hold (hours)" (12) are auto-cancelled hourly. Every stock change is in the Stock Log tab. (The old separate Orders spreadsheet `1jGcway…` is history only.)

⚠️ **Updating the Apps Script:** paste the new code (use `Code-paste.gs` over Remote Desktop), save, then **Deploy → Manage deployments → ✏️ → New version** — never "New deployment" (new URL = site breaks).

---

## Known constraints / gotchas

- **No backend server** — the sheet's Apps Script web app is the backend (catalog, orders, stock, admin email). If it's unreachable, checkout shows an error and no order is placed (nothing is lost silently); the shop keeps showing the last saved catalog.
- **Cart/order data lives entirely in `localStorage`** — clearing browser data mid-checkout loses the cart; there's no server-side cart recovery.
- **Lalamove's fee is never itemized** — it's confirmed manually at dispatch, so it's intentionally left out of the subtotal/shipping breakdown everywhere (checkout totals, WhatsApp message, admin email). Only J&T's fee (auto-detected by province region) shows as a line item.
- **GitHub Pages deploy has no staging environment** — pushing to `master` goes straight to the live domain. Test locally (or push and verify quickly) before pushing changes that touch checkout/payment/confirmation logic.

---

## Changelog

Changes are appended here as they're made, most recent first.

### 2026-09-22 — Store back office in the BIOPEP INVENTORY sheet (stock deducted per order)
- Catalog now comes from the sheet's **Catalog** tab via its Apps Script web app (`api-config.js`), wired by Product ID (`SHEET_MAP`) instead of matching `Sheet1` rows by name.
- **Orders go into the sheet at checkout and reserve stock**; prices/fees/discounts are decided by the sheet; the confirmation page records the payment method and triggers one admin email. Cancelled → stock back; unpaid 12 h → auto-cancelled.
- All card badges removed except **Pre-Order**; glutathione cards moved to a new **Anti-oxidant** tab; card order follows the sheet's Sort Order (both pre-orders first).
- Retatrutide 15mg (Avisala) card restored; closed "Korean Glutathione 1200mg Box (10x)" card removed; Korean Glutathione Box pre-order now ₱3,500 with FUAN's "Always open, ETA: 7 days upon payment." text.
- Hidden bot-trap field on checkout; cart lines carry the sheet option id (old carts are upgraded on the shop page).

### 2026-09-22 — J&T Express delivery option hidden
- Checkout now offers only **Lalamove** (default) and **Shopee Checkout**. The J&T block is still in `checkout.html`, hidden (`style="display:none"`) with its radio `disabled`; the regional fee logic in `checkout.js` is untouched, so restoring J&T is just removing those two attributes.

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
