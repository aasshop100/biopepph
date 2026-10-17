# Manual order entry — design

**Date:** 2026-10-18
**Status:** approved, not yet built
**Touches:** `BIOPEP-backoffice/Code.gs`, a new `AddOrder.html`, `BIOPEP-backoffice/test-flows.js`

> This file is in a PUBLIC repo that GitHub Pages serves. It deliberately contains no
> spreadsheet ID, web app URL or email address. Refer to "the BIOPEP INVENTORY sheet".

## The problem

Not every Biopep sale comes through the website. Orders arrive by chat, by meet-up, by
walk-in — and today there is no way to record them. They are absent from the Orders tab,
and more importantly their stock is never deducted, so the Catalog drifts upward from
reality by exactly the amount sold off-site.

The ask: enter those orders by hand, and have stock deduct automatically the way a
website order does.

## The key insight

**Deduction is not the hard part.** Every stock behaviour in the back office already runs
off the hidden `Items Data` column on the Orders tab, which holds resolved option IDs:

```json
{ "lines": [ { "optionId": "O-0075", "productId": "P-0052", "qty": 1, "price": 1700, "label": "…" } ] }
```

`applyOrderStock_()` reads it to restore stock when an order is Cancelled and to take it
again when one is re-opened. `onOrderStatusChange_()` drives that off the Status column.
Neither knows or cares where the order came from.

So if a manual order writes a correct `Items Data`, **cancel/restore, un-cancel and the
Stock Log all work with no new stock code at all.** The real problem is narrower: how does
a human specify items in a form the script can resolve? Free text like `1 × Tirz 30mg`
can never deduct anything.

## Shape

A command on the existing `🧪 Biopep` menu opens a modal dialog. The dialog is a thin
client; all work happens in one server function.

```
🧪 Biopep ▸ Add order…
   → openAddOrder()          shows the dialog
   → catalogForEntry_()      products, options, prices, live stock, DELIVERY, PAYMENT_METHODS
   → manualOrder_(payload)   validates, deducts, writes the Orders row
```

`manualOrder_()` takes a plain object and returns a plain object, so `test-flows.js` can
exercise it exactly as it does `placeOrder_()`. Only the HTML is untestable, and by then
it is just a form collecting values.

### Why a dialog and not cells on the Orders tab

Typing orders directly onto the Orders tab was designed and rejected. It needed three new
columns, a dropdown on the Items column, a "blank Customer Name = same order" convention,
and row deletion after processing. It also exposed a real bug: `writeNextRow_()` places a
new website order directly under the last row holding an **Order ID**, so a website order
arriving while a half-typed manual order sat on the tab (Order ID still blank) would
overwrite it silently.

The dialog makes that bug unreachable rather than fixing it — no half-typed row ever
exists on the tab — and leaves the Orders tab as a clean record. Cost: custom dialogs do
not exist in the Google Sheets mobile app. Accepted; entry is desktop-only.

## The form

| Field | Behaviour |
|---|---|
| Customer Name | **required** — the only always-required field |
| Phone | optional; normalised with `normPhone_` when present. No `09XXXXXXXXX` rule: a walk-in may have no number |
| Delivery | dropdown built from `DELIVERY` — Via Lalamove · Via Shopee Checkout · Via J&T Express |
| Region | shown for J&T only; NCR / Luzon / Visayas / Mindanao, fee from `DELIVERY.jnt.feeByRegion` |
| Address | shown for J&T only, **required there**; free text. Hidden for Lalamove/Shopee |
| Status | Pending / Paid / Shipped, default **Paid**. `Cancelled` is deliberately absent — entering an order as already-cancelled would deduct stock and immediately owe it back; cancel it on the tab afterwards instead |
| Payment | GCash · Maya · Maribank · GoTyme (from `PAYMENT_METHODS`) **+ Cash + blank** |
| Shipping Fee | auto from the delivery choice; editable |
| Discount | plain peso amount. No promo codes — those are a website funnel, not a back-office tool |
| Notes | free text |
| Item rows | `Product — Option` picker · Qty · Unit Price. **Add item** for as many as needed |

Each picker shows live stock. The order total updates as values change.

**Unit Price blank = the Catalog price.** It is filled only for an off-list sale
(friends-and-family, bundles, a haggled deal). Manual orders are exactly where off-list
pricing happens, so the override is not optional polish.

### Delivery and address match the website exactly

Built from `DELIVERY` rather than retyped, so the two can never drift:

| Delivery | Address written | Fee |
|---|---|---|
| Via Lalamove | `N/A — Lalamove form` | ₱0 |
| Via Shopee Checkout | `N/A — Shopee Checkout` | ₱0 |
| Via J&T Express | what you typed | NCR ₱160 · Luzon ₱190 · Visayas ₱200 · Mindanao ₱220 |

The website's Province/City comboboxes are **not** ported. They are fed by
`ph-address-data.js` — 84 provinces, ~1,600 cities — which lives on the website. Copying
that into Apps Script would duplicate a large dataset into a second place needing sync,
through the most fragile step in this project (pasting over Remote Desktop). The list
exists to stop *buyers* mistyping and to derive the region automatically; the operator
already knows the region. A four-way Region picker gives the identical fee with nothing
duplicated.

## Rules deliberately NOT carried over from `placeOrder_()`

These police anonymous strangers and are wrong for an order the operator typed:

