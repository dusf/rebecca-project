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

const importedWithConsent = UserStore.importProfiles([{
  externalId: 'gid://shopify/Customer/1004',
  email: 'with-consent@example.com',
  marketingStatus: 'subscribed',
  consent: { source: 'shopify_api', consentedAt: '2026-07-29T10:00:00+08:00', note: 'Shopify marketing consent' },
  store: { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' }
}], 'shopify_api');
assert.deepEqual(importedWithConsent.counts, { created: 1, merged: 0, skipped: 0, failed: 0 });
const consentUser = UserStore.findByEmail('with-consent@example.com');
assert.equal(consentUser.marketingStatus, 'subscribed');
assert.deepEqual(consentUser.consentHistory, [{
  status: 'subscribed', source: 'shopify_api', consentedAt: '2026-07-29T10:00:00+08:00', note: 'Shopify marketing consent'
}]);

console.log('user_store tests passed');
