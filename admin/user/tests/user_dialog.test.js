const assert = require('assert');
const fs = require('fs');
const path = require('path');

const dialogPath = path.join(__dirname, '../../common/js/user_dialog.js');
const dialog = require(dialogPath);

async function run() {
  const quoted = dialog.parseCsv(
    'First Name,Last Name,Email\r\nAva,"Wang, Jr.",ava@example.com\r\nLeo,"O""Connor",leo@example.com'
  );
  assert.strictEqual(quoted[1][1], 'Wang, Jr.', 'quoted commas stay in one field');
  assert.strictEqual(quoted[2][1], 'O"Connor', 'escaped quotes are unescaped');
  assert.strictEqual(
    dialog.parseCsv('Email,Phone,Note\r\nava@example.com,,')[1].length,
    3,
    'trailing empty columns are retained'
  );

  assert.throws(
    () => dialog.parseCsv('Email,First Name\r\n"broken@example.com,Ava'),
    (error) => error && error.code === 'CSV_UNCLOSED_QUOTE',
    'unclosed quote must be a parser error'
  );
  assert.throws(
    () => dialog.parseCsv('Email,First Name\r\nava@example.com,Ava,Extra'),
    (error) => error && error.code === 'CSV_COLUMN_MISMATCH',
    'row width must match the header'
  );

  const headers = ['邮箱（必填）', '标签', '订阅状态', '短信营销授权', 'WhatsApp 营销授权'];
  const mapping = dialog.autoCsvMapping(headers);
  const validRecord = dialog.buildCsvRecords([
    ['valid@example.com', 'VIP|高价值客户', '已订阅', '是', '否']
  ], mapping)[0];
  assert.strictEqual(validRecord.marketingStatus, 'subscribed');
  assert.strictEqual(validRecord.consent.source, 'csv_import');
  assert.deepStrictEqual(validRecord.tags, ['VIP', '高价值客户']);
  assert.deepStrictEqual(validRecord.marketingChannels, { sms: true, whatsapp: false });

  const blankOptionalRecord = dialog.buildCsvRecords([
    ['blank@example.com', '', '', '', '']
  ], mapping)[0];
  assert.strictEqual(Object.prototype.hasOwnProperty.call(blankOptionalRecord, 'marketingStatus'), false);
  assert.deepStrictEqual(blankOptionalRecord.marketingChannels, {});

  const invalidEmailValidation = dialog.validateCsvRecords([
    {
      email: 'not-an-email',
      marketingStatus: 'not_subscribed'
    }
  ]);
  assert.deepStrictEqual(
    dialog.mergeCsvImportResult(
      { ok: true, counts: { created: 0, merged: 0, skipped: 0, failed: 0 } },
      invalidEmailValidation
    ).counts,
    { created: 0, merged: 0, skipped: 0, failed: 1 },
    'an invalid email is failed exactly once and is not skipped'
  );
  const missingEmailValidation = dialog.validateCsvRecords([
    { email: '', marketingStatus: 'not_subscribed' }
  ]);
  assert.deepStrictEqual(
    dialog.mergeCsvImportResult(
      { ok: true, counts: { created: 0, merged: 0, skipped: 0, failed: 0 } },
      missingEmailValidation
    ).counts,
    { created: 0, merged: 0, skipped: 1, failed: 0 },
    'a missing email is skipped exactly once and is not failed'
  );

  let deletionRisk = dialog.resolveDeletionRiskState(
    { ok: false, error: 'storage unavailable', value: null },
    ['user-1']
  );
  assert.strictEqual(deletionRisk.riskStatus, 'error');
  assert.strictEqual(dialog.canPermanentlyDelete(deletionRisk), false);
  assert.match(deletionRisk.error, /无法读取订单或 Shopify 关联风险/);
  deletionRisk = dialog.resolveDeletionRiskState(
    {
      ok: true,
      value: [{ id: 'user-1', orderCount: 2, stores: [{ id: 'store-1' }] }]
    },
    ['user-1']
  );
  assert.strictEqual(deletionRisk.riskStatus, 'ready', 'a successful retry makes risk data ready');
  assert.strictEqual(dialog.canPermanentlyDelete(deletionRisk), true);
  assert.ok(deletionRisk.version);
  [
    { value: [] },
    { value: [{ id: 'user-1' }, { id: 'user-1' }] },
    { value: [{ id: '' }] }
  ].forEach((malformed) => {
    const rejectedRisk = dialog.resolveDeletionRiskState(
      { ok: true, value: malformed.value },
      ['user-1']
    );
    assert.strictEqual(rejectedRisk.riskStatus, 'error');
    assert.strictEqual(dialog.canPermanentlyDelete(rejectedRisk), false);
  });
  const duplicateTargets = dialog.resolveDeletionRiskState(
    { ok: true, value: [{ id: 'user-1' }] },
    ['user-1', 'user-1']
  );
  assert.strictEqual(duplicateTargets.riskStatus, 'error');
  const changedDeletionRisk = dialog.resolveDeletionRiskState(
    { ok: true, value: [{ id: 'user-1', orderCount: 3, stores: [{ id: 'store-1' }] }] },
    ['user-1']
  );
  assert.notStrictEqual(changedDeletionRisk.version, deletionRisk.version);

  const gate = dialog.createSessionGate();
  const oldToken = gate.next();
  let resolveOld;
  const oldTask = dialog.settleSessionTask(
    new Promise((resolve) => { resolveOld = resolve; }),
    gate,
    oldToken
  );
  const currentToken = gate.next();
  resolveOld('old');
  assert.deepStrictEqual(await oldTask, { current: false, value: 'old' });
  assert.deepStrictEqual(
    await dialog.settleSessionTask(Promise.resolve('current'), gate, currentToken),
    { current: true, value: 'current' }
  );
  const rejectedToken = gate.next();
  const staleRejection = dialog.settleSessionTask(Promise.reject(new Error('late error')), gate, rejectedToken)
    .catch((outcome) => outcome);
  gate.next();
  const staleError = await staleRejection;
  assert.strictEqual(staleError.current, false, 'old rejected reads must be marked stale');
  assert.strictEqual(staleError.error.message, 'late error');

  const records = [
    { id: 'subscriber', firstName: 'Ava', email: 'ava@example.com', profileKind: 'subscriber', marketingStatus: 'subscribed' },
    { id: 'customer', firstName: 'Leo', email: 'leo@example.com', profileKind: 'customer', marketingStatus: 'not_subscribed' }
  ];
  assert.deepStrictEqual(
    dialog.filterShopifyRecords(records, { search: 'ava', kind: 'all', status: 'all' }).map((item) => item.id),
    ['subscriber']
  );
  let selected = dialog.setCurrentSelection(new Set(['outside']), ['subscriber', 'customer'], true);
  assert.deepStrictEqual([...selected].sort(), ['customer', 'outside', 'subscriber']);
  selected = dialog.setCurrentSelection(selected, ['subscriber'], false);
  assert.deepStrictEqual([...selected].sort(), ['customer', 'outside']);

  assert.deepStrictEqual(dialog.getComboKeyAction({ key: 'ArrowDown' }, 0, 3), {
    handled: true, index: 1, select: false, close: false
  });
  assert.deepStrictEqual(dialog.getComboKeyAction({ key: 'ArrowUp' }, 0, 3), {
    handled: true, index: 2, select: false, close: false
  });
  assert.deepStrictEqual(dialog.getComboKeyAction({ key: 'Home' }, 2, 3), {
    handled: true, index: 0, select: false, close: false
  });
  assert.deepStrictEqual(dialog.getComboKeyAction({ key: 'End' }, 0, 3), {
    handled: true, index: 2, select: false, close: false
  });
  assert.deepStrictEqual(dialog.getComboKeyAction({ key: 'Enter', isComposing: true, keyCode: 229 }, 0, 3), {
    handled: false, index: 0, select: false, close: false
  });
  assert.strictEqual(dialog.getComboKeyAction({ key: 'Enter' }, 1, 3).select, true);
  assert.strictEqual(dialog.getComboKeyAction({ key: 'Escape' }, 1, 3).close, true);
  assert.strictEqual(dialog.getComboKeyAction({ key: 'Escape' }, -1, 0).close, true);

  assert.strictEqual(dialog.canRestoreFocus({
    navigationMatches: true,
    frameIsActive: true,
    frameVisible: true,
    targetConnected: true
  }), true);
  assert.strictEqual(dialog.canRestoreFocus({
    navigationMatches: false,
    frameIsActive: true,
    frameVisible: true,
    targetConnected: true
  }), false);
  assert.strictEqual(dialog.canRestoreFocus({
    navigationMatches: true,
    frameIsActive: false,
    frameVisible: false,
    targetConnected: true
  }), false);
  assert.strictEqual(dialog.canRestoreFocus({
    navigationMatches: true,
    frameIsActive: true,
    frameVisible: true,
    targetConnected: false
  }), false);
  const menuSummary = { id: 'menu-summary' };
  assert.strictEqual(dialog.resolveFocusableOpener({
    closest(selector) {
      assert.strictEqual(selector, 'details:not([open])');
      return {
        querySelector(summarySelector) {
          assert.strictEqual(summarySelector, 'summary');
          return menuSummary;
        }
      };
    }
  }), menuSummary);

  assert.deepStrictEqual(dialog.normalizeHookResult({ ok: false, error: '拒绝导入' }), {
    ok: false,
    error: '拒绝导入',
    value: null
  });
  assert.deepStrictEqual(
    await dialog.settleHookResult(Promise.resolve({ ok: true, counts: { created: 1 } })),
    {
      ok: true,
      error: '',
      value: { ok: true, counts: { created: 1 } }
    },
    'async import hooks must settle before the dialog advances'
  );
  const asyncFailure = await dialog.settleHookResult(Promise.resolve({
    ok: false,
    code: 'LOCK_UNAVAILABLE',
    error: '无法取得安全写锁',
    removed: 0
  }));
  assert.strictEqual(asyncFailure.ok, false);
  assert.strictEqual(asyncFailure.failure.code, 'LOCK_UNAVAILABLE');
  assert.deepStrictEqual(
    await dialog.settleHookResult(Promise.reject(new Error('异步写入失败'))),
    { ok: false, error: '异步写入失败', value: null },
    'rejected async hooks must become retryable operation failures'
  );
  assert.deepStrictEqual(dialog.normalizeHookResult({ ok: true, counts: { created: 1 } }), {
    ok: true,
    error: '',
    value: { ok: true, counts: { created: 1 } }
  });
  assert.strictEqual(dialog.normalizeHookResult(undefined, true).ok, true);

  const source = fs.readFileSync(dialogPath, 'utf8');
  assert(!/type=["']checkbox["']/i.test(source), 'dialog manager must not render native checkboxes');
  assert(!/datetime-local/i.test(source), 'dialog manager must not render native datetime-local');
  assert(source.includes('role="checkbox"'), 'self-drawn checkbox semantics must exist');
  assert(source.includes("openExportUsers: function"), 'export dialog API must exist');
  assert(source.includes('data-dialog-action="export-confirm"'), 'export field confirmation must exist');
  assert(!source.includes("name === 'marketing-action'"), 'marketing dialog must not expose a redundant grant or revoke action');
  assert(!source.includes('marketing-source'), 'marketing dialog must not expose consent source, time, or note fields');
  assert(!source.includes("label: '同意来源'") && !source.includes("label: '同意时间'"), 'CSV mapping must not expose removed consent metadata fields');
  assert(source.includes("label: '订阅状态'"), 'CSV mapping must use the current subscription status wording');
  assert(source.includes("label: '短信营销授权'"), 'CSV mapping must include SMS marketing authorization');
  assert(source.includes("label: 'WhatsApp 营销授权'"), 'CSV mapping must include WhatsApp marketing authorization');
  assert(source.includes('data-dialog-action="csv-template"'), 'CSV dialog must provide a downloadable current template');
  assert(source.includes("shopifyStepsMarkup(['上传文件', '数据预览']"), 'CSV dialog must reuse the Shopify two-step navigation');
  assert(!source.includes('function csvMappingMarkup'), 'CSV dialog must auto-recognize fields instead of exposing mapping controls');
  assert(!source.includes('renderCsvStep3'), 'CSV result must live in a separate progress dialog');
  assert(source.includes('openCsvImportProgress: function'), 'CSV async progress dialog API must exist');
  assert(source.includes('mia.chen@example.com,Mia,Chen,13800001001'), 'CSV template must include a complete subscribed example row');
  assert(source.includes('leo.wang@example.com,Leo,Wang,13800001002'), 'CSV template must include a second marketing authorization example row');
  assert(source.includes("ava.oconnor@example.com,Ava,O'Connor"), 'CSV template must include an optional-field example row');
  assert(source.includes('邮箱（必填）'), 'CSV template must identify the required email column');
  assert(source.includes('data-dialog-action="marketing-toggle-channel"'), 'marketing dialog must support selecting multiple channels');
  assert(source.includes('客户同意接收营销电子邮件。'), 'marketing dialog must align with the add-user email consent wording');
  assert(source.includes('客户同意接收营销短信。'), 'marketing dialog must align with the add-user SMS consent wording');
  assert(source.includes('客户同意接收 WhatsApp 营销消息。'), 'marketing dialog must align with the add-user WhatsApp consent wording');
  assert(source.includes("invokeHookAsync('updateMarketingChannel'"), 'non-email marketing must use the channel hook');
  assert(source.includes("source: 'admin'"), 'marketing dialog must record admin consent metadata internally');
  assert(source.includes('data-dialog-action="batch-tag-add"'), 'tag dialog must support creating multiple tags');
  assert(source.includes('data-dialog-action="batch-tag-remove"'), 'tag dialog must support removing staged tags');
  assert(source.includes("invokeHookAsync('addTags', [state.batchTag.ids, tags])"), 'tag dialog must submit all staged tags together');
  assert(source.includes('aria-activedescendant'), 'combobox active descendant semantics must exist');
  assert(source.includes('无匹配选项'), 'combobox no-match state must exist');
  assert(source.includes('isComposing') && source.includes('keyCode'), 'combobox must ignore IME commit keys');
  assert(!source.includes("connectionState: 'connected'"), 'Shopify OAuth must not expose a saved-store chooser');
  assert(
    (source.match(/csvSessionGate\.next\(\)/g) || []).length >= 3,
    'CSV open, close, and reads must invalidate prior sessions'
  );
  assert(source.includes('data-dialog-action="delete-risk-retry"'), 'delete risk errors expose retry');
  assert(
    source.includes("state.deletion.riskStatus !== 'ready'"),
    'remove event handling must guard unknown risk even if manually triggered'
  );
  assert(
    source.includes('无法读取订单或 Shopify 关联风险'),
    'delete risk failures must be explicit'
  );
  assert(
    source.includes("code === 'LOCK_UNAVAILABLE'") &&
      source.includes('state.deletion.lockUnavailable'),
    'lock-unavailable deletion must remain fail closed'
  );
  assert(
    source.includes('当前浏览器无法取得安全写锁') &&
      source.includes('改为禁用账号'),
    'lock-unavailable deletion must offer the reversible disable alternative'
  );

  console.log('user dialog runtime tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
