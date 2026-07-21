// ==================== 文章管理列表 - JS ====================

var svgIcons = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v7l-3 5h6l-3-5V2Z"/><circle cx="12" cy="22" r="1"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  columns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
};

// ==================== 模拟数据 ====================
var articles = [
  { id: 'A001', title: '如何选择适合你的发套', handle: 'how-to-choose-a-wig', status: 'published', category: 'c1', tags: ['发型', '教程'], locale: 'zh_CN', readCount: 1234, isPinned: false, scheduledAt: null, publishedAt: '2026-07-15', updatedAt: '2026-07-15', seoTitle: '如何选择发套 | QVR', seoDesc: '了解脸型、长度、材质...' },
  { id: 'A002', title: '2026 假发流行趋势', handle: '2026-wig-trends', status: 'draft', category: 'c2', tags: ['趋势'], locale: 'zh_CN', readCount: 0, isPinned: false, scheduledAt: null, publishedAt: null, updatedAt: '2026-07-18', seoTitle: '', seoDesc: '' },
  { id: 'A003', title: '产品评测：5款热销接发对比', handle: 'top-5-hair-extensions', status: 'scheduled', category: 'c3', tags: ['评测', '接发'], locale: 'zh_CN', readCount: 0, isPinned: false, scheduledAt: '2026-07-25T10:00', publishedAt: null, updatedAt: '2026-07-19', seoTitle: '5款热销接发对比 | QVR', seoDesc: '' },
  { id: 'A004', title: '假发日常护理步骤', handle: 'daily-wig-care', status: 'published', category: 'c1', tags: ['护理', '教程'], locale: 'zh_CN', readCount: 3205, isPinned: true, scheduledAt: null, publishedAt: '2026-06-20', updatedAt: '2026-07-10', seoTitle: '假发日常护理 | QVR', seoDesc: '保持假发光泽的秘诀' },
  { id: 'A005', title: '发饰搭配指南', handle: 'hair-accessories-guide', status: 'published', category: 'c2', tags: ['搭配', '教程'], locale: 'en_US', readCount: 876, isPinned: false, scheduledAt: null, publishedAt: '2026-07-01', updatedAt: '2026-07-01', seoTitle: '发饰搭配指南 | QVR', seoDesc: '' },
  { id: 'A006', title: '接发前后注意事项', handle: 'extensions-before-after', status: 'published', category: 'c1', tags: ['接发', '教程'], locale: 'zh_CN', readCount: 2100, isPinned: false, scheduledAt: null, publishedAt: '2026-06-15', updatedAt: '2026-07-08', seoTitle: '接发注意事项 | QVR', seoDesc: '' },
  { id: 'A007', title: '如何正确佩戴发套', handle: 'how-to-wear-wig', status: 'draft', category: 'c1', tags: ['教程'], locale: 'en_US', readCount: 0, isPinned: false, scheduledAt: null, publishedAt: null, updatedAt: '2026-07-17', seoTitle: '', seoDesc: '' },
  { id: 'A008', title: '染发后发套护理技巧', handle: 'dyed-wig-care', status: 'published', category: 'c1', tags: ['护理', '染发'], locale: 'zh_CN', readCount: 567, isPinned: false, scheduledAt: null, publishedAt: '2026-05-20', updatedAt: '2026-07-05', seoTitle: '染发后发套护理 | QVR', seoDesc: '' },
  { id: 'A009', title: '名媛同款发饰推荐', handle: 'celebrity-hair-accessories', status: 'draft', category: 'c2', tags: ['趋势', '搭配'], locale: 'zh_CN', readCount: 0, isPinned: false, scheduledAt: null, publishedAt: null, updatedAt: '2026-07-19', seoTitle: '', seoDesc: '' },
  { id: 'A010', title: '夏季护发秘诀', handle: 'summer-hair-care', status: 'scheduled', category: 'c1', tags: ['护理', '季节'], locale: 'zh_CN', readCount: 0, isPinned: true, scheduledAt: '2026-08-01T08:00', publishedAt: null, updatedAt: '2026-07-20', seoTitle: '夏季护发秘诀 | QVR', seoDesc: '夏季护发防脱色技巧合集' },
];

// ==================== 文章分类（多语言，通过 localStorage 同步） ====================
var CAT_STORAGE_KEY = 'article_categories_v2';
var categories = [];
var aNextCatId = 6;
var catEditingId = null;
var catCoverImageData = null;
var aCatLocales = [];

