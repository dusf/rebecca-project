// ==================== FAQ 帮助中心列表 - JS ====================

var svgIconsFaq = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  helpCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
};

// ==================== 模拟数据 ====================
var faqGroups = [
  { id: 'G001', name: '尺码相关', sortOrder: 1 },
  { id: 'G002', name: '护理与保养', sortOrder: 2 },
  { id: 'G003', name: '配送与物流', sortOrder: 3 },
  { id: 'G004', name: '退换货政策', sortOrder: 4 },
  { id: 'G005', name: '付款与结算', sortOrder: 5 },
];

var faqs = [
  { id: 'F001', question: '如何正确测量头围？', handle: 'how-to-measure-head', groupId: 'G001', groupName: '尺码相关', status: 'published', sortOrder: 1, publishedAt: '2026-07-20', body: '<p>使用软尺绕头一周...</p>' },
  { id: 'F002', question: '尺码对照表', handle: 'size-chart', groupId: 'G001', groupName: '尺码相关', status: 'published', sortOrder: 2, publishedAt: '2026-07-20', body: '<p>详细尺码对照...</p>' },
  { id: 'F003', question: '头围测量常见误区', handle: 'measure-mistakes', groupId: 'G001', groupName: '尺码相关', status: 'draft', sortOrder: 3, publishedAt: null, body: '' },
  { id: 'F004', question: '假发日常护理步骤', handle: 'daily-wig-care', groupId: 'G002', groupName: '护理与保养', status: 'published', sortOrder: 1, publishedAt: '2026-07-19', body: '<p>日常护理步骤包含...</p>' },
  { id: 'F005', question: '护理精油使用方法', handle: 'oil-usage', groupId: 'G002', groupName: '护理与保养', status: 'published', sortOrder: 2, publishedAt: '2026-07-18', body: '<p>正确使用精油...</p>' },
  { id: 'F006', question: '假发可以染发吗？', handle: 'can-wig-dye', groupId: 'G002', groupName: '护理与保养', status: 'published', sortOrder: 3, publishedAt: '2026-07-15', body: '<p>人发假发可以染色...</p>' },
  { id: 'F007', question: '发货时间是多久？', handle: 'shipping-time', groupId: 'G003', groupName: '配送与物流', status: 'published', sortOrder: 1, publishedAt: '2026-07-10', body: '<p>工作日48小时内发货...</p>' },
  { id: 'F008', question: '如何追踪我的订单？', handle: 'track-order', groupId: 'G003', groupName: '配送与物流', status: 'published', sortOrder: 2, publishedAt: '2026-07-08', body: '<p>通过订单号追踪...</p>' },
  { id: 'F009', question: '如何申请退换货？', handle: 'return-process', groupId: 'G004', groupName: '退换货政策', status: 'published', sortOrder: 1, publishedAt: '2026-07-05', body: '<p>30天内可申请退换...</p>' },
  { id: 'F010', question: '退换货费用谁承担？', handle: 'return-cost', groupId: 'G004', groupName: '退换货政策', status: 'draft', sortOrder: 2, publishedAt: null, body: '' },
  { id: 'F011', question: '支持哪些支付方式？', handle: 'payment-methods', groupId: 'G005', groupName: '付款与结算', status: 'published', sortOrder: 1, publishedAt: '2026-07-01', body: '<p>支持信用卡、PayPal...</p>' },
  { id: 'F012', question: '支付安全吗？', handle: 'payment-security', groupId: 'G005', groupName: '付款与结算', status: 'published', sortOrder: 2, publishedAt: '2026-06-25', body: '<p>使用SSL加密...</p>' },
];

