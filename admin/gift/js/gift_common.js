/* ============================================================
   赠品管理 - 公共数据与交互（admin/gift/js/gift_common.js）
   提供：商品/系列主数据、赠品池、赠品规则（统一模型）的数据与存储，
        以及可搜索下拉(combobox)、范围/赠品/商品/SKU 选择对话框。
   样式沿用 gift.css（.gwp-*）与全局 commons.css。
   ============================================================ */
(function () {
  'use strict';
  const GWP = (window.GWP = window.GWP || {});

  /* ====================== 主数据：商品 & 系列 ====================== */
  // 真实商品主数据（含多 SKU / 变体），供赠品池“关联产品及SKU”与规则“赠送范围”选择
  // 假发主商品（1-3）+ 假发周边护理配件（4-10，可作为购买假发后的赠品套装成员）
  const PA_PRODUCTS = [
    { id: '1', spu: 'SPU-FW-00001', title: '女士真人发全头套', image: '👩', baseCount: 42, stock: 260, price: 1299,
      variants: [
        { id: 'V101', sku: 'SKU-全头套-自然黑-中长', stock: 90, price: 1299 },
        { id: 'V102', sku: 'SKU-全头套-栗棕-中长', stock: 80, price: 1299 },
        { id: 'V103', sku: 'SKU-全头套-自然黑-长发', stock: 90, price: 1399 }
      ] },
    { id: '2', spu: 'SPU-FW-00002', title: '蕾丝前额假发', image: '💇‍♀️', baseCount: 36, stock: 180, price: 1599,
      variants: [
        { id: 'V201', sku: 'SKU-蕾丝假发-自然黑-16寸', stock: 90, price: 1599 },
        { id: 'V202', sku: 'SKU-蕾丝假发-深棕-18寸', stock: 90, price: 1699 }
      ] },
    { id: '3', spu: 'SPU-HE-00001', title: '女士接发片', image: '💁‍♀️', baseCount: 58, stock: 320, price: 499,
      variants: [
        { id: 'V301', sku: 'SKU-接发片-自然黑-20寸', stock: 160, price: 499 },
        { id: 'V302', sku: 'SKU-接发片-亚麻棕-20寸', stock: 160, price: 529 }
      ] },
    { id: '4', spu: 'SPU-HA-00004', title: '假发专用钢丝梳', image: '🪮', baseCount: 210, stock: 980, price: 39,
      variants: [
        { id: 'V401', sku: 'SKU-钢丝梳-经典款', stock: 980, price: 39 }
      ] },
    { id: '5', spu: 'SPU-CP-00003', title: '免洗柔顺护理喷雾', image: '🧴', baseCount: 160, stock: 720, price: 69,
      variants: [
        { id: 'V501', sku: 'SKU-护理喷雾-玫瑰香-100ml', stock: 360, price: 69 },
        { id: 'V502', sku: 'SKU-护理喷雾-无香型-100ml', stock: 360, price: 69 }
      ] },
    { id: '6', spu: 'SPU-HA-00005', title: '隐形防滑发网', image: '🧢', baseCount: 300, stock: 1500, price: 29,
      variants: [
        { id: 'V601', sku: 'SKU-发网-黑色5只装', stock: 800, price: 29 },
        { id: 'V602', sku: 'SKU-发网-肤色5只装', stock: 700, price: 29 }
      ] },
    { id: '7', spu: 'SPU-HA-00006', title: '折叠假发支架', image: '🗄️', baseCount: 120, stock: 540, price: 59,
      variants: [
        { id: 'V701', sku: 'SKU-支架-折叠款-黑', stock: 540, price: 59 }
      ] },
    { id: '8', spu: 'SPU-CP-00004', title: '蕾丝专用假发胶', image: '🧪', baseCount: 140, stock: 620, price: 89,
      variants: [
        { id: 'V801', sku: 'SKU-假发胶-防水型-30ml', stock: 620, price: 89 }
      ] },
    { id: '9', spu: 'SPU-HA-00007', title: '假发收纳防尘盒', image: '📦', baseCount: 100, stock: 460, price: 79,
      variants: [
        { id: 'V901', sku: 'SKU-收纳盒-便携款', stock: 460, price: 79 }
      ] },
    { id: '10', spu: 'SPU-CP-00005', title: '假发洗护发套装', image: '🧼', baseCount: 90, stock: 380, price: 129,
      variants: [
        { id: 'V1001', sku: 'SKU-洗护套装-滋养修护型', stock: 380, price: 129 }
      ] }
  ];

  const PRODUCT_FILTER_META = {
    '1': { categoryId: 1, categoryName: '女士全头套', collectionIds: ['C1', 'C4'], attributeValues: { 1: [1], 3: [9, 11] } },
    '2': { categoryId: 1, categoryName: '女士全头套', collectionIds: ['C1', 'C2', 'C4'], attributeValues: { 1: [1], 3: [9] } },
    '3': { categoryId: 2, categoryName: '女士接发', collectionIds: ['C3', 'C4'], attributeValues: { 11: [1], 14: [14] } },
    '4': { categoryId: 3, categoryName: '发饰配件', collectionIds: ['C4'], attributeValues: { 20: [10], 21: [11] } },
    '5': { categoryId: 4, categoryName: '护理产品', collectionIds: ['C4'], attributeValues: { 24: [2], 28: [24] } },
    '6': { categoryId: 3, categoryName: '发饰配件', collectionIds: ['C4'], attributeValues: { 20: [8], 21: [11] } },
    '7': { categoryId: 3, categoryName: '发饰配件', collectionIds: ['C4'], attributeValues: { 20: [10], 21: [11] } },
    '8': { categoryId: 4, categoryName: '护理产品', collectionIds: ['C4'], attributeValues: { 24: [1], 28: [24] } },
    '9': { categoryId: 3, categoryName: '发饰配件', collectionIds: ['C4'], attributeValues: { 20: [10], 21: [11] } },
    '10': { categoryId: 4, categoryName: '护理产品', collectionIds: ['C4'], attributeValues: { 24: [2], 28: [20, 21] } }
  };

  PA_PRODUCTS.forEach((product) => {
    const prices = (product.variants || []).map((variant) => Number(variant.price) || 0).filter((price) => price >= 0);
    const stock = (product.variants || []).reduce((total, variant) => total + Math.max(0, Number(variant.stock) || 0), 0);
    Object.assign(product, PRODUCT_FILTER_META[product.id] || {}, {
      priceMin: prices.length ? Math.min.apply(null, prices) : Math.max(0, Number(product.price) || 0),
      priceMax: prices.length ? Math.max.apply(null, prices) : Math.max(0, Number(product.price) || 0),
      stock
    });
  });

  const PRODUCT_FILTER_CATEGORIES = [
    { id: 1, nameZh: '女士全头套', status: 'active' },
    { id: 2, nameZh: '女士接发', status: 'active' },
    { id: 3, nameZh: '发饰配件', status: 'active' },
    { id: 4, nameZh: '护理产品', status: 'active' }
  ];

  const PRODUCT_FILTER_ATTRIBUTES = [
    { id: 1, categoryId: 1, nameZh: '发丝材质', status: 'active', options: [
      { id: 1, labelZh: '全真发', status: 'active' },
      { id: 2, labelZh: '人发混丝', status: 'active' },
      { id: 3, labelZh: '高温化纤丝', status: 'active' }
    ] },
    { id: 3, categoryId: 1, nameZh: '发色', status: 'active', options: [
      { id: 9, labelZh: '自然黑', status: 'active' },
      { id: 11, labelZh: '栗棕', status: 'active' }
    ] },
    { id: 11, categoryId: 2, nameZh: '发丝材质', status: 'active', options: [
      { id: 1, labelZh: 'Remy全真发', status: 'active' },
      { id: 2, labelZh: '非Remy真发', status: 'active' }
    ] },
    { id: 14, categoryId: 2, nameZh: '接发方式', status: 'active', options: [
      { id: 14, labelZh: '卡扣片接', status: 'active' },
      { id: 15, labelZh: '8D无痕胶接', status: 'active' }
    ] },
    { id: 20, categoryId: 3, nameZh: '配件类型', status: 'active', options: [
      { id: 8, labelZh: '发圈', status: 'active' },
      { id: 10, labelZh: '发夹/一字夹', status: 'active' }
    ] },
    { id: 21, categoryId: 3, nameZh: '颜色', status: 'active', options: [
      { id: 11, labelZh: '经典黑', status: 'active' },
      { id: 12, labelZh: '珍珠白', status: 'active' }
    ] },
    { id: 24, categoryId: 4, nameZh: '容量规格', status: 'active', options: [
      { id: 1, labelZh: '旅行装(30ml)', status: 'active' },
      { id: 2, labelZh: '标准装(100ml)', status: 'active' }
    ] },
    { id: 28, categoryId: 4, nameZh: '产品类型', status: 'active', options: [
      { id: 20, labelZh: '洗发水', status: 'active' },
      { id: 21, labelZh: '护发素', status: 'active' },
      { id: 24, labelZh: '免洗喷雾', status: 'active' }
    ] }
  ];

  const COLLECTIONS = [
    { id: 'C1', name: '全头套系列', desc: '女士全头套 / 真人发全头套' },
    { id: 'C2', name: '蕾丝假发系列', desc: '蕾丝前额 / 头顶补发' },
    { id: 'C3', name: '接发系列', desc: '接发片 / 发帘' },
    { id: 'C4', name: '全店', desc: '所有商品' }
  ];

  GWP.products = PA_PRODUCTS;
  GWP.collections = COLLECTIONS;
  GWP.getProduct = (id) => PA_PRODUCTS.find((p) => p.id === id) || null;
  GWP.getCollection = (id) => COLLECTIONS.find((c) => c.id === id) || null;

  function productFilterHost() {
    const hosts = [window];
    try {
      if (window.parent && window.parent !== window) hosts.push(window.parent);
    } catch (e) {}
    return hosts.find((host) => Array.isArray(host.categories) || typeof host.getAttributesByCategory === 'function') || null;
  }

  function productFilterCategories() {
    const host = productFilterHost();
    const categories = host && Array.isArray(host.categories) ? host.categories : PRODUCT_FILTER_CATEGORIES;
    return categories.filter((category) => category.status !== 'disabled');
  }

  function productFilterAttributes(categoryId) {
    const supportedAttributeIds = new Set(
      PA_PRODUCTS
        .filter((product) => Number(product.categoryId) === Number(categoryId))
        .flatMap((product) => Object.keys(product.attributeValues || {}))
        .map(String)
    );
    const host = productFilterHost();
    if (host && typeof host.getAttributesByCategory === 'function') {
      try {
        return (host.getAttributesByCategory(Number(categoryId)) || [])
          .filter((attribute) => supportedAttributeIds.has(String(attribute.id)));
      } catch (e) {}
    }
    return PRODUCT_FILTER_ATTRIBUTES.filter((attribute) =>
      Number(attribute.categoryId) === Number(categoryId) &&
      attribute.status !== 'disabled' &&
      supportedAttributeIds.has(String(attribute.id))
    );
  }

  /* ====================== 存储 ====================== */
  const LS_POOL = 'gwp_pool_v3';
  const LS_RULE_LEGACY = 'gwp_rule_v3';
  const LS_RULE_PREVIOUS = 'gwp_rule_v4';
  const LS_RULE = 'gwp_rule_v5';

  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  GWP.today = today;

  function gwpSave(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function gwpLoad(key, def) {
    try {
      const s = localStorage.getItem(key);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return def;
  }

  /* ====================== 默认数据 ====================== */
  function defaultPool() {
    return [
      {
        id: 'P001',
        displayName: '假发新手护理套装',
        products: [
          { productId: '4', productTitle: '假发专用钢丝梳', image: '🪮',
            variants: [
              { variantId: 'V401', sku: 'SKU-钢丝梳-经典款', stock: 500 }
            ] },
          { productId: '5', productTitle: '免洗柔顺护理喷雾', image: '🧴',
            variants: [
              { variantId: 'V501', sku: 'SKU-护理喷雾-玫瑰香-100ml', stock: 300 }
            ] },
          { productId: '6', productTitle: '隐形防滑发网', image: '🧢',
            variants: [
              { variantId: 'V601', sku: 'SKU-发网-黑色5只装', stock: 400 }
            ] }
        ],
        status: 'active',
        remark: '购买假发赠送，新手佩戴护理必备',
        createdAt: '2026-07-20 10:30'
      },
      {
        id: 'P002',
        displayName: '蕾丝假发固定套装',
        products: [
          { productId: '8', productTitle: '蕾丝专用假发胶', image: '🧪',
            variants: [
              { variantId: 'V801', sku: 'SKU-假发胶-防水型-30ml', stock: 260 }
            ] },
          { productId: '6', productTitle: '隐形防滑发网', image: '🧢',
            variants: [
              { variantId: 'V602', sku: 'SKU-发网-肤色5只装', stock: 200 }
            ] }
        ],
        status: 'active',
        remark: '蕾丝前额假发专属赠品，牢固不移位',
        createdAt: '2026-07-18 14:12'
      },
      {
        id: 'P003',
        displayName: '假发收纳保养套装',
        products: [
          { productId: '7', productTitle: '折叠假发支架', image: '🗄️',
            variants: [
              { variantId: 'V701', sku: 'SKU-支架-折叠款-黑', stock: 150 }
            ] },
          { productId: '9', productTitle: '假发收纳防尘盒', image: '📦',
            variants: [
              { variantId: 'V901', sku: 'SKU-收纳盒-便携款', stock: 120 }
            ] }
        ],
        status: 'active',
        remark: '高客单价订单赠品，收纳防尘防变形',
        createdAt: '2026-07-16 09:40'
      },
      {
        id: 'P004',
        displayName: '假发深层洗护套装',
        products: [
          { productId: '10', productTitle: '假发洗护发套装', image: '🧼',
            variants: [
              { variantId: 'V1001', sku: 'SKU-洗护套装-滋养修护型', stock: 200 }
            ] }
        ],
        status: 'draft',
        remark: '会员专享，长发/接发深层护理',
        createdAt: '2026-07-15 09:05'
      }
    ];
  }

  function defaultRules() {
    return [
      {
        id: 'R001',
        name: '全店购买任意1件送假发新手护理套装',
        scope: { mode: 'collection', sources: [{ type: 'collection', id: 'C4', name: '全店' }] },
        conditions: [{ id: 'c1', type: 'sku_base', value: 1 }],
        combine: 'or',
        reward: { type: 'gift', gifts: [{ id: 'P001', name: '假发新手护理套装', qty: 1 }], points: 0 },
        status: 'active',
        createdAt: '2026-07-20 11:00'
      },
      {
        id: 'R002',
        name: '蕾丝前额假发买1件送固定套装',
        scope: { mode: 'product', sources: [{ type: 'product', id: '2', name: '蕾丝前额假发' }] },
        conditions: [{ id: 'c1', type: 'sku_base', value: 1 }],
        combine: 'or',
        reward: { type: 'gift', gifts: [{ id: 'P002', name: '蕾丝假发固定套装', qty: 1 }], points: 0 },
        status: 'active',
        createdAt: '2026-07-19 16:40'
      },
      {
        id: 'R003',
        name: '全头套系列购买2件且SKU单价满499送双赠品',
        scope: { mode: 'collection', sources: [{ type: 'collection', id: 'C1', name: '全头套系列' }] },
        conditions: [
          { id: 'c1', type: 'sku_base', value: 2 },
          { id: 'c2', type: 'sku_price', value: 499 }
        ],
        combine: 'and',
        reward: {
          type: 'gift',
          gifts: [
            { id: 'P001', name: '假发新手护理套装', qty: 1 },
            { id: 'P003', name: '假发收纳保养套装', qty: 1 }
          ],
          points: 0
        },
        status: 'active',
        createdAt: '2026-07-18 10:20'
      },
      {
        id: 'R004',
        name: '接发系列购买2件送收纳保养套装',
        scope: { mode: 'collection', sources: [{ type: 'collection', id: 'C3', name: '接发系列' }] },
        conditions: [{ id: 'c1', type: 'sku_base', value: 2 }],
        combine: 'or',
        reward: { type: 'gift', gifts: [{ id: 'P003', name: '假发收纳保养套装', qty: 1 }], points: 0 },
        status: 'draft',
        createdAt: '2026-07-17 09:30'
      }
    ];
  }

  /* ====================== 数据访问（含 localStorage 持久化） ====================== */
  function withGiftBusinessNumbers(storageKey, records, field, prefix, sequenceKey) {
    const list = Array.isArray(records) ? records : [];
    const matcher = new RegExp('^' + prefix + '-\\d{6,}$');
    const needsSave = list.some((record) => !matcher.test(String(record && record[field] || '').toUpperCase()));
    ensureBusinessNumbers(list, field, prefix, sequenceKey);
    if (needsSave) gwpSave(storageKey, list);
    return list;
  }

  GWP.pool = function () {
    return withGiftBusinessNumbers(
      LS_POOL,
      gwpLoad(LS_POOL, defaultPool()),
      'giftNumber',
      'GFT',
      'rebecca_gift_number_sequence_v1'
    );
  };
  function normalizeGiftRule(rule) {
    if (!rule || !rule.reward || rule.reward.type !== 'gift') return null;
    const normalized = { ...rule };
    delete normalized.pickOne;
    if (normalized.scope && normalized.scope.mode === 'product_sku') {
      normalized.scope = { ...normalized.scope, mode: 'product' };
    }
    normalized.conditions = (normalized.conditions || [])
      .filter((condition) => condition.type === 'sku_base' || condition.type === 'sku_price')
      .map((condition) => ({ ...condition }));
    if (!normalized.conditions.length) {
      normalized.conditions = [{ id: 'c1', type: 'sku_base', value: 1 }];
    }
    return normalized;
  }
  function loadRules() {
    const current = gwpLoad(LS_RULE, null);
    if (Array.isArray(current)) {
      return withGiftBusinessNumbers(
        LS_RULE,
        current.map(normalizeGiftRule).filter(Boolean),
        'giftRuleNumber',
        'GFR',
        'rebecca_gift_rule_number_sequence_v1'
      );
    }

    const defaults = defaultRules();
    const previous = gwpLoad(LS_RULE_PREVIOUS, null);
    const legacy = Array.isArray(previous) ? previous : gwpLoad(LS_RULE_LEGACY, null);
    if (!Array.isArray(legacy)) {
      return withGiftBusinessNumbers(
        LS_RULE,
        defaults,
        'giftRuleNumber',
        'GFR',
        'rebecca_gift_rule_number_sequence_v1'
      );
    }

    const defaultIds = new Set(defaults.map((rule) => rule.id));
    const customRules = legacy.map(normalizeGiftRule).filter(Boolean).filter((rule) => !defaultIds.has(rule.id));
    const result = defaults.concat(customRules);
    return withGiftBusinessNumbers(
      LS_RULE,
      result,
      'giftRuleNumber',
      'GFR',
      'rebecca_gift_rule_number_sequence_v1'
    );
  }
  GWP.rules = loadRules;
  GWP.savePool = function (obj) {
    const list = GWP.pool();
    const i = list.findIndex((x) => x.id === obj.id);
    if (i >= 0 && !obj.giftNumber) obj.giftNumber = list[i].giftNumber;
    if (i >= 0) list[i] = obj; else list.push(obj);
    ensureBusinessNumbers(
      list,
      'giftNumber',
      'GFT',
      'rebecca_gift_number_sequence_v1'
    );
    gwpSave(LS_POOL, list);
    return obj;
  };
  GWP.getPool = function (id) { return GWP.pool().find((x) => x.id === id) || null; };
  GWP.deletePool = function (id) {
    gwpSave(LS_POOL, GWP.pool().filter((x) => x.id !== id));
  };
  GWP.saveRule = function (obj) {
    const list = GWP.rules();
    const i = list.findIndex((x) => x.id === obj.id);
    if (i >= 0 && !obj.giftRuleNumber) obj.giftRuleNumber = list[i].giftRuleNumber;
    if (i >= 0) list[i] = obj; else list.push(obj);
    ensureBusinessNumbers(
      list,
      'giftRuleNumber',
      'GFR',
      'rebecca_gift_rule_number_sequence_v1'
    );
    gwpSave(LS_RULE, list);
    return obj;
  };
  GWP.getRule = function (id) { return GWP.rules().find((x) => x.id === id) || null; };
  GWP.deleteRule = function (id) {
    gwpSave(LS_RULE, GWP.rules().filter((x) => x.id !== id));
  };
  GWP.duplicatePool = function (id) {
    const p = GWP.getPool(id); if (!p) return null;
    const copy = JSON.parse(JSON.stringify(p));
    copy.id = GWP.newId('P');
    delete copy.giftNumber;
    copy.displayName = p.displayName + ' 副本';
    copy.status = 'draft';
    copy.createdAt = GWP.today();
    return GWP.savePool(copy);
  };
  GWP.duplicateRule = function (id) {
    const r = GWP.getRule(id); if (!r) return null;
    const copy = JSON.parse(JSON.stringify(r));
    copy.id = GWP.newId('R');
    delete copy.giftRuleNumber;
    copy.name = r.name + ' 副本';
    copy.status = 'draft';
    copy.createdAt = GWP.today();
    return GWP.saveRule(copy);
  };
  GWP.newId = function (prefix) {
    return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
  };

  /* ====================== 状态 / 标签 文案 ====================== */
  GWP.STATUS = [
    { value: 'active', label: '启用' },
    { value: 'disabled', label: '禁用' },
    { value: 'draft', label: '草稿' }
  ];
  GWP.statusLabel = (v) => (GWP.STATUS.find((s) => s.value === v) || {}).label || v;
  // 与产品列表保持一致：启用=绿(success) 禁用=红(error) 草稿=橙(warning)
  GWP.statusClass = (v) => ({ active: 'badge-success', disabled: 'badge-error', draft: 'badge-warning' }[v] || 'badge-secondary');

  GWP.condTypeLabel = (t) => ({
    sku_base: 'SKU购买基数 ≥',
    sku_price: 'SKU单价 ≥'
  }[t] || t);
  GWP.condTypeUnit = (t) => ({ sku_base: '件', sku_price: '元' }[t] || '');
  GWP.rewardLabel = (r) => {
    if (!r) return '-';
    if (r.type === 'points') return `送 ${r.points} 积分`;
    if (r.type === 'gift') {
      const n = (r.gifts || []).length;
      return n ? `送赠品 ${n} 项` : '送赠品';
    }
    return '-';
  };

  GWP.escapeHtml = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  /* ====================== 可搜索下拉 combobox（含 enum 模式） ====================== */
  // 用法：<div class="gwp-combo" data-kind="enum" data-arg="active:启用|disabled:禁用|draft:草稿" data-value="active"></div>
  // 其它 kind：scope / gift / product 会渲染为触发按钮，点击打开选择对话框。
  function gwpComboBuild(c) {
    const kind = c.dataset.kind || 'enum';
    if (kind === 'scope' || kind === 'gift' || kind === 'product') {
      const label = c.dataset.label || (kind === 'scope' ? '选择赠送范围' : kind === 'gift' ? '选择赠品' : '选择商品');
      const cur = c.querySelector('.gwp-combo-input');
      c.innerHTML = `<button type="button" class="gwp-combo-input gwp-combo-btn">${cur ? cur.value : label}</button>`;
      c.classList.add('gwp-combo-' + kind);
      c.querySelector('.gwp-combo-btn').addEventListener('click', () => {
        if (kind === 'scope') GWP.gwpOpenScopeDialog((sources) => { GWP._applyScope(c, sources); }, c._sources || [], c.dataset.mode || '');
        else if (kind === 'gift') GWP.gwpOpenGiftDialog((g) => { GWP._applyGift(c, g); }, true, c._gifts || []);
        else if (kind === 'product') GWP.gwpOpenProductPicker((p) => { GWP._applyProduct(c, p); });
      });
      return;
    }
    // enum 模式：内联可搜索下拉
    const arg = c.dataset.arg || '';
    const opts = arg.split('|').map((s) => { const i = s.indexOf(':'); return i < 0 ? { value: s, label: s } : { value: s.slice(0, i), label: s.slice(i + 1) }; });
    const val = c.dataset.value || '';
    const sel = opts.find((o) => o.value === val);
    c.innerHTML =
      `<input type="text" class="gwp-combo-input" autocomplete="off" placeholder="${c.dataset.placeholder || '请选择'}" value="${sel ? GWP.escapeHtml(sel.label) : ''}">` +
      `<span class="gwp-combo-clear" title="清除">✕</span>` +
      `<span class="gwp-combo-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0937D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>` +
      `<div class="gwp-combo-menu"></div>`;
    const input = c.querySelector('.gwp-combo-input');
    const menu = c.querySelector('.gwp-combo-menu');
    const clear = c.querySelector('.gwp-combo-clear');
    c._opts = opts;
    function syncClear() {
      const v = c.dataset.value || '';
      const def = c.dataset.default || '';
      c.classList.toggle('has-value', !!v && v !== def);
    }
    function render(filter) {
      const f = (filter || '').trim();
      const list = opts.filter((o) => !f || o.label.includes(f) || o.value === f);
      const defVal = c.dataset.default;
      let n = 0;
      menu.innerHTML = list.length
        ? list.map((o) => {
            const isDef = defVal && o.value === defVal;
            const idx = isDef ? '' : (defVal ? (++n) + '.' : (opts.indexOf(o) + 1) + '.');
            const idxHtml = idx ? `<span class="gwp-combo-idx">${idx}</span>` : '';
            return `<div class="gwp-combo-item${o.value === (c.dataset.value || '') ? ' selected' : ''}" data-value="${GWP.escapeHtml(o.value)}">${idxHtml}<span>${GWP.escapeHtml(o.label)}</span></div>`;
          }).join('')
        : `<div class="gwp-combo-empty">无匹配项</div>`;
      menu.querySelectorAll('.gwp-combo-item').forEach((it) => {
        it.addEventListener('mousedown', (e) => {
          e.preventDefault();
          c.dataset.value = it.dataset.value;
          input.value = it.querySelector('span:last-child').textContent;
          menu.style.display = 'none';
          syncClear();
          c.dispatchEvent(new CustomEvent('gwpcombochange', { bubbles: true }));
        });
      });
    }
    function open() { render(''); menu.style.display = 'block'; try { input.select(); } catch (e) {} }
    input.addEventListener('focus', open);
    input.addEventListener('click', open);
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const f = input.value.trim();
        const hit = opts.find((o) => o.value === f || o.label === f);
        if (hit) { c.dataset.value = hit.value; input.value = hit.label; menu.style.display = 'none'; syncClear(); }
      }
    });
    syncClear();
    clear.addEventListener('click', (e) => {
      e.stopPropagation();
      const def = c.dataset.default || '';
      c.dataset.value = def;
      const s = opts.find((o) => o.value === def);
      input.value = s ? s.label : '';
      menu.style.display = 'none';
      syncClear();
      c.dispatchEvent(new CustomEvent('gwpcombochange', { bubbles: true }));
    });
    input.addEventListener('blur', () => setTimeout(() => { menu.style.display = 'none'; if (!c.dataset.value) input.value = ''; else { const s = opts.find((o) => o.value === c.dataset.value); input.value = s ? s.label : ''; } }, 150));
  }
  GWP.gwpCombo = function (root) {
    (root || document).querySelectorAll('.gwp-combo').forEach(gwpComboBuild);
  };
  GWP.gwpComboBuild = gwpComboBuild; // 单元素重建（用于动态生成的下拉）
  GWP.comboValue = function (el) { return el ? el.dataset.value || '' : ''; };
  GWP.setComboValue = function (el, val) {
    if (!el) return;
    el.dataset.value = val || '';
    const input = el.querySelector('.gwp-combo-input');
    if (input) {
      const o = (el._opts || []).find((x) => x.value === val);
      input.value = o ? o.label : '';
    }
    const def = el.dataset.default || '';
    el.classList.toggle('has-value', !!val && val !== def);
  };

  function scopeFilterCombo(id, placeholder, options, value) {
    const arg = options.map((option) => `${option.value}:${option.label}`).join('|');
    return `<div class="gwp-combo gwp-product-filter-combo" id="${id}" data-kind="enum" data-arg="${GWP.escapeHtml(arg)}" data-value="${GWP.escapeHtml(value || '')}" data-default="" data-placeholder="${GWP.escapeHtml(placeholder)}"></div>`;
  }

  function openProductScopeDialog(cb, initial) {
    const products = GWP.products || [];
    const selected = new Set((initial || []).filter((source) => source.type === 'product').map((source) => source.id));
    const filters = {
      categoryId: '',
      attributes: {},
      collectionId: '',
      priceMin: '',
      priceMax: '',
      stockMin: '',
      stockMax: ''
    };
    let keyword = '';
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="pf-dialog gwp-product-scope-dialog">
        <div class="pf-dialog-header">
          <span class="pf-dialog-title">选择产品</span>
          <button type="button" class="pf-dialog-close" aria-label="关闭">✕</button>
        </div>
        <div class="pf-dialog-search">
          <input type="text" id="scopeProductSearch" placeholder="搜索产品名称/SPU 编码">
          <button type="button" class="btn btn-secondary btn-sm" id="scopeProductSearchBtn">搜索</button>
        </div>
        <div class="pf-dialog-body gwp-product-picker-layout">
          <aside class="gwp-product-filter-panel">
            <div class="gwp-product-filter-head">
              <span>筛选条件</span>
              <button type="button" class="pf-link-btn" id="scopeResetFilters">重置</button>
            </div>
            <div id="scopeProductFilters"></div>
          </aside>
          <section class="gwp-product-picker-results">
            <div class="gwp-product-result-head">
              <span id="scopeProductResultCount">共 0 个产品</span>
              <span>仅支持选择产品，不支持选择具体 SKU</span>
            </div>
            <div class="gwp-product-picker-table-wrap">
              <div class="gwp-product-picker-table">
                <div class="gwp-product-picker-row gwp-product-picker-table-head">
                  <span></span>
                  <span>产品名称/编号</span>
                  <span>产品分类</span>
                  <span>价格区间</span>
                  <span>总库存</span>
                  <span>SKU 数</span>
                </div>
                <div id="scopeProductList"></div>
              </div>
            </div>
          </section>
        </div>
        <div class="pf-dialog-footer pf-dialog-footer--split">
          <div class="pf-dialog-footer-left">
            <label class="pf-dialog-select-all-check">
              <input type="checkbox" id="scopeProductSelectAll">
              <span>全选当前结果</span>
            </label>
            <span class="pf-dialog-count" id="scopeProductCount"></span>
            <button type="button" class="pf-link-btn" id="scopeProductClear">清空</button>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" id="scopeProductCancel">取消</button>
            <button type="button" class="btn btn-primary" id="scopeProductOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);

    const searchInput = ov.querySelector('#scopeProductSearch');
    const filterBox = ov.querySelector('#scopeProductFilters');
    const listBox = ov.querySelector('#scopeProductList');
    const selectAll = ov.querySelector('#scopeProductSelectAll');

    function productPrices(product) {
      const prices = (product.variants || []).map((variant) => Number(variant.price) || 0);
      return prices.length ? prices : [Number(product.price) || 0];
    }

    function filteredProducts() {
      const normalizedKeyword = keyword.trim().toLowerCase();
      return products.filter((product) => {
        if (normalizedKeyword && !`${product.title || ''} ${product.spu || ''}`.toLowerCase().includes(normalizedKeyword)) return false;
        if (filters.categoryId && String(product.categoryId) !== String(filters.categoryId)) return false;
        if (filters.collectionId && !(product.collectionIds || []).includes(filters.collectionId)) return false;
        const attributeEntries = Object.entries(filters.attributes);
        if (attributeEntries.some(([attributeId, optionId]) => {
          if (!optionId) return false;
          const values = product.attributeValues && (product.attributeValues[attributeId] || product.attributeValues[Number(attributeId)]);
          return !Array.isArray(values) || !values.map(String).includes(String(optionId));
        })) return false;
        const prices = productPrices(product);
        if ((filters.priceMin !== '' || filters.priceMax !== '') && !prices.some((price) =>
          (filters.priceMin === '' || price >= Number(filters.priceMin)) &&
          (filters.priceMax === '' || price <= Number(filters.priceMax))
        )) return false;
        const stock = Math.max(0, Number(product.stock) || 0);
        if (filters.stockMin !== '' && stock < Number(filters.stockMin)) return false;
        if (filters.stockMax !== '' && stock > Number(filters.stockMax)) return false;
        return true;
      });
    }

    function formatPrice(product) {
      const min = Math.max(0, Number(product.priceMin) || 0);
      const max = Math.max(min, Number(product.priceMax) || min);
      return min === max ? `¥${min}` : `¥${min}–${max}`;
    }

    function updateSelectionSummary(visibleProducts) {
      const allSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selected.has(product.id));
      selectAll.checked = allSelected;
      selectAll.indeterminate = !allSelected && visibleProducts.some((product) => selected.has(product.id));
      selectAll.disabled = visibleProducts.length === 0;
      ov.querySelector('#scopeProductCount').textContent = `已选 ${selected.size} 个产品`;
    }

    function renderProducts() {
      const visibleProducts = filteredProducts();
      ov.querySelector('#scopeProductResultCount').textContent = `共 ${visibleProducts.length} 个产品`;
      listBox.innerHTML = visibleProducts.length ? visibleProducts.map((product) => `
        <label class="gwp-product-picker-row gwp-product-picker-item${selected.has(product.id) ? ' selected' : ''}">
          <span class="gwp-product-picker-check">
            <input type="checkbox" data-product-id="${GWP.escapeHtml(product.id)}" ${selected.has(product.id) ? 'checked' : ''}>
          </span>
          <span class="gwp-product-picker-product">
            <span class="gwp-product-picker-cover">${GWP.escapeHtml(product.image || '📦')}</span>
            <span class="gwp-product-picker-product-info">
              <span class="gwp-product-picker-name">${GWP.escapeHtml(product.title)}</span>
              <span class="gwp-product-picker-spu">${GWP.escapeHtml(product.spu || product.id)}</span>
            </span>
          </span>
          <span class="gwp-product-picker-meta">${GWP.escapeHtml(product.categoryName || '-')}</span>
          <span class="gwp-product-picker-meta">${GWP.escapeHtml(formatPrice(product))}</span>
          <span class="gwp-product-picker-meta">${Math.max(0, Number(product.stock) || 0)}</span>
          <span class="gwp-product-picker-meta">${(product.variants || []).length}</span>
        </label>`).join('') : '<div class="pf-dialog-empty">未找到匹配的产品</div>';
      listBox.querySelectorAll('[data-product-id]').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) selected.add(checkbox.dataset.productId);
          else selected.delete(checkbox.dataset.productId);
          renderProducts();
        });
      });
      updateSelectionSummary(visibleProducts);
    }

    function setupCombo(id, onChange) {
      const combo = ov.querySelector(`#${id}`);
      GWP.gwpComboBuild(combo);
      combo.addEventListener('gwpcombochange', () => onChange(GWP.comboValue(combo)));
    }

    function bindRange(id, key) {
      const input = ov.querySelector(`#${id}`);
      input.addEventListener('input', () => {
        filters[key] = input.value === '' ? '' : Number(input.value);
        renderProducts();
      });
    }

    function renderFilters() {
      const categories = productFilterCategories().map((category) => ({
        value: String(category.id),
        label: category.nameZh || category.nameEn || String(category.id)
      }));
      const attributes = filters.categoryId ? productFilterAttributes(filters.categoryId) : [];
      const attributeFilters = attributes.map((attribute) => {
        const options = (attribute.options || []).filter((option) => option.status !== 'disabled').map((option) => ({
          value: String(option.id),
          label: option.labelZh || option.labelEn || String(option.id)
        }));
        return `
          <div class="gwp-product-filter-group">
            <div class="gwp-product-filter-label">${GWP.escapeHtml(attribute.nameZh || attribute.nameEn || '分类属性')}</div>
            ${scopeFilterCombo(`scopeAttribute_${attribute.id}`, `选择${attribute.nameZh || attribute.nameEn || '属性'}`, options, filters.attributes[attribute.id] || '')}
          </div>`;
      }).join('');
      const collections = (GWP.collections || []).map((collection) => ({ value: collection.id, label: collection.name }));

      filterBox.innerHTML = `
        <div class="gwp-product-filter-group">
          <div class="gwp-product-filter-label">产品分类</div>
          ${scopeFilterCombo('scopeCategory', '全部分类', categories, filters.categoryId)}
        </div>
        ${attributes.length ? `<div class="gwp-product-filter-attributes">${attributeFilters}</div>` : ''}
        <div class="gwp-product-filter-group">
          <div class="gwp-product-filter-label">产品系列</div>
          ${scopeFilterCombo('scopeCollection', '全部系列', collections, filters.collectionId)}
        </div>
        <div class="gwp-product-filter-group">
          <div class="gwp-product-filter-label">价格范围</div>
          <div class="gwp-product-filter-range">
            <input type="number" id="scopePriceMin" min="0" placeholder="最低价" value="${filters.priceMin}">
            <span>—</span>
            <input type="number" id="scopePriceMax" min="0" placeholder="最高价" value="${filters.priceMax}">
          </div>
        </div>
        <div class="gwp-product-filter-group">
          <div class="gwp-product-filter-label">库存范围</div>
          <div class="gwp-product-filter-range">
            <input type="number" id="scopeStockMin" min="0" placeholder="最少" value="${filters.stockMin}">
            <span>—</span>
            <input type="number" id="scopeStockMax" min="0" placeholder="最多" value="${filters.stockMax}">
          </div>
        </div>`;

      setupCombo('scopeCategory', (value) => {
        filters.categoryId = value;
        filters.attributes = {};
        renderFilters();
        renderProducts();
      });
      attributes.forEach((attribute) => {
        setupCombo(`scopeAttribute_${attribute.id}`, (value) => {
          filters.attributes[attribute.id] = value;
          renderProducts();
        });
      });
      setupCombo('scopeCollection', (value) => {
        filters.collectionId = value;
        renderProducts();
      });
      bindRange('scopePriceMin', 'priceMin');
      bindRange('scopePriceMax', 'priceMax');
      bindRange('scopeStockMin', 'stockMin');
      bindRange('scopeStockMax', 'stockMax');
    }

    renderFilters();
    renderProducts();

    function search() {
      keyword = searchInput.value.trim();
      renderProducts();
    }

    searchInput.addEventListener('input', search);
    searchInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') search(); });
    ov.querySelector('#scopeProductSearchBtn').addEventListener('click', search);
    ov.querySelector('#scopeResetFilters').addEventListener('click', () => {
      filters.categoryId = '';
      filters.attributes = {};
      filters.collectionId = '';
      filters.priceMin = '';
      filters.priceMax = '';
      filters.stockMin = '';
      filters.stockMax = '';
      renderFilters();
      renderProducts();
    });
    selectAll.addEventListener('change', () => {
      filteredProducts().forEach((product) => {
        if (selectAll.checked) selected.add(product.id);
        else selected.delete(product.id);
      });
      renderProducts();
    });
    ov.querySelector('#scopeProductClear').addEventListener('click', () => {
      selected.clear();
      renderProducts();
    });
    ov.querySelector('.pf-dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#scopeProductCancel').addEventListener('click', () => ov.remove());
    ov.querySelector('#scopeProductOk').addEventListener('click', () => {
      cb(products.filter((product) => selected.has(product.id)).map((product) => ({
        type: 'product',
        id: product.id,
        name: product.title,
        spu: product.spu || product.id
      })));
      ov.remove();
    });
    ov.addEventListener('click', (event) => { if (event.target === ov) ov.remove(); });
    setTimeout(() => searchInput.focus(), 0);
  }

  /* ====================== 范围选择对话框（系列 / 产品） ====================== */
  GWP.gwpOpenScopeDialog = function (cb, initial, lockedType) {
    if (lockedType === 'product') {
      openProductScopeDialog(cb, initial);
      return;
    }
    const type = lockedType === 'product' ? 'product' : 'collection';
    const itemLabel = type === 'collection' ? '产品系列' : '产品';
    const items = type === 'collection' ? GWP.collections : GWP.products;
    const selected = new Set((initial || []).filter((source) => source.type === type).map((source) => source.id));
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="pf-dialog gwp-scope-dialog">
        <div class="pf-dialog-header">
          <span class="pf-dialog-title">选择${itemLabel}</span>
          <button type="button" class="pf-dialog-close" aria-label="关闭">✕</button>
        </div>
        <div class="pf-dialog-search">
          <input type="text" id="scopeSearch" placeholder="搜索${itemLabel}名称/编号">
          <button type="button" class="btn btn-secondary btn-sm" id="scopeSearchBtn">搜索</button>
        </div>
        <div class="pf-dialog-body">
          <div class="pf-dialog-list" id="scopeList"></div>
        </div>
        <div class="pf-dialog-footer pf-dialog-footer--split">
          <div class="pf-dialog-footer-left">
            <label class="pf-dialog-select-all-check">
              <input type="checkbox" id="scopeSelectAll">
              <span>全选</span>
            </label>
            <span class="pf-dialog-count" id="scopeCount"></span>
            <button type="button" class="pf-link-btn" id="scopeClear">清空</button>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" id="scopeCancel">取消</button>
            <button type="button" class="btn btn-primary" id="scopeOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const searchInput = ov.querySelector('#scopeSearch');
    let keyword = '';

    function filteredItems() {
      if (!keyword) return items;
      const normalized = keyword.toLowerCase();
      return items.filter((item) => {
        const name = type === 'collection' ? item.name : item.title;
        const code = type === 'collection' ? item.id : `${item.spu || ''} ${item.id || ''}`;
        return name.toLowerCase().includes(normalized) || code.toLowerCase().includes(normalized);
      });
    }

    function renderList() {
      const box = ov.querySelector('#scopeList');
      const visibleItems = filteredItems();
      box.innerHTML = visibleItems.length ? visibleItems.map((item) => {
        const name = type === 'collection' ? item.name : item.title;
        const description = type === 'collection'
          ? `${item.id} · ${item.desc || '产品系列'}`
          : `${item.spu || item.id} · ${(item.variants || []).length} 个 SKU`;
        const cover = type === 'collection' ? '▦' : (item.image || '📦');
        return `
          <label class="pf-dialog-item${selected.has(item.id) ? ' selected' : ''}" data-scope-id="${GWP.escapeHtml(item.id)}">
            <input type="checkbox" ${selected.has(item.id) ? 'checked' : ''}>
            <span class="pf-dialog-item-cover">${GWP.escapeHtml(cover)}</span>
            <span class="pf-dialog-item-info">
              <span class="pf-dialog-item-name">${GWP.escapeHtml(name)}</span>
              <span class="pf-dialog-item-desc">${GWP.escapeHtml(description)}</span>
            </span>
          </label>`;
      }).join('') : '<div class="pf-dialog-empty">未找到匹配的内容</div>';
      box.querySelectorAll('[data-scope-id]').forEach((row) => {
        row.addEventListener('change', () => {
          const id = row.dataset.scopeId;
          if (row.querySelector('input').checked) selected.add(id);
          else selected.delete(id);
          renderList();
        });
      });
      const allSelected = visibleItems.length > 0 && visibleItems.every((item) => selected.has(item.id));
      const selectAll = ov.querySelector('#scopeSelectAll');
      selectAll.checked = allSelected;
      selectAll.indeterminate = !allSelected && visibleItems.some((item) => selected.has(item.id));
      ov.querySelector('#scopeCount').textContent = `已选 ${selected.size} 个${itemLabel}`;
    }
    renderList();

    function search() {
      keyword = searchInput.value.trim();
      renderList();
    }

    searchInput.addEventListener('input', search);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') search();
    });
    ov.querySelector('#scopeSearchBtn').addEventListener('click', search);
    ov.querySelector('#scopeSelectAll').addEventListener('change', (event) => {
      filteredItems().forEach((item) => {
        if (event.target.checked) selected.add(item.id);
        else selected.delete(item.id);
      });
      renderList();
    });
    ov.querySelector('#scopeClear').addEventListener('click', () => {
      selected.clear();
      renderList();
    });

    ov.querySelector('.pf-dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#scopeCancel').addEventListener('click', () => ov.remove());
    ov.querySelector('#scopeOk').addEventListener('click', () => {
      const sources = items.filter((item) => selected.has(item.id)).map((item) => ({
        type,
        id: item.id,
        name: type === 'collection' ? item.name : item.title
      }));
      cb(sources);
      ov.remove();
    });
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    setTimeout(() => searchInput.focus(), 0);
  };
  GWP._applyScope = function (c, sources) {
    c._sources = sources;
    const txt = sources.length ? sources.map((s) => s.name).join('、')
      : c.dataset.mode === 'collection' ? '选择产品系列'
        : c.dataset.mode === 'product' ? '选择产品' : '选择范围';
    const btn = c.querySelector('.gwp-combo-btn');
    if (btn) btn.textContent = txt;
  };

  /* ====================== 赠品选择对话框（从赠品池选择） ====================== */
  GWP.gwpOpenGiftDialog = function (cb, multi, initial) {
    if (Array.isArray(cb)) {
      initial = cb;
      cb = multi;
      multi = true;
    }
    if (typeof cb !== 'function') return;
    multi = multi !== false;
    const pool = GWP.pool();
    const initialItems = initial || [];
    const initialQty = {};
    initialItems.forEach((item) => {
      const id = typeof item === 'string' ? item : item && item.id;
      if (id) initialQty[id] = typeof item === 'object' && item.qty ? Number(item.qty) : 1;
    });
    const selected = new Set(initialItems.map((item) => typeof item === 'string' ? item : item && item.id).filter((id) => {
      const gift = pool.find((item) => item.id === id);
      return gift && gift.status === 'active';
    }));
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="pf-dialog gwp-gift-picker-dialog">
        <div class="pf-dialog-header">
          <span class="pf-dialog-title">选择赠品</span>
          <button type="button" class="pf-dialog-close" aria-label="关闭">✕</button>
        </div>
        <div class="pf-dialog-search">
          <input type="text" id="giftPickerSearch" placeholder="搜索赠品名称/编号">
          <button type="button" class="btn btn-secondary btn-sm" id="giftPickerSearchBtn">搜索</button>
        </div>
        <div class="pf-dialog-body gwp-gift-picker-body">
          <table class="gwp-gift-picker-table">
            <thead>
              <tr>
                <th class="gwp-gift-picker-check"></th>
                <th>赠品名称/编号</th>
                <th>关联 SKU 数</th>
                <th>可赠数量</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody id="giftPickerRows"></tbody>
          </table>
          <div class="pf-dialog-empty" id="giftPickerEmpty" style="display:none"></div>
        </div>
        <div class="pf-dialog-footer pf-dialog-footer--split">
          <div class="pf-dialog-footer-left">
            <label class="pf-dialog-select-all-check">
              <input type="checkbox" id="giftPickerSelectAll">
              <span>全选</span>
            </label>
            <span class="pf-dialog-count" id="giftPickerCount"></span>
            <button type="button" class="pf-link-btn" id="giftPickerClear">清空</button>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" id="gCancel">取消</button>
            <button type="button" class="btn btn-primary" id="gOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const rowsEl = ov.querySelector('#giftPickerRows');
    const emptyEl = ov.querySelector('#giftPickerEmpty');
    const searchEl = ov.querySelector('#giftPickerSearch');
    const selectAllEl = ov.querySelector('#giftPickerSelectAll');
    const countEl = ov.querySelector('#giftPickerCount');
    const okEl = ov.querySelector('#gOk');
    let keyword = '';

    function skuCount(gift) {
      return (gift.products || []).reduce((count, product) => count + (product.variants || []).length, 0);
    }
    function availableCount(gift) {
      const stocks = [];
      (gift.products || []).forEach((product) => {
        (product.variants || []).forEach((variant) => stocks.push(Math.max(0, Number(variant.stock) || 0)));
      });
      return stocks.length ? Math.min.apply(null, stocks) : 0;
    }
    function filteredPool() {
      if (!keyword) return pool;
      const normalized = keyword.toLowerCase();
      return pool.filter((gift) =>
        (gift.displayName || '').toLowerCase().includes(normalized)
        || (gift.id || '').toLowerCase().includes(normalized)
      );
    }
    function updateFooter(visibleItems) {
      const selectable = visibleItems.filter((gift) => gift.status === 'active');
      const selectedVisible = selectable.filter((gift) => selected.has(gift.id)).length;
      selectAllEl.checked = selectable.length > 0 && selectedVisible === selectable.length;
      selectAllEl.indeterminate = selectedVisible > 0 && selectedVisible < selectable.length;
      selectAllEl.disabled = !selectable.length;
      countEl.textContent = `已选 ${selected.size} 个赠品`;
      okEl.disabled = selected.size === 0;
    }
    function render() {
      const visibleItems = filteredPool();
      rowsEl.style.display = visibleItems.length ? '' : 'none';
      emptyEl.style.display = visibleItems.length ? 'none' : 'block';
      emptyEl.textContent = pool.length ? '未找到匹配的赠品' : '赠品池为空，请先创建赠品';
      rowsEl.innerHTML = visibleItems.map((gift) => {
        const disabled = gift.status !== 'active';
        const checked = selected.has(gift.id);
        return `
          <tr class="${checked ? 'selected ' : ''}${disabled ? 'disabled' : ''}" data-gift-id="${GWP.escapeHtml(gift.id)}" ${disabled ? 'aria-disabled="true" title="仅启用状态的赠品可以添加"' : ''}>
            <td class="gwp-gift-picker-check"><input type="checkbox" data-gift-check="${GWP.escapeHtml(gift.id)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}></td>
            <td>
              <div class="gwp-gift-picker-name">${GWP.escapeHtml(gift.displayName)}</div>
              <div class="gwp-gift-picker-code">${GWP.escapeHtml(gift.id)}</div>
            </td>
            <td>${skuCount(gift)}</td>
            <td>${availableCount(gift)}</td>
            <td><span class="badge ${GWP.statusClass(gift.status)}">${GWP.statusLabel(gift.status)}</span></td>
          </tr>`;
      }).join('');

      rowsEl.querySelectorAll('[data-gift-id]').forEach((row) => {
        const checkbox = row.querySelector('[data-gift-check]');
        if (checkbox.disabled) return;
        checkbox.addEventListener('change', () => {
          const id = checkbox.dataset.giftCheck;
          if (!multi) selected.clear();
          if (checkbox.checked) selected.add(id);
          else selected.delete(id);
          render();
        });
        row.addEventListener('click', (event) => {
          if (event.target === checkbox) return;
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        });
      });
      updateFooter(visibleItems);
    }
    function search() {
      keyword = searchEl.value.trim();
      render();
    }

    searchEl.addEventListener('input', search);
    searchEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') search();
    });
    ov.querySelector('#giftPickerSearchBtn').addEventListener('click', search);
    selectAllEl.addEventListener('change', () => {
      filteredPool().filter((gift) => gift.status === 'active').forEach((gift) => {
        if (selectAllEl.checked) selected.add(gift.id);
        else selected.delete(gift.id);
      });
      render();
    });
    ov.querySelector('#giftPickerClear').addEventListener('click', () => {
      selected.clear();
      render();
    });

    ov.querySelector('.pf-dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#gCancel').addEventListener('click', () => ov.remove());
    okEl.addEventListener('click', () => {
      const result = pool.filter((gift) => selected.has(gift.id)).map((gift) => ({
        id: gift.id,
        name: gift.displayName,
        displayName: gift.displayName,
        qty: initialQty[gift.id] || 1
      }));
      cb(result);
      ov.remove();
    });
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    render();
    setTimeout(() => searchEl.focus(), 0);
  };
  GWP._applyGift = function (c, gifts) {
    c._gifts = gifts;
    const txt = gifts.length ? gifts.map((g) => g.name).join('、') : '未选择';
    const btn = c.querySelector('.gwp-combo-btn');
    if (btn) btn.textContent = txt;
  };

  /* ====================== 关联产品及SKU 对话框（参考「折扣」产品及SKU选择器） ====================== */
  /* currentBlocks: [{productId, productTitle, image, variants:[{variantId, sku, stock}]}]
     cb(selected): 返回已选商品数组 [{productId, productTitle, image, variantIds:[...]}] */
  GWP.gwpOpenAssocDialog = function (currentBlocks, cb) {
    const sel = {}; // productId -> Set(variantId)
    (currentBlocks || []).forEach((b) => { if (b && b.productId) sel[b.productId] = new Set((b.variants || []).map((v) => v.variantId)); });
    const expanded = new Set();
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="pf-dialog">
        <div class="pf-dialog-header">
          <span class="pf-dialog-title">关联产品及SKU</span>
          <button class="pf-dialog-close" type="button" aria-label="关闭">✕</button>
        </div>
        <div class="pf-dialog-search">
          <input type="text" placeholder="搜索产品名称/编号" id="gwpAssocSearch">
          <button class="btn btn-secondary btn-sm" type="button" id="gwpAssocSearchBtn">搜索</button>
          <div class="pf-scope-tools" style="margin-left:auto">
            <button class="pf-link-btn" type="button" id="gwpAssocExpandAll">展开全部</button>
          </div>
        </div>
        <div class="pf-dialog-body"><div class="pf-dialog-list" id="gwpAssocList"></div></div>
        <div class="pf-dialog-footer pf-dialog-footer--split">
          <div class="pf-dialog-footer-left">
            <label class="pf-dialog-select-all-check">
              <input type="checkbox" id="gwpAssocSelectAll">
              <span>全选</span>
            </label>
            <span class="pf-dialog-count" id="gwpAssocCount">已选 0 个商品 · 0 个SKU</span>
            <span class="pf-link-btn" id="gwpAssocClear">清空</span>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" id="gwpAssocCancel">取消</button>
            <button class="btn btn-primary" id="gwpAssocOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const listEl = ov.querySelector('#gwpAssocList');
    const countEl = ov.querySelector('#gwpAssocCount');
    const selectAllEl = ov.querySelector('#gwpAssocSelectAll');
    const expandAllEl = ov.querySelector('#gwpAssocExpandAll');
    let keyword = '';

    function list() { return GWP.products || []; }
    function filtered() {
      const all = list();
      if (!keyword) return all;
      const k = keyword.toLowerCase();
      return all.filter((p) =>
        (p.title || '').toLowerCase().includes(k)
        || (p.spu || '').toLowerCase().includes(k)
        || (p.id || '').toLowerCase().includes(k)
      );
    }
    function hasSku(pid) { return sel[pid] && sel[pid].size > 0; }
    function updateCount() {
      let pc = 0, sc = 0;
      list().forEach((p) => { if (hasSku(p.id)) { pc++; sc += sel[p.id].size; } });
      countEl.textContent = '已选 ' + pc + ' 个商品 · ' + sc + ' 个SKU';
    }
    function render() {
      const ps = filtered();
      if (!ps.length) {
        listEl.innerHTML = '<div class="pf-dialog-empty">未找到匹配的商品</div>';
        selectAllEl.checked = false;
        selectAllEl.indeterminate = false;
        expandAllEl.textContent = '展开全部';
        updateCount();
        return;
      }
      listEl.innerHTML = ps.map((p) => {
        const on = hasSku(p.id);
        const open = expanded.has(p.id);
        const skus = (p.variants || []).map((v) => {
          const sc = sel[p.id] && sel[p.id].has(v.id);
          return `<div class="pf-dialog-sku-item ${sc ? 'selected' : ''}">
            <input type="checkbox" ${sc ? 'checked' : ''} data-sku-check="${v.id}">
            <span class="sku-label">${GWP.escapeHtml(v.sku)}</span>
            <span class="sku-price">¥${v.price}</span>
            <span class="sku-stock">库存 ${v.stock}</span>
          </div>`;
        }).join('');
        return `<div class="pf-dialog-item ${on ? 'selected' : ''}" data-id="${p.id}">
            <input type="checkbox" ${on ? 'checked' : ''} data-prod-check="${p.id}">
            <div class="pf-dialog-item-cover">${p.image || '📦'}</div>
            <div class="pf-dialog-item-info">
              <div class="pf-dialog-item-name">${GWP.escapeHtml(p.title)}</div>
              <div class="pf-dialog-item-desc">
                <span class="pf-dialog-item-code">${GWP.escapeHtml(p.spu || p.id)}</span>
                <span>· ${(p.variants || []).length} 个 SKU</span>
              </div>
            </div>
            <button class="pf-dialog-item-expand ${open ? 'expanded' : ''}" type="button" data-expand="${p.id}">▾</button>
          </div>
          <div class="pf-dialog-sku-list ${open ? 'open' : ''}" data-sku-list="${p.id}">${skus}</div>`;
      }).join('');
      const selectedCount = ps.filter((p) => hasSku(p.id)).length;
      selectAllEl.checked = selectedCount === ps.length;
      selectAllEl.indeterminate = selectedCount > 0 && selectedCount < ps.length;
      expandAllEl.textContent = ps.every((p) => expanded.has(p.id)) ? '收起全部' : '展开全部';
      bind();
      updateCount();
    }
    function bind() {
      listEl.querySelectorAll('.pf-dialog-item').forEach((item) => {
        const pid = item.dataset.id;
        item.addEventListener('click', (e) => {
          if (e.target.closest('[data-expand]')) return;
          const cb = item.querySelector('input[data-prod-check]');
          if (e.target !== cb) cb.checked = !cb.checked;
          toggleProduct(pid);
        });
        item.querySelector('[data-expand]').addEventListener('click', (e) => {
          e.stopPropagation();
          const sl = listEl.querySelector(`[data-sku-list="${pid}"]`);
          if (sl) sl.classList.toggle('open');
          e.currentTarget.classList.toggle('expanded');
          if (sl && sl.classList.contains('open')) expanded.add(pid); else expanded.delete(pid);
          const visibleProducts = filtered();
          expandAllEl.textContent = visibleProducts.length > 0 && visibleProducts.every((p) => expanded.has(p.id))
            ? '收起全部'
            : '展开全部';
        });
      });
      listEl.querySelectorAll('.pf-dialog-sku-item').forEach((sitem) => {
        const pid = sitem.closest('[data-sku-list]').dataset.skuList;
        const vid = sitem.querySelector('input[data-sku-check]').dataset.skuCheck;
        sitem.addEventListener('click', () => {
          const cb = sitem.querySelector('input[data-sku-check]');
          if (!sel[pid]) sel[pid] = new Set();
          if (cb.checked) sel[pid].add(vid); else sel[pid].delete(vid);
          if (sel[pid].size === 0) delete sel[pid];
          sitem.classList.toggle('selected', cb.checked);
          const pitem = listEl.querySelector(`.pf-dialog-item[data-id="${pid}"]`);
          const pcb = pitem ? pitem.querySelector('input[data-prod-check]') : null;
          if (pcb) pcb.checked = !!sel[pid];
          if (pitem) pitem.classList.toggle('selected', !!sel[pid]);
          const visibleProducts = filtered();
          const selectedCount = visibleProducts.filter((p) => hasSku(p.id)).length;
          selectAllEl.checked = visibleProducts.length > 0 && selectedCount === visibleProducts.length;
          selectAllEl.indeterminate = selectedCount > 0 && selectedCount < visibleProducts.length;
          updateCount();
        });
      });
    }
    function toggleProduct(pid) {
      const p = GWP.getProduct(pid);
      if (!p) return;
      if (sel[pid] && sel[pid].size) delete sel[pid];
      else sel[pid] = new Set((p.variants || []).map((v) => v.id));
      render();
    }
    function confirm() {
      const result = list().filter((p) => hasSku(p.id)).map((p) => ({
        productId: p.id, productTitle: p.title, image: p.image,
        variantIds: Array.from(sel[p.id])
      }));
      cb(result);
      ov.remove();
    }

    ov.querySelector('.pf-dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#gwpAssocCancel').addEventListener('click', () => ov.remove());
    ov.querySelector('#gwpAssocOk').addEventListener('click', confirm);
    ov.querySelector('#gwpAssocSearchBtn').addEventListener('click', () => { keyword = ov.querySelector('#gwpAssocSearch').value.trim(); render(); });
    ov.querySelector('#gwpAssocSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') { keyword = e.target.value.trim(); render(); } });
    selectAllEl.addEventListener('change', () => {
      filtered().forEach((p) => {
        if (selectAllEl.checked) sel[p.id] = new Set((p.variants || []).map((v) => v.id));
        else delete sel[p.id];
      });
      render();
    });
    expandAllEl.addEventListener('click', () => {
      const ps = filtered();
      const allExpanded = ps.length > 0 && ps.every((p) => expanded.has(p.id));
      ps.forEach((p) => {
        if (allExpanded) expanded.delete(p.id);
        else expanded.add(p.id);
      });
      render();
    });
    ov.querySelector('#gwpAssocClear').addEventListener('click', () => { for (const k in sel) delete sel[k]; render(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
    render();
  };

  /* ====================== 商品选择对话框（单选商品，用于表单内 combobox 等） ====================== */
  GWP.gwpOpenProductPicker = function (cb) {
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="dialog" style="width:min(720px,94vw)">
        <div class="dialog-inner">
          <div class="dialog-header">
            <span class="dialog-title">选择商品</span>
            <button class="dialog-close" aria-label="关闭">✕</button>
          </div>
          <div class="dialog-body" style="padding:8px 0">
            <table class="gwp-pick-table"><thead><tr><th style="width:40px"></th><th>商品</th><th>SKU数</th><th>价格</th></tr></thead><tbody>${GWP.products.map((p) =>
              `<tr data-id="${p.id}"><td><span class="checkbox"></span></td><td class="gwp-cell-product"><span class="gwp-thumb">${p.image}</span><div><div>${GWP.escapeHtml(p.title)}</div><div class="gwp-sub">${p.id}</div></div></td><td>${(p.variants || []).length}</td><td>¥${p.price}</td></tr>`
            ).join('')}</tbody></table>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-ghost" id="pCancel">取消</button>
            <button class="btn btn-primary" id="pOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    let picked = null;
    ov.querySelectorAll('.gwp-pick-table tr').forEach((tr) => {
      tr.addEventListener('click', () => {
        ov.querySelectorAll('tr').forEach((t) => { t.classList.remove('selected'); t.querySelector('.checkbox').classList.remove('checked'); });
        picked = GWP.getProduct(tr.dataset.id);
        tr.classList.add('selected'); tr.querySelector('.checkbox').classList.add('checked');
      });
    });
    ov.querySelector('.dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#pCancel').addEventListener('click', () => ov.remove());
    ov.querySelector('#pOk').addEventListener('click', () => { if (picked) { cb(picked); } ov.remove(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  };
  GWP._applyProduct = function (c, p) {
    c._product = p;
    const btn = c.querySelector('.gwp-combo-btn');
    if (btn) btn.textContent = p ? `${p.image} ${p.title}` : '未选择';
  };

  /* ====================== 商品下 SKU 选择对话框（多选变体） ====================== */
  GWP.gwpOpenVariantPicker = function (product, selectedIds, cb) {
    const variants = product.variants || [];
    const sel = (selectedIds || []).slice();
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="dialog" style="width:min(620px,94vw)">
        <div class="dialog-inner">
          <div class="dialog-header">
            <span class="dialog-title">选择 ${GWP.escapeHtml(product.title)} 的SKU</span>
            <button class="dialog-close" aria-label="关闭">✕</button>
          </div>
          <div class="dialog-body" style="padding:8px 0">
            <table class="gwp-pick-table"><thead><tr><th style="width:40px"></th><th>SKU</th><th>库存</th></tr></thead><tbody>${variants.map((v) =>
              `<tr data-id="${v.id}" class="${sel.includes(v.id) ? 'selected' : ''}"><td><span class="checkbox${sel.includes(v.id) ? ' checked' : ''}"></span></td><td>${GWP.escapeHtml(v.sku)}</td><td>${v.stock}</td></tr>`
            ).join('')}</tbody></table>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-ghost" id="vCancel">取消</button>
            <button class="btn btn-primary" id="vOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll('.gwp-pick-table tr').forEach((tr) => {
      tr.addEventListener('click', () => {
        const id = tr.dataset.id;
        const i = sel.indexOf(id);
        if (i >= 0) { sel.splice(i, 1); tr.classList.remove('selected'); tr.querySelector('.checkbox').classList.remove('checked'); }
        else { sel.push(id); tr.classList.add('selected'); tr.querySelector('.checkbox').classList.add('checked'); }
      });
    });
    ov.querySelector('.dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#vCancel').addEventListener('click', () => ov.remove());
    ov.querySelector('#vOk').addEventListener('click', () => { cb(sel.slice()); ov.remove(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  };

  /* ====================== 轻提示 ====================== */
  GWP.toast = function (msg) {
    let t = document.getElementById('gwpToast');
    if (!t) { t = document.createElement('div'); t.id = 'gwpToast'; t.style.cssText = 'position:fixed;left:50%;bottom:40px;transform:translateX(-50%);background:hsl(var(--foreground));color:hsl(var(--background));padding:10px 18px;border-radius:8px;font-size:13px;z-index:10010;box-shadow:0 10px 30px rgba(0,0,0,.25)'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._t); t._t = setTimeout(() => { t.style.display = 'none'; }, 1800);
  };

  /* ====================== 进入表单页（返回列表） ====================== */
  GWP.back = function (tab) {
    if (window.loadAdminPage) window.loadAdminPage('gift', 'gift/gift.html', { tab: tab || 'pool' });
    else if (window.parent && window.parent.loadAdminPage) window.parent.loadAdminPage('gift', 'gift/gift.html', { tab: tab || 'pool' });
    else window.location.href = 'gift.html?tab=' + encodeURIComponent(tab || 'pool');
  };
})();
