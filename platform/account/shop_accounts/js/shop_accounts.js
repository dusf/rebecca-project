// ==================== 商城账号（成员管理） ====================

// 颜色库
var MEMBER_COLORS = ['#D4845A', '#8B9A7C', '#7C8B9A', '#B4846C', '#9A8B7C', '#6C8B84'];

// 示例店铺
var mockShops = [
  { id: 'shop_1', name: '瑞贝卡官方旗舰店', domain: 'rebecca.tmall.com', color: '#D4845A' },
  { id: 'shop_2', name: '瑞贝卡数码专营店', domain: 'rebecca-digital.tmall.com', color: '#8B9A7C' },
  { id: 'shop_3', name: '瑞贝卡家居生活馆', domain: 'rebecca-home.tmall.com', color: '#7C8B9A' },
  { id: 'shop_4', name: '瑞贝卡美妆优选', domain: 'rebecca-beauty.tmall.com', color: '#B4846C' }
];

// 示例成员数据
var memberData = [
  { id: 'member_1', accountId: 'AC20260700001', name: '系统管理员', phone: '13800138000', org: '瑞贝卡集团/瑞贝卡科技/技术研发部', stores: ['shop_1'], joinedAt: '2026-07-01 09:30' },
  { id: 'member_2', accountId: 'AC20260700002', name: '张三', phone: '13800138001', org: '瑞贝卡集团/瑞贝卡科技/产品设计部', stores: ['shop_2'], joinedAt: '2026-07-03 14:20' },
  { id: 'member_3', accountId: 'AC20260700003', name: '李四', phone: '13800138002', org: '瑞贝卡集团/瑞贝卡电商/运营部', stores: [], joinedAt: '2026-07-05 11:00' },
  { id: 'member_4', accountId: 'AC20260700004', name: '王五', phone: '13800138003', org: '瑞贝卡集团/瑞贝卡电商/客服部', stores: ['shop_3'], joinedAt: '2026-07-06 16:45' },
  { id: 'member_5', accountId: 'AC20260700005', name: '赵六', phone: '13800138004', org: '瑞贝卡集团/瑞贝卡科技/技术研发部', stores: ['shop_1', 'shop_2'], joinedAt: '2026-07-08 08:15' }
];

var currentPage = 1;
var pageSize = 10;
var selectedMemberIds = [];
var sortField = 'joinedAt';
var sortDir = 'desc';

// 自定义列可见性
var columnsVisible = {
  info: true,
  phone: true,
  org: true,
  stores: true,
  joinedAt: true,
  action: true
};

function loadMembers() {
  return memberData;
}

function loadShops() {
  return mockShops;
}

function getShopById(id) {
  return mockShops.find(function(s) { return s.id === id; }) || null;
}

function getDeduplicatedStores(member) {
  if (!member.stores) return [];
  var seen = {};
  return member.stores.filter(function(s) {
    if (seen[s]) return false;
    seen[s] = true;
    return true;
  }).map(function(s) { return getShopById(s); }).filter(Boolean);
}

function updateBatchBar() {
  var countEl = document.getElementById('batchCount');
  var assignBtn = document.getElementById('btnBatchAssign');
  var removeBtn = document.getElementById('btnBatchRemove');
  var c = selectedMemberIds.length;
  if (countEl) countEl.textContent = c;
  if (assignBtn) assignBtn.disabled = c === 0;
  if (removeBtn) removeBtn.disabled = c === 0;
}

window.toggleSelectAll = function() {
  var allMembers = loadMembers();
  var filtered = getFilteredMembers(allMembers);
  var allIds = filtered.map(function(m) { return m.id; });
  if (selectedMemberIds.length >= filtered.length && filtered.length > 0) {
    selectedMemberIds = [];
  } else {
    selectedMemberIds = allIds.slice();
  }
  renderMembers();
};

window.toggleMemberSelect = function(id) {
  var idx = selectedMemberIds.indexOf(id);
  if (idx !== -1) selectedMemberIds.splice(idx, 1);
  else selectedMemberIds.push(id);
  updateBatchBar();
  var cb = document.getElementById('rowCb_' + id);
  if (cb) {
    cb.classList.toggle('checked', selectedMemberIds.indexOf(id) !== -1);
    cb.innerHTML = cb.classList.contains('checked') ? '\u2713' : '';
  }
};

