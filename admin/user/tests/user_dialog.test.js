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

  const headers = ['Email', 'Accepts Email Marketing', 'Consent Source', 'Consented At'];
  const mapping = dialog.autoCsvMapping(headers);
  const validRecord = dialog.buildCsvRecords([
    ['valid@example.com', 'yes', 'checkout', '2026-07-01T10:00:00.000Z']
  ], mapping)[0];
  assert.strictEqual(validRecord.marketingStatus, 'subscribed');
  assert.strictEqual(validRecord.consent.consentedAt, '2026-07-01T10:00:00.000Z');

  const invalidRecord = dialog.buildCsvRecords([
    ['invalid@example.com', 'yes', 'checkout', 'not-a-date']
  ], mapping)[0];
  assert.strictEqual(invalidRecord.marketingStatus, 'not_subscribed');
  assert.strictEqual(invalidRecord.importIssue, 'invalid_consent_time');
  const invalidValidation = dialog.validateCsvRecords([invalidRecord]);
  assert.strictEqual(invalidValidation.consentInvalid, 1);
  assert.deepStrictEqual(
    dialog.mergeCsvImportResult(
      { ok: true, counts: { created: 1, merged: 0, skipped: 0, failed: 0 } },
      invalidValidation
    ),
    {
      ok: true,
      counts: { created: 1, merged: 0, skipped: 0, failed: 0 },
      warnings: { consentDowngraded: 1 }
    },
    'a downgraded subscribed row is imported once and reported separately as a warning'
  );
  assert.strictEqual(dialog.parseConsentDateTime('2026-02-30T10:00:00Z'), '');

  const invalidEmailValidation = dialog.validateCsvRecords([
    {
      email: 'not-an-email',
      marketingStatus: 'not_subscribed',
      importIssue: 'invalid_consent_time'
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
  assert(source.includes('aria-activedescendant'), 'combobox active descendant semantics must exist');
  assert(source.includes('无匹配选项'), 'combobox no-match state must exist');
  assert(source.includes('isComposing') && source.includes('keyCode'), 'combobox must ignore IME commit keys');
  assert.strictEqual(
    (source.match(/connectionState: 'connected'/g) || []).length,
    3,
    'three saved Shopify stores must be connected'
  );
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

  console.log('user dialog runtime tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
