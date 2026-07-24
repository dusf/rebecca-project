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
    { id: '1', title: '女士真人发全头套', image: '👩', baseCount: 42, stock: 260, price: 1299,
      variants: [
        { id: 'V101', sku: 'SKU-全头套-自然黑-中长', stock: 90, price: 1299 },
        { id: 'V102', sku: 'SKU-全头套-栗棕-中长', stock: 80, price: 1299 },
        { id: 'V103', sku: 'SKU-全头套-自然黑-长发', stock: 90, price: 1399 }
      ] },
    { id: '2', title: '蕾丝前额假发', image: '💇‍♀️', baseCount: 36, stock: 180, price: 1599,
      variants: [
        { id: 'V201', sku: 'SKU-蕾丝假发-自然黑-16寸', stock: 90, price: 1599 },
        { id: 'V202', sku: 'SKU-蕾丝假发-深棕-18寸', stock: 90, price: 1699 }
      ] },
    { id: '3', title: '女士接发片', image: '💁‍♀️', baseCount: 58, stock: 320, price: 499,
      variants: [
        { id: 'V301', sku: 'SKU-接发片-自然黑-20寸', stock: 160, price: 499 },
        { id: 'V302', sku: 'SKU-接发片-亚麻棕-20寸', stock: 160, price: 529 }
      ] },
    { id: '4', title: '假发专用钢丝梳', image: '🪮', baseCount: 210, stock: 980, price: 39,
      variants: [
        { id: 'V401', sku: 'SKU-钢丝梳-经典款', stock: 980, price: 39 }
      ] },
    { id: '5', title: '免洗柔顺护理喷雾', image: '🧴', baseCount: 160, stock: 720, price: 69,
      variants: [
        { id: 'V501', sku: 'SKU-护理喷雾-玫瑰香-100ml', stock: 360, price: 69 },
        { id: 'V502', sku: 'SKU-护理喷雾-无香型-100ml', stock: 360, price: 69 }
      ] },
    { id: '6', title: '隐形防滑发网', image: '🧢', baseCount: 300, stock: 1500, price: 29,
      variants: [
        { id: 'V601', sku: 'SKU-发网-黑色5只装', stock: 800, price: 29 },
        { id: 'V602', sku: 'SKU-发网-肤色5只装', stock: 700, price: 29 }
      ] },
    { id: '7', title: '折叠假发支架', image: '🗄️', baseCount: 120, stock: 540, price: 59,
      variants: [
        { id: 'V701', sku: 'SKU-支架-折叠款-黑', stock: 540, price: 59 }
      ] },
    { id: '8', title: '蕾丝专用假发胶', image: '🧪', baseCount: 140, stock: 620, price: 89,
      variants: [
        { id: 'V801', sku: 'SKU-假发胶-防水型-30ml', stock: 620, price: 89 }
      ] },
    { id: '9', title: '假发收纳防尘盒', image: '📦', baseCount: 100, stock: 460, price: 79,
      variants: [
        { id: 'V901', sku: 'SKU-收纳盒-便携款', stock: 460, price: 79 }
      ] },
    { id: '10', title: '假发洗护发套装', image: '🧼', baseCount: 90, stock: 380, price: 129,
      variants: [
        { id: 'V1001', sku: 'SKU-洗护套装-滋养修护型', stock: 380, price: 129 }
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

  /* ====================== 存储 ====================== */
  const LS_POOL = 'gwp_pool_v3';
  const LS_RULE = 'gwp_rule_v3';

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
        name: '全店满599元送假发新手护理套装',
        scope: { mode: 'collection', sources: [{ type: 'collection', id: 'C4', name: '全店' }] },
        conditions: [{ id: 'c1', type: 'order_amount', value: 599 }],
        combine: 'or',
        reward: { type: 'gift', gifts: [{ id: 'P001', name: '假发新手护理套装', qty: 1 }], points: 0 },
        pickOne: false,
        status: 'active',
        createdAt: '2026-07-20 11:00'
      },
      {
        id: 'R002',
        name: '蕾丝前额假发买1件送固定套装',
        scope: { mode: 'product_sku', sources: [{ type: 'product', id: '2', name: '蕾丝前额假发' }] },
        conditions: [{ id: 'c1', type: 'sku_base', value: 1 }],
        combine: 'or',
        reward: { type: 'gift', gifts: [{ id: 'P002', name: '蕾丝假发固定套装', qty: 1 }], points: 0 },
        pickOne: false,
        status: 'active',
        createdAt: '2026-07-19 16:40'
      },
      {
        id: 'R003',
        name: '全头套系列满899送护理或收纳套装（任选其一）',
        scope: { mode: 'collection', sources: [{ type: 'collection', id: 'C1', name: '全头套系列' }] },
        conditions: [
          { id: 'c1', type: 'order_amount', value: 899 },
          { id: 'c2', type: 'sku_price', value: 1299 }
        ],
        combine: 'or',
        reward: {
          type: 'gift',
          gifts: [
            { id: 'P001', name: '假发新手护理套装', qty: 1 },
            { id: 'P003', name: '假发收纳保养套装', qty: 1 }
          ],
          points: 0
        },
        pickOne: true,
        status: 'active',
        createdAt: '2026-07-18 10:20'
      },
      {
        id: 'R004',
        name: '会员全店满2000送1000积分',
        scope: { mode: 'collection', sources: [{ type: 'collection', id: 'C4', name: '全店' }] },
        conditions: [{ id: 'c1', type: 'order_amount', value: 2000 }],
        combine: 'or',
        reward: { type: 'points', gifts: [], points: 1000 },
        pickOne: false,
        status: 'draft',
        createdAt: '2026-07-17 09:30'
      }
    ];
  }

  /* ====================== 数据访问（含 localStorage 持久化） ====================== */
  GWP.pool = function () { return gwpLoad(LS_POOL, defaultPool()); };
  GWP.rules = function () { return gwpLoad(LS_RULE, defaultRules()); };
  GWP.savePool = function (obj) {
    const list = GWP.pool();
    const i = list.findIndex((x) => x.id === obj.id);
    if (i >= 0) list[i] = obj; else list.push(obj);
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
    if (i >= 0) list[i] = obj; else list.push(obj);
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
    copy.displayName = p.displayName + ' 副本';
    copy.status = 'draft';
    copy.createdAt = GWP.today();
    return GWP.savePool(copy);
  };
  GWP.duplicateRule = function (id) {
    const r = GWP.getRule(id); if (!r) return null;
    const copy = JSON.parse(JSON.stringify(r));
    copy.id = GWP.newId('R');
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
    sku_price: 'SKU单价 ≥',
    order_amount: '订单金额 ≥'
  }[t] || t);
  GWP.condTypeUnit = (t) => ({ sku_base: '件', sku_price: '元', order_amount: '元' }[t] || '');
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
        if (kind === 'scope') GWP.gwpOpenScopeDialog((sources) => { GWP._applyScope(c, sources); });
        else if (kind === 'gift') GWP.gwpOpenGiftDialog((g) => { GWP._applyGift(c, g); });
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

  /* ====================== 范围选择对话框（系列 / 具体产品+SKU） ====================== */
  GWP.gwpOpenScopeDialog = function (cb, initial) {
    const cur = initial || [];
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="dialog" style="width:min(760px,94vw)">
        <div class="dialog-inner">
          <div class="dialog-header">
            <span class="dialog-title">选择赠送范围</span>
            <button class="dialog-close" aria-label="关闭">✕</button>
          </div>
          <div class="dialog-body" style="padding:16px 0">
            <div class="gwp-hint">可指定「产品系列」或「具体产品及SKU」。两者可混合添加，命中范围取并集。</div>
            <div class="gwp-form" style="grid-template-columns:1fr">
              <div class="form-group full">
                <label class="form-label">添加范围</label>
                <div class="gwp-inline">
                  <div class="gwp-combo" data-kind="enum" data-arg="collection:产品系列|product:具体产品及SKU" data-value="" data-placeholder="选择范围类型" style="min-width:200px" id="scopeType"></div>
                  <div class="gwp-combo" data-kind="enum" data-arg="" data-value="" data-placeholder="选择具体项" style="min-width:240px;display:none" id="scopeItem"></div>
                  <button class="btn btn-primary btn-sm" id="scopeAdd">添加</button>
                </div>
              </div>
            </div>
            <div class="gwp-section">已选范围</div>
            <div class="gwp-source-list" id="scopeList"></div>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-ghost" id="scopeCancel">取消</button>
            <button class="btn btn-primary" id="scopeOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    GWP.gwpCombo(ov);

    function renderList() {
      const box = ov.querySelector('#scopeList');
      if (!cur.length) { box.innerHTML = '<span class="gwp-muted">尚未选择范围</span>'; return; }
      box.innerHTML = cur.map((s, i) =>
        `<span class="gwp-source-chip">${s.type === 'collection' ? '<span class="gwp-source-tag">系列</span>' : '<span class="gwp-source-tag">商品</span>'}${GWP.escapeHtml(s.name)}<span class="gwp-source-x" data-i="${i}">✕</span></span>`
      ).join('');
      box.querySelectorAll('.gwp-source-x').forEach((x) => x.addEventListener('click', () => { cur.splice(+x.dataset.i, 1); renderList(); }));
    }
    renderList();

    const typeEl = ov.querySelector('#scopeType');
    const itemEl = ov.querySelector('#scopeItem');
    typeEl.addEventListener('gwpcombochange', () => {
      const t = GWP.comboValue(typeEl);
      const arg = t === 'collection' ? GWP.collections.map((c) => `${c.id}:${c.name}`).join('|')
        : t === 'product' ? GWP.products.map((p) => `${p.id}:${p.title}`).join('|') : '';
      itemEl.dataset.arg = arg;
      itemEl.style.display = arg ? 'inline-block' : 'none';
      itemEl.dataset.value = '';
      const inp = itemEl.querySelector('.gwp-combo-input'); if (inp) inp.value = '';
      GWP.gwpComboBuild(itemEl);
    });

    ov.querySelector('#scopeAdd').addEventListener('click', () => {
      const t = GWP.comboValue(typeEl);
      const v = GWP.comboValue(itemEl);
      if (!t || !v) return;
      if (cur.some((s) => s.type === t && s.id === v)) { GWP.toast && GWP.toast('该项已添加'); return; }
      const name = (t === 'collection' ? GWP.getCollection(v) : GWP.getProduct(v))?.title || (t === 'collection' ? GWP.getCollection(v)?.name : v);
      cur.push({ type: t, id: v, name });
      GWP.setComboValue(itemEl, '');
      renderList();
    });

    ov.querySelector('.dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#scopeCancel').addEventListener('click', () => ov.remove());
    ov.querySelector('#scopeOk').addEventListener('click', () => { cb(cur.slice()); ov.remove(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  };
  GWP._applyScope = function (c, sources) {
    c._sources = sources;
    const txt = sources.length ? sources.map((s) => s.name).join('、') : '未选择';
    const btn = c.querySelector('.gwp-combo-btn');
    if (btn) btn.textContent = txt;
  };

  /* ====================== 赠品选择对话框（从赠品池选择 + 数量） ====================== */
  GWP.gwpOpenGiftDialog = function (cb, multi) {
    const pool = GWP.pool();
    const ov = document.createElement('div');
    ov.className = 'dialog-overlay';
    ov.innerHTML = `
      <div class="dialog" style="width:min(720px,94vw)">
        <div class="dialog-inner">
          <div class="dialog-header">
            <span class="dialog-title">选择赠品</span>
            <button class="dialog-close" aria-label="关闭">✕</button>
          </div>
          <div class="dialog-body" style="padding:8px 0">
            ${pool.length ? `<table class="gwp-pick-table"><thead><tr><th style="width:40px"></th><th>赠品名称</th><th>关联SKU数</th><th>状态</th></tr></thead><tbody>${pool.map((p) =>
              `<tr data-id="${p.id}"><td><span class="checkbox"></span></td><td>${GWP.escapeHtml(p.displayName)}</td><td>${(p.products || []).reduce((a, b) => a + (b.variants || []).length, 0)}</td><td><span class="badge ${GWP.statusClass(p.status)}">${GWP.statusLabel(p.status)}</span></td></tr>`
            ).join('')}</tbody></table>` : '<div class="gwp-empty">赠品池为空，请先创建赠品</div>'}
          </div>
          <div class="dialog-actions">
            <button class="btn btn-ghost" id="gCancel">取消</button>
            <button class="btn btn-primary" id="gOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const selected = [];
    ov.querySelectorAll('.gwp-pick-table tr').forEach((tr) => {
      tr.addEventListener('click', () => {
        const id = tr.dataset.id;
        const p = pool.find((x) => x.id === id);
        if (multi) {
          const i = selected.findIndex((s) => s.id === id);
          if (i >= 0) { selected.splice(i, 1); tr.classList.remove('selected'); tr.querySelector('.checkbox').classList.remove('checked'); }
          else { selected.push({ id, name: p.displayName, qty: 1 }); tr.classList.add('selected'); tr.querySelector('.checkbox').classList.add('checked'); }
        } else {
          ov.querySelectorAll('tr').forEach((t) => { t.classList.remove('selected'); t.querySelector('.checkbox').classList.remove('checked'); });
          selected.length = 0; selected.push({ id, name: p.displayName, qty: 1 });
          tr.classList.add('selected'); tr.querySelector('.checkbox').classList.add('checked');
        }
      });
    });
    ov.querySelector('.dialog-close').addEventListener('click', () => ov.remove());
    ov.querySelector('#gCancel').addEventListener('click', () => ov.remove());
    ov.querySelector('#gOk').addEventListener('click', () => { cb(selected.slice()); ov.remove(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
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
          <input type="text" placeholder="搜索商品名称 / 编号" id="gwpAssocSearch">
          <button class="btn btn-secondary btn-sm" type="button" id="gwpAssocSearchBtn">搜索</button>
          <div class="pf-scope-tools" style="margin-left:auto">
            <span class="pf-dialog-select-all" id="gwpAssocSelectAll">全选</span>
          </div>
        </div>
        <div class="pf-dialog-body"><div class="pf-dialog-list" id="gwpAssocList"></div></div>
        <div class="pf-dialog-footer pf-dialog-footer--split">
          <div class="pf-dialog-footer-left">
            <span class="pf-dialog-count" id="gwpAssocCount">已选 0 个商品 · 0 个SKU</span>
            <span class="pf-link-btn" id="gwpAssocClear">清空</span>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-ghost" id="gwpAssocCancel">取消</button>
            <button class="btn btn-primary" id="gwpAssocOk">确定</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const listEl = ov.querySelector('#gwpAssocList');
    const countEl = ov.querySelector('#gwpAssocCount');
    let keyword = '';

    function list() { return GWP.products || []; }
    function filtered() {
      const all = list();
      if (!keyword) return all;
      const k = keyword.toLowerCase();
      return all.filter((p) => (p.title || '').toLowerCase().includes(k) || (p.id || '').toLowerCase().includes(k));
    }
    function hasSku(pid) { return sel[pid] && sel[pid].size > 0; }
    function updateCount() {
      let pc = 0, sc = 0;
      list().forEach((p) => { if (hasSku(p.id)) { pc++; sc += sel[p.id].size; } });
      countEl.textContent = '已选 ' + pc + ' 个商品 · ' + sc + ' 个SKU';
    }
    function render() {
      const ps = filtered();
      if (!ps.length) { listEl.innerHTML = '<div class="pf-dialog-empty">未找到匹配的商品</div>'; updateCount(); return; }
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
              <div class="pf-dialog-item-desc">${p.id} · ${(p.variants || []).length} 个SKU</div>
            </div>
            <button class="pf-dialog-item-expand ${open ? 'expanded' : ''}" type="button" data-expand="${p.id}">▾</button>
          </div>
          <div class="pf-dialog-sku-list ${open ? 'open' : ''}" data-sku-list="${p.id}">${skus}</div>`;
      }).join('');
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
    ov.querySelector('#gwpAssocSelectAll').addEventListener('click', () => {
      const allOn = filtered().every((p) => hasSku(p.id));
      filtered().forEach((p) => { if (allOn) delete sel[p.id]; else sel[p.id] = new Set((p.variants || []).map((v) => v.id)); });
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
    if (window.loadAdminPage) window.loadAdminPage('gift', 'gift.html', { tab: tab || 'pool' });
    else if (window.parent && window.parent.loadAdminPage) window.parent.loadAdminPage('gift', 'gift.html', { tab: tab || 'pool' });
    else window.history.back();
  };
})();
