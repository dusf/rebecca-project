# CSV Import Async Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three-step CSV import wizard with a Shopify-aligned two-step upload/preview flow and a separate asynchronous progress/result task.

**Architecture:** Keep CSV parsing and header alias recognition in `user_dialog.js`, remove user-facing mapping controls, and start a parent-window `csvJob` after preview confirmation. Surface job snapshots through existing page hooks so the user list import menu and a separate progress dialog stay synchronized.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing `UserDialogs` and `UserPageHooks`.

## Global Constraints

- CSV dialog title is always `从 CSV 导入`.
- Dialog titles use 16px; body text uses 14px and helper text uses 12px.
- CSV uses two Shopify-style steps: `上传文件` and `数据预览`.
- Do not run browser acceptance unless the user explicitly requests it.
- Do not commit or push unless the user explicitly requests it.

---

### Task 1: Two-step CSV launch dialog

**Files:**
- Modify: `admin/common/js/user_dialog.js`
- Modify: `admin/common/css/user_dialogs.css`
- Test: `admin/user/tests/user_dialog.test.js`

**Interfaces:**
- Consumes: `autoCsvMapping(headers)`, `buildCsvRecords(rows, mapping)`.
- Produces: `csvRequiredHeadersPresent(headers, mapping): boolean`, two-step `renderCsv()`.

- [x] Replace the three-step renderer with upload and preview renderers using `shopifyStepsMarkup(['上传文件', '数据预览'], step)`.
- [x] Reject a parsed file before preview when no known email header maps to the required email field.
- [x] Remove mapping controls and four validation cards from the preview while retaining the first five preview rows.
- [x] Make the upload zone fill the available first-step content height with a normal footer gap.

### Task 2: Parent CSV asynchronous job

**Files:**
- Modify: `admin/common/html/user_dialogs.html`
- Modify: `admin/common/js/user_dialog.js`
- Modify: `admin/common/css/user_dialogs.css`
- Test: `admin/user/tests/user_dialog.test.js`

**Interfaces:**
- Produces: `csvJobSnapshot(job)`, `startCsvJob(records, fileName, hooks)`, `openCsvImportProgress()`, `getCsvImportState()`.
- Emits: `hooks.onCsvImportProgress(snapshot)`.

- [x] Add a dedicated `csv-progress` overlay using the existing compact progress-dialog structure.
- [x] Start the job when the user clicks `csv-import`, close the launch dialog immediately, and update queued/running/completed/failed snapshots.
- [x] Import valid records through `hooks.importUsers(records, 'shopify_csv')`; merge skipped missing-email and failed invalid-email counts into the final result.
- [x] Render progress, result cards, failure copy, and `再次导入` without a third wizard step.

### Task 3: User-list import status

**Files:**
- Modify: `admin/user/users.html`
- Modify: `admin/user/js/users.js`
- Modify: `admin/user/css/users.css`
- Test: `admin/user/tests/users_contract.test.js`

**Interfaces:**
- Consumes: `UserDialogs.openCsvImportProgress()`, `UserDialogs.getCsvImportState()`.
- Produces: `UserPageHooks.onCsvImportProgress(detail)`.

- [x] Add CSV task icon/label nodes to the import menu and reuse the existing running/completed/failed icon classes.
- [x] Normalize, render, and hydrate CSV job state; clicking the CSV item opens progress while any job snapshot exists and starts a new flow only when idle.
- [x] Let the header import indicator reflect either Shopify or CSV activity and refresh the user list when CSV import completes.

### Task 4: Cache versions, specifications, and static coverage

**Files:**
- Modify: `admin/index.html`
- Modify: `admin/user/users.html`
- Modify: `admin/user/tests/user_dialog.test.js`
- Modify: `admin/user/tests/users_contract.test.js`
- Modify: `docs/superpowers/specs/2026-07-29-user-management-design.md`
- Modify: `D:/Obsidian/Codex-Memory/01-Long-Term/User Preferences.md`

**Interfaces:**
- Produces: cache-busted asset references and durable CSV workflow rules.

- [x] Update contract assertions for two steps, absent mapping/stat cards, async public APIs, menu state nodes, and new asset versions.
- [x] Record the approved two-step and async-progress rules in project and Obsidian specifications.
- [x] Run only `node --check` for changed scripts and `git diff --check`; do not run browser acceptance.
