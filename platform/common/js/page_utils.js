// ==================== 中台页面公共工具函数 ====================
// 此文件提供复选框批量操作、自定义列面板、更多操作下拉等共享功能
// 每个页面通过 window.PU_CONFIG 配置自己的列信息和批量操作

/** Toast 代理 — 子页面（iframe）无 toastContainer，委托父页面执行 */
function showToast(type, message) {
  if (window.parent && typeof window.parent.showToast === 'function') {
    window.parent.showToast(type, message);
  }
}

(function() {
  'use strict';

  // ==================== 复选框操作 ====================

  /** 切换单个复选框 */
  window.puToggleCheckbox = function(el) {
    el.classList.toggle('checked');
    el.innerHTML = el.classList.contains('checked') ? '✓' : '';
    puUpdateBulkBar();
  };

  /** 全选/取消全选 */
  window.puToggleAllCheckboxes = function(el, tbodyId) {
    var isChecked = !el.classList.contains('checked');
    el.classList.toggle('checked', isChecked);
    el.innerHTML = isChecked ? '✓' : '';
    var tbody = document.getElementById(tbodyId || 'tableBody');
    if (tbody) {
      tbody.querySelectorAll('.checkbox').forEach(function(cb) {
        cb.classList.toggle('checked', isChecked);
        cb.innerHTML = isChecked ? '✓' : '';
      });
    }
    puUpdateBulkBar();
  };

  /** 获取已选中行的数据ID列表（需要行上有 data-id 属性） */
  window.puGetCheckedIds = function(tbodyId) {
    var tbody = document.getElementById(tbodyId || 'tableBody');
    if (!tbody) return [];
    var ids = [];
    tbody.querySelectorAll('tr .checkbox.checked').forEach(function(cb) {
      var tr = cb.closest('tr');
      if (tr && tr.dataset.id) ids.push(tr.dataset.id);
    });
    return ids;
  };

  /** 获取已选数量 */
  window.puGetCheckedCount = function(tbodyId) {
    var tbody = document.getElementById(tbodyId || 'tableBody');
    if (!tbody) return 0;
    return tbody.querySelectorAll('tr .checkbox.checked').length;
  };

  /** 获取当前页面的 tbodyId */
  function puGetTbodId() {
    var config = window.PU_CONFIG || {};
    return config.tbodId || 'tableBody';
  }

  /** 更新批量操作栏状态（批量操作栏始终可见，仅更新数量和按钮启用状态） */
  window.puUpdateBulkBar = function() {
    var tbodyId = puGetTbodId();
    var count = puGetCheckedCount(tbodyId);
    var countEl = document.getElementById('puSelectedCount');
    if (countEl) countEl.textContent = count;
    var bar = document.getElementById('bulkActionBar');
    if (bar) {
      bar.querySelectorAll('.bulk-actions > .btn').forEach(function(btn) {
        if (count === 0) {
          btn.setAttribute('disabled', '');
        } else {
          btn.removeAttribute('disabled');
        }
      });
    }
  };

  /** 页面初始化时绑定全选事件 */
  window.puInitCheckboxes = function(tbodyId) {
    var tid = tbodyId || 'tableBody';
    document.addEventListener('click', function(e) {
      var cb = e.target.closest('#' + tid + ' .checkbox');
      if (!cb) return;
      // 防止触发父元素的排序等事件
    });
  };

  // ==================== 自定义列面板 ====================

  /** 构建自定义列面板 */
  window.puBuildCustomColPanel = function(columns, visibleCols) {
    var body = document.getElementById('customColBody');
    if (!body) return;
    if (!columns || !columns.length) { body.innerHTML = ''; return; }

    body.innerHTML = columns.map(function(c) {
      var disabled = c.alwaysShow ? 'disabled' : '';
      var active = visibleCols.indexOf(c.key) !== -1 ? 'active' : '';
      var dragIcon = '<span class="drag-handle' + (c.alwaysShow ? ' drag-disabled' : '') + '" title="' + (c.alwaysShow ? '常显列不可隐藏' : '拖拽排序') + '">⋮⋮</span>';
      return '<div class="custom-col-item ' + active + ' ' + disabled + '" data-key="' + c.key + '">' +
        dragIcon +
        '<div class="col-check" onclick="puToggleCol(this.parentElement, event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
        '<span style="flex:1">' + c.label + '</span>' +
      '</div>';
    }).join('');
  };

  /** 切换列显示 */
  window.puToggleCol = function(el, e) {
    if (e) { e.stopPropagation(); }
    var key = el.dataset.key;
    var config = window.PU_CONFIG;
    if (!config || !config.columns) return;
    var c = config.columns.find(function(col) { return col.key === key; });
    if (c && c.alwaysShow) return;

    if (el.classList.contains('active')) {
      el.classList.remove('active');
      config.visibleCols = config.visibleCols.filter(function(k) { return k !== key; });
    } else {
      el.classList.add('active');
      // 按 columns 原始顺序插入，而非 push 到末尾
      var ordered = puGetOrderedVisibleCols(config, key);
      config.visibleCols = ordered;
    }
    if (typeof config.onColumnsChange === 'function') {
      config.onColumnsChange();
    }
  };

  /**
   * 返回按 columns 配置原始顺序排列的可见列 key 列表。
   * @param {object} config - PU_CONFIG 对象
   * @param {string} [extraKey] - 额外需要加入的列 key（用于 puToggleCol 重新显示列时）
   */
  function puGetOrderedVisibleCols(config, extraKey) {
    var colKeys = config.columns.map(function(c) { return c.key; });
    var set = {};
    config.visibleCols.forEach(function(k) { set[k] = true; });
    if (extraKey) set[extraKey] = true;
    var result = [];
    for (var i = 0; i < colKeys.length; i++) {
      if (set[colKeys[i]]) result.push(colKeys[i]);
    }
    return result;
  }

  /** 重置自定义列：恢复为默认显示列，按 columns 原始顺序排列 */
  window.puResetCustomCols = function() {
    var config = window.PU_CONFIG;
    if (!config || !config.columns) return;
    config.visibleCols = config.columns.filter(function(c) { return c.defaultShow !== false; }).map(function(c) { return c.key; });
    puBuildCustomColPanel(config.columns, config.visibleCols);
    if (typeof config.onColumnsChange === 'function') {
      config.onColumnsChange();
    }
  };

  /** 切换自定义列面板 */
  window.puToggleCustomColPanel = function() {
    var panel = document.getElementById('customColPanel');
    var btn = document.querySelector('#customColWrapper button');
    if (!panel || !btn) return;
    if (panel.classList.contains('show')) {
      panel.classList.remove('show');
      panel.style.display = 'none';
    } else {
      var rect = btn.getBoundingClientRect();
      panel.style.top = (rect.bottom + 4) + 'px';
      panel.style.left = Math.max(8, rect.right - 240) + 'px';
      panel.style.display = 'block';
      panel.classList.add('show');
    }
  };

  /** 同步表头列可见性：根据 visibleCols 显示/隐藏 thead th */
  window.puSyncTableHead = function(config) {
    var theadTr = document.querySelector('.table-card table thead tr');
    if (!theadTr || !config || !config.columns || !config.visibleCols) return;
    var visibleCols = config.visibleCols;
    var ths = theadTr.querySelectorAll('th');
    for (var i = 0; i < ths.length; i++) {
      var th = ths[i];
      var key = th.getAttribute('data-col');
      if (!key) continue;
      if (visibleCols.indexOf(key) === -1) {
        th.style.display = 'none';
      } else {
        th.style.display = '';
      }
    }
    // 同步 colgroup cols
    var colgroup = document.querySelector('.table-card table colgroup');
    if (colgroup) {
      var cols = colgroup.querySelectorAll('col');
      var colIdx = 0;
      for (var j = 0; j < ths.length; j++) {
        var thForCol = ths[j];
        var cKey = thForCol.getAttribute('data-col');
        // 非 data-col 的 th（如 checkbox/pre-col）占第 0 列
        if (cKey) {
          // 该 th 对应的 col
          while (colIdx < cols.length) {
            if (visibleCols.indexOf(cKey) === -1) {
              cols[colIdx].style.display = 'none';
            } else {
              cols[colIdx].style.display = '';
            }
            colIdx++;
            break;
          }
        } else {
          // 非 data-col 列（pre-col/checkbox），始终显示
          if (colIdx < cols.length) colIdx++;
        }
      }
    }
  };

  /** 关闭自定义列面板（点击外部） */
  document.addEventListener('click', function(e) {
    var wrapper = document.getElementById('customColWrapper');
    var panel = document.getElementById('customColPanel');
    if (wrapper && panel && !wrapper.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('show');
      panel.style.display = 'none';
    }
  });

  // ==================== 更多操作下拉 ====================

  /** 切换更多操作下拉 */
  window.puToggleMoreActions = function() {
    var dropdown = document.getElementById('moreActionsDropdown');
    if (!dropdown) return;
    var isOpen = dropdown.style.display === 'block';
    if (isOpen) {
      dropdown.style.display = 'none';
      return;
    }
    var btn = document.getElementById('btnMoreActions');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 4) + 'px';
    dropdown.style.left = Math.max(8, rect.left) + 'px';
    dropdown.style.display = 'block';
  };

  /** 关闭更多操作下拉（点击外部） */
  document.addEventListener('click', function(e) {
    var wrapper = document.getElementById('moreActionsWrapper');
    var dropdown = document.getElementById('moreActionsDropdown');
    if (dropdown && wrapper && !wrapper.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  /** 执行更多操作 */
  window.puDoMoreAction = function(actionName) {
    document.getElementById('moreActionsDropdown').style.display = 'none';
    var config = window.PU_CONFIG;
    if (!config || !config.moreActions) return;
    var action = config.moreActions.find(function(a) { return a.name === actionName; });
    if (action && typeof action.handler === 'function') {
      action.handler();
    }
  };

  // ==================== 批量操作 ====================

  /** 执行批量操作 */
  window.puDoBatchAction = function(actionName) {
    var tbodyId = puGetTbodId();
    var count = puGetCheckedCount(tbodyId);
    if (count === 0) {
      if (typeof showToast === 'function') showToast('info', '请先选择要操作的数据');
      return;
    }
    var config = window.PU_CONFIG;
    if (!config || !config.batchActions) return;
    var action = config.batchActions.find(function(a) { return a.name === actionName; });
    if (action && typeof action.handler === 'function') {
      action.handler(puGetCheckedIds(tbodyId));
    }
  };

  /** 获取渲染前已选中的 ID 列表（渲染前保存） */
  window.puSaveCheckedIds = function(tbodyId) {
    var tbody = document.getElementById(tbodyId || puGetTbodId());
    if (!tbody) return [];
    var ids = [];
    tbody.querySelectorAll('tr .checkbox.checked').forEach(function(cb) {
      var tr = cb.closest('tr');
      if (tr && tr.dataset.id) ids.push(tr.dataset.id);
    });
    return ids;
  };

  /** 渲染后恢复复选框选中状态并刷新批量操作栏 */
  window.puRestoreCheckedIds = function(tbodyId, ids) {
    if (!ids || !ids.length) return;
    var tbody = document.getElementById(tbodyId || puGetTbodId());
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(function(tr) {
      if (!tr.dataset.id || ids.indexOf(tr.dataset.id) === -1) return;
      var cb = tr.querySelector('.checkbox');
      if (cb) { cb.classList.add('checked'); cb.innerHTML = '✓'; }
    });
    puUpdateBulkBar();
  };

  /** 组合方法：渲染前返回选中 ID，期望页面在渲染后调用 puRestoreCheckedIds */
  window.puWrapRender = function(tbodyId, renderFn) {
    var checkedIds = puSaveCheckedIds(tbodyId);
    renderFn();
    puRestoreCheckedIds(tbodyId, checkedIds);
  };

  // ==================== 分页 ====================

  /**
   * 渲染分页栏。调用方在 table-card 内部放置 <div class="pagination-bar" id="xxxPagination"></div>。
   * @param options { total, pageSize, currentPage, onPageChange, containerId }
   */
  window.puRenderPagination = function(options) {
    var total = options.total || 0;
    var pageSize = options.pageSize || 10;
    var current = options.currentPage || 1;
    var containerId = options.containerId || 'paginationBar';
    var onPageChange = options.onPageChange || function() {};

    var totalPages = Math.ceil(total / pageSize) || 1;
    if (current > totalPages) current = totalPages;

    var container = document.getElementById(containerId);
    if (!container) return;

    var start = total === 0 ? 0 : (current - 1) * pageSize + 1;
    var end = Math.min(current * pageSize, total);

    var html = '';
    html += '<span class="pagination-info">显示 ' + start + '-' + end + ' 条，共 ' + total + ' 条</span>';
    html += '<div class="pagination-buttons">';

    // 上一页
    html += '<div class="page-btn' + (current <= 1 ? ' disabled' : '') + '" data-page="' + (current - 1) + '">‹</div>';

    // 页码
    var pages = paginatePages(current, totalPages);
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i];
      if (p === '...') {
        html += '<div class="page-btn disabled">...</div>';
      } else {
        html += '<div class="page-btn' + (p === current ? ' active' : '') + '" data-page="' + p + '">' + p + '</div>';
      }
    }

    // 下一页
    html += '<div class="page-btn' + (current >= totalPages ? ' disabled' : '') + '" data-page="' + (current + 1) + '">›</div>';

    html += '</div>';
    container.innerHTML = html;

    // 绑定点击
    container.querySelectorAll('.page-btn:not(.disabled):not([data-page="..."])').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var page = parseInt(this.getAttribute('data-page'));
        if (page && page !== current) {
          onPageChange(page);
        }
      });
    });
  };

  /** 生成页码序列，如 [1, '...', 4, 5, 6, '...', 10] */
  function paginatePages(current, total) {
    if (total <= 7) {
      var arr = [];
      for (var i = 1; i <= total; i++) arr.push(i);
      return arr;
    }
    var pages = [1];
    if (current > 3) pages.push('...');
    var start = Math.max(2, current - 1);
    var end = Math.min(total - 1, current + 1);
    for (var i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  /**
   * 切片数据（用于分页）
   * @param data  - 完整数据数组
   * @param page  - 当前页码（1-based）
   * @param size  - 每页条数
   */
  window.puSlicePage = function(data, page, size) {
    page = page || 1;
    size = size || 10;
    var start = (page - 1) * size;
    return data.slice(start, start + size);
  };

})();