function showStorePopup(popupId) {
  var el = document.getElementById(popupId);
  if (el) el.classList.add('show');
}
function hideStorePopup(popupId) {
  var el = document.getElementById(popupId);
  if (el) {
    setTimeout(function() {
      if (el && el.parentElement && !el.parentElement.matches(':hover')) el.classList.remove('show');
    }, 150);
  }
}
function closeAllStorePopups() {
  document.querySelectorAll('.store-popup.show').forEach(function(p) { p.classList.remove('show'); });
}

var orgFilterPicker = null;

function getFilteredMembers(allMembers) {
  var search = ((document.getElementById('searchInput').value || '').trim()).toLowerCase();
  var storeFilter = document.getElementById('storeFilter').value;
  var orgFilter = orgFilterPicker ? orgFilterPicker.getValue() : '';

  return allMembers.filter(function(m) {
    if (search) {
      var matchSearch = (m.name || '').toLowerCase().indexOf(search) !== -1
        || (m.phone || '').indexOf(search) !== -1
        || (m.accountId || '').toLowerCase().indexOf(search) !== -1;
      if (!matchSearch) return false;
    }
    if (storeFilter) {
      var stores = getDeduplicatedStores(m);
      if (!stores.some(function(s) { return s.id === storeFilter; })) return false;
    }
    if (orgFilter) {
      if ((m.org || '').indexOf(orgFilter) !== 0) return false;
    }
    return true;
  });
}

function initOrgFilterTreeSelect() {
  var container = document.getElementById('orgFilterTreeSelect');
  if (!container || typeof window.parent.OrgTreeSelect === 'undefined') return;
  var orgUrl = 'account/organization/organization.html';
  var orgFrame = window.parent.PLATFORM_IFRAME_CACHE && window.parent.PLATFORM_IFRAME_CACHE[orgUrl];
  var orgData = (orgFrame && orgFrame.contentWindow && orgFrame.contentWindow.orgData)
    ? orgFrame.contentWindow.orgData : [];
  if (orgFilterPicker) orgFilterPicker.destroy();
  orgFilterPicker = window.parent.OrgTreeSelect.create(container, {
    data: orgData,
    placeholder: '全部组织机构',
    allowEmpty: true,
    onChange: function() {
      renderMembers();
    }
  });
}

function sortMembers(members) {
  return members.slice().sort(function(a, b) {
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
    if (icon) icon.textContent = (key === sortField) ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '';
  });
}

