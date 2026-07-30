/* ============================================================
   赠品管理 - 列表 / Tab / 报表（admin/gift/js/gift_list.js）
   视觉与交互对齐产品列表：toolbar、批量操作栏、自定义列弹窗、
   左侧固定复选列、右侧固定操作列（编辑/删除/更多图标）、分页。
   ============================================================ */
(function () {
  'use strict';
  const GWP = window.GWP;
  const esc = GWP.escapeHtml;

  /* ====================== 图标 ====================== */
  const ICON = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  /* ====================== 列定义 ====================== */
  const COLS = {
    pool: [
      { key: 'name', label: '赠品名称', fixed: 'left', alwaysShow: true, width: '240px' },
      { key: 'skuCount', label: '关联SKU数' },
      { key: 'products', label: '关联产品' },
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '创建时间' },
      { key: 'remark', label: '备注', def: false }
    ],
    rule: [
      { key: 'name', label: '规则名称', fixed: 'left', alwaysShow: true, width: '240px' },
      { key: 'scope', label: '适用范围' },
      { key: 'conditions', label: '命中条件' },
      { key: 'reward', label: '赠品内容', width: '240px' },
      { key: 'status', label: '状态' },
      { key: 'createdAt', label: '创建时间' }
    ]
  };

  /* ====================== 状态 ====================== */
  const PAGE_SIZE = 10;
  const state = {
    tab: 'pool',
    pool: { search: '', status: 'all', page: 1, sel: new Set() },
    rule: { search: '', status: 'all', page: 1, sel: new Set() }
  };

  /* ====================== 自定义列持久化 ====================== */
  function defaultVisible(tab) { return COLS[tab].filter((c) => c.def !== false).map((c) => c.key); }
  function loadVisible(tab) {
    const validKeys = COLS[tab].map((c) => c.key);
    const alwaysKeys = COLS[tab].filter((c) => c.alwaysShow).map((c) => c.key);
    try {
      const s = localStorage.getItem('gwp_' + tab + '_cols');
      if (s) {
        const a = JSON.parse(s);
        if (Array.isArray(a)) {
          const saved = a.filter((key, index) => validKeys.includes(key) && a.indexOf(key) === index);
          return alwaysKeys.concat(saved.filter((key) => !alwaysKeys.includes(key)));
        }
      }
    } catch (e) {}
    return defaultVisible(tab);
  }
  function saveVisible(tab, arr) { try { localStorage.setItem('gwp_' + tab + '_cols', JSON.stringify(arr)); } catch (e) {} }
  function defaultOrder(tab) { return COLS[tab].filter((c) => !c.fixed).map((c) => c.key); }
  function loadOrder(tab) {
    const defaults = defaultOrder(tab);
    try {
      const s = localStorage.getItem('gwp_' + tab + '_col_order');
      if (s) {
        const a = JSON.parse(s);
        if (Array.isArray(a)) {
          const saved = a.filter((key, index) => defaults.includes(key) && a.indexOf(key) === index);
          return saved.concat(defaults.filter((key) => !saved.includes(key)));
        }
      }
    } catch (e) {}
    return defaults;
  }
  function saveOrder(tab, arr) { try { localStorage.setItem('gwp_' + tab + '_col_order', JSON.stringify(arr)); } catch (e) {} }
  function visibleCols(tab) {
    const visible = loadVisible(tab);
    const fixed = COLS[tab].filter((c) => c.fixed === 'left' && visible.includes(c.key));
    const movable = loadOrder(tab)
      .filter((key) => visible.includes(key))
      .map((key) => COLS[tab].find((c) => c.key === key))
      .filter(Boolean);
    return fixed.concat(movable);
  }

  /* ====================== 数据访问 ====================== */
  function listOf(tab) { return tab === 'pool' ? GWP.pool() : GWP.rules(); }
  function totalSku(p) { return (p.products || []).reduce((a, b) => a + (b.variants || []).length, 0); }
  function productSummary(p) {
    const names = (p.products || []).map((x) => x.productTitle);
    return names.length ? names.join('、') : '-';
  }
  function scopeText(scope) {
    if (!scope || !scope.sources || !scope.sources.length) return '-';
    return scope.sources.map((s) => (s.type === 'collection' ? '【系列】' : '【产品】') + s.name).join('、');
  }
  function conditionsText(rule) {
    const arr = (rule.conditions || []).map((c) => `${GWP.condTypeLabel(c.type)} ${c.value}${GWP.condTypeUnit(c.type)}`);
    const relation = rule.combine === 'and' ? '且' : '或';
    return arr.length ? arr.join(` <span class="gwp-condition-join">${relation}</span> `) : '-';
  }
  function giftContentText(rule) {
    const gifts = rule.reward && rule.reward.type === 'gift' ? (rule.reward.gifts || []) : [];
    if (!gifts.length) return '-';
    return `<div class="gwp-rule-gifts">${gifts.map((gift) =>
      `<div class="gwp-rule-gift-item"><span>${esc(gift.name)}</span><span class="gwp-rule-gift-qty">×${Math.max(1, Number(gift.qty) || 1)}</span></div>`
    ).join('')}</div>`;
  }

  /* ====================== 单元格 ====================== */
  function cellHtml(tab, row, key) {
    if (tab === 'pool') {
      switch (key) {
        case 'name': return `<div class="gwp-cell-product"><span class="gwp-thumb">🎁</span><div><div>${esc(row.displayName)}</div><div class="gwp-sub">${businessNumberMarkup(row.giftNumber, '赠品编号')}</div></div></div>`;
        case 'skuCount': {
          const total = totalSku(row);
          if (!total) return '0';
          return `<span class="gwp-sku-cell">` +
            `<span class="gwp-sku-count">${total}</span>` +
            `<span class="gwp-sku-icon" data-sku-id="${esc(row.id)}" title="查看关联SKU">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>` +
            `</span></span>`;
        }
        case 'products': return productSummary(row);
        case 'status': return `<span class="badge ${GWP.statusClass(row.status)}">${GWP.statusLabel(row.status)}</span>`;
        case 'createdAt': return row.createdAt || '-';
        case 'remark': return row.remark || '-';
      }
    } else {
      switch (key) {
        case 'name': return `<div><div>${esc(row.name)}</div><div class="gwp-rule-code">${businessNumberMarkup(row.giftRuleNumber, '赠品规则编号')}</div></div>`;
        case 'scope': return scopeText(row.scope);
        case 'conditions': return conditionsText(row);
        case 'reward': return giftContentText(row);
        case 'status': return `<span class="badge ${GWP.statusClass(row.status)}">${GWP.statusLabel(row.status)}</span>`;
        case 'createdAt': return row.createdAt || '-';
      }
    }
    return '';
  }

  /* ====================== 过滤 + 分页 ====================== */
  function filtered(tab) {
    const s = state[tab];
    let arr = listOf(tab).slice();
    if (s.search) {
      const q = s.search.toLowerCase();
      arr = arr.filter((r) => {
        const name = tab === 'pool' ? (r.displayName || '') : (r.name || '');
        const businessNumber = tab === 'pool' ? r.giftNumber : r.giftRuleNumber;
        return name.toLowerCase().includes(q) ||
          (businessNumber || '').toLowerCase().includes(q) ||
          (r.id || '').toLowerCase().includes(q);
      });
    }
    if (s.status && s.status !== 'all') arr = arr.filter((r) => r.status === s.status);
    return arr;
  }

  /* ====================== 渲染表头 ====================== */
  function renderHead(tab) {
    const headRow = document.getElementById(tab === 'pool' ? 'poolHeadRow' : 'ruleHeadRow');
    const vis = visibleCols(tab);
    headRow.innerHTML =
      `<th class="col-fixed-left col-fixed-select" style="width:40px"><div class="checkbox" data-checkall></div></th>` +
      vis.map((c) => {
        const fixedClass = c.fixed === 'left' ? ' class="col-fixed-left col-fixed-name"' : '';
        const width = c.width ? ` style="width:${c.width}"` : '';
        return `<th${fixedClass}${width} data-key="${c.key}">${c.label}</th>`;
      }).join('') +
      `<th class="col-fixed-right" style="width:120px">操作</th>`;
  }

  /* ====================== 渲染表体 ====================== */
  function renderBody(tab) {
    const body = document.getElementById(tab === 'pool' ? 'poolBody' : 'ruleBody');
    const s = state[tab];
    const all = filtered(tab);
    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (s.page > pages) s.page = pages;
    const start = (s.page - 1) * PAGE_SIZE;
    const pageRows = all.slice(start, start + PAGE_SIZE);
    const vis = visibleCols(tab);

    if (!pageRows.length) {
      body.innerHTML = `<tr><td colspan="${vis.length + 2}"><div class="empty-state">${s.search || (s.status && s.status !== 'all') ? '没有符合条件的记录' : '暂无数据'}</div></td></tr>`;
    } else {
      body.innerHTML = pageRows.map((row) => {
        const checked = s.sel.has(row.id);
        const cells = vis.map((c) => {
          const fixedClass = c.fixed === 'left' ? ' class="col-fixed-left col-fixed-name"' : '';
          const width = c.width ? ` style="width:${c.width}"` : '';
          return `<td${fixedClass}${width}>${cellHtml(tab, row, c.key)}</td>`;
        }).join('');
        return `<tr data-id="${row.id}">
          <td class="col-fixed-left col-fixed-select" style="width:40px"><div class="checkbox${checked ? ' checked' : ''}" data-row="${row.id}"></div></td>
          ${cells}
          <td class="col-fixed-right" style="width:120px">
            <div class="action-group">
              <div class="action-btn" data-edit="${row.id}" title="编辑">${ICON.edit}</div>
              <div class="action-btn danger" data-del="${row.id}" title="删除">${ICON.del}</div>
              <div class="action-btn" data-more="${row.id}" title="更多">${ICON.more}</div>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    // 分页信息
    const info = document.getElementById(tab === 'pool' ? 'poolInfo' : 'ruleInfo');
    const pager = document.getElementById(tab === 'pool' ? 'poolPager' : 'rulePager');
    info.textContent = (total === 0)
      ? '共 0 条'
      : `显示 ${(s.page - 1) * PAGE_SIZE + 1}-${Math.min(total, s.page * PAGE_SIZE)} 条，共 ${total} 条`;
    renderPager(pager, s.page, pages, tab);
  }

  function renderPager(pager, page, pages, tab) {
    // 结构完全对齐产品列表：page-btn 为 <div>，prev/next 用 ‹ ›，当前页 active，首尾 disabled，省略号用 ...
    let html = `<div class="page-btn${page <= 1 ? ' disabled' : ''}" data-page="prev">‹</div>`;
    const win = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 1) win.push(i);
      else if (win[win.length - 1] !== '...') win.push('...');
    }
    win.forEach((i) => {
      if (i === '...') html += `<div class="page-btn">...</div>`;
      else html += `<div class="page-btn${i === page ? ' active' : ''}" data-page="${i}">${i}</div>`;
    });
    html += `<div class="page-btn${page >= pages ? ' disabled' : ''}" data-page="next">›</div>`;
    pager.innerHTML = html;
    pager.querySelectorAll('.page-btn:not(.disabled)').forEach((b) => {
      b.addEventListener('click', () => {
        const v = b.dataset.page;
        if (!v) return;
        const s = state[tab];
        if (v === 'prev') s.page = Math.max(1, s.page - 1);
        else if (v === 'next') s.page = Math.min(pages, s.page + 1);
        else s.page = +v;
        renderBody(tab);
      });
    });
  }

  /* ====================== 批量栏 ====================== */
  function puUpdateBulkBar(tab) {
    const s = state[tab];
    document.getElementById('selCount' + (tab === 'pool' ? 'Pool' : 'Rule')).textContent = s.sel.size;
    const bar = document.getElementById(tab === 'pool' ? 'bulkBarPool' : 'bulkBarRule');
    bar.querySelectorAll('[data-bulk]').forEach((b) => { b.disabled = s.sel.size === 0; });
  }

  /* ====================== 自定义列弹窗 ====================== */
  const colPanel = document.getElementById('colPanel');
  const colBody = document.getElementById('colBody');
  let colPanelTab = 'pool';

  function buildColPanel(tab) {
    const vis = loadVisible(tab);
    const fixedCols = COLS[tab].filter((c) => c.alwaysShow);
    const orderedCols = loadOrder(tab).map((key) => COLS[tab].find((c) => c.key === key)).filter(Boolean);
    colBody.innerHTML = fixedCols.concat(orderedCols).map((c) => `
      <div class="custom-col-item ${vis.includes(c.key) ? 'active' : ''} ${c.alwaysShow ? 'disabled' : ''}"
        data-col="${c.key}" ${c.alwaysShow ? '' : 'draggable="true"'}>
        <span class="drag-handle${c.alwaysShow ? ' drag-disabled' : ''}" title="${c.alwaysShow ? '固定列不可拖动' : '拖拽排序'}">⋮⋮</span>
        <span class="col-check">${vis.includes(c.key) ? ICON.check : ''}</span>
        <span class="col-title">${c.label}</span>
        ${c.alwaysShow ? '<span class="custom-col-fixed-tag">固定</span>' : ''}
      </div>`).join('');
    colBody.querySelectorAll('.custom-col-item').forEach((it) => {
      if (it.classList.contains('disabled')) return;
      it.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = it.dataset.col;
        const v = loadVisible(tab);
        const idx = v.indexOf(key);
        if (idx >= 0) v.splice(idx, 1);
        else v.push(key);
        saveVisible(tab, v);
        const on = v.includes(key);
        it.classList.toggle('active', on);
        it.querySelector('.col-check').innerHTML = on ? ICON.check : '';
        renderHead(tab); renderBody(tab);
      });
    });
    initColDrag(tab);
  }

  function initColDrag(tab) {
    let dragItem = null;
    colBody.querySelectorAll('.custom-col-item[draggable="true"]').forEach((item) => {
      item.addEventListener('dragstart', (e) => {
        dragItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.col);
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        colBody.querySelectorAll('.custom-col-item').forEach((el) => el.classList.remove('drag-over'));
        dragItem = null;
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragItem && item !== dragItem) item.classList.add('drag-over');
      });
      item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.classList.remove('drag-over');
        if (!dragItem || item === dragItem) return;
        const order = loadOrder(tab);
        const fromIndex = order.indexOf(dragItem.dataset.col);
        const toIndex = order.indexOf(item.dataset.col);
        if (fromIndex < 0 || toIndex < 0) return;
        order.splice(fromIndex, 1);
        order.splice(toIndex, 0, dragItem.dataset.col);
        saveOrder(tab, order);
        buildColPanel(tab);
        renderHead(tab);
        renderBody(tab);
      });
    });
  }

  function openColPanel(tab, btn) {
    colPanelTab = tab;
    buildColPanel(tab);
    const r = btn.getBoundingClientRect();
    colPanel.style.display = 'block';
    colPanel.style.left = Math.min(r.left, window.innerWidth - 280) + 'px';
    colPanel.style.top = (r.bottom + 6) + 'px';
  }

  /* ====================== 菜单（更多操作 / 行更多） ====================== */
  const moreMenu = document.getElementById('moreActionsMenu');
  const rowMenu = document.getElementById('rowMoreMenu');
  let rowMoreId = null;

  function closeAllMenus() {
    colPanel.style.display = 'none';
    moreMenu.style.display = 'none';
    rowMenu.style.display = 'none';
  }
  function toggleMenu(menu, rect) {
    const show = menu.style.display !== 'block';
    closeAllMenus();
    if (show) {
      menu.style.display = 'block';
      menu.style.left = Math.min(rect.left, window.innerWidth - 200) + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
    }
  }

  /* ====================== 关联SKU数：hover 图标展示详情 ====================== */
  const skuPop = document.getElementById('skuTipPop');
  let skuHideTimer = null;
  function showSkuTip(icon) {
    const pool = GWP.pool().find((p) => p.id === icon.dataset.skuId);
    if (!pool) return;
    const items = [];
    (pool.products || []).forEach((p) => {
      (p.variants || []).forEach((v) => {
        items.push({ img: p.image, name: p.productTitle, sku: v.sku, stock: v.stock });
      });
    });
    if (!items.length) return;
    skuPop.innerHTML = items.map((it) => `
      <div class="gwp-sku-tip">
        <span class="gwp-sku-img">${esc(it.img || '📦')}</span>
        <div class="gwp-sku-info">
          <div class="gwp-sku-name">${esc(it.name || '-')}</div>
          <div class="gwp-sku-meta">编号：${esc(it.sku || '-')}</div>
          <div class="gwp-sku-meta">可用库存：${it.stock}</div>
        </div>
      </div>`).join('');
    const r = icon.getBoundingClientRect();
    skuPop.style.display = 'block';
    const popW = skuPop.offsetWidth, popH = skuPop.offsetHeight;
    let left = r.left;
    if (left + popW > window.innerWidth - 12) left = window.innerWidth - popW - 12;
    skuPop.style.left = Math.max(12, left) + 'px';
    let top = r.bottom + 6;
    if (top + popH > window.innerHeight - 12) top = r.top - popH - 6;
    skuPop.style.top = top + 'px';
  }
  function hideSkuTipSoon() { skuHideTimer = setTimeout(() => { skuPop.style.display = 'none'; }, 160); }
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('#skuTipPop')) { clearTimeout(skuHideTimer); return; }
    const icon = e.target.closest('.gwp-sku-icon');
    if (icon) { clearTimeout(skuHideTimer); showSkuTip(icon); }
  });
  document.addEventListener('mouseout', (e) => {
    const icon = e.target.closest('.gwp-sku-icon');
    if (icon && !(e.relatedTarget && e.relatedTarget.closest('#skuTipPop'))) hideSkuTipSoon();
  });
  skuPop.addEventListener('mouseenter', () => clearTimeout(skuHideTimer));
  skuPop.addEventListener('mouseleave', hideSkuTipSoon);

  /* ====================== 渲染单个 tab ====================== */
  function refresh(tab) {
    renderHead(tab);
    renderBody(tab);
    puUpdateBulkBar(tab);
  }
  function refreshAll() {
    document.getElementById('cntPool').textContent = GWP.pool().length;
    document.getElementById('cntRule').textContent = GWP.rules().length;
    refresh('pool');
    refresh('rule');
  }

  /* ====================== 打开表单 ====================== */
  function goForm(tab, id) {
    const page = tab === 'pool' ? 'gift/gift_pool_form.html' : 'gift/gift_rule_form.html';
    const url = id ? `${page}?edit=${encodeURIComponent(id)}` : `${page}?add=1`;
    if (window.parent && window.parent.loadAdminPage) window.parent.loadAdminPage('gift', url);
    else location.href = url;
  }

  /* ====================== 事件绑定 ====================== */
  function bindGlobal() {
    // Tab 切换
    document.getElementById('gwpTabs').addEventListener('click', (e) => {
      const t = e.target.closest('.gwp-tab'); if (!t) return;
      const tab = t.dataset.tab;
      state.tab = tab;
      document.querySelectorAll('.gwp-tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === tab));
      document.querySelectorAll('.gwp-tab-panel').forEach((x) => x.classList.toggle('active', x.id === 'panel' + tab.charAt(0).toUpperCase() + tab.slice(1)));
      closeAllMenus();
      refresh(tab);
    });

    // 搜索
    document.getElementById('poolSearch').addEventListener('input', (e) => { state.pool.search = e.target.value.trim(); state.pool.page = 1; renderBody('pool'); });
    document.getElementById('ruleSearch').addEventListener('input', (e) => { state.rule.search = e.target.value.trim(); state.rule.page = 1; renderBody('rule'); });

    // 状态筛选
    document.getElementById('poolStatus').addEventListener('gwpcombochange', () => { state.pool.status = GWP.comboValue(document.getElementById('poolStatus')); state.pool.page = 1; renderBody('pool'); });
    document.getElementById('ruleStatus').addEventListener('gwpcombochange', () => { state.rule.status = GWP.comboValue(document.getElementById('ruleStatus')); state.rule.page = 1; renderBody('rule'); });

    // 新增
    document.getElementById('addPool').addEventListener('click', () => goForm('pool'));
    document.getElementById('addRule').addEventListener('click', () => goForm('rule'));

    // 刷新
    document.getElementById('refreshPool').addEventListener('click', () => { refresh('pool'); GWP.toast('已刷新'); });
    document.getElementById('refreshRule').addEventListener('click', () => { refresh('rule'); GWP.toast('已刷新'); });

    // 批量操作
    ['pool', 'rule'].forEach((tab) => {
      const bar = document.getElementById(tab === 'pool' ? 'bulkBarPool' : 'bulkBarRule');
      bar.querySelectorAll('[data-bulk]').forEach((b) => {
        b.addEventListener('click', () => {
          const s = state[tab];
          if (!s.sel.size) { GWP.toast('请先选择项目'); return; }
          const ids = Array.from(s.sel);
          const act = b.dataset.bulk;
          ids.forEach((id) => {
            if (act === 'delete') { if (tab === 'pool') GWP.deletePool(id); else GWP.deleteRule(id); }
            else {
              const list = tab === 'pool' ? GWP.pool() : GWP.rules();
              const item = list.find((x) => x.id === id);
              if (item) { item.status = act === 'enable' ? 'active' : act === 'disable' ? 'disabled' : 'draft'; if (tab === 'pool') GWP.savePool(item); else GWP.saveRule(item); }
            }
          });
          GWP.toast(act === 'delete' ? `已删除 ${ids.length} 项` : `已更新 ${ids.length} 项状态`);
          s.sel.clear();
          refreshAll();
        });
      });

      // 批量「更多操作」
      const moreBtn = document.getElementById(tab === 'pool' ? 'moreActionsBtnPool' : 'moreActionsBtnRule');
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(moreMenu, moreBtn.getBoundingClientRect());
      });
      // 自定义列
      const colsBtn = document.getElementById(tab === 'pool' ? 'openColsPool' : 'openColsRule');
      colsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (colPanel.style.display === 'block' && colPanelTab === tab) closeAllMenus();
        else openColPanel(tab, colsBtn);
      });
    });

    // 批量「更多操作」菜单项
    moreMenu.querySelectorAll('[data-bulk]').forEach((it) => {
      it.addEventListener('click', () => {
        const tab = state.tab;
        const s = state[tab];
        const act = it.dataset.bulk;
        if (!s.sel.size) { GWP.toast('请先选择项目'); closeAllMenus(); return; }
        const ids = Array.from(s.sel);
        ids.forEach((id) => {
          const list = tab === 'pool' ? GWP.pool() : GWP.rules();
          const item = list.find((x) => x.id === id);
          if (item) { item.status = 'draft'; if (tab === 'pool') GWP.savePool(item); else GWP.saveRule(item); }
        });
        GWP.toast(`已移至草稿 ${ids.length} 项`);
        s.sel.clear();
        closeAllMenus();
        refreshAll();
      });
    });

    // 行「更多」菜单项（复制）
    rowMenu.querySelectorAll('[data-dup]').forEach((it) => {
      it.addEventListener('click', () => {
        const tab = state.tab;
        const id = rowMoreId;
        if (!id) { closeAllMenus(); return; }
        if (tab === 'pool') GWP.duplicatePool(id); else GWP.duplicateRule(id);
        GWP.toast('已复制');
        closeAllMenus();
        refreshAll();
      });
    });

    // 表体事件委托：全选 / 行选择 / 编辑 / 删除 / 更多
    ['pool', 'rule'].forEach((tab) => {
      const body = document.getElementById(tab === 'pool' ? 'poolBody' : 'ruleBody');
      body.addEventListener('click', (e) => {
        const s = state[tab];
        const rowCb = e.target.closest('[data-row]');
        if (rowCb) {
          const id = rowCb.dataset.row;
          if (s.sel.has(id)) { s.sel.delete(id); rowCb.classList.remove('checked'); }
          else { s.sel.add(id); rowCb.classList.add('checked'); }
          puUpdateBulkBar(tab);
          return;
        }
        const allCb = e.target.closest('[data-checkall]');
        if (allCb) {
          const all = filtered(tab);
          const allSel = all.every((r) => s.sel.has(r.id));
          all.forEach((r) => { if (allSel) s.sel.delete(r.id); else s.sel.add(r.id); });
          renderBody(tab);
          puUpdateBulkBar(tab);
          return;
        }
        const editBtn = e.target.closest('[data-edit]');
        if (editBtn) { goForm(tab, editBtn.dataset.edit); return; }
        const delBtn = e.target.closest('[data-del]');
        if (delBtn) {
          const id = delBtn.dataset.del;
          if (confirm('确定删除该' + (tab === 'pool' ? '赠品' : '规则') + '？')) {
            if (tab === 'pool') GWP.deletePool(id); else GWP.deleteRule(id);
            s.sel.delete(id);
            GWP.toast('已删除');
            refreshAll();
          }
          return;
        }
        const moreBtn = e.target.closest('[data-more]');
        if (moreBtn) {
          e.stopPropagation();
          rowMoreId = moreBtn.dataset.more;
          toggleMenu(rowMenu, moreBtn.getBoundingClientRect());
          return;
        }
      });
    });

    // 自定义列：恢复默认 / 关闭
    document.getElementById('colReset').addEventListener('click', () => {
      saveVisible(colPanelTab, defaultVisible(colPanelTab));
      saveOrder(colPanelTab, defaultOrder(colPanelTab));
      buildColPanel(colPanelTab);
      renderHead(colPanelTab); renderBody(colPanelTab);
    });
    colPanel.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#colPanel') && !e.target.closest('[id^="openCols"]')) closeAllMenus();
    });
    window.addEventListener('resize', closeAllMenus);
    window.addEventListener('scroll', closeAllMenus, true);
  }

  /* ====================== 初始化 ====================== */
  function init() {
    GWP.gwpCombo(document);
    const params = new URLSearchParams(location.search);
    const initTab = params.get('tab');
    if (initTab === 'rule' || initTab === 'pool') {
      state.tab = initTab;
      document.querySelectorAll('.gwp-tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === initTab));
      document.querySelectorAll('.gwp-tab-panel').forEach((x) => x.classList.toggle('active', x.id === 'panel' + initTab.charAt(0).toUpperCase() + initTab.slice(1)));
    }
    bindGlobal();
    refreshAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
