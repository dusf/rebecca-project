# 即时通讯配置页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将「配置 > 即时通讯」从占位页实现为服务商连接与买家端聊天入口配置原型。

**Architecture:** 保持实现集中于 `admin/shop/shop_settings.html` 的既有 IIFE。即时通讯状态保存到 `currentShop.settings.messaging`；页面只模拟连接状态，不发送请求、不加载第三方脚本。运行时继续依赖 `commons.js` 将原生下拉控件升级为可搜索组件。

**Tech Stack:** 静态 HTML、原生 JavaScript、现有后台 CSS 变量与 `commons.js`、Node 内置 `node:test`。

## Global Constraints

- 同一店铺仅能启用一个即时通讯服务商，买家端预览仅显示一个入口。
- 原型不得请求第三方 API、保存真实凭据或向买家端注入脚本。
- 下拉和状态组件必须以运行时生成的可见组件验证，不只检查原生 `<select>`。
- 不提交或推送代码，除非用户明确要求。

---

### Task 1: 为即时通讯原型建立行为测试

**Files:**
- Create: `admin/shop/tests/shop_settings_messaging.test.js`
- Test: `admin/shop/tests/shop_settings_messaging.test.js`

**Interfaces:**
- Consumes: `admin/shop/shop_settings.html` 中的 `messagingSettings()`、`renderMessagingSettings()` 和 `saveMessagingSettings()`。
- Produces: 静态行为契约，确保服务商、唯一入口、连接拦截与预览标记不会被移除。

- [x] **Step 1: 写入失败测试**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'shop_settings.html'), 'utf8');

test('即时通讯配置具备服务商、展示开关和唯一入口预览', () => {
  assert.match(source, /function messagingSettings\(\)/);
  assert.match(source, /function renderMessagingSettings\(\)/);
  assert.match(source, /function saveMessagingSettings\(event\)/);
  assert.match(source, /及时语/);
  assert.match(source, /Salesmartly/);
  assert.match(source, /messaging-preview-launcher/);
  assert.match(source, /仅会显示一个聊天入口/);
});
```

- [x] **Step 2: 运行测试确认失败**

Run: `node --test admin/shop/tests/shop_settings_messaging.test.js`  
Expected: FAIL，缺少即时通讯渲染函数。

- [x] **Step 3: 保留测试文件，进入页面实现**

测试文件不依赖第三方包，作为后续页面结构与核心交互的回归保护。

### Task 2: 实现即时通讯状态、连接与买家端展示配置

**Files:**
- Modify: `admin/shop/shop_settings.html:CSS 设置面板样式、即时通讯渲染函数、`renderWorkspace()` 路由与事件绑定

**Interfaces:**
- Consumes: `currentShop`、`loadShops()`、`saveShops()`、`showToast()`、`escapeHtml()`。
- Produces: `currentShop.settings.messaging`，结构为 `{ provider, connections, display }`。

- [x] **Step 1: 添加即时通讯专用样式**

在现有 `.settings-*` 样式之后添加服务商卡片、状态标签、连接表单、设备开关和店铺预览样式；使用 `14px` 正文、`12px` 辅助文案、`16px` 小节标题，并在 `860px` 以下将预览改为单列。

```css
.messaging-provider-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.messaging-provider-card { min-height:154px; padding:16px; border:1px solid hsl(var(--border)); border-radius:10px; background:#fff; text-align:left; }
.messaging-provider-card.active { border-color:hsl(var(--primary)); box-shadow:0 0 0 3px hsl(var(--ring) / .12); }
.messaging-preview-launcher { position:absolute; right:16px; bottom:16px; }
```

- [x] **Step 2: 添加默认状态与渲染函数**

新增 `messagingSettings()`，将缺失状态规范化为及时语、Salesmartly 两个未连接服务商和默认展示配置；新增 `renderMessagingSettings()` 输出：服务商卡片、所选服务商的连接字段、买家端展示控件、说明和预览。

```js
function messagingSettings() {
  var saved = currentShop && currentShop.settings && currentShop.settings.messaging ? currentShop.settings.messaging : {};
  return {
    provider: saved.provider || '',
    connections: saved.connections || { jishi: { connected: false, workspace: '', appId: '', installId: '' }, salesmartly: { connected: false, workspace: '', appId: '', installId: '' } },
    display: Object.assign({ enabled: false, position: 'right', desktop: true, mobile: true, launcherText: '在线咨询' }, saved.display || {})
  };
}
```

- [x] **Step 3: 添加事件与保存逻辑**

新增 `bindMessagingEvents()`、`collectMessagingSettings()`、`persistCurrentShop()`、`saveMessagingSettings(event)` 和 `updateMessagingPreview()`。其中 `collectMessagingSettings()` 返回当前草稿的 `{ provider, connections, display }`，`persistCurrentShop()` 以现有店铺保存模式写回 `loadShops()` / `saveShops()`。服务商卡片选择、连接测试、位置/设备/文案变化均更新预览；没有已连接服务商时总开关保持禁用；保存时只写入本地原型数据并调用 `showToast('success', '即时通讯配置已保存')`。

```js
function saveMessagingSettings(event) {
  event.preventDefault();
  var data = collectMessagingSettings();
  if (data.display.enabled && !(data.provider && data.connections[data.provider].connected)) {
    showToast('error', '请先连接并选择一个服务商');
    return;
  }
  currentShop.settings = currentShop.settings || {};
  currentShop.settings.messaging = data;
  persistCurrentShop();
  showToast('success', '即时通讯配置已保存');
}
```

- [x] **Step 4: 连接即时通讯路由**

将 `renderWorkspace()` 调整为：`basic` 调用 `renderBasicInfo()`，`whatsapp` 调用 `renderMessagingSettings()`，其余菜单项继续调用 `renderPending(section)`。

- [x] **Step 5: 运行结构测试确认通过**

Run: `node --test admin/shop/tests/shop_settings_messaging.test.js`  
Expected: PASS，输出 1 个通过的子测试。

### Task 3: 验证运行时交互与页面回归

**Files:**
- Modify: `admin/shop/shop_settings.html`（仅在验证发现问题时）
- Test: `admin/shop/tests/shop_settings_messaging.test.js`

**Interfaces:**
- Consumes: 本地服务 `http://127.0.0.1:8080/admin/index.html`。
- Produces: 已验证的配置页即时通讯原型。

- [x] **Step 1: 在浏览器打开配置页的即时通讯项**

确认页面显示及时语、Salesmartly、更多服务商、买家端展示和唯一入口说明。

- [x] **Step 2: 验证原型状态转换**

选择及时语，填写三个演示字段并点击“测试连接”；确认卡片变为已连接。开启买家端展示、切换到左下并修改入口文案；确认预览只显示一个位于左下的聊天入口。

- [x] **Step 3: 验证保护与保存**

重置为未连接服务商后确认总开关不可用；保存连接配置后刷新页面，确认服务商、展示位置和入口文案仍保留。

- [x] **Step 4: 执行静态检查**

Run: `git diff --check`  
Expected: exit code 0。
