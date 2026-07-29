const assert = require('node:assert/strict');
const UserStore = require('../js/user_store.js');

UserStore.resetForTests([]);

const created = UserStore.createManual({
  email: '  Buyer@Example.COM ',
  firstName: 'Amy',
  lastName: 'Lee',
  marketingOptIn: false
});
assert.equal(created.ok, true);
assert.equal(created.user.email, 'buyer@example.com');
assert.equal(created.user.accountStatus, 'pending');
assert.equal(created.user.source, 'admin');

const duplicate = UserStore.createManual({
  email: 'buyer@example.com',
  firstName: 'Duplicate',
  marketingOptIn: false
});
assert.equal(duplicate.ok, false);
assert.equal(duplicate.existing.id, created.user.id);

const missingConsent = UserStore.setMarketingStatus(
  [created.user.id],
  'subscribed',
  { source: '', consentedAt: '' }
);
assert.equal(missingConsent.ok, false);

const consented = UserStore.setMarketingStatus(
  [created.user.id],
  'subscribed',
  { source: 'customer_service', consentedAt: '2026-07-29T09:30:00+08:00', note: '电话确认' }
);
assert.equal(consented.ok, true);
assert.equal(UserStore.get(created.user.id).marketingStatus, 'subscribed');

const imported = UserStore.importProfiles([
  {
    externalId: 'gid://shopify/Customer/1001',
    email: 'BUYER@example.com',
    firstName: 'Amy',
    lastName: 'Lee',
    marketingStatus: 'unsubscribed',
    store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
  },
  {
    externalId: 'gid://shopify/Customer/1002',
    email: 'new@example.com',
    firstName: 'New',
    lastName: 'Buyer',
    marketingStatus: 'not_subscribed',
    store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
  }
], 'shopify_api');
assert.deepEqual(imported.counts, { created: 1, merged: 1, skipped: 0, failed: 0 });
assert.equal(UserStore.list().length, 2);
assert.equal(UserStore.findByEmail('new@example.com').accountStatus, 'pending');
const mergedUnsubscribed = UserStore.get(created.user.id);
assert.equal(mergedUnsubscribed.marketingStatus, 'unsubscribed');
assert.deepEqual(mergedUnsubscribed.consentHistory[0], {
  status: 'subscribed', source: 'customer_service', consentedAt: '2026-07-29T09:30:00+08:00', note: '电话确认'
});
assert.equal(mergedUnsubscribed.consentHistory[1].status, 'unsubscribed');
assert.equal(mergedUnsubscribed.consentHistory[1].source, 'shopify_api');
assert.ok(mergedUnsubscribed.consentHistory[1].consentedAt);

const bypassedUpdate = UserStore.update(created.user.id, {
  marketingStatus: 'subscribed',
  consentHistory: []
});
assert.equal(bypassedUpdate.ok, false);
assert.match(bypassedUpdate.error, /邮件营销状态/);

const importedWithoutConsent = UserStore.importProfiles([{
  externalId: 'gid://shopify/Customer/1003',
  email: 'no-consent@example.com',
  marketingStatus: 'subscribed',
  store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
}], 'shopify_api');
assert.deepEqual(importedWithoutConsent.counts, { created: 1, merged: 0, skipped: 0, failed: 0 });
const noConsentUser = UserStore.findByEmail('no-consent@example.com');
assert.equal(noConsentUser.marketingStatus, 'not_subscribed');
assert.deepEqual(noConsentUser.consentHistory, []);

const subscribedUpgrade = {
  externalId: 'gid://shopify/Customer/1005',
  email: 'no-consent@example.com',
  marketingStatus: 'subscribed',
  consent: { source: 'checkout', consentedAt: '2026-07-29T10:05:00+08:00', note: 'Checkout consent' },
  store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
};
assert.deepEqual(UserStore.importProfiles([subscribedUpgrade], 'shopify_api').counts, { created: 0, merged: 1, skipped: 0, failed: 0 });
const upgradedUser = UserStore.findByEmail('no-consent@example.com');
assert.equal(upgradedUser.marketingStatus, 'subscribed');
assert.deepEqual(upgradedUser.consentHistory, [{
  status: 'subscribed', source: 'checkout', consentedAt: '2026-07-29T10:05:00+08:00', note: 'Checkout consent'
}]);
const upgradeHistoryLength = upgradedUser.consentHistory.length;
assert.deepEqual(UserStore.importProfiles([subscribedUpgrade], 'shopify_api').counts, { created: 0, merged: 1, skipped: 0, failed: 0 });
assert.equal(UserStore.findByEmail('no-consent@example.com').consentHistory.length, upgradeHistoryLength);

const importedWithConsent = UserStore.importProfiles([{
  externalId: 'gid://shopify/Customer/1004',
  email: 'with-consent@example.com',
  marketingStatus: 'subscribed',
  consent: { source: 'checkout', consentedAt: '2026-07-29T10:00:00+08:00', note: 'Shopify marketing consent' },
  store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
}], 'shopify_api');
assert.deepEqual(importedWithConsent.counts, { created: 1, merged: 0, skipped: 0, failed: 0 });
const consentUser = UserStore.findByEmail('with-consent@example.com');
assert.equal(consentUser.marketingStatus, 'subscribed');
assert.deepEqual(consentUser.consentHistory, [{
  status: 'subscribed', source: 'checkout', consentedAt: '2026-07-29T10:00:00+08:00', note: 'Shopify marketing consent'
}]);

