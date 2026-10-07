# Product Builder tab — design

**Date:** 2026-10-07
**Status:** approved by Lester (tab layout to be reviewed on the real output)

## Problem

Rachelle can edit stock, prices, Show on Site and Sort Order in the Catalog tab, but a
product's *copy* — its name, the sub-line on the card, the modal paragraph, its option
labels and option descriptions — lives in the repo: hardcoded markup in `index.html` plus
a `PRODUCTS` entry in `script.js`. Changing any of it, or adding a product, needs Lester
to describe it in chat and Claude to hand-edit three places.

Lester wants a Builder tab where Rachelle drafts a new product or edits an existing one,
tells Lester, and Lester endorses it to Claude.

## Non-goal: changing how the storefront loads

Akira renders every card from its catalog feed, so a form can add a product with no code
change. Biopep does not: cards are static HTML and the sheet only *overlays* price, stock,
sort order, category and sold-out state.

Making Biopep sheet-driven would mean the product grid cannot paint until a network fetch
lands. **Lester chose to keep the push step precisely to avoid that.** The storefront is
therefore unchanged by this work: same static cards, same published Catalog CSV, same
first paint. The Builder tab is an authoring surface that no browser ever fetches.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Self-serve vs push | **Push** — Claude generates and pushes | Keeps cards static; zero customer-facing cost |
| Who drafts | Rachelle drafts → Lester endorses → Claude builds | Matches how they already work |
| Tab contents | All ~40 products seeded with real copy, edited in place | She can see current copy; new products go in blank rows |
| Option layout | One row per option | Mirrors the Catalog tab she already uses; no cap on options |
| Photos | **No photo field** | Card photos render at 0px height sitewide — customers never see them |
| Manufacturers | Out of v1 | Tirzepatide 15/30mg stay greyed, "advanced — ask Claude" |
| Apps Script | **Not touched** | Claude writes the Catalog rows itself; see below |

### Why Apps Script stays out of it

An earlier draft had an `onEdit` trigger write Catalog rows and assign IDs as Rachelle
typed. Dropped on Lester's question — since he endorses every change anyway, Claude can
create those rows in the same run that generates the cards.

What that avoids: no new trigger, no paste-over-Remote-Desktop (which mangles `₱` and
em-dashes), no "Manage deployments → New version", and no risk to the live order/reserve
code. It also keeps one writer on Catalog structure instead of two, and sidesteps the
`appendRow` checkbox trap that puts rows at 501+.

What it costs, and the replacement:

- *No auto "Edited" status.* The builder diffs the tab against a stored snapshot each run,
  which catches every change — including ones an `onEdit` would miss (API edits, pastes).
- *No live validation.* Native Sheets validation (Category dropdown, Ready checkbox) covers
  the common mistakes; anything subtler is reported when the builder runs, before a push.

## Ownership split

No field lives in two places, so there is no sync loop.

| Tab | Owns | Edited by |
|---|---|---|
| **Builder** | Name · card sub-line · modal description · option labels · option descriptions · category | Rachelle |
| **Catalog** | Price · Stock · Show on Site · Sort Order | Rachelle, as today |

Price and Stock are deliberately NOT on the Builder tab (Lester, 2026-10-07): a mirrored
value goes stale the moment Catalog is edited, and two cells showing a price invites the
wrong one being trusted. The split she holds in her head is "Builder = what the customer
reads, Catalog = what the customer pays and what is left".

Consequence: a new product lands in Catalog with an empty price, and the site drops
unpriced options — so the card does not appear until she sets the price in Catalog. That
is the safe default (no 0-peso product goes live), but it makes a new product two steps.
The builder prints the exact Catalog rows to fill when it hands back.

## Builder tab layout

| Col | Field | Filled by |
|---|---|---|
| A | Product ID | builder (hidden) |
| B | Option ID | builder (hidden) |
| C | Card ID (site id, e.g. `pharma-bac-vial-chongsan`) | builder (hidden) |
| D | Product Name | Rachelle — first row of each product only |
| E | Category | Rachelle — dropdown |
| F | Card sub-line (`.pcard-desc`) | Rachelle |
| G | Modal description (`PRODUCTS[...].desc`) | Rachelle |
| H | Option Label | Rachelle — one row per option; blank if no options |
| I | Option Description | Rachelle — optional |
| J | Ready | Rachelle — checkbox |
| K | Status | builder — Live / New – not built / Edited – not built / ⚠ problem |

A blank Product Name means "this row is another option of the product above", exactly as
the Catalog tab reads.

## Flow

```
Rachelle edits Builder → ticks Ready → tells Lester → Lester endorses
                                                            │
                                     node build-cards.js ◄──┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        ▼                                       ▼
          Catalog rows (create/update)            index.html + script.js
                        │                                       │
                        └──────────────────┬────────────────────┘
                                           ▼
                            Lester reviews on localhost → push
                                           │
                                 Status → "Live", snapshot rewritten
```

## The builder script

`BIOPEP-backoffice/build-cards.js`, Node + the existing Sheets OAuth creds.

**Reads:** the Builder tab, the Catalog tab, and the current repo (`index.html`,
`script.js`) — plus `builder-snapshot.json`, the state at the last successful build.

**Decides** per product: unchanged / edited / new, by diffing against the snapshot.

**Writes:**

1. *Catalog* — new rows for new products and options (next free IDs, Sort Order appended,
   price and stock left blank for Lester/Rachelle to fill in Catalog); for edits, Product Name / Option Name / Category.
   Never deletes a row; hiding is done with Show on Site, as today.
2. *`script.js`* — the `PRODUCTS` entry (name, desc, variants with label/desc/priceAdd) and
   the `SHEET_MAP` line. Option labels are the `SHEET_MAP` keys, so a relabel regenerates
   both together — the thing that had to be done by hand for Forges GTT on 2026-10-07.
3. *`index.html`* — the card block, located by `data-id`. Only the name, sub-line and
   options line are replaced on an edit; hand-written structure (badges, overlays,
   pre-order deadlines) is left alone. New cards are appended inside their category.

**Then:** prints a diff summary for Lester, who reviews on localhost before the push.
`--mark-built` writes Status back to "Live" and rewrites the snapshot.

**Never:** deletes products, edits Catalog price/stock on an existing row, or touches the
Apps Script, Orders, Settings or Stock Log tabs.

## Safety

- **Dry run by default.** `build-cards.js` prints what it would change; `--write` applies.
- **Refuses to build** a row that fails validation (missing name, unknown category,
  duplicate option label within a product, duplicate product name) and says which row.
- **Git is the undo.** Repo edits are reviewed as a normal diff before any commit.
- **Catalog writes are additive**, so a mistake is a stray row, not lost data.
- **Lester reviews on localhost before every push**, unchanged from today.

## Out of scope

- Manufacturer products (Tirzepatide 15/30mg)
- Deleting products — still hide with Show on Site
- Photos — no field (see below)
- Pre-order deadlines, badges, tiered/complete-set kit contents: still hand-edited

## Related finding — not part of this work

Card photos are invisible: `.pcard-img` has no height rule, so it renders at 0px unless it
holds a Pre-Order badge or Sold Out overlay (34px via the `:has()` rule). But 19 image
files, ~2.8 MB, are still downloaded on every page load — `fuan1.png` alone is 1.4 MB,
and images for cards that are hidden anyway (syringes, saline) are fetched too.

Removing or lazy-loading them is a real mobile-data win and is independent of this design.
