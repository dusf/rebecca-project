/* 指定SKU买赠 添加/编辑 逻辑 */
(function () {
  'use strict';
  var G = window.GWP;
  var esc = G.escapeHtml;
  var uid = G.uid;

  var form = {
    status: 'active',
    rewardMethod: 'select',
    eligibility: 'all',
    mode: 'both',
    sources: [],   // {type:'collection'|'product'|'product_sku', id, name}
    tiers: []
  };

  function newTier() {
    return { id: uid(), thresholdQuantity: 3, giftCount: 1, min: 1, max: 1, gifts: [] };
  }

  function renderStatus() {
    var box = document.getElementById('statusBox');
    box.innerHTML = [{ v: 'active', l: '启用' }, { v: 'disabled', l: '禁用' }].map(function (o) {
      return '<label class="gwp-opt' + (form.status === o.v ? ' active' : '') + '" style="margin:0;flex:0 0 auto;width:120px;"><span class="gwp-opt-radio"></span><span class="gwp-opt-body"><span class="gwp-opt-title">' + o.l + '</span></span><input type="radio" name="sstatus" style="display:none" data-v="' + o.v + '" ' + (form.status === o.v ? 'checked' : '') + '></label>';
    }).join('');
    box.querySelectorAll('input').forEach(function (rb) {
      rb.addEventListener('change', function () { form.status = rb.dataset.v; renderStatus(); });
    });
  }

  function renderReward() {
    var box = document.getElementById('rewardBox');
    box.innerHTML = [{ v: 'select', t: '买家自选（推荐）', d: '达到门槛后，买家从赠品列表选 N 件' }, { v: 'auto_add', t: '自动加入购物车', d: '达到门槛后，按赠品顺序自动加入 N 件' }].map(function (o) {
      return '<label class="gwp-opt' + (form.rewardMethod === o.v ? ' active' : '') + '"><span class="gwp-opt-radio"></span><span class="gwp-opt-body"><span class="gwp-opt-title">' + o.t + '</span><span class="gwp-opt-desc">' + o.d + '</span></span><input type="radio" name="sreward" style="display:none" data-v="' + o.v + '" ' + (form.rewardMethod === o.v ? 'checked' : '') + '></label>';
    }).join('');
    box.querySelectorAll('input').forEach(function (rb) {
      rb.addEventListener('change', function () { form.rewardMethod = rb.dataset.v; renderReward(); });
    });
  }

  function renderEligibility() {
    var box = document.getElementById('eligibilityBox');
    box.innerHTML = [{ v: 'all', t: '所有客户', d: '' }, { v: 'new_customer', t: '仅新客户（首次下单）', d: '' }, { v: 'vip', t: '仅 VIP（指定客户标签）', d: '' }, { v: 'segment', t: '客户细分', d: '' }].map(function (o) {
      return '<label class="gwp-opt' + (form.eligibility === o.v ? ' active' : '') + '" style="max-width:360px;"><span class="gwp-opt-radio"></span><span class="gwp-opt-body"><span class="gwp-opt-title">' + o.t + '</span>' + (o.d ? '<span class="gwp-opt-desc">' + o.d + '</span>' : '') + '</span><input type="radio" name="selig" style="display:none" data-v="' + o.v + '" ' + (form.eligibility === o.v ? 'checked' : '') + '></label>';
    }).join('');
    box.querySelectorAll('input').forEach(function (rb) {
      rb.addEventListener('change', function () { form.eligibility = rb.dataset.v; renderEligibility(); });
    });
  }

  function renderSources() {
    var coll = form.sources.filter(function (s) { return s.type === 'collection'; });
    var prod = form.sources.filter(function (s) { return s.type === 'product' || s.type === 'product_sku'; });
    document.getElementById('collectionList').innerHTML = coll.map(function (s) {
      return '<span class="gwp-source-chip"><span class="gwp-source-tag">系列</span>' + esc(s.name) + '<span class="gwp-source-x" data-id="' + s.id + '" data-type="' + s.type + '">✕</span></span>';
    }).join('') || '<span class="gwp-muted">未添加</span>';
    document.getElementById('productList').innerHTML = prod.map(function (s) {
      return '<span class="gwp-source-chip"><span class="gwp-source-tag">产品</span>' + esc(s.name) + '<span class="gwp-source-x" data-id="' + s.id + '" data-type="' + s.type + '">✕</span></span>';
    }).join('') || '<span class="gwp-muted">未添加</span>';
    document.querySelectorAll('#collectionList .gwp-source-x, #productList .gwp-source-x').forEach(function (x) {
      x.addEventListener('click', function () {
        form.sources = form.sources.filter(function (s) { return !(s.id === x.dataset.id && s.type === x.dataset.type); });
        renderSources();
      });
    });
  }

  function renderTiers() {
    var list = document.getElementById('tierList');
    list.innerHTML = '';
    form.tiers.forEach(function (t, idx) {
      var card = document.createElement('div');
      card.className = 'gwp-tier';
      var giftsHtml = t.gifts.length ? t.gifts.map(function (g) { return '<span class="gwp-gift-chip">' + esc(g.displayName || g.name) + '</span>'; }).join('') : '<span class="gwp-muted">未选择赠品</span>';
      card.innerHTML =
        '<div class="gwp-tier-head"><span class="gwp-tier-title">档位 ' + (idx + 1) + '</span>' +
        (form.tiers.length > 1 ? '<button class="gwp-link-btn" data-del="' + t.id + '">删除档位</button>' : '') + '</div>' +
        '<div class="gwp-tier-body">' +
          '<div class="form-group"><label class="form-label">SKU购买基数阈值</label><div class="gwp-inline"><span class="gwp-muted">≥</span><input class="form-input" type="number" value="' + t.thresholdQuantity + '" data-f="thresholdQuantity" style="max-width:140px;"><span class="gwp-muted">件（与购买数量无关）</span></div></div>' +
          '<div class="form-group"><label class="form-label">赠送件数</label><input class="form-input" type="number" value="' + t.giftCount + '" data-f="giftCount" style="max-width:140px;"></div>' +
          '<div class="form-group"><label class="form-label">可选范围（件）</label><div class="gwp-inline"><input class="form-input" type="number" value="' + t.min + '" data-f="min" style="max-width:70px;"><span class="gwp-muted">~</span><input class="form-input" type="number" value="' + t.max + '" data-f="max" style="max-width:70px;"></div></div>' +
        '</div>' +
        '<div class="gwp-tier-foot"><span class="gwp-muted">赠品：</span><div class="gwp-gift-chips">' + giftsHtml + '</div>' +
          '<button class="gwp-link-btn" data-gift="' + t.id + '">+ 管理赠品</button></div>';
      list.appendChild(card);
      card.querySelectorAll('input[data-f]').forEach(function (inp) {
        inp.addEventListener('input', function () { t[inp.dataset.f] = Number(inp.value); });
      });
      var del = card.querySelector('[data-del]');
      if (del) del.addEventListener('click', function () { form.tiers = form.tiers.filter(function (x) { return x.id !== t.id; }); renderTiers(); });
      card.querySelector('[data-gift]').addEventListener('click', function () {
        G.gwpOpenGiftDialog(t.gifts.map(function (g) { return g.id; }), function (picks) {
          t.gifts = picks.map(function (g) { return { id: g.id, name: g.displayName, displayName: g.displayName }; });
          renderTiers();
        });
      });
    });
  }

  function addSources(type, preset) {
    var existing = form.sources;
    G.gwpOpenScopeDialog(preset || existing, function (selected) {
      // 按当前添加方式过滤：collection 模式只收系列，product 模式只收产品
      var filtered = selected.filter(function (s) {
        if (type === 'collection') return s.type === 'collection';
        if (type === 'product') return s.type === 'product' || s.type === 'product_sku';
        return true;
      });
      form.sources = filtered;
      renderSources();
    });
  }

  function init() {
    var editId = sessionStorage.getItem('giftSkuEditId');
    if (editId) {
      var r = G.SKU_RULES.filter(function (x) { return x.id === editId; })[0];
      if (r) {
        document.getElementById('formTitle').textContent = '编辑指定SKU买赠';
        document.getElementById('ruleName').value = r.name;
        form.status = r.status; form.rewardMethod = r.rewardMethod; form.eligibility = r.eligibility;
        form.mode = r.sourceMode || 'both';
        form.sources = r.sources.map(function (s) { return { type: s.type, id: s.id, name: s.name }; });
        form.tiers = r.tiers.map(function (t) { return { id: uid(), thresholdQuantity: t.thresholdQuantity, giftCount: t.giftCount, min: t.min, max: t.max, gifts: G.GIFT_POOL.slice(0, t.giftCount).map(function (g) { return { id: g.id, name: g.displayName, displayName: g.displayName }; }) }; });
        document.getElementById('startDate').value = r.startsAt;
        document.getElementById('endDate').value = r.endsAt;
        document.getElementById('maxGifts').value = r.maxGiftsPerOrder || 3;
        document.getElementById('remark').value = r.remark || '';
        syncSeg();
      }
      sessionStorage.removeItem('giftSkuEditId');
    } else {
      form.tiers = [newTier()];
    }

    renderStatus(); renderReward(); renderEligibility(); renderSources(); renderTiers();

    function syncSeg() {
      document.querySelectorAll('#modeSeg .gwp-seg-item').forEach(function (it) { it.classList.toggle('active', it.dataset.mode === form.mode); });
      document.getElementById('addCollection').style.display = (form.mode === 'collection' || form.mode === 'both') ? '' : 'none';
      document.getElementById('addProduct').style.display = (form.mode === 'product' || form.mode === 'both') ? '' : 'none';
    }
    document.querySelectorAll('#modeSeg .gwp-seg-item').forEach(function (it) {
      it.addEventListener('click', function () { form.mode = it.dataset.mode; syncSeg(); });
    });
    syncSeg();

    document.getElementById('addCollection').addEventListener('click', function () { addSources('collection'); });
    document.getElementById('addProduct').addEventListener('click', function () { addSources('product'); });

    document.getElementById('addTier').addEventListener('click', function () { form.tiers.push(newTier()); renderTiers(); });

    document.getElementById('saveBtn').addEventListener('click', function () { save('active'); });
    document.getElementById('saveDraft').addEventListener('click', function () { save('draft'); });
  }

  function save(status) {
    var name = document.getElementById('ruleName').value.trim();
    if (!name) { G.toast('error', '请填写规则名称'); return; }
    if (!form.sources.length) { G.toast('error', '请至少指定一个系列或产品'); return; }
    var ok = form.tiers.every(function (t) { return t.gifts.length > 0; });
    if (!ok) { G.toast('error', '请为每个档位至少选择 1 件赠品'); return; }
    form.status = status;
    G.toast('success', '规则「' + name + '」已' + (status === 'draft' ? '存为草稿' : '启用') + '（演示）');
    navigateToPage('gift/gift.html');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
