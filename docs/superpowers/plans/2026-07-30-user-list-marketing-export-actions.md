# User List Marketing, Tags, and Export Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade user-list marketing actions to three channels, add single-user tagging, fix covered menus, and add scoped field-selectable CSV export.

**Architecture:** Keep user mutations in `UserStore`, list filtering and CSV generation in the user iframe, and modal state/field selection in the existing parent-page `UserDialogs` layer. Reuse the existing body-level viewport menu portal for every menu that can overlap the list.

**Tech Stack:** Static HTML, CSS, browser JavaScript, localStorage-backed `UserStore`, Node contract tests.

## Global Constraints

- Export ranges are exactly selected users, current query results across all pages, and all users in the current shop.
- Export fields default to all selected and at least one field is required.
- Email marketing keeps the existing consent-source/time/history rules; SMS and WhatsApp update their channel booleans.
- Buttons, dropdowns, dialogs, typography, icons, sizing, and z-index behavior must reuse existing user/product-list conventions.
- Do not export internal IDs, shop IDs, external authorization IDs, or consent-history details.
- Per user instruction, update tests/contracts but do not run automated tests, browser verification, or page-effect validation.

---

### Task 1: Add Marketing Channel Mutation Support

**Files:**
- Modify: `admin/user/js/user_store.js`
- Test: `admin/user/tests/user_store.test.js`

**Interfaces:**
- Consumes: existing `setMarketingStatus(ids, status, consent)` email mutation.
- Produces: `setMarketingChannelStatus(ids, channel, enabled, consent)` and locked equivalent.

- [ ] **Step 1: Add store contract coverage**

Add assertions that SMS and WhatsApp updates preserve each other and that email updates continue to synchronize `marketingChannels.email`.

- [ ] **Step 2: Implement channel mutation**

Implement:

```js
function setMarketingChannelStatus(ids, channel, enabled, consent) {
  if (channel === 'email') {
    return setMarketingStatus(ids, enabled ? 'subscribed' : 'unsubscribed', consent);
  }
  if (channel !== 'sms' && channel !== 'whatsapp') {
    return { ok: false, error: '无效的营销渠道' };
  }
  const targetIds = new Set(Array.isArray(ids) ? ids : [ids]);
  const users = list();
  let changed = 0;
  users.forEach(function (user) {
    if (!targetIds.has(user.id)) return;
    user.marketingChannels = user.marketingChannels || { email: false, sms: false, whatsapp: false };
    user.marketingChannels[channel] = Boolean(enabled);
    user.updatedAt = new Date().toISOString();
    changed += 1;
  });
  if (changed) write(users);
  return { ok: true, changed: changed };
}
```

Expose synchronous and locked methods from `UserStore`.

- [ ] **Step 3: Defer automated verification**

Do not run `node admin/user/tests/user_store.test.js`; record it as not run per user instruction.

### Task 2: Upgrade List Actions and Menu Layering

**Files:**
- Modify: `admin/user/users.html`
- Modify: `admin/user/js/users.js`
- Modify: `admin/user/css/users.css`
- Test: `admin/user/tests/users_contract.test.js`

**Interfaces:**
- Consumes: `UserDialogs.openBatchTag`, `UserDialogs.openMarketingConsent`, and `UserDialogs.openExportUsers`.
- Produces: `UserPageHooks.exportUsers(scope, fieldKeys)` and `UserPageHooks.updateMarketingChannel(...)`.

- [ ] **Step 1: Replace export button with range menu**

Render a `details.um-menu.um-viewport-menu` header control with:

```html
<button data-export-scope="selected">导出选中用户（N）</button>
<button data-export-scope="query">导出当前查询结果（N）</button>
<button data-export-scope="all">导出全部用户（N）</button>
```

Disable ranges with zero users and remove the bulk-bar `导出所选` button.

- [ ] **Step 2: Generalize viewport menu portal**

Change `usesViewportLayer(menu)` to include `.um-viewport-menu`, then add that class to the bulk account-status menu, row menu, custom-column menu, and export menu. Preserve close-on-scroll/resize and restore-to-owner behavior.

- [ ] **Step 3: Add single-user tagging**

Insert `添加标签` in the row-more menu and route it to `openBatchTag([id])`.

- [ ] **Step 4: Upgrade batch marketing entry**

Rename `邮件营销` to `营销授权`, retain the existing button styling, and open the channel-aware parent dialog.

- [ ] **Step 5: Refactor CSV export around field definitions**

Define ordered export fields:

