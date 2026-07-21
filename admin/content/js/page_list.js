// ==================== 页面管理列表 - JS ====================

// SVG 图标
var svgIcons = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  columns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  moreHorizontal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
};

// ==================== 模拟数据 ====================
var pages = [
  { id: 'P001', title: '关于我们', handle: 'about-us', locale: 'zh_CN', locales: ['zh_CN', 'en_US'], localeCount: 2, status: 'published', publishedAt: '2026-07-20', updatedAt: '2026-07-20', seoTitle: '关于我们 | QVR品牌站', seoDesc: 'QVR品牌故事与使命' },
  { id: 'P002', title: 'Contact Us', handle: 'contact-us', locale: 'en_US', locales: ['en_US'], localeCount: 1, status: 'published', publishedAt: '2026-07-19', updatedAt: '2026-07-19', seoTitle: 'Contact Us | QVR', seoDesc: 'Get in touch with QVR' },
  { id: 'P003', title: '隐私政策', handle: 'privacy-policy', locale: 'zh_CN', locales: ['zh_CN', 'en_US'], localeCount: 2, status: 'draft', publishedAt: null, updatedAt: '2026-07-18', seoTitle: '', seoDesc: '' },
  { id: 'P004', title: '退换货政策', handle: 'return-policy', locale: 'zh_CN', locales: ['zh_CN'], localeCount: 1, status: 'published', publishedAt: '2026-07-18', updatedAt: '2026-07-18', seoTitle: '退换货政策 | QVR', seoDesc: '' },
  { id: 'P005', title: 'Shipping Policy', handle: 'shipping-policy', locale: 'en_US', locales: ['en_US', 'zh_CN'], localeCount: 2, status: 'published', publishedAt: '2026-07-15', updatedAt: '2026-07-17', seoTitle: 'Shipping Policy | QVR', seoDesc: 'Shipping rates and delivery times' },
  { id: 'P006', title: '尺码指南', handle: 'size-guide', locale: 'zh_CN', locales: ['zh_CN', 'en_US'], localeCount: 2, status: 'published', publishedAt: '2026-07-10', updatedAt: '2026-07-14', seoTitle: '尺码指南 | QVR', seoDesc: '如何选择正确的尺码' },
  { id: 'P007', title: '使用条款', handle: 'terms-of-service', locale: 'zh_CN', locales: ['zh_CN'], localeCount: 1, status: 'draft', publishedAt: null, updatedAt: '2026-07-12', seoTitle: '', seoDesc: '' },
  { id: 'P008', title: 'About Us', handle: 'about-us-en', locale: 'en_US', locales: ['en_US'], localeCount: 1, status: 'published', publishedAt: '2026-07-08', updatedAt: '2026-07-08', seoTitle: 'About Us | QVR Hair', seoDesc: 'Learn about QVR Hair brand' },
  { id: 'P009', title: 'FAQs', handle: 'faqs', locale: 'en_US', locales: ['en_US', 'zh_CN'], localeCount: 2, status: 'published', publishedAt: '2026-07-05', updatedAt: '2026-07-06', seoTitle: 'FAQs | QVR', seoDesc: 'Frequently asked questions' },
  { id: 'P010', title: '品牌故事', handle: 'brand-story', locale: 'zh_CN', locales: ['zh_CN'], localeCount: 1, status: 'draft', publishedAt: null, updatedAt: '2026-07-01', seoTitle: '', seoDesc: '' },
];

