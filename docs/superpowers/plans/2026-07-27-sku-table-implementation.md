# SKU Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the add-product SKU table for a 716px card viewport with grouped headers, limited frozen columns, dynamic warehouse inventory, SKU-level stock linking, and out-of-stock selling controls.

**Architecture:** Keep the existing monolithic static prototype and its current SKU generation flow. Add small data helpers and state synchronizers inside `admin/product/add_product.html`, then render warehouse columns from a local warehouse definition array. Preserve the outer page layout and make only the SKU table viewport horizontally scrollable.

**Tech Stack:** HTML, CSS, vanilla JavaScript, existing Node static server, browser verification at `http://127.0.0.1:8080`.

## Global Constraints

- Keep the existing 1100px content container, 760px SKU card, and approximately 716px table viewport.
- Do not expand the page to browser width.
- Freeze only the row selector, image, and English SKU name columns.
- Use four grouped headers: `SKU 识别`, `销售设置`, `库存配置`, `仓库库存`.
- New SKUs default to `continueSellingWhenOutOfStock: false`.
- New SKUs inherit the current master stock-link default, initially enabled.
- Support mixed SKU stock-link states and a master indeterminate state.
- Warehouse inventory is mock frontend data only; do not add APIs, databases, authentication, or permissions.
- Do not modify the edit-product page in this implementation.
- Do not create Git commits.

---

### Task 1: SKU Data Model and Warehouse Helpers

**Files:**
- Modify: `admin/product/add_product.html:2146`

**Interfaces:**
- Consumes: Existing `specsData`, `skuData`, `stockLinkEnabled`, and `renderSkuTable()`.
- Produces: `skuWarehouses`, `getSkuStockTotal(item)`, `isSkuStockLinked(item)`, `syncStockLinkMasterState()`, and SKU fields `continueSellingWhenOutOfStock`, `stockLinked`, `warehouseStocks`.

- [x] **Step 1: Add local warehouse definitions**

Add a stable mock warehouse list before `let skuData = []`:

```js
const skuWarehouses = [
  { id: 'us-west', name: '美国西仓' },
  { id: 'us-east', name: '美国东仓' },
  { id: 'uk', name: '英国仓' },
  { id: 'de', name: '德国仓' },
  { id: 'ca', name: '加拿大仓' },
  { id: 'au', name: '澳洲仓' }
];
```

- [x] **Step 2: Add SKU inventory helpers**

Add helpers that normalize old SKU objects and compute totals:

```js
function isSkuStockLinked(item) {
  return item.stockLinked !== false;
}

function normalizeWarehouseStocks(item) {
  const existing = item.warehouseStocks || {};
  item.warehouseStocks = Object.fromEntries(
    skuWarehouses.map(warehouse => [
      warehouse.id,
      Number(existing[warehouse.id] ?? 0)
    ])
  );
  return item.warehouseStocks;
}

function getSkuStockTotal(item) {
  return Object.values(normalizeWarehouseStocks(item))
    .reduce((total, value) => total + (Number(value) || 0), 0);
}
```

- [x] **Step 3: Extend newly generated SKU data**

Update the fallback object inside `renderSkuTable()`:

```js
return existing || {
  key,
  name,
  specs: combo,
  code: `HG-${idx.toString().padStart(2, '0')}-BW22`,
  stock: 0,
  invCode: '',
  qty: 1,
  price: basePrice,
  continueSellingWhenOutOfStock: false,
  stockLinked: stockLinkEnabled,
  warehouseStocks: Object.fromEntries(
    skuWarehouses.map(warehouse => [warehouse.id, 0])
  )
};
```

- [x] **Step 4: Verify data preservation manually**

Open the page, add and remove a specification value, and confirm that an unchanged SKU key retains:

```text
name
price
continueSellingWhenOutOfStock
stockLinked
warehouseStocks
```

Expected: Existing matching SKU objects are reused instead of reset.

---

### Task 2: Grouped Header and 716px Scroll Layout

**Files:**
- Modify: `admin/product/add_product.html:1284`
- Modify: `admin/product/add_product.html:1678`

**Interfaces:**
- Consumes: `skuWarehouses` from Task 1.
- Produces: `.sku-table-scroll`, sticky column classes, `#skuColumnHeaderRow`, and the four grouped header regions.

- [x] **Step 1: Make the card contain an internal horizontal viewport**

Replace inline overflow ownership with explicit classes:

