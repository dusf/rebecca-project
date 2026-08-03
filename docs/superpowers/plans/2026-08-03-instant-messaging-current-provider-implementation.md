# 即时通讯当前服务商页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将即时通讯配置改为当前服务商一级页与服务商列表弹窗，并提供可交互的系统托管买家端展示设置。

**Architecture:** 保留 `shop_settings.html` 的本地原型数据模型和保存方式。`renderMessagingCenter` 只基于 `data.provider` 渲染当前服务商；弹窗独立渲染服务商列表并通过明确动作修改该值，买家端配置与预览使用同一份 draft 数据。

**Tech Stack:** 静态 HTML、内联 CSS、原生 JavaScript、Node 内置测试。

## Global Constraints

- 不调用第三方 API、不加载 SDK、不保存真实密钥。
- 对话框标题 16px，页面文案使用既有 12px/14px/16px/18px 字号体系。
- 同一页面只展示一个买家端即时通讯入口。

---

### Task 1: 当前服务商主页面和服务商弹窗

**Files:**
- Modify: `admin/shop/shop_settings.html`
- Test: `admin/shop/tests/shop_settings_messaging.test.js`

**Interfaces:**
- Produces: `renderMessagingCenter()`、`openMessagingProviderDialog()`、`closeMessagingProviderDialog()`。

- [ ] **Step 1: 写入失败测试**

```js
assert.match(source, /function openMessagingProviderDialog\(\)/);
assert.match(source, /管理服务商/);
assert.match(source, /选择并配置/);
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test admin/shop/tests/shop_settings_messaging.test.js`
Expected: FAIL，缺少服务商弹窗函数。

- [ ] **Step 3: 实现主页面与弹窗**

```js
function openMessagingProviderDialog(trigger) {
  // 在 document.body 创建带搜索和状态的单列表对话框。
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test admin/shop/tests/shop_settings_messaging.test.js`
Expected: PASS。

### Task 2: 买家端展示、上下文与交互回归

**Files:**
- Modify: `admin/shop/shop_settings.html`
- Test: `admin/shop/tests/shop_settings_messaging.test.js`

**Interfaces:**
- Consumes: `currentMessagingSettings()` 和当前服务商连接状态。
- Produces: 展示开关、挂载方式、装修页优先规则、实时预览与上下文说明。

- [ ] **Step 1: 扩展失败测试**

```js
assert.match(source, /启用买家端展示/);
assert.match(source, /系统托管安装/);
assert.match(source, /商品详情页：自动传递商品链接/);
```

- [ ] **Step 2: 实现最小交互**

```js
enabled.addEventListener('change', function () {
  currentMessagingSettings().display.enabled = enabled.checked;
  renderMessagingCenter();
});
```

- [ ] **Step 3: 运行静态测试和浏览器关键路径验证**

Run: `node --test admin/shop/tests/shop_settings_messaging.test.js`
Expected: PASS；验证弹窗打开、选择服务商、验证配置、展示开关及位置切换。
