const assert = require('node:assert/strict');
const UserFormState = require('../js/user_form.js');

const revokedConsent = {
  status: 'subscribed',
  source: 'checkout',
  consentedAt: '2026-06-01T08:00:00.000Z',
  note: 'old consent'
};
const unsubscribedInitial = UserFormState.initializeMarketingState({
  marketingStatus: 'unsubscribed',
  consentHistory: [revokedConsent, {
    status: 'unsubscribed',
    source: 'admin',
    consentedAt: '2026-07-01T08:00:00.000Z',
    note: ''
  }]
});
assert.equal(unsubscribedInitial.enabled, false);
assert.deepEqual(unsubscribedInitial.consent, { source: '', consentedAt: '', note: '' });

const subscribedInitial = UserFormState.initializeMarketingState({
  marketingStatus: 'subscribed',
  consentHistory: [revokedConsent]
});
assert.equal(subscribedInitial.enabled, true);
assert.deepEqual(subscribedInitial.consent, {
  source: revokedConsent.source,
  consentedAt: revokedConsent.consentedAt,
  note: revokedConsent.note
});

const untouchedSubscribed = UserFormState.resolveMarketingTransition({
  originalStatus: 'subscribed',
  finalEnabled: false,
  touched: false,
  consentChanged: false,
  consent: null
});
assert.deepEqual(untouchedSubscribed, { ok: true, changed: false, status: 'subscribed' });

['pending', 'invalid', 'unsubscribed', 'not_subscribed'].forEach((status) => {
  const unchanged = UserFormState.resolveMarketingTransition({
    originalStatus: status,
    finalEnabled: false,
    touched: true,
    consentChanged: false,
    consent: null
  });
  assert.deepEqual(unchanged, { ok: true, changed: false, status });
});

const unsubscribed = UserFormState.resolveMarketingTransition({
  originalStatus: 'subscribed',
  finalEnabled: false,
  touched: true,
  consentChanged: false,
  consent: null
});
assert.equal(unsubscribed.ok, true);
assert.equal(unsubscribed.changed, true);
assert.equal(unsubscribed.status, 'unsubscribed');

const subscribedUnchanged = UserFormState.resolveMarketingTransition({
  originalStatus: 'subscribed',
  finalEnabled: true,
  touched: false,
  consentChanged: false,
  consent: subscribedInitial.consent
});
assert.deepEqual(subscribedUnchanged, { ok: true, changed: false, status: 'subscribed' });

const missingFreshConsent = UserFormState.resolveMarketingTransition({
  originalStatus: 'unsubscribed',
  finalEnabled: true,
  touched: true,
  consentChanged: true,
  consent: { source: '', consentedAt: '', note: '' }
});
assert.equal(missingFreshConsent.ok, false);
assert.match(missingFreshConsent.error, /同意来源和同意时间/);

const newConsent = {
  source: 'offline_event',
  consentedAt: '2026-07-29T04:30:00.000Z',
  note: 'new consent'
};
const resubscribed = UserFormState.resolveMarketingTransition({
  originalStatus: 'unsubscribed',
  finalEnabled: true,
  touched: true,
  consentChanged: true,
  consent: newConsent
});
assert.equal(resubscribed.ok, true);
assert.equal(resubscribed.changed, true);
assert.equal(resubscribed.status, 'subscribed');
assert.deepEqual(resubscribed.consent, newConsent);
assert.notEqual(resubscribed.consent.consentedAt, revokedConsent.consentedAt);

const subscribedConsentChanged = UserFormState.resolveMarketingTransition({
  originalStatus: 'subscribed',
  finalEnabled: true,
  touched: false,
  consentChanged: true,
  consent: newConsent
});
assert.equal(subscribedConsentChanged.ok, true);
assert.equal(subscribedConsentChanged.changed, true);
assert.equal(subscribedConsentChanged.status, 'subscribed');
assert.deepEqual(subscribedConsentChanged.consent, newConsent);

console.log('user form runtime tests passed');
