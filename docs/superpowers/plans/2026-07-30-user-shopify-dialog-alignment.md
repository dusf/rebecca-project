# User Shopify Dialog Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the user-management Shopify import dialog with the product-list Shopify pull dialog without changing import behavior or other user dialogs.

**Architecture:** Keep the existing parent-level dialog host and rendering state machine. Add a Shopify-only shell class and a dedicated Shopify step-indicator renderer so the product-style dimensions and progress visuals remain isolated from CSV, marketing, tag, and delete dialogs.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node assertion tests.

## Global Constraints

- Only `data-user-dialog="shopify"` receives the product-style shell.
- Desktop size is `720px` wide by fixed `660px` high, bounded by the viewport.
- Steps remain “选择店铺、选择用户、导入结果”.
- Existing OAuth explanation, store selection, customer filtering, import behavior, focus handling, and full-screen overlay remain unchanged.

---

### Task 1: Add Shopify-only markup and static contracts

**Files:**
- Modify: `admin/common/html/user_dialogs.html`
- Modify: `admin/common/js/user_dialog.js`
- Modify: `admin/user/tests/users_contract.test.js`

**Interfaces:**
- Consumes: existing `renderShopifyStep1/2/3()` state and labels.
- Produces: `shopifyStepsMarkup(labels, current)` with `.um-shopify-dialog-steps`, `.um-dialog-step-num`, and `.um-dialog-step-divider`.

- [ ] **Step 1: Add failing contracts**

Assert that the Shopify dialog has `um-dialog-shopify`, that `shopifyStepsMarkup` renders divider elements and completed checkmarks, and that all Shopify steps call this renderer.

- [ ] **Step 2: Run the contract test**

Run: `node admin/user/tests/users_contract.test.js`

Expected: FAIL because the Shopify-only class and renderer do not exist.

- [ ] **Step 3: Implement isolated markup**

Add `um-dialog-shopify` to the Shopify section. Add:

```js
function shopifyStepsMarkup(labels, current) {
  return '<div class="um-dialog-steps um-shopify-dialog-steps">' +
    labels.map(function (label, index) {
      var step = index + 1;
      var className = step === current ? ' is-active' : (step < current ? ' is-complete' : '');
      var divider = index < labels.length - 1
        ? '<span class="um-dialog-step-divider' + (step < current ? ' is-complete' : '') + '"></span>'
        : '';
      return '<div class="um-dialog-step' + className + '">' +
        '<span class="um-dialog-step-num">' + (step < current ? '✓' : step) + '</span>' +
        '<span class="um-dialog-step-label">' + escapeHtml(label) + '</span></div>' + divider;
    }).join('') + '</div>';
}
```

Replace the three Shopify `stepsMarkup(...)` calls with `shopifyStepsMarkup(...)`.

- [ ] **Step 4: Run the contract test**

Run: `node admin/user/tests/users_contract.test.js`

Expected: PASS.

### Task 2: Match product dialog shell and progress styling

**Files:**
- Modify: `admin/common/css/user_dialogs.css`
- Modify: `admin/index.html`
- Modify: `admin/common/js/user_dialog.js`
- Test: `admin/user/tests/users_contract.test.js`

**Interfaces:**
- Consumes: `.um-dialog-shopify` and `.um-shopify-dialog-steps` from Task 1.
- Produces: Shopify-only `720px × 660px` shell, product-style title spacing, progress line, compact footer, and responsive sizing.

- [ ] **Step 1: Add failing CSS contracts**

Assert scoped width/height, header/body/footer padding, horizontal progress layout, `26px` step circles, green completed state, and the `600px` responsive rules.

- [ ] **Step 2: Run the contract test**

Run: `node admin/user/tests/users_contract.test.js`

Expected: FAIL because the scoped product-style rules do not exist.

- [ ] **Step 3: Implement scoped CSS**

Add Shopify-only rules equivalent to the product dialog:

```css
.um-dialog-shopify {
  width: min(720px, 94vw);
  height: min(660px, calc(100vh - 48px));
  padding: 24px 24px 16px;
  border: 0;
  background: hsl(var(--card));
  box-shadow: 0 16px 40px rgb(0 0 0 / 20%);
}
```

Scope the header to `padding: 0 0 16px` without a divider, body to `padding: 0`, footer to `padding: 16px 0 0` without background/divider, and style the progress strip with centered flex layout, top/bottom borders, `26px` circles, `40px` connectors, theme-color active state, and green completed state.

- [ ] **Step 4: Bump assets and run all checks**

Update dialog CSS, JS, and fetched HTML query versions from `v=9` to `v=10`.

Run:

```powershell
node --check admin/common/js/user_dialog.js
Get-ChildItem admin/user/tests/*.test.js | ForEach-Object { node $_.FullName }
git diff --check
```

Expected: syntax succeeds, all five test files pass, and diff check reports no errors.

- [ ] **Step 5: Verify preview resources**

Request `http://127.0.0.1:8080/admin/index.html`, `user_dialogs.css?v=10`, and `user_dialog.js?v=10`.

Expected: HTTP 200 and the served assets contain the Shopify-only class, `720px` width, `660px` height, and product-style step markup.
