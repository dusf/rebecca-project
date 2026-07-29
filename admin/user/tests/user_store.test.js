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
function createBrowserStore(storageInstance = sharedStorage) {
  const context = vm.createContext({ localStorage: storageInstance });
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

console.log('user_store tests passed');