```html
<div class="table-card sku-table-card">
  <div class="table-wrapper sku-table-scroll">
    <table class="sku-table">
```

Add CSS:

```css
.sku-table-card {
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.sku-table-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

.sku-table {
  width: max-content;
  min-width: 1320px;
  table-layout: fixed;
}
```

- [x] **Step 2: Add four grouped headers**

Replace the single header row with:

```html
<thead>
  <tr class="sku-group-header">
    <th class="sku-col-select sku-sticky-select" rowspan="2">
      <div class="checkbox" onclick="toggleAllSkuCheckboxes(this)"></div>
    </th>
    <th class="sku-group sku-group-identity" colspan="2">SKU 识别</th>
    <th class="sku-group" colspan="2">销售设置</th>
    <th class="sku-group" colspan="4">库存配置</th>
    <th class="sku-group" id="skuWarehouseGroupHeader" colspan="6">仓库库存</th>
  </tr>
  <tr id="skuColumnHeaderRow">
    <th class="sku-col-image sku-sticky-image">图片</th>
    <th class="sku-col-name sku-sticky-name">SKU 名称（英语）</th>
    <th class="sku-col-price">价格（美元）</th>
    <th class="sku-col-continue">断货继续销售</th>
    <th class="sku-col-code">库存 SKU 编码</th>
    <th class="sku-col-linked">库存联动</th>
    <th class="sku-col-base">购买基数</th>
    <th class="sku-col-total">可售合计</th>
  </tr>
</thead>
```

Generate actual warehouse `<th>` elements in JavaScript:

```js
function renderWarehouseHeaders() {
  const secondRow = document.getElementById('skuColumnHeaderRow');
  secondRow.querySelectorAll('[data-warehouse-header]').forEach(cell => cell.remove());
  skuWarehouses.forEach(warehouse => {
    const th = document.createElement('th');
    th.className = 'sku-col-warehouse';
    th.dataset.warehouseHeader = warehouse.id;
    th.textContent = warehouse.name;
    secondRow.appendChild(th);
  });
  document.getElementById('skuWarehouseGroupHeader').colSpan = skuWarehouses.length;
}
```

- [x] **Step 3: Add exact column widths and sticky offsets**

Use compact widths aligned to the approved design:

```css
.sku-col-select { width: 40px; min-width: 40px; }
.sku-col-image { width: 64px; min-width: 64px; }
.sku-col-name { width: 176px; min-width: 176px; }
.sku-col-price { width: 112px; min-width: 112px; }
.sku-col-continue { width: 104px; min-width: 104px; text-align: center; }
.sku-col-code { width: 168px; min-width: 168px; }
.sku-col-linked { width: 88px; min-width: 88px; text-align: center; }
.sku-col-base { width: 96px; min-width: 96px; }
.sku-col-total { width: 96px; min-width: 96px; }
.sku-col-warehouse { width: 112px; min-width: 112px; text-align: right; }

.sku-sticky-select { position: sticky; left: 0; z-index: 5; }
.sku-group-identity {
  position: sticky;
  left: 40px;
  z-index: 5;
  box-shadow: 8px 0 12px rgba(15, 23, 42, 0.06);
}
.sku-sticky-image { position: sticky; left: 40px; z-index: 4; }
.sku-sticky-name {
  position: sticky;
  left: 104px;
  z-index: 4;
  box-shadow: 8px 0 12px rgba(15, 23, 42, 0.06);
}
```

Apply the sticky classes to the corresponding body cells so only the selector, image, and name remain visible during horizontal scrolling.

- [x] **Step 4: Verify page containment**

Run the existing server and inspect the page at a desktop viewport.

Expected:

```text
SKU card width: approximately 760px
Table viewport width: approximately 716px
Table scrollWidth: greater than table clientWidth
Page document scrollWidth: equals page document clientWidth
```

---

### Task 3: Row Rendering and SKU-Level Controls

**Files:**
- Modify: `admin/product/add_product.html:2203`
- Modify: `admin/product/add_product.html:2225`

**Interfaces:**
- Consumes: Helpers and warehouse definitions from Task 1; column classes from Task 2.
- Produces: `setSkuContinueSelling(key, checked)`, `setSkuStockLinked(key, checked)`, `updateSkuWarehouseStock(key, warehouseId, value)`.

- [x] **Step 1: Render columns in the confirmed order**

Render each row in this order:

```text
selector
image
English SKU name
USD price
continue selling when out of stock
inventory SKU code
SKU stock linking
purchase base
sellable total
one cell per warehouse
```