// ==================== 列配置 ====================
var pageColumnConfig = [
  { key: 'checkbox', label: '', fixed: 'left', width: '56px', isCheckbox: true, visible: true },
  { key: 'title', label: '页面标题', fixed: 'left', width: '220px', visible: true },
  { key: 'handle', label: 'URL 别名', width: '160px', visible: true },
  { key: 'locale', label: '语言版本', width: '130px', visible: true },
  { key: 'status', label: '状态', width: '100px', visible: true },
  { key: 'updatedAt', label: '更新时间', width: '140px', visible: true },
  { key: 'actions', label: '操作', fixed: 'right', width: '6%', alwaysShow: true, isAction: true, visible: true },
];
var pageColumnOrder = pageColumnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
var pageVisibleCols = pageColumnConfig.filter(function(c) { return c.visible && !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
var pageSortField = 'updatedAt';
var pageSortDir = 'desc';
var pageSize = 10;
var currentPage = 1;

// ==================== 获取可见列 ====================
function getOrderedVisibleCols() {
  var ordered = [];
  var leftFixed = [], middle = [], rightFixed = [];
  pageColumnConfig.forEach(function(c) {
    if (!c.visible) return;
    if (c.fixed === 'left') leftFixed.push(c);
    else if (c.fixed === 'right') rightFixed.push(c);
    else {
      var idx = pageColumnOrder.indexOf(c.key);
      middle.push({ col: c, order: idx >= 0 ? idx : 999 });
    }
  });
  middle.sort(function(a, b) { return a.order - b.order; });
  return ordered.concat(leftFixed.map(function(c) { return c.key; }), middle.map(function(m) { return m.col.key; }), rightFixed.map(function(c) { return c.key; }));
}

// ==================== 状态 Badge ====================
function getStatusBadge(status) {
  var map = {
    'published': { label: '已发布', cls: 'badge-success' },
    'draft': { label: '草稿', cls: 'badge-secondary' },
    'disabled': { label: '已禁用', cls: 'badge-error' },
  };
  var s = map[status] || { label: status, cls: 'badge-secondary' };
  return '<span class="badge ' + s.cls + '">' + s.label + '</span>';
}

// ==================== 语言版本信息 ====================
function getLocaleBadge(page) {
  if (page.localeCount === 1) {
    var label = window.getShopLocaleLabel ? window.getShopLocaleLabel(page.locale) : page.locale;
    return '<span class="locale-badge partial">' + label + '</span>';
  }
  return '<span class="locale-badge complete">' + page.localeCount + ' 种语言</span>';
}

// ==================== 渲染表头 ====================
function renderTableHead() {
  var thead = document.getElementById('tableHead');
  var ordered = getOrderedVisibleCols();
  var sortableKeys = { 'updatedAt': true };
  thead.innerHTML = ordered.map(function(key) {
    var c = pageColumnConfig.find(function(col) { return col.key === key; });
    if (!c) return '';
    var fixedClass = c.fixed ? 'col-fixed-' + c.fixed : '';
    var width = c.width ? 'width:' + c.width + ';' : '';
    if (c.isCheckbox) {
      return '<th class="' + fixedClass + '" style="' + width + '"><div class="checkbox" onclick="toggleAllCheckboxes(this)"></div></th>';
    }
    if (c.isAction) {
      return '<th class="' + fixedClass + '" style="' + width + '">' + c.label + '</th>';
    }
    if (sortableKeys[key]) {
      var sorted = key === pageSortField ? ' sorted' : '';
      var icon = key === pageSortField ? (pageSortDir === 'asc' ? '\u25B2' : '\u25BC') : '';
      return '<th class="sortable' + sorted + ' ' + fixedClass + '" data-sort="' + key + '" style="' + width + '">' + c.label + '<span class="sort-icon">' + icon + '</span></th>';
    }
    return '<th class="' + fixedClass + '" style="' + width + '">' + c.label + '</th>';
  }).join('');
}

// ==================== 获取筛选条件 ====================
function getCurrentFilter() {
  return {
    search: (document.getElementById('pageSearch') && document.getElementById('pageSearch').value) || '',
    status: (document.getElementById('pageStatusFilter') && document.getElementById('pageStatusFilter').value) || '',
    locale: (document.getElementById('pageLocaleFilter') && document.getElementById('pageLocaleFilter').value) || '',
  };
}

// ==================== 渲染表格 ====================
function renderTable(filter) {
  var tbody = document.getElementById('tableBody');
  var filtered = pages.slice();
  if (filter) {
    if (filter.search) {
      var s = filter.search.toLowerCase();
      filtered = filtered.filter(function(p) { return p.title.toLowerCase().indexOf(s) !== -1 || p.handle.toLowerCase().indexOf(s) !== -1; });
    }
    if (filter.status) filtered = filtered.filter(function(p) { return p.status === filter.status; });
    if (filter.locale) filtered = filtered.filter(function(p) { return p.locale === filter.locale; });
  }
  // Sort
  filtered.sort(function(a, b) {
    var va = a[pageSortField] || ''; var vb = b[pageSortField] || '';
    if (pageSortField === 'updatedAt') { va = a.updatedAt || ''; vb = b.updatedAt || ''; }
    if (va < vb) return pageSortDir === 'asc' ? -1 : 1;
    if (va > vb) return pageSortDir === 'asc' ? 1 : -1;
    return 0;
  });
  // Count badge
  var countEl = document.getElementById('pageCount');
  if (countEl) countEl.textContent = '(' + filtered.length + '个)';
  // Pagination
  var totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  var start = (currentPage - 1) * pageSize;
  var pageData = filtered.slice(start, start + pageSize);
  if (filtered.length === 0) {
    var colCount = getOrderedVisibleCols().length;
    tbody.innerHTML = '<tr><td colspan="' + colCount + '"><div class="empty-state"><div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg></div><div class="empty-state-title">暂无匹配页面</div><div class="empty-state-desc">试试调整搜索条件或筛选器</div></div></td></tr>';
    document.getElementById('paginationBtns').innerHTML = '';
    document.getElementById('paginationInfo').textContent = '显示 0 条，共 0 条';
    return;
  }
  tbody.innerHTML = pageData.map(function(p) {
    var ordered = getOrderedVisibleCols();
    var cells = ordered.map(function(key) {
      var c = pageColumnConfig.find(function(col) { return col.key === key; });
      if (!c) return '';
      var fixedClass = c.fixed ? 'col-fixed-' + c.fixed : '';
      var width = c.width ? 'width:' + c.width + ';' : '';
      if (c.isCheckbox) return '<td class="' + fixedClass + '" style="' + width + '"><div class="checkbox" onclick="toggleCheckbox(this)"></div></td>';
      if (c.isAction) {
        return '<td class="' + fixedClass + '" style="' + width + '"><div class="action-group">' +
          '<div class="action-btn" title="预览" onclick="previewPage(\'' + p.id + '\')">' + svgIcons.eye + '</div>' +
          '<div class="action-btn" title="编辑" onclick="editPage(\'' + p.id + '\')">' + svgIcons.edit + '</div>' +
          '<div class="action-btn danger" title="删除" onclick="confirmDeletePage(\'' + p.id + '\')">' + svgIcons.trash + '</div>' +
          '</div></td>';
      }
      var content = '';
      switch (key) {
        case 'title':
          content = '<div class="page-title-cell"><div class="page-title-icon">' + svgIcons.file + '</div><div class="page-title-info"><div class="page-title-name">' + p.title + '</div><div class="page-title-handle">/' + p.handle + '</div></div></div>';
          break;
        case 'handle':
          content = '<span style="font-family:monospace;font-size:13px;color:hsl(var(--muted-foreground));">/' + p.handle + '</span>';
          break;
        case 'locale':
          content = getLocaleBadge(p);
          break;
        case 'status':
          content = getStatusBadge(p.status);
          break;
        case 'updatedAt':
          content = '<span style="font-size:13px;color:hsl(var(--muted-foreground));">' + (p.updatedAt || '—') + '</span>';
          break;
      }
      return '<td class="' + fixedClass + '" style="' + width + '">' + content + '</td>';
    }).join('');
    return '<tr>' + cells + '</tr>';
  }).join('');
  // Pagination bar
  document.getElementById('paginationInfo').textContent = '显示 ' + (start + 1) + '-' + Math.min(start + pageSize, filtered.length) + ' 条，共 ' + filtered.length + ' 条';
  var pagHtml = '';
  pagHtml += '<button class="page-btn' + (currentPage <= 1 ? ' disabled' : '') + '" onclick="goToPage(1)" ' + (currentPage <= 1 ? 'disabled' : '') + '>\u00AB</button>';
  pagHtml += '<button class="page-btn' + (currentPage <= 1 ? ' disabled' : '') + '" onclick="goToPage(' + (currentPage - 1) + ')" ' + (currentPage <= 1 ? 'disabled' : '') + '>\u2039</button>';
  for (var i = 1; i <= totalPages; i++) {
    pagHtml += '<button class="page-btn' + (i === currentPage ? ' active' : '') + '" onclick="goToPage(' + i + ')\">' + i + '</button>';
  }
  pagHtml += '<button class="page-btn' + (currentPage >= totalPages ? ' disabled' : '') + '" onclick="goToPage(' + (currentPage + 1) + ')" ' + (currentPage >= totalPages ? 'disabled' : '') + '>\u203A</button>';
  pagHtml += '<button class="page-btn' + (currentPage >= totalPages ? ' disabled' : '') + '" onclick="goToPage(' + totalPages + ')" ' + (currentPage >= totalPages ? 'disabled' : '') + '>\u00BB</button>';
  document.getElementById('paginationBtns').innerHTML = pagHtml;
}

function goToPage(page) { currentPage = page; renderTable(getCurrentFilter()); }

// ==================== 筛选 ====================
function filterAndRender() { currentPage = 1; renderTable(getCurrentFilter()); }
function resetFilters() {
  document.getElementById('pageSearch').value = '';
  document.getElementById('pageStatusFilter').value = '';
  document.getElementById('pageLocaleFilter').value = '';
  filterAndRender();
}

// ==================== Checkbox ====================
function updateSelectedCount() {
  var checked = document.querySelectorAll('#tableBody .checkbox.checked').length;
  var countEl = document.getElementById('selectedCount');
  if (countEl) countEl.textContent = checked;
  var btns = ['btnBatchPublish', 'btnBatchDraft', 'btnBatchDelete'];
  btns.forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.disabled = checked === 0;
  });
}
function toggleCheckbox(el) { el.classList.toggle('checked'); el.innerHTML = el.classList.contains('checked') ? '\u2713' : ''; updateSelectedCount(); }
function toggleAllCheckboxes(el) {
  var isChecked = !el.classList.contains('checked');
  el.classList.toggle('checked');
  el.innerHTML = isChecked ? '\u2713' : '';
  document.querySelectorAll('#tableBody .checkbox').forEach(function(cb) { cb.classList.toggle('checked', isChecked); cb.innerHTML = isChecked ? '\u2713' : ''; });
  updateSelectedCount();
}

