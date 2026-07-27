# Batch Inventory and Stock Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the global stock-link checkbox with selected-SKU batch controls and add a multi-warehouse batch inventory drawer that only updates manually managed SKUs.

**Architecture:** Keep the existing monolithic static prototype in `admin/product/add_product.html`. Reuse `skuData`, `skuWarehouses`, `warehouseStocks`, and the current row-selection model; add isolated drawer state and rendering helpers so batch inventory no longer shares the generic inline batch editor.

**Tech Stack:** HTML, CSS, vanilla JavaScript, existing Node static server, browser verification at `http://127.0.0.1:8080`.

## Global Constraints

- Remove the top-level stock-link checkbox; there must be no control that changes every SKU without row selection.
- Keep the per-row `库存联动` checkbox.
- Add one `批量库存联动` dropdown button with `开启库存联动` and `关闭库存联动`.
- Batch stock-link actions only affect selected SKU rows.
- New SKUs default to `stockLinked: false`.
- Batch inventory only affects selected SKUs where `stockLinked === false`.
- Mixed selections skip linked SKUs and show selected, editable, and skipped counts.
- Batch inventory supports selecting multiple warehouses and entering a different direct-set inventory value for each warehouse.
- Do not provide increase, decrease, sync, or stock-link actions inside the batch inventory drawer.
- Remove the obsolete inline warehouse selector and the duplicated `请选择` searchable-select wrapper.
- Do not add APIs, databases, authentication, permissions, or real inventory synchronization.

---

### Task 1: Replace Global Stock Link Control

**Files:**
- Modify: `admin/product/add_product.html:1840-1868`
- Modify: `admin/product/add_product.html:2350-2835`

**Interfaces:**
- Consumes: Existing `.sku-row-select`, `skuData`, `renderSkuTable()`, `setSkuStockLinked(key, checked)`.
- Produces: `toggleSkuStockLinkMenu()`, `closeSkuStockLinkMenu()`, `batchSetSkuStockLinked(checked)`.

- [x] **Step 1: Remove the global checkbox markup**

Delete the `stockLinkToggle` label from `#specFiltersRow`. Keep the specification filter buttons generated in that row.

- [x] **Step 2: Add selected-SKU batch stock-link menu**

Add this structure inside `#skuBulkActions`:

```html
<div class="sku-bulk-menu-wrap">
  <button
    class="btn btn-secondary btn-sm"
    type="button"
    id="btnBatchStockLink"
    disabled
    onclick="toggleSkuStockLinkMenu(event)"
  >
    批量库存联动
    <span aria-hidden="true">⌄</span>
  </button>
  <div class="sku-bulk-menu" id="skuStockLinkMenu" hidden>
    <button type="button" onclick="batchSetSkuStockLinked(true)">开启库存联动</button>
    <button type="button" onclick="batchSetSkuStockLinked(false)">关闭库存联动</button>
  </div>
</div>
```

- [x] **Step 3: Add menu styling**

Add scoped styles:

```css
.sku-bulk-menu-wrap {
  position: relative;
}

.sku-bulk-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  width: 148px;
  padding: 6px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
}

.sku-bulk-menu[hidden] {
  display: none;
}

.sku-bulk-menu button {
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.sku-bulk-menu button:hover {
  background: hsl(var(--muted));
}
```

- [x] **Step 4: Default new and legacy SKU objects to manual inventory**

Remove `stockLinkEnabled`. Normalize missing values and new objects with:

```js
if (typeof item.stockLinked !== 'boolean') {
  item.stockLinked = false;
}
```

```js
stockLinked: false,
```

Remove `syncStockLinkMasterState()` and `setAllSkuStockLinked()`, including all calls.

- [x] **Step 5: Implement selected-row batch linkage**

Add:

```js
function toggleSkuStockLinkMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('skuStockLinkMenu');
  if (!menu) return;
  menu.hidden = !menu.hidden;
}

function closeSkuStockLinkMenu() {
  const menu = document.getElementById('skuStockLinkMenu');
  if (menu) menu.hidden = true;
}

function batchSetSkuStockLinked(checked) {
  const keys = getCheckedSkuKeys();
  if (keys.length === 0) return;
  skuData.forEach(item => {
    if (keys.includes(item.key)) item.stockLinked = checked;
  });
  closeSkuStockLinkMenu();
  renderSkuTable();
  showToast('success', checked
    ? `已为 ${keys.length} 个 SKU 开启库存联动`
    : `已为 ${keys.length} 个 SKU 关闭库存联动`
  );
}
```

Close the menu from the existing document click handler or a dedicated document listener.

- [x] **Step 6: Update bulk-button state**

In `skuUpdateBulkBar()`:

```js
document.getElementById('btnBatchStockLink').disabled = count === 0;
document.getElementById('btnBatchStock').disabled = count === 0 || !hasEditableStock;
```

Expected:

```text
No selected rows: both buttons disabled
Selected linked rows only: stock-link enabled, batch inventory disabled
At least one selected manual row: both buttons enabled
```

---

### Task 2: Add Multi-Warehouse Batch Inventory Drawer

**Files:**
- Modify: `admin/product/add_product.html:1200-1550`
- Modify: `admin/product/add_product.html:1850-1900`

**Interfaces:**
- Consumes: `skuWarehouses`, selected row keys, existing design tokens.
- Produces: `#batchInventoryOverlay`, `#batchInventoryDrawer`, `#batchInventoryWarehouseList`, `#batchInventorySettings`.

- [x] **Step 1: Remove obsolete inline stock selector**

Delete:

```html
<select class="form-select" id="skuBulkWarehouseSelect" ...></select>
```

Keep `#skuBulkInlineEdit` for name, inventory code, purchase base, and price only.

- [x] **Step 2: Add drawer markup**

Append after the SKU section:

```html
<div class="sku-batch-drawer-overlay" id="batchInventoryOverlay" hidden>
  <aside class="sku-batch-drawer" id="batchInventoryDrawer" role="dialog" aria-modal="true" aria-labelledby="batchInventoryTitle">
    <header class="sku-batch-drawer-header">
      <div>
        <h3 id="batchInventoryTitle">批量设置仓库库存</h3>
        <div class="sku-batch-summary" id="batchInventorySummary"></div>
      </div>
      <button type="button" class="sku-batch-close" onclick="requestCloseBatchInventoryDrawer()" aria-label="关闭">×</button>
    </header>
    <div class="sku-batch-notice" id="batchInventoryNotice"></div>
    <div class="sku-batch-drawer-body">
      <section class="sku-batch-warehouse-panel">
        <label for="batchInventoryWarehouseSearch">选择目标仓库</label>
        <input id="batchInventoryWarehouseSearch" type="search" placeholder="搜索仓库名称" oninput="renderBatchInventoryWarehouseList()" />
        <div id="batchInventoryWarehouseList"></div>
      </section>
      <section class="sku-batch-settings-panel">
        <div class="sku-batch-settings-title">分别设置库存数</div>
        <div id="batchInventorySettings"></div>
        <div id="batchInventoryPreview"></div>
      </section>
    </div>
    <footer class="sku-batch-drawer-footer">
      <span id="batchInventoryValidation"></span>
      <div>
        <button type="button" class="btn btn-secondary" onclick="requestCloseBatchInventoryDrawer()">取消</button>
        <button type="button" class="btn btn-primary" id="confirmBatchInventoryButton" onclick="confirmBatchInventory()" disabled>确认更新</button>
      </div>
    </footer>
  </aside>
</div>
```

- [x] **Step 3: Add drawer layout styles**

Implement:

```css
.sku-batch-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.24);
}

.sku-batch-drawer-overlay[hidden] {
  display: none;
}

.sku-batch-drawer {
  width: min(760px, calc(100vw - 32px));
  height: 100%;
  display: flex;
  flex-direction: column;
  background: hsl(var(--background));
  box-shadow: -18px 0 42px rgba(15, 23, 42, 0.16);
}

.sku-batch-drawer-body {
  min-height: 0;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  flex: 1;
}
```

Add scrollable warehouse list, selected warehouse setting rows, summary pills, validation messages, and a mobile fallback to one column below 760px.

---

### Task 3: Implement Drawer State and Direct-Set Inventory

**Files:**
- Modify: `admin/product/add_product.html:2670-2785`

**Interfaces:**
- Consumes: `getCheckedSkuKeys()`, `isSkuStockLinked(item)`, `normalizeWarehouseStocks(item)`, `getSkuStockTotal(item)`.
- Produces: `batchInventoryState`, `openBatchInventoryDrawer()`, `toggleBatchInventoryWarehouse(id)`, `updateBatchInventoryValue(id, value)`, `confirmBatchInventory()`.

- [x] **Step 1: Add isolated drawer state**

```js
const batchInventoryState = {
  selectedSkuKeys: [],
  editableSkuKeys: [],
  skippedSkuKeys: [],
  selectedWarehouseIds: [],
  warehouseValues: {},
  dirty: false,
};
```

- [x] **Step 2: Open the drawer from `batchSkuStock()`**

Replace the generic inline editor call with:

```js
function batchSkuStock() {
  openBatchInventoryDrawer();
}
```

`openBatchInventoryDrawer()` must:

```js
const selectedSkuKeys = getCheckedSkuKeys();
const editableSkuKeys = selectedSkuKeys.filter(key => {
  const item = skuData.find(sku => sku.key === key);
  return item && !isSkuStockLinked(item);
});
const skippedSkuKeys = selectedSkuKeys.filter(key => !editableSkuKeys.includes(key));
```

If `editableSkuKeys.length === 0`, show the existing informational toast and return.

