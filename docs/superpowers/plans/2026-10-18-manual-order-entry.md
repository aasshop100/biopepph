# Manual Order Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record non-website Biopep sales from a dialog on the `🧪 Biopep` menu, deducting Catalog stock exactly as a website order does.

**Architecture:** A modal dialog (`AddOrder.html`) is a thin client over one server function, `manualOrder_(body)`, which takes a plain object and returns a plain object. All validation, stock movement and row-writing live in that function so `test-flows.js` can exercise every path in Node without a browser. The written row carries the same `Items Data` shape as a website order, so cancel/restore, un-cancel and the Stock Log work with no new stock code.

**Tech Stack:** Google Apps Script (bound to the BIOPEP INVENTORY sheet), HtmlService for the dialog, plain Node + `assert` for the test harness.

**Spec:** `docs/superpowers/specs/2026-10-18-manual-order-entry-design.md`

## Global Constraints

- **Code lives OUTSIDE the Pages repo.** `Code.gs`, `AddOrder.html`, `test-flows.js` and `make-paste.js` are all in `C:\Users\LESTER\Desktop\PROJECTS\BIOPEP-backoffice\`. Specs and plans are in `C:\Users\LESTER\Desktop\PROJECTS\BIOPEP\docs\` (a PUBLIC repo — never put the spreadsheet ID, web app URL or an email address in a file there).
- **`BIOPEP-backoffice` is not a git repo.** "Commit" steps below commit the *plan/spec* repo only where stated; back-office source is versioned by the `Code-paste*.gs` backups that already live in that folder. Before editing `Code.gs`, copy it to `Code-before-manual-orders.gs` once (Task 1, Step 1).
- **`AddOrder.html` must contain NO non-ASCII characters.** No `₱`, no `—`, no emoji, no curly quotes. Use `&#8369;` for the peso sign in markup and `\u20B1` in JavaScript strings. Pasting over Remote Desktop mangles non-ASCII into "Unexpected end of input".
- **Never use `sheet.appendRow()`** on Catalog, Orders or Stock Log — checkbox columns make `getLastRow()` point far below the data. Always `writeNextRow_()`. The test harness throws if `appendRow` is called.
- **Manual order ID prefix is `BPM-`**, counter in script property `manualOrderCounter`. The website's `BP-`/`orderCounter` must never be touched.
- **Every test run must end with `ALL FLOW TESTS PASSED`.** Run: `node test-flows.js` from `BIOPEP-backoffice`.
- **Deploy is paste-only:** `node make-paste.js` → paste `Code-paste.gs` and `AddOrder-paste.html` → **Deploy ▸ Manage deployments ▸ ✏️ ▸ New version**, same deployment ID. Never "New deployment".

---

## File Structure

| File | Responsibility |
|---|---|
| `BIOPEP-backoffice/Code.gs` | **Modify.** Adds `MANUAL_PREFIX`, `nextManualId_`, `resolveManualOrder_`, `manualOrder_`, `catalogForEntry_`, `openAddOrder`; modifies `autoCancelUnpaid` and `onOpen`. |
| `BIOPEP-backoffice/AddOrder.html` | **Create.** The dialog: form markup, item rows, live total, submit. ASCII-only. |
| `BIOPEP-backoffice/test-flows.js` | **Modify.** Repair stale assertions (Task 1), then add manual-order coverage. |
| `BIOPEP-backoffice/make-paste.js` | **Modify.** Escape `AddOrder.html` → `AddOrder-paste.html` as well as `Code.gs`. |

---

### Task 1: Repair the stale test suite

`test-flows.js` is currently red for reasons unrelated to this feature. It hardcodes values that have since changed: 47 products (now 55), 68 options, Jinbei stock 9, `Tirzepatide 60mg (Avisala)` (replaced by Chongsan on 2026-10-15), the first order landing on sheet row 2 (the Orders tab has 44 rows), and next-IDs `O-0069`/`O-0070` (now O-0084). A red suite cannot gate anything, so this comes first.

The repair principle: **derive every expectation from the live data, never hardcode a count, a stock level or a row number.**

**Files:**
- Modify: `BIOPEP-backoffice/test-flows.js:74-91` (section 1), `:97-106` (section 2), `:243-250` (next-id tail)
- Create (once): `BIOPEP-backoffice/Code-before-manual-orders.gs`

**Interfaces:**
- Consumes: nothing
- Produces: a green `node test-flows.js`, which every later task depends on

- [ ] **Step 1: Back up the current Code.gs**

```bash
cd "C:/Users/LESTER/Desktop/PROJECTS/BIOPEP-backoffice"
cp Code.gs Code-before-manual-orders.gs
ls -la Code-before-manual-orders.gs
```

- [ ] **Step 2: Run the suite to see it fail**

Run: `node test-flows.js`
Expected: FAIL. Most likely `✗ FAILED: Expected values to be strictly equal: 55 !== 47` from the product-count assertion on line 75.

- [ ] **Step 3: Replace the hardcoded catalog counts**

In `test-flows.js`, replace the section-1 block that currently reads:

```js
  const all = G.readCatalog_();
  assert.strictEqual(all.length, 47); assert.strictEqual(all.reduce((n, p) => n + p.options.length, 0), 68);
  const tj = product('Tirzepatide 15mg (Jinbei)');
  assert.deepStrictEqual([tj.stock, tj.options.map((o) => o.name + '=' + o.price)], [9, ['Vial Only=1000', 'Complete Set=1200']]);
```

with:

```js
  const all = G.readCatalog_();
  const optionCount = all.reduce((n, p) => n + p.options.length, 0);
  assert.ok(all.length >= 40, 'catalog looks truncated: ' + all.length + ' products');
  assert.ok(optionCount >= all.length, 'every product needs at least one option row');
  assert.ok(all.every((p) => p.id && p.options.every((o) => o.id)), 'every product and option needs an id');
  // One product with two options proves options attach to the product above.
  const tj = product('Tirzepatide 15mg (Jinbei)');
  assert.ok(tj && tj.options.length === 2, 'expected Tirzepatide 15mg (Jinbei) to have 2 options');
  assert.ok(tj.options.every((o) => typeof o.price === 'number'), 'both options need prices');
```

- [ ] **Step 4: Replace the sold-out assertions that name a removed product**

Replace:

```js
  assert.strictEqual(cat.products.find((p) => p.name === 'Tirzepatide 60mg (Jinbei)').soldOut, true);
  assert.strictEqual(cat.products.find((p) => p.name === 'Tirzepatide 60mg (Avisala)').soldOut, false);
```

with a data-driven version that cannot be broken by a catalog change:

```js
  // Derive, don't name: any product at 0 is sold out, any with stock is not.
  cat.products.forEach((p) => {
    if (p.stock === 0) assert.strictEqual(p.soldOut, true, p.name + ' is 0 but not sold out');
    if (typeof p.stock === 'number' && p.stock > 0) assert.strictEqual(p.soldOut, false, p.name + ' has stock but reads sold out');
  });
```