UserStore.resetForTests([
  { id: 'registered-user', email: 'registered@example.com', accountStatus: 'registered' },
  { id: 'pending-user', email: 'pending@example.com', accountStatus: 'pending' },
  { id: 'legacy-disabled', email: 'legacy-disabled@example.com', accountStatus: 'disabled' },
  { id: 'disabled-registered', email: 'disabled-registered@example.com', accountStatus: 'disabled', previousAccountStatus: 'registered' }
]);
assert.equal(UserStore.setAccountStatus(['pending-user'], 'registered').ok, false);
assert.equal(UserStore.update('pending-user', { accountStatus: 'registered' }).ok, false);
assert.deepEqual(UserStore.setAccountStatus(['registered-user', 'pending-user'], 'disabled'), { ok: true, changed: 2 });
assert.equal(UserStore.get('registered-user').previousAccountStatus, 'registered');
assert.equal(UserStore.get('pending-user').previousAccountStatus, 'pending');
assert.deepEqual(UserStore.setAccountStatus(['registered-user', 'pending-user'], 'restore'), { ok: true, changed: 2 });
assert.equal(UserStore.get('registered-user').accountStatus, 'registered');
assert.equal(UserStore.get('pending-user').accountStatus, 'pending');
assert.equal(UserStore.get('registered-user').previousAccountStatus, null);
assert.deepEqual(UserStore.setAccountStatus(['legacy-disabled'], 'restore'), { ok: true, changed: 1 });
assert.equal(UserStore.get('legacy-disabled').accountStatus, 'pending');
assert.deepEqual(UserStore.setAccountStatus(['disabled-registered'], 'disabled'), { ok: true, changed: 0 });
assert.deepEqual(UserStore.setAccountStatus(['disabled-registered'], 'restore'), { ok: true, changed: 1 });
assert.equal(UserStore.get('disabled-registered').accountStatus, 'registered');

UserStore.resetForTests([]);
const first = UserStore.createManual({ email: 'first@example.com', firstName: 'First', marketingOptIn: false });
const second = UserStore.createManual({ email: 'second@example.com', firstName: 'Second', marketingOptIn: false });

const updated = UserStore.update(first.user.id, { firstName: 'Updated', note: 'VIP buyer' });
assert.equal(updated.ok, true);
assert.equal(UserStore.get(first.user.id).firstName, 'Updated');

const duplicateUpdate = UserStore.update(second.user.id, { email: 'FIRST@example.com' });
assert.equal(duplicateUpdate.ok, false);
assert.equal(duplicateUpdate.existing.id, first.user.id);
assert.equal(UserStore.get(second.user.id).email, 'second@example.com');

const missingActivation = UserStore.activateByEmail('missing@example.com', 'google');
assert.equal(missingActivation.ok, false);
assert.match(missingActivation.error, /未找到/);

const activated = UserStore.activateByEmail('first@example.com', 'google');
assert.equal(activated.ok, true);
assert.equal(activated.user.id, first.user.id);
assert.equal(activated.user.accountStatus, 'registered');
assert.equal(activated.user.authProviders.includes('google'), true);
assert.equal(UserStore.get(first.user.id).id, first.user.id);
assert.equal(UserStore.get(first.user.id).accountStatus, 'registered');
assert.equal(UserStore.get(first.user.id).authProviders.includes('google'), true);
assert.ok(UserStore.get(first.user.id).lastLoginAt);

UserStore.resetForTests([
  {
    id: 'activation-disabled',
    email: 'activation-disabled@example.com',
    accountStatus: 'disabled',
    previousAccountStatus: 'pending',
    authProviders: []
  },
  {
    id: 'activation-pending',
    email: 'activation-pending@example.com',
    accountStatus: 'pending',
    authProviders: []
  },
  {
    id: 'activation-registered',
    email: 'activation-registered@example.com',
    accountStatus: 'registered',
    authProviders: [{ type: 'password' }]
  }
]);

const disabledBeforeActivation = UserStore.get('activation-disabled');
const disabledActivation = UserStore.activateByEmail('activation-disabled@example.com', 'google');
assert.equal(disabledActivation.ok, false);
assert.match(disabledActivation.error, /禁用/);
assert.deepEqual(UserStore.get('activation-disabled'), disabledBeforeActivation);

const pendingActivation = UserStore.activateByEmail('activation-pending@example.com', 'google');
assert.equal(pendingActivation.ok, true);
assert.equal(pendingActivation.user.id, 'activation-pending');
assert.equal(pendingActivation.user.accountStatus, 'registered');

const registeredVerification = UserStore.activateByEmail('activation-registered@example.com', 'google');
assert.equal(registeredVerification.ok, true);
assert.equal(registeredVerification.user.id, 'activation-registered');
assert.equal(registeredVerification.user.accountStatus, 'registered');
assert.equal(registeredVerification.user.authProviders.includes('google'), true);
assert.ok(registeredVerification.user.lastLoginAt);

console.log('user_store tests passed');