function renderMembers() {
  var allMembers = loadMembers();
  var filtered = getFilteredMembers(allMembers);
  filtered = sortMembers(filtered);
  updateSortIcons();

  var tbody = document.getElementById('memberTableBody');
  var empty = document.getElementById('emptyState');
  var countEl = document.getElementById('memberCount');

  if (countEl) countEl.textContent = '(' + filtered.length + '人)';

  // 更新筛选下拉
  var storeFilter = document.getElementById('storeFilter');
  var currentStoreVal = storeFilter.value;
  var shops = loadShops();
  storeFilter.innerHTML = '<option value="">全部店铺</option>'
    + shops.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
  storeFilter.value = currentStoreVal;

  var totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  var start = (currentPage - 1) * pageSize;
  var pageMembers = filtered.slice(start, start + pageSize);

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    updateBatchBar();
    renderPagination(0, 0);
    return;
  }
  if (empty) empty.style.display = 'none';

  closeAllStorePopups();

  tbody.innerHTML = pageMembers.map(function(m, i) {
    var color = MEMBER_COLORS[(start + i) % MEMBER_COLORS.length];
    var isChecked = selectedMemberIds.indexOf(m.id) !== -1;
    var checkboxHtml = '<div class="checkbox' + (isChecked ? ' checked' : '') + '" id="rowCb_' + m.id + '" onclick="event.stopPropagation(); toggleMemberSelect(\'' + m.id + '\')">' + (isChecked ? '\u2713' : '') + '</div>';

    var orgParts = (m.org || '').split('/');
    var deptName = orgParts[1] || orgParts[0] || '';
    var teamLine = orgParts.slice(2).join('<span class="team-arrow">&gt;</span>');
    var orgHtml = '<div class="org-dept">' + deptName + '</div>' + (teamLine ? '<div class="org-team">' + teamLine + '</div>' : '');

    var stores = getDeduplicatedStores(m);
    var storeHtml;
    if (stores.length === 0) {
      storeHtml = '<span class="muted-text">-</span>';
    } else {
      var popupId = 'storePopup_' + m.id;
      storeHtml = '<div class="store-count-cell" onmouseenter="showStorePopup(\'' + popupId + '\')" onmouseleave="hideStorePopup(\'' + popupId + '\')">'
        + '<span class="store-count-badge">' + stores.length + ' 家店铺<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>'
        + '<div class="store-popup" id="' + popupId + '">'
        + stores.map(function(s) {
            return '<div class="store-popup-item"><span class="sp-dot" style="background:' + (s.color || '#8B9A7C') + '"></span><span class="sp-name">' + s.name + '</span><span class="sp-domain">' + (s.domain || '') + '</span></div>';
          }).join('')
        + '</div></div>';
    }

    var editIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    var deleteIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    var moreIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
    var actionMenuId = 'rowMore_' + m.id;

    var actionHtml = '<div class="action-group">'
      + '<div class="action-btn" title="编辑" onclick="editMember(\'' + m.id + '\')">' + editIcon + '</div>'
      + '<div class="action-btn danger" title="删除" onclick="deleteMember(\'' + m.id + '\')">' + deleteIcon + '</div>'
      + '<div class="action-more-wrapper">'
      + '<div class="action-btn more" title="更多" onclick="event.stopPropagation();toggleRowMore(\'' + actionMenuId + '\')">' + moreIcon + '</div>'
      + '<div class="action-more-menu" id="' + actionMenuId + '" style="display:none;">'
      + '<div class="action-more-item" onclick="openSingleAssign(\'' + m.id + '\');closeAllRowMore()">指派店铺</div>'
      + '</div>'
      + '</div>'
      + '</div>';

    return '<tr>'
      + '<td class="col-cb">' + checkboxHtml + '</td>'
      + (columnsVisible.info    ? '<td class="col-info"><div class="member-info-cell"><div class="member-avatar avatar-c' + ((start + i) % 6) + '">' + (m.name || '?').charAt(0) + '</div><div class="member-info-text"><div class="member-name">' + m.name + '</div><div class="member-account-id">' + (m.accountId || '-') + '</div></div></div></td>' : '')
      + (columnsVisible.phone    ? '<td class="col-phone">' + (m.phone || '-') + '</td>' : '')
      + (columnsVisible.org      ? '<td class="col-org"><div class="org-cell">' + orgHtml + '</div></td>' : '')
      + (columnsVisible.stores   ? '<td class="col-stores">' + storeHtml + '</td>' : '')
      + (columnsVisible.joinedAt ? '<td class="col-joinedAt"><span class="muted-text">' + (m.joinedAt || '-') + '</span></td>' : '')
      + (columnsVisible.action   ? '<td class="col-action">' + actionHtml + '</td>' : '')
      + '</tr>';
  }).join('');

  updateBatchBar();
  renderPagination(filtered.length, totalPages);
}

function renderPagination(total, totalPages) {
  var infoEl = document.getElementById('paginationInfo');
  var btnsEl = document.getElementById('paginationButtons');
  if (!infoEl || !btnsEl) return;
  var end = Math.min(currentPage * pageSize, total);
  infoEl.textContent = total === 0 ? '共 0 条' : '显示 ' + ((currentPage - 1) * pageSize + 1) + '-' + end + ' 条，共 ' + total + ' 条';
  var html = '';
  html += '<div class="page-btn' + (currentPage <= 1 ? ' disabled' : '') + '" onclick="' + (currentPage > 1 ? 'goToPage(' + (currentPage - 1) + ')' : '') + '">\u2039</div>';
  for (var p = 1; p <= totalPages; p++) {
    if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      html += '<div class="page-btn' + (p === currentPage ? ' active' : '') + '" onclick="goToPage(' + p + ')">' + p + '</div>';
    } else if (p === 2 || p === totalPages - 1) {
      html += '<div class="page-btn disabled">...</div>';
    }
  }
  html += '<div class="page-btn' + (currentPage >= totalPages ? ' disabled' : '') + '" onclick="' + (currentPage < totalPages ? 'goToPage(' + (currentPage + 1) + ')' : '') + '">\u203A</div>';
  btnsEl.innerHTML = html;
}

window.goToPage = function(page) {
  currentPage = page;
  renderMembers();
};

// ==================== 排序事件 ====================
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
  renderMembers();
});

// ==================== 添加成员 ====================
var shopAddMemberOrgPicker = null;

