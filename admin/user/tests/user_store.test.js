const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const UserStore = require('../js/user_store.js');

UserStore.resetForTests([]);

const created = UserStore.createManual({
  email: '  Buyer@Example.COM ',
  firstName: 'Amy',
  lastName: 'Lee',
  marketingOptIn: false,
  marketingChannels: { sms: true, whatsapp: true }
});
assert.equal(created.ok, true);
assert.equal(created.user.email, 'buyer@example.com');
assert.equal(created.user.accountStatus, 'pending');
assert.equal(created.user.source, 'admin');
assert.equal(created.user.customerNumber, 'CUS-000001');
assert.equal(created.user.shopId, 'shop-qvr');
assert.deepEqual(created.user.marketingChannels, { email: false, sms: true, whatsapp: true });

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
assert.equal(UserStore.setMarketingStatus(
  [created.user.id],
  'subscribed',
  { source: ' checkout ', consentedAt: 'not-a-date' }
).ok, false);
assert.equal(UserStore.createManual({
  email: 'invalid-direct-consent@example.com',
  marketingOptIn: true,
  consent: { source: '   ', consentedAt: '2026-07-29T09:30:00+08:00' }
}).ok, false);

const consented = UserStore.setMarketingStatus(
  [created.user.id],
  'subscribed',
  { source: ' customer_service ', consentedAt: '2026-07-29T09:30:00+08:00', note: '电话确认' }
);
assert.equal(consented.ok, true);
assert.equal(UserStore.get(created.user.id).marketingStatus, 'subscribed');
assert.deepEqual(UserStore.get(created.user.id).marketingChannels, { email: true, sms: true, whatsapp: true });
assert.equal(UserStore.get(created.user.id).consentHistory.at(-1).source, 'customer_service');
assert.equal(UserStore.get(created.user.id).consentHistory.at(-1).consentedAt, '2026-07-29T01:30:00.000Z');