- [ ] **Step 5: Replace the hardcoded stock and row number in section 2**

Replace:

```js
  assert.strictEqual(r1.orderId, 'BP-0001');
  assert.strictEqual(product('Tirzepatide 15mg (Jinbei)').stock, 6);
```

with (capture the before-value above the `place()` call):

```js
  const tjBefore = product('Tirzepatide 15mg (Jinbei)').stock;
```

placed immediately before `const r1 = place({...})`, and after it:

```js
  assert.match(r1.orderId, /^BP-\d{4}$/, 'website order id shape');
  assert.strictEqual(product('Tirzepatide 15mg (Jinbei)').stock, tjBefore - 3, '2 Vial Only + 1 Complete Set share one stock pool');
```

Then replace the row assertion:

```js
  assert.strictEqual(o1._row, 2);
```

with:

```js
  assert.ok(o1._row >= 2, 'order must land on a data row');
  assert.strictEqual(orders().filter((o) => o['Order ID'] === r1.orderId).length, 1, 'exactly one row per order');
```

- [ ] **Step 6: Make the next-id assertions derive from current maxima**

In the tail section, replace:

```js
  assert.deepStrictEqual([C.getRange(newRow, 1).getValue(), C.getRange(newRow, 2).getValue()], ['P-' + String(all.length + 1).padStart(4, '0'), 'O-0069']);
```

and the `O-0070` line, with ids computed from what is actually in the sheet. Insert before the `C.getRange(newRow, ...)` writes:

```js
  const maxId = (prefix, col) => Math.max(0, ...G.rows_(C)
    .map((r) => parseInt(String(r[col]).replace(prefix + '-', ''), 10)).filter((x) => !isNaN(x)));
  const nextP = 'P-' + String(maxId('P', 'Product ID') + 1).padStart(4, '0');
  const nextO = 'O-' + String(maxId('O', 'Option ID') + 1).padStart(4, '0');
  const nextO2 = 'O-' + String(maxId('O', 'Option ID') + 2).padStart(4, '0');
```

then assert against `nextP` / `nextO`, and `['', nextO2]` for the second option row.

- [ ] **Step 7: Run the suite until green**

Run: `node test-flows.js`
Expected: ends with `ALL FLOW TESTS PASSED`.

If a different stale assertion surfaces (the suite stops at the first failure, so repairs reveal each other one at a time), apply the same principle — replace the hardcoded value with one derived from the data — and re-run. Do not delete a test to make it pass.

- [ ] **Step 8: Record the repair**

```bash
cd "C:/Users/LESTER/Desktop/PROJECTS/BIOPEP"
git add docs/superpowers/plans/2026-10-18-manual-order-entry.md
git commit -m "Plan: manual order entry

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: `BPM-` ids on their own counter

**Files:**
- Modify: `BIOPEP-backoffice/Code.gs` (add `MANUAL_PREFIX` beside `ORDER_PREFIX` at line 25; add `nextManualId_` beside `nextOrderId_` at line 314)
- Modify: `BIOPEP-backoffice/test-flows.js` (export list in the `eval` call, line 65; new test section)

**Interfaces:**
- Consumes: `props_()` from Code.gs
- Produces: `MANUAL_PREFIX` (string `'BPM-'`), `nextManualId_()` → string like `'BPM-0001'`

- [ ] **Step 1: Write the failing test**

Add a new section at the end of `test-flows.js`, immediately before the `console.log('\nALL FLOW TESTS PASSED')` line:

```js
  // ── 9. Manual orders: ids come from their own counter ──
  const bpBefore = props.get('orderCounter');
  const m1 = G.nextManualId_();
  const m2 = G.nextManualId_();
  assert.strictEqual(m1, 'BPM-0001');
  assert.strictEqual(m2, 'BPM-0002');
  assert.strictEqual(props.get('orderCounter'), bpBefore, 'manual ids must not touch the website counter');
  ok('manual ids: BPM-0001, BPM-0002 on their own counter; BP- untouched');
