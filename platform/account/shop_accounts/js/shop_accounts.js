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

function getFilteredMembers(allMembers) {
  var search = ((document.getElementById('searchInput').value || '').trim()).toLowerCase();
  var storeFilter = document.getElementById('storeFilter').value;
  var orgFilter = document.getElementById('orgFilter').value;

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

function getOrgPaths(allMembers) {
  var paths = {};
  allMembers.forEach(function(m) {
    if (m.org) {
      var parts = m.org.split('/');
      var full = parts.slice(0, 2).join('/');
      if (full) paths[full] = true;
    }
  });
  return Object.keys(paths).sort();
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

  var orgFilter = document.getElementById('orgFilter');
  var currentOrgVal = orgFilter.value;
  var orgPaths = getOrgPaths(allMembers);
  orgFilter.innerHTML = '<option value="">全部组织机构</option>'
    + orgPaths.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join('');
  orgFilter.value = currentOrgVal;

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

    var actionHtml = '<button class="action-btn-sm assign" onclick="openSingleAssign(\'' + m.id + '\')">指派店铺</button>';

    return '<tr>'
      + '<td>' + checkboxHtml + '</td>'
      + '<td><div class="member-info-cell"><div class="member-avatar avatar-c' + ((start + i) % 6) + '">' + (m.name || '?').charAt(0) + '</div><div class="member-name">' + m.name + '</div></div></td>'
      + '<td><span class="mono-text">' + (m.accountId || '-') + '</span></td>'
      + '<td>' + (m.phone || '-') + '</td>'
      + '<td><div class="org-cell">' + orgHtml + '</div></td>'
      + '<td>' + storeHtml + '</td>'
      + '<td><span class="muted-text">' + (m.joinedAt || '-') + '</span></td>'
      + '<td>' + actionHtml + '</td>'
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
window.openAddMemberModal = function() {
  if (window.parent && window.parent.openDialog) {
    window.parent.openDialog({
      id: 'shopAddMemberDialog',
      title: '添加成员',
      width: '480px',
      body:
        '<div class="form-row"><label class="form-label">姓名 <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdAddName" placeholder="请输入姓名"></div>' +
        '<div class="form-row"><label class="form-label">手机号 <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdAddPhone" placeholder="请输入手机号"></div>' +
        '<div class="form-row"><label class="form-label">账号ID <span style="color:hsl(var(--error))">*</span></label><input class="form-input" id="mdAddAccountId" value="' + generateAccountId() + '" readonly></div>' +
        '<div class="form-row"><label class="form-label">组织机构</label><input class="form-input" id="mdAddOrg" placeholder="例：瑞贝卡集团/瑞贝卡科技/技术研发部"></div>' +
        '<div class="form-row"><label class="form-label">所属店铺</label><select class="form-select" id="mdAddStore"><option value="">-- 请选择 --</option>' + mockShops.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('') + '</select></div>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopAddMemberDialog\')">取消</button>' +
        '<button class="btn btn-primary" onclick="doAddMember()">确认添加</button>'
    });
  }
};

window.doAddMember = function() {
  var name = document.getElementById('mdAddName').value.trim();
  var phone = document.getElementById('mdAddPhone').value.trim();
  var accountId = document.getElementById('mdAddAccountId').value.trim();
  var org = document.getElementById('mdAddOrg').value.trim();
  var storeId = document.getElementById('mdAddStore').value;

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
    stores: storeId ? [storeId] : [],
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
        '<div class="form-row"><label class="form-label">选择成员（可多选）</label><div class="member-check-grid" id="memberCheckGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:200px;overflow-y:auto;padding:4px;">' + getInviteMemberOptions() + '</div></div>' +
        '<div class="form-row"><label class="form-label">选择店铺（可多选）</label><div class="store-check-grid" id="storeCheckGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' + getInviteStoreOptions() + '</div></div>',
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
        '<label class="form-label">选择店铺（可多选）</label>' +
        '<div class="store-check-grid" id="assignStoreCheckGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-height:260px;overflow-y:auto;">' +
        shops.map(function(s) {
          return '<div class="store-check-item" data-shop-id="' + s.id + '" onclick="window.parent.getFW().toggleCheckItem(this)">' +
            '<span class="sci-dot" style="background:' + (s.color || '#8B9A7C') + '"></span><span>' + s.name + '</span></div>';
        }).join('') +
        '</div>' +
        '<div class="form-error" id="assignStoreError" style="display:none;margin-top:10px;">请至少选择一家店铺</div>',
      actions:
        '<button class="btn btn-secondary" onclick="window.parent.closeDialog(\'shopAssignStoreDialog\')">取消</button>' +
        '<button class="btn btn-primary" onclick="doAssignStores()">确认指派</button>'
    });
  }
}

window.doAssignStores = function() {
  var selectedEls = document.querySelectorAll('#assignStoreCheckGrid .store-check-item.selected');
  if (selectedEls.length === 0) {
    var err = document.getElementById('assignStoreError');
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

window.batchRemove = function() {
  if (selectedMemberIds.length === 0) { if (window.parent.showToast) window.parent.showToast('info', '请先选择成员'); return; }
  openBatchAssignStore();
};

window.refreshPage = function() {
  renderMembers();
  if (window.parent.showToast) window.parent.showToast('success', '数据已刷新');
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
  renderMembers();
});
