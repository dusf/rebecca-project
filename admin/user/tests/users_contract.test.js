const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const userRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(userRoot, 'users.html'), 'utf8');
const js = fs.readFileSync(path.join(userRoot, 'js', 'users.js'), 'utf8');
const componentsJs = fs.readFileSync(path.join(userRoot, 'js', 'user_components.js'), 'utf8');
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
const userFormHtml = fs.readFileSync(path.join(userRoot, 'user_form.html'), 'utf8');
const productListHtml = fs.readFileSync(path.join(adminRoot, 'product', 'product_list.html'), 'utf8');
const addProductHtml = fs.readFileSync(path.join(adminRoot, 'product', 'add_product.html'), 'utf8');
const editProductHtml = fs.readFileSync(path.join(adminRoot, 'product', 'edit_product.html'), 'utf8');

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
assert.match(js, /<div class="um-user-email"[\s\S]*<div class="um-user-id">/);
assert.doesNotMatch(js, /um-avatar|um-user-name|编号：/);
assert.match(html, /placeholder="搜索编号、邮箱、手机号或标签"/);
assert.doesNotMatch(html, /id="userStoreFilter"/);

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
assert.match(dialogHtml, /data-user-dialog="shopify"[\s\S]*class="um-dialog um-dialog-workflow um-dialog-shopify"/);
assert.match(dialogJs, /function shopifyStepsMarkup\(labels, current\)/);
assert.match(dialogJs, /class="um-dialog-step-divider/);
assert.match(dialogJs, /step < current \? '✓' : step/);
assert.equal(
  (dialogJs.match(/shopifyStepsMarkup\(\['选择店铺', '选择用户', '导入结果'\], [123]\)/g) || []).length,
  4
);
assert.match(dialogCss, /\.um-dialog-workflow\s*\{\s*height:\s*min\(720px,\s*calc\(100vh - 48px\)\);/);
assert.match(dialogCss, /\.um-dialog-body\s*\{[\s\S]*flex:\s*1 1 auto;[\s\S]*overflow:\s*auto;/);
assert.match(dialogCss, /\.um-dialog-header h2\s*\{[\s\S]*font-size:\s*18px;[\s\S]*font-weight:\s*700;/);
assert.match(dialogCss, /\.um-dialog-shopify\s*\{[\s\S]*width:\s*min\(720px,\s*94vw\);[\s\S]*height:\s*min\(660px,\s*calc\(100vh - 48px\)\);[\s\S]*padding:\s*24px 24px 16px;/);
assert.match(dialogCss, /\.um-dialog-shopify \.um-dialog-header\s*\{[\s\S]*padding:\s*0 0 16px;[\s\S]*border-bottom:\s*0;/);
assert.match(dialogCss, /\.um-dialog-shopify \.um-dialog-body\s*\{[\s\S]*padding:\s*0;/);
assert.match(dialogCss, /\.um-dialog-shopify \.um-dialog-footer\s*\{[\s\S]*padding:\s*16px 0 0;[\s\S]*border-top:\s*0;/);
assert.match(dialogCss, /\.um-shopify-dialog-steps\s*\{[\s\S]*display:\s*flex;[\s\S]*justify-content:\s*center;[\s\S]*padding:\s*16px 20px;[\s\S]*border-top:/);
assert.match(dialogCss, /\.um-shopify-dialog-steps \.um-dialog-step-num\s*\{[\s\S]*width:\s*26px;[\s\S]*height:\s*26px;/);
assert.match(dialogCss, /\.um-shopify-dialog-steps \.um-dialog-step-divider\s*\{[\s\S]*width:\s*40px;[\s\S]*height:\s*2px;/);
assert.match(dialogCss, /\.um-shopify-dialog-steps \.um-dialog-step\.is-complete \.um-dialog-step-num[\s\S]*background:\s*hsl\(var\(--success\)\);/);
assert.match(dialogCss, /@media \(max-width:\s*600px\)[\s\S]*\.um-shopify-dialog-steps \.um-dialog-step-num[\s\S]*width:\s*22px;/);
assert.match(adminIndex, /common\/css\/commons\.css\?v=4/);
assert.match(adminIndex, /common\/css\/user_dialogs\.css\?v=11/);
assert.match(adminIndex, /common\/js\/user_dialog\.js\?v=11/);
assert.match(dialogJs, /common\/html\/user_dialogs\.html\?v=10/);
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
assert.match(html, /href="\.\.\/common\/css\/commons\.css\?v=4"/);
assert.match(html, /href="css\/users\.css\?v=12"/);
assert.match(html, /<h1 class="page-title">用户管理/);
assert.match(html, /集中管理当前店铺的买家账号、邮件订阅者及从外部店铺导入的用户档案/);
assert.match(html, /同一邮箱只保留一条用户档案。邮件订阅与账号注册相互独立；仅订阅用户后续注册或快捷登录时会激活原档案。/);
assert.match(html, /src="\.\.\/common\/js\/commons\.js\?v=4"/);
assert.match(html, /src="js\/user_components\.js\?v=3"/);
assert.match(html, /src="js\/users\.js\?v=11"/);
assert.match(userFormHtml, /href="css\/users\.css\?v=12"/);
assert.match(userFormHtml, /src="js\/user_components\.js\?v=3"/);
assert.match(userFormHtml, /src="js\/user_form\.js\?v=2"/);
assert.match(js, /option\('all', '账号状态', true\)/);
assert.match(js, /option\('all', '营销状态', true\)/);
assert.match(js, /option\('all', '用户来源', true\)/);
assert.match(js, /option\('all', '登录方式', true\)/);
assert.doesNotMatch(js, /\{ key: 'stores', label: '关联店铺' \}|option\('all', '关联店铺', true\)/);
assert.doesNotMatch(js, /全部(?:账号状态|营销状态|用户来源|登录方式)/);
assert.match(commonsCss, /--control-placeholder:\s*30 10% 55%;/);
assert.match(css, /\.um-text-control::placeholder,[\s\S]*\.um-combobox-search::placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(css, /\.um-combobox-trigger\.is-placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(css, /\.um-date-trigger\.is-placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(productListHtml, /href="\.\.\/common\/css\/commons\.css\?v=4"/);
assert.match(productListHtml, /\.search-input input::placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(productListHtml, /\.filter-date\.is-placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(productListHtml, /<option value="">全部状态<\/option>/);
assert.match(commonsJs, /<option value="">全部分类<\/option>/);
assert.match(commonsJs, /function syncFilterPromptState\(control\)/);
assert.match(commonsJs, /control\.classList\.toggle\('is-placeholder', !control\.value\)/);
assert.match(commonsJs, /\.form-select, \.form-input\[type="date"\], \.form-input\[type="datetime-local"\], \.form-input\[type="time"\]/);
assert.match(commonsCss, /\.form-input\.is-placeholder,[\s\S]*\.form-select\.is-placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(addProductHtml, /\.form-input::placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(editProductHtml, /\.form-input::placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(dialogJs, /\{ value: 'all', label: '营销状态' \}/);
assert.doesNotMatch(dialogJs, /label: '全部营销状态'/);
assert.match(dialogCss, /\.um-dialog-input::placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(dialogCss, /\.um-dialog-combobox-trigger\.is-placeholder\s*\{[\s\S]*color:\s*hsl\(var\(--control-placeholder\)\);/);
assert.match(css, /\.um-title-count\s*\{[\s\S]*margin-left:\s*8px;[\s\S]*font-size:\s*13px;[\s\S]*font-weight:\s*400;/);
assert.match(css, /\.um-list-page \.um-page-subtitle\s*\{[\s\S]*display:\s*inline-flex;[\s\S]*gap:\s*3px;[\s\S]*font-size:\s*12px;/);
assert.match(js, /totalCount\.textContent = '\(' \+ allUsers\.length \+ '位\)'/);
assert.match(html, /id="userGuidanceTrigger"[\s\S]*aria-controls="userListGuidance"[\s\S]*查看用户规则/);
assert.match(html, /id="userListGuidance"[\s\S]*data-guidance-action="never-show"[\s\S]*不再展示/);
assert.match(html, /data-guidance-action="close"[\s\S]*aria-label="关闭用户规则提示"/);
assert.match(css, /\.um-dismissible-guidance\[hidden\]\s*\{[\s\S]*display:\s*none;/);
assert.match(css, /\.um-guidance-close\s*\{[\s\S]*width:\s*28px;[\s\S]*height:\s*28px;/);
assert.match(js, /rebecca_user_guidance_never_show_v1/);
assert.match(js, /setGuidanceVisible\(readStorage\(GUIDANCE_PREF_KEY\) !== true, false\)/);
assert.match(js, /writeStorage\(GUIDANCE_PREF_KEY, true\)/);
assert.match(js, /setGuidanceVisible\(true, true\)/);
assert.match(js, /new root\.MutationObserver/);
assert.match(js, /attributeOldValue:\s*true/);
assert.match(js, /if \(isActive && becameActive\) setupGuidance\(\)/);
assert.match(html, /id="userSelectedCount">0<\/span> 条/);
assert.match(html, /id="userColumnMenu"[\s\S]*自定义列/);
assert.match(html, /id="userRefreshButton"[\s\S]*<svg/);
assert.doesNotMatch(html, /class="um-table-tools"/);
assert.match(css, /\.um-list-page\s*\{[\s\S]*overflow:\s*hidden;/);
assert.match(css, /\.um-list-page \.um-page-container\s*\{[\s\S]*height:\s*100%;[\s\S]*display:\s*flex;[\s\S]*overflow:\s*hidden;/);
assert.match(css, /\.um-list-page \.um-table-card\s*\{[\s\S]*flex:\s*1;[\s\S]*min-height:\s*0;[\s\S]*border-top:\s*0;/);
assert.match(css, /\.um-list-page \.um-table-scroll\s*\{[\s\S]*overflow:\s*auto;/);
assert.match(css, /\.um-table-state\[hidden\]\s*\{[\s\S]*display:\s*none;/);
assert.match(css, /\.um-search-input\s*\{[\s\S]*height:\s*38px;[\s\S]*border:\s*1\.5px solid[\s\S]*border-radius:\s*10px;/);
assert.match(css, /\.um-view-tab\s*\{[\s\S]*font:\s*600 14px\/1\.4 var\(--font-sans\);/);
assert.match(css, /\.um-combobox-trigger::after\s*\{[\s\S]*width:\s*14px;[\s\S]*height:\s*14px;[\s\S]*polyline points='6 9 12 15 18 9'/);
assert.match(css, /\.um-combobox-option-sequence\s*\{[\s\S]*font-variant-numeric:\s*tabular-nums;/);
assert.doesNotMatch(css, /decimal-leading-zero/);
assert.match(componentsJs, /sequence:\s*index \+ 1/);
assert.match(componentsJs, /String\(option\.sequence\)\.indexOf\(query\)/);
assert.match(componentsJs, /sequence\.textContent = option\.sequence \+ '\.'/);
assert.match(css, /\.um-table th\s*\{[\s\S]*position:\s*sticky;[\s\S]*height:\s*46px;[\s\S]*background:\s*#F5F0EB;[\s\S]*font-size:\s*14px;/);
assert.match(css, /\.um-table th \.um-checkbox\s*\{[\s\S]*min-height:\s*0;/);
assert.match(css, /\.um-sort-button\s*\{[\s\S]*padding:\s*0;/);
['orderCount', 'totalSpent', 'lastLoginAt', 'createdAt'].forEach((key) => {
  assert.match(js, new RegExp(`\\{ key: '${key}',[^}]*sortable: true`));
});
['accountStatus', 'marketingStatus', 'authProviders', 'source'].forEach((key) => {
  assert.doesNotMatch(js, new RegExp(`\\{ key: '${key}',[^}]*sortable: true`));
});
assert.match(js, /\(active \? \(state\.sort\.direction === 'asc' \? '▲' : '▼'\) : '↕'\)/);
assert.match(css, /\.um-sort-indicator\s*\{[\s\S]*opacity:\s*\.65;/);
assert.match(css, /\.um-operation-cell\s*\{[\s\S]*text-align:\s*left !important;/);
assert.match(css, /\.um-row-actions\s*\{[\s\S]*justify-content:\s*flex-start;/);
assert.match(css, /\.um-menu-panel\.is-viewport-layer,[\s\S]*position:\s*fixed;[\s\S]*z-index:\s*99999;/);
assert.match(js, /function positionViewportMenu\(menu\)/);
assert.match(js, /root\.document\.body\.appendChild\(panel\)/);
assert.match(js, /menu\.appendChild\(panel\)/);
assert.match(js, /cell\.style\.zIndex = '9999'/);
assert.match(html, /id="userExportButton"[^>]*class="btn btn-secondary"|class="btn btn-secondary"[^>]*id="userExportButton"/);
assert.match(html, /class="btn btn-primary"[^>]*id="userAddButton"/);
assert.match(html, /id="userColumnMenu"[\s\S]*class="btn btn-secondary btn-sm"/);
assert.match(js, /class="btn btn-secondary btn-sm" type="button" data-bulk="tag"/);
assert.match(
  fs.readFileSync(path.join(adminRoot, 'product', 'product_list.html'), 'utf8'),
  /\.table-card th\s*\{\s*height:\s*46px;\s*font-size:\s*14px;\s*\}/
);
assert.match(css, /\.um-pagination-button\s*\{[\s\S]*width:\s*40px;[\s\S]*height:\s*40px;[\s\S]*border-radius:\s*8px;/);
assert.match(js, /ICONS\.edit/);
assert.match(js, /ICONS\.mail/);
assert.match(js, /ICONS\.more/);
assert.match(js, /aria-current="page"/);

const utils = require('../js/users.js');
const UserStore = require('../js/user_store.js');
const dialogRuntime = require('../../common/js/user_dialog.js');

assert.deepEqual(utils.paginationItems(1, 13), [1, 2, 3, 4, 5, 'ellipsis-right', 13]);
assert.deepEqual(utils.paginationItems(7, 13), [1, 'ellipsis-left', 6, 7, 8, 'ellipsis-right', 13]);
assert.deepEqual(utils.paginationItems(13, 13), [1, 'ellipsis-left', 9, 10, 11, 12, 13]);

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
const searchTarget = {
  id: 'USR-901',
  email: 'buyer@example.com',
  phone: '13800138000',
  tags: ['高价值'],
  firstName: '不应命中',
  stores: [{ name: '不应命中店铺', domain: 'hidden.myshopify.com' }]
};
assert.equal(utils.matchesSearchQuery(searchTarget, 'buyer@example.com'), true);
assert.equal(utils.matchesSearchQuery(searchTarget, '13800138000'), true);
assert.equal(utils.matchesSearchQuery(searchTarget, '高价值'), true);
assert.equal(utils.matchesSearchQuery(searchTarget, '不应命中'), false);
assert.equal(utils.matchesSearchQuery(searchTarget, 'hidden.myshopify.com'), false);

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