window.openAddMemberModal = function() {
  if (window.parent && window.parent.openDialog) {
    window.parent.openDialog({
      id: 'shopAddMemberDialog',
      title: '添加成员',
      width: '480px',
      body:
        '<div class="form-group"><label class="form-label">姓名 <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdAddName" placeholder="请输入姓名"></div>' +
        '<div class="form-group"><label class="form-label">手机号 <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdAddPhone" placeholder="请输入手机号"></div>' +
        '<div class="form-group"><label class="form-label">账号ID <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdAddAccountId" value="' + generateAccountId() + '" readonly></div>' +
        '<div class="form-group"><label class="form-label">组织机构</label><div id="shopAddMemberOrgTreeSelect"></div></div>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopAddMemberDialog\')">取消</button>' +
        '<button class="btn btn-primary" onclick="window.parent.getFW().doAddMember()">确认添加</button>'
    });
    // 对话框渲染到父页面后初始化组织树形选择器
    initShopAddMemberOrgPicker();
  }
};

function initShopAddMemberOrgPicker() {
  var container = window.parent.document.getElementById('shopAddMemberOrgTreeSelect');
  if (!container || !window.parent.OrgTreeSelect) return;
  var orgUrl = 'account/organization/organization.html';
  var orgFrame = window.parent.PLATFORM_IFRAME_CACHE && window.parent.PLATFORM_IFRAME_CACHE[orgUrl];
  var orgData = (orgFrame && orgFrame.contentWindow && orgFrame.contentWindow.orgData)
    ? orgFrame.contentWindow.orgData : [];
  if (shopAddMemberOrgPicker) shopAddMemberOrgPicker.destroy();
  shopAddMemberOrgPicker = window.parent.OrgTreeSelect.create(container, {
    data: orgData,
    placeholder: '-- 请选择 --'
  });
}

window.doAddMember = function() {
  var name = document.getElementById('mdAddName').value.trim();
  var phone = document.getElementById('mdAddPhone').value.trim();
  var accountId = document.getElementById('mdAddAccountId').value.trim();
  var org = shopAddMemberOrgPicker ? shopAddMemberOrgPicker.getValue() : '';

  if (!name) { if (window.parent.showToast) window.parent.showToast('warning', '请输入姓名'); return; }
  if (!phone || !/^1\d{10}$/.test(phone)) { if (window.parent.showToast) window.parent.showToast('warning', '请输入正确的手机号'); return; }
  if (!accountId) { if (window.parent.showToast) window.parent.showToast('warning', '账号ID不能为空'); return; }
  if (memberData.some(function(m) { return m.accountId === accountId; })) { if (window.parent.showToast) window.parent.showToast('warning', '账号ID已存在'); return; }

  var now = new Date();
  var joinedAt = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());

  memberData.push({
    id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    accountId: accountId,
    name: name,
    phone: phone,
    org: org || '瑞贝卡集团',
    stores: [],
    joinedAt: joinedAt
  });

  if (window.parent.closeDialog) window.parent.closeDialog('shopAddMemberDialog');
  if (window.parent.showToast) window.parent.showToast('success', '已添加成员「' + name + '」');
  selectedMemberIds = [];
  currentPage = 1;
  renderMembers();
};