function getDefaultArticleCategories() {
  var locales = aCatLocales;
  var l1 = locales.length > 0 ? locales[0].key : 'zh_CN';
  var l2 = locales.length > 1 ? locales[1].key : 'en_US';
  var defaults = {
    'zh_CN': [
      { name: '护理知识',  desc: '假发护理、洗护技巧与保养指南' },
      { name: '时尚趋势',  desc: '全球假发时尚潮流与搭配灵感' },
      { name: '产品评测',  desc: '真实产品使用体验与对比评测' },
      { name: '买家秀',    desc: '买家真实佩戴效果展示与分享' },
      { name: '品牌故事',  desc: '品牌文化理念与幕后精彩故事' },
    ],
    'en_US': [
      { name: 'Hair Care',       desc: 'Wig care, washing tips and maintenance guide' },
      { name: 'Fashion Trends',  desc: 'Global wig fashion trends and styling inspiration' },
      { name: 'Product Review',  desc: 'Real product reviews and comparisons' },
      { name: 'Buyer Showcase',  desc: 'Real buyer wearing showcase and sharing' },
      { name: 'Brand Story',     desc: 'Brand culture philosophy and behind-the-scenes stories' },
    ],
  };
  var handles = ['hair-care', 'fashion-trends', 'product-review', 'buyer-show', 'brand-story'];
  return handles.map(function(h, i) {
    var name = {}, desc = {};
    locales.forEach(function(loc) {
      var row = (defaults[loc.key] || defaults['en_US'] || [[]])[i] || { name: h, desc: '' };
      name[loc.key] = row.name;
      desc[loc.key] = row.desc;
    });
    return { id: 'c' + (i + 1), handle: h, name: name, description: desc, image: '', sortOrder: i + 1 };
  });
}
function catDisplayName(cat) {
  if (!cat || !cat.name) return '';
  var locales = aCatLocales;
  var defKey = locales.length > 0 ? locales[0].key : 'zh_CN';
  return cat.name[defKey] || '';
}
function catDisplayDesc(cat) {
  if (!cat || !cat.description) return '';
  var locales = aCatLocales;
  var defKey = locales.length > 0 ? locales[0].key : 'zh_CN';
  return cat.description[defKey] || '';
}
function persistCategories() { 
  var shopKey = (window.getCurrentShopId ? window.getCurrentShopId() : 'qvr') + '_' + CAT_STORAGE_KEY;
  localStorage.setItem(shopKey, JSON.stringify(categories)); 
}

var allTags = ['发型', '教程', '趋势', '评测', '接发', '护理', '染发', '搭配', '季节'];

