const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const userRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(userRoot, 'users.html'), 'utf8');
const js = fs.readFileSync(path.join(userRoot, 'js', 'users.js'), 'utf8');
const storeJs = fs.readFileSync(path.join(userRoot, 'js', 'user_store.js'), 'utf8');
const css = fs.readFileSync(path.join(userRoot, 'css', 'users.css'), 'utf8');

assert.doesNotMatch(js, /data-account-status=["']registered["']/);
assert.doesNotMatch(js, /设为已注册|批量启用/);
assert.match(storeJs, /previousAccountStatus/);
assert.match(js, /data-account-action=["']restore["']/);

['pending', 'invalid'].forEach((value) => {
  assert.match(js, new RegExp(`option\\('${value}',`));
});
[
  'storefront',
  'newsletter_footer',
  'newsletter_registration',
  'newsletter_checkout',
  'admin',
  'shopify_api',
  'shopify_csv'
].forEach((value) => {
  assert.match(js, new RegExp(`option\\('${value}',`));
});
['password', 'google', 'facebook', 'tiktok', 'instagram', 'x'].forEach((value) => {
  assert.match(js, new RegExp(`option\\('${value}',`));
});

assert.match(js, /user\.id/);
assert.match(js, /um-user-id/);

assert.doesNotMatch(html, /class=["'][^"']*um-text-control[^"']*["'][^>]*type=["']date["']/);
assert.match(js, /um-date-native/);
assert.match(js, /um-date-trigger/);
assert.match(js, /um-date-popover/);

assert.match(js, /draggable=["']true["']/);
assert.match(js, /dragstart/);
assert.match(js, /drop/);
assert.match(js, /data-column-reset/);
assert.match(js, /恢复默认/);

const loadingGuards = js.match(/if \(state\.status !== 'ready'\) return;/g) || [];
assert.ok(loadingGuards.length >= 3, 'selection and bulk handlers must guard non-ready state');
assert.match(js, /const selectionDisabled = state\.status !== 'ready'/);
assert.match(js, /selectionDisabled \? ' disabled'/);

assert.match(js, /window\.parent\.UserDialogs\.openDeleteConfirm\(options\)/);
assert.doesNotMatch(js, /openDeleteUsers|openRemoveUsers/);

assert.match(js, /data-row-action=["']copy-email["']/);
assert.match(js, /navigator\.clipboard/);

assert.match(css, /\.um-column-row\.is-dragging/);
assert.match(css, /\.um-column-row\.is-drag-over/);

const utils = require('../js/users.js');
assert.equal(utils.neutralizeCsvFormula(' =2+2'), "' =2+2");
assert.equal(utils.neutralizeCsvFormula('+SUM(A1:A2)'), "'+SUM(A1:A2)");
assert.equal(utils.neutralizeCsvFormula('\t-10'), "'\t-10");
assert.equal(utils.neutralizeCsvFormula('@danger'), "'@danger");
assert.equal(utils.neutralizeCsvFormula('safe@example.com'), 'safe@example.com');

const first = { id: 'usr_a', lastLoginAt: null };
const second = { id: 'usr_b', lastLoginAt: null };
assert.equal(utils.compareUsers(first, second, { key: 'lastLoginAt', direction: 'asc' }) < 0, true);
assert.equal(utils.compareUsers(first, second, { key: 'lastLoginAt', direction: 'desc' }) < 0, true);
assert.equal(utils.matchesSearchQuery({ id: 'USR-900', email: 'other@example.com' }, 'usr-900'), true);

console.log('users contract tests passed');
