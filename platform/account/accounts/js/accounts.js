// ====== 中台账号页面 ======
// 手机号作为登录账号，邮箱为非必填项，管理员在中台给他人开设账号

// ====== PU_CONFIG ======
window.PU_CONFIG = {
  tbodId: 'accountTableBody',
  columns: [
    { key: 'phone',     label: '手机号',   defaultShow: true,  alwaysShow: true  },
    { key: 'name',      label: '姓名',     defaultShow: true,  alwaysShow: false },
    { key: 'org',       label: '组织',     defaultShow: true,  alwaysShow: false },
    { key: 'email',     label: '邮箱',     defaultShow: false, alwaysShow: false },
    { key: 'createdAt', label: '创建时间', defaultShow: true,  alwaysShow: false },
    { key: 'status',    label: '状态',     defaultShow: true,  alwaysShow: true  },
    { key: 'actions',   label: '操作',     defaultShow: true,  alwaysShow: true  }
  ],
  visibleCols: ['phone','name','org','email','createdAt','status','actions'],
  batchActions: [
    { name: 'enable',  handler: batchEnable  },
    { name: 'disable', handler: batchDisable },
    { name: 'delete',  handler: batchDelete  }
  ],
  moreActions: [
    { name: 'resetPwd', handler: function() { showToast('info', '批量重置密码'); } },
    { name: 'export',   handler: function() { showToast('info', '导出选中账号'); } }
  ],
  onColumnsChange: function() { renderTable(); }
};

// ====== 示例数据 ======
var accountData = [
  { id: 1, phone: '13800138000', name: '系统管理员', org: '瑞贝卡集团/瑞贝卡科技/技术研发部', email: 'admin@example.com', password: '***', status: 'active',   createdAt: '2026-07-01' },
  { id: 2, phone: '13800138001', name: '张三',       org: '瑞贝卡集团/瑞贝卡科技/产品设计部', email: '',                      password: '***', status: 'active',   createdAt: '2026-07-03' },
  { id: 3, phone: '13800138002', name: '李四',       org: '瑞贝卡集团/瑞贝卡电商/运营部',     email: 'lisi@example.com',    password: '***', status: 'active',   createdAt: '2026-07-05' },
  { id: 4, phone: '13800138003', name: '王五',       org: '瑞贝卡集团/瑞贝卡电商/客服部',     email: '',                      password: '***', status: 'disabled', createdAt: '2026-07-06' },
  { id: 5, phone: '13800138004', name: '赵六',       org: '瑞贝卡集团/瑞贝卡科技/技术研发部', email: 'zhaoliu@example.com', password: '***', status: 'active',   createdAt: '2026-07-08' }
];

var sortField = 'createdAt';
var sortDir = 'desc';
var currentPage = 1;
var pageSize = 10;
var filteredData = [];
var nextAcctId = 6;

