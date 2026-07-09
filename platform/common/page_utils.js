// ==================== 中台页面公共工具函数 ====================
// 此文件提供复选框批量操作、自定义列面板、更多操作下拉等共享功能
// 每个页面通过 window.PU_CONFIG 配置自己的列信息和批量操作

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

  /** 更新批量操作栏状态 */
  window.puUpdateBulkBar = function() {
    var count = puGetCheckedCount();
    var countEl = document.getElementById('puSelectedCount');
    if (countEl) countEl.textContent = count;
    // 启用/禁用批量按钮
    var bar = document.getElementById('bulkActionBar');
    if (bar) {
      var btns = bar.querySelectorAll('.bulk-actions .btn[disabled], .bulk-actions .btn:disabled');
      btns.forEach(function(btn) {
        btn.disabled = count === 0;
      });
      // 也找没有 disabled 属性的普通批量按钮
      bar.querySelectorAll('.bulk-actions .btn').forEach(function(btn) {
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
      return '<div class="custom-col-item ' + active + ' ' + disabled + '" data-key="' + c.key + '">' +
        (c.alwaysShow ? '' : '<span class="drag-handle" title="拖拽排序">⋮⋮</span>') +
        '<div class="col-check" onclick="puToggleCol(this.parentElement)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
        '<span style="flex:1">' + c.label + '</span>' +
      '</div>';
    }).join('');
  };

  /** 切换列显示 */
  window.puToggleCol = function(el) {
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
      config.visibleCols.push(key);
    }
    if (typeof config.onColumnsChange === 'function') {
      config.onColumnsChange();
    }
  };

  /** 重置自定义列 */
  window.puResetCustomCols = function() {
    var config = window.PU_CONFIG;
    if (!config || !config.columns) return;
    config.visibleCols = config.columns.filter(function(c) { return c.defaultShow !== false && !c.alwaysShow; }).map(function(c) { return c.key; });
    config.visibleCols = config.columns.filter(function(c) { return c.alwaysShow; }).map(function(c) { return c.key; }).concat(config.visibleCols);
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
    var count = puGetCheckedCount();
    if (count === 0) {
      if (typeof showToast === 'function') showToast('info', '请先选择要操作的数据');
      return;
    }
    var config = window.PU_CONFIG;
    if (!config || !config.batchActions) return;
    var action = config.batchActions.find(function(a) { return a.name === actionName; });
    if (action && typeof action.handler === 'function') {
      action.handler(puGetCheckedIds());
    }
  };

})();