// ==================== 列配置 ====================
var articleColumnConfig = [
  { key: 'checkbox', label: '', fixed: 'left', width: '56px', isCheckbox: true, visible: true },
  { key: 'title', label: '文章标题', fixed: 'left', width: '240px', visible: true },
  { key: 'category', label: '分类', width: '120px', visible: true },
  { key: 'tags', label: '标签', width: '160px', visible: true },
  { key: 'locale', label: '语言', width: '80px', visible: true },
  { key: 'readCount', label: '阅读量', width: '100px', visible: true },
  { key: 'status', label: '状态', width: '100px', visible: true },
  { key: 'publishedAt', label: '发布时间', width: '140px', visible: true },
  { key: 'actions', label: '操作', fixed: 'right', width: '6%', alwaysShow: true, isAction: true, visible: true },
];
var articleColumnOrder = articleColumnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
var articleVisibleCols = articleColumnConfig.filter(function(c) { return c.visible && !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
var articleSortField = 'publishedAt';
var articleSortDir = 'desc';
var articlePageSize = 10;
var articleCurrentPage = 1;

function getOrderedVisibleCols() {
  var ordered = [];
  var leftFixed = [], middle = [], rightFixed = [];
  articleColumnConfig.forEach(function(c) {
    if (!c.visible) return;
    if (c.fixed === 'left') leftFixed.push(c);
    else if (c.fixed === 'right') rightFixed.push(c);
    else {
      var idx = articleColumnOrder.indexOf(c.key);
      middle.push({ col: c, order: idx >= 0 ? idx : 999 });
    }
  });
  middle.sort(function(a, b) { return a.order - b.order; });
  return ordered.concat(leftFixed.map(function(c) { return c.key; }), middle.map(function(m) { return m.col.key; }), rightFixed.map(function(c) { return c.key; }));
}

function getStatusBadge(status) {
  var map = {
    'published': { label: '已发布', cls: 'badge-success' },
    'draft': { label: '草稿', cls: 'badge-secondary' },
    'scheduled': { label: '定时', cls: 'badge-warning' },
  };
  var s = map[status] || { label: status, cls: 'badge-secondary' };
  return '<span class="badge ' + s.cls + '">' + s.label + '</span>';
}

function formatReadCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万+';
  return n.toLocaleString();
}

function renderTableHead() {
  var thead = document.getElementById('articleTableHead');
  var ordered = getOrderedVisibleCols();
  var sortableKeys = { 'readCount': true, 'publishedAt': true };
  thead.innerHTML = ordered.map(function(key) {
    var c = articleColumnConfig.find(function(col) { return col.key === key; });
    if (!c) return '';
    var fixedClass = c.fixed ? 'col-fixed-' + c.fixed : '';
    var width = c.width ? 'width:' + c.width + ';' : '';
    if (c.isCheckbox) return '<th class="' + fixedClass + '" style="' + width + '"><div class="checkbox" onclick="toggleAllCheckboxes(this)"></div></th>';
    if (c.isAction) return '<th class="' + fixedClass + '" style="' + width + '">' + c.label + '</th>';
    if (sortableKeys[key]) {
      var sorted = key === articleSortField ? ' sorted' : '';
      var icon = key === articleSortField ? (articleSortDir === 'asc' ? '\u25B2' : '\u25BC') : '';
      return '<th class="sortable' + sorted + ' ' + fixedClass + '" data-sort="' + key + '" style="' + width + '">' + c.label + '<span class="sort-icon">' + icon + '</span></th>';
    }
    return '<th class="' + fixedClass + '" style="' + width + '">' + c.label + '</th>';
  }).join('');
}

function getCurrentFilter() {
  return {
    search: (document.getElementById('articleSearch') && document.getElementById('articleSearch').value) || '',
    status: (document.getElementById('articleStatusFilter') && document.getElementById('articleStatusFilter').value) || '',
    category: (document.getElementById('articleCategoryFilter') && document.getElementById('articleCategoryFilter').value) || '',
    tag: (document.getElementById('articleTagFilter') && document.getElementById('articleTagFilter').value) || '',
  };
}

function renderTable(filter) {
  var tbody = document.getElementById('articleTableBody');
  var filtered = articles.slice();

  // Pin first
  filtered.sort(function(a, b) {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  if (filter) {
    if (filter.search) {
      var s = filter.search.toLowerCase();
      filtered = filtered.filter(function(a) { return a.title.toLowerCase().indexOf(s) !== -1 || a.handle.toLowerCase().indexOf(s) !== -1; });
    }
    if (filter.status) filtered = filtered.filter(function(a) { return a.status === filter.status; });
    if (filter.category) filtered = filtered.filter(function(a) { return a.category === filter.category; });
    if (filter.tag) filtered = filtered.filter(function(a) { return a.tags && a.tags.indexOf(filter.tag) !== -1; });
  }

  // Sort within pinned groups
  filtered.sort(function(a, b) {
    var va, vb;
    if (articleSortField === 'readCount') { va = a.readCount || 0; vb = b.readCount || 0; }
    else if (articleSortField === 'publishedAt') { va = a.publishedAt || ''; vb = b.publishedAt || ''; }
    else { va = a[articleSortField] || ''; vb = b[articleSortField] || ''; }
    // Keep pinned first regardless
    if (a.isPinned && b.isPinned) {
      if (va < vb) return articleSortDir === 'asc' ? -1 : 1;
      if (va > vb) return articleSortDir === 'asc' ? 1 : -1;
      return 0;
    }
    return 0;
  });

  document.getElementById('articleCount').textContent = '(' + filtered.length + '个)';

  var totalPages = Math.ceil(filtered.length / articlePageSize) || 1;
  if (articleCurrentPage > totalPages) articleCurrentPage = totalPages;
  var start = (articleCurrentPage - 1) * articlePageSize;
  var pageData = filtered.slice(start, start + articlePageSize);

  if (filtered.length === 0) {
    var colCount = getOrderedVisibleCols().length;
    tbody.innerHTML = '<tr><td colspan="' + colCount + '"><div class="empty-state"><div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg></div><div class="empty-state-title">暂无匹配文章</div><div class="empty-state-desc">试试调整搜索条件或筛选器</div></div></td></tr>';
    document.getElementById('articlePaginationBtns').innerHTML = '';
    document.getElementById('articlePaginationInfo').textContent = '显示 0 条，共 0 条';
    return;
  }

  tbody.innerHTML = pageData.map(function(a) {
    var ordered = getOrderedVisibleCols();
    var cells = ordered.map(function(key) {
      var c = articleColumnConfig.find(function(col) { return col.key === key; });
      if (!c) return '';
      var fixedClass = c.fixed ? 'col-fixed-' + c.fixed : '';
      var width = c.width ? 'width:' + c.width + ';' : '';
      if (c.isCheckbox) return '<td class="' + fixedClass + '" style="' + width + '"><div class="checkbox" onclick="toggleACheckbox(this)"></div></td>';
      if (c.isAction) {
        return '<td class="' + fixedClass + '" style="' + width + '"><div class="action-group">' +
          '<div class="action-btn" title="预览" onclick="previewArticle(\'' + a.id + '\')">' + svgIcons.eye + '</div>' +
          '<div class="action-btn" title="编辑" onclick="editArticle(\'' + a.id + '\')">' + svgIcons.edit + '</div>' +
          '<div class="action-btn danger" title="删除" onclick="confirmDeleteArticle(\'' + a.id + '\')">' + svgIcons.trash + '</div>' +
          '</div></td>';
      }
      var content = '';
      switch (key) {
        case 'title':
          var pinHtml = a.isPinned ? '<span class="pin-badge">' + svgIcons.pin + ' 置顶</span>' : '';
          content = '<div class="article-cell"><div class="article-cell-icon">' + svgIcons.fileText + '</div><div class="article-cell-info"><div class="article-cell-name">' + a.title + pinHtml + '</div><div class="article-cell-meta">/' + a.handle + '</div></div></div>';
          break;
        case 'category':
          var catObj = categories.find(function(c) { return c.id === a.category; });
          content = '<span style="font-size:13px;">' + catDisplayName(catObj || {}) + '</span>';
          break;
        case 'tags':
          content = (a.tags || []).map(function(t) { return '<span class="tag-badge">' + t + '</span>'; }).join('');
          break;
        case 'locale':
          content = '<span style="font-size:13px;">' + (window.getShopLocaleLabel ? window.getShopLocaleLabel(a.locale) : (a.locale || '—')) + '</span>';
          break;
        case 'readCount':
          var display = a.readCount > 0 ? formatReadCount(a.readCount) : '—';
          content = '<span class="read-count-cell" title="阅读量: ' + a.readCount.toLocaleString() + '"><span class="read-count-icon">👁</span>' + display + '</span>';
          break;
        case 'status':
          content = getStatusBadge(a.status);
          if (a.status === 'scheduled' && a.scheduledAt) {
            content += '<div class="scheduled-info">' + a.scheduledAt.slice(5, 16) + '</div>';
          }
          break;
        case 'publishedAt':
          content = '<span style="font-size:13px;color:hsl(var(--muted-foreground));">' + (a.publishedAt || '—') + '</span>';
          break;
      }
      return '<td class="' + fixedClass + '" style="' + width + '">' + content + '</td>';
    }).join('');
    return '<tr>' + cells + '</tr>';
  }).join('');

  document.getElementById('articlePaginationInfo').textContent = '显示 ' + (start + 1) + '-' + Math.min(start + articlePageSize, filtered.length) + ' 条，共 ' + filtered.length + ' 条';
  var pagHtml = '';
  pagHtml += '<button class="page-btn' + (articleCurrentPage <= 1 ? ' disabled' : '') + '" onclick="agoToPage(1)" ' + (articleCurrentPage <= 1 ? 'disabled' : '') + '>\u00AB</button>';
  pagHtml += '<button class="page-btn' + (articleCurrentPage <= 1 ? ' disabled' : '') + '" onclick="agoToPage(' + (articleCurrentPage - 1) + ')" ' + (articleCurrentPage <= 1 ? 'disabled' : '') + '>\u2039</button>';
  for (var i = 1; i <= totalPages; i++) {
    pagHtml += '<button class="page-btn' + (i === articleCurrentPage ? ' active' : '') + '" onclick="agoToPage(' + i + ')\">' + i + '</button>';
  }
  pagHtml += '<button class="page-btn' + (articleCurrentPage >= totalPages ? ' disabled' : '') + '" onclick="agoToPage(' + (articleCurrentPage + 1) + ')" ' + (articleCurrentPage >= totalPages ? 'disabled' : '') + '>\u203A</button>';
  pagHtml += '<button class="page-btn' + (articleCurrentPage >= totalPages ? ' disabled' : '') + '" onclick="agoToPage(' + totalPages + ')" ' + (articleCurrentPage >= totalPages ? 'disabled' : '') + '>\u00BB</button>';
  document.getElementById('articlePaginationBtns').innerHTML = pagHtml;
}

function agoToPage(page) { articleCurrentPage = page; renderTable(getCurrentFilter()); }
function afilterAndRender() { articleCurrentPage = 1; renderTable(getCurrentFilter()); }
function aresetFilters() {
  document.getElementById('articleSearch').value = '';
  document.getElementById('articleStatusFilter').value = '';
  document.getElementById('articleCategoryFilter').value = '';
  document.getElementById('articleTagFilter').value = '';
  afilterAndRender();
}

function aupdateSelectedCount() {
  var checked = document.querySelectorAll('#articleTableBody .checkbox.checked').length;
  var el = document.getElementById('aSelectedCount');
  if (el) el.textContent = checked;
  ['aBtnBatchPublish', 'aBtnBatchDraft', 'aBtnBatchDelete'].forEach(function(id) {
    var b = document.getElementById(id); if (b) b.disabled = checked === 0;
  });
}
function toggleACheckbox(el) { el.classList.toggle('checked'); el.innerHTML = el.classList.contains('checked') ? '\u2713' : ''; aupdateSelectedCount(); }
function toggleAllCheckboxes(el) {
  var isChecked = !el.classList.contains('checked');
  el.classList.toggle('checked'); el.innerHTML = isChecked ? '\u2713' : '';
  document.querySelectorAll('#articleTableBody .checkbox').forEach(function(cb) { cb.classList.toggle('checked', isChecked); cb.innerHTML = isChecked ? '\u2713' : ''; });
  aupdateSelectedCount();
}

function abatchPublish() { anotify('已批量发布所选项'); }
function abatchDraft() { anotify('已批量设为草稿'); }
function abatchDelete() { if (confirm('确定批量删除所选文章吗？')) anotify('已批量删除所选项'); }

function editArticle(id) { sessionStorage.setItem('editArticleId', id); navigateToPage('content/article_edit.html'); }
function previewArticle(id) { var a = articles.find(function(ar) { return ar.id === id; }); if (a) anotify('预览文章: /blogs/' + a.handle); }
function confirmDeleteArticle(id) {
  var a = articles.find(function(ar) { return ar.id === id; });
  if (!a) return;
  if (confirm('确定删除文章「' + a.title + '」吗？')) {
    articles = articles.filter(function(ar) { return ar.id !== id; });
    renderTable(getCurrentFilter()); anotify('文章「' + a.title + '」已删除');
  }
}

function anotify(msg) {
  if (window.parent && window.parent.showToast) window.parent.showToast('info', msg);
  else if (typeof showToast === 'function') showToast('info', msg);
}

// Sort
document.addEventListener('click', function(e) {
  var th = e.target.closest('th.sortable');
  if (!th) return;
  var key = th.getAttribute('data-sort');
  if (!key) return;
  if (articleSortField === key) articleSortDir = articleSortDir === 'asc' ? 'desc' : 'asc';
  else { articleSortField = key; articleSortDir = 'desc'; }
  renderTableHead(); renderTable(getCurrentFilter());
});

// More actions
function atoggleMoreActions() {
  var dropdown = document.getElementById('aMoreActionsDropdown');
  if (dropdown.classList.contains('show')) { dropdown.classList.remove('show'); return; }
  var btn = document.getElementById('aBtnMoreActions');
  var rect = btn.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + 4) + 'px';
  dropdown.style.left = Math.min(rect.left, window.innerWidth - 170) + 'px';
  dropdown.classList.add('show');
}
document.addEventListener('click', function(e) {
  var d = document.getElementById('aMoreActionsDropdown');
  if (d && !e.target.closest('#aMoreActionsDropdown') && !e.target.closest('#aBtnMoreActions')) d.classList.remove('show');
});

// Custom cols
function abuildCustomColPanel() {
  var body = document.getElementById('aCustomColBody');
  if (!body) return;
  body.innerHTML = articleColumnOrder.map(function(key) {
    var c = articleColumnConfig.find(function(col) { return col.key === key; });
    if (!c) return '';
    var active = c.visible ? ' active' : '';
    return '<div class="custom-col-item' + active + '" data-key="' + c.key + '" draggable="true"><span class="drag-handle">\u22EE\u22EE</span><div class="col-check" onclick="atoggleColumn(this.parentElement, event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><span style="flex:1">' + c.label + '</span></div>';
  }).join('');
  ainitDragEvents();
}
function atoggleColumn(el, e) {
  if (e) e.stopPropagation();
  var key = el.getAttribute('data-key');
  var c = articleColumnConfig.find(function(col) { return col.key === key; });
  if (!c) return;
  c.visible = !c.visible;
  if (c.visible) { el.classList.add('active'); if (articleVisibleCols.indexOf(c.key) === -1) articleVisibleCols.push(c.key); }
  else { el.classList.remove('active'); articleVisibleCols = articleVisibleCols.filter(function(k) { return k !== c.key; }); }
  renderTableHead(); renderTable(getCurrentFilter());
}
function aresetCustomCols() {
  articleColumnOrder = articleColumnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
  articleVisibleCols = articleColumnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
  articleColumnConfig.forEach(function(c) { if (!c.isCheckbox && !c.isAction) c.visible = true; });
  abuildCustomColPanel(); renderTableHead(); renderTable(getCurrentFilter()); anotify('已恢复默认列配置');
}
function atoggleColumnPanel() {
  var panel = document.getElementById('aCustomColPanel');
  if (panel.classList.contains('show')) { panel.classList.remove('show'); panel.style.display = 'none'; return; }
  abuildCustomColPanel();
  var btn = document.getElementById('aBtnCustomCols');
  var rect = btn.getBoundingClientRect();
  panel.style.top = (rect.bottom + 4) + 'px'; panel.style.left = Math.max(8, rect.left - 240 + rect.width) + 'px';
  panel.style.display = 'block'; panel.classList.add('show');
}
document.addEventListener('click', function(e) {
  var p = document.getElementById('aCustomColPanel');
  if (p && !e.target.closest('#aCustomColPanel') && !e.target.closest('#aBtnCustomCols')) { p.classList.remove('show'); p.style.display = 'none'; }
});
function ainitDragEvents() {
  var body = document.getElementById('aCustomColBody'); if (!body) return;
  var items = body.querySelectorAll('.custom-col-item'), draggedItem = null;
  items.forEach(function(item) {
    item.addEventListener('dragstart', function(e) { draggedItem = this; this.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move'; });
    item.addEventListener('dragend', function() { this.style.opacity = '1'; items.forEach(function(it) { it.classList.remove('drag-over'); }); draggedItem = null; });
    item.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (this !== draggedItem) this.classList.add('drag-over'); });
    item.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
    item.addEventListener('drop', function(e) {
      e.preventDefault(); this.classList.remove('drag-over');
      if (this === draggedItem) return;
      var allItems = Array.from(body.querySelectorAll('.custom-col-item'));
      var fi = allItems.indexOf(draggedItem), ti = allItems.indexOf(this);
      if (fi < 0 || ti < 0) return;
      var mv = articleColumnOrder.splice(fi, 1)[0]; articleColumnOrder.splice(ti, 0, mv);
      abuildCustomColPanel(); renderTableHead(); renderTable(getCurrentFilter());
    });
  });
}
function arefreshPage() { renderTable(getCurrentFilter()); anotify('页面已刷新'); }

function switchContentTab(tab) {
  if (tab === 'pages') navigateToPage('content/page_list.html');
  else if (tab === 'articles') navigateToPage('content/article_list.html');
  else if (tab === 'faq') navigateToPage('content/faq_list.html');
}

// ==================== 分类管理对话框 ====================
function generateCatFormFields() {
  var container = document.getElementById('catFormFields');
  if (!container) return;
  var locales = aCatLocales;
  if (locales.length === 0) locales = [{ key: 'zh_CN', label: '中文', flag: '🇨🇳' }, { key: 'en_US', label: 'English', flag: '🇺🇸' }];
  var nameFields = '', descFields = '';
  locales.forEach(function(loc) {
    nameFields += '<div class="form-group" style="flex:1;">' +
      '<label class="form-label">' + (loc.flag || '') + ' ' + loc.label + ' 名称</label>' +
      '<input type="text" class="form-input" id="catName_' + loc.key + '" placeholder="分类名称">' +
    '</div>';
    descFields += '<div class="form-group" style="flex:1;">' +
      '<label class="form-label">' + (loc.flag || '') + ' ' + loc.label + ' 描述</label>' +
      '<textarea class="form-textarea" id="catDesc_' + loc.key + '" placeholder="简要描述" rows="2" style="resize:vertical;min-height:56px;"></textarea>' +
    '</div>';
  });
  container.innerHTML = '<div class="form-row" style="display:flex;gap:12px;">' + nameFields + '</div>' +
    '<div class="form-row" style="display:flex;gap:12px;">' + descFields + '</div>';
}

// --- 分类列表对话框 ---
function openCatListDialog() {
  aCatLocales = window.getShopSupportedLocales ? window.getShopSupportedLocales() : [{ key: 'zh_CN', label: '中文', flag: '🇨🇳' }, { key: 'en_US', label: 'English', flag: '🇺🇸' }];
  catEditingId = null;
  catCoverImageData = null;
  document.getElementById('catListDialogOverlay').style.display = 'flex';
  renderCatList();
}
function closeCatListDialog() {
  document.getElementById('catListDialogOverlay').style.display = 'none';
  catEditingId = null;
  catCoverImageData = null;
}

// --- 添加/编辑分类对话框 ---
function openCatFormDialog(catId) {
  aCatLocales = window.getShopSupportedLocales ? window.getShopSupportedLocales() : [{ key: 'zh_CN', label: '中文', flag: '🇨🇳' }, { key: 'en_US', label: 'English', flag: '🇺🇸' }];
  generateCatFormFields();
  if (catId) {
    // 编辑模式
    var cat = categories.find(function(c) { return c.id === catId; });
    if (cat) {
      catEditingId = catId;
      catCoverImageData = cat.image || null;
      var locales = aCatLocales;
      if (locales.length === 0) locales = [{ key: 'zh_CN' }, { key: 'en_US' }];
      locales.forEach(function(loc) {
        var nEl = document.getElementById('catName_' + loc.key);
        var dEl = document.getElementById('catDesc_' + loc.key);
        if (nEl) nEl.value = cat.name[loc.key] || '';
        if (dEl) dEl.value = (cat.description && cat.description[loc.key]) || '';
      });
      if (catCoverImageData) {
        var thumb = document.getElementById('catCoverThumb');
        thumb.src = catCoverImageData;
        thumb.style.display = 'block';
        document.getElementById('catCoverPlaceholder').style.display = 'none';
        document.getElementById('catCoverRemoveBtn').style.display = 'inline-flex';
      }
      document.getElementById('catFormTitle').textContent = '编辑分类 - ' + catDisplayName(cat);
      document.getElementById('catSubmitBtn').textContent = '保存';
    }
  } else {
    // 新建模式
    catEditingId = null;
    catCoverImageData = null;
    resetCatFormFields();
    document.getElementById('catFormTitle').textContent = '添加新分类';
    document.getElementById('catSubmitBtn').textContent = '添加';
  }
  document.getElementById('catFormDialogOverlay').style.display = 'flex';
}
function closeCatFormDialog() {
  document.getElementById('catFormDialogOverlay').style.display = 'none';
  catEditingId = null;
  catCoverImageData = null;
  openCatListDialog();
}
function resetCatFormFields() {
  catEditingId = null;
  catCoverImageData = null;
  var locales = aCatLocales;
  if (locales.length === 0) locales = [{ key: 'zh_CN', flag: '' }, { key: 'en_US', flag: '' }];
  locales.forEach(function(loc) {
    var nEl = document.getElementById('catName_' + loc.key);
    var dEl = document.getElementById('catDesc_' + loc.key);
    if (nEl) nEl.value = '';
    if (dEl) dEl.value = '';
  });
  var thumb = document.getElementById('catCoverThumb');
  if (thumb) { thumb.style.display = 'none'; thumb.src = ''; }
  var ph = document.getElementById('catCoverPlaceholder');
  if (ph) ph.style.display = 'flex';
  var btn = document.getElementById('catCoverRemoveBtn');
  if (btn) btn.style.display = 'none';
  var input = document.getElementById('catCoverInput');
  if (input) input.value = '';
}
function handleCatCoverFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.match(/^image\//)) { anotify('请选择图片文件'); return; }
  if (file.size > 2 * 1024 * 1024) { anotify('图片大小不能超过 2MB'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    catCoverImageData = e.target.result;
    document.getElementById('catCoverThumb').src = catCoverImageData;
    document.getElementById('catCoverThumb').style.display = 'block';
    document.getElementById('catCoverPlaceholder').style.display = 'none';
    document.getElementById('catCoverRemoveBtn').style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
  input.value = '';
}
function removeCatCover() {
  catCoverImageData = null;
  document.getElementById('catCoverThumb').style.display = 'none';
  document.getElementById('catCoverThumb').src = '';
  document.getElementById('catCoverPlaceholder').style.display = 'flex';
  document.getElementById('catCoverRemoveBtn').style.display = 'none';
}

// --- 列表渲染 ---
function renderCatList() {
  var list = document.getElementById('catManageList');
  if (!list) return;
  if (categories.length === 0) {
    list.innerHTML = '<div style="padding:32px;text-align:center;color:hsl(var(--muted-foreground));font-size:13px;">暂无分类</div>';
    return;
  }
  var articleCounts = {};
  articles.forEach(function(a) { var id = a.category; if (id) articleCounts[id] = (articleCounts[id] || 0) + 1; });
  list.innerHTML = categories.map(function(c) {
    var count = articleCounts[c.id] || 0;
    var coverHtml = c.image
      ? '<img class="cat-cover-thumb" src="' + c.image + '" alt="">'
      : '<div class="cat-cover-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
    var defLocales = aCatLocales;
    if (defLocales.length === 0) defLocales = [{ key: 'zh_CN' }, { key: 'en_US' }];
    var primaryKey = defLocales[0].key;
    var secondaryKey = defLocales.length > 1 ? defLocales[1].key : defLocales[0].key;
    return '<div style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid hsl(var(--border));gap:12px;">' +
      coverHtml +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:13px;font-weight:500;">' + (c.name && c.name[primaryKey]) + '</div>' +
        '<div style="font-size:11px;color:hsl(var(--muted-foreground));">' + (c.name && c.name[secondaryKey]) + '</div>' +
        (catDisplayDesc(c) ? '<div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + catDisplayDesc(c) + '</div>' : '') +
      '</div>' +
      '<div style="font-size:11px;color:hsl(var(--muted-foreground));min-width:40px;text-align:center;">' + count + ' 篇</div>' +
      '<div class="action-group" style="flex-shrink:0;">' +
        '<div class="action-btn" title="编辑" onclick="openCatFormDialog(\'' + c.id + '\')">' + svgIcons.edit + '</div>' +
        '<div class="action-btn danger" title="删除" onclick="deleteCategoryFromDialog(\'' + c.id + '\')">' + svgIcons.trash + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// --- 保存分类 ---
function upsertCategory() {
  var locales = aCatLocales;
  if (locales.length === 0) locales = [{ key: 'zh_CN', label: '中文' }, { key: 'en_US', label: 'English' }];
  var nameData = {}, descData = {};
  locales.forEach(function(loc) {
    var nEl = document.getElementById('catName_' + loc.key);
    var dEl = document.getElementById('catDesc_' + loc.key);
    nameData[loc.key] = nEl ? nEl.value.trim() : '';
    descData[loc.key] = dEl ? dEl.value.trim() : '';
  });
  var primaryKey = locales[0].key;
  var primaryName = nameData[primaryKey] || '';
  if (!primaryName) { anotify('请输入' + locales[0].label + '分类名称'); return; }
  if (catEditingId) {
    var cat = categories.find(function(c) { return c.id === catEditingId; });
    if (cat) {
      locales.forEach(function(loc) { cat.name[loc.key] = nameData[loc.key]; cat.description[loc.key] = descData[loc.key]; });
      cat.image = catCoverImageData || cat.image || '';
      cat.handle = primaryName.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9\\u4e00-\\u9fff-]/g, '');
    }
    anotify('分类已更新');
  } else {
    if (categories.some(function(c) { return c.name[primaryKey] === primaryName; })) { anotify('分类「' + primaryName + '」已存在'); return; }
    var handle = primaryName.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9\\u4e00-\\u9fff-]/g, '');
    var maxOrder = categories.reduce(function(m, c) { return Math.max(m, c.sortOrder || 0); }, 0);
    categories.push({
      id: 'c' + (Date.now()),
      handle: handle,
      name: nameData,
      description: descData,
      image: catCoverImageData || '',
      sortOrder: maxOrder + 1
    });
    anotify('分类「' + primaryName + '」已添加');
  }
  persistCategories();
  buildCategoryFilter();
  closeCatFormDialog();
}
function deleteCategoryFromDialog(id) {
  var cat = categories.find(function(c) { return c.id === id; });
  if (!cat) return;
  var hasArticles = articles.some(function(a) { return a.category === id; });
  if (hasArticles) { anotify('分类「' + catDisplayName(cat) + '」下有文章，无法删除'); return; }
  if (!confirm('确定删除分类「' + catDisplayName(cat) + '」吗？')) return;
  categories = categories.filter(function(c) { return c.id !== id; });
  if (catEditingId === id) catEditingId = null;
  persistCategories();
  renderCatList();
  buildCategoryFilter();
  anotify('分类已删除');
}

// ESC 关闭对话框
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var formDlg = document.getElementById('catFormDialogOverlay');
    if (formDlg && formDlg.style.display === 'flex') { closeCatFormDialog(); return; }
    var listDlg = document.getElementById('catListDialogOverlay');
    if (listDlg && listDlg.style.display === 'flex') { closeCatListDialog(); return; }
  }
});

// Build category filter options
function buildCategoryFilter() {
  var sel = document.getElementById('articleCategoryFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">全部分类</option>' + categories.map(function(c) { return '<option value="' + c.id + '">' + catDisplayName(c) + '</option>'; }).join('');
}
function buildTagFilter() {
  var sel = document.getElementById('articleTagFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">全部标签</option>' + allTags.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
}

function ainit() {
  aCatLocales = window.getShopSupportedLocales ? window.getShopSupportedLocales() : [{ key: 'zh_CN', label: '中文', flag: '🇨🇳' }, { key: 'en_US', label: 'English', flag: '🇺🇸' }];
  var shopKey = (window.getCurrentShopId ? window.getCurrentShopId() : 'qvr') + '_' + CAT_STORAGE_KEY;
  var stored = JSON.parse(localStorage.getItem(shopKey));
  if (stored && stored.length) { categories = stored; }
  else { categories = getDefaultArticleCategories(); }
  buildCategoryFilter();
  buildTagFilter();
  abuildCustomColPanel();
  renderTableHead();
  renderTable(getCurrentFilter());
  var s = document.getElementById('articleSearch'); if (s) s.addEventListener('input', afilterAndRender);
  var st = document.getElementById('articleStatusFilter'); if (st) st.addEventListener('change', afilterAndRender);
  var ct = document.getElementById('articleCategoryFilter'); if (ct) ct.addEventListener('change', afilterAndRender);
  var tg = document.getElementById('articleTagFilter'); if (tg) tg.addEventListener('change', afilterAndRender);
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', ainit); }
else { ainit(); }
