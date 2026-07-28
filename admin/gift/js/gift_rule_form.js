/* ============================================================
   赠品规则 - 表单逻辑（admin/gift/js/gift_rule_form.js）
   统一规则模型：赠送范围（系列 / 产品）+ 多条赠送条件（任意 / 全部）
   + 赠品设置（支持多个赠品）。
   ============================================================ */
(function () {
  'use strict';
  const GWP = window.GWP;

  const q = new URLSearchParams(location.search);
  const editId = q.get('edit');
  const isEdit = !!editId;

  let conditions = []; // { id, type, value }
  let conditionCombine = 'or';
  let scopeSources = []; // { type, id, name }
  let scopeSearchKeyword = '';
  let gifts = []; // { id, name, qty }

  const COND_ARG = 'sku_base:SKU购买基数|sku_price:SKU单价|order_amount:订单金额';
  const UNIT = { sku_base: '件', sku_price: '元', order_amount: '元' };

  function init() {
    GWP.gwpCombo(document);
    const scopeModeEl = document.getElementById('scopeMode');
    let scopeMode = 'collection';
    if (isEdit) {
      const r = GWP.getRule(editId);
      if (r) {
        document.getElementById('formTitle').textContent = '编辑赠品规则';
        document.getElementById('ruleName').value = r.name || '';
        GWP.setComboValue(document.getElementById('status'), r.status || 'active');
        // 范围
        scopeSources = (r.scope && r.scope.sources) || [];
        const rawScopeMode = (r.scope && r.scope.mode) || (scopeSources[0] && scopeSources[0].type) || 'collection';
        scopeMode = rawScopeMode === 'collection' ? 'collection' : 'product';
        // 条件
        conditions = (r.conditions || []).map((c) => ({ id: c.id || GWP.newId('c'), type: c.type, value: c.value }));
        conditionCombine = r.combine === 'and' ? 'and' : 'or';
        // 奖励
        const rw = r.reward || {};
        gifts = (rw.gifts || []).map((g) => ({ id: g.id, name: g.name, qty: g.qty || 1 }));
      }
    }
    GWP.setComboValue(scopeModeEl, scopeMode);
    updateScopeMode(scopeMode, true);
    if (!conditions.length) conditions = [{ id: GWP.newId('c'), type: 'order_amount', value: 0 }];
    setConditionCombine(conditionCombine, false);
    renderConditions();
    renderGiftList();
    bind();
  }

  function updateScopeMode(mode, preserveSources) {
    const helper = document.getElementById('scopeHelper');
    const btn = document.getElementById('scopePickerBtn');
    if (preserveSources) scopeSources = scopeSources.filter((source) => source.type === mode);
    else scopeSources = [];
    scopeSearchKeyword = '';

    if (mode === 'collection') {
      helper.textContent = '可选择多个产品系列，命中任一系列即可参与赠送。';
      btn.childNodes[0].nodeValue = '选择产品系列 ';
    } else if (mode === 'product') {
      helper.textContent = '可选择多个产品，命中任一产品即可参与赠送。';
      btn.childNodes[0].nodeValue = '选择产品 ';
    }
    renderScopeSelection();
  }

  function renderScopeSelection() {
    const count = document.getElementById('scopeSelectedCount');
    const list = document.getElementById('scopeSelectedList');
    const scopeMode = GWP.comboValue(document.getElementById('scopeMode')) || 'collection';
    const itemLabel = scopeMode === 'collection' ? '产品系列' : '产品';
    count.textContent = scopeSources.length ? `（已选 ${scopeSources.length} 个）` : '';
    if (!scopeSources.length) {
      list.innerHTML = '';
      return;
    }

    const cards = scopeSources.map((source, index) => {
      const collection = source.type === 'collection' ? GWP.getCollection(source.id) : null;
      const product = source.type === 'product' ? GWP.getProduct(source.id) : null;
      const meta = collection
        ? `${collection.id} · ${collection.desc || '产品系列'}`
        : product
          ? `${product.spu || product.id} · ${(product.variants || []).length} 个 SKU`
          : source.id;
      const cover = collection ? '▦' : (product && product.image) || '📦';
      return `
        <div class="gwp-scope-selected-item" data-scope-search="${GWP.escapeHtml(`${source.name} ${meta}`.toLowerCase())}">
          <span class="gwp-scope-selected-cover${collection ? ' is-collection' : ''}">${GWP.escapeHtml(cover)}</span>
          <span class="gwp-scope-selected-info">
            <span class="gwp-scope-selected-name">${GWP.escapeHtml(source.name)}</span>
            <span class="gwp-scope-selected-meta">${GWP.escapeHtml(meta)}</span>
          </span>
          <button type="button" class="gwp-scope-selected-remove" data-scope-index="${index}" aria-label="移除${GWP.escapeHtml(source.name)}" title="移除">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>`;
    }).join('');

    list.innerHTML = `
      <div class="gwp-scope-selected-search">
        <input type="text" class="form-input" id="scopeSelectedSearch" value="${GWP.escapeHtml(scopeSearchKeyword)}" placeholder="搜索已选${itemLabel}名称/编号">
      </div>
      <div class="gwp-scope-selected-items">${cards}</div>
      <div class="gwp-scope-selected-empty">未找到匹配的已选${itemLabel}</div>`;

    function applyScopeFilter() {
      const keyword = scopeSearchKeyword.toLowerCase().trim();
      let visibleCount = 0;
      list.querySelectorAll('.gwp-scope-selected-item').forEach((item) => {
        const visible = !keyword || (item.dataset.scopeSearch || '').includes(keyword);
        item.style.display = visible ? '' : 'none';
        if (visible) visibleCount += 1;
      });
      list.querySelector('.gwp-scope-selected-empty').style.display = visibleCount ? 'none' : 'block';
    }

    const search = list.querySelector('#scopeSelectedSearch');
    search.addEventListener('input', () => {
      scopeSearchKeyword = search.value;
      applyScopeFilter();
    });
    applyScopeFilter();

    list.querySelectorAll('[data-scope-index]').forEach((button) => {
      button.addEventListener('click', () => {
        scopeSources.splice(Number(button.dataset.scopeIndex), 1);
        renderScopeSelection();
      });
    });
  }

  function bind() {
    const scopeModeEl = document.getElementById('scopeMode');
    scopeModeEl.addEventListener('gwpcombochange', () => updateScopeMode(GWP.comboValue(scopeModeEl), false));
    document.getElementById('scopePickerBtn').addEventListener('click', () => {
      const scopeMode = GWP.comboValue(scopeModeEl) || 'collection';
      GWP.gwpOpenScopeDialog((sources) => {
        scopeSources = sources;
        scopeSearchKeyword = '';
        renderScopeSelection();
      }, scopeSources, scopeMode);
    });
    document.querySelectorAll('#conditionCombineSeg button').forEach((button) => {
      button.addEventListener('click', () => setConditionCombine(button.dataset.combine, true));
    });
    // 选择赠品
    document.getElementById('pickGift').addEventListener('click', () => {
      GWP.gwpOpenGiftDialog((sel) => {
        // 保留已有赠品的库存设置
        const map = {}; gifts.forEach((g) => (map[g.id] = g.qty));
        gifts = sel.map((s) => ({ id: s.id, name: s.name, qty: map[s.id] || 1 }));
        renderGiftList();
      }, true, gifts);
    });
    // 添加条件
    document.getElementById('addCond').addEventListener('click', () => { conditions.push({ id: GWP.newId('c'), type: 'order_amount', value: 0 }); renderConditions(); });
    // 返回/保存
    document.getElementById('btnCancel').addEventListener('click', () => GWP.back('rule'));
    document.getElementById('btnSave').addEventListener('click', save);
  }

  function setConditionCombine(mode, shouldRender) {
    conditionCombine = mode === 'and' ? 'and' : 'or';
    document.querySelectorAll('#conditionCombineSeg button').forEach((button) => {
      button.classList.toggle('active', button.dataset.combine === conditionCombine);
    });
    document.getElementById('conditionCombineDesc').textContent = conditionCombine === 'and'
      ? '需要同时满足全部条件，多个条件之间为“且”关系'
      : '满足以下任一条件即可，多个条件之间为“或”关系';
    if (shouldRender) renderConditions();
  }

  function renderConditions() {
    const wrap = document.getElementById('condList');
    wrap.innerHTML = conditions.map((c, i) => `
      ${i > 0 ? `<div class="gwp-cond-divider"><span>${conditionCombine === 'and' ? '且' : '或'}</span></div>` : ''}
      <div class="gwp-cond-row" data-ci="${i}">
        <span class="gwp-cond-index">条件 ${i + 1}</span>
        <div class="gwp-combo" data-kind="enum" data-arg="${COND_ARG}" data-value="${c.type}"></div>
        <span class="gwp-cond-op">≥</span>
        <input type="number" class="form-input gwp-cond-val" min="0" value="${Number(c.value) || 0}">
        <span class="gwp-cond-unit">${UNIT[c.type]}</span>
        ${conditions.length > 1 ? `<button type="button" class="gwp-link-btn gwp-del" data-del-cond="${i}">删除</button>` : ''}
      </div>`).join('');

    wrap.querySelectorAll('.gwp-cond-row').forEach((row) => {
      const i = +row.dataset.ci;
      const combo = row.querySelector('.gwp-combo');
      GWP.gwpComboBuild(combo);
      combo.addEventListener('gwpcombochange', () => {
        conditions[i].type = GWP.comboValue(combo);
        row.querySelector('.gwp-cond-unit').textContent = UNIT[conditions[i].type];
      });
      row.querySelector('.gwp-cond-val').addEventListener('input', (e) => { conditions[i].value = Math.max(0, Number(e.target.value) || 0); });
      const del = row.querySelector('[data-del-cond]');
      if (del) del.addEventListener('click', () => { conditions.splice(+del.dataset.delCond, 1); renderConditions(); });
    });
  }

  function renderGiftList() {
    const box = document.getElementById('giftList');
    if (!gifts.length) {
      box.classList.add('is-empty');
      box.innerHTML = `
        <div class="gwp-reward-empty">
          <span class="gwp-reward-empty-title">暂未添加赠品</span>
          <span class="gwp-reward-empty-desc">点击“添加赠品”从赠品池中选择</span>
        </div>`;
      return;
    }
    box.classList.remove('is-empty');
    box.innerHTML = gifts.map((g, i) => `
      <div class="gwp-gift-row" data-gi="${i}">
        <span class="gwp-thumb">🎁</span>
        <span class="gwp-gift-name">${GWP.escapeHtml(g.name)}</span>
        <span class="gwp-inline" style="gap:6px">
          <label class="gwp-muted">数量</label>
          <input type="number" min="1" class="form-input gwp-gift-qty" value="${g.qty}" data-gi="${i}" style="max-width:90px">
        </span>
        <button type="button" class="gwp-link-btn gwp-del" data-del-gift="${i}">移除</button>
      </div>`).join('');
    box.querySelectorAll('.gwp-gift-qty').forEach((inp) => inp.addEventListener('input', () => { gifts[+inp.dataset.gi].qty = Math.max(1, Number(inp.value) || 1); }));
    box.querySelectorAll('[data-del-gift]').forEach((b) => b.addEventListener('click', () => { gifts.splice(+b.dataset.delGift, 1); renderGiftList(); }));
  }

  function save() {
    const name = document.getElementById('ruleName').value.trim();
    if (!name) { GWP.toast('请填写规则名称'); return; }
    const scopeMode = GWP.comboValue(document.getElementById('scopeMode'));
    if (!scopeMode) { GWP.toast('请选择适用范围'); return; }
    if (!scopeSources.length) { GWP.toast(scopeMode === 'collection' ? '请选择产品系列' : '请选择产品'); return; }
    const validCond = conditions.filter((c) => Number(c.value) > 0);
    if (!validCond.length) { GWP.toast('请至少设置一条有效的赠送条件（数值大于0）'); return; }
    if (!gifts.length) { GWP.toast('请选择赠品'); return; }
    if (gifts.some((g) => Number(g.qty) < 1)) { GWP.toast('赠品数量需大于0'); return; }

    const obj = {
      id: editId || GWP.newId('R'),
      name,
      scope: { mode: scopeMode, sources: scopeSources.map((s) => ({ type: s.type, id: s.id, name: s.name })) },
      conditions: validCond.map((c) => ({ id: c.id, type: c.type, value: Number(c.value) })),
      combine: conditionCombine,
      reward: { type: 'gift', gifts: gifts.map((g) => ({ id: g.id, name: g.name, qty: Number(g.qty) })), points: 0 },
      status: GWP.comboValue(document.getElementById('status')) || 'active',
      createdAt: isEdit ? (GWP.getRule(editId) || {}).createdAt : GWP.today()
    };
    GWP.saveRule(obj);
    GWP.toast('已保存');
    setTimeout(() => GWP.back('rule'), 400);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
