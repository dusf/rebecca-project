# 添加赠品页返回按钮 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将添加/编辑赠品页的取消按钮改为返回按钮，并确保始终返回赠品管理的赠品池 Tab。

**Architecture:** 复用现有 `GWP.back(tab)` 作为统一导航入口。表单只负责传入 `pool`，公共方法在后台框架内调用 `loadAdminPage`，在独立页面中使用带 `tab` 参数的明确 URL 跳转。

**Tech Stack:** HTML、原生 JavaScript、静态后台页面、浏览器验证

## Global Constraints

- 添加和编辑赠品共用同一表单，按钮统一显示 `返回`。
- 返回目标固定为 `gift/gift.html?tab=pool`。
- 不修改赠品规则表单按钮、赠品表单布局或保存逻辑。
- 不使用 `window.history.back()` 作为独立页面兜底。

---

### Task 1: 修改赠品表单返回行为

**Files:**
- Modify: `admin/gift/gift_pool_form.html:17`
- Modify: `admin/gift/js/gift_pool_form.js:32`
- Modify: `admin/gift/js/gift_common.js:778`
- Modify: `admin/index.html:245`
- Modify: `zz-changelog/2026-07-27.md`

**Interfaces:**
- Consumes: `GWP.back(tab: string): void`
- Produces: `btnBack` 点击后调用 `GWP.back('pool')`

- [x] **Step 1: 记录修改前静态检查结果**

Run:

```powershell
rg -n 'id="btnCancel">取消|btnCancel|window\.history\.back' admin/gift/gift_pool_form.html admin/gift/js/gift_pool_form.js admin/gift/js/gift_common.js
```

Expected: 命中赠品表单的 `btnCancel` 和公共返回方法中的 `window.history.back()`。

- [x] **Step 2: 修改按钮语义和返回目标**

将赠品表单按钮改为：

```html
<button class="btn btn-ghost" id="btnBack">返回</button>
```

将事件绑定改为：

```javascript
document.getElementById('btnBack').addEventListener('click', () => GWP.back('pool'));
```

将后台框架目标改为：

```javascript
window.parent.loadAdminPage('gift', 'gift/gift.html', { tab: tab || 'pool' });
```

将独立页面兜底改为：

```javascript
else window.location.href = 'gift.html?tab=' + encodeURIComponent(tab || 'pool');
```

- [x] **Step 3: 同步当天变更记录**

在 `zz-changelog/2026-07-27.md` 增加“赠品表单返回导航”条目，记录按钮文案、赠品池 Tab 固定返回和独立页面兜底行为。

- [x] **Step 4: 运行静态检查**

Run:

```powershell
rg -n 'id="btnBack">返回|btnBack|gift/gift\.html|gift\.html\?tab=|window\.history\.back' admin/gift/gift_pool_form.html admin/gift/js/gift_pool_form.js admin/gift/js/gift_common.js
git diff --check
```

Expected: 命中 `btnBack` 和明确的 `gift.html?tab=` 跳转；不再命中赠品表单的 `btnCancel` 或公共方法中的 `window.history.back()`；`git diff --check` 退出码为 0。

- [x] **Step 5: 验证页面交互**

打开：

```text
http://127.0.0.1:8080/admin/gift/gift_pool_form.html?add=1
```

验证：

```text
1. 顶部次要按钮显示“返回”。
2. 点击后进入赠品管理列表。
3. URL 包含 tab=pool，且赠品池 Tab 为激活状态。
4. 浏览器控制台没有新增错误。
```

- [x] **Step 6: 提交并推送**

Run:

```powershell
git add admin/gift/gift_pool_form.html admin/gift/js/gift_pool_form.js admin/gift/js/gift_common.js zz-changelog/2026-07-27.md docs/superpowers/plans/2026-07-27-gift-form-return-implementation.md
git commit -m "fix: 优化赠品表单返回导航"
git push
```

Expected: 提交成功，当前分支与远端同步。
