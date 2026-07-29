# User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete storefront-admin user management module with a unified user list, add/edit drill-down pages, parent-hosted CSV and Shopify import dialogs, clear operator guidance, and working mock interactions.

**Architecture:** Keep the existing static HTML/CSS/JavaScript iframe architecture. A focused `UserStore` module owns normalized-email identity, sample data, CRUD, consent history, import merging, and local persistence; the list and form pages consume that API independently. All modal workflows render in the parent `admin/index.html` `dialogHost` so their overlays cover the sidebar, header, and active iframe.

**Tech Stack:** Static HTML5, CSS custom properties, browser JavaScript, localStorage, Node.js built-in `assert` for data-layer tests, existing admin iframe router and shared styles.

## Global Constraints

- One normalized email maps to one user profile.
- Registration state and email-marketing state remain independent.
- Manual, CSV, and Shopify-created profiles default to `pending` and never receive fabricated credentials.
- A verified first login upgrades the existing profile instead of creating a duplicate.
- Shopify imports never claim to migrate passwords, social identities, or sessions.
- Marketing opt-in is off by default; switching to subscribed requires consent source and consent time.
- User information is the fixed left unique column; operations are fixed right.
- Every dropdown has real values, input search, selected feedback, empty results, and keyboard support.
- Browser-native select, checkbox, radio, switch, and date controls are not shown to the operator.
- Text controls use the current system visual language and a consistent 40px control height.
- Every modal overlay covers the complete admin viewport.
- Key decisions include adjacent guidance copy.
- Lists, forms, and dialogs contain meaningful sample or mock data.
- Loading, empty, filtered-empty, error, disabled, and success states are visible and testable.
- Only files required for user management and its router/dialog integration are changed.

---

## File Structure

### New files

- `admin/user/users.html` — user-list page shell and semantic markup.
- `admin/user/user_form.html` — shared add/edit drill-down page shell.
- `admin/user/css/users.css` — list, form, custom-control, state, responsive, and frozen-column styles.
- `admin/user/js/user_store.js` — sample records, normalized identity, CRUD, consent, import merge, and persistence.
- `admin/user/js/user_components.js` — searchable combobox, custom date picker, switch, tooltip, and focus helpers.
- `admin/user/js/users.js` — list views, filters, sorting, selection, pagination, columns, menus, and dialog hooks.
- `admin/user/js/user_form.js` — add/edit routing, validation, duplicate-email handling, save, and status management.
- `admin/user/tests/user_store.test.js` — Node-based data-model regression tests.
- `admin/common/html/user_dialogs.html` — parent-hosted CSV, Shopify, consent, delete, and result dialog markup.
- `admin/common/css/user_dialogs.css` — complete-viewport overlay and user workflow dialog styles.
- `admin/common/js/user_dialog.js` — parent dialog manager and active-iframe hook bridge.
- `zz-changelog/2026-07-29.md` — implementation and verification record.

### Modified files

- `admin/index.html` — user routes, breadcrumbs, parent dialog stylesheet, and parent dialog script.

## Stable Interfaces

`window.UserStore`:

```js
list(): UserRecord[]
get(id: string): UserRecord | null
findByEmail(email: string): UserRecord | null
createManual(payload: ManualUserInput): { ok: boolean, user?: UserRecord, existing?: UserRecord, error?: string }
update(id: string, payload: Partial<UserRecord>): { ok: boolean, user?: UserRecord, error?: string }
remove(id: string): { ok: boolean, error?: string }
setAccountStatus(ids: string[], status: 'active' | 'pending' | 'disabled'): UserRecord[]
setMarketingStatus(ids: string[], status: MarketingStatus, consent?: ConsentInput): { ok: boolean, users?: UserRecord[], error?: string }
importProfiles(records: ImportRecord[], source: 'shopify_api' | 'shopify_csv'): ImportResult
activateByEmail(email: string, provider: AuthProvider): { ok: boolean, user?: UserRecord, error?: string }
subscribe(listener: (users: UserRecord[]) => void): () => void
resetForTests(records?: UserRecord[]): void
```

`window.UserComponents`:

```js
mount(root?: ParentNode): void
setComboboxValue(id: string, value: string): void
getComboboxValue(id: string): string
setDateValue(id: string, isoDate: string): void
getDateValue(id: string): string
announce(message: string): void
```

Active iframe bridge:

```js
window.UserPageHooks = {
  getUsers(): UserRecord[],
  getSelectedIds(): string[],
  importUsers(records: ImportRecord[], source: ImportSource): ImportResult,
  updateMarketing(ids: string[], status: MarketingStatus, consent: ConsentInput): Result,
  removeUsers(ids: string[]): Result,
  onDialogComplete(result: Result): void
}
```

Parent API:

```js
window.UserDialogs.openCsvImport()
window.UserDialogs.openShopifyImport()
window.UserDialogs.openMarketingConsent(options)
window.UserDialogs.openDeleteConfirm(options)
window.UserDialogs.close()
```

---

### Task 1: User identity, persistence, sample data, and tests

**Files:**
- Create: `admin/user/js/user_store.js`
- Create: `admin/user/tests/user_store.test.js`

**Interfaces:**
- Produces the `window.UserStore` interface defined above except `activateByEmail`, which Task 4 adds with its own failing test.
- Consumes browser `localStorage` when available and an in-memory adapter under Node.

- [ ] **Step 1: Write failing identity and state tests**

Create `admin/user/tests/user_store.test.js` with Node `assert` cases for normalized lookup, manual pending creation, duplicate prevention, consent validation, and Shopify merge:

```js
const assert = require('node:assert/strict');
const UserStore = require('../js/user_store.js');

UserStore.resetForTests([]);

const created = UserStore.createManual({
  email: '  Buyer@Example.COM ',
  firstName: 'Amy',
  lastName: 'Lee',
  marketingOptIn: false
});
assert.equal(created.ok, true);
assert.equal(created.user.email, 'buyer@example.com');
assert.equal(created.user.accountStatus, 'pending');
assert.equal(created.user.source, 'admin');

const duplicate = UserStore.createManual({
  email: 'buyer@example.com',
  firstName: 'Duplicate',
  marketingOptIn: false
});
assert.equal(duplicate.ok, false);
assert.equal(duplicate.existing.id, created.user.id);

const missingConsent = UserStore.setMarketingStatus(
  [created.user.id],
  'subscribed',
  { source: '', consentedAt: '' }
);
assert.equal(missingConsent.ok, false);

const consented = UserStore.setMarketingStatus(
  [created.user.id],
  'subscribed',
  { source: 'customer_service', consentedAt: '2026-07-29T09:30:00+08:00', note: '电话确认' }
);
assert.equal(consented.ok, true);
assert.equal(UserStore.get(created.user.id).marketingStatus, 'subscribed');

const imported = UserStore.importProfiles([
  {
    externalId: 'gid://shopify/Customer/1001',
    email: 'BUYER@example.com',
    firstName: 'Amy',
    lastName: 'Lee',
    marketingStatus: 'unsubscribed',
    store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
  },
  {
    externalId: 'gid://shopify/Customer/1002',
    email: 'new@example.com',
    firstName: 'New',
    lastName: 'Buyer',
    marketingStatus: 'not_subscribed',
    store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
  }
], 'shopify_api');
assert.deepEqual(imported.counts, { created: 1, merged: 1, skipped: 0, failed: 0 });
assert.equal(UserStore.list().length, 2);
assert.equal(UserStore.findByEmail('new@example.com').accountStatus, 'pending');

console.log('user_store tests passed');
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run:

```powershell
node admin/user/tests/user_store.test.js
```

Expected: failure containing `Cannot find module '../js/user_store.js'`.

- [ ] **Step 3: Implement the store and sample records**

Create `admin/user/js/user_store.js` as a UMD module. Use `rebecca_users_v1` for persistence, normalize email with `trim().toLowerCase()`, seed at least twelve records covering all design states, and implement the stable interface.

Core identity and creation behavior:

```js
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.UserStore = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const STORAGE_KEY = 'rebecca_users_v1';
  let memory = [];
  const listeners = new Set();

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function findByEmail(email) {
    const normalized = normalizeEmail(email);
    return list().find((user) => user.email === normalized) || null;
  }

  function createManual(payload) {
    const email = normalizeEmail(payload.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: '请输入有效邮箱地址' };
    }
    const existing = findByEmail(email);
    if (existing) return { ok: false, existing, error: '该邮箱已经存在用户档案' };
    if (payload.marketingOptIn && (!payload.consent || !payload.consent.source || !payload.consent.consentedAt)) {
      return { ok: false, error: '标记为已订阅时必须填写同意来源和同意时间' };
    }
    const user = buildUser({
      email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      preferredLanguage: payload.preferredLanguage,
      tags: payload.tags,
      note: payload.note,
      accountStatus: 'pending',
      marketingStatus: payload.marketingOptIn ? 'subscribed' : 'not_subscribed',
      authProviders: [],
      source: 'admin',
      consentHistory: payload.marketingOptIn ? [{
        status: 'subscribed',
        source: payload.consent.source,
        consentedAt: payload.consent.consentedAt,
        note: payload.consent.note || ''
      }] : []
    });
    write(list().concat(user));
    return { ok: true, user };
  }

  return {
    list,
    get,
    findByEmail,
    createManual,
    update,
    remove,
    setAccountStatus,
    setMarketingStatus,
    importProfiles,
    subscribe,
    resetForTests
  };
});
```

Seed records must include registered/subscribed, registered/unsubscribed, subscription-only pending, API-import pending, CSV-import unsubscribed, multi-store, multi-provider, disabled, zero-order, and high-value customers.

- [ ] **Step 4: Run store tests and JavaScript syntax check**

Run:

```powershell
node admin/user/tests/user_store.test.js
node --check admin/user/js/user_store.js
```

Expected:

```text
user_store tests passed
```

and no syntax-check output.

- [ ] **Step 5: Commit the data layer**

```powershell
git add -- admin/user/js/user_store.js admin/user/tests/user_store.test.js
git commit -m "feat: add unified user data store"
```

---

### Task 2: User routes, page shells, and custom controls

**Files:**
- Modify: `admin/index.html`
- Create: `admin/user/users.html`
- Create: `admin/user/user_form.html`
- Create: `admin/user/css/users.css`
- Create: `admin/user/js/user_components.js`

**Interfaces:**
- Consumes `PAGE_CONFIG`, `BREADCRUMB_CONFIG`, `loadAdminPage`, shared design tokens, and `UserStore`.
- Produces list/form DOM IDs consumed by Tasks 3 and 4 plus `window.UserComponents`.

- [ ] **Step 1: Add failing static route assertions**

Run before changing `admin/index.html`:

```powershell
$html = [System.IO.File]::ReadAllText((Resolve-Path 'admin/index.html'), [System.Text.Encoding]::UTF8)
if ($html -notmatch \"'users':\\s*'user/users.html'\") { throw 'users route missing' }
if ($html -notmatch \"'user-add':\\s*'user/user_form.html\\?mode=add'\") { throw 'user-add route missing' }
if ($html -notmatch \"'user-edit':\\s*'user/user_form.html\\?mode=edit'\") { throw 'user-edit route missing' }
```

Expected: failure containing `users route missing`.

- [ ] **Step 2: Add routes and breadcrumbs**

Update `admin/index.html`:

```js
'users': 'user/users.html',
'user-add': 'user/user_form.html?mode=add',
'user-edit': 'user/user_form.html?mode=edit',
```

Add breadcrumbs:

```js
'users': ['用户', '用户管理'],
'user-add': ['用户', { label: '用户管理', page: 'users' }, '添加用户'],
'user-edit': ['用户', { label: '用户管理', page: 'users' }, '编辑用户'],
```

Update `loadAdminPage` query-aware route matching so `mode=add` selects `user-add` and `mode=edit` selects `user-edit`.

- [ ] **Step 3: Build the list and form semantic shells**

`admin/user/users.html` must contain:

```html
<main class="um-page um-list-page" id="userListPage">
  <section class="um-page-container">
    <header class="um-page-header" id="userListHeader"></header>
    <div class="um-guidance" id="userListGuidance"></div>
    <nav class="um-view-tabs" id="userViewTabs" aria-label="用户快捷视图"></nav>
    <section class="um-toolbar" id="userToolbar"></section>
    <section class="um-bulk-bar" id="userBulkBar" hidden></section>
    <section class="um-table-card" id="userTableCard"></section>
  </section>
</main>
```

Load scripts in this order:

```html
<script>var CURRENT_PAGE = 'users';</script>
<script src="../common/js/commons.js"></script>
<script src="js/user_store.js"></script>
<script src="js/user_components.js"></script>
<script src="js/users.js"></script>
```

`admin/user/user_form.html` must contain:

```html
<main class="um-page um-form-page" id="userFormPage">
  <section class="um-page-container">
    <header class="um-form-header" id="userFormHeader"></header>
    <div class="um-guidance um-guidance-important" id="manualAddGuidance"></div>
    <div class="um-form-layout">
      <div class="um-form-main" id="userFormMain"></div>
      <aside class="um-form-sidebar" id="userFormSidebar"></aside>
    </div>
  </section>
</main>
```

- [ ] **Step 4: Implement project-styled controls**

In `user_components.js`, mount controls declared with data attributes:

```html
<div class="um-combobox" data-um-combobox="accountStatus" data-value="all">
  <button class="um-control um-combobox-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"></button>
  <div class="um-combobox-popover" role="listbox" hidden>
    <div class="um-combobox-search-wrap">
      <input class="um-combobox-search" type="text" placeholder="输入关键词搜索" />
    </div>
    <div class="um-combobox-options"></div>
  </div>
</div>
```

The JavaScript option source is always a non-empty array:

```js
const CONTROL_OPTIONS = {
  accountStatus: [
    { value: 'all', label: '全部账号状态' },
    { value: 'active', label: '已注册' },
    { value: 'pending', label: '待激活' },
    { value: 'disabled', label: '已禁用' }
  ],
  marketingStatus: [
    { value: 'all', label: '全部营销状态' },
    { value: 'subscribed', label: '已订阅' },
    { value: 'not_subscribed', label: '未订阅' },
    { value: 'pending', label: '待确认' },
    { value: 'unsubscribed', label: '已退订' },
    { value: 'invalid', label: '无效邮箱' }
  ]
};
```

Implement ArrowUp, ArrowDown, Enter, Escape, Home, and End behavior, and expose the stable `UserComponents` interface.

- [ ] **Step 5: Add consistent visual tokens and responsive layout**

In `users.css`, define 40px controls and the two-column form:

```css
.um-control,
.um-text-control {
  min-height: 40px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font: 14px/1.4 var(--font-sans);
}

.um-form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

.um-form-sidebar {
  position: sticky;
  top: 16px;
}

@media (max-width: 860px) {
  .um-form-layout { grid-template-columns: 1fr; }
  .um-form-sidebar { position: static; }
}
```

Style text controls, comboboxes, switches, date popovers, tags, tooltips, table states, frozen columns, focus rings, invalid fields, disabled states, and cards with existing system tokens.

- [ ] **Step 6: Verify shells and commit**

Run:

```powershell
node --check admin/user/js/user_components.js
$pages = @('admin/user/users.html', 'admin/user/user_form.html')
foreach ($page in $pages) {
  $text = [System.IO.File]::ReadAllText((Resolve-Path $page), [System.Text.Encoding]::UTF8)
  if ($text -notmatch 'user_store\\.js') { throw \"$page does not load user_store.js\" }
}
git diff --check
```

Expected: no output and exit code `0`.

Commit:

```powershell
git add -- admin/index.html admin/user/users.html admin/user/user_form.html admin/user/css/users.css admin/user/js/user_components.js
git commit -m "feat: add user management page shells"
```

---

### Task 3: Complete user list interactions

**Files:**
- Modify: `admin/user/users.html`
- Modify: `admin/user/css/users.css`
- Create: `admin/user/js/users.js`

**Interfaces:**
- Consumes `UserStore`, `UserComponents`, parent `loadAdminPage`, parent `UserDialogs`.
- Produces `window.UserPageHooks` for import, consent, and delete dialogs.

- [ ] **Step 1: Add a failing list contract check**

Create a temporary PowerShell assertion command:

```powershell
$html = [System.IO.File]::ReadAllText((Resolve-Path 'admin/user/users.html'), [System.Text.Encoding]::UTF8)
$required = @('导入用户', '自定义列', 'userTableHead', 'userTableBody', 'userRefreshButton')
foreach ($value in $required) {
  if ($html -notmatch [regex]::Escape($value)) { throw \"missing list contract: $value\" }
}
```

Expected before list completion: failure containing `missing list contract`.

- [ ] **Step 2: Implement page header, guidance, views, filters, and actions**

Add:

- Header copy and count.
- Export, import dropdown, and add-user actions.
- Guidance text from the design spec.
- Views: all, active, subscribed, pending, disabled.
- Search plus account, marketing, source, provider, store, and created-date controls.
- Batch bar with tag, marketing, account, export, more, custom columns, and refresh.

The add route uses:

```js
window.parent.loadAdminPage('users', 'user/user_form.html?mode=add');
```

The import actions use:

```js
window.parent.UserDialogs.openShopifyImport();
window.parent.UserDialogs.openCsvImport();
```

- [ ] **Step 3: Implement column definitions, sorting, frozen columns, and hover detail**

Use this column contract:

```js
const COLUMNS = [
  { key: 'user', label: '用户信息', fixed: 'left', alwaysShow: true, width: 260 },
  { key: 'accountStatus', label: '账号状态' },
  { key: 'marketingStatus', label: '邮件营销' },
  { key: 'authProviders', label: '登录方式' },
  { key: 'source', label: '用户来源' },
  { key: 'stores', label: '关联店铺' },
  { key: 'orderCount', label: '订单数', sortable: true },
  { key: 'totalSpent', label: '累计消费', sortable: true },
  { key: 'lastLoginAt', label: '最后登录时间', sortable: true },
  { key: 'createdAt', label: '创建时间', sortable: true }
];
```

Persist visibility and order under:

```js
const VISIBLE_KEY = 'rebecca_user_columns_v1';
const ORDER_KEY = 'rebecca_user_column_order_v1';
```

Render the selection checkbox and user column as sticky left, and the operations column as sticky right. Store and order hover cards must be reachable using mouse hover and keyboard focus.

- [ ] **Step 4: Implement state, pagination, menus, and feedback**

Use a single state object:

```js
const state = {
  view: 'all',
  search: '',
  filters: {
    accountStatus: 'all',
    marketingStatus: 'all',
    source: 'all',
    authProvider: 'all',
    storeId: 'all',
    createdFrom: '',
    createdTo: ''
  },
  sort: { key: 'createdAt', direction: 'desc' },
  selected: new Set(),
  page: 1,
  pageSize: 10,
  status: 'ready'
};
```

Render:

- Skeleton rows when `status === 'loading'`.
- Initial empty state when the store has no records.
- Filtered-empty state with clear-filter button.
- Error state with retry button.
- Success Toast after refresh.
- Pagination and a searchable page-size control with 10, 20, 50, and 100.

- [ ] **Step 5: Expose dialog hooks and row operations**

```js
window.UserPageHooks = {
  getUsers: () => UserStore.list(),
  getSelectedIds: () => Array.from(state.selected),
  importUsers: (records, source) => UserStore.importProfiles(records, source),
  updateMarketing: (ids, status, consent) => UserStore.setMarketingStatus(ids, status, consent),
  removeUsers: (ids) => {
    const results = ids.map((id) => UserStore.remove(id));
    return { ok: results.every((item) => item.ok), results };
  },
  onDialogComplete: () => {
    state.selected.clear();
    render();
  }
};
```

Edit routes use:

```js
window.parent.loadAdminPage('users', `user/user_form.html?mode=edit&id=${encodeURIComponent(userId)}`);
```

- [ ] **Step 6: Verify list contracts and commit**

Run:

```powershell
node --check admin/user/js/users.js
node admin/user/tests/user_store.test.js
git diff --check
```

Expected: `user_store tests passed` and no other output.

Commit:

```powershell
git add -- admin/user/users.html admin/user/css/users.css admin/user/js/users.js
git commit -m "feat: build interactive user list"
```

---

### Task 4: Add and edit drill-down flows

**Files:**
- Modify: `admin/user/user_form.html`
- Modify: `admin/user/css/users.css`
- Create: `admin/user/js/user_form.js`
- Modify: `admin/user/tests/user_store.test.js`

**Interfaces:**
- Consumes `UserStore`, `UserComponents`, parent navigation, and parent `UserDialogs`.
- Produces form-save behavior and a `UserPageHooks` consent callback for the edit page.

- [ ] **Step 1: Add failing form state tests**

Before the final `console.log('user_store tests passed')`, append tests proving an existing record can update without changing identity, an activation uses the same ID, and duplicate email cannot be assigned:

```js
UserStore.resetForTests([]);
const first = UserStore.createManual({ email: 'first@example.com', firstName: 'First', marketingOptIn: false });
const second = UserStore.createManual({ email: 'second@example.com', firstName: 'Second', marketingOptIn: false });

const updated = UserStore.update(first.user.id, { firstName: 'Updated', note: 'VIP buyer' });
assert.equal(updated.ok, true);
assert.equal(UserStore.get(first.user.id).firstName, 'Updated');

const duplicateUpdate = UserStore.update(second.user.id, { email: 'FIRST@example.com' });
assert.equal(duplicateUpdate.ok, false);

const activated = UserStore.activateByEmail('first@example.com', 'google');
assert.equal(activated.ok, true);
assert.equal(activated.user.id, first.user.id);
assert.equal(activated.user.accountStatus, 'active');
assert.equal(activated.user.authProviders.includes('google'), true);
```

- [ ] **Step 2: Run tests and verify activation is not implemented**

Run:

```powershell
node admin/user/tests/user_store.test.js
```

Expected: failure containing `UserStore.activateByEmail is not a function`.

- [ ] **Step 3: Implement `activateByEmail`**

Add to `user_store.js` and its exported API:

```js
function activateByEmail(email, provider) {
  const existing = findByEmail(email);
  if (!existing) return { ok: false, error: '未找到可认领的用户档案' };
  const authProviders = Array.from(new Set(existing.authProviders.concat(provider || 'email')));
  return update(existing.id, {
    accountStatus: 'active',
    authProviders,
    lastLoginAt: new Date().toISOString()
  });
}
```

- [ ] **Step 4: Build the two-column form**

Render exact sections:

- Important manual-add guidance.
- Basic information: email, first name, last name, country code, phone, preferred language.
- Marketing card: custom switch, consent source, custom date-time picker, consent note, nearby compliance guidance.
- Tags and internal note.
- Edit-only consent history, login identities, and Shopify bindings.
- Sidebar status, source, ID, created time, last login, orders, spend, and enable/disable control.

The add sidebar must display `待激活` as read-only and this copy:

> 保存后只会创建待激活用户档案。用户首次完成邮箱或快捷登录验证后，系统才会将账号升级为已注册。

- [ ] **Step 5: Implement validation, duplicate handling, and save**

Use `.um-field-error` and an ARIA live summary. Add mode calls:

```js
const result = UserStore.createManual({
  email: readText('userEmail'),
  firstName: readText('firstName'),
  lastName: readText('lastName'),
  phone: readText('phone'),
  preferredLanguage: UserComponents.getComboboxValue('preferredLanguage'),
  tags: tagState.slice(),
  note: readText('internalNote'),
  marketingOptIn: switchState.marketing,
  consent: switchState.marketing ? {
    source: UserComponents.getComboboxValue('consentSource'),
    consentedAt: UserComponents.getDateValue('consentedAt'),
    note: readText('consentNote')
  } : null
});
```

When `result.existing` exists, show an inline duplicate card and a button that navigates to:

```js
window.parent.loadAdminPage('users', `user/user_form.html?mode=edit&id=${encodeURIComponent(result.existing.id)}`);
```

Edit mode uses `UserStore.update`, and marketing changes use `UserStore.setMarketingStatus` so history is retained.

- [ ] **Step 6: Verify form behavior and commit**

Run:

```powershell
node admin/user/tests/user_store.test.js
node --check admin/user/js/user_form.js
node --check admin/user/js/user_store.js
git diff --check
```

Expected: `user_store tests passed` and no syntax errors.

Commit:

```powershell
git add -- admin/user/user_form.html admin/user/css/users.css admin/user/js/user_form.js admin/user/js/user_store.js admin/user/tests/user_store.test.js
git commit -m "feat: add user drill-down forms"
```

---

### Task 5: Parent-hosted CSV, Shopify, consent, and confirmation dialogs

**Files:**
- Modify: `admin/index.html`
- Create: `admin/common/html/user_dialogs.html`
- Create: `admin/common/css/user_dialogs.css`
- Create: `admin/common/js/user_dialog.js`
- Modify: `admin/user/js/users.js`
- Modify: `admin/user/js/user_form.js`

**Interfaces:**
- Consumes active iframe `UserPageHooks`.
- Produces the complete parent `window.UserDialogs` API.

- [ ] **Step 1: Add failing parent-host contract assertions**

Run:

```powershell
$html = [System.IO.File]::ReadAllText((Resolve-Path 'admin/index.html'), [System.Text.Encoding]::UTF8)
if ($html -notmatch 'common/css/user_dialogs\\.css') { throw 'user dialog stylesheet missing' }
if ($html -notmatch 'common/js/user_dialog\\.js') { throw 'user dialog script missing' }
```

Expected: failure containing `user dialog stylesheet missing`.

- [ ] **Step 2: Link parent assets**

Add in `admin/index.html`:

```html
<link rel="stylesheet" href="common/css/user_dialogs.css">
```

After `dialog_host.js`, load:

```html
<script src="common/js/user_dialog.js"></script>
```

- [ ] **Step 3: Implement full-viewport dialog markup and styling**

All dialog roots use:

```html
<div class="um-dialog-overlay" data-user-dialog hidden>
  <section class="um-dialog" role="dialog" aria-modal="true" aria-labelledby="umDialogTitle">
    <header class="um-dialog-header"></header>
    <div class="um-dialog-body"></div>
    <footer class="um-dialog-footer"></footer>
  </section>
</div>
```

Overlay styling must be parent viewport fixed:

```css
.um-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 0 0 / 52%);
}

.um-dialog-overlay[hidden] { display: none; }

.um-dialog {
  display: flex;
  width: min(960px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: hsl(var(--background));
  box-shadow: 0 24px 64px rgb(0 0 0 / 24%);
}
```

- [ ] **Step 4: Implement CSV workflow**

Build three steps:

1. Custom drag/upload trigger with Shopify CSV and system-template copy.
2. Validation summary, searchable field mapping, and five-row preview.
3. Merge-rule confirmation and result counts.

Use `File.text()` for real selected CSV files and provide a “使用示例文件体验” action that loads deterministic mock rows. The parser must support quoted commas and escaped quotes.

Call:

```js
const result = hooks.importUsers(parsedRecords, 'shopify_csv');
hooks.onDialogComplete(result);
```

Show the mandatory copy:

> CSV 只能导入客户资料和营销状态，不能迁移 Shopify 密码或快捷登录绑定。导入用户将以待激活状态保存。

- [ ] **Step 5: Implement Shopify workflow**

Build four states in one full dialog:

1. Connect a `*.myshopify.com` domain and show that each store requires separate authorization.
2. Choose from three mock connected stores with connection state and last sync time.
3. Select customer profiles, email subscribers, or all profiles; support search, searchable filters, select-all-current-results, multi-select, and clear.
4. Show created, merged, skipped, and failed counts.

Use at least eight mock Shopify records and call:

```js
const result = hooks.importUsers(selectedRecords, 'shopify_api');
hooks.onDialogComplete(result);
```

Show the mandatory copy:

> Shopify 授权用于读取店铺客户资料，不会取得买家密码或登录会话。相同邮箱将合并到现有用户档案。

- [ ] **Step 6: Implement marketing and delete dialogs**

Marketing opt-in requires non-empty `source` and `consentedAt`; confirm stays disabled until valid. Delete confirmation identifies order and Shopify bindings and recommends disabling instead of deleting when either exists.

Dialog manager requirements:

- Save the opener element and restore focus on close.
- Trap Tab and Shift+Tab inside the dialog.
- Escape closes non-blocking dialogs.
- Overlay click does not close destructive confirmation.
- Parent navigation calls close all dialogs.

- [ ] **Step 7: Verify dialog contracts and commit**

Run:

```powershell
node --check admin/common/js/user_dialog.js
node --check admin/user/js/users.js
node --check admin/user/js/user_form.js
git diff --check
```

Expected: no output.

Commit:

```powershell
git add -- admin/index.html admin/common/html/user_dialogs.html admin/common/css/user_dialogs.css admin/common/js/user_dialog.js admin/user/js/users.js admin/user/js/user_form.js
git commit -m "feat: add full-screen user workflows"
```

---

### Task 6: Browser integration, visual states, and accessibility

**Files:**
- Modify: `admin/user/users.html`
- Modify: `admin/user/user_form.html`
- Modify: `admin/user/css/users.css`
- Modify: `admin/user/js/user_components.js`
- Modify: `admin/user/js/users.js`
- Modify: `admin/user/js/user_form.js`
- Modify: `admin/common/css/user_dialogs.css`
- Modify: `admin/common/js/user_dialog.js`

**Interfaces:**
- Consumes the complete module and produces a browser-verified UI.

- [ ] **Step 1: Start or verify the active admin service**

Run:

```powershell
$response = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8080/admin/index.html'
if ($response.StatusCode -ne 200) { throw 'admin service is unavailable' }
```

If unavailable, start `admin/server.js` hidden from `D:\space\rebecca-project` and retry. Expected: HTTP `200`.

- [ ] **Step 2: Verify the user-list critical path in a browser**

At `http://127.0.0.1:8080/admin/index.html`:

1. Click left navigation “用户”.
2. Confirm the title, guidance, mock rows, fixed user column, fixed actions, custom columns, more actions, and refresh button.
3. Search by email.
4. Use every searchable filter and confirm each has values and search.
5. Sort order count, spend, last login, and created date both directions.
6. Hover and keyboard-focus store/order detail.
7. Select multiple rows, run a safe bulk operation, and confirm feedback.
8. Hide, reorder, and restore columns.
9. Refresh and confirm persisted column/view state.

Expected: no browser console errors.

- [ ] **Step 3: Verify add/edit critical paths**

1. Open Add User.
2. Confirm the pending-account guidance is visible next to status decisions.
3. Trigger required-email validation.
4. Enter an existing email and confirm the duplicate-user navigation card.
5. Add a new subscribed profile and confirm source/time become required.
6. Save and verify it appears in the list as pending.
7. Edit a sample Shopify user and confirm import/password guidance.
8. Edit basic information, marketing state, tags, note, and account status.
9. Return to the list and confirm the prior list state remains.

Expected: no duplicate records and all feedback is understandable without prior product knowledge.

- [ ] **Step 4: Verify full-screen dialogs**

1. Open CSV import and confirm the overlay covers sidebar, header, and content.
2. Run sample upload, mapping, preview, merge confirmation, and result.
3. Open Shopify import and run connection, store, data type, multi-select, and result.
4. Confirm searchable dialog dropdowns contain values.
5. Open marketing consent and verify consent requirements.
6. Confirm focus trap, Escape behavior, focus restoration, and destructive-dialog protection.

Expected: every modal root is a child of parent `#dialogHost`, not the iframe document.

- [ ] **Step 5: Verify responsive and state variants**

Check desktop and a viewport at 768px width:

- Header actions wrap without overlap.
- Filter controls remain consistently sized.
- The table scrolls horizontally and fixed columns remain usable.
- The form changes from two columns to one.
- Dialogs fit within the viewport.

Trigger `loading`, empty, filtered-empty, error, disabled, and success states through exposed mock-state controls or console calls, then return to `ready`.

- [ ] **Step 6: Run automated checks and commit fixes**

Run:

```powershell
node admin/user/tests/user_store.test.js
Get-ChildItem admin/user/js,admin/common/js -Filter '*.js' | ForEach-Object { node --check $_.FullName }
git diff --check
```

Expected: `user_store tests passed`, no syntax errors, and no diff errors.

Commit:

```powershell
git add -- admin/user admin/common/css/user_dialogs.css admin/common/html/user_dialogs.html admin/common/js/user_dialog.js admin/index.html
git commit -m "fix: polish user management interactions"
```

---

### Task 7: Final regression, changelog, commit, and push

**Files:**
- Create: `zz-changelog/2026-07-29.md`
- Verify: all files in this plan

**Interfaces:**
- Produces the final traceable handoff.

- [ ] **Step 1: Write the dated changelog**

Record:

- Unified user list and status model.
- Add/edit drill-down pages.
- Pending activation and consent guidance.
- CSV and Shopify full-screen import flows.
- Mock data and test coverage.
- Verification URL and commands.

- [ ] **Step 2: Run the full regression**

Run:

```powershell
node admin/user/tests/user_store.test.js
Get-ChildItem admin/user/js,admin/common/js -Filter '*.js' | ForEach-Object { node --check $_.FullName }
git diff --check
$urls = @(
  'http://127.0.0.1:8080/admin/index.html',
  'http://127.0.0.1:8080/admin/user/users.html',
  'http://127.0.0.1:8080/admin/user/user_form.html?mode=add'
)
foreach ($url in $urls) {
  $response = Invoke-WebRequest -UseBasicParsing $url
  if ($response.StatusCode -ne 200) { throw \"HTTP failure: $url\" }
}
```

Expected: store tests pass, syntax and diff checks are silent, and all URLs return `200`.

- [ ] **Step 3: Review the final diff and repository state**

Run:

```powershell
git status --short
git diff --stat HEAD
git log -8 --oneline
```

Expected: only user-management and changelog files remain uncommitted.

- [ ] **Step 4: Commit the changelog or remaining verification changes**

```powershell
git add -- zz-changelog/2026-07-29.md admin/index.html admin/user admin/common/css/user_dialogs.css admin/common/html/user_dialogs.html admin/common/js/user_dialog.js
git commit -m "docs: record user management delivery"
```

If the index is clean because all files were committed in earlier tasks, commit only the changelog.

- [ ] **Step 5: Push the active feature branch**

```powershell
git push origin agent/user-management-ui
```

Expected: the remote branch advances to the final local commit.

- [ ] **Step 6: Record durable task memory**

Write the final result, key files, verification commands, page URL, branch, and commit ID through `Write-CodexDailyMemory.ps1`. Do not store credentials, tokens, cookies, or customer personal data.