// ==================== 批量操作 ====================
function batchPublish() { notify('已批量发布所选项'); }
function batchDraft() { notify('已批量设为草稿'); }
function batchDelete() { if (confirm('确定批量删除所选页面吗？此操作不可撤销。')) notify('已批量删除所选项'); }

// ==================== 行操作 ====================
function editPage(id) {
  sessionStorage.setItem('editPageId', id);
  navigateToPage('content/page_edit.html');
}
function previewPage(id) {
  var p = pages.find(function(pr) { return pr.id === id; });
  if (p) notify('预览页面: /pages/' + p.handle);
}
function confirmDeletePage(id) {
  var p = pages.find(function(pr) { return pr.id === id; });
  if (!p) return;
  if (confirm('确定删除页面「' + p.title + '」吗？此操作不可撤销。')) {
    pages = pages.filter(function(pr) { return pr.id !== id; });
    renderTable(getCurrentFilter());
    notify('页面「' + p.title + '」已删除');
  }
}

// ==================== 排序 ====================
document.addEventListener('click', function(e) {
  var th = e.target.closest('th.sortable');
  if (!th) return;
  var key = th.getAttribute('data-sort');
  if (!key) return;
  if (pageSortField === key) pageSortDir = pageSortDir === 'asc' ? 'desc' : 'asc';
  else { pageSortField = key; pageSortDir = 'desc'; }
  renderTableHead();
  renderTable(getCurrentFilter());
});