// ====== 排序 ======
function sortAccounts(data) {
  return data.slice().sort(function(a, b) {
    var va = a[sortField] || '', vb = b[sortField] || '';
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

function updateSortIcons() {
  var ths = document.querySelectorAll('th[data-sort]');
  ths.forEach(function(th) {
    var key = th.getAttribute('data-sort');
    var icon = th.querySelector('.sort-icon');
    th.classList.toggle('sorted', key === sortField);
    if (icon) icon.textContent = (key === sortField) ? (sortDir === 'asc' ? '▲' : '▼') : '';
  });
}

// ====== 过滤 ======
function filterAccounts() {
  currentPage = 1;
  renderTable();
}

// ====== 渲染表格 ======
function renderTable() {
  var data = accountData.slice();
  var search = (document.getElementById('accountSearch') || {}).value || '';
  var status = (document.getElementById('statusFilter') || {}).value || '';

  if (search) {
    var s = search.toLowerCase();
    data = data.filter(function(a) {
      return a.phone.toLowerCase().indexOf(s) !== -1 ||
             a.name.toLowerCase().indexOf(s) !== -1 ||
             (a.email || '').toLowerCase().indexOf(s) !== -1;
    });
  }
  if (status) {
    data = data.filter(function(a) { return a.status === status; });
  }

  data = sortAccounts(data);
  updateSortIcons();
  filteredData = data;

  var pageData = puSlicePage(data, currentPage, pageSize);
  var tbody = document.getElementById('accountTableBody');
  var cols = window.PU_CONFIG.visibleCols;
  var checkedIds = puSaveCheckedIds('accountTableBody');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="' + (cols.length + 1) + '"><div class="empty-state"><div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="empty-state-title">暂无匹配账号</div><div class="empty-state-desc">试试调整搜索条件或筛选器</div></div></td></tr>';
    puUpdateBulkBar();
    document.getElementById('accountsPagination').innerHTML = '';
    return;
  }

  var editIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var statusMap = { active: { label: '启用', cls: 'badge-success' }, disabled: { label: '停用', cls: 'badge-secondary' } };

  tbody.innerHTML = pageData.map(function(a) {
    var s = statusMap[a.status] || { label: a.status, cls: 'badge-secondary' };
    var cells = '';
    cols.forEach(function(key) {
      if (key === 'phone')     cells += '<td><strong>' + a.phone + '</strong></td>';
      else if (key === 'name') cells += '<td>' + a.name + '</td>';
      else if (key === 'org')  cells += '<td>' + a.org + '</td>';
      else if (key === 'email') cells += '<td style="color:hsl(var(--muted-foreground))">' + (a.email || '--') + '</td>';
      else if (key === 'createdAt') cells += '<td style="color:hsl(var(--muted-foreground))">' + a.createdAt + '</td>';
      else if (key === 'status') cells += '<td><span class="badge ' + s.cls + '">' + s.label + '</span></td>';
      else if (key === 'actions') cells += '<td><div class="action-group"><div class="action-btn" title="编辑" onclick="handleEdit(' + a.id + ')">' + editIcon + '</div><div class="action-btn danger" title="删除" onclick="handleDelete(' + a.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div></div></td>';
    });
    return '<tr data-id="' + a.id + '">' +
      '<td><div class="checkbox" onclick="puToggleCheckbox(this)"></div></td>' +
      cells +
    '</tr>';
  }).join('');

  puRestoreCheckedIds('accountTableBody', checkedIds);
  puBuildCustomColPanel(window.PU_CONFIG.columns, window.PU_CONFIG.visibleCols);
  puRenderPagination({
    total: data.length,
    pageSize: pageSize,
    currentPage: currentPage,
    containerId: 'accountsPagination',
    onPageChange: function(page) { currentPage = page; renderTable(); }
  });
}

// ====== 打开添加/编辑对话框（委托给父页面） ======
function handleAdd() {
  if (window.parent && window.parent.openAcctFormDialog) {
    window.parent.openAcctFormDialog('add', null);
  }
}

function handleEdit(id) {
  if (window.parent && window.parent.openAcctFormDialog) {
    window.parent.openAcctFormDialog('edit', id);
  }
}

function handleDelete(id) {
  var acct = findAcct(id);
  if (!acct) return;
  if (!confirm('确定要删除账号「' + acct.name + '（' + acct.phone + '）」吗？此操作不可恢复。')) return;
  accountData = accountData.filter(function(a) { return a.id !== id; });
  renderTable();
  showToast('success', '账号已删除');
}

// ====== 供父页面调用的数据处理函数 ======

/** 查找账号 */
function findAcct(id) {
  for (var i = 0; i < accountData.length; i++) {
    if (accountData[i].id === id) return accountData[i];
  }
  return null;
}

/** 添加账号（由父页面对话框提交触发） */
window.acctAddItem = function(phone, name, password, org, email, status) {
  accountData.push({
    id: nextAcctId++,
    phone: phone,
    name: name,
    org: org,
    email: email || '',
    password: password,
    status: status,
    createdAt: new Date().toISOString().slice(0, 10)
  });
  showToast('success', '账号添加成功');
};

/** 更新账号（由父页面对话框提交触发） */
window.acctUpdateItem = function(id, phone, name, password, org, email, status) {
  var acct = findAcct(id);
  if (!acct) { showToast('error', '账号不存在'); return; }
  acct.phone = phone;
  acct.name = name;
  acct.org = org;
  acct.email = email || '';
  if (password) acct.password = password;
  acct.status = status;
  showToast('success', '账号保存成功');
};

// ====== 批量操作 ======
function batchEnable(ids) {
  var count = 0;
  ids.forEach(function(id) { var a = findAcct(id); if (a && a.status !== 'active') { a.status = 'active'; count++; } });
  renderTable();
  showToast('success', '已启用 ' + count + ' 个账号');
}

function batchDisable(ids) {
  var count = 0;
  ids.forEach(function(id) { var a = findAcct(id); if (a && a.status !== 'disabled') { a.status = 'disabled'; count++; } });
  renderTable();
  showToast('success', '已停用 ' + count + ' 个账号');
}

function batchDelete(ids) {
  accountData = accountData.filter(function(a) { return ids.indexOf(a.id) === -1; });
  renderTable();
  showToast('success', '已删除 ' + ids.length + ' 个账号');
}

// ====== 组织数据（供对话框使用） ======
window.acctGetOrgData = function() {
  var fw = window.parent.getFW ? window.parent.getFW() : null;
  return fw && fw.orgData ? fw.orgData : [];
};

// ====== 排序点击事件 ======
document.addEventListener('click', function(e) {
  var th = e.target.closest('th.sortable');
  if (!th) return;
  var key = th.getAttribute('data-sort');
  if (!key) return;
  if (sortField === key) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = key;
    sortDir = 'desc';
  }
  currentPage = 1;
  renderTable();
});

// ====== 初始化 ======
document.addEventListener('DOMContentLoaded', function() {
  renderTable();
});

function refreshPage() {
  renderTable();
  showToast('success', '数据已刷新');
}