// ==================== 列配置 ====================
var faqColumnConfig = [
  { key: 'checkbox', label: '', fixed: 'left', width: '56px', isCheckbox: true, visible: true },
  { key: 'question', label: '问题标题', fixed: 'left', width: '280px', visible: true },
  { key: 'groupName', label: '所属分类', width: '140px', visible: true },
  { key: 'status', label: '状态', width: '100px', visible: true },
  { key: 'publishedAt', label: '更新时间', width: '140px', visible: true },
  { key: 'actions', label: '操作', fixed: 'right', width: '6%', alwaysShow: true, isAction: true, visible: true },
];
var faqColumnOrder = faqColumnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
var faqVisibleCols = faqColumnConfig.filter(function(c) { return c.visible && !c.isCheckbox && !c.isAction; }).map(function(c) { return c.key; });
var faqSortField = 'publishedAt';
var faqSortDir = 'desc';

function getFaqOrderedCols() {
  var ordered = [], leftFixed = [], middle = [], rightFixed = [];
  faqColumnConfig.forEach(function(c) {
    if (!c.visible) return;
    if (c.fixed === 'left') leftFixed.push(c);
    else if (c.fixed === 'right') rightFixed.push(c);
    else { var idx = faqColumnOrder.indexOf(c.key); middle.push({ col: c, order: idx >= 0 ? idx : 999 }); }
  });
  middle.sort(function(a, b) { return a.order - b.order; });
  return ordered.concat(leftFixed.map(function(c) { return c.key; }), middle.map(function(m) { return m.col.key; }), rightFixed.map(function(c) { return c.key; }));
}

function faqGetStatusBadge(status) {
  var map = { 'published': { label: '已发布', cls: 'badge-success' }, 'draft': { label: '草稿', cls: 'badge-secondary' } };
  var s = map[status] || { label: status, cls: 'badge-secondary' };
  return '<span class="badge ' + s.cls + '">' + s.label + '</span>';
}