Use native checkbox inputs with explicit accessible labels:

```html
<input
  class="sku-inline-checkbox"
  type="checkbox"
  aria-label="断货时继续销售"
  onchange="setSkuContinueSelling('${item.key}', this.checked)"
  ${item.continueSellingWhenOutOfStock ? 'checked' : ''}
/>
```

```html
<input
  class="sku-inline-checkbox"
  type="checkbox"
  aria-label="启用库存联动"
  onchange="setSkuStockLinked('${item.key}', this.checked)"
  ${isSkuStockLinked(item) ? 'checked' : ''}
/>
```

- [x] **Step 2: Render warehouse cells by row link state**

For linked SKUs render a read-only numeric value:

```html
<span class="sku-stock-readonly">${stockValue}</span>
```

For unlinked SKUs render a number input:

```html
<input
  class="sku-warehouse-stock-input"
  type="number"
  min="0"
  value="${stockValue}"
  aria-label="${warehouse.name}库存"
  onchange="updateSkuWarehouseStock('${item.key}', '${warehouse.id}', this.value)"
/>
```

- [x] **Step 3: Add row update functions**

Add:

```js
function setSkuContinueSelling(key, checked) {
  const item = skuData.find(sku => sku.key === key);
  if (item) item.continueSellingWhenOutOfStock = checked;
}

function setSkuStockLinked(key, checked) {
  const item = skuData.find(sku => sku.key === key);
  if (!item) return;
  item.stockLinked = checked;
  renderSkuTable();
}

function updateSkuWarehouseStock(key, warehouseId, value) {
  const item = skuData.find(sku => sku.key === key);
  if (!item || isSkuStockLinked(item)) return;
  normalizeWarehouseStocks(item)[warehouseId] = Math.max(0, Number(value) || 0);
  item.stock = getSkuStockTotal(item);
  renderSkuTable();
}
```

- [x] **Step 4: Correct empty-state colspan**

Calculate the empty state colspan dynamically:

```js
const skuColumnCount = 9 + skuWarehouses.length;
tbody.innerHTML = `<tr><td colspan="${skuColumnCount}"><div class="sku-empty">请为所有规格添加选项值后生成 SKU</div></td></tr>`;
```

- [x] **Step 5: Verify mixed row behavior**

Use two SKU rows:

```text
Row A: stockLinked = true
Row B: stockLinked = false
```

Expected:

```text
Row A warehouse cells are read-only.
Row B warehouse cells are editable number inputs.
Changing Row B warehouse inventory updates only Row B total.
Both rows retain independent out-of-stock selling checkboxes.
```

---

### Task 4: Master Stock-Link State and Batch Actions

**Files:**
- Modify: `admin/product/add_product.html:1650`
- Modify: `admin/product/add_product.html:2250`
- Modify: `admin/product/add_product.html:2385`

**Interfaces:**
- Consumes: Per-SKU `stockLinked` and `continueSellingWhenOutOfStock` fields.
- Produces: `setAllSkuStockLinked(checked)`, `syncStockLinkMasterState()`, `batchSetSkuContinueSelling(checked)`, and warehouse-aware bulk stock editing.

- [x] **Step 1: Replace the old global-only stock toggle**

Use a native master checkbox:

```html
<label class="spec-link-toggle" for="stockLinkToggle">
  <input
    id="stockLinkToggle"
    type="checkbox"
    checked
    onchange="setAllSkuStockLinked(this.checked)"
  />
  <span>库存联动</span>
</label>
```

- [x] **Step 2: Synchronize checked and indeterminate states**

Add:

```js
function syncStockLinkMasterState() {
  const master = document.getElementById('stockLinkToggle');
  if (!master) return;
  const linkedCount = skuData.filter(isSkuStockLinked).length;
  master.checked = skuData.length === 0
    ? stockLinkEnabled
    : linkedCount === skuData.length;
  master.indeterminate = linkedCount > 0 && linkedCount < skuData.length;
}

function setAllSkuStockLinked(checked) {
  stockLinkEnabled = checked;
  skuData.forEach(item => {
    item.stockLinked = checked;
  });
  renderSkuTable();
}
```

Call `syncStockLinkMasterState()` after every `renderSkuTable()`.

- [x] **Step 3: Add batch continue-selling control**

Add two explicit bulk buttons:

