const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const userRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(userRoot, 'users.html'), 'utf8');
const js = fs.readFileSync(path.join(userRoot, 'js', 'users.js'), 'utf8');
const storeJs = fs.readFileSync(path.join(userRoot, 'js', 'user_store.js'), 'utf8');
const css = fs.readFileSync(path.join(userRoot, 'css', 'users.css'), 'utf8');
const adminRoot = path.resolve(userRoot, '..');
const commonsJs = fs.readFileSync(path.join(adminRoot, 'common', 'js', 'commons.js'), 'utf8');
const commonsCss = fs.readFileSync(path.join(adminRoot, 'common', 'css', 'commons.css'), 'utf8');
const adminIndex = fs.readFileSync(path.join(adminRoot, 'index.html'), 'utf8');

assert.match(commonsJs, /class="sidebar-item\$\{activeClass\}"[^>]*role="link"[^>]*tabindex="0"/);
assert.match(commonsJs, /sidebar\.addEventListener\('keydown'/);
assert.match(commonsJs, /e\.key !== 'Enter' && e\.key !== ' '/);
assert.match(commonsJs, /item\.click\(\)/);
assert.match(commonsCss, /\.sidebar-item:focus-visible/);
assert.match(adminIndex, /item\.setAttribute\('aria-current', item\.dataset\.page === page \? 'page' : 'false'\)/);

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
const UserStore = require('../js/user_store.js');

UserStore.resetForTests([]);
const marketingUser = UserStore.createManual({ email: 'status-flow@example.com', marketingOptIn: false }).user;
assert.equal(UserStore.setMarketingStatus([marketingUser.id], 'pending', { source: 'double_opt_in' }).ok, true);
assert.equal(UserStore.get(marketingUser.id).marketingStatus, 'pending');
assert.equal(UserStore.setMarketingStatus([marketingUser.id], 'invalid', { source: 'delivery_check' }).ok, true);
const invalidMarketingUser = UserStore.get(marketingUser.id);
assert.equal(invalidMarketingUser.marketingStatus, 'invalid');
assert.deepEqual(invalidMarketingUser.consentHistory.map((entry) => entry.status), ['pending', 'invalid']);
assert.equal(invalidMarketingUser.consentHistory[0].source, 'double_opt_in');
assert.ok(invalidMarketingUser.consentHistory[0].consentedAt);
assert.equal(invalidMarketingUser.consentHistory[1].source, 'delivery_check');
assert.ok(invalidMarketingUser.consentHistory[1].consentedAt);

assert.equal(UserStore.importProfiles([
  { email: 'import-pending@example.com', marketingStatus: 'pending' },
  { email: 'import-invalid@example.com', marketingStatus: 'invalid' }
], 'shopify_csv').ok, true);
assert.equal(UserStore.findByEmail('import-pending@example.com').marketingStatus, 'pending');
assert.equal(UserStore.findByEmail('import-invalid@example.com').marketingStatus, 'invalid');
assert.equal(UserStore.findByEmail('import-pending@example.com').consentHistory.at(-1).status, 'pending');
assert.equal(UserStore.findByEmail('import-invalid@example.com').consentHistory.at(-1).status, 'invalid');
assert.equal(UserStore.findByEmail('import-pending@example.com').consentHistory.at(-1).source, 'shopify_csv');
assert.ok(UserStore.findByEmail('import-invalid@example.com').consentHistory.at(-1).consentedAt);
UserStore.resetForTests(UserStore.list());
assert.equal(UserStore.findByEmail('import-pending@example.com').marketingStatus, 'pending');
assert.equal(UserStore.findByEmail('import-invalid@example.com').marketingStatus, 'invalid');
assert.equal(UserStore.importProfiles([
  { email: 'import-pending@example.com', marketingStatus: 'invalid' }
], 'shopify_csv').ok, true);
const importedStatusUpdate = UserStore.findByEmail('import-pending@example.com');
assert.equal(importedStatusUpdate.marketingStatus, 'invalid');
assert.deepEqual(importedStatusUpdate.consentHistory.map((entry) => entry.status), ['pending', 'invalid']);

const baseFilters = {
  accountStatus: 'all',
  source: 'all',
  authProvider: 'all',
  storeId: 'all',
  createdFrom: '',
  createdTo: ''
};
assert.equal(utils.matchesUserFilters({ marketingStatus: 'pending' }, { ...baseFilters, marketingStatus: 'pending' }), true);
assert.equal(utils.matchesUserFilters({ marketingStatus: 'invalid' }, { ...baseFilters, marketingStatus: 'invalid' }), true);
assert.equal(utils.matchesUserFilters({ marketingStatus: 'invalid' }, { ...baseFilters, marketingStatus: 'pending' }), false);

assert.deepEqual(utils.reorderColumns(['A', 'B', 'C'], 'A', 'C', 'user'), ['B', 'A', 'C']);
assert.deepEqual(utils.reorderColumns(['A', 'B', 'C'], 'C', 'A', 'user'), ['C', 'A', 'B']);
assert.deepEqual(utils.reorderColumns(['user', 'A', 'B'], 'user', 'B', 'user'), ['user', 'A', 'B']);

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