function generateAccountId() {
  var now = new Date();
  var prefix = 'AC' + now.getFullYear() + pad(now.getMonth() + 1);
  var maxNum = 0;
  memberData.forEach(function(m) {
    if (m.accountId && m.accountId.indexOf(prefix) === 0) {
      var num = parseInt(m.accountId.substring(prefix.length), 10);
      if (num > maxNum) maxNum = num;
    }
  });
  var s = '' + (maxNum + 1);
  while (s.length < 5) s = '0' + s;
  return prefix + s;
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

// ==================== 邀请成员 ====================
window.openInviteMemberModal = function() {
  if (window.parent && window.parent.openDialog) {
    window.parent.openDialog({
      id: 'shopInviteMemberDialog',
      title: '邀请成员',
      width: '520px',
      body:
        '<div class="form-group"><label class="form-label">选择成员（可多选）</label><div class="member-check-grid" id="memberCheckGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:200px;overflow-y:auto;padding:4px;">' + getInviteMemberOptions() + '</div></div>' +
        '<div class="form-group"><label class="form-label">选择店铺（可多选）</label><div class="store-check-grid" id="storeCheckGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' + getInviteStoreOptions() + '</div></div>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopInviteMemberDialog\')">取消</button>' +
        '<button class="btn btn-primary" onclick="doInviteMembers()">确认邀请</button>'
    });
  }
};

function getInviteMemberOptions() {
  var used = {};
  memberData.forEach(function(m) { used[m.accountId] = true; });
  // 模拟可选的全局账号池
  var pool = [
    { accountId: 'AC20260700010', name: '周七', phone: '13900139010' },
    { accountId: 'AC20260700011', name: '吴八', phone: '13900139011' },
    { accountId: 'AC20260700012', name: '郑九', phone: '13900139012' },
    { accountId: 'AC20260700013', name: '钱十', phone: '13900139013' }
  ];
  return pool.filter(function(p) { return !used[p.accountId]; }).map(function(p) {
    return '<div class="store-check-item" data-account-id="' + p.accountId + '" data-name="' + p.name + '" data-phone="' + p.phone + '" onclick="toggleCheckItem(this)">' +
      '<span class="sci-dot" style="background:#8B9A7C"></span><span>' + p.name + ' <span style="color:hsl(var(--muted-foreground));font-size:12px;">' + p.phone + '</span></span></div>';
  }).join('');
}

function getInviteStoreOptions() {
  return mockShops.map(function(s) {
    return '<div class="store-check-item" data-shop-id="' + s.id + '" onclick="toggleCheckItem(this)">' +
      '<span class="sci-dot" style="background:' + (s.color || '#8B9A7C') + '"></span><span>' + s.name + '</span></div>';
  }).join('');
}

window.toggleCheckItem = function(el) { el.classList.toggle('selected'); };

window.doInviteMembers = function() {
  var selectedMembers = [];
  document.querySelectorAll('#memberCheckGrid .store-check-item.selected').forEach(function(el) {
    selectedMembers.push({
      accountId: el.getAttribute('data-account-id'),
      name: el.getAttribute('data-name'),
      phone: el.getAttribute('data-phone')
    });
  });
  var selectedShopIds = [];
  document.querySelectorAll('#storeCheckGrid .store-check-item.selected').forEach(function(el) {
    selectedShopIds.push(el.getAttribute('data-shop-id'));
  });

  if (selectedMembers.length === 0) { if (window.parent.showToast) window.parent.showToast('warning', '请选择至少一名成员'); return; }
  if (selectedShopIds.length === 0) { if (window.parent.showToast) window.parent.showToast('warning', '请选择至少一家店铺'); return; }

  var now = new Date();
  var joinedAt = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());

  selectedMembers.forEach(function(p) {
    memberData.push({
      id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      accountId: p.accountId,
      name: p.name,
      phone: p.phone,
      org: '瑞贝卡集团',
      stores: selectedShopIds.slice(),
      joinedAt: joinedAt
    });
  });

  if (window.parent.closeDialog) window.parent.closeDialog('shopInviteMemberDialog');
  if (window.parent.showToast) window.parent.showToast('success', '已邀请 ' + selectedMembers.length + ' 名成员加入 ' + selectedShopIds.length + ' 家店铺');
  selectedMemberIds = [];
  currentPage = 1;
  renderMembers();
};

// ==================== 指派店铺 ====================
window.openSingleAssign = function(id) {
  selectedMemberIds = [id];
  openAssignStoreModal();
};

window.openBatchAssignStore = function() {
  if (selectedMemberIds.length === 0) { if (window.parent.showToast) window.parent.showToast('info', '请先选择成员'); return; }
  openAssignStoreModal();
};

function openAssignStoreModal() {
  var shops = loadShops();
  if (shops.length === 0) { if (window.parent.showToast) window.parent.showToast('info', '暂无可选店铺'); return; }

  if (window.parent && window.parent.openDialog) {
    window.parent.openDialog({
      id: 'shopAssignStoreDialog',
      title: '指派店铺',
      width: '520px',
      desc: '为选中的 <strong id="assignCount">' + selectedMemberIds.length + '</strong> 名成员指派店铺 <span style="font-size:12px;color:hsl(var(--muted-foreground))">（在当前店铺的成员列表中添加该成员）</span>',
      body:
        '<div class="form-group">' +
        '<label class="form-label">选择店铺（可多选）</label>' +
        '<input type="text" class="form-input store-check-search" id="assignStoreSearch" placeholder="搜索店铺名称" oninput="window.parent.getFW().filterAssignStores(this.value)">' +
        '<div class="store-check-toolbar">' +
        '<div class="toolbar-links"><button type="button" class="toolbar-link" onclick="window.parent.getFW().selectAllAssignStores()">全选</button><button type="button" class="toolbar-link" onclick="window.parent.getFW().clearAssignStores()">清空</button></div>' +
        '<span class="toolbar-count">已选 <strong id="assignSelectedCount">0</strong> 家</span>' +
        '</div>' +
        '<div class="store-check-grid" id="assignStoreCheckGrid">' +
        shops.map(function(s) {
          return '<div class="store-check-item" data-shop-id="' + s.id + '" data-shop-name="' + s.name + '" onclick="window.parent.getFW().toggleAssignStoreItem(this)">' +
            '<span class="sci-checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
            '<span class="sci-name">' + s.name + '</span>' +
            '<span class="sci-dot" style="background:' + (s.color || '#8B9A7C') + '"></span>' +
            '</div>';
        }).join('') +
        '</div>' +
        '<div class="store-check-empty" id="assignStoreEmpty">没有匹配的店铺</div>' +
        '<div class="form-error" id="assignStoreError">请至少选择一家店铺</div>' +
        '</div>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopAssignStoreDialog\')">取消</button>' +
        '<button class="btn btn-primary" onclick="window.parent.getFW().doAssignStores()">确认指派</button>'
    });
  }
}