// ==================== 可搜索下拉选择器 ====================

/** 初始化页面上所有 select 为可搜索下拉（跳过已转换的） */
function initSearchableSelects() {
  var selects = document.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++) {
    if (selects[i]._searchable) continue;
    if (!selects[i].id) continue;
    buildSearchableSelect(selects[i]);
  }
}

/** 页面加载后自动初始化所有下拉 */
document.addEventListener('DOMContentLoaded', initSearchableSelects);

function buildSearchableSelect(select) {
  var selectId = select.id;
  if (!selectId) return;

  // 外层容器
  var wrapper = document.createElement('div');
  wrapper.className = 'searchable-select';
  wrapper.id = selectId + 'Wrapper';

  // 触发器按钮
  var trigger = document.createElement('button');
  trigger.className = 'searchable-select-trigger';
  trigger.type = 'button';
  var selOpt = select.options[select.selectedIndex];
  var triggerSpan = document.createElement('span');
  triggerSpan.textContent = selOpt ? selOpt.text : '请选择';
  trigger.appendChild(triggerSpan);
  var arrow = document.createElement('span');
  arrow.className = 'searchable-select-arrow';
  arrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#90A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  trigger.appendChild(arrow);

  // 下拉面板
  var dropdown = document.createElement('div');
  dropdown.className = 'searchable-select-dropdown';
  dropdown.id = selectId + 'Dropdown';
  dropdown.style.display = 'none';

  // 搜索框
  var searchArea = document.createElement('div');
  searchArea.className = 'searchable-select-search';
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '输入关键词检索...';
  searchInput.id = selectId + 'Search';
  searchArea.appendChild(searchInput);
  dropdown.appendChild(searchArea);

  // 选项列表
  var listDiv = document.createElement('div');
  listDiv.className = 'searchable-select-list';
  listDiv.id = selectId + 'List';
  var selValue = select.value;
  var opts = select.querySelectorAll('option');
  for (var j = 0; j < opts.length; j++) {
    var opt = opts[j];
    var item = document.createElement('div');
    item.className = 'searchable-select-option';
    if (opt.value === selValue) item.classList.add('selected');
    item.dataset.value = opt.value;
    item.textContent = (j + 1) + '. ' + opt.text;
    (function(value, text) {
      item.addEventListener('click', function() {
        selectSearchableOption(selectId, value, text);
      });
    })(opt.value, opt.text);
    listDiv.appendChild(item);
  }
  dropdown.appendChild(listDiv);

  // 组装
  wrapper.appendChild(trigger);
  wrapper.appendChild(dropdown);

  // 隐藏原始 select，插入 wrapper
  select.style.display = 'none';
  select.parentNode.insertBefore(wrapper, select);

  // 保存引用
  select._searchable = { wrapper: wrapper, trigger: trigger, triggerSpan: triggerSpan, dropdown: dropdown };

  // 触发器点击
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSearchableDropdown(selectId);
  });

  // 搜索过滤
  searchInput.addEventListener('input', function() {
    var q = this.value.toLowerCase();
    var items = dropdown.querySelectorAll('.searchable-select-option');
    var visible = 0;
    for (var k = 0; k < items.length; k++) {
      if (!q || items[k].textContent.toLowerCase().indexOf(q) !== -1) {
        items[k].classList.remove('hidden');
        visible++;
      } else {
        items[k].classList.add('hidden');
      }
    }
    var noneEl = listDiv.querySelector('.searchable-select-none');
    if (visible === 0) {
      if (!noneEl) {
        noneEl = document.createElement('div');
        noneEl.className = 'searchable-select-none';
        noneEl.textContent = '无匹配选项';
        listDiv.appendChild(noneEl);
      }
    } else if (noneEl) {
      noneEl.remove();
    }
  });

  // 点击外部关闭
  document.addEventListener('click', function(e) {
    var d = document.getElementById(selectId + 'Dropdown');
    if (d && d.style.display === 'block' && !wrapper.contains(e.target)) {
      closeSearchableDropdown(selectId);
    }
  });
}

