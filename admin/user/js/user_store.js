(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.UserStore = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const STORAGE_KEY = 'rebecca_users_v1';
  const CUSTOMER_SEQUENCE_KEY = 'rebecca_customer_number_sequence_v1';
  const DEFAULT_SHOP_ID = 'shop-qvr';
  const WRITE_LOCK_NAME = 'rbk-user-store-write';
  const ACCOUNT_STATUSES = new Set(['registered', 'pending', 'disabled']);
  const MARKETING_STATUSES = new Set(['subscribed', 'unsubscribed', 'not_subscribed', 'pending', 'invalid']);
  const EDITABLE_PROFILE_FIELDS = new Set(['email', 'firstName', 'lastName', 'phone', 'preferredLanguage', 'addresses', 'tags', 'note']);
  const AUTH_PROVIDER_TYPES = new Set(['email', 'password', 'google', 'facebook', 'tiktok', 'instagram', 'x', 'shop']);
  let memory = [];
  let loaded = false;
  let idSequence = 0;
  let lastStorageSnapshot = null;
  let lastSynchronizedUsers = [];
  let storageDirty = false;
  const customerSequences = new Map();
  let customerSequencesDirty = false;
  const listeners = new Set();
  const reservedIds = new Set();

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function canonicalValue(value) {
    if (Array.isArray(value)) return value.map(canonicalValue);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).sort().reduce(function (result, key) {
      result[key] = canonicalValue(value[key]);
      return result;
    }, {});
  }

  function storage() {
    try {
      return root && root.localStorage ? root.localStorage : null;
    } catch (error) {
      return null;
    }
  }

  function storedIds() {
    const ids = new Set(reservedIds);
    memory.forEach(function (user) {
      if (user && user.id) ids.add(String(user.id));
    });
    const store = storage();
    if (!store) return ids;
    try {
      const saved = JSON.parse(store.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) {
        saved.forEach(function (user) {
          if (user && user.id) ids.add(String(user.id));
        });
      }
    } catch (error) {
      // A malformed snapshot cannot contribute a trustworthy identifier.
    }
    return ids;
  }

  function normalizeShopId(value) {
    return String(value || DEFAULT_SHOP_ID).trim() || DEFAULT_SHOP_ID;
  }

  function parseCustomerNumber(value) {
    const match = /^CUS-(\d{6,})$/.exec(String(value || '').trim());
    if (!match) return 0;
    const sequence = Number(match[1]);
    return Number.isSafeInteger(sequence) && sequence > 0 ? sequence : 0;
  }

  function formatCustomerNumber(sequence) {
    return 'CUS-' + String(sequence).padStart(6, '0');
  }

  function syncCustomerSequencesFromStorage() {
    const store = storage();
    if (!store) return;
    try {
      const saved = JSON.parse(store.getItem(CUSTOMER_SEQUENCE_KEY));
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
      Object.keys(saved).forEach(function (shopId) {
        const sequence = Number(saved[shopId]);
        if (!Number.isSafeInteger(sequence) || sequence < 0) return;
        const normalizedShopId = normalizeShopId(shopId);
        customerSequences.set(
          normalizedShopId,
          Math.max(customerSequences.get(normalizedShopId) || 0, sequence)
        );
      });
    } catch (error) {
      // Keep the highest valid in-memory sequence if stored metadata is malformed.
    }
  }

  function persistCustomerSequences() {
    if (!customerSequencesDirty) return true;
    const store = storage();
    if (!store) return false;
    const payload = {};
    Array.from(customerSequences.keys()).sort().forEach(function (shopId) {
      payload[shopId] = customerSequences.get(shopId) || 0;
    });
    try {
      store.setItem(CUSTOMER_SEQUENCE_KEY, JSON.stringify(payload));
      customerSequencesDirty = false;
      return true;
    } catch (error) {
      return false;
    }
  }

  function customerMigrationOrder(first, second) {
    const createdComparison = String(first.user.createdAt || '').localeCompare(String(second.user.createdAt || ''));
    if (createdComparison) return createdComparison;
    const idComparison = String(first.user.id || '').localeCompare(String(second.user.id || ''));
    if (idComparison) return idComparison;
    return first.index - second.index;
  }

  function ensureCustomerNumbers(users) {
    syncCustomerSequencesFromStorage();
    let changed = false;
    let sequenceChanged = false;
    const recordsByShop = new Map();

    users.forEach(function (user, index) {
      const shopId = normalizeShopId(user.shopId);
      if (user.shopId !== shopId) {
        user.shopId = shopId;
        changed = true;
      }
      if (!recordsByShop.has(shopId)) recordsByShop.set(shopId, []);
      recordsByShop.get(shopId).push({ user: user, index: index });
    });

    recordsByShop.forEach(function (records, shopId) {
      const recordsBySequence = new Map();
      let highWater = customerSequences.get(shopId) || 0;

      records.forEach(function (record) {
        const sequence = parseCustomerNumber(record.user.customerNumber);
        if (!sequence) return;
        highWater = Math.max(highWater, sequence);
        if (!recordsBySequence.has(sequence)) recordsBySequence.set(sequence, []);
        recordsBySequence.get(sequence).push(record);
      });

      const needsNumber = [];
      records.forEach(function (record) {
        const sequence = parseCustomerNumber(record.user.customerNumber);
        if (!sequence) {
          needsNumber.push(record);
          return;
        }
        const duplicates = recordsBySequence.get(sequence).slice().sort(customerMigrationOrder);
        if (duplicates[0] !== record) needsNumber.push(record);
      });

      needsNumber.sort(customerMigrationOrder).forEach(function (record) {
        highWater += 1;
        record.user.customerNumber = formatCustomerNumber(highWater);
        changed = true;
      });

      if ((customerSequences.get(shopId) || 0) !== highWater) {
        customerSequences.set(shopId, highWater);
        customerSequencesDirty = true;
        sequenceChanged = true;
      }
    });

    return { users: users, changed: changed, sequenceChanged: sequenceChanged };
  }

  function fallbackId() {
    const cryptoApi = root && root.crypto;
    if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      cryptoApi.getRandomValues(bytes);
      return Array.from(bytes).map(function (byte) {
        return byte.toString(16).padStart(2, '0');
      }).join('');
    }
    idSequence += 1;
    return [
      Date.now().toString(36),
      idSequence.toString(36),
      Math.random().toString(36).slice(2),
      Math.random().toString(36).slice(2)
    ].join('_');
  }

  function createId(additionalIds) {
    const existing = storedIds();
    if (additionalIds) {
      additionalIds.forEach(function (id) { existing.add(String(id)); });
    }
    const cryptoApi = root && root.crypto;
    for (let attempt = 0; attempt < 64; attempt += 1) {
      let token = '';
      if (attempt === 0 && cryptoApi && typeof cryptoApi.randomUUID === 'function') {
        try { token = cryptoApi.randomUUID(); } catch (error) { token = ''; }
      }
      if (!token) token = fallbackId();
      const candidate = 'usr_' + token;
      if (existing.has(candidate)) continue;
      reservedIds.add(candidate);
      return candidate;
    }
    idSequence += 1;
    const candidate = 'usr_' + Date.now().toString(36) + '_' + idSequence.toString(36) + '_' + fallbackId();
    reservedIds.add(candidate);
    return candidate;
  }

  function normalizeProviderType(provider) {
    const value = provider && typeof provider === 'object' ? provider.type : provider;
    const type = String(value || '').trim().toLowerCase();
    return AUTH_PROVIDER_TYPES.has(type) ? type : '';
  }

  function normalizeAuthProviders(providers) {
    const result = [];
    const seen = new Set();
    (Array.isArray(providers) ? providers : []).forEach(function (provider) {
      const type = normalizeProviderType(provider);
      if (!type || seen.has(type)) return;
      const normalized = { type: type };
      if (provider && typeof provider === 'object' && String(provider.subject || '').trim()) {
        normalized.subject = String(provider.subject).trim();
      }
      seen.add(type);
      result.push(normalized);
    });
    return result;
  }

  function validateConsent(consent) {
    const source = String(consent && consent.source || '').trim();
    const parsed = Date.parse(consent && consent.consentedAt || '');
    if (!source || !Number.isFinite(parsed)) {
      return { ok: false, error: '标记为已订阅时必须填写有效的同意来源和同意时间' };
    }
    return {
      ok: true,
      consent: {
        source: source,
        consentedAt: new Date(parsed).toISOString(),
        note: String(consent && consent.note || '').trim()
      }
    };
  }

  function normalizeConsentHistory(history) {
    return (Array.isArray(history) ? history : []).reduce(function (result, entry) {
      if (!entry || !MARKETING_STATUSES.has(entry.status)) return result;
      if (entry.status === 'subscribed') {
        const validation = validateConsent(entry);
        if (validation.ok) result.push(Object.assign({ status: 'subscribed' }, validation.consent));
        return result;
      }
      const parsed = Date.parse(entry.consentedAt || '');
      result.push({
        status: entry.status,
        source: String(entry.source || '').trim(),
        consentedAt: Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString(),
        note: String(entry.note || '').trim()
      });
      return result;
    }, []);
  }

  function normalizeAddressText(value, maxLength) {
    return String(value || '').trim().slice(0, maxLength);
  }

  function normalizeAddresses(addresses) {
    return (Array.isArray(addresses) ? addresses : []).reduce(function (result, address) {
      if (!address || typeof address !== 'object' || result.length >= 20) return result;
      const normalized = {
        country: normalizeAddressText(address.country, 64),
        region: normalizeAddressText(address.region, 120),
        city: normalizeAddressText(address.city, 120),
        address1: normalizeAddressText(address.address1, 240),
        postalCode: normalizeAddressText(address.postalCode, 32)
      };
      if (Object.keys(normalized).some(function (key) { return normalized[key]; })) result.push(normalized);
      return result;
    }, []);
  }

  function ensureUniqueUserIds(users) {
    const seen = new Set();
    return users.map(function (user) {
      if (!seen.has(user.id)) {
        seen.add(user.id);
        reservedIds.add(user.id);
        return user;
      }
      const next = Object.assign({}, user, { id: createId(seen) });
      seen.add(next.id);
      return next;
    });
  }

  function buildUser(input) {
    input = input || {};
    const now = new Date().toISOString();
    const id = String(input.id || '').trim() || createId();
    reservedIds.add(id);
    const consentHistory = normalizeConsentHistory(input.consentHistory);
    let marketingStatus = MARKETING_STATUSES.has(input.marketingStatus) ? input.marketingStatus : 'not_subscribed';
    if (marketingStatus === 'subscribed' && !consentHistory.some(function (entry) { return entry.status === 'subscribed'; })) {
      marketingStatus = 'not_subscribed';
    }
    const marketingChannels = input.marketingChannels && typeof input.marketingChannels === 'object'
      ? input.marketingChannels
      : {};
    return {
      id: id,
      shopId: normalizeShopId(input.shopId),
      customerNumber: String(input.customerNumber || '').trim(),
      email: normalizeEmail(input.email),
      firstName: String(input.firstName || '').trim(),
      lastName: String(input.lastName || '').trim(),
      phone: String(input.phone || '').trim(),
      preferredLanguage: input.preferredLanguage || 'zh-CN',
      addresses: normalizeAddresses(input.addresses),
      tags: Array.isArray(input.tags) ? input.tags.slice() : [],
      note: input.note || '',
      accountStatus: ACCOUNT_STATUSES.has(input.accountStatus) ? input.accountStatus : 'pending',
      previousAccountStatus: input.previousAccountStatus === 'registered' || input.previousAccountStatus === 'pending'
        ? input.previousAccountStatus
        : null,
      marketingStatus: marketingStatus,
      marketingChannels: {
        email: marketingStatus === 'subscribed',
        sms: Boolean(marketingChannels.sms),
        whatsapp: Boolean(marketingChannels.whatsapp)
      },
      authProviders: normalizeAuthProviders(input.authProviders),
      source: input.source || 'admin',
      externalProfiles: Array.isArray(input.externalProfiles) ? clone(input.externalProfiles) : [],
      stores: Array.isArray(input.stores) ? clone(input.stores) : [],
      consentHistory: consentHistory,
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
        const snapshot = store.getItem(STORAGE_KEY);
        const saved = JSON.parse(snapshot);
        if (Array.isArray(saved)) {
          const normalized = ensureCustomerNumbers(ensureUniqueUserIds(saved.map(buildUser)));
          memory = normalized.users;
          lastStorageSnapshot = snapshot;
          lastSynchronizedUsers = clone(memory);
          storageDirty = false;
          if (normalized.changed || normalized.sequenceChanged) persist();
          return;
        }
      } catch (error) {
        // A corrupt cache is replaced with the documented sample records.
      }
    }
    memory = ensureCustomerNumbers(ensureUniqueUserIds(seedUsers())).users;
    persist();
  }

  function persist() {
    const store = storage();
    if (!store) return false;
    const snapshot = JSON.stringify(memory);
    try {
      store.setItem(STORAGE_KEY, snapshot);
      const sequencePersisted = persistCustomerSequences();
      lastStorageSnapshot = snapshot;
      lastSynchronizedUsers = clone(memory);
      storageDirty = !sequencePersisted;
      return sequencePersisted;
    } catch (error) {
      // Browsers may deny storage; the in-memory store remains usable.
      storageDirty = true;
      return false;
    }
  }

  function sameRecord(first, second) {
    return JSON.stringify(first) === JSON.stringify(second);
  }

  function candidateTime(candidate) {
    return Date.parse(candidate.user.updatedAt || candidate.user.createdAt || '') || 0;
  }

  function candidateKey(candidate) {
    return [
      candidate.user.id,
      normalizeEmail(candidate.user.email),
      JSON.stringify(candidate.user)
    ].join('\0');
  }

  function preferredCandidate(first, second) {
    const firstTime = candidateTime(first);
    const secondTime = candidateTime(second);
    if (firstTime !== secondTime) return firstTime > secondTime ? first : second;
    if (first.local !== second.local) return first.local ? first : second;
    return candidateKey(first).localeCompare(candidateKey(second)) <= 0 ? first : second;
  }

  function candidatesById(users, local) {
    const result = new Map();
    users.forEach(function (user) {
      const candidate = { user: buildUser(user), local: local };
      const id = String(candidate.user.id);
      const current = result.get(id);
      result.set(id, current ? preferredCandidate(current, candidate) : candidate);
    });
    return result;
  }

  function changedFromBaseline(baselineCandidate, currentCandidate) {
    if (!baselineCandidate) return Boolean(currentCandidate);
    if (!currentCandidate) return true;
    return !sameRecord(baselineCandidate.user, currentCandidate.user);
  }

  function resolveIdCandidate(baselineCandidate, localCandidate, externalCandidate) {
    const localChanged = changedFromBaseline(baselineCandidate, localCandidate);
    const externalChanged = changedFromBaseline(baselineCandidate, externalCandidate);

    if (!localChanged && !externalChanged) {
      return externalCandidate || localCandidate || baselineCandidate || null;
    }
    if (localChanged && !externalChanged) return localCandidate || null;
    if (!localChanged && externalChanged) return externalCandidate || null;
    if (!localCandidate && !externalCandidate) return null;
    if (!localCandidate) return externalCandidate;
    if (!externalCandidate) return localCandidate;
    return preferredCandidate(localCandidate, externalCandidate);
  }

  function mergeDirtySnapshots(baseline, localUsers, externalUsers) {
    const baselineById = candidatesById(baseline, false);
    const localById = candidatesById(localUsers, true);
    const externalById = candidatesById(externalUsers, false);
    const ids = new Set(
      Array.from(baselineById.keys())
        .concat(Array.from(localById.keys()), Array.from(externalById.keys()))
    );

    const mergedById = new Map();
    ids.forEach(function (id) {
      const candidate = resolveIdCandidate(
        baselineById.get(id),
        localById.get(id),
        externalById.get(id)
      );
      if (candidate) mergedById.set(id, candidate);
    });

    const winnersByEmail = new Map();
    mergedById.forEach(function (candidate) {
      const email = normalizeEmail(candidate.user.email);
      const scopedEmail = normalizeShopId(candidate.user.shopId) + '\0' + email;
      const current = winnersByEmail.get(scopedEmail);
      winnersByEmail.set(scopedEmail, current ? preferredCandidate(current, candidate) : candidate);
    });

    return Array.from(winnersByEmail.values())
      .map(function (candidate) { return buildUser(candidate.user); })
      .sort(function (first, second) {
        return (first.id + '\0' + normalizeEmail(first.email))
          .localeCompare(second.id + '\0' + normalizeEmail(second.email));
      });
  }

  function syncFromStorage() {
    const store = storage();
    if (!store) return;
    syncCustomerSequencesFromStorage();
    if (storageDirty) {
      try {
        const snapshot = store.getItem(STORAGE_KEY);
        if (snapshot !== lastStorageSnapshot) {
          const saved = JSON.parse(snapshot);
          if (Array.isArray(saved)) {
            const externalUsers = ensureUniqueUserIds(saved.map(buildUser));
            memory = ensureCustomerNumbers(
              mergeDirtySnapshots(lastSynchronizedUsers, memory, externalUsers)
            ).users;
            lastStorageSnapshot = snapshot;
            lastSynchronizedUsers = clone(externalUsers);
          }
        }
        persist();
      } catch (error) {
        // Keep dirty memory until storage can be read and written safely again.
      }
      return;
    }
    try {
      const snapshot = store.getItem(STORAGE_KEY);
      if (snapshot === lastStorageSnapshot) return;
      const saved = JSON.parse(snapshot);
      if (Array.isArray(saved)) {
        const normalized = ensureCustomerNumbers(ensureUniqueUserIds(saved.map(buildUser)));
        memory = normalized.users;
        lastStorageSnapshot = snapshot;
        lastSynchronizedUsers = clone(memory);
        if (normalized.changed || normalized.sequenceChanged) persist();
      }
    } catch (error) {
      // Keep the last valid in-memory snapshot if another frame writes malformed data.
    }
  }

  function write(users) {
    memory = ensureCustomerNumbers(ensureUniqueUserIds(users.map(buildUser))).users;
    loaded = true;
    const persisted = persist();
    const writtenUsers = clone(memory);
    listeners.forEach(function (listener) { listener(clone(writtenUsers)); });
    return {
      users: writtenUsers,
      persisted: !storage() || persisted
    };
  }

  function list() {
    ensureLoaded();
    syncFromStorage();
    return clone(memory);
  }

  function listForShop(shopId) {
    const normalizedShopId = normalizeShopId(shopId);
    return list().filter(function (user) { return user.shopId === normalizedShopId; });
  }

  function get(id) {
    return list().find(function (user) { return user.id === id; }) || null;
  }

  function getForShop(id, shopId) {
    const normalizedShopId = normalizeShopId(shopId);
    return list().find(function (user) {
      return user.id === id && user.shopId === normalizedShopId;
    }) || null;
  }

  function findByEmail(email, shopId) {
    const normalized = normalizeEmail(email);
    const normalizedShopId = normalizeShopId(shopId);
    return list().find(function (user) {
      return user.shopId === normalizedShopId && user.email === normalized;
    }) || null;
  }

  function createManual(payload) {
    payload = payload || {};
    const shopId = normalizeShopId(payload.shopId);
    const email = normalizeEmail(payload.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: '请输入有效邮箱地址' };
    const existing = findByEmail(email, shopId);
    if (existing) return { ok: false, existing: existing, error: '该邮箱已经存在用户档案' };
    const consentValidation = payload.marketingOptIn ? validateConsent(payload.consent) : null;
    if (payload.marketingOptIn && !consentValidation.ok) return { ok: false, error: consentValidation.error };
    const user = buildUser({
      shopId: shopId, email: email, firstName: payload.firstName, lastName: payload.lastName, phone: payload.phone,
      preferredLanguage: payload.preferredLanguage, addresses: payload.addresses, tags: payload.tags, note: payload.note,
      accountStatus: 'pending', marketingStatus: payload.marketingOptIn ? 'subscribed' : 'not_subscribed',
      marketingChannels: payload.marketingChannels,
      authProviders: [], source: 'admin',
      consentHistory: payload.marketingOptIn ? [Object.assign({ status: 'subscribed' }, consentValidation.consent)] : []
    });
    const writeResult = write(list().concat(user));
    const writtenUser = writeResult.users.slice().reverse().find(function (candidate) {
      return candidate.email === email;
    });
    if (!writtenUser) return { ok: false, error: '用户档案写入后无法读取，请重试' };
    return { ok: true, user: writtenUser };
  }

  function update(id, changes) {
    changes = changes || {};
    if (Object.prototype.hasOwnProperty.call(changes, 'accountStatus') || Object.prototype.hasOwnProperty.call(changes, 'previousAccountStatus')) {
      return { ok: false, error: '请通过账号禁用或恢复操作更新账号状态' };
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'marketingStatus') || Object.prototype.hasOwnProperty.call(changes, 'consentHistory')) {
      return { ok: false, error: '请通过邮件营销状态操作更新订阅状态和授权记录' };
    }
    const invalidField = Object.keys(changes).find(function (field) {
      return !EDITABLE_PROFILE_FIELDS.has(field);
    });
    if (invalidField) {
      return { ok: false, error: '不允许通过资料编辑操作更新字段“' + invalidField + '”' };
    }
    const users = list();
    const index = users.findIndex(function (user) { return user.id === id; });
    if (index < 0) return { ok: false, error: '未找到用户档案' };
    const next = Object.assign({}, users[index], changes);
    if (Object.prototype.hasOwnProperty.call(changes, 'email')) {
      next.email = normalizeEmail(changes.email);
      if (!next.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) return { ok: false, error: '请输入有效邮箱地址' };
      const duplicate = users.find(function (user) {
        return user.id !== id && user.shopId === next.shopId && user.email === next.email;
      });
      if (duplicate) return { ok: false, existing: duplicate, error: '该邮箱已经存在用户档案' };
    }
    next.updatedAt = new Date().toISOString();
    users[index] = buildUser(next);
    write(users);
    return { ok: true, user: get(id) };
  }

  function activateByEmail(email, provider, shopId) {
    const existing = findByEmail(email, shopId);
    if (!existing) return { ok: false, error: '未找到可认领的用户档案' };
    if (existing.accountStatus === 'disabled') {
      return { ok: false, error: '该用户账号已禁用，无法完成登录验证' };
    }
    const providerType = normalizeProviderType(provider || 'email');
    if (!providerType) return { ok: false, error: '不支持的登录方式' };
    const authProviders = normalizeAuthProviders(existing.authProviders.concat({ type: providerType }));
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

  function deletionRiskFingerprint(user) {
    if (!user || typeof user !== 'object') return '';
    return JSON.stringify(canonicalValue({
      id: String(user.id || '').trim(),
      updatedAt: user.updatedAt || '',
      orderCount: Number(user.orderCount) || 0,
      totalSpent: Number(user.totalSpent) || 0,
      lastOrderAt: user.lastOrderAt || null,
      stores: Array.isArray(user.stores) ? user.stores : [],
      externalProfiles: Array.isArray(user.externalProfiles) ? user.externalProfiles : []
    }));
  }

  function riskChanged(error) {
    return {
      ok: false,
      code: 'RISK_CHANGED',
      error: error || '用户订单或 Shopify 关联风险已发生变化，请重新审阅后再删除',
      removed: 0
    };
  }

  function latestUsersForPermanentDelete() {
    ensureLoaded();
    const store = storage();
    if (!store) {
      return { ok: false, error: '永久删除需要可用的本地存储' };
    }
    try {
      const snapshot = store.getItem(STORAGE_KEY);
      const saved = JSON.parse(snapshot);
      if (!Array.isArray(saved)) {
        return { ok: false, error: '最新用户数据格式错误' };
      }
      const externalUsers = ensureUniqueUserIds(saved.map(buildUser));
      memory = ensureCustomerNumbers(storageDirty
        ? mergeDirtySnapshots(lastSynchronizedUsers, memory, externalUsers)
        : externalUsers).users;
      lastStorageSnapshot = snapshot;
      lastSynchronizedUsers = clone(externalUsers);
      return { ok: true, users: clone(memory) };
    } catch (error) {
      return { ok: false, error: '无法读取最新用户数据' };
    }
  }

  function removeUsersIfRiskUnchanged(ids, expectedFingerprints) {
    const normalizedIds = (Array.isArray(ids) ? ids : []).map(function (id) {
      return String(id || '').trim();
    });
    const targetIds = new Set(normalizedIds);
    if (!normalizedIds.length || normalizedIds.some(function (id) { return !id; }) ||
        targetIds.size !== normalizedIds.length ||
        !expectedFingerprints || typeof expectedFingerprints !== 'object' ||
        Array.isArray(expectedFingerprints)) {
      return { ok: false, code: 'RISK_INVALID', error: '删除目标或风险指纹格式错误', removed: 0 };
    }
    const fingerprintIds = Object.keys(expectedFingerprints);
    if (fingerprintIds.length !== normalizedIds.length ||
        fingerprintIds.some(function (id) {
          return !targetIds.has(id) || typeof expectedFingerprints[id] !== 'string' || !expectedFingerprints[id];
        })) {
      return { ok: false, code: 'RISK_INVALID', error: '删除目标与风险指纹不完整', removed: 0 };
    }

    const latest = latestUsersForPermanentDelete();
    if (!latest.ok) {
      return { ok: false, code: 'STORAGE_ERROR', error: latest.error, removed: 0 };
    }
    const latestUsers = latest.users;
    const usersById = new Map(latestUsers.map(function (user) { return [user.id, user]; }));
    const targets = normalizedIds.map(function (id) { return usersById.get(id); });
    if (targets.some(function (user) { return !user; })) {
      return riskChanged('删除目标已发生变化，请重新审阅');
    }
    const changed = targets.some(function (user) {
      return deletionRiskFingerprint(user) !== expectedFingerprints[user.id];
    });
    if (changed) return riskChanged();

    const remaining = latestUsers.filter(function (user) { return !targetIds.has(user.id); });
    const writeResult = write(remaining);
    if (!writeResult.persisted) {
      memory = latestUsers;
      storageDirty = true;
      return { ok: false, code: 'STORAGE_ERROR', error: '永久删除未能写入存储，请重试', removed: 0 };
    }
    return { ok: true, removed: normalizedIds.length };
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
    const consentValidation = status === 'subscribed' ? validateConsent(consent) : null;
    if (status === 'subscribed' && !consentValidation.ok) return { ok: false, error: consentValidation.error };
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids]);
    const users = list();
    let changed = 0;
    users.forEach(function (user) {
      if (!targetIds.has(user.id)) return;
      user.marketingStatus = status;
      user.consentHistory = Array.isArray(user.consentHistory) ? user.consentHistory : [];
      user.consentHistory.push(status === 'subscribed'
        ? Object.assign({ status: status }, consentValidation.consent)
        : {
            status: status,
            source: String(consent.source || '').trim(),
            consentedAt: new Date().toISOString(),
            note: String(consent.note || '').trim()
          });
      user.updatedAt = new Date().toISOString();
      changed += 1;
    });
    write(users);
    return { ok: true, changed: changed };
  }

  function setMarketingChannelStatus(ids, channel, enabled, consent) {
    if (channel === 'email') {
      return setMarketingStatus(ids, enabled ? 'subscribed' : 'unsubscribed', consent);
    }
    if (channel !== 'sms' && channel !== 'whatsapp') {
      return { ok: false, error: '无效的营销渠道' };
    }
    const targetIds = new Set(Array.isArray(ids) ? ids : [ids]);
    const users = list();
    let changed = 0;
    users.forEach(function (user) {
      if (!targetIds.has(user.id)) return;
      user.marketingChannels = user.marketingChannels || {
        email: user.marketingStatus === 'subscribed',
        sms: false,
        whatsapp: false
      };
      user.marketingChannels[channel] = Boolean(enabled);
      user.updatedAt = new Date().toISOString();
      changed += 1;
    });
    if (changed) write(users);
    return { ok: true, changed: changed };
  }

  function profileRecord(profile, source) {
    return { externalId: profile.externalId || '', source: source, store: profile.store ? clone(profile.store) : null };
  }

  function importConsent(profile) {
    const consent = profile && profile.consent && typeof profile.consent === 'object' ? profile.consent : (profile || {});
    return { source: consent.source || consent.consentSource || '', consentedAt: consent.consentedAt || '', note: consent.note || '' };
  }

  function normalizeTagValues(values) {
    const source = Array.isArray(values) ? values : [values];
    const tags = [];
    source.forEach(function (value) {
      const tag = String(value || '').trim();
      if (tag && tags.indexOf(tag) === -1) tags.push(tag);
    });
    if (!tags.length) return { ok: false, error: '请至少添加一个标签。', tags: [] };
    if (tags.length > 20) return { ok: false, error: '一次最多添加 20 个标签。', tags: [] };
    if (tags.some(function (tag) { return tag.length > 40; })) {
      return { ok: false, error: '每个标签名称不能超过 40 个字符。', tags: [] };
    }
    return { ok: true, error: '', tags: tags };
  }

  function addTagsToUsers(ids, values) {
    const normalized = normalizeTagValues(values);
    if (!normalized.ok) return { ok: false, error: normalized.error };
    const requestedTags = normalized.tags;
    const targetIds = new Set((Array.isArray(ids) ? ids : []).map(function (id) {
      return String(id || '').trim();
    }));
    const users = list();
    let changed = 0;
    let skipped = 0;
    let failed = 0;
    let added = 0;
    users.forEach(function (user) {
      if (!targetIds.has(user.id)) return;
      const tags = Array.isArray(user.tags) ? user.tags.slice() : [];
      const before = tags.length;
      requestedTags.forEach(function (tag) {
        if (tags.indexOf(tag) === -1) tags.push(tag);
      });
      const addedForUser = tags.length - before;
      if (!addedForUser) {
        skipped += 1;
        targetIds.delete(user.id);
        return;
      }
      user.tags = tags;
      user.updatedAt = new Date().toISOString();
      changed += 1;
      added += addedForUser;
      targetIds.delete(user.id);
    });
    failed = targetIds.size;
    if (changed) write(users);
    return {
      ok: true,
      changed: changed,
      skipped: skipped,
      failed: failed,
      added: added,
      tagCount: requestedTags.length,
      message: '已为 ' + changed + ' 位用户处理 ' + requestedTags.length + ' 个标签，共新增 ' + added + ' 个标签' +
        (skipped ? '，' + skipped + ' 位用户已包含全部所选标签' : '') +
        (failed ? '，' + failed + ' 位处理失败' : '') + '。'
    };
  }

  function addTagToUsers(ids, value) {
    return addTagsToUsers(ids, [value]);
  }

  function importStatusTime(profile) {
    const raw = profile.marketingStatusAt || profile.marketingStatusUpdatedAt || profile.statusUpdatedAt || profile.updatedAt;
    const parsed = Date.parse(raw || '');
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
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

  function importProfiles(profiles, source, shopId) {
    const targetShopId = normalizeShopId(shopId);
    const users = list();
    const counts = { created: 0, merged: 0, skipped: 0, failed: 0 };
    const warnings = { consentDowngraded: 0 };
    const details = { failures: [], warnings: [] };
    (Array.isArray(profiles) ? profiles : []).forEach(function (profile, index) {
      try {
        const email = normalizeEmail(profile && profile.email);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          counts.failed += 1;
          details.failures.push({ index: index, email: email, code: 'INVALID_EMAIL', error: '邮箱地址无效' });
          return;
        }
        const externalId = profile.externalId || '';
        const consent = importConsent(profile);
        const consentValidation = validateConsent(consent);
        const importsSubscribed = profile.marketingStatus === 'subscribed';
        const canImportSubscribed = importsSubscribed && consentValidation.ok;
        const needsConsentWarning = Boolean(profile.importIssue) || (importsSubscribed && !consentValidation.ok);
        if (needsConsentWarning) {
          warnings.consentDowngraded += 1;
          details.warnings.push({
            index: index,
            email: email,
            code: 'CONSENT_DOWNGRADED',
            warning: '缺少有效订阅授权，已按未订阅导入'
          });
        }
        let user = users.find(function (item) {
          return item.shopId === targetShopId && item.email === email;
        });
        if (user) {
          counts.merged += 1;
          user.firstName = String(profile.firstName || user.firstName || '').trim();
          user.lastName = String(profile.lastName || user.lastName || '').trim();
          if (String(profile.phone || '').trim()) user.phone = String(profile.phone).trim();
          if (Array.isArray(profile.tags) && profile.tags.length) {
            user.tags = Array.isArray(user.tags) ? user.tags.slice() : [];
            profile.tags.forEach(function (tag) {
              const normalizedTag = String(tag || '').trim();
              if (normalizedTag && user.tags.indexOf(normalizedTag) === -1 && user.tags.length < 20) {
                user.tags.push(normalizedTag);
              }
            });
          }
          if (canImportSubscribed && user.marketingStatus !== 'subscribed') {
            user.marketingStatus = 'subscribed';
            appendImportedStatus(user, 'subscribed', profile, source, consentValidation.consent);
          } else if (MARKETING_STATUSES.has(profile.marketingStatus) && !importsSubscribed && user.marketingStatus !== profile.marketingStatus) {
            user.marketingStatus = profile.marketingStatus;
            appendImportedStatus(user, profile.marketingStatus, profile, source);
          }
          user.marketingChannels = user.marketingChannels || {
            email: user.marketingStatus === 'subscribed',
            sms: false,
            whatsapp: false
          };
          user.marketingChannels.email = user.marketingStatus === 'subscribed';
          ['sms', 'whatsapp'].forEach(function (channel) {
            if (profile.marketingChannels &&
                Object.prototype.hasOwnProperty.call(profile.marketingChannels, channel)) {
              user.marketingChannels[channel] = Boolean(profile.marketingChannels[channel]);
            }
          });
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
          initialConsentHistory = [Object.assign({ status: 'subscribed' }, consentValidation.consent)];
        } else if (initialMarketingStatus !== 'not_subscribed' && MARKETING_STATUSES.has(initialMarketingStatus)) {
          initialConsentHistory = [{
            status: initialMarketingStatus,
            source: source || 'import',
            consentedAt: importStatusTime(profile),
            note: ''
          }];
        }
        user = buildUser({
          shopId: targetShopId, email: email, firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone,
          tags: Array.isArray(profile.tags) ? profile.tags : [],
          accountStatus: 'pending', marketingStatus: initialMarketingStatus,
          marketingChannels: profile.marketingChannels,
          source: source || 'import', externalProfiles: externalId ? [profileRecord(profile, source)] : [], stores: profile.store ? [profile.store] : [],
          consentHistory: initialConsentHistory
        });
        users.push(user);
        counts.created += 1;
      } catch (error) {
        counts.failed += 1;
        details.failures.push({
          index: index,
          email: normalizeEmail(profile && profile.email),
          code: 'IMPORT_ROW_FAILED',
          error: error && error.message ? error.message : '导入失败'
        });
      }
    });
    write(users);
    return { ok: true, counts: counts, warnings: warnings, details: details };
  }

  function subscribe(payload) {
    payload = typeof payload === 'string' ? { email: payload } : (payload || {});
    const shopId = normalizeShopId(payload.shopId);
    const existing = findByEmail(payload.email, shopId);
    if (existing) return setMarketingStatus([existing.id], 'subscribed', payload.consent || payload);
    return createManual({
      shopId: shopId, email: payload.email, firstName: payload.firstName, lastName: payload.lastName,
      marketingOptIn: true, consent: payload.consent || payload
    });
  }

  function writeLockApi() {
    const locks = root && root.navigator && root.navigator.locks;
    return locks && typeof locks.request === 'function' ? locks : null;
  }

  function lockFailure(code, error) {
    return {
      ok: false,
      code: code,
      error: error,
      removed: 0
    };
  }

  function withWriteLock(operation, options) {
    const config = options || {};
    const locks = writeLockApi();
    if (!locks) {
      if (config.requireLock) {
        return Promise.resolve(lockFailure(
          'LOCK_UNAVAILABLE',
          config.lockUnavailableError || '当前浏览器无法取得安全写锁，未执行此次操作，请重试。'
        ));
      }
      // Reversible mutations retain an explicit compatibility fallback.
      return Promise.resolve().then(operation);
    }
    try {
      return Promise.resolve(locks.request(
        WRITE_LOCK_NAME,
        { mode: 'exclusive' },
        operation
      )).catch(function (error) {
        return lockFailure(
          'LOCK_ERROR',
          error && error.message ? error.message : '无法取得安全写锁，请重试。'
        );
      });
    } catch (error) {
      return Promise.resolve(lockFailure(
        'LOCK_ERROR',
        error && error.message ? error.message : '无法取得安全写锁，请重试。'
      ));
    }
  }

  function createManualLocked(payload) {
    return withWriteLock(function () { return createManual(payload); }, {
      requireLock: true,
      lockUnavailableError: '当前浏览器无法取得客户编号写锁，未创建用户，请重试。'
    });
  }

  function updateLocked(id, changes) {
    return withWriteLock(function () { return update(id, changes); });
  }

  function activateByEmailLocked(email, provider, shopId) {
    return withWriteLock(function () { return activateByEmail(email, provider, shopId); });
  }

  function setAccountStatusLocked(ids, status) {
    return withWriteLock(function () { return setAccountStatus(ids, status); });
  }

  function setMarketingStatusLocked(ids, status, consent) {
    return withWriteLock(function () { return setMarketingStatus(ids, status, consent); });
  }

  function setMarketingChannelStatusLocked(ids, channel, enabled, consent) {
    return withWriteLock(function () {
      return setMarketingChannelStatus(ids, channel, enabled, consent);
    });
  }

  function addTagToUsersLocked(ids, value) {
    return withWriteLock(function () { return addTagToUsers(ids, value); });
  }

  function addTagsToUsersLocked(ids, values) {
    return withWriteLock(function () { return addTagsToUsers(ids, values); });
  }

  function importProfilesLocked(profiles, source, shopId) {
    return withWriteLock(function () { return importProfiles(profiles, source, shopId); }, {
      requireLock: true,
      lockUnavailableError: '当前浏览器无法取得客户编号写锁，未导入用户，请重试。'
    });
  }

  function subscribeLocked(payload) {
    return withWriteLock(function () { return subscribe(payload); }, {
      requireLock: true,
      lockUnavailableError: '当前浏览器无法取得客户编号写锁，未创建订阅用户，请重试。'
    });
  }

  function removeUsersIfRiskUnchangedLocked(ids, expectedFingerprints) {
    return withWriteLock(function () {
      return removeUsersIfRiskUnchanged(ids, expectedFingerprints);
    }, { requireLock: true });
  }

  function resetForTests(users) {
    reservedIds.clear();
    customerSequences.clear();
    customerSequencesDirty = false;
    const store = storage();
    if (store) {
      try {
        store.removeItem(STORAGE_KEY);
        store.removeItem(CUSTOMER_SEQUENCE_KEY);
      } catch (error) { /* ignored for tests */ }
    }
    memory = Array.isArray(users)
      ? ensureCustomerNumbers(ensureUniqueUserIds(users.map(buildUser))).users
      : [];
    loaded = true;
    lastStorageSnapshot = null;
    lastSynchronizedUsers = clone(memory);
    storageDirty = false;
  }

  return {
    list: list,
    listForShop: listForShop,
    get: get,
    getForShop: getForShop,
    findByEmail: findByEmail,
    createManual: createManual,
    createManualLocked: createManualLocked,
    update: update,
    updateLocked: updateLocked,
    activateByEmail: activateByEmail,
    activateByEmailLocked: activateByEmailLocked,
    remove: remove,
    removeUsersIfRiskUnchanged: removeUsersIfRiskUnchanged,
    removeUsersIfRiskUnchangedLocked: removeUsersIfRiskUnchangedLocked,
    deletionRiskFingerprint: deletionRiskFingerprint,
    setAccountStatus: setAccountStatus,
    setAccountStatusLocked: setAccountStatusLocked,
    setMarketingStatus: setMarketingStatus,
    setMarketingStatusLocked: setMarketingStatusLocked,
    setMarketingChannelStatus: setMarketingChannelStatus,
    setMarketingChannelStatusLocked: setMarketingChannelStatusLocked,
    addTagToUsers: addTagToUsers,
    addTagToUsersLocked: addTagToUsersLocked,
    addTagsToUsers: addTagsToUsers,
    addTagsToUsersLocked: addTagsToUsersLocked,
    importProfiles: importProfiles,
    importProfilesLocked: importProfilesLocked,
    subscribe: subscribe,
    subscribeLocked: subscribeLocked,
    resetForTests: resetForTests
  };
});