- [x] **Step 3: Render searchable multi-select warehouses**

`renderBatchInventoryWarehouseList()` filters by `#batchInventoryWarehouseSearch.value` and renders one checkbox row per warehouse:

```html
<label class="sku-batch-warehouse-option">
  <input type="checkbox" onchange="toggleBatchInventoryWarehouse('us-west')" />
  <span>美国西仓</span>
</label>
```

Selection adds/removes warehouse IDs while preserving entered values for still-selected warehouses.

- [x] **Step 4: Render one direct-set input per selected warehouse**

`renderBatchInventorySettings()` renders:

```html
<div class="sku-batch-setting-row">
  <div>
    <strong>美国西仓</strong>
    <span>应用到 5 个手动库存 SKU</span>
  </div>
  <input
    type="number"
    min="0"
    step="1"
    aria-label="美国西仓库存"
    oninput="updateBatchInventoryValue('us-west', this.value)"
  />
  <button type="button" onclick="toggleBatchInventoryWarehouse('us-west')" aria-label="移除美国西仓">×</button>
</div>
```

- [x] **Step 5: Validate and preview the update scope**

The form is valid only when:

```js
selectedWarehouseIds.length > 0
selectedWarehouseIds.every(id => {
  const value = warehouseValues[id];
  return value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0;
})
```

The preview and button copy must use:

```js
const updateCount = editableSkuKeys.length * selectedWarehouseIds.length;
```

```text
5 个 SKU × 3 个仓库，共更新 15 项库存
确认更新 15 项库存
```

- [x] **Step 6: Apply direct-set values**

`confirmBatchInventory()`:

```js
batchInventoryState.editableSkuKeys.forEach(key => {
  const item = skuData.find(sku => sku.key === key);
  if (!item || isSkuStockLinked(item)) return;
  const stocks = normalizeWarehouseStocks(item);
  batchInventoryState.selectedWarehouseIds.forEach(warehouseId => {
    stocks[warehouseId] = Number(batchInventoryState.warehouseValues[warehouseId]);
  });
  item.stock = getSkuStockTotal(item);
});
```

Then close the drawer, render the SKU table, and show:

```text
已更新 5 个 SKU、3 个仓库，共 15 项库存
```

- [x] **Step 7: Handle close and keyboard behavior**

- Clicking the overlay outside the drawer closes it.
- `Escape` calls `requestCloseBatchInventoryDrawer()`.
- If `dirty === true`, ask for confirmation before discarding unsaved values.
- Closing returns focus to `#btnBatchStock`.

---

### Task 4: Verification and Documentation

**Files:**
- Modify: `zz-changelog/2026-07-27.md`
- Modify: `docs/superpowers/plans/2026-07-27-batch-inventory-and-stock-link-implementation.md`

**Interfaces:**
- Consumes: Completed UI implementation.
- Produces: Browser evidence and synchronized change record.

- [x] **Step 1: Run structural checks**

Run an inline JavaScript parse check:

```powershell
$html = Get-Content -LiteralPath 'admin/product/add_product.html' -Raw -Encoding UTF8
```

Parse each inline script with Node `new Function(...)`.

Expected:

```text
INLINE_SCRIPT_SYNTAX=OK
```

Run:

```powershell
git diff --check
```

Expected: exit code `0`.

- [x] **Step 2: Verify stock-link batch behavior in browser**

At `http://127.0.0.1:8080/admin/product/add_product.html` confirm:

```text
No global stock-link checkbox
New SKU stock-link checkboxes unchecked
No selected rows -> batch stock-link disabled
Select two rows -> batch stock-link enabled
Batch enable -> only those two rows become linked/read-only
Batch disable -> only those two rows become manual/editable
```

- [x] **Step 3: Verify batch inventory drawer**

Confirm:

```text
Selected linked rows only -> batch inventory disabled
Mixed selection -> drawer shows editable and skipped counts
No duplicated "请选择" control
Warehouse search filters the warehouse list
Multiple warehouses can be selected
Each selected warehouse accepts a different non-negative integer
Preview count equals editable SKU count × selected warehouse count
Confirm updates only manual SKUs
Linked SKUs remain unchanged
Affected SKU totals recalculate immediately
```

- [x] **Step 4: Inspect browser logs**

Run browser console inspection.

Expected:

```text
No error or warning entries caused by the page
```

- [x] **Step 5: Update the changelog**

Append:

```markdown
## 添加产品页：批量库存与库存联动修正

- 删除顶部全局库存联动勾选项，改为只作用于已选 SKU 的批量库存联动菜单。
- 新生成 SKU 默认关闭库存联动。
- 批量库存改为右侧抽屉，支持多选仓库并分别直接设置库存数。
- 联动 SKU 自动跳过，且不再出现无意义的重复“请选择”控件。
```

- [x] **Step 6: Mark this plan complete**

Replace all task checkboxes with `[x]` after verification passes.
