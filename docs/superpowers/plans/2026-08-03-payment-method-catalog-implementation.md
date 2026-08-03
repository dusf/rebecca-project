# Payment Method Catalog Implementation Plan

> **For agentic workers:** Execute inline. The user requires direct implementation, no automatic test or browser verification, and no automatic commit.

**Goal:** Replace the fixed buyer payment-method cards with an extensible payment-method catalog managed from a parent-hosted full-screen dialog.

**Architecture:** `shop_settings.html` owns provider capabilities, enabled buyer methods, and checkout order in local prototype state. The primary page shows only enabled methods and the provider connection list. `dialog_host.js` renders the catalog dialog at the browser top level and returns the selected, ordered methods to the iframe via `postMessage`.

**Tech Stack:** Static HTML, CSS, JavaScript, same-origin iframe `postMessage`.

## Global Constraints

- Buyer-facing methods use business language; providers supply capabilities and are not buyer-facing labels.
- Merchant workflows use enable, disable, reorder, connect, and status language; no API credentials are exposed.
- Every dialog is a browser-top-level full-screen overlay through `#dialogHost`.
- Helper copy uses 12px; dialog title uses 16px.
- Do not automatically run tests, browser verification, diff checks, or git commits.

---

### Task 1: Build the payment-method state and primary summary

**Files:**
- Modify: `admin/shop/shop_settings.html`
- Modify: `admin/shop/tests/shop_settings_payments.test.js`

- [ ] Replace the fixed `cards`, `paypal`, and `afterpay` booleans with an ordered `buyerMethods` array.
- [ ] Define catalog entries for credit card, PayPal, Afterpay, Apple Pay, Google Pay, Klarna, iDEAL, bank transfer, and local payments; each includes `key`, `name`, `category`, `description`, and provider capability requirements.
- [ ] Compute method availability from connected provider capabilities.
- [ ] Render only enabled methods in a compact ordered list with a single `管理支付方式` entry point.
- [ ] Preserve existing provider connection and credit-card route behavior.

### Task 2: Add a parent-hosted payment-method manager

**Files:**
- Modify: `admin/common/js/dialog_host.js`
- Modify: `admin/shop/shop_settings.html`

- [ ] Add `openPaymentMethodCatalogDialog(source, catalog, enabledMethods)` using fixed `inset:0` under `#dialogHost`.
- [ ] Present searchable, grouped method rows with available, unavailable, enabled, and order states.
- [ ] Provide enable/disable and move-up/move-down controls; preserve the current checkout order.
- [ ] Return `{ type: 'rbk-payment-methods-saved', buyerMethods }` to the active iframe on save.
- [ ] Re-render the primary summary and persist local prototype state after receipt.

### Task 3: Update static coverage without executing it

**Files:**
- Modify: `admin/shop/tests/shop_settings_payments.test.js`

- [ ] Assert the catalog model, management message pair, and top-level host dialog function are present.
- [ ] Do not execute tests unless the user explicitly asks.