// ==================== 更多操作下拉 ====================
function toggleMoreActions() {
  var dropdown = document.getElementById('moreActionsDropdown');
  if (dropdown.classList.contains('show')) { dropdown.classList.remove('show'); return; }
  var btn = document.getElementById('btnMoreActions');
  var rect = btn.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + 4) + 'px';
  dropdown.style.left = Math.min(rect.left, window.innerWidth - 170) + 'px';
  dropdown.classList.add('show');
}
document.addEventListener('click', function(e) {
  var dropdown = document.getElementById('moreActionsDropdown');
  if (dropdown && !e.target.closest('#moreActionsDropdown') && !e.target.closest('#btnMoreActions')) {
    dropdown.classList.remove('show');
  }
});

// ==================== 自定义列 ====================
function buildCustomColPanel() {
  var body = document.getElementById('customColBody');
  if (!body) return;
  var allKeys = pageColumnOrder.slice();
  body.innerHTML = allKeys.map(function(key) {
    var c = pageColumnConfig.find(function(col) { return col.key === key; });
    if (!c) return '';
    var active = c.visible ? ' active' : '';
    return '<div class="custom-col-item' + active + '" data-key="' + c.key + '" draggable="true">' +
      '<span class="drag-handle">\u22EE\u22EE</span>' +
      '<div class="col-check" onclick="toggleColumn(this.parentElement, event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<span style="flex:1">' + c.label + '</span>' +
      '</div>';
  }).join('');
  initDragEvents();
}

function toggleColumn(el, e) {
  if (e) e.stopPropagation();
  var key = el.getAttribute('data-key');
  var c = pageColumnConfig.find(function(col) { return col.key === key; });
  if (!c) return;
  c.visible = !c.visible;
  if (c.visible) { el.classList.add('active'); if (pageVisibleCols.indexOf(c.key) === -1) pageVisibleCols.push(c.key); }
  else { el.classList.remove('active'); pageVisibleCols = pageVisibleCols.filter(function(k) { return k !== c.key; }); }
  renderTableHead();
  renderTable(getCurrentFilter());
}

