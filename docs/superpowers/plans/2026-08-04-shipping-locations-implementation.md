# 发货地点 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在商店配置中提供可管理多地点、默认主仓与 ERP 库存同步状态的发货地点页面。

**Architecture:** `admin/shop/shop_settings.html` 维护地点数据、一级页列表与 iframe 事件回写；`admin/common/js/dialog_host.js` 在后台顶层渲染地点表单。地点数据存储于 `currentShop.settings.shippingLocations`。

**Tech Stack:** 原生 HTML、CSS、JavaScript；父级 `dialogHost` + `postMessage`。

## Global Constraints

- 对话框必须由父级宿主顶层渲染并覆盖完整后台视口。
- 辅助文案使用 12px；对话框主标题使用 16px。
- 不调用第三方 ERP 接口；仅保存原型本地状态。

---

### Task 1: 发货地点一级页与数据模型

**Files:**
- Modify: `admin/shop/shop_settings.html`

- [ ] 新增 `shippingLocations()`、默认地点修正和列表渲染函数。
- [ ] 将 `inventory-locations` 分支接入 `renderWorkspace()`。
- [ ] 添加默认地点说明、地点行、添加/编辑/设为默认/启停交互与父级消息回写。

### Task 2: 顶层地点表单对话框

**Files:**
- Modify: `admin/common/js/dialog_host.js`

- [ ] 新增 `openShippingLocationDialog(source, location)`，提供地点名称、地址、电话、状态、ERP 同步与默认地点字段。
- [ ] 保存时向 iframe 发送 `rbk-shipping-location-saved`，关闭时清理顶层遮罩和键盘事件。
- [ ] 在父级消息监听器中处理 `rbk-shipping-location-dialog`。

### Task 3: 记录交付

**Files:**
- Modify: `docs/superpowers/specs/2026-08-04-shipping-locations-design.md`
- Modify: `docs/superpowers/plans/2026-08-04-shipping-locations-implementation.md`

- [ ] 将实施结果写入 Obsidian 当日记录；不自动运行浏览器或测试验证。