```

- [ ] **Step 2: Add the export so the test can reach it**

In `test-flows.js` line 65, extend the `global.G = { ... }` list with `nextManualId_, manualOrder_, catalogForEntry_`:

```js
  eval(fs.readFileSync(CODE, 'utf8') + '\nglobal.G = { readCatalog_, buildCatalog_, placeOrder_, confirmOrder_, doPost, doGet, handleEdit, autoCancelUnpaid, rows_, normPhone_, nextManualId_, manualOrder_, catalogForEntry_ };');
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node test-flows.js`
Expected: FAIL with `nextManualId_ is not defined`.

- [ ] **Step 4: Implement**

In `Code.gs`, beside `const ORDER_PREFIX = 'BP-';` (line 25) add:

```js
const MANUAL_PREFIX = 'BPM-';   // orders keyed in by hand; see nextManualId_ and autoCancelUnpaid
```

and beside `nextOrderId_()` (line 314) add:

```js
/** Manual orders run on their own counter so the website sequence stays unbroken. */
function nextManualId_() {
  const n = Number(props_().getProperty('manualOrderCounter') || 0) + 1;
  props_().setProperty('manualOrderCounter', String(n));
  return MANUAL_PREFIX + String(n).padStart(4, '0');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node test-flows.js`
Expected: `✓ manual ids: BPM-0001, BPM-0002 on their own counter; BP- untouched` then `ALL FLOW TESTS PASSED`.

---

### Task 3: Resolve and validate a manual order (writes nothing)

Split from the write so each half has its own gate. This half turns a payload into priced lines or an error, and touches no sheet.

**Files:**
- Modify: `BIOPEP-backoffice/Code.gs` (add `resolveManualOrder_` after `discountFor_`, around line 208)
- Modify: `BIOPEP-backoffice/test-flows.js`

**Interfaces:**
- Consumes: `readCatalog_()`, `DELIVERY`, `str_`, `toNumber_`, `normPhone_`
- Produces:

```js
resolveManualOrder_(body) ->
  { ok: true,
    lines: [{ optionId, productId, qty, price, label }],
    needByProduct: { 'P-0052': 3 },
    subtotal, shippingFee, discount, total,
    address, deliveryLabel,
    oversell: [{ productId, name, available, after }] }
  | { ok: false, error: 'missing_name'|'bad_items'|'bad_delivery'|'missing_address' }
```

`body` shape:

```js
{ customer: { name, phone, address },
  delivery: 'lalamove'|'shopee'|'jnt', region: 'ncr'|'luzon'|'visayas'|'mindanao',
  status: 'Pending'|'Paid'|'Shipped', payment: 'GCash'|'Cash'|'',
  shippingFee: number|null, discount: number, notes: '',
  items: [{ optionId, qty, price }] }     // item.price null/'' = Catalog price
```

- [ ] **Step 1: Write the failing tests**

Append to the manual-order section of `test-flows.js`:

```js
  // ── 9b. Manual order resolution: prices, overrides, hidden products, validation ──
  const mCustomer = { name: 'WALK-IN TEST', phone: '0917 333 4444', address: '2 Test Ave' };
  const mBody = (over = {}) => ({ customer: mCustomer, delivery: 'lalamove', status: 'Paid',
    payment: 'Cash', shippingFee: null, discount: 0, notes: '', items: [], ...over });

  const jin = product('Tirzepatide 15mg (Jinbei)');
  const jinVial = jin.options.find((o) => o.name === 'Vial Only');

  // Catalog price is used when no override is given
  const res1 = G.resolveManualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: 2 }] }));
  assert.ok(res1.ok, JSON.stringify(res1));
  assert.strictEqual(res1.subtotal, jinVial.price * 2);
  assert.strictEqual(res1.lines[0].price, jinVial.price);
  assert.strictEqual(res1.shippingFee, 0);
  assert.strictEqual(res1.address, 'N/A \u2014 Lalamove form');

  // An override replaces the Catalog price
  const res2 = G.resolveManualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: 2, price: 1 }] }));
  assert.strictEqual(res2.subtotal, 2);
  assert.strictEqual(res2.lines[0].price, 1);

  // Two options of the SAME product sum into one stock requirement
  const jinSet = jin.options.find((o) => o.name === 'Complete Set');
  const res3 = G.resolveManualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: 2 }, { optionId: jinSet.id, qty: 1 }] }));
  assert.strictEqual(res3.needByProduct[jin.id], 3);

  // A hidden / not-Show-on-Site product is allowed here, unlike the website
  const hidden = G.readCatalog_().find((p) => !p.show && p.options.length && p.options[0].price !== null);
  assert.ok(hidden, 'need one hidden priced product to test');
  assert.ok(G.resolveManualOrder_(mBody({ items: [{ optionId: hidden.options[0].id, qty: 1 }] })).ok,
    'manual orders must be able to sell a sheet-only product');
  assert.strictEqual(G.placeOrder_({ customer, delivery: 'lalamove',
    items: [{ optionId: hidden.options[0].id, qty: 1 }] }).error, 'not_enough_stock',
    'the website must still refuse it');

  // J&T takes the region fee and needs an address
  const jnt = G.resolveManualOrder_(mBody({ delivery: 'jnt', region: 'visayas', items: [{ optionId: jinVial.id, qty: 1 }] }));
  assert.strictEqual(jnt.shippingFee, 200);
  assert.strictEqual(jnt.address, '2 Test Ave');
  assert.strictEqual(G.resolveManualOrder_(mBody({ delivery: 'jnt', region: 'visayas',
    customer: { name: 'X', phone: '', address: '' }, items: [{ optionId: jinVial.id, qty: 1 }] })).error, 'missing_address');

  // Validation rejects outright
  assert.strictEqual(G.resolveManualOrder_(mBody({ customer: { name: '' }, items: [{ optionId: jinVial.id, qty: 1 }] })).error, 'missing_name');
  assert.strictEqual(G.resolveManualOrder_(mBody({ items: [] })).error, 'bad_items');
  assert.strictEqual(G.resolveManualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: 0 }] })).error, 'bad_items');
  assert.strictEqual(G.resolveManualOrder_(mBody({ items: [{ optionId: 'O-9999', qty: 1 }] })).error, 'bad_items');
  assert.strictEqual(G.resolveManualOrder_(mBody({ delivery: 'courier-pigeon', items: [{ optionId: jinVial.id, qty: 1 }] })).error, 'bad_delivery');

  // Oversell is reported, not refused
  const over = G.resolveManualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: jin.stock + 5 }] }));
  assert.ok(over.ok, 'oversell must resolve, not fail');
  assert.strictEqual(over.oversell.length, 1);
  assert.strictEqual(over.oversell[0].after, jin.stock - (jin.stock + 5));
  ok('manual resolve: catalog price + override, shared stock, hidden products allowed, J&T region fee, validation, oversell reported');
```

- [ ] **Step 2: Add the export**

Extend the `global.G = { ... }` list in `test-flows.js` with `resolveManualOrder_`.

- [ ] **Step 3: Run test to verify it fails**

Run: `node test-flows.js`
Expected: FAIL with `resolveManualOrder_ is not defined`.

- [ ] **Step 4: Implement**

Add to `Code.gs` after `discountFor_()`:

```js
/**
 * Turns a manual-order payload into priced lines, or an error. Writes nothing.
 * Differs from placeOrder_ on purpose: no qty caps, no pending-per-phone limit, no phone
 * format rule, and hidden (not Show-on-Site) products ARE sellable - sheet-only rows exist
 * precisely to be sold off-site. Overselling is reported in `oversell`, never refused here.
 */
