# Gift Pool SKU Chevron Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the gift-pool SKU count information icon with the exact chevron used by the product list “所属系列” column, while preserving the existing SKU detail hover behavior.

**Architecture:** Keep the existing gift-pool cell renderer, CSS classes, event binding, and fixed-position detail popover. Change only the inline SVG markup rendered by the `skuCount` branch so the visual affordance matches the product list.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, inline SVG, Node.js one-off assertions, local browser preview.

## Global Constraints

- Use the product-list icon exactly: 12×12 SVG, `polyline points="6 9 12 15 18 9"`, 2px current-color stroke, round caps and joins.
- Preserve `.gwp-sku-icon`, `data-sku-id`, title, hover handlers, popover content, and popover positioning.
- Keep zero-count rows as plain `0` without an icon.
- Do not modify product data, SKU counting, filtering, pagination, or unrelated columns.

---

### Task 1: Match the gift-pool SKU icon to the product-list chevron

**Files:**
- Modify: `admin/gift/js/gift_list.js:87-96`
- Verify: `admin/product/product_list.html:188-202`
- Verify: `admin/common/js/commons.js:1317-1320`
- Browser test: `http://127.0.0.1:8080/admin/gift/gift.html`

**Interfaces:**
- Consumes: `cellHtml(tab, row, key)` and the existing `.gwp-sku-icon[data-sku-id]` hover contract.
- Produces: The same cell HTML contract with the product-list chevron SVG instead of the information-circle SVG.

- [x] **Step 1: Run the pre-change assertion and verify it fails**

```powershell
$source = Get-Content -Raw -Encoding UTF8 'admin/gift/js/gift_list.js'
if ($source -notmatch '<svg width="12" height="12"[^>]*><polyline points="6 9 12 15 18 9"/></svg>') {
  Write-Error 'FAIL: gift pool does not use the product-list chevron'
  exit 1
}
```

Expected: exit code 1 with `FAIL: gift pool does not use the product-list chevron`.

- [x] **Step 2: Replace only the inline SVG**

Replace:

```javascript
`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>` +
```

with:

```javascript
`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>` +
```

- [x] **Step 3: Run the post-change static assertions**

```powershell
$source = Get-Content -Raw -Encoding UTF8 'admin/gift/js/gift_list.js'
if ($source -notmatch '<svg width="12" height="12"[^>]*><polyline points="6 9 12 15 18 9"/></svg>') { throw 'chevron missing' }
if ($source -notmatch 'gwp-sku-icon" data-sku-id="\$\{esc\(row\.id\)\}" title="查看关联SKU"') { throw 'hover contract changed' }
if ($source -notmatch "if \(!total\) return '0';") { throw 'zero-count behavior changed' }
'PASS: chevron and behavior contracts are intact'
```

Expected: exit code 0 with `PASS: chevron and behavior contracts are intact`.

- [x] **Step 4: Verify the running page**

Open `http://127.0.0.1:8080/admin/gift/gift.html` and confirm:

1. A non-zero “关联SKU数” cell shows a small downward chevron after the number.
2. The chevron matches the product-list “所属系列” icon size and stroke.
3. Hovering the chevron still opens SKU details with image, name, number, and available stock.
4. Moving the pointer away closes the detail popover.
5. A zero-count row, if present, shows only `0`.
6. Browser console contains no new errors.

- [x] **Step 5: Review the focused diff**

```powershell
git diff --check
git diff -- admin/gift/js/gift_list.js
```

Expected: no whitespace errors and a one-line SVG replacement with no unrelated code changes.