window.toggleAssignStoreItem = function(el) {
  el.classList.toggle('selected');
  updateAssignSelectedCount();
  var err = window.parent.document.getElementById('assignStoreError');
  if (err) err.style.display = 'none';
};

function updateAssignSelectedCount() {
  var count = window.parent.document.querySelectorAll('#assignStoreCheckGrid .store-check-item.selected').length;
  var el = window.parent.document.getElementById('assignSelectedCount');
  if (el) el.textContent = count;
}

window.filterAssignStores = function(keyword) {
  var items = window.parent.document.querySelectorAll('#assignStoreCheckGrid .store-check-item');
  var lower = (keyword || '').toLowerCase();
  var visible = 0;
  items.forEach(function(item) {
    var name = (item.getAttribute('data-shop-name') || '').toLowerCase();
    var show = !lower || name.indexOf(lower) !== -1;
    item.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  var empty = window.parent.document.getElementById('assignStoreEmpty');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
};

window.selectAllAssignStores = function() {
  var keyword = window.parent.document.getElementById('assignStoreSearch');
  var lower = (keyword && keyword.value || '').toLowerCase();
  var items = window.parent.document.querySelectorAll('#assignStoreCheckGrid .store-check-item');
  items.forEach(function(item) {
    if (item.style.display === 'none') return;
    item.classList.add('selected');
  });
  updateAssignSelectedCount();
  var err = window.parent.document.getElementById('assignStoreError');
  if (err) err.style.display = 'none';
};

window.clearAssignStores = function() {
  var items = window.parent.document.querySelectorAll('#assignStoreCheckGrid .store-check-item');
  items.forEach(function(item) { item.classList.remove('selected'); });
  updateAssignSelectedCount();
};

window.doAssignStores = function() {
  var selectedEls = window.parent.document.querySelectorAll('#assignStoreCheckGrid .store-check-item.selected');
  if (selectedEls.length === 0) {
    var err = window.parent.document.getElementById('assignStoreError');
    if (err) err.style.display = 'block';
    return;
  }
  var assignedStoreIds = [];
  selectedEls.forEach(function(el) { assignedStoreIds.push(el.getAttribute('data-shop-id')); });

  memberData.forEach(function(m) {
    if (selectedMemberIds.indexOf(m.id) !== -1) {
      assignedStoreIds.forEach(function(sid) {
        if (m.stores.indexOf(sid) === -1) m.stores.push(sid);
      });
    }
  });

  if (window.parent.closeDialog) window.parent.closeDialog('shopAssignStoreDialog');
  if (window.parent.showToast) window.parent.showToast('success', '已为 ' + selectedMemberIds.length + ' 名成员指派店铺');
  selectedMemberIds = [];
  currentPage = 1;
  renderMembers();
};


window.batchDeleteMembers = function() {
  if (selectedMemberIds.length === 0) { if (window.parent.showToast) window.parent.showToast('info', '请先选择成员'); return; }
  if (window.parent && window.parent.openDialog) {
    window.parent.openDialog({
      id: 'shopBatchDeleteDialog',
      title: '批量删除',
      width: '440px',
      body: '<p>确定要删除已选的 <strong>' + selectedMemberIds.length + '</strong> 名成员吗？</p><p style="color:hsl(var(--error));margin-top:6px;">此操作不可恢复。</p>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopBatchDeleteDialog\')">取消</button>' +
        '<button class="btn btn-primary" style="background:hsl(var(--error));border-color:hsl(var(--error))" onclick="window.parent.getFW().confirmBatchDeleteMembers()">确认删除</button>'
    });
  }
};

window.confirmBatchDeleteMembers = function() {
  memberData = memberData.filter(function(m) { return selectedMemberIds.indexOf(m.id) === -1; });
  if (window.parent.closeDialog) window.parent.closeDialog('shopBatchDeleteDialog');
  if (window.parent.showToast) window.parent.showToast('success', '已删除 ' + selectedMemberIds.length + ' 名成员');
  selectedMemberIds = [];
  currentPage = 1;
  renderMembers();
};

// ==================== 编辑成员 ====================
window.editMember = function(id) {
  var member = memberData.find(function(m) { return m.id === id; });
  if (!member) return;

  if (window.parent && window.parent.openDialog) {
    window.parent.openDialog({
      id: 'shopEditMemberDialog',
      title: '编辑成员',
      width: '480px',
      body:
        '<div class="form-group"><label class="form-label">姓名 <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdEditName" value="' + member.name + '" placeholder="请输入姓名"></div>' +
        '<div class="form-group"><label class="form-label">手机号 <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdEditPhone" value="' + member.phone + '" placeholder="请输入手机号"></div>' +
        '<div class="form-group"><label class="form-label">账号ID</label><input class="form-input" id="mdEditAccountId" value="' + member.accountId + '" readonly></div>' +
        '<div class="form-group"><label class="form-label">组织机构</label><div id="shopEditMemberOrgTreeSelect"></div></div>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopEditMemberDialog\')">取消</button>' +
        '<button class="btn btn-primary" onclick="window.parent.getFW().doEditMember(\'' + id + '\')">保存</button>'
    });
    initEditMemberOrgPicker(member.org);
  }
};

var shopEditOrgPicker = null;
function initEditMemberOrgPicker(currentOrg) {
  var container = window.parent.document.getElementById('shopEditMemberOrgTreeSelect');
  if (!container || !window.parent.OrgTreeSelect) return;
  var orgUrl = 'account/organization/organization.html';
  var orgFrame = window.parent.PLATFORM_IFRAME_CACHE && window.parent.PLATFORM_IFRAME_CACHE[orgUrl];
  var orgData = (orgFrame && orgFrame.contentWindow && orgFrame.contentWindow.orgData)
    ? orgFrame.contentWindow.orgData : [];
  if (shopEditOrgPicker) shopEditOrgPicker.destroy();
  shopEditOrgPicker = window.parent.OrgTreeSelect.create(container, {
    data: orgData,
    placeholder: '-- 请选择 --'
  });
  if (currentOrg) shopEditOrgPicker.setValue(currentOrg);
}

window.doEditMember = function(id) {
  var member = memberData.find(function(m) { return m.id === id; });
  if (!member) return;

  var name = document.getElementById('mdEditName').value.trim();
  var phone = document.getElementById('mdEditPhone').value.trim();
  var org = shopEditOrgPicker ? shopEditOrgPicker.getValue() : '';

  if (!name) { if (window.parent.showToast) window.parent.showToast('warning', '请输入姓名'); return; }
  if (!phone || !/^1\d{10}$/.test(phone)) { if (window.parent.showToast) window.parent.showToast('warning', '请输入正确的手机号'); return; }

  member.name = name;
  member.phone = phone;
  member.org = org || member.org;

  if (window.parent.closeDialog) window.parent.closeDialog('shopEditMemberDialog');
  if (window.parent.showToast) window.parent.showToast('success', '已保存成员「' + name + '」');
  renderMembers();
};

// ==================== 删除成员 ====================
window.deleteMember = function(id) {
  var member = memberData.find(function(m) { return m.id === id; });
  if (!member) return;

  if (window.parent && window.parent.openDialog) {
    window.parent.openDialog({
      id: 'shopDeleteMemberDialog',
      title: '删除成员',
      width: '440px',
      body: '<p>确定要删除成员 <strong>' + member.name + '</strong> 吗？</p><p style="color:hsl(var(--error));margin-top:6px;">此操作不可恢复。</p>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopDeleteMemberDialog\')">取消</button>' +
        '<button class="btn btn-primary" style="background:hsl(var(--error));border-color:hsl(var(--error))" onclick="window.parent.getFW().confirmDeleteMember(\'' + id + '\')">确认删除</button>'
    });
  }
};

window.confirmDeleteMember = function(id) {
  memberData = memberData.filter(function(m) { return m.id !== id; });
  var idx = selectedMemberIds.indexOf(id);
  if (idx !== -1) selectedMemberIds.splice(idx, 1);
  if (window.parent.closeDialog) window.parent.closeDialog('shopDeleteMemberDialog');
  if (window.parent.showToast) window.parent.showToast('success', '已删除该成员');
  renderMembers();
};

// ==================== 自定义列 ====================
var columnDefs = [
  { key: 'info', label: '成员信息', alwaysShow: true },
  { key: 'phone', label: '手机号', defaultShow: true },
  { key: 'org', label: '组织机构', defaultShow: true },
  { key: 'stores', label: '所在店铺', defaultShow: true },
  { key: 'joinedAt', label: '创建时间', defaultShow: true },
  { key: 'action', label: '操作', alwaysShow: true }
];

function buildCustomColPanel() {
  var body = document.getElementById('customColBody');
  if (!body) return;
  body.innerHTML = columnDefs.map(function(c) {
    var disabled = c.alwaysShow ? 'disabled' : '';
    var active = columnsVisible[c.key] ? 'active' : '';
    var dragIcon = '<span class="drag-handle' + (c.alwaysShow ? ' drag-disabled' : '') + '" title="' + (c.alwaysShow ? '固定列不可拖动' : '拖拽排序') + '">⋮⋮</span>';
    return '<div class="custom-col-item ' + active + ' ' + disabled + '" data-key="' + c.key + '">' +
      dragIcon +
      '<div class="col-check" onclick="toggleCustomCol(this.parentElement, event)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<span style="flex:1">' + c.label + '</span>' +
    '</div>';
  }).join('');
}

window.toggleCustomCol = function(el, e) {
  if (e) { e.stopPropagation(); }
  var key = el.dataset.key;
  var c = columnDefs.find(function(col) { return col.key === key; });
  if (c && c.alwaysShow) return;

  if (el.classList.contains('active')) {
    el.classList.remove('active');
    columnsVisible[key] = false;
  } else {
    el.classList.add('active');
    columnsVisible[key] = true;
  }
  renderColumns();
  renderMembers();
};

window.toggleCustomColPanel = function() {
  var panel = document.getElementById('customColPanel');
  var btn = document.querySelector('#customColWrapper button');
  if (!panel || !btn) return;
  if (panel.classList.contains('show')) {
    panel.classList.remove('show');
    panel.style.display = 'none';
  } else {
    buildCustomColPanel();
    var rect = btn.getBoundingClientRect();
    panel.style.top = (rect.bottom + 4) + 'px';
    panel.style.left = Math.max(8, rect.right - 240) + 'px';
    panel.style.display = 'block';
    panel.classList.add('show');
  }
};

window.resetCustomCols = function() {
  columnDefs.forEach(function(c) {
    if (c.alwaysShow) columnsVisible[c.key] = true;
    else columnsVisible[c.key] = c.defaultShow !== false;
  });
  buildCustomColPanel();
  renderColumns();
  renderMembers();
  var panel = document.getElementById('customColPanel');
  if (panel) { panel.classList.remove('show'); panel.style.display = 'none'; }
};

function renderColumns() {
  var ths = document.querySelectorAll('th[data-key]');
  ths.forEach(function(th) {
    var key = th.getAttribute('data-key');
    th.style.display = columnsVisible[key] ? '' : 'none';
  });
  var cbTh = document.querySelector('th.col-cb');
  if (cbTh) cbTh.style.display = '';
}

// 点击外部关闭自定义列面板
document.addEventListener('click', function(e) {
  var panel = document.getElementById('customColPanel');
  var wrapper = document.getElementById('customColWrapper');
  if (panel && wrapper && !wrapper.contains(e.target) && !panel.contains(e.target)) {
    panel.classList.remove('show');
    panel.style.display = 'none';
  }
});

// ==================== 行级更多菜单 ====================
window.toggleRowMore = function(menuId) {
  var menu = document.getElementById(menuId);
  if (!menu) return;
  if (menu.style.display === 'block') {
    menu.style.display = 'none';
    return;
  }
  closeAllRowMore();
  menu.style.display = 'block';
};

window.closeAllRowMore = function() {
  var menus = document.querySelectorAll('.action-more-menu');
  menus.forEach(function(m) { m.style.display = 'none'; });
};

document.addEventListener('click', function(e) {
  var wrapper = e.target.closest('.action-more-wrapper');
  if (!wrapper) closeAllRowMore();
});

window.refreshPage = function() {
  renderMembers();
  if (window.parent.showToast) window.parent.showToast('success', '数据已刷新');
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
  initOrgFilterTreeSelect();
  renderColumns();
  renderMembers();
});