| Website rule | Why it is dropped |
|---|---|
| `MAX_QTY_PER_LINE` (20) / `MAX_QTY_PER_ORDER` (50) | anti-abuse |
| `MAX_PENDING_PER_PHONE` (3) | anti-abuse |
| phone must match `/^09\d{9}$/` | a walk-in may have no number |
| hidden-field bot trap, `ref` retry dedupe | no browser involved |
| **product must be Show-on-Site** | **the payoff.** Sheet-only rows (Retatrutide 10mg, Semax 5mg, KPV 30mg) exist precisely to sell things the website does not list. Manual orders may sell any Catalog row, hidden or not |

Reused unchanged: `readCatalog_`, `setStock_`, `logStock_`, `writeNextRow_`, the
`LockService` lock, and the `Items Data` shape.

## Order IDs

Manual orders get their own prefix and counter: **`BPM-0001`**, from a new script property
`manualOrderCounter`. `MANUAL_PREFIX` is the single source of truth for both minting and
recognising one.

Chosen over a shared `BP-` sequence because it is visible everywhere the ID appears —
including the Stock Log, which will read *"Reserved by order BPM-0001"*. Six months from
now a stock discrepancy can be traced to the shop or to hand entry without opening
anything else. A hidden flag inside `Items Data` was rejected: the information would exist
but never be visible, which is how silent discrepancies survive.

Cost accepted: order numbering is no longer one continuous series.

## Stock

Deduct per **product** (options of a product share stock), mirroring `placeOrder_()`.
Blank stock means "not counted" and is skipped. Each movement writes a Stock Log row
reading `Reserved by order BPM-0001`.

The written row must set **`Stock Returned` to `false`**, exactly as `placeOrder_()` does.
It is the flag `onOrderStatusChange_()` reads to guarantee a cancel restores stock only
once; a manual row that omitted it would still work today (a blank reads as false) but
would be one refactor away from double-restoring.

**Overselling is warned, not refused.** If the Catalog says 0 and the sale happened
anyway, the dialog warns and lets it through; stock goes negative and the Stock Log
records it.

The reasoning: a manual order records a fact that already occurred. Refusing to write it
does not un-sell the item — it only tempts the operator to skip logging, which is the
failure this whole feature exists to prevent. A negative figure is ugly in the useful way:
visible, logged, and obviously in need of a fix. Clamping at zero was rejected outright —
it hides exactly the discrepancy you would need later.

Partial writes are still forbidden. Validation (unresolvable option, qty < 1, missing
name, missing J&T address) rejects the **whole** order before anything is written or
deducted.

## Auto-cancel

`autoCancelUnpaid()` runs hourly and cancels any order left **Pending** past the hold
window, restoring its stock. That rule exists to stop anonymous buyers tying up stock with
abandoned carts.

Applied to manual orders it is destructive: a real, fulfilled sale logged as Pending would
be "cancelled" overnight and its stock silently returned, leaving the Catalog overstated by
exactly what was sold, with nothing visibly broken.

**`autoCancelUnpaid()` skips any order whose ID starts with `MANUAL_PREFIX`.** A manual
order left at Pending stays Pending until a human changes it.

## No admin email

`sendAdminEmail_()` is not called. The website emails because nobody was watching; the
operator typed this one.

## Testing

Added to `test-flows.js`, run against an in-memory copy of the live sheet, data-driven —
no hardcoded stock, no hardcoded row numbers:

1. single-line order — row written, correct total, stock down by the qty, Stock Log row added
2. multi-line order across several products — every product deducted
3. two options of the **same** product in one order — deducted once, summed
4. Unit Price override — the override reaches the row and the total, not the Catalog price
5. a hidden / not-Show-on-Site product — accepted (the website would refuse it)
6. blank-stock product — order written, no deduction, no Stock Log row
7. oversell — written, stock goes negative, Stock Log shows it
8. validation: missing name, qty 0, unknown option, J&T with no address — each rejected with **nothing written and nothing deducted**
9. delivery: Lalamove and Shopee write their `blankAddress`; J&T sets the fee from the region
10. ID minting — first is `BPM-0001`, second `BPM-0002`; the `BP-` counter is untouched
11. `autoCancelUnpaid()` leaves a Pending `BPM-` order alone and still cancels a stale `BP-` one
12. Cancel a manual order → stock restored once, `Stock Returned` set; un-cancel → taken again

**`test-flows.js` is currently stale** and red for unrelated reasons: it assumes the first
order lands on row 2 (it is far below that now) and references `KPV 30mg`, which has left
the catalog. Repairing it is in scope — a red suite cannot gate anything.

## Deployment

Apps Script here is updated by pasting. Pasting over Remote Desktop mangles non-ASCII
(`₱`, `—`, emoji) into "Unexpected end of input", so `make-paste.js` produces
`Code-paste.gs` with `\uXXXX` escapes. **`AddOrder.html` needs the same treatment** —
`make-paste.js` must cover it, and the HTML must carry no raw non-ASCII.

Then: paste both files → **Deploy ▸ Manage deployments ▸ ✏️ ▸ New version**, same
deployment ID. Never "New deployment" — the URL would change and the website would lose
its fallback.

## Out of scope

- Editing a manual order after submission. Fix it the existing way: set Cancelled (stock
  returns) and enter it again.
- Mobile entry. Custom dialogs do not exist in the Sheets mobile app.
- Promo codes on manual orders — a plain Discount amount covers it.
- Bulk import of past off-site orders.