function resolveManualOrder_(body) {
  const c = (body && body.customer) || {};
  if (!str_(c.name)) return { ok: false, error: 'missing_name' };

  const delivery = DELIVERY[str_(body.delivery)];
  if (!delivery) return { ok: false, error: 'bad_delivery' };
  let shippingFee = delivery.fee || 0;
  if (delivery.feeByRegion) {
    shippingFee = delivery.feeByRegion[str_(body.region)];
    if (shippingFee === undefined) return { ok: false, error: 'bad_delivery' };
  }
  const override = toNumber_(body.shippingFee);
  if (override !== null) shippingFee = override;

  const address = delivery.noAddress ? (delivery.blankAddress || 'N/A') : str_(c.address);
  if (!delivery.noAddress && !address) return { ok: false, error: 'missing_address' };

  const items = (body.items || []).map((i) => ({
    optionId: str_(i.optionId), qty: Math.floor(Number(i.qty)), price: toNumber_(i.price),
  }));
  if (!items.length || items.some((i) => !i.optionId || !(i.qty >= 1))) return { ok: false, error: 'bad_items' };

  const products = readCatalog_();
  const optionIndex = {};
  products.forEach((p) => p.options.forEach((o) => { optionIndex[o.id] = { product: p, option: o }; }));
  if (items.some((i) => !optionIndex[i.optionId])) return { ok: false, error: 'bad_items' };

  const needByProduct = {};
  let subtotal = 0;
  const lines = items.map((i) => {
    const { product, option } = optionIndex[i.optionId];
    const price = i.price === null ? option.price : i.price;
    if (price === null) return null;                       // an unpriced option with no override
    needByProduct[product.id] = (needByProduct[product.id] || 0) + i.qty;
    subtotal += price * i.qty;
    return { optionId: option.id, productId: product.id, qty: i.qty, price: price,
      label: product.name + ' \u2014 ' + option.name };
  });
  if (lines.some((l) => l === null)) return { ok: false, error: 'bad_items' };

  // Stock that would go negative - reported so the caller can confirm, never blocked here.
  const oversell = [];
  Object.keys(needByProduct).forEach((pid) => {
    const p = products.find((x) => x.id === pid);
    if (!p || p.stock === null) return;                    // blank stock = not counted
    if (p.stock < needByProduct[pid]) {
      oversell.push({ productId: pid, name: p.name, available: p.stock, after: p.stock - needByProduct[pid] });
    }
  });

  const discount = Math.max(0, toNumber_(body.discount) || 0);
  return { ok: true, lines: lines, needByProduct: needByProduct, subtotal: subtotal,
    shippingFee: shippingFee, discount: discount,
    total: Math.max(0, subtotal + shippingFee - discount),
    address: address, deliveryLabel: delivery.label, oversell: oversell };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node test-flows.js`
Expected: the new `✓ manual resolve: …` line, then `ALL FLOW TESTS PASSED`.

---

### Task 4: Write the order and move the stock

**Files:**
- Modify: `BIOPEP-backoffice/Code.gs` (add `manualOrder_` after `resolveManualOrder_`)
- Modify: `BIOPEP-backoffice/test-flows.js`

**Interfaces:**
- Consumes: `resolveManualOrder_`, `nextManualId_`, `readCatalog_`, `setStock_`, `logStock_`, `writeNextRow_`, `cols_`, `clearCatalogCache_`, `peso_`
- Produces:

```js
manualOrder_(body) ->
  { ok: true, orderId: 'BPM-0001', subtotal, shippingFee, discount, total, lines, oversell: [] }
  | { ok: false, error: 'oversell', items: [{ productId, name, available, after }] }
  | { ok: false, error: <any resolveManualOrder_ error> }
```

`body.confirmOversell === true` is what lets a negative-stock order through. Without it, an oversell is returned as an error so the dialog can ask first.

- [ ] **Step 1: Write the failing tests**

Append to the manual-order section:

```js
  // ── 9c. Manual order write: row, stock, log, oversell confirmation ──
  const ordersBefore9c = orders().length;
  const logBefore9c = logRows().length;
  const jinStock9c = product('Tirzepatide 15mg (Jinbei)').stock;

  const w1 = G.manualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: 2 }], notes: 'met at BGC' }));
  assert.ok(w1.ok, JSON.stringify(w1));
  assert.match(w1.orderId, /^BPM-\d{4}$/);
  assert.strictEqual(orders().length, ordersBefore9c + 1);
  assert.strictEqual(product('Tirzepatide 15mg (Jinbei)').stock, jinStock9c - 2);
  assert.strictEqual(logRows().length, logBefore9c + 1);
  const lastLog = logRows()[logRows().length - 1];
  assert.strictEqual(lastLog['Reason'], 'Reserved by order ' + w1.orderId);

  const mRow = orders().find((o) => o['Order ID'] === w1.orderId);
  assert.deepStrictEqual(
    [mRow['Status'], mRow['Customer Name'], mRow['Payment'], mRow['Shipping'], mRow['Stock Returned']],
    ['Paid', 'WALK-IN TEST', 'Cash', 'Via Lalamove', false]);
  assert.strictEqual(mRow['Address'], 'N/A \u2014 Lalamove form');
  assert.match(mRow['Items'], /2 \u00d7 Tirzepatide 15mg \(Jinbei\) \u2014 Vial Only/);
  assert.match(mRow['Notes'], /met at BGC/);
  assert.ok(mRow['Date'] instanceof Date, 'Date must be a real date');
  const mData = JSON.parse(mRow['Items Data']);
  assert.strictEqual(mData.lines.length, 1);
  assert.strictEqual(mData.lines[0].optionId, jinVial.id);

  // A blank-stock product is written but never deducted or logged
  const unc = G.readCatalog_().find((p) => p.stock === null && p.options.some((o) => o.price !== null));
  const logBeforeUnc = logRows().length;
  const w2 = G.manualOrder_(mBody({ items: [{ optionId: unc.options.find((o) => o.price !== null).id, qty: 3 }] }));
  assert.ok(w2.ok, JSON.stringify(w2));
  assert.strictEqual(product(unc.name).stock, null, 'uncounted stock must stay blank');
  assert.strictEqual(logRows().length, logBeforeUnc, 'uncounted product must not be logged');

  // Oversell needs confirmation, and nothing is written without it
  const ordersBeforeOver = orders().length;
  const jinStockOver = product('Tirzepatide 15mg (Jinbei)').stock;
  const refused = G.manualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: jinStockOver + 4 }] }));
  assert.strictEqual(refused.ok, false);
  assert.strictEqual(refused.error, 'oversell');
  assert.strictEqual(refused.items[0].after, -4);
  assert.strictEqual(orders().length, ordersBeforeOver, 'refused oversell must write nothing');
  assert.strictEqual(product('Tirzepatide 15mg (Jinbei)').stock, jinStockOver, 'refused oversell must move no stock');

  const confirmed = G.manualOrder_(mBody({ items: [{ optionId: jinVial.id, qty: jinStockOver + 4 }], confirmOversell: true }));
  assert.ok(confirmed.ok, JSON.stringify(confirmed));
  assert.strictEqual(product('Tirzepatide 15mg (Jinbei)').stock, -4, 'confirmed oversell goes negative');

  // A rejected order writes nothing at all
  const ordersBeforeBad = orders().length;
  assert.strictEqual(G.manualOrder_(mBody({ customer: { name: '' }, items: [{ optionId: jinVial.id, qty: 1 }] })).error, 'missing_name');
  assert.strictEqual(orders().length, ordersBeforeBad, 'invalid order must write nothing');

  // Cancel restores stock once, exactly like a website order
  const cancelStock = product('Tirzepatide 15mg (Jinbei)').stock;
  edit(O, orders().find((o) => o['Order ID'] === w1.orderId)._row, col(O, 'Status'), 'Cancelled', 'Paid');
  assert.strictEqual(product('Tirzepatide 15mg (Jinbei)').stock, cancelStock + 2, 'cancel must restore a manual order');
  ok('manual write: row + stock + log, uncounted skipped, oversell needs confirmation, invalid writes nothing, cancel restores');
```

- [ ] **Step 2: Add the export**

Extend `global.G = { ... }` with `manualOrder_` (already listed in Task 2 Step 2 — verify it is there).

- [ ] **Step 3: Run test to verify it fails**

Run: `node test-flows.js`
Expected: FAIL with `manualOrder_ is not defined`.

- [ ] **Step 4: Implement**

Add to `Code.gs` after `resolveManualOrder_`:

```js
/**
 * Records an order that did not come from the website. Deducts stock, writes the Orders row.
 * An oversell is refused UNLESS body.confirmOversell is true, so the caller can warn first;
 * once confirmed the stock is allowed to go negative - the sale already happened, and a
 * negative figure is a visible "the count was wrong", which clamping at zero would hide.
 */
