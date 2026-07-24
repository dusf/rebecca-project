/* ============================================================
   赠品规则 - 表单逻辑（admin/gift/js/gift_rule_form.js）
   统一规则模型：赠送范围（系列 / 具体产品+SKU）+ 多条赠送条件（或组合）
   + 奖励方式（送赠品[多赠品+任选其一] / 送积分）。
   ============================================================ */
(function () {
  'use strict';
  const GWP = window.GWP;

  const q = new URLSearchParams(location.search);
  const editId = q.get('edit');
  const isEdit = !!editId;

  let conditions = []; // { id, type, value }
  let rewardType = 'gift';
  let gifts = []; // { id, name, qty }
  let pickOne = false;

  const COND_ARG = 'sku_base:SKU购买基数|sku_price:SKU单价|order_amount:订单金额';
  const UNIT = { sku_base: '件', sku_price: '元', order_amount: '元' };

  function init() {
    GWP.gwpCombo(document);
    if (isEdit) {
      const r = GWP.getRule(editId);
      if (r) {
        document.getElementById('formTitle').textContent = '编辑规则';
        document.getElementById('ruleName').value = r.name || '';
        document.getElementById('remark').value = r.remark || '';
        GWP.setComboValue(document.getElementById('status'), r.status || 'active');
        // 范围
        const scopeEl = document.querySelector('.gwp-combo[data-kind="scope"]');
        scopeEl._sources = (r.scope && r.scope.sources) || [];
        const btn = scopeEl.querySelector('.gwp-combo-btn');
        if (btn) btn.textContent = scopeEl._sources.length ? scopeEl._sources.map((s) => s.name).join('、') : '选择赠送范围';
        // 条件
        conditions = (r.conditions || []).map((c) => ({ id: c.id || GWP.newId('c'), type: c.type, value: c.value }));
        // 奖励
        const rw = r.reward || {};
        rewardType = rw.type === 'points' ? 'points' : 'gift';
        gifts = (rw.gifts || []).map((g) => ({ id: g.id, name: g.name, qty: g.qty || 1 }));
        pickOne = !!r.pickOne;
        document.getElementById('pointsInput').value = rw.points || 0;
        document.getElementById('pickOne').classList.toggle('checked', pickOne);
      }
    }
    if (!conditions.length) conditions = [{ id: GWP.newId('c'), type: 'order_amount', value: 0 }];
    setRewardSeg(rewardType);
    renderConditions();
    renderGiftList();
    bind();
  }

  function bind() {
    // 奖励方式切换
    document.querySelectorAll('#rewardSeg button').forEach((b) => b.addEventListener('click', () => setRewardSeg(b.dataset.reward)));
    // 选择赠品
    document.getElementById('pickGift').addEventListener('click', () => {
      GWP.gwpOpenGiftDialog(true, (sel) => {
        // 保留已有赠品的库存设置
        const map = {}; gifts.forEach((g) => (map[g.id] = g.qty));
        gifts = sel.map((s) => ({ id: s.id, name: s.name, qty: map[s.id] || 1 }));
        renderGiftList();
      });
    });
    // pickOne
    document.getElementById('pickOne').addEventListener('click', function () { pickOne = !pickOne; this.classList.toggle('checked', pickOne); });
    // 添加条件
    document.getElementById('addCond').addEventListener('click', () => { conditions.push({ id: GWP.newId('c'), type: 'order_amount', value: 0 }); renderConditions(); });
    // 取消/保存
    document.getElementById('btnCancel').addEventListener('click', () => GWP.back('rule'));
    document.getElementById('btnSave').addEventListener('click', save);
  }

  function setRewardSeg(type) {
    rewardType = type;
    document.querySelectorAll('#rewardSeg button').forEach((b) => b.classList.toggle('active', b.dataset.reward === type));
    document.getElementById('giftReward').style.display = type === 'gift' ? 'block' : 'none';
    document.getElementById('pointsReward').style.display = type === 'points' ? 'block' : 'none';
  }

  function renderConditions() {
    const wrap = document.getElementById('condList');
    wrap.innerHTML = conditions.map((c, i) => `
      <div class="gwp-cond-row" data-ci="${i}">
        <div class="gwp-combo" data-kind="enum" data-arg="${COND_ARG}" data-value="${c.type}"></div>
        <span class="gwp-cond-op">≥</span>
        <input type="number" class="form-input gwp-cond-val" min="0" value="${Number(c.value) || 0}">
        <span class="gwp-cond-unit">${UNIT[c.type]}</span>
        ${conditions.length > 1 ? `<button type="button" class="gwp-link-btn gwp-del" data-del-cond="${i}">删除</button>` : '<span class="gwp-cond-or">或</span>'}
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
    if (!gifts.length) { box.innerHTML = '<div class="gwp-empty gwp-empty-sm">尚未选择赠品</div>'; return; }
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
    const scopeEl = document.querySelector('.gwp-combo[data-kind="scope"]');
    const sources = scopeEl._sources || [];
    if (!sources.length) { GWP.toast('请选择赠送范围'); return; }
    const validCond = conditions.filter((c) => Number(c.value) > 0);
    if (!validCond.length) { GWP.toast('请至少设置一条有效的赠送条件（数值大于0）'); return; }
    if (rewardType === 'gift') {
      if (!gifts.length) { GWP.toast('请选择赠品'); return; }
      if (gifts.some((g) => Number(g.qty) < 1)) { GWP.toast('赠品数量需大于0'); return; }
    } else {
      if (Number(document.getElementById('pointsInput').value) < 1) { GWP.toast('赠送积分需大于0'); return; }
    }

    const mode = sources.every((s) => s.type === 'collection') ? 'collection'
      : sources.every((s) => s.type === 'product') ? 'product_sku' : 'mixed';

    const obj = {
      id: editId || GWP.newId('R'),
      name,
      scope: { mode, sources: sources.map((s) => ({ type: s.type, id: s.id, name: s.name })) },
      conditions: validCond.map((c) => ({ id: c.id, type: c.type, value: Number(c.value) })),
      combine: 'or',
      reward: rewardType === 'gift'
        ? { type: 'gift', gifts: gifts.map((g) => ({ id: g.id, name: g.name, qty: Number(g.qty) })), points: 0 }
        : { type: 'points', gifts: [], points: Number(document.getElementById('pointsInput').value) || 0 },
      pickOne: rewardType === 'gift' ? pickOne : false,
      status: GWP.comboValue(document.getElementById('status')) || 'active',
      remark: document.getElementById('remark').value.trim(),
      createdAt: isEdit ? (GWP.getRule(editId) || {}).createdAt : GWP.today()
    };
    GWP.saveRule(obj);
    GWP.toast('已保存');
    setTimeout(() => GWP.back('rule'), 400);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