```js
const EXPORT_FIELDS = [
  { key: 'customerNumber', label: '客户编号' },
  { key: 'name', label: '姓名' },
  { key: 'email', label: '邮箱' },
  { key: 'phone', label: '手机号' },
  { key: 'tags', label: '标签' },
  { key: 'accountStatus', label: '账号状态' },
  { key: 'emailMarketing', label: '电子邮件营销' },
  { key: 'smsMarketing', label: '短信营销' },
  { key: 'whatsappMarketing', label: 'WhatsApp 营销' },
  { key: 'authProviders', label: '登录方式' },
  { key: 'source', label: '用户来源' },
  { key: 'orderCount', label: '订单数' },
  { key: 'totalSpent', label: '累计消费' },
  { key: 'lastLoginAt', label: '最后登录时间' },
  { key: 'createdAt', label: '创建时间' }
];
```

Resolve `selected`, `query`, and `all` to user arrays, then generate CSV using only selected field keys while preserving formula-neutralization.

- [ ] **Step 6: Expose dialog hooks**

Expose export metadata, export execution, and channel marketing mutation through `UserPageHooks`. Dialog completion refreshes the list and clears selection only for mutations, not for export.

- [ ] **Step 7: Defer automated verification**

Do not run contract or browser checks; record them as not run per user instruction.

### Task 3: Add Channel-Aware Marketing and Export Dialogs

**Files:**
- Modify: `admin/common/html/user_dialogs.html`
- Modify: `admin/common/js/user_dialog.js`
- Modify: `admin/common/css/user_dialogs.css`
- Test: `admin/user/tests/user_dialog.test.js`
- Test: `admin/user/tests/users_contract.test.js`

**Interfaces:**
- Consumes: `UserPageHooks.updateMarketingChannel(ids, channel, enabled, consent)` and `UserPageHooks.exportUsers(scope, fields)`.
- Produces: `UserDialogs.openMarketingConsent(ids)` with channel state and `UserDialogs.openExportUsers(options)`.

- [ ] **Step 1: Add export overlay**

Add a compact `data-user-dialog="export"` overlay matching existing dialog shell markup.

- [ ] **Step 2: Make marketing dialog channel-aware**

Add a channel combobox. Email status options remain subscribed/unsubscribed/not_subscribed and retain consent fields; SMS/WhatsApp use enabled/disabled labels and hide email-only consent fields.

- [ ] **Step 3: Add export field selection state**

Initialize every supplied field as selected. Render field checkboxes in two columns with “全选” and “清空” controls, selected count, scope label, and user count.

- [ ] **Step 4: Add export actions**

Handle individual toggles, select-all, clear-all, and confirm. Disable confirm when no field is selected. Call the iframe hook with ordered selected keys and close only after a successful result.

- [ ] **Step 5: Adjust batch-tag title**

Use `为用户添加标签` for one ID and `为所选用户添加标签` for multiple IDs.

- [ ] **Step 6: Style field grid**

Reuse `.um-dialog-checkbox-box` and existing compact-dialog tokens; add responsive one-column behavior for narrow screens.

- [ ] **Step 7: Defer automated verification**

Do not run `node admin/user/tests/user_dialog.test.js`; record it as not run per user instruction.

### Task 4: Cache Versions, Contracts, and Delivery

**Files:**
- Modify: `admin/index.html`
- Modify: `admin/common/js/user_dialog.js`
- Modify: `admin/user/users.html`
- Modify: `admin/user/user_form.html`
- Modify: `admin/user/tests/users_contract.test.js`

**Interfaces:**
- Consumes: completed list, dialog, store, and CSS changes.
- Produces: cache-busted pages and static regression contracts.

- [ ] **Step 1: Update static contracts**

Assert the three export scopes, export dialog overlay, 15 export fields, channel-aware marketing hook, single-user tag entry, and viewport menu class.

- [ ] **Step 2: Bump cache versions**

Increment user-list CSS/JS/store versions and parent dialog CSS/JS/HTML fetch versions consistently.

- [ ] **Step 3: Review the final diff without executing tests**

Inspect changed files for unintended scope only. Do not claim tests or browser verification passed.

- [ ] **Step 4: Commit and push**

```powershell
git add -- admin docs/superpowers/plans/2026-07-30-user-list-marketing-export-actions.md
git commit -m "feat: expand user marketing and export actions"
git push origin agent/user-management-ui
```

- [ ] **Step 5: Write daily memory**

Record result, key files, unverified status, commit, branch, and preview URL through `Write-CodexDailyMemory.ps1`.