function toggleSearchableDropdown(selectId) {
  var dropdown = document.getElementById(selectId + 'Dropdown');
  var triggerEl = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger');
  if (!dropdown) return;
  if (dropdown.style.display === 'block') {
    closeSearchableDropdown(selectId);
    return;
  }
  if (triggerEl) {
    var rect = triggerEl.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 4) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.minWidth = rect.width + 'px';
  }
  dropdown.style.display = 'block';
  if (triggerEl) triggerEl.classList.add('open');
  var search = document.getElementById(selectId + 'Search');
  if (search) setTimeout(function() { search.focus(); }, 100);
}

function closeSearchableDropdown(selectId) {
  var dropdown = document.getElementById(selectId + 'Dropdown');
  var triggerEl = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger');
  if (dropdown) dropdown.style.display = 'none';
  if (triggerEl) triggerEl.classList.remove('open');
  var search = document.getElementById(selectId + 'Search');
  if (search) search.value = '';
  var list = document.getElementById(selectId + 'List');
  if (list) {
    var items = list.querySelectorAll('.searchable-select-option');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('hidden');
    var noneEl = list.querySelector('.searchable-select-none');
    if (noneEl) noneEl.remove();
  }
}

function selectSearchableOption(selectId, value, text) {
  var select = document.getElementById(selectId);
  if (!select) return;
  select.value = value;
  var triggerSpan = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger span');
  if (triggerSpan) triggerSpan.textContent = text;
  var list = document.getElementById(selectId + 'List');
  if (list) {
    var items = list.querySelectorAll('.searchable-select-option');
    for (var i = 0; i < items.length; i++) {
      if (items[i].dataset.value === value) {
        items[i].classList.add('selected');
      } else {
        items[i].classList.remove('selected');
      }
    }
  }
  closeSearchableDropdown(selectId);
  select.dispatchEvent(new Event('change', { bubbles: true }));
}