function resetCustomCols() {
  pageColumnOrder = pageColumnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
  pageVisibleCols = pageColumnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
  pageColumnConfig.forEach(function(c) { if (!c.isCheckbox && !c.isAction) c.visible = true; });
  buildCustomColPanel();
  renderTableHead();
  renderTable(getCurrentFilter());
  notify('已恢复默认列配置');
}

function toggleColumnPanel() {
  var panel = document.getElementById('customColPanel');
  if (panel.classList.contains('show')) { panel.classList.remove('show'); panel.style.display = 'none'; return; }
  buildCustomColPanel();
  var btn = document.getElementById('btnCustomCols');
  var rect = btn.getBoundingClientRect();
  panel.style.top = (rect.bottom + 4) + 'px';
  panel.style.left = Math.max(8, rect.left - 240 + rect.width) + 'px';
  panel.style.display = 'block';
  panel.classList.add('show');
}

document.addEventListener('click', function(e) {
  var panel = document.getElementById('customColPanel');
  if (panel && !e.target.closest('#customColPanel') && !e.target.closest('#btnCustomCols')) {
    panel.classList.remove('show'); panel.style.display = 'none';
  }
});

function initDragEvents() {
  var body = document.getElementById('customColBody');
  if (!body) return;
  var items = body.querySelectorAll('.custom-col-item');
  var draggedItem = null;
  items.forEach(function(item) {
    item.addEventListener('dragstart', function(e) { draggedItem = this; this.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move'; });
    item.addEventListener('dragend', function(e) { this.style.opacity = '1'; items.forEach(function(it) { it.classList.remove('drag-over'); }); draggedItem = null; });
    item.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (this !== draggedItem) this.classList.add('drag-over'); });
    item.addEventListener('dragleave', function(e) { this.classList.remove('drag-over'); });
    item.addEventListener('drop', function(e) {
      e.preventDefault(); this.classList.remove('drag-over');
      if (this === draggedItem) return;
      var allItems = Array.from(body.querySelectorAll('.custom-col-item'));
      var fromIdx = allItems.indexOf(draggedItem); var toIdx = allItems.indexOf(this);
      if (fromIdx < 0 || toIdx < 0) return;
      var movedKey = pageColumnOrder.splice(fromIdx, 1)[0];
      pageColumnOrder.splice(toIdx, 0, movedKey);
      buildCustomColPanel(); renderTableHead(); renderTable(getCurrentFilter());
    });
  });
}

// ==================== 刷新 ====================
function refreshPage() {
  renderTable(getCurrentFilter());
  notify('页面已刷新');
}

// ==================== 通知 ====================
function notify(msg) {
  if (window.parent && window.parent.showToast) window.parent.showToast('info', msg);
  else if (typeof showToast === 'function') showToast('info', msg);
}

// ==================== Tab 导航 ====================
function switchContentTab(tab) {
  if (tab === 'pages') {
    if (typeof navigateToPage === 'function') navigateToPage('content/page_list.html');
  } else if (tab === 'articles') {
    if (typeof navigateToPage === 'function') navigateToPage('content/article_list.html');
  } else if (tab === 'faq') {
    if (typeof navigateToPage === 'function') navigateToPage('content/faq_list.html');
  }
}

// ==================== 初始化 ====================
function init() {
  // Populate locale filter dynamically
  var localeEl = document.getElementById('pageLocaleFilter');
  if (localeEl) {
    var locales = window.getShopSupportedLocales ? window.getShopSupportedLocales() : [{ key: 'zh_CN', label: '中文', flag: '🇨🇳' }, { key: 'en_US', label: 'English', flag: '🇺🇸' }];
    locales.forEach(function(loc) {
      var opt = document.createElement('option');
      opt.value = loc.key;
      opt.textContent = (loc.flag || '') + ' ' + loc.label;
      localeEl.appendChild(opt);
    });
  }
  buildCustomColPanel();
  renderTableHead();
  renderTable(getCurrentFilter());
  // Event listeners
  var searchEl = document.getElementById('pageSearch');
  if (searchEl) searchEl.addEventListener('input', filterAndRender);
  var statusEl = document.getElementById('pageStatusFilter');
  if (statusEl) statusEl.addEventListener('change', filterAndRender);
  var localeEl = document.getElementById('pageLocaleFilter');
  if (localeEl) localeEl.addEventListener('change', filterAndRender);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