// ==================== 渲染 FAQ 列表（按分类分组） ====================
function renderFaqTable(filter) {
  var tbody = document.getElementById('faqTableBody');
  var filtered = faqs.slice();
  if (filter) {
    if (filter.search) {
      var s = filter.search.toLowerCase();
      filtered = filtered.filter(function(f) { return f.question.toLowerCase().indexOf(s) !== -1 || f.handle.toLowerCase().indexOf(s) !== -1; });
    }
    if (filter.status) filtered = filtered.filter(function(f) { return f.status === filter.status; });
    if (filter.groupId) filtered = filtered.filter(function(f) { return f.groupId === filter.groupId; });
  }

  // Sort: by group sortOrder, then by faq sortOrder within group
  filtered.sort(function(a, b) {
    var ga = faqGroups.find(function(g) { return g.id === a.groupId; });
    var gb = faqGroups.find(function(g) { return g.id === b.groupId; });
    var gsA = ga ? ga.sortOrder : 999;
    var gsB = gb ? gb.sortOrder : 999;
    if (gsA !== gsB) return gsA - gsB;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  document.getElementById('faqCount').textContent = '(' + filtered.length + '个)';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="empty-state-title">暂无匹配帮助条目</div><div class="empty-state-desc">试试调整搜索条件或筛选器</div></div></td></tr>';
    return;
  }

  // Group by category
  var grouped = {};
  filtered.forEach(function(f) {
    var gid = f.groupId;
    if (!grouped[gid]) grouped[gid] = [];
    grouped[gid].push(f);
  });

  var html = '';
  var ordered = getFaqOrderedCols();
  var colSpan = ordered.length;

  Object.keys(grouped).forEach(function(gid) {
    var group = faqGroups.find(function(g) { return g.id === gid; });
    var groupName = group ? group.name : gid;
    var items = grouped[gid];

    html += '<tr class="faq-group-header" onclick="toggleFaqGroup(this)" data-group="' + gid + '">';
    html += '<td colspan="' + colSpan + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<span class="faq-group-arrow expanded">' + svgIconsFaq.chevron + '</span>';
    html += '<span class="faq-group-name">' + groupName + '</span>';
    html += '<span class="faq-group-count">' + items.length + ' 条</span>';
    html += '</div></td></tr>';

    html += '<tbody class="faq-group-children" data-group="' + gid + '">';
    items.forEach(function(f) {
      var cells = ordered.map(function(key) {
        var c = faqColumnConfig.find(function(col) { return col.key === key; });
        if (!c) return '';
        var fixedClass = c.fixed ? 'col-fixed-' + c.fixed : '';
        var width = c.width ? 'width:' + c.width + ';' : '';
        if (c.isCheckbox) return '<td class="' + fixedClass + '" style="' + width + '"><div class="checkbox" onclick="faqToggleCheckbox(this)"></div></td>';
        if (c.isAction) {
          return '<td class="' + fixedClass + '" style="' + width + '"><div class="action-group">' +
            '<div class="action-btn" title="编辑" onclick="editFaq(\'' + f.id + '\')">' + svgIconsFaq.edit + '</div>' +
            '<div class="action-btn danger" title="删除" onclick="confirmDeleteFaq(\'' + f.id + '\')">' + svgIconsFaq.trash + '</div>' +
            '</div></td>';
        }
        var content = '';
        switch (key) {
          case 'question':
            content = '<div class="faq-question-cell">' + svgIconsFaq.helpCircle + ' ' + f.question + '</div>';
            break;
          case 'groupName':
            content = '<span style="font-size:13px;">' + f.groupName + '</span>';
            break;
          case 'status':
            content = faqGetStatusBadge(f.status);
            break;
          case 'publishedAt':
            content = '<span style="font-size:13px;color:hsl(var(--muted-foreground));">' + (f.publishedAt || '—') + '</span>';
            break;
        }
        return '<td class="' + fixedClass + '" style="' + width + '">' + content + '</td>';
      }).join('');
      html += '<tr>' + cells + '</tr>';
    });
    html += '</tbody>';
  });

  tbody.innerHTML = html;
}

function toggleFaqGroup(el) {
  var gid = el.getAttribute('data-group');
  var children = document.querySelector('.faq-group-children[data-group="' + gid + '"]');
  var arrow = el.querySelector('.faq-group-arrow');
  if (children) children.classList.toggle('collapsed');
  if (arrow) arrow.classList.toggle('expanded');
}

// ==================== 筛选 ====================
function getFaqFilter() {
  return {
    search: (document.getElementById('faqSearch') && document.getElementById('faqSearch').value) || '',
    status: (document.getElementById('faqStatusFilter') && document.getElementById('faqStatusFilter').value) || '',
    groupId: (document.getElementById('faqGroupFilter') && document.getElementById('faqGroupFilter').value) || '',
  };
}
function faqFilterAndRender() { renderFaqTable(getFaqFilter()); }
function faqResetFilters() {
  document.getElementById('faqSearch').value = '';
  document.getElementById('faqStatusFilter').value = '';
  document.getElementById('faqGroupFilter').value = '';
  faqFilterAndRender();
}

// Checkbox
function faqUpdateSelectedCount() {
  var checked = document.querySelectorAll('#faqTableBody .checkbox.checked').length;
  var el = document.getElementById('faqSelectedCount');
  if (el) el.textContent = checked;
  ['faqBtnBatchPublish', 'faqBtnBatchDraft', 'faqBtnBatchDelete'].forEach(function(id) {
    var b = document.getElementById(id); if (b) b.disabled = checked === 0;
  });
}
function faqToggleCheckbox(el) { el.classList.toggle('checked'); el.innerHTML = el.classList.contains('checked') ? '\u2713' : ''; faqUpdateSelectedCount(); }

function faqBatchPublish() { faqNotify('已批量发布所选项'); }
function faqBatchDraft() { faqNotify('已批量设为草稿'); }
function faqBatchDelete() { if (confirm('确定批量删除所选帮助条目吗？')) faqNotify('已批量删除所选项'); }

function editFaq(id) { sessionStorage.setItem('editFaqId', id); navigateToPage('content/faq_edit.html'); }
function confirmDeleteFaq(id) {
  var f = faqs.find(function(fr) { return fr.id === id; });
  if (!f) return;
  if (confirm('确定删除帮助条目「' + f.question + '」吗？')) {
    faqs = faqs.filter(function(fr) { return fr.id !== id; });
    renderFaqTable(getFaqFilter()); faqNotify('帮助条目已删除');
  }
}
function faqNotify(msg) {
  if (window.parent && window.parent.showToast) window.parent.showToast('info', msg);
  else if (typeof showToast === 'function') showToast('info', msg);
}
function faqRefresh() { renderFaqTable(getFaqFilter()); faqNotify('页面已刷新'); }

// ==================== 分类管理全屏对话框 ====================
function openFaqCategoryDialog() {
  var html = buildFaqCategoryDialog();
  faqOpenDialog(html);
}

function buildFaqCategoryDialog() {
  var rows = faqGroups.map(function(g, idx) {
    var count = faqs.filter(function(f) { return f.groupId === g.id; }).length;
    return '<tr><td><span class="sort-number">' + (idx + 1) + '</span></td><td><strong>' + g.name + '</strong></td><td><span class="faq-count-badge">' + count + ' 条</span></td><td><div class="action-group"><div class="action-btn" onclick="editFaqCategory(\'' + g.id + '\')">' + svgIconsFaq.edit + '</div><div class="action-btn danger" onclick="deleteFaqCategory(\'' + g.id + '\')">' + svgIconsFaq.trash + '</div></div></td></tr>';
  }).join('');

  return '<div class="content-dialog-overlay" onclick="if(event.target===this)faqCloseDialog()"><div class="content-dialog" style="width:640px;"><div class="content-dialog-header">' +
    '<span class="content-dialog-title">帮助分类管理</span>' +
    '<button class="content-dialog-close" onclick="faqCloseDialog()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div><div class="content-dialog-body">' +
    '<button class="btn btn-primary btn-sm" onclick="addFaqCategory()" style="margin-bottom:16px;">+ 新建分类</button>' +
    '<table class="faq-cat-table"><thead><tr><th style="width:60px;">排序</th><th>分类名称</th><th style="width:100px;">条目数</th><th style="width:6%;">操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '</div><div class="content-dialog-actions"><button class="btn btn-secondary btn-sm" onclick="faqCloseDialog()">关闭</button></div></div></div>';
}

function addFaqCategory() {
  var name = prompt('请输入分类名称：', '');
  if (!name) return;
  faqGroups.push({ id: 'G' + Date.now(), name: name, sortOrder: faqGroups.length + 1 });
  faqCloseDialog();
  openFaqCategoryDialog();
  faqNotify('分类「' + name + '」已添加');
}

function editFaqCategory(id) {
  var g = faqGroups.find(function(gr) { return gr.id === id; });
  if (!g) return;
  var name = prompt('编辑分类名称：', g.name);
  if (!name) return;
  g.name = name;
  // Update faqs' groupName
  faqs.forEach(function(f) { if (f.groupId === id) f.groupName = name; });
  faqCloseDialog();
  openFaqCategoryDialog();
  renderFaqTable(getFaqFilter());
  faqNotify('分类已更新');
}

function deleteFaqCategory(id) {
  var g = faqGroups.find(function(gr) { return gr.id === id; });
  if (!g) return;
  var count = faqs.filter(function(f) { return f.groupId === id; }).length;
  if (count > 0) { faqNotify('该分类下有 ' + count + ' 条FAQ，请先转移或删除'); return; }
  if (!confirm('确定删除分类「' + g.name + '」吗？')) return;
  faqGroups = faqGroups.filter(function(gr) { return gr.id !== id; });
  faqCloseDialog();
  openFaqCategoryDialog();
  faqNotify('分类已删除');
}

function faqOpenDialog(html) {
  faqCloseDialog();
  var overlay = document.createElement('div');
  overlay.id = 'faqDialogRoot'; overlay.innerHTML = html;
  document.body.appendChild(overlay.firstElementChild);
}
function faqCloseDialog() { var el = document.querySelector('.content-dialog-overlay'); if (el) el.remove(); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') faqCloseDialog(); });

// ==================== More actions ====================
function faqToggleMoreActions() {
  var d = document.getElementById('faqMoreActionsDropdown');
  if (d.classList.contains('show')) { d.classList.remove('show'); return; }
  var btn = document.getElementById('faqBtnMoreActions');
  var rect = btn.getBoundingClientRect();
  d.style.top = (rect.bottom + 4) + 'px'; d.style.left = Math.min(rect.left, window.innerWidth - 170) + 'px';
  d.classList.add('show');
}
document.addEventListener('click', function(e) {
  var d = document.getElementById('faqMoreActionsDropdown');
  if (d && !e.target.closest('#faqMoreActionsDropdown') && !e.target.closest('#faqBtnMoreActions')) d.classList.remove('show');
});

// ==================== Custom cols ====================
function faqBuildCustomColPanel() {
  var body = document.getElementById('faqCustomColBody');
  if (!body) return;
  body.innerHTML = faqColumnOrder.map(function(key) {
    var c = faqColumnConfig.find(function(col) { return col.key === key; });
    if (!c) return '';
    var active = c.visible ? ' active' : '';
    return '<div class="custom-col-item' + active + '" data-key="' + c.key + '" draggable="true"><span class="drag-handle">\u22EE\u22EE</span><div class="col-check" onclick="faqToggleColumn(this.parentElement, event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><span style="flex:1">' + c.label + '</span></div>';
  }).join('');
}
function faqToggleColumn(el, e) {
  if (e) e.stopPropagation();
  var key = el.getAttribute('data-key');
  var c = faqColumnConfig.find(function(col) { return col.key === key; });
  if (!c) return;
  c.visible = !c.visible;
  if (c.visible) { el.classList.add('active'); } else { el.classList.remove('active'); }
  renderFaqTable(getFaqFilter());
}
function faqResetCustomCols() {
  faqColumnConfig.forEach(function(c) { if (!c.isCheckbox && !c.isAction) c.visible = true; });
  faqBuildCustomColPanel(); renderFaqTable(getFaqFilter()); faqNotify('已恢复默认列配置');
}
function faqToggleColumnPanel() {
  var panel = document.getElementById('faqCustomColPanel');
  if (panel.classList.contains('show')) { panel.classList.remove('show'); panel.style.display = 'none'; return; }
  faqBuildCustomColPanel();
  var btn = document.getElementById('faqBtnCustomCols');
  var rect = btn.getBoundingClientRect();
  panel.style.top = (rect.bottom + 4) + 'px'; panel.style.left = Math.max(8, rect.left - 240 + rect.width) + 'px';
  panel.style.display = 'block'; panel.classList.add('show');
}
document.addEventListener('click', function(e) {
  var p = document.getElementById('faqCustomColPanel');
  if (p && !e.target.closest('#faqCustomColPanel') && !e.target.closest('#faqBtnCustomCols')) { p.classList.remove('show'); p.style.display = 'none'; }
});

// ==================== Tab 导航 ====================
function switchContentTab(tab) {
  if (tab === 'pages') navigateToPage('content/page_list.html');
  else if (tab === 'articles') navigateToPage('content/article_list.html');
  else if (tab === 'faq') navigateToPage('content/faq_list.html');
}

// Build filter dropdowns
function buildFaqGroupFilter() {
  var sel = document.getElementById('faqGroupFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">全部分类</option>' + faqGroups.map(function(g) { return '<option value="' + g.id + '">' + g.name + '</option>'; }).join('');
}

function faqInit() {
  buildFaqGroupFilter();
  faqBuildCustomColPanel();
  renderFaqTable(getFaqFilter());
  var s = document.getElementById('faqSearch'); if (s) s.addEventListener('input', faqFilterAndRender);
  var st = document.getElementById('faqStatusFilter'); if (st) st.addEventListener('change', faqFilterAndRender);
  var gr = document.getElementById('faqGroupFilter'); if (gr) gr.addEventListener('change', faqFilterAndRender);
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', faqInit); }
else { faqInit(); }