```html
<button
  class="btn btn-secondary btn-sm"
  onclick="batchSetSkuContinueSelling(true)"
  disabled
  id="btnBatchContinueSellingOn"
>
  批量允许断货销售
</button>
<button
  class="btn btn-secondary btn-sm"
  onclick="batchSetSkuContinueSelling(false)"
  disabled
  id="btnBatchContinueSellingOff"
>
  批量停止断货销售
</button>
```

Update only checked SKU keys:

```js
function batchSetSkuContinueSelling(checked) {
  const keys = getCheckedSkuKeys();
  if (!keys.length) return;
  skuData.forEach(item => {
    if (keys.includes(item.key)) {
      item.continueSellingWhenOutOfStock = checked;
    }
  });
  renderSkuTable();
  showToast(
    'success',
    checked ? '已允许所选 SKU 断货继续销售' : '已设置所选 SKU 断货停止销售'
  );
}
```

- [x] **Step 4: Make bulk stock apply only to unlinked SKUs**

When `bulkEditField === 'stock'`, apply the value to a selected target warehouse and skip linked SKU rows:

```js
const editableItems = skuData.filter(item =>
  keys.includes(item.key) && !isSkuStockLinked(item)
);
```

Show a toast with both updated and skipped counts:

```text
已更新 3 条 SKU；跳过 2 条库存联动 SKU
```

- [x] **Step 5: Verify master and batch states**

Expected:

```text
All linked: master checked, indeterminate false.
All unlinked: master unchecked, indeterminate false.
Mixed: master unchecked, indeterminate true.
Master click applies the chosen state to every current SKU.
Newly generated SKU inherits stockLinkEnabled.
```

---

### Task 5: Documentation and Browser Verification

**Files:**
- Modify: `z-prd/商城后台/module2-产品管理.md`
- Create: `zz-changelog/2026-07-27.md`
- Verify: `admin/product/add_product.html`

**Interfaces:**
- Consumes: Completed SKU table implementation.
- Produces: Confirmed requirement documentation and evidence-backed verification.

- [x] **Step 1: Update the product-management PRD**

Update the SKU table column list to match:

```text
图片
SKU 名称（英语）
价格（美元）
断货继续销售
库存 SKU 编码
库存联动
购买基数
可售合计
动态仓库库存
```

Document:

```text
The master stock-link checkbox is a batch/default control.
Each SKU can independently enable or disable stock linking.
Only selector, image, and English SKU name are frozen.
The table scrolls horizontally inside the approximately 716px card viewport.
```

- [x] **Step 2: Record the confirmed change**

Create `zz-changelog/2026-07-27.md` with:

```markdown
# 2026-07-27

## 商城后台 / 添加产品 / SKU 列表

- SKU 表格前三个业务列调整为图片、SKU 名称（英语）、价格（美元）。
- 仅固定行选择框、图片和 SKU 名称，其他字段在表格内部横向滚动。
- 表头调整为 SKU 识别、销售设置、库存配置、仓库库存四组两级表头。
- 新增断货继续销售 SKU 级勾选项，新 SKU 默认关闭。
- 新增库存联动 SKU 级勾选项，顶部控件作为批量和默认控制并支持半选状态。
- 仓库库存支持动态列；联动 SKU 只读，非联动 SKU 可按仓库手动输入。
```

- [x] **Step 3: Run structural checks**

Inspect the rendered DOM and assert:

```text
Four first-level group headers exist.
Second-level column order matches the approved design.
Warehouse header count equals skuWarehouses.length.
Each SKU row has one continue-selling checkbox.
Each SKU row has one stock-link checkbox.
```

- [x] **Step 4: Run width and scroll checks**

Read DOM geometry:

```text
SKU table viewport clientWidth is approximately 716px.
SKU table scrollWidth is greater than clientWidth.
Document scrollWidth does not exceed document clientWidth.
Sticky selector left offset is 0.
Sticky image left offset is 40px.
Sticky name left offset is 104px.
```

- [x] **Step 5: Run interaction checks**

Verify:

```text
New SKU continue-selling checkbox is unchecked.
New SKU stock-link checkbox is checked.
Unchecking one SKU stock-link checkbox makes only that row editable.
Master stock-link checkbox becomes indeterminate.
Changing one warehouse input updates that row total.
Horizontal scrolling keeps selector, image, and name visible.
```

- [x] **Step 6: Inspect browser logs**

Expected:

```text
No new JavaScript errors.
No failed local asset requests.
Existing external font or analytics network limitations may be reported separately if present.
```
