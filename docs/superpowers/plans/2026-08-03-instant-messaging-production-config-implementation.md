# 即时通讯正式接入配置优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将即时通讯服务商卡片与连接区改为真实上线场景的配置原型，同时不发起第三方请求。

**Architecture:** 在 `admin/shop/shop_settings.html` 的既有即时通讯 IIFE 内扩展连接状态。服务商卡片只负责选择服务商，连接区保存服务商账户、Web 渠道标识、买家端公钥和授权域名；“验证配置”只进行本地必填校验并模拟验证结果。

**Tech Stack:** 静态 HTML、原生 JavaScript、现有后台 CSS、Node 内置 `node:test`。

## Global Constraints

- 使用紧凑、等高、内容顶部对齐的服务商卡片，并以服务商视觉标识替换文字徽标。
- 同一店铺只选择一个服务商；买家端仅展示一个聊天入口。
- 不调用第三方 API、不加载或允许粘贴第三方脚本；密钥字段只作为掩码原型字段展示。
- 配置页主标题为 `18px/700`，标题说明为 `12px`，所有新增文字使用偶数像素字号。

---

### Task 1: 替换为真实接入字段和状态

**Files:**
- Modify: `admin/shop/shop_settings.html`
- Modify: `admin/shop/tests/shop_settings_messaging.test.js`

**Interfaces:**
- Consumes: `currentShop.settings.messaging.connections[provider]`。
- Produces: `workspace`、`widgetId`、`publicKey`、`allowedDomain`、`verifiedAt` 和 `connected`。

- [x] **Step 1: 更新静态回归契约**

```js
assert.match(source, /Web 渠道 ID/);
assert.match(source, /买家端公钥/);
assert.match(source, /已授权域名/);
assert.match(source, /验证配置/);
```

- [x] **Step 2: 调整数据规范化和连接交互**

```js
function messagingConnection() {
  return { connected: false, workspace: '', widgetId: '', publicKey: '', allowedDomain: '', verifiedAt: '' };
}
```

将原来的“应用标识、买家端安装标识、测试连接”替换为“Web 渠道 ID、买家端公钥、已授权域名、验证配置”；本地验证成功后设置 `connected: true` 和 `verifiedAt`。

- [x] **Step 3: 运行测试和静态检查**

Run: `node --test admin/shop/tests/shop_settings_messaging.test.js`  
Expected: PASS，1 个通过的子测试。

Run: `git diff --check`  
Expected: exit code 0。

### Task 2: 调整服务商卡片视觉层级

**Files:**
- Modify: `admin/shop/shop_settings.html`

**Interfaces:**
- Consumes: `messagingProvider(key)` 的 `logo` 和 `name`。
- Produces: 等高卡片、顶部对齐的品牌与连接状态。

- [x] **Step 1: 压缩卡片并改用视觉标识**

```css
.messaging-provider-card { min-height: 120px; }
.messaging-provider-top { align-items: flex-start; }
.messaging-provider-brand { align-items: flex-start; }
.messaging-provider-logo { width: 36px; height: 36px; }
```

为及时语和 Salesmartly 使用各自的内嵌 SVG 视觉标识；“更多服务商”使用统一的加号占位标识。

- [x] **Step 2: 运行时核验**

在本地配置页确认两张服务商卡片等高、品牌和状态顶部对齐；验证保存后，连接状态、授权域名和买家端预览仍可回显。
