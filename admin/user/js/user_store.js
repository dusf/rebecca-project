(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.UserStore = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const STORAGE_KEY = 'rebecca_users_v1';
  const ACCOUNT_STATUSES = new Set(['registered', 'pending', 'disabled']);
  const MARKETING_STATUSES = new Set(['subscribed', 'unsubscribed', 'not_subscribed', 'pending', 'invalid']);
  let memory = [];
  let loaded = false;
  let idSequence = 0;
  const listeners = new Set();

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function storage() {
    try {
      return root && root.localStorage ? root.localStorage : null;
    } catch (error) {
      return null;
    }
  }

  function createId() {
    idSequence += 1;
    return 'usr_' + Date.now().toString(36) + '_' + idSequence;
  }

  function buildUser(input) {
    const now = new Date().toISOString();
    return {
      id: input.id || createId(),
      email: normalizeEmail(input.email),
      firstName: String(input.firstName || '').trim(),
      lastName: String(input.lastName || '').trim(),
      phone: String(input.phone || '').trim(),
      preferredLanguage: input.preferredLanguage || 'zh-CN',
      tags: Array.isArray(input.tags) ? input.tags.slice() : [],
      note: input.note || '',
      accountStatus: ACCOUNT_STATUSES.has(input.accountStatus) ? input.accountStatus : 'pending',
      previousAccountStatus: input.previousAccountStatus === 'registered' || input.previousAccountStatus === 'pending'
        ? input.previousAccountStatus
        : null,
      marketingStatus: MARKETING_STATUSES.has(input.marketingStatus) ? input.marketingStatus : 'not_subscribed',
      authProviders: Array.isArray(input.authProviders) ? clone(input.authProviders) : [],
      source: input.source || 'admin',
      externalProfiles: Array.isArray(input.externalProfiles) ? clone(input.externalProfiles) : [],
      stores: Array.isArray(input.stores) ? clone(input.stores) : [],
      consentHistory: Array.isArray(input.consentHistory) ? clone(input.consentHistory) : [],
      orderCount: Number(input.orderCount) || 0,
      totalSpent: Number(input.totalSpent) || 0,
      lastOrderAt: input.lastOrderAt || null,
      lastLoginAt: input.lastLoginAt || null,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now
    };
  }

  function seedUsers() {
    const qvr = { id: 'store-qvr', name: 'QVR品牌站', domain: 'qvr.myshopify.com' };
    const noa = { id: 'store-noa', name: 'NOA生活馆', domain: 'noa.myshopify.com' };
    return [
      buildUser({ id: 'usr_seed_001', email: 'lina.zhang@example.com', firstName: 'Lina', lastName: 'Zhang', accountStatus: 'registered', marketingStatus: 'subscribed', authProviders: [{ type: 'password' }], source: 'storefront', stores: [qvr], consentHistory: [{ status: 'subscribed', source: 'registration', consentedAt: '2026-06-20T10:00:00+08:00', note: '' }], orderCount: 8, totalSpent: 6280, lastOrderAt: '2026-07-21T10:30:00+08:00' }),
      buildUser({ id: 'usr_seed_002', email: 'mason.wu@example.com', firstName: 'Mason', lastName: 'Wu', accountStatus: 'registered', marketingStatus: 'unsubscribed', authProviders: [{ type: 'password' }], source: 'storefront', stores: [qvr], orderCount: 3, totalSpent: 1299 }),
      buildUser({ id: 'usr_seed_003', email: 'newsletter@example.com', firstName: 'Nora', lastName: 'Sun', accountStatus: 'pending', marketingStatus: 'subscribed', source: 'newsletter', consentHistory: [{ status: 'subscribed', source: 'footer', consentedAt: '2026-07-10T09:00:00+08:00', note: '' }], stores: [qvr] }),
      buildUser({ id: 'usr_seed_004', email: 'api.import@example.com', firstName: 'Api', lastName: 'Import', accountStatus: 'pending', marketingStatus: 'not_subscribed', source: 'shopify_api', externalProfiles: [{ externalId: 'gid://shopify/Customer/2001', source: 'shopify_api', store: qvr }], stores: [qvr], orderCount: 2, totalSpent: 498 }),
      buildUser({ id: 'usr_seed_005', email: 'csv.import@example.com', firstName: 'Csv', lastName: 'Import', accountStatus: 'pending', marketingStatus: 'unsubscribed', source: 'csv', stores: [qvr] }),
      buildUser({ id: 'usr_seed_006', email: 'multistore@example.com', firstName: 'Mia', lastName: 'Chen', accountStatus: 'registered', marketingStatus: 'subscribed', authProviders: [{ type: 'google', subject: 'google-mia-01' }], source: 'shopify_api', stores: [qvr, noa], consentHistory: [{ status: 'subscribed', source: 'shopify_api', consentedAt: '2026-06-18T14:00:00+08:00', note: '' }], orderCount: 12, totalSpent: 9888 }),
      buildUser({ id: 'usr_seed_007', email: 'providers@example.com', firstName: 'Leo', lastName: 'Zhao', accountStatus: 'registered', marketingStatus: 'subscribed', authProviders: [{ type: 'password' }, { type: 'google', subject: 'google-leo-01' }, { type: 'facebook', subject: 'facebook-leo-01' }], source: 'storefront', stores: [qvr], consentHistory: [{ status: 'subscribed', source: 'checkout', consentedAt: '2026-07-01T16:00:00+08:00', note: '' }], orderCount: 1, totalSpent: 299 }),
      buildUser({ id: 'usr_seed_008', email: 'disabled@example.com', firstName: 'Daisy', lastName: 'Gu', accountStatus: 'disabled', marketingStatus: 'unsubscribed', authProviders: [{ type: 'password' }], source: 'admin', stores: [qvr], orderCount: 4, totalSpent: 1880 }),
      buildUser({ id: 'usr_seed_009', email: 'zero.orders@example.com', firstName: 'Zero', lastName: 'Order', accountStatus: 'registered', marketingStatus: 'not_subscribed', authProviders: [{ type: 'password' }], source: 'storefront', stores: [qvr], orderCount: 0, totalSpent: 0 }),
      buildUser({ id: 'usr_seed_010', email: 'vip@example.com', firstName: 'Victoria', lastName: 'Peng', accountStatus: 'registered', marketingStatus: 'subscribed', authProviders: [{ type: 'password' }], source: 'storefront', stores: [qvr, noa], consentHistory: [{ status: 'subscribed', source: 'footer', consentedAt: '2026-05-05T08:00:00+08:00', note: '' }], orderCount: 36, totalSpent: 48680, lastOrderAt: '2026-07-28T15:20:00+08:00' }),
      buildUser({ id: 'usr_seed_011', email: 'manual.pending@example.com', firstName: 'Manual', lastName: 'Pending', accountStatus: 'pending', marketingStatus: 'not_subscribed', source: 'admin', stores: [] }),
      buildUser({ id: 'usr_seed_012', email: 'shopify.subscriber@example.com', firstName: 'Shopify', lastName: 'Subscriber', accountStatus: 'pending', marketingStatus: 'subscribed', source: 'shopify_api', externalProfiles: [{ externalId: 'gid://shopify/Customer/2012', source: 'shopify_api', store: noa }], stores: [noa], consentHistory: [{ status: 'subscribed', source: 'shopify_api', consentedAt: '2026-07-15T12:00:00+08:00', note: '' }] })
    ];
  }

  function ensureLoaded() {
    if (loaded) return;
    loaded = true;
    const store = storage();
    if (store) {
      try {
        const saved = JSON.parse(store.getItem(STORAGE_KEY));
        if (Array.isArray(saved)) {
          memory = saved.map(buildUser);
          return;
        }
      } catch (error) {
        // A corrupt cache is replaced with the documented sample records.
      }
    }
    memory = seedUsers();
    persist();
  }

  function persist() {
    const store = storage();
    if (!store) return;
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch (error) {
      // Browsers may deny storage; the in-memory store remains usable.
    }
  }

  function write(users) {
    memory = users.map(buildUser);
    loaded = true;
    persist();
    listeners.forEach(function (listener) { listener(list()); });
  }

  function list() {
    ensureLoaded();
    return clone(memory);
  }

  function get(id) {
    return list().find(function (user) { return user.id === id; }) || null;
  }

  function findByEmail(email) {
    const normalized = normalizeEmail(email);
    return list().find(function (user) { return user.email === normalized; }) || null;
  }

  function createManual(payload) {
    payload = payload || {};
    const email = normalizeEmail(payload.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: '请输入有效邮箱地址' };
    const existing = findByEmail(email);
    if (existing) return { ok: false, existing: existing, error: '该邮箱已经存在用户档案' };
    if (payload.marketingOptIn && (!payload.consent || !payload.consent.source || !payload.consent.consentedAt)) return { ok: false, error: '标记为已订阅时必须填写同意来源和同意时间' };
    const user = buildUser({
      email: email, firstName: payload.firstName, lastName: payload.lastName, phone: payload.phone,
      preferredLanguage: payload.preferredLanguage, tags: payload.tags, note: payload.note,
      accountStatus: 'pending', marketingStatus: payload.marketingOptIn ? 'subscribed' : 'not_subscribed',
      authProviders: [], source: 'admin',
      consentHistory: payload.marketingOptIn ? [{ status: 'subscribed', source: payload.consent.source, consentedAt: payload.consent.consentedAt, note: payload.consent.note || '' }] : []
    });
    write(list().concat(user));
    return { ok: true, user: clone(user) };
  }

  function update(id, changes) {
    changes = changes || {};
    if (Object.prototype.hasOwnProperty.call(changes, 'accountStatus') || Object.prototype.hasOwnProperty.call(changes, 'previousAccountStatus')) {
      return { ok: false, error: '请通过账号禁用或恢复操作更新账号状态' };
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'marketingStatus') || Object.prototype.hasOwnProperty.call(changes, 'consentHistory')) {
      return { ok: false, error: '请通过邮件营销状态操作更新订阅状态和授权记录' };
    }
    const users = list();
    const index = users.findIndex(function (user) { return user.id === id; });
    if (index < 0) return { ok: false, error: '未找到用户档案' };
    const next = Object.assign({}, users[index], changes);
    if (Object.prototype.hasOwnProperty.call(changes, 'email')) {
      next.email = normalizeEmail(changes.email);
      if (!next.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) return { ok: false, error: '请输入有效邮箱地址' };
      const duplicate = users.find(function (user) { return user.id !== id && user.email === next.email; });
      if (duplicate) return { ok: false, existing: duplicate, error: '该邮箱已经存在用户档案' };
    }
    next.updatedAt = new Date().toISOString();
    users[index] = buildUser(next);
    write(users);
    return { ok: true, user: get(id) };
  }

  function activateByEmail(email, provider) {
    const existing = findByEmail(email);
    if (!existing) return { ok: false, error: '未找到可认领的用户档案' };
    if (existing.accountStatus === 'disabled') {
      return { ok: false, error: '该用户账号已禁用，无法完成登录验证' };
    }
    const authProviders = Array.from(new Set(existing.authProviders.concat(provider || 'email')));
    const users = list();
    const index = users.findIndex(function (user) { return user.id === existing.id; });
    const user = Object.assign({}, users[index], {
      accountStatus: existing.accountStatus === 'pending' ? 'registered' : existing.accountStatus,
      authProviders: authProviders,
      lastLoginAt: new Date().toISOString()
    });
    if (existing.accountStatus === 'pending') delete user.previousAccountStatus;
    users[index] = user;
    write(users);
    return { ok: true, user: get(existing.id) };
  }

  function remove(ids) {
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids]);
    const users = list();
    const remaining = users.filter(function (user) { return !targetIds.has(user.id); });
    write(remaining);
    return { ok: true, removed: users.length - remaining.length };
  }

  function setAccountStatus(ids, status) {
    if (status !== 'disabled' && status !== 'restore') {
      return { ok: false, error: '后台只能禁用账号或恢复禁用前状态' };
    }
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids]);
    const users = list();
    let changed = 0;
    users.forEach(function (user) {
      if (!targetIds.has(user.id)) return;
      if (status === 'disabled' && user.accountStatus !== 'disabled') {
        user.previousAccountStatus = user.accountStatus === 'registered' ? 'registered' : 'pending';
        user.accountStatus = 'disabled';
        user.updatedAt = new Date().toISOString();
        changed += 1;
      } else if (status === 'restore' && user.accountStatus === 'disabled') {
        user.accountStatus = user.previousAccountStatus === 'registered' ? 'registered' : 'pending';
        user.previousAccountStatus = null;
        user.updatedAt = new Date().toISOString();
        changed += 1;
      }
    });
    write(users);
    return { ok: true, changed: changed };
  }

  function setMarketingStatus(ids, status, consent) {
    if (!MARKETING_STATUSES.has(status)) return { ok: false, error: '无效的邮件营销状态' };
    consent = consent || {};
    if (status === 'subscribed' && (!consent.source || !consent.consentedAt)) return { ok: false, error: '标记为已订阅时必须填写同意来源和同意时间' };
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids]);
    const users = list();
    let changed = 0;
    users.forEach(function (user) {
      if (!targetIds.has(user.id)) return;
      user.marketingStatus = status;
      user.consentHistory = Array.isArray(user.consentHistory) ? user.consentHistory : [];
      user.consentHistory.push({ status: status, source: consent.source || '', consentedAt: consent.consentedAt || new Date().toISOString(), note: consent.note || '' });
      user.updatedAt = new Date().toISOString();
      changed += 1;
    });
    write(users);
    return { ok: true, changed: changed };
  }

  function profileRecord(profile, source) {
    return { externalId: profile.externalId || '', source: source, store: profile.store ? clone(profile.store) : null };
  }

  function importConsent(profile) {
    const consent = profile && profile.consent && typeof profile.consent === 'object' ? profile.consent : (profile || {});
    return { source: consent.source || consent.consentSource || '', consentedAt: consent.consentedAt || '', note: consent.note || '' };
  }

  function hasValidConsent(consent) {
    return Boolean(consent && consent.source && consent.consentedAt);
  }

  function importStatusTime(profile) {
    return profile.marketingStatusAt || profile.marketingStatusUpdatedAt || profile.statusUpdatedAt || profile.updatedAt || new Date().toISOString();
  }

  function appendImportedStatus(user, status, profile, source, consent) {
    user.consentHistory = Array.isArray(user.consentHistory) ? user.consentHistory : [];
    user.consentHistory.push({
      status: status,
      source: consent && consent.source ? consent.source : (source || 'import'),
      consentedAt: consent && consent.consentedAt ? consent.consentedAt : importStatusTime(profile),
      note: consent && consent.note ? consent.note : ''
    });
  }

  function addUniqueStore(user, store) {
    if (!store || !store.id) return;
    user.stores = Array.isArray(user.stores) ? user.stores : [];
    if (!user.stores.some(function (item) { return item.id === store.id; })) user.stores.push(clone(store));
  }

  function importProfiles(profiles, source) {
    const users = list();
    const counts = { created: 0, merged: 0, skipped: 0, failed: 0 };
    (Array.isArray(profiles) ? profiles : []).forEach(function (profile) {
      const email = normalizeEmail(profile && profile.email);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { counts.failed += 1; return; }
      const externalId = profile.externalId || '';
      const consent = importConsent(profile);
      const importsSubscribed = profile.marketingStatus === 'subscribed';
      const canImportSubscribed = importsSubscribed && hasValidConsent(consent);
      let user = users.find(function (item) { return item.email === email; });
      if (user) {
        counts.merged += 1;
        user.firstName = String(profile.firstName || user.firstName || '').trim();
        user.lastName = String(profile.lastName || user.lastName || '').trim();
        if (canImportSubscribed && user.marketingStatus !== 'subscribed') {
          user.marketingStatus = 'subscribed';
          appendImportedStatus(user, 'subscribed', profile, source, consent);
        } else if (MARKETING_STATUSES.has(profile.marketingStatus) && !importsSubscribed && user.marketingStatus !== profile.marketingStatus) {
          user.marketingStatus = profile.marketingStatus;
          appendImportedStatus(user, profile.marketingStatus, profile, source);
        }
        user.externalProfiles = Array.isArray(user.externalProfiles) ? user.externalProfiles : [];
        if (externalId && !user.externalProfiles.some(function (item) { return item.externalId === externalId; })) user.externalProfiles.push(profileRecord(profile, source));
        addUniqueStore(user, profile.store);
        user.updatedAt = new Date().toISOString();
        return;
      }
      const initialMarketingStatus = canImportSubscribed
        ? 'subscribed'
        : (MARKETING_STATUSES.has(profile.marketingStatus) && !importsSubscribed ? profile.marketingStatus : 'not_subscribed');
      let initialConsentHistory = [];
      if (initialMarketingStatus === 'subscribed') {
        initialConsentHistory = [{ status: 'subscribed', source: consent.source, consentedAt: consent.consentedAt, note: consent.note }];
      } else if (initialMarketingStatus !== 'not_subscribed' && MARKETING_STATUSES.has(initialMarketingStatus)) {
        initialConsentHistory = [{
          status: initialMarketingStatus,
          source: source || 'import',
          consentedAt: importStatusTime(profile),
          note: ''
        }];
      }
      user = buildUser({
        email: email, firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone,
        accountStatus: 'pending', marketingStatus: initialMarketingStatus,
        source: source || 'import', externalProfiles: externalId ? [profileRecord(profile, source)] : [], stores: profile.store ? [profile.store] : [],
        consentHistory: initialConsentHistory
      });
      users.push(user);
      counts.created += 1;
    });
    write(users);
    return { ok: counts.failed === 0, counts: counts };
  }

  function subscribe(payload) {
    payload = typeof payload === 'string' ? { email: payload } : (payload || {});
    const existing = findByEmail(payload.email);
    if (existing) return setMarketingStatus([existing.id], 'subscribed', payload.consent || payload);
    return createManual({
      email: payload.email, firstName: payload.firstName, lastName: payload.lastName,
      marketingOptIn: true, consent: payload.consent || payload
    });
  }

  function resetForTests(users) {
    memory = Array.isArray(users) ? users.map(buildUser) : [];
    loaded = true;
    const store = storage();
    if (store) {
      try { store.removeItem(STORAGE_KEY); } catch (error) { /* ignored for tests */ }
    }
  }

  return { list: list, get: get, findByEmail: findByEmail, createManual: createManual, update: update, activateByEmail: activateByEmail, remove: remove, setAccountStatus: setAccountStatus, setMarketingStatus: setMarketingStatus, importProfiles: importProfiles, subscribe: subscribe, resetForTests: resetForTests };
});
