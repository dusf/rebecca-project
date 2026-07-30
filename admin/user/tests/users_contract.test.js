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
const dialogJs = fs.readFileSync(path.join(adminRoot, 'common', 'js', 'user_dialog.js'), 'utf8');
const dialogHtml = fs.readFileSync(path.join(adminRoot, 'common', 'html', 'user_dialogs.html'), 'utf8');
const dialogCss = fs.readFileSync(path.join(adminRoot, 'common', 'css', 'user_dialogs.css'), 'utf8');
const userFormJs = fs.readFileSync(path.join(userRoot, 'js', 'user_form.js'), 'utf8');

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
assert.doesNotMatch(js, /\.prompt\s*\(/);
assert.match(js, /window\.parent\.UserDialogs\.openBatchTag/);
assert.match(js, /addTags:/);
assert.match(dialogHtml, /data-user-dialog=["']batch-tag["']/);
assert.match(dialogHtml, /data-user-dialog="csv"[\s\S]*class="um-dialog um-dialog-workflow"/);
assert.match(dialogHtml, /data-user-dialog="shopify"[\s\S]*class="um-dialog um-dialog-workflow"/);
assert.match(dialogCss, /\.um-dialog-workflow\s*\{\s*height:\s*min\(720px,\s*calc\(100vh - 48px\)\);/);
assert.match(dialogCss, /\.um-dialog-body\s*\{[\s\S]*flex:\s*1 1 auto;[\s\S]*overflow:\s*auto;/);
assert.match(dialogCss, /\.um-dialog-header h2\s*\{[\s\S]*font-size:\s*18px;[\s\S]*font-weight:\s*700;/);
assert.match(adminIndex, /common\/css\/user_dialogs\.css\?v=9/);
assert.match(adminIndex, /common\/js\/user_dialog\.js\?v=9/);
assert.match(dialogJs, /common\/html\/user_dialogs\.html\?v=9/);
assert.match(dialogJs, /MARKETING_STATUS_LABELS\[record\.marketingStatus\]\s*\|\|\s*'未知状态'/);
assert.match(dialogJs, /subscribed:\s*'已订阅'[\s\S]*not_subscribed:\s*'未订阅'[\s\S]*unsubscribed:\s*'已退订'[\s\S]*pending:\s*'待确认'[\s\S]*invalid:\s*'无效邮箱'/);
assert.match(dialogJs, /一个域名对应一个店铺，且必须单独完成授权/);
assert.match(dialogJs, /输入域名仅用于定位店铺/);
assert.match(dialogJs, /data-dialog-action="shopify-connect-new"/);
assert.match(dialogJs, /shopifyStores\(\)\.find/);
assert.match(dialogJs, /openBatchTag:/);
assert.match(dialogJs, /data-dialog-action=["']batch-tag-confirm["']/);
assert.match(dialogJs, /await invokeHookAsync\(['"]addTags['"]/);
assert.doesNotMatch(dialogJs, /revalidateDeletionRisk/);
assert.match(dialogJs, /await invokeHookAsync\(['"]removeUsersIfRiskUnchanged['"]/);
assert.match(js, /removeUsersIfRiskUnchanged:/);
assert.match(js, /getUsers:\s*\(ids\)/);
assert.match(js, /UserStore\.importProfilesLocked/);
assert.match(js, /UserStore\.addTagToUsersLocked/);
assert.match(js, /UserStore\.setMarketingStatusLocked/);
assert.match(js, /UserStore\.setAccountStatusLocked/);
assert.match(js, /UserStore\.removeUsersIfRiskUnchangedLocked/);
assert.match(userFormJs, /await root\.UserStore\.updateLocked/);
assert.match(userFormJs, /root\.UserStore\.createManualLocked/);
assert.match(userFormJs, /UserStore\.removeUsersIfRiskUnchangedLocked/);
assert.match(dialogJs, /async function handleClick/);
assert.doesNotMatch(dialogJs, /不完整营销授权会计入跳过|按未订阅导入并计入跳过/);
assert.match(dialogJs, /授权降级/);

assert.match(js, /data-row-action=["']copy-email["']/);
assert.match(js, /navigator\.clipboard/);

assert.match(css, /\.um-column-row\.is-dragging/);
assert.match(css, /\.um-column-row\.is-drag-over/);
assert.match(css, /\.um-list-page \.um-page-container\s*\{[\s\S]*width:\s*100%;[\s\S]*max-width:\s*none;[\s\S]*padding:\s*16px 24px 24px;/);
assert.match(html, /id="userTotalCount">\(0位\)<\/span>/);
assert.match(html, /href="css\/users\.css\?v=6"/);
assert.match(html, /<h1 class="page-title">用户管理/);
assert.match(html, /集中管理当前店铺的买家账号、邮件订阅者及从外部店铺导入的用户档案/);
assert.match(html, /同一邮箱只保留一条用户档案。邮件订阅与账号注册相互独立；仅订阅用户后续注册或快捷登录时会激活原档案。/);
assert.match(html, /src="js\/users\.js\?v=6"/);
assert.match(css, /\.um-title-count\s*\{[\s\S]*margin-left:\s*8px;[\s\S]*font-size:\s*13px;[\s\S]*font-weight:\s*400;/);
assert.match(css, /\.um-list-page \.um-page-subtitle\s*\{[\s\S]*display:\s*inline-flex;[\s\S]*gap:\s*3px;[\s\S]*font-size:\s*12px;/);
assert.match(js, /totalCount\.textContent = '\(' \+ allUsers\.length \+ '位\)'/);

const utils = require('../js/users.js');
const UserStore = require('../js/user_store.js');
const dialogRuntime = require('../../common/js/user_dialog.js');

UserStore.resetForTests([]);
UserStore.resetForTests([
  { id: 'risk-target', email: 'risk-target@example.com', orderCount: 0, externalProfiles: [], stores: [] },
  { id: 'risk-unrelated', email: 'risk-unrelated@example.com', orderCount: 2, externalProfiles: [], stores: [] }
]);
const targetRiskUsers = utils.getUsersForIds(UserStore, ['risk-target']);
assert.deepEqual(targetRiskUsers.map((user) => user.id), ['risk-target']);
assert.equal(dialogRuntime.resolveDeletionRiskState(
  { ok: true, value: targetRiskUsers },
  ['risk-target']
).riskStatus, 'ready', 'the real list hook selector must exclude unrelated users');

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

async function runLockedUiContract() {
  UserStore.resetForTests([]);
  const createdLocked = await UserStore.createManualLocked({
    email: 'locked-form@example.com',
    marketingOptIn: false
  });
  assert.equal(createdLocked.ok, true);
  const importedLocked = await UserStore.importProfilesLocked([
    { email: 'locked-import@example.com', marketingStatus: 'not_subscribed' }
  ], 'shopify_csv');
  assert.equal(importedLocked.ok, true);
  assert.equal(UserStore.findByEmail('locked-import@example.com').email, 'locked-import@example.com');
}

runLockedUiContract().then(() => {
  console.log('users contract tests passed');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
