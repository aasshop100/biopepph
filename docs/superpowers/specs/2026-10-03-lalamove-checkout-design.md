# Lalamove Checkout — External Form Step

**Date:** 2026-10-03
**Status:** Approved, pending implementation

## Problem

"Via Lalamove" is the default delivery option at checkout and currently behaves like an
ordinary shipped order: the buyer fills in a full PH delivery address (street, province,
city), and the confirmation page tells them nothing more than "send your proof of payment."

In reality the delivery is now booked through a Lalamove delivery form that Biopep hosts a
link to. The buyer enters their address *there*, not on the site, and settles the fare with
Lalamove directly. The site collects an address it does not use and never hands over the
form link.

## Solution

Make Lalamove follow the same shape as the Shopee Checkout flow shipped on 2026-10-01
(commit `45d3846`): the buyer pays for the ITEMS on the payment page as usual, then the
confirmation page gives them one more action — open an external link and complete it.

```
cart → checkout (Lalamove, name + phone only) → payment → "I've Paid"
     → confirmation: Lalamove form link + send proof of payment
```

The two outstanding buyer actions (fill the Lalamove form, send proof) sit at the top of the
confirmation page; the explanation and reference details sit below.

## Changes

### 1. `checkout.html` + `checkout.js` — address not required

`isShopeeDelivery()` generalises to `isExternalAddressDelivery()`, true for both `shopee` and
`lalamove`. Two call sites follow it:

- `updateAddressRequirement()` — hides `#coAddressFields`, shows the hidden-address note
- `validateForm()` — drops street / province / city from the required list

The required fields for Lalamove become **Full Name + Phone Number** only. Phone validation
(`^(09|\+639)\d{9}$`) is unchanged.

The hidden-address note becomes per-option, because the reason differs:

| Option | Note |
|---|---|
| `shopee` | 📦 Address not needed for Shopee Checkout |
| `lalamove` | 🛵 You'll enter your delivery address in the Lalamove form after payment |

The Lalamove delivery card copy gains a line saying the form link is provided after checkout,
mirroring Shopee's "Shopee link will be provided upon check-out". Lalamove stays `checked`
(the default option) and keeps `data-fee="0"`.

### 2. `api-config.js` — `LALAMOVE` config block

```js
const LALAMOVE = {
  url: 'https://delivery.lalamove.com/forms/PHb85c66ea82d14f479f5d4857c9d121b0',
  note: 'Your delivery is booked through Lalamove. Open the form below and fill in your '
      + 'delivery address — the fee is settled with Lalamove directly.',
};
```

Sits beside `SHOPEE` and is loaded by the same `api-config.js` include on the confirmation
page. One fixed form serves every order, exactly like the single fixed Shopee listing.

### 3. `confirmation.html` — `#confLalamoveCard`

A new card, structurally identical to `#confShopeeCard`, hidden by default:

- Heading: **Last Step — Fill Out Your Lalamove Delivery Form**
- `#confLalamoveNote` — filled from `LALAMOVE.note`
- `#confLalamoveLink` — primary button, "🛵 Open Lalamove Form →", `target="_blank"`
- `#confLalamoveCopyLink` — ghost button, "Copy link instead"
- Hint: button not working → tap Copy link instead and paste it in your browser
- After-note: 📸 screenshot your Lalamove form confirmation and send it with your payment proof

The copy-link fallback is not optional. Real buyers arrive from Messenger, whose in-app
browser blocks `target="_blank"` — the same reason Shopee needed it.

The card is placed immediately after `#confShopeeCard` in the markup; only one of the two is
ever shown.

The nine `.conf-shopee-*` rules in `style.css` now dress two cards, so they are renamed to
`.conf-extstep-*` (card, note, actions, btn, btn.ghost, hint, after) and the Shopee markup is
updated to match. No rules are added, removed, or restyled — the existing orange `#d8431f` button hover reads
correctly for Lalamove too, so this is a pure rename.

### 4. `confirmation.js` — one `renderExternalStep(order)`

`renderShopeeStep(order)` becomes `renderExternalStep(order)`, driven by a map keyed on
`order.deliveryValue`:

```js
const EXTERNAL_STEPS = {
  shopee:   { cfg: 'SHOPEE',   card: 'confShopeeCard',   note: 'confShopeeNote',
              link: 'confShopeeLink',   copy: 'confShopeeCopyLink',   copyMsg: 'Shopee link copied' },
  lalamove: { cfg: 'LALAMOVE', card: 'confLalamoveCard', note: 'confLalamoveNote',
              link: 'confLalamoveLink', copy: 'confLalamoveCopyLink', copyMsg: 'Lalamove link copied' },
};
```

For a matching delivery value: fill note + href, wire `copyOnClick`, show the card, then
restack. Any other value (`jnt`) shows no card and leaves the order of the cards alone.

The restack is unchanged — move `confProofCard`, `confNextCard`, `confSummaryCard`,
`confDeliveryCard` before `confContinueCard`, producing:

```
Thank You → External step → Send Proof → What's Next → Order Summary → Delivery Details
```

### 5. Fee and address labels — keyed on `deliveryValue`, never on the fee

Lalamove and Shopee are **both** ₱0, so every check must read `order.deliveryValue`. A
fee-based check silently mislabels the other option.

| Place | Today (Lalamove) | After |
|---|---|---|
| `payment.js` `renderTotals()` | `₱0` | `Paid via Lalamove` |
| `confirmation.js` `renderTotals()` | `Free` | `Paid via Lalamove` |
| `confirmation.js` `renderDeliveryInfo()` address | `N/A — Shopee Checkout` | `N/A — Lalamove form` |
| `confirmation.js` `renderContactLinks()` address | `N/A — Shopee Checkout` | `N/A — Lalamove form` |

The `N/A — …` fallback stops being a hardcoded Shopee string: a single helper derives it from
`deliveryValue`, so the admin message tells Lester at a glance that the address lives in the
Lalamove form rather than looking like a missing field.

`jnt` (hidden, `disabled`) keeps its current `₱160`/`Free` behaviour untouched.

## Out of scope

- Prefilling the Lalamove form with the order ID or buyer details (no URL-param contract known)
- Any Lalamove fare quote or estimate at checkout
- Changes to the Google Sheet order payload shape or the BIOPEP INVENTORY back office
- Re-enabling J&T

## Testing

Served locally with `npx serve` and walked in the browser, no push until reviewed.

**Lalamove path (the change):**
1. Add items → checkout → Lalamove is preselected
2. Address fields are hidden; the Lalamove note is shown
3. Place Order with Name + Phone only → passes validation
4. Place Order with Name blank → still blocked
5. Payment page delivery row reads **Paid via Lalamove**, total excludes a delivery fee
6. "I've Paid" → confirmation shows the Lalamove card directly under Thank You
7. Open-link button points at the form URL; **Copy link instead** copies it and flips to ✓
8. Totals read **Paid via Lalamove**; address reads **N/A — Lalamove form**
9. The proof-of-payment message (copy button) carries the same address text

**Regression — Shopee:** identical walk; card, copy fallback, restack, "Paid on Shopee" and
"N/A — Shopee Checkout" all unchanged.

**Regression — J&T:** temporarily un-hide and enable it; address fields required again, the
₱160/₱190/₱200/₱220 area rate still auto-selects, no external card appears, and the cards
keep their original order.
