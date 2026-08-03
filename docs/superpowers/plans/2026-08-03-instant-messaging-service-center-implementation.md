# 即时通讯服务商连接中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在配置页完成可扩展服务商连接中心和买家端挂载原型。

**Architecture:** 扩展 `admin/shop/shop_settings.html` 的 `settings.messaging` 状态；分离 `provider`（当前启用）与 `messagingManagingProvider`（当前管理）。装修页挂载作为配置模型和预览，不修改不存在的装修器。

**Tech Stack:** 静态 HTML、原生 JavaScript、Node 内置 `node:test`。

## Global Constraints

- 可连接多家，但买家端仅启用一家公司。
- 全站悬浮与装修页内嵌模式互斥。
- 不调用 API、不加载 SDK、不接收脚本粘贴；密钥保持掩码显示。
- 现有内容富文本编辑器不是店铺装修器，不在其中嵌入代码。

---

### Task 1: 服务商连接中心

**Files:**
- Modify: `admin/shop/shop_settings.html`
- Modify: `admin/shop/tests/shop_settings_messaging.test.js`

- [x] 将服务商卡片改为当前启用摘要和可搜索的紧凑服务商列表，展示十个服务商容量示例、状态和管理操作。
- [x] 分离“当前启用”和“当前管理”；已连接服务商才可设为当前启用。
- [x] 更新回归测试，检查服务商连接中心、当前启用和管理入口标记。

### Task 2: 买家端挂载模型

**Files:**
- Modify: `admin/shop/shop_settings.html`

- [x] 新增 `display.mode` 与 `display.pageScopes`，提供全站悬浮和装修页内嵌两种互斥选择。
- [x] 为内嵌模式展示装修页“应用区块 > 即时通讯”的未来放置说明和内嵌预览。
- [x] 保存、重置和预览均使用当前启用服务商，且未启用服务商时禁用展示开关。

### Task 3: 验收

**Files:**
- Test: `admin/shop/tests/shop_settings_messaging.test.js`

- [x] 运行 Node 测试与 `git diff --check`。
- [x] 浏览器验证十项服务商列表、连接/启用区分、挂载方式互斥和预览变化。
