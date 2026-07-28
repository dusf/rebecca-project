# Gift Rule Product Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a product-only picker for gift rule scope selection with the same category, attribute, collection, price, and stock filtering capabilities as the product amount discount picker.

**Architecture:** Extend the gift module's mock product records with filter metadata, then render a dedicated two-column product picker only when the scope type is `product`. Keep the existing lightweight collection picker unchanged and preserve the current callback contract that returns product source objects.

**Tech Stack:** HTML, CSS, vanilla JavaScript, shared category and attribute data from `admin/common/js/commons.js`.

## Global Constraints

- Product selection stops at product level and exposes no SKU selection controls.
- Category attribute filters load dynamically after category selection.
- Search and all filters combine together.
- Selection survives filtering and only writes back after confirmation.
- Do not commit changes unless the user explicitly requests a commit.

---

### Task 1: Add Product Filter Metadata

**Files:**
- Modify: `admin/gift/js/gift_common.js`

**Interfaces:**
- Consumes: `window.categories`, `window.getAttributesByCategory(categoryId)`, existing `GWP.collections`.
- Produces: product records with `categoryId`, `categoryName`, `attributeValues`, `collectionIds`, `priceMin`, `priceMax`, and `stock`.

- [x] **Step 1: Enrich the mock products**

Add category, collection, and attribute mappings to each `PA_PRODUCTS` record. Derive price bounds and stock from product variants where possible so filtering and displayed summaries use one source of truth.

- [x] **Step 2: Add normalized filter helpers**

Add small helpers for product price bounds, category labels, and category attributes. Keep them private to `gift_common.js`.

- [x] **Step 3: Run syntax validation**

Run:

```powershell
node --check admin/gift/js/gift_common.js
```

Expected: exit code `0`.

### Task 2: Build Product-Only Filter Dialog

**Files:**
- Modify: `admin/gift/js/gift_common.js`
- Modify: `admin/gift/css/gift.css`

**Interfaces:**
- Consumes: enriched `GWP.products`, existing initial scope sources, `GWP.collections`.
- Produces: `GWP.gwpOpenScopeDialog(cb, initial, 'product')` with a two-column filter and product list UI.

- [x] **Step 1: Preserve the collection picker**

Keep the existing collection search/list dialog unchanged when `lockedType === 'collection'`.

- [x] **Step 2: Render the product filter layout**

Create a left filter panel for category, dynamic category attributes, collection, price range, and stock range. Create a right product table/list with product checkbox, image, name, SPU, category, price range, stock, and SKU count.

- [x] **Step 3: Implement combined filtering**

Apply keyword, category, every selected category attribute, collection, price overlap, and stock range in one `filteredProducts()` function.

- [x] **Step 4: Implement draft selection**

Use a local `Set` copied from initial values. Select-all toggles only filtered product IDs. Cancel and close discard the draft; confirm returns `{ type: 'product', id, name, spu }` records.

- [x] **Step 5: Add system-style CSS**

Add scoped styles for the wider dialog, two-column body, filter controls, product rows, responsive narrowing, and native checkbox alignment. Use only 16px, 14px, and 12px text sizes.

- [x] **Step 6: Run static validation**

Run:

```powershell
node --check admin/gift/js/gift_common.js
git diff --check
```

Expected: both commands exit with code `0`.

### Task 3: Verify Gift Rule Integration

**Files:**
- Verify: `admin/gift/gift_rule_form.html`
- Verify: `admin/gift/js/gift_rule_form.js`
- Verify: `admin/gift/js/gift_common.js`
- Verify: `admin/gift/css/gift.css`

**Interfaces:**
- Consumes: product sources returned by the picker.
- Produces: the existing selected-product card list and saved product scope rule.

- [x] **Step 1: Verify the browser flow**

Open the create gift rule page, change scope to `产品`, open the product picker, and confirm:

- category selection loads category attributes;
- multiple filters narrow the product list;
- search matches product name and SPU;
- no SKU-level control exists;
- selection persists across filters;
- confirm updates the selected product card list.

- [x] **Step 2: Verify cancellation**

Change draft selections, cancel the dialog, reopen it, and confirm the previously saved selection remains unchanged.

- [x] **Step 3: Run final checks**

Run:

```powershell
node --check admin/gift/js/gift_common.js
node --check admin/gift/js/gift_rule_form.js
git diff --check
```

Expected: all commands exit with code `0`.