function manualOrder_(body) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, error: 'busy' };
  try {
    const r = resolveManualOrder_(body);
    if (!r.ok) return r;
    if (r.oversell.length && body.confirmOversell !== true) {
      return { ok: false, error: 'oversell', items: r.oversell };
    }

    const orderId = nextManualId_();
    const products = readCatalog_();
    Object.keys(r.needByProduct).forEach((pid) => {
      const p = products.find((x) => x.id === pid);
      if (!p || p.stock === null) return;                  // not counted
      const after = p.stock - r.needByProduct[pid];
      setStock_(p, after);
      logStock_(p, -r.needByProduct[pid], after, 'Reserved by order ' + orderId);
    });

    const c = body.customer || {};
    const status = ['Pending', 'Paid', 'Shipped'].indexOf(str_(body.status)) >= 0 ? str_(body.status) : 'Paid';
    const oc = cols_(sheet_(TAB.orders));
    const row = [];
    const put = (h, v) => { if (oc[h]) row[oc[h] - 1] = v; };
    put('Order ID', orderId); put('Date', new Date()); put('Status', status);
    put('Customer Name', str_(c.name)); put('Phone', str_(c.phone)); put('Address', r.address);
    put('Items', r.lines.map((l) => l.qty + ' \u00d7 ' + l.label + ' \u2014 ' + peso_(l.price * l.qty)).join('\n'));
    put('Subtotal', r.subtotal); put('Shipping Fee', r.shippingFee);
    put('Discount', r.discount); put('Total', r.total);
    put('Payment', str_(body.payment)); put('Shipping', r.deliveryLabel);
    put('Notes', str_(body.notes));
    put('Items Data', JSON.stringify({ key: Utilities.getUuid(), manual: true, emailed: false, lines: r.lines }));
    put('Stock Returned', false);
    for (let k = 0; k < row.length; k++) if (row[k] === undefined) row[k] = '';
    writeNextRow_(sheet_(TAB.orders), 'Order ID', row);

    clearCatalogCache_();
    return { ok: true, orderId: orderId, subtotal: r.subtotal, shippingFee: r.shippingFee,
      discount: r.discount, total: r.total, lines: r.lines, oversell: r.oversell };
  } finally {
    lock.releaseLock();
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node test-flows.js`
Expected: the new `✓ manual write: …` line, then `ALL FLOW TESTS PASSED`.

---

### Task 5: Auto-cancel must never touch a manual order

Without this, a manual order left at Pending is "cancelled" within the hour and its stock silently returned — the Catalog then overstates by exactly what was sold, with nothing visibly broken.

**Files:**
- Modify: `BIOPEP-backoffice/Code.gs:418-432` (`autoCancelUnpaid`)
- Modify: `BIOPEP-backoffice/test-flows.js`

**Interfaces:**
- Consumes: `MANUAL_PREFIX` (Task 2)
- Produces: no new interface; changes `autoCancelUnpaid()` behaviour

- [ ] **Step 1: Write the failing test**

Append to the manual-order section:

```js
  // ── 9d. autoCancelUnpaid leaves manual orders alone ──
  const mPending = G.manualOrder_(mBody({ status: 'Pending', items: [{ optionId: jinVial.id, qty: 1 }], confirmOversell: true }));
  assert.ok(mPending.ok, JSON.stringify(mPending));
  const mPendingRow = orders().find((o) => o['Order ID'] === mPending.orderId)._row;
  // Backdate it well past the 12h hold, which would doom a website order.
  O.getRange(mPendingRow, col(O, 'Date')).setValue(new Date(Date.now() - 72 * 3600 * 1000));

  // The website order needs a product that still HAS stock: Task 4 deliberately drove the
  // Jinbei pool negative, and placeOrder_ would refuse it (correctly) with not_enough_stock.
  const stocked = G.readCatalog_().find((p) => p.show && p.stock !== null && p.stock >= 1
    && p.options.some((o) => o.show && o.price !== null));
  assert.ok(stocked, 'need one visible in-stock product for the website half of this test');
  const stockedOpt = stocked.options.find((o) => o.show && o.price !== null);
  const bpPending = place({ items: [{ optionId: stockedOpt.id, qty: 1 }] });
  assert.ok(bpPending.ok, JSON.stringify(bpPending));
  const bpRow = orders().find((o) => o['Order ID'] === bpPending.orderId)._row;
  O.getRange(bpRow, col(O, 'Date')).setValue(new Date(Date.now() - 72 * 3600 * 1000));

  G.autoCancelUnpaid();
  assert.strictEqual(O.getRange(mPendingRow, col(O, 'Status')).getValue(), 'Pending', 'a manual order must survive auto-cancel');
  assert.strictEqual(O.getRange(bpRow, col(O, 'Status')).getValue(), 'Cancelled', 'a stale website order must still be cancelled');
  ok('autoCancelUnpaid: skips BPM- orders, still cancels stale BP- ones');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node test-flows.js`
Expected: FAIL with `a manual order must survive auto-cancel` — the status reads `Cancelled`.

- [ ] **Step 3: Implement**

In `Code.gs`, inside `autoCancelUnpaid()`, change the guard line. It currently reads:

```js
    if (o['Status'] !== 'Pending' || !(o['Date'] instanceof Date) || o['Date'].getTime() > cutoff) return;
```

Replace with:

```js
    // Manual orders are exempt: the 12h hold exists to free stock held by anonymous buyers
    // who may never pay. A hand-keyed order records a sale that already happened, so
    // cancelling it would silently return stock that is genuinely gone.
    if (String(o['Order ID']).indexOf(MANUAL_PREFIX) === 0) return;
    if (o['Status'] !== 'Pending' || !(o['Date'] instanceof Date) || o['Date'].getTime() > cutoff) return;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node test-flows.js`
Expected: `✓ autoCancelUnpaid: skips BPM- orders, still cancels stale BP- ones`, then `ALL FLOW TESTS PASSED`.

---

### Task 6: Feed the dialog

**Files:**
- Modify: `BIOPEP-backoffice/Code.gs` (add `catalogForEntry_` after `buildCatalog_`, around line 189)
- Modify: `BIOPEP-backoffice/test-flows.js`

**Interfaces:**
- Consumes: `readCatalog_`, `DELIVERY`, `PAYMENT_METHODS`
- Produces:

```js
catalogForEntry_() ->
  { options: [{ optionId, productId, label, price, stock }],   // stock null = not counted
    deliveries: [{ value: 'lalamove', label: 'Via Lalamove', noAddress: true, fee: 0,
                   feeByRegion: null }],
    regions: [{ value: 'ncr', label: 'NCR' }, ...],
    payments: ['GCash','Maya','Maribank','GoTyme','Cash'],
    statuses: ['Paid','Pending','Shipped'] }
```

Unlike `buildCatalog_()` this includes **hidden products** — that is the whole point of manual entry.

- [ ] **Step 1: Write the failing test**

Append to the manual-order section:

```js
  // ── 9e. catalogForEntry_ feeds the dialog, hidden products included ──
  const feed = G.catalogForEntry_();
  assert.ok(feed.options.length >= optionCount - 5, 'entry feed should offer nearly every option');
  assert.ok(feed.options.some((o) => o.optionId === hidden.options[0].id), 'hidden products must be offered');
  assert.ok(feed.options.every((o) => o.label && o.optionId && o.productId), 'every entry needs label + ids');
  assert.ok(feed.options.every((o) => o.price === null || typeof o.price === 'number'));
  assert.deepStrictEqual(feed.deliveries.map((d) => d.value).sort(), ['jnt', 'lalamove', 'shopee']);
  assert.strictEqual(feed.deliveries.find((d) => d.value === 'jnt').feeByRegion.visayas, 200);
  assert.strictEqual(feed.deliveries.find((d) => d.value === 'lalamove').noAddress, true);
  assert.deepStrictEqual(feed.regions.map((r) => r.value), ['ncr', 'luzon', 'visayas', 'mindanao']);
  assert.ok(feed.payments.indexOf('Cash') >= 0 && feed.payments.indexOf('GCash') >= 0);
  assert.deepStrictEqual(feed.statuses, ['Paid', 'Pending', 'Shipped']);
  ok('catalogForEntry_: ' + feed.options.length + ' options incl. hidden, deliveries/regions/payments/statuses');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node test-flows.js`
Expected: FAIL with `catalogForEntry_ is not defined`.

- [ ] **Step 3: Implement**

Add to `Code.gs` after `buildCatalog_()`:

```js
const ENTRY_REGIONS = [
  { value: 'ncr', label: 'NCR' }, { value: 'luzon', label: 'Luzon' },
  { value: 'visayas', label: 'Visayas' }, { value: 'mindanao', label: 'Mindanao' },
];

/**
 * Everything the Add-order dialog needs in one call.
 * Deliberately includes products that are NOT Show-on-Site: sheet-only rows exist to be
 * sold off the website, which is exactly what manual entry is for.
 */
function catalogForEntry_() {
  const options = [];
  readCatalog_().forEach((p) => p.options.forEach((o) => {
    options.push({ optionId: o.id, productId: p.id, label: p.name + ' \u2014 ' + o.name,
      price: o.price, stock: p.stock });
  }));
  options.sort(function (a, b) { return a.label < b.label ? -1 : a.label > b.label ? 1 : 0; });
  return {
    options: options,
    deliveries: Object.keys(DELIVERY).map(function (k) {
      return { value: k, label: DELIVERY[k].label, noAddress: !!DELIVERY[k].noAddress,
        fee: DELIVERY[k].fee || 0, feeByRegion: DELIVERY[k].feeByRegion || null };
    }),
    regions: ENTRY_REGIONS,
    payments: PAYMENT_METHODS.concat(['Cash']),
    statuses: ['Paid', 'Pending', 'Shipped'],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node test-flows.js`
Expected: `✓ catalogForEntry_: …`, then `ALL FLOW TESTS PASSED`.

---

### Task 7: The dialog and the menu

**Files:**
- Create: `BIOPEP-backoffice/AddOrder.html`
- Modify: `BIOPEP-backoffice/Code.gs:485-489` (`onOpen`), and add `openAddOrder` + `submitManualOrder`

**Interfaces:**
- Consumes: `catalogForEntry_()`, `manualOrder_(body)`
- Produces: `openAddOrder()` (menu target), `submitManualOrder(body)` (called from the page via `google.script.run`)

**ASCII ONLY in `AddOrder.html`.** Use `&#8369;` in markup and `'\u20B1'` in JS.

- [ ] **Step 1: Create the dialog**

Create `BIOPEP-backoffice/AddOrder.html`:

```html
<!DOCTYPE html>
<html>
<head>
<base target="_top">
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; margin: 0; padding: 14px; color: #222; }
  h3 { margin: 0 0 10px; font-size: 15px; }
  label { display: block; font-weight: bold; margin: 8px 0 2px; }
  input, select, textarea { width: 100%; box-sizing: border-box; padding: 5px; font-size: 13px; }
  .row { display: flex; gap: 8px; }
  .row > div { flex: 1; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { text-align: left; padding: 3px; font-size: 12px; }
  th { border-bottom: 1px solid #ccc; }
  .item-qty { width: 60px; }
  .item-price { width: 90px; }
  .muted { color: #777; font-weight: normal; font-size: 11px; }
  .total { margin-top: 10px; padding: 8px; background: #faf0f5; font-size: 14px; }
  .err { color: #b00020; margin-top: 8px; white-space: pre-line; }
  button { padding: 6px 12px; font-size: 13px; cursor: pointer; }
  #submit { background: #e5468a; color: #fff; border: 0; border-radius: 4px; font-weight: bold; }
  #submit:disabled { background: #bbb; }
</style>
</head>
<body>
<h3>Add order</h3>

<div class="row">
  <div><label>Customer name *</label><input id="name"></div>
  <div><label>Phone</label><input id="phone"></div>
</div>

<div class="row">
  <div><label>Delivery</label><select id="delivery"></select></div>
  <div id="regionWrap"><label>Region</label><select id="region"></select></div>
</div>

<div id="addressWrap"><label>Address</label><input id="address"></div>

<div class="row">
  <div><label>Status</label><select id="status"></select></div>
  <div><label>Payment</label><select id="payment"></select></div>
</div>

<label>Items</label>
<table>
  <thead><tr><th>Product &#8212; Option</th><th>Qty</th><th>Unit price <span class="muted">(blank = catalog)</span></th><th></th></tr></thead>
  <tbody id="items"></tbody>
</table>
<button id="addItem" type="button">+ Add item</button>

<div class="row">
  <div><label>Shipping fee</label><input id="shippingFee" type="number"></div>
  <div><label>Discount</label><input id="discount" type="number" value="0"></div>
</div>

<label>Notes</label><textarea id="notes" rows="2"></textarea>

<div class="total" id="total">Total: &#8369;0</div>
<div class="err" id="err"></div>

<p><button id="submit" type="button">Save order</button>
<button id="cancel" type="button">Cancel</button></p>

<script>
var FEED = null, PESO = '\u20B1';
var $ = function (id) { return document.getElementById(id); };
var money = function (n) { return PESO + Number(n || 0).toLocaleString('en-PH'); };

google.script.run.withSuccessHandler(function (feed) { FEED = feed; build(); }).getEntryFeed();

function build() {
  fill($('delivery'), FEED.deliveries.map(function (d) { return [d.value, d.label]; }));
  fill($('region'), FEED.regions.map(function (r) { return [r.value, r.label]; }));
  fill($('status'), FEED.statuses.map(function (s) { return [s, s]; }));
  fill($('payment'), [['', '(none)']].concat(FEED.payments.map(function (p) { return [p, p]; })));
  $('delivery').onchange = onDelivery;
  $('region').onchange = onDelivery;
  $('addItem').onclick = addItem;
  $('discount').oninput = recalc;
  $('shippingFee').oninput = recalc;
  $('submit').onclick = function () { submit(false); };
  $('cancel').onclick = function () { google.script.host.close(); };
  addItem();
  onDelivery();
}

function fill(sel, pairs) {
  sel.innerHTML = '';
  pairs.forEach(function (p) {
    var o = document.createElement('option');
    o.value = p[0]; o.textContent = p[1];
    sel.appendChild(o);
  });
}

function delivery() {
  var v = $('delivery').value;
  for (var i = 0; i < FEED.deliveries.length; i++) if (FEED.deliveries[i].value === v) return FEED.deliveries[i];
  return null;
}

function onDelivery() {
  var d = delivery();
  var jnt = !!d.feeByRegion;
  $('regionWrap').style.display = jnt ? '' : 'none';
  $('addressWrap').style.display = d.noAddress ? 'none' : '';
  $('shippingFee').value = jnt ? d.feeByRegion[$('region').value] : (d.fee || 0);
  recalc();
}

function addItem() {
  var tr = document.createElement('tr');
  var sel = document.createElement('select');
  fill(sel, FEED.options.map(function (o) {
    var stock = o.stock === null ? 'not counted' : o.stock + ' left';
    return [o.optionId, o.label + '  (' + stock + ')'];
  }));
  sel.className = 'item-opt';
  sel.onchange = recalc;
  var td1 = document.createElement('td'); td1.appendChild(sel);
  var td2 = document.createElement('td');
  td2.innerHTML = '<input type="number" class="item-qty" value="1" min="1">';
  var td3 = document.createElement('td');
  td3.innerHTML = '<input type="number" class="item-price" placeholder="catalog">';
  var td4 = document.createElement('td');
  var del = document.createElement('button');
  del.type = 'button'; del.textContent = 'x';
  del.onclick = function () { tr.parentNode.removeChild(tr); recalc(); };
  td4.appendChild(del);
  [td1, td2, td3, td4].forEach(function (td) { tr.appendChild(td); });
  $('items').appendChild(tr);
  td2.querySelector('input').oninput = recalc;
  td3.querySelector('input').oninput = recalc;
  recalc();
}

function priceOf(optionId) {
  for (var i = 0; i < FEED.options.length; i++) if (FEED.options[i].optionId === optionId) return FEED.options[i].price;
  return null;
}

function readItems() {
  return [].map.call($('items').querySelectorAll('tr'), function (tr) {
    return { optionId: tr.querySelector('.item-opt').value,
      qty: Number(tr.querySelector('.item-qty').value || 0),
      price: tr.querySelector('.item-price').value === '' ? null : Number(tr.querySelector('.item-price').value) };
  });
}

function recalc() {
  var sub = 0;
  readItems().forEach(function (i) {
    var p = i.price === null ? priceOf(i.optionId) : i.price;
    sub += (p || 0) * i.qty;
  });
  var total = Math.max(0, sub + Number($('shippingFee').value || 0) - Number($('discount').value || 0));
  $('total').textContent = 'Subtotal ' + money(sub) + '   |   Total: ' + money(total);
}

function submit(confirmOversell) {
  $('err').textContent = '';
  $('submit').disabled = true;
  google.script.run
    .withSuccessHandler(function (res) {
      if (res.ok) { google.script.host.close(); return; }
      $('submit').disabled = false;
      if (res.error === 'oversell') {
        var lines = res.items.map(function (i) {
          return '- ' + i.name + ': have ' + i.available + ', would go to ' + i.after;
        }).join('\n');
        if (window.confirm('This order is more than you have in stock:\n\n' + lines +
            '\n\nSave anyway? Stock will go negative and the Stock Log will show it.')) {
          submit(true);
        }
        return;
      }
      $('err').textContent = message(res.error);
    })
    .withFailureHandler(function (e) { $('submit').disabled = false; $('err').textContent = e.message; })
    .submitManualOrder({
      customer: { name: $('name').value, phone: $('phone').value, address: $('address').value },
      delivery: $('delivery').value, region: $('region').value,
      status: $('status').value, payment: $('payment').value,
      shippingFee: $('shippingFee').value === '' ? null : Number($('shippingFee').value),
      discount: Number($('discount').value || 0), notes: $('notes').value,
      items: readItems(), confirmOversell: confirmOversell
    });
}

function message(code) {
  var m = { missing_name: 'Customer name is required.',
    missing_address: 'An address is required for J&T Express.',
    bad_items: 'Check the item rows: every line needs a product and a quantity of at least 1.',
    bad_delivery: 'Pick a delivery option (and a region for J&T).',
    busy: 'The sheet is busy, try again in a moment.' };
  return m[code] || ('Could not save: ' + code);
}
</script>
</body>
</html>
```

- [ ] **Step 2: Verify the HTML is ASCII-only**

Run:

```bash
cd "C:/Users/LESTER/Desktop/PROJECTS/BIOPEP-backoffice"
node -e "const t=require('fs').readFileSync('AddOrder.html','utf8');const bad=[...t].filter(c=>c.charCodeAt(0)>127);console.log('non-ASCII:',bad.length, bad.slice(0,10).join(' '));"
```

Expected: `non-ASCII: 0`. If not zero, replace each character with its `&#...;` or `\uXXXX` escape — a raw one will break the paste.

- [ ] **Step 3: Wire the menu and the two server endpoints**

In `Code.gs`, replace `onOpen()`:

```js
function onOpen() {
  SpreadsheetApp.getUi().createMenu('\u{1F9EA} Biopep')
    .addItem('Add order\u2026', 'openAddOrder')
    .addItem('Refresh website now', 'refreshWebsiteNow')
    .addToUi();
}

function openAddOrder() {
  const html = HtmlService.createHtmlOutputFromFile('AddOrder').setWidth(620).setHeight(640);
  SpreadsheetApp.getUi().showModalDialog(html, 'Add order');
}

/** Called from AddOrder.html via google.script.run. */
function getEntryFeed() { return catalogForEntry_(); }

/** Called from AddOrder.html via google.script.run. */
function submitManualOrder(body) {
  const res = manualOrder_(body);
  if (res.ok) {
    ss_().toast(res.orderId + ' \u00b7 ' + res.lines.length + ' item(s) \u00b7 ' + peso_(res.total) +
      (res.oversell.length ? ' \u00b7 STOCK WENT NEGATIVE' : ' \u00b7 stock deducted'), 'Biopep', 8);
  }
  return res;
}
```

Note the existing menu emoji is written as `\u{1F9EA}` so `make-paste.js` has nothing to escape there.

- [ ] **Step 4: Confirm the suite is still green**

Run: `node test-flows.js`
Expected: `ALL FLOW TESTS PASSED`. (`onOpen`/`openAddOrder` are never called by the harness; this step only proves nothing else broke.)

---

### Task 8: Paste packaging and deployment

**Files:**
- Modify: `BIOPEP-backoffice/make-paste.js`

**Interfaces:**
- Consumes: `Code.gs`, `AddOrder.html`
- Produces: `Code-paste.gs`, `AddOrder-paste.html`

- [ ] **Step 1: Extend make-paste.js to cover both files**

Replace the whole of `make-paste.js` with:

```js
// Makes Code-paste.gs and AddOrder-paste.html: the sources with every non-ASCII character
// written as an escape, so they survive copy/paste over Remote Desktop. Behaviour is
// identical. Run: node make-paste.js
const fs = require('fs');

const END = '// ===== END OF FILE - if you can see this line, the whole script was pasted =====';
const END_HTML = '<!-- ===== END OF FILE - if you can see this line, the whole file was pasted ===== -->';

function escapeNonAscii(src) {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const code = src.charCodeAt(i);
    out += code < 128 ? src[i] : '\\u' + code.toString(16).toUpperCase().padStart(4, '0');
  }
  return out;
}

// Code.gs -> Code-paste.gs
const code = escapeNonAscii(fs.readFileSync(__dirname + '/Code.gs', 'utf8').replace(/\r\n/g, '\n'));
fs.writeFileSync(__dirname + '/Code-paste.gs', (code + '\n' + END + '\n').replace(/\n/g, '\r\n'));
new Function(code); // throws if it no longer parses
console.log('Code-paste.gs written:', code.split('\n').length, 'lines, non-ASCII left:',
  [...code].filter((c) => c.charCodeAt(0) > 127).length);

// AddOrder.html -> AddOrder-paste.html. The file should already be ASCII-only; a \uXXXX
// escape is valid inside its <script> but NOT in its markup, so a non-ASCII character in
// the HTML body is an error to fix at the source, not something to escape here.
const htmlSrc = fs.readFileSync(__dirname + '/AddOrder.html', 'utf8').replace(/\r\n/g, '\n');
const stray = [...htmlSrc].filter((c) => c.charCodeAt(0) > 127);
if (stray.length) {
  throw new Error('AddOrder.html has ' + stray.length + ' non-ASCII character(s): ' +
    [...new Set(stray)].join(' ') + ' - replace them with &#NNNN; in markup or \\uXXXX in JS');
}
fs.writeFileSync(__dirname + '/AddOrder-paste.html', (htmlSrc + '\n' + END_HTML + '\n').replace(/\n/g, '\r\n'));
console.log('AddOrder-paste.html written:', htmlSrc.split('\n').length, 'lines, non-ASCII left: 0');
```

- [ ] **Step 2: Run it**

Run: `node make-paste.js`
Expected: two lines, both reporting `non-ASCII left: 0`. If `AddOrder.html` throws, fix the character at the source and re-run.

- [ ] **Step 3: Final green run**

Run: `node test-flows.js`
Expected: `ALL FLOW TESTS PASSED`.

- [ ] **Step 4: Deploy — hand to Lester, do not do this unattended**

In the Apps Script editor bound to the BIOPEP INVENTORY sheet:

1. Open `Code.gs`, select all, paste `Code-paste.gs`. Confirm the `END OF FILE` comment is the last line.
2. **File ▸ New ▸ HTML file**, name it exactly `AddOrder` (the extension is added automatically; `createHtmlOutputFromFile('AddOrder')` depends on this name). Paste `AddOrder-paste.html`.
3. Save. **Deploy ▸ Manage deployments ▸ ✏️ ▸ New version ▸ Deploy** — same deployment ID. Never "New deployment".
4. Reload the spreadsheet so `onOpen` re-runs and the new menu item appears.

- [ ] **Step 5: Live smoke test, with a disposable order**

1. `🧪 Biopep ▸ Add order…` — the dialog opens and the item dropdown lists products with stock counts.
2. Enter name `ZZ TEST`, one item, qty 1, delivery Lalamove. Save.
3. Check: a `BPM-0001` row on Orders, Address reads `N/A - Lalamove form`, that product's Catalog stock is down by 1, and a Stock Log row says `Reserved by order BPM-0001`.
4. Set that row's Status to **Cancelled** — stock returns, `Stock Returned` ticks TRUE.
5. **Delete the test row by its exact Order ID**, never by a content match. Reset the counter if wanted: delete script property `manualOrderCounter` so the first real order is `BPM-0001`.

- [ ] **Step 6: Record the change**

Update `C:\Users\LESTER\memory\ecommerce-stores.md` with a Biopep bullet covering: the `BPM-` prefix and its counter property, that `autoCancelUnpaid` skips manual orders, that hidden products are sellable by hand but not by the website, that oversell is allowed only with confirmation, and that `AddOrder.html` must stay ASCII-only.

Then commit the plan repo:

```bash
cd "C:/Users/LESTER/Desktop/PROJECTS/BIOPEP"
git add docs/superpowers/
git commit -m "Plan: manual order entry, executed

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| Dialog off the `🧪 Biopep` menu, thin client | 7 |
| `catalogForEntry_` feeds products/prices/live stock | 6 |
| Name required; phone/address optional (address required for J&T) | 3 |
| Delivery + address identical to the website, from `DELIVERY` | 3, 6 |
| Region picker instead of the 1,600-city dataset | 3, 6, 7 |
| Payment = website methods + Cash + blank | 6, 7 |
| Unit Price blank = Catalog price | 3 |
| Discount as a plain amount, no promo codes | 3 |
| Status Paid/Pending/Shipped, default Paid, no Cancelled | 4, 6 |
| Website-only rules dropped (qty caps, pending-per-phone, phone format, Show-on-Site) | 3 |
| `BPM-` ids on their own counter | 2 |
| Stock deducted per product; blank stock skipped | 4 |
| `Stock Returned` written `false` | 4 |
| Oversell warned then allowed; never clamped | 3, 4 |
| Validation rejects whole order, writes nothing | 3, 4 |
| `autoCancelUnpaid` skips `BPM-` | 5 |
| No admin email | 4 (`sendAdminEmail_` is simply never called) |
| Test coverage items 1-12 | 2, 3, 4, 5, 6 |
| `test-flows.js` repair | 1 |
| `make-paste.js` covers the HTML | 8 |
| Deploy: same deployment ID, New version | 8 |