const smsDisabled = UserStore.setMarketingChannelStatus([created.user.id], 'sms', false);
assert.deepEqual(smsDisabled, { ok: true, changed: 1 });
assert.deepEqual(UserStore.get(created.user.id).marketingChannels, { email: true, sms: false, whatsapp: true });
const whatsappDisabled = UserStore.setMarketingChannelStatus([created.user.id], 'whatsapp', false);
assert.deepEqual(whatsappDisabled, { ok: true, changed: 1 });
assert.deepEqual(UserStore.get(created.user.id).marketingChannels, { email: true, sms: false, whatsapp: false });
assert.equal(UserStore.setMarketingChannelStatus([created.user.id], 'unknown', true).ok, false);

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
assert.equal(UserStore.findByEmail('new@example.com').customerNumber, 'CUS-000002');
const mergedUnsubscribed = UserStore.get(created.user.id);
assert.equal(mergedUnsubscribed.marketingStatus, 'unsubscribed');
assert.deepEqual(mergedUnsubscribed.consentHistory[0], {
  status: 'subscribed', source: 'customer_service', consentedAt: '2026-07-29T01:30:00.000Z', note: '电话确认'
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
assert.deepEqual(importedWithoutConsent.warnings, { consentDowngraded: 1 });
assert.equal(importedWithoutConsent.details.warnings[0].code, 'CONSENT_DOWNGRADED');
const noConsentUser = UserStore.findByEmail('no-consent@example.com');
assert.equal(noConsentUser.marketingStatus, 'not_subscribed');
assert.deepEqual(noConsentUser.consentHistory, []);

const mixedImport = UserStore.importProfiles([
  { email: 'mixed-valid@example.com', marketingStatus: 'not_subscribed' },
  { email: 'not-an-email', marketingStatus: 'not_subscribed' }
], 'shopify_api');
assert.equal(mixedImport.ok, true);
assert.deepEqual(mixedImport.counts, { created: 1, merged: 0, skipped: 0, failed: 1 });
assert.equal(mixedImport.details.failures.length, 1);
assert.equal(mixedImport.details.failures[0].index, 1);
assert.equal(UserStore.findByEmail('mixed-valid@example.com').email, 'mixed-valid@example.com');

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
  status: 'subscribed', source: 'checkout', consentedAt: '2026-07-29T02:05:00.000Z', note: 'Checkout consent'
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
  status: 'subscribed', source: 'checkout', consentedAt: '2026-07-29T02:00:00.000Z', note: 'Shopify marketing consent'
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
[
  { id: 'replaced-id' },
  { authProviders: [{ type: 'google' }] },
  { source: 'shopify_api' },
  { externalProfiles: [] },
  { stores: [] },
  { orderCount: 99 },
  { totalSpent: 99 },
  { createdAt: '2000-01-01T00:00:00.000Z' },
  { updatedAt: '2000-01-01T00:00:00.000Z' },
  { lastLoginAt: '2000-01-01T00:00:00.000Z' },
  { unknownField: true }
].forEach((protectedChanges) => {
  const before = UserStore.get(first.user.id);
  const result = UserStore.update(first.user.id, protectedChanges);
  assert.equal(result.ok, false);
  assert.match(result.error, /不允许|受保护|未知/);
  assert.deepEqual(UserStore.get(first.user.id), before);
});

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
assert.deepEqual(activated.user.authProviders, [{ type: 'google' }]);
assert.equal(UserStore.get(first.user.id).id, first.user.id);
assert.equal(UserStore.get(first.user.id).accountStatus, 'registered');
assert.deepEqual(UserStore.get(first.user.id).authProviders, [{ type: 'google' }]);
assert.ok(UserStore.get(first.user.id).lastLoginAt);
const invalidProviderBefore = UserStore.get(first.user.id);
const invalidProvider = UserStore.activateByEmail('first@example.com', 'linkedin');
assert.equal(invalidProvider.ok, false);
assert.deepEqual(UserStore.get(first.user.id), invalidProviderBefore);
const repeatedGoogle = UserStore.activateByEmail('first@example.com', ' GOOGLE ');
assert.equal(repeatedGoogle.ok, true);
assert.deepEqual(repeatedGoogle.user.authProviders, [{ type: 'google' }]);

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
assert.deepEqual(registeredVerification.user.authProviders, [{ type: 'password' }, { type: 'google' }]);
assert.ok(registeredVerification.user.lastLoginAt);

const sharedValues = new Map();
const sharedStorage = {
  getItem(key) {
    return sharedValues.has(key) ? sharedValues.get(key) : null;
  },
  setItem(key, value) {
    sharedValues.set(key, String(value));
  },
  removeItem(key) {
    sharedValues.delete(key);
  }
};
const storeSource = fs.readFileSync(path.resolve(__dirname, '../js/user_store.js'), 'utf8');
function createBrowserStore(storageInstance = sharedStorage, globals = {}) {
  const context = vm.createContext(Object.assign({ localStorage: storageInstance }, globals));
  vm.runInContext(storeSource, context);
  return context.UserStore;
}
const firstFrameStore = createBrowserStore();
const secondFrameStore = createBrowserStore();
firstFrameStore.list();
secondFrameStore.list();
const crossFrameUser = firstFrameStore.createManual({ email: 'cross-frame@example.com' });
assert.equal(crossFrameUser.ok, true);
assert.equal(secondFrameStore.findByEmail('cross-frame@example.com').id, crossFrameUser.user.id);

const collisionValues = new Map();
const collisionStorage = {
  getItem(key) {
    return collisionValues.has(key) ? collisionValues.get(key) : null;
  },
  setItem(key, value) {
    collisionValues.set(key, String(value));
  },
  removeItem(key) {
    collisionValues.delete(key);
  }
};
const collidingCrypto = {
  randomUUID() {
    return '00000000-0000-4000-8000-000000000001';
  },
  getRandomValues(values) {
    values.fill(7);
    return values;
  }
};
const collisionFrameOne = createBrowserStore(collisionStorage, { crypto: collidingCrypto });
const collisionFrameTwo = createBrowserStore(collisionStorage, { crypto: collidingCrypto });
collisionFrameOne.list();
collisionFrameTwo.list();
const collisionUserOne = collisionFrameOne.createManual({ email: 'uuid-one@example.com' });
const collisionUserTwo = collisionFrameTwo.createManual({ email: 'uuid-two@example.com' });
assert.equal(collisionUserOne.ok, true);
assert.equal(collisionUserTwo.ok, true);
assert.notEqual(collisionUserOne.user.id, collisionUserTwo.user.id);
const collisionIds = collisionFrameTwo.list().map((user) => user.id);
assert.equal(new Set(collisionIds).size, collisionIds.length);

const interleavedValues = new Map();
let injectConcurrentCreate = false;
let concurrentCreated = null;
let interleavedFrameA = null;
const interleavedStorage = {
  getItem(key) {
    if (injectConcurrentCreate) {
      injectConcurrentCreate = false;
      concurrentCreated = interleavedFrameA.createManual({ email: 'uuid-interleave-a@example.com' });
    }
    return interleavedValues.has(key) ? interleavedValues.get(key) : null;
  },
  setItem(key, value) {
    interleavedValues.set(key, String(value));
  },
  removeItem(key) {
    interleavedValues.delete(key);
  }
};
const interleavedCryptoA = {
  randomUUID() {
    return '00000000-0000-4000-8000-000000000002';
  },
  getRandomValues(values) {
    values.fill(8);
    return values;
  }
};
const interleavedCryptoB = {
  randomUUID() {
    injectConcurrentCreate = true;
    return '00000000-0000-4000-8000-000000000002';
  },
  getRandomValues(values) {
    values.fill(9);
    return values;
  }
};
interleavedFrameA = createBrowserStore(interleavedStorage, { crypto: interleavedCryptoA });
const interleavedFrameB = createBrowserStore(interleavedStorage, { crypto: interleavedCryptoB });
interleavedFrameA.list();
interleavedFrameB.list();
const interleavedCreatedB = interleavedFrameB.createManual({ email: 'uuid-interleave-b@example.com' });
assert.equal(concurrentCreated.ok, true);
assert.equal(interleavedCreatedB.ok, true);
const persistedInterleavedA = interleavedFrameB.findByEmail('uuid-interleave-a@example.com');
const persistedInterleavedB = interleavedFrameB.findByEmail('uuid-interleave-b@example.com');
assert.notEqual(persistedInterleavedA.id, persistedInterleavedB.id);
assert.equal(
  interleavedCreatedB.user.id,
  persistedInterleavedB.id,
  'createManual must return the final ID after write-time collision reassignment'
);

let atomicWriteCount = 0;
let atomicRaw = JSON.stringify([
  {
    id: 'atomic-a',
    email: 'atomic-a@example.com',
    orderCount: 0,
    externalProfiles: [],
    stores: [],
    updatedAt: '2026-07-29T00:00:00.000Z'
  },
  {
    id: 'atomic-b',
    email: 'atomic-b@example.com',
    orderCount: 0,
    externalProfiles: [],
    stores: [],
    updatedAt: '2026-07-29T00:00:00.000Z'
  },
  {
    id: 'atomic-unrelated',
    email: 'atomic-unrelated@example.com',
    orderCount: 0,
    externalProfiles: [],
    stores: [],
    updatedAt: '2026-07-29T00:00:00.000Z'
  }
]);
const atomicStorage = {
  getItem() {
    return atomicRaw;
  },
  setItem(key, value) {
    atomicWriteCount += 1;
    atomicRaw = String(value);
  },
  removeItem() {
    atomicRaw = null;
  }
};
const atomicStore = createBrowserStore(atomicStorage);
const reviewedAtomicUsers = atomicStore.list().filter((user) => ['atomic-a', 'atomic-b'].includes(user.id));
const expectedAtomicFingerprints = Object.fromEntries(reviewedAtomicUsers.map((user) => [
  user.id,
  atomicStore.deletionRiskFingerprint(user)
]));
const externallyChanged = JSON.parse(atomicRaw);
externallyChanged.find((user) => user.id === 'atomic-b').orderCount = 1;
atomicRaw = JSON.stringify(externallyChanged);
const blockedAtomicDelete = atomicStore.removeUsersIfRiskUnchanged(
  ['atomic-a', 'atomic-b'],
  expectedAtomicFingerprints
);
assert.equal(blockedAtomicDelete.ok, false);
assert.equal(blockedAtomicDelete.code, 'RISK_CHANGED');
assert.equal(blockedAtomicDelete.removed, 0);
assert.ok(atomicStore.get('atomic-a'));
assert.ok(atomicStore.get('atomic-b'));
assert.ok(atomicStore.get('atomic-unrelated'));

const missingAtomicTarget = atomicStore.removeUsersIfRiskUnchanged(
  ['atomic-a', 'atomic-missing'],
  {
    'atomic-a': atomicStore.deletionRiskFingerprint(atomicStore.get('atomic-a')),
    'atomic-missing': 'reviewed-but-now-missing'
  }
);
assert.equal(missingAtomicTarget.ok, false);
assert.equal(missingAtomicTarget.code, 'RISK_CHANGED');
assert.equal(missingAtomicTarget.removed, 0);
assert.ok(atomicStore.get('atomic-a'));
assert.ok(atomicStore.get('atomic-b'));

const refreshedAtomicUsers = atomicStore.list().filter((user) => ['atomic-a', 'atomic-b'].includes(user.id));
const refreshedAtomicFingerprints = Object.fromEntries(refreshedAtomicUsers.map((user) => [
  user.id,
  atomicStore.deletionRiskFingerprint(user)
]));
const writesBeforeAtomicSuccess = atomicWriteCount;
const successfulAtomicDelete = atomicStore.removeUsersIfRiskUnchanged(
  ['atomic-a', 'atomic-b'],
  refreshedAtomicFingerprints
);
assert.equal(successfulAtomicDelete.ok, true);
assert.equal(successfulAtomicDelete.removed, 2);
assert.equal(atomicWriteCount, writesBeforeAtomicSuccess + 1);
assert.equal(atomicStore.get('atomic-a'), null);
assert.equal(atomicStore.get('atomic-b'), null);
assert.ok(atomicStore.get('atomic-unrelated'));

let invalidConsentRaw = JSON.stringify([{
  id: 'invalid-consent-cache',
  email: 'invalid-consent-cache@example.com',
  marketingStatus: 'subscribed',
  consentHistory: [{ status: 'subscribed', source: ' ', consentedAt: 'not-a-date' }]
}]);
const invalidConsentStorage = {
  getItem() { return invalidConsentRaw; },
  setItem(key, value) { invalidConsentRaw = String(value); },
  removeItem() { invalidConsentRaw = null; }
};
const invalidConsentStore = createBrowserStore(invalidConsentStorage);
assert.equal(invalidConsentStore.get('invalid-consent-cache').marketingStatus, 'not_subscribed');

let resilientRaw = JSON.stringify([{
  id: 'persisted-old',
  email: 'persisted-old@example.com',
  firstName: 'Before',
  accountStatus: 'pending',
  updatedAt: '2020-01-01T00:00:00.000Z'
}, {
  id: 'local-newer',
  email: 'local-newer@example.com',
  firstName: 'Before',
  accountStatus: 'pending',
  updatedAt: '2020-01-01T00:00:00.000Z'
}]);
let rejectWrites = false;
const recoveringStorage = {
  getItem() {
    return resilientRaw;
  },
  setItem(key, value) {
    if (rejectWrites) throw new Error('storage quota exceeded');
    resilientRaw = String(value);
  },
  removeItem() {
    resilientRaw = null;
  }
};
const resilientStore = createBrowserStore(recoveringStorage);
assert.equal(resilientStore.list().length, 2);
rejectWrites = true;
const memoryOnlyUser = resilientStore.createManual({ email: 'memory-only@example.com' });
assert.equal(memoryOnlyUser.ok, true);
assert.equal(resilientStore.findByEmail('memory-only@example.com').id, memoryOnlyUser.user.id);
const memoryOnlyUpdate = resilientStore.update('persisted-old', { firstName: 'After' });
assert.equal(memoryOnlyUpdate.ok, true);
assert.equal(resilientStore.get('persisted-old').firstName, 'After');
const locallyNewerUpdate = resilientStore.update('local-newer', { firstName: 'Local newest' });
assert.equal(locallyNewerUpdate.ok, true);
const localOnlyUser = resilientStore.createManual({ email: 'local-only@example.com' });
assert.equal(localOnlyUser.ok, true);
assert.deepEqual(JSON.parse(resilientRaw).map(user => user.email), [
  'persisted-old@example.com',
  'local-newer@example.com'
]);

resilientRaw = JSON.stringify([
  {
    id: 'persisted-old',
    email: 'persisted-old@example.com',
    firstName: 'External latest',
    accountStatus: 'pending',
    updatedAt: '2099-01-01T00:00:00.000Z'
  },
  {
    id: 'local-newer',
    email: 'local-newer@example.com',
    firstName: 'External older',
    accountStatus: 'pending',
    updatedAt: '2021-01-01T00:00:00.000Z'
  },
  {
    id: 'external-only',
    email: 'external-only@example.com',
    accountStatus: 'pending',
    updatedAt: '2099-01-01T00:00:00.000Z'
  },
  {
    id: 'external-same-email',
    email: 'memory-only@example.com',
    firstName: 'External same email',
    accountStatus: 'pending',
    updatedAt: '2099-01-01T00:00:00.000Z'
  }
]);
rejectWrites = false;
const recoveredUsers = resilientStore.list();
assert.equal(recoveredUsers.length, 5);
assert.equal(recoveredUsers.find(user => user.id === 'persisted-old').firstName, 'External latest');
assert.equal(recoveredUsers.find(user => user.id === 'local-newer').firstName, 'Local newest');
assert.equal(recoveredUsers.some(user => user.id === 'external-only'), true);
assert.equal(recoveredUsers.some(user => user.id === localOnlyUser.user.id), true);
assert.equal(recoveredUsers.filter(user => user.email === 'memory-only@example.com').length, 1);
assert.equal(recoveredUsers.find(user => user.email === 'memory-only@example.com').id, 'external-same-email');
assert.equal(JSON.parse(resilientRaw).length, 5);
const afterRecoveryFrame = createBrowserStore(recoveringStorage);
assert.equal(afterRecoveryFrame.findByEmail('memory-only@example.com').id, 'external-same-email');
assert.equal(afterRecoveryFrame.findByEmail('local-only@example.com').id, localOnlyUser.user.id);
assert.equal(afterRecoveryFrame.get('persisted-old').firstName, 'External latest');
assert.equal(afterRecoveryFrame.get('local-newer').firstName, 'Local newest');

function identityFixture(id, email, updatedAt, firstName = '') {
  return {
    id,
    email,
    firstName,
    accountStatus: 'pending',
    createdAt: updatedAt,
    updatedAt
  };
}

function runDirtyIdentityMerge(baseline, mutateLocal, external) {
  let scenarioRaw = JSON.stringify(baseline);
  let scenarioRejectsWrites = false;
  const scenarioStorage = {
    getItem() {
      return scenarioRaw;
    },
    setItem(key, value) {
      if (scenarioRejectsWrites) throw new Error('storage quota exceeded');
      scenarioRaw = String(value);
    },
    removeItem() {
      scenarioRaw = null;
    }
  };
  const scenarioStore = createBrowserStore(scenarioStorage);
  scenarioStore.list();
  scenarioRejectsWrites = true;
  mutateLocal(scenarioStore);
  scenarioRaw = JSON.stringify(external);
  scenarioRejectsWrites = false;
  const users = scenarioStore.list();
  return { users, persisted: JSON.parse(scenarioRaw) };
}

function identitySummary(users) {
  return Array.from(users, user => ({ id: user.id, email: user.email, firstName: user.firstName }))
    .sort((first, second) => (first.id + '\0' + first.email).localeCompare(second.id + '\0' + second.email));
}

function assertUniqueIdentities(users) {
  assert.equal(new Set(users.map(user => user.id)).size, users.length);
  assert.equal(new Set(users.map(user => user.email.trim().toLowerCase())).size, users.length);
}

const identityBaseline = [
  identityFixture('A', 'a@example.com', '2020-01-01T00:00:00.000Z', 'Base A')
];
const identityExternal = [
  identityFixture('B', 'b@example.com', '2021-01-01T00:00:00.000Z', 'External B'),
  identityFixture('A', 'a@example.com', '2020-01-01T00:00:00.000Z', 'Base A')
];
function renameLocalIdentity(store) {
  const result = store.update('A', { email: 'b@example.com', firstName: 'Local renamed' });
  assert.equal(result.ok, true);
}
const crossKeyMerge = runDirtyIdentityMerge(identityBaseline, renameLocalIdentity, identityExternal);
assert.deepEqual(identitySummary(crossKeyMerge.users), [
  { id: 'A', email: 'b@example.com', firstName: 'Local renamed' }
]);
assertUniqueIdentities(crossKeyMerge.users);
assertUniqueIdentities(crossKeyMerge.persisted);

const permutedCrossKeyMerge = runDirtyIdentityMerge(
  identityBaseline,
  renameLocalIdentity,
  identityExternal.slice().reverse()
);
assert.deepEqual(identitySummary(permutedCrossKeyMerge.users), identitySummary(crossKeyMerge.users));
assert.deepEqual(identitySummary(permutedCrossKeyMerge.persisted), identitySummary(crossKeyMerge.persisted));

const externalWinsCrossKey = runDirtyIdentityMerge(identityBaseline, renameLocalIdentity, [
  identityFixture('B', 'b@example.com', '2099-01-01T00:00:00.000Z', 'External newest'),
  identityFixture('A', 'a@example.com', '2020-01-01T00:00:00.000Z', 'Base A')
]);
assert.deepEqual(identitySummary(externalWinsCrossKey.users), [
  { id: 'B', email: 'b@example.com', firstName: 'External newest' }
]);
assertUniqueIdentities(externalWinsCrossKey.persisted);

const swappedEmails = runDirtyIdentityMerge([
  identityFixture('A', 'a@example.com', '2020-01-01T00:00:00.000Z', 'Base A'),
  identityFixture('B', 'b@example.com', '2020-01-01T00:00:00.000Z', 'Base B')
], store => {
  assert.equal(store.update('A', { email: 'temp@example.com' }).ok, true);
  assert.equal(store.update('B', { email: 'a@example.com', firstName: 'Local B' }).ok, true);
  assert.equal(store.update('A', { email: 'b@example.com', firstName: 'Local A' }).ok, true);
}, [
  identityFixture('A', 'a@example.com', '2020-01-01T00:00:00.000Z', 'Base A'),
  identityFixture('B', 'b@example.com', '2020-01-01T00:00:00.000Z', 'Base B'),
  identityFixture('C', 'c@example.com', '2021-01-01T00:00:00.000Z', 'External C')
]);
assert.deepEqual(identitySummary(swappedEmails.users), [
  { id: 'A', email: 'b@example.com', firstName: 'Local A' },
  { id: 'B', email: 'a@example.com', firstName: 'Local B' },
  { id: 'C', email: 'c@example.com', firstName: 'External C' }
]);
assertUniqueIdentities(swappedEmails.users);
assertUniqueIdentities(swappedEmails.persisted);

const rotatedEmails = runDirtyIdentityMerge([
  identityFixture('A', 'a@example.com', '2020-01-01T00:00:00.000Z', 'Base A'),
  identityFixture('B', 'b@example.com', '2020-01-01T00:00:00.000Z', 'Base B'),
  identityFixture('C', 'c@example.com', '2020-01-01T00:00:00.000Z', 'Base C')
], store => {
  assert.equal(store.update('A', { email: 'temp@example.com' }).ok, true);
  assert.equal(store.update('B', { email: 'a@example.com', firstName: 'Rotated B' }).ok, true);
  assert.equal(store.update('C', { email: 'b@example.com', firstName: 'Rotated C' }).ok, true);
  assert.equal(store.update('A', { email: 'c@example.com', firstName: 'Rotated A' }).ok, true);
}, [
  identityFixture('A', 'a@example.com', '2020-01-01T00:00:00.000Z', 'Base A'),
  identityFixture('B', 'b@example.com', '2020-01-01T00:00:00.000Z', 'Base B'),
  identityFixture('C', 'c@example.com', '2020-01-01T00:00:00.000Z', 'Base C'),
  identityFixture('D', 'd@example.com', '2021-01-01T00:00:00.000Z', 'External D')
]);
assert.deepEqual(identitySummary(rotatedEmails.users), [
  { id: 'A', email: 'c@example.com', firstName: 'Rotated A' },
  { id: 'B', email: 'a@example.com', firstName: 'Rotated B' },
  { id: 'C', email: 'b@example.com', firstName: 'Rotated C' },
  { id: 'D', email: 'd@example.com', firstName: 'External D' }
]);
assertUniqueIdentities(rotatedEmails.users);
assertUniqueIdentities(rotatedEmails.persisted);

const deletionBaseline = [
  identityFixture('D', 'delete@example.com', '2020-01-01T00:00:00.000Z', 'Delete me'),
  identityFixture('K', 'keep@example.com', '2020-01-01T00:00:00.000Z', 'Keep me')
];
function deleteLocalIdentity(store) {
  const result = store.remove(['D']);
  assert.equal(result.ok, true);
  assert.equal(result.removed, 1);
}
const unchangedExternalDeletion = runDirtyIdentityMerge(
  deletionBaseline,
  deleteLocalIdentity,
  deletionBaseline
);
assert.deepEqual(identitySummary(unchangedExternalDeletion.users), [
  { id: 'K', email: 'keep@example.com', firstName: 'Keep me' }
]);
assertUniqueIdentities(unchangedExternalDeletion.persisted);

const updatedExternalSurvivesDeletion = runDirtyIdentityMerge(
  deletionBaseline,
  deleteLocalIdentity,
  [
    identityFixture('D', 'delete@example.com', '2099-01-01T00:00:00.000Z', 'External update'),
    deletionBaseline[1]
  ]
);
assert.deepEqual(identitySummary(updatedExternalSurvivesDeletion.users), [
  { id: 'D', email: 'delete@example.com', firstName: 'External update' },
  { id: 'K', email: 'keep@example.com', firstName: 'Keep me' }
]);
assertUniqueIdentities(updatedExternalSurvivesDeletion.persisted);

function createControlledLocks() {
  const queue = [];
  let held = false;
  return {
    api: {
      request(name, options, callback) {
        assert.equal(name, 'rbk-user-store-write');
        assert.equal(options && options.mode, 'exclusive');
        return new Promise((resolve, reject) => {
          queue.push({ callback, resolve, reject });
        });
      }
    },
    pending() {
      return queue.length;
    },
    async grantNext() {
      assert.equal(held, false, 'exclusive lock must not be granted while held');
      const next = queue.shift();
      assert.ok(next, 'a lock request must be queued');
      held = true;
      try {
        const value = await next.callback();
        next.resolve(value);
      } catch (error) {
        next.reject(error);
      } finally {
        held = false;
      }
    }
  };
}

async function runWriteLockTests() {
  let lockedRaw = JSON.stringify([
    identityFixture('locked-target', 'locked-target@example.com', '2026-07-29T00:00:00.000Z'),
    identityFixture('locked-keep', 'locked-keep@example.com', '2026-07-29T00:00:00.000Z')
  ]);
  const lockedStorage = {
    getItem() {
      return lockedRaw;
    },
    setItem(key, value) {
      lockedRaw = String(value);
    },
    removeItem() {
      lockedRaw = null;
    }
  };
  const controlledLocks = createControlledLocks();
  const lockedFrameA = createBrowserStore(lockedStorage, {
    navigator: { locks: controlledLocks.api }
  });
  const lockedFrameB = createBrowserStore(lockedStorage, {
    navigator: { locks: controlledLocks.api }
  });
  const reviewedLockedTarget = lockedFrameA.get('locked-target');
  const lockedFingerprints = {
    'locked-target': lockedFrameA.deletionRiskFingerprint(reviewedLockedTarget)
  };

  const queuedUpdate = lockedFrameB.setMarketingStatusLocked(
    ['locked-target'],
    'pending',
    { source: 'double_opt_in' }
  );
  const queuedDelete = lockedFrameA.removeUsersIfRiskUnchangedLocked(
    ['locked-target'],
    lockedFingerprints
  );
  assert.equal(controlledLocks.pending(), 2);
  await controlledLocks.grantNext();
  assert.equal((await queuedUpdate).ok, true);
  await controlledLocks.grantNext();
  const serializedDelete = await queuedDelete;
  assert.equal(serializedDelete.ok, false);
  assert.equal(serializedDelete.code, 'RISK_CHANGED');
  assert.equal(serializedDelete.removed, 0);
  assert.ok(lockedFrameA.get('locked-target'));

  const successfulFingerprints = {
    'locked-target': lockedFrameA.deletionRiskFingerprint(lockedFrameA.get('locked-target'))
  };
  const queuedSuccessfulDelete = lockedFrameA.removeUsersIfRiskUnchangedLocked(
    ['locked-target'],
    successfulFingerprints
  );
  assert.equal(controlledLocks.pending(), 1);
  await controlledLocks.grantNext();
  const successfulLockedDelete = await queuedSuccessfulDelete;
  assert.equal(successfulLockedDelete.ok, true);
  assert.equal(successfulLockedDelete.removed, 1);
  assert.equal(lockedFrameA.get('locked-target'), null);
  assert.ok(lockedFrameA.get('locked-keep'));

  const noLockStore = createBrowserStore(lockedStorage);
  const noLockFingerprints = {
    'locked-keep': noLockStore.deletionRiskFingerprint(noLockStore.get('locked-keep'))
  };
  const noLockDelete = await noLockStore.removeUsersIfRiskUnchangedLocked(
    ['locked-keep'],
    noLockFingerprints
  );
  assert.equal(noLockDelete.ok, false);
  assert.equal(noLockDelete.code, 'LOCK_UNAVAILABLE');
  assert.equal(noLockDelete.removed, 0);
  assert.ok(noLockStore.get('locked-keep'));
}

runWriteLockTests().then(() => {
  console.log('user_store tests passed');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
