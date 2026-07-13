// ==================== 页面回调钩子（设置保存逻辑） ====================
// 这些钩子由 member_dialogs.js 在确认添加/邀请时调用
window.MDHooks.onAddMember = function(formData) {
  // 同步到全局账号
  var allAccounts = mdLoadAllAccounts();
  if (!allAccounts.some(function(a) { return a.accountId === formData.accountId; })) {
    allAccounts.push({ accountId: formData.accountId, name: formData.name, phone: formData.phone, email: formData.email || '', orgDept: formData.orgDept, orgTeam: formData.orgTeam, orgSubTeam: formData.orgSubTeam, createdAt: new Date().toISOString() });
  }
  mdSaveAllAccounts(allAccounts);

  // 为每个选中店铺添加成员
  var newId = 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
  formData.stores.forEach(function(store) {
    var key = 'rebecca_members_' + store.id;
    var storeMems = []; try { var d = localStorage.getItem(key); if (d) storeMems = JSON.parse(d); } catch(e) {}
    if (!storeMems.some(function(ex) { return ex.accountId === formData.accountId; })) {
      storeMems.push({ id: newId, accountId: formData.accountId, name: formData.name, phone: formData.phone, email: formData.email || '', orgDept: formData.orgDept, orgTeam: formData.orgTeam, orgSubTeam: formData.orgSubTeam, stores: formData.stores, type: 'invited', joinedAt: formData.joinedAt });
      localStorage.setItem(key, JSON.stringify(storeMems));
    }
  });

  currentPage = 1;
  renderMembers();
  showToast('success', '已添加成员「' + formData.name + '」');
};

window.MDHooks.onInviteMembers = function(data) {
  var now = new Date();
  var joinedAt = now.getFullYear() + '-' + mpad(now.getMonth()+1) + '-' + mpad(now.getDate()) + ' ' + mpad(now.getHours()) + ':' + mpad(now.getMinutes());

  data.shopIds.forEach(function(shopId) {
    var key = 'rebecca_members_' + shopId;
    var mems = []; try { var d = localStorage.getItem(key); if (d) mems = JSON.parse(d); } catch(e) {}
    data.selectedMembers.forEach(function(m) {
      if (mems.some(function(ex) { return ex.accountId === m.accountId; })) return;
      var stores = data.selectedShops.map(function(s) { return { id: s.id, name: s.name, domain: s.domain, color: s.color }; });
      mems.push({ id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2,6), accountId: m.accountId, name: m.name, phone: m.phone, email: m.email || '', orgDept: m.orgDept, orgTeam: m.orgTeam, orgSubTeam: m.orgSubTeam, stores: stores, type: 'invited', joinedAt: joinedAt });
    });
    localStorage.setItem(key, JSON.stringify(mems));
  });

  // 同步到全局账号
  var allAccounts = mdLoadAllAccounts();
  data.selectedMembers.forEach(function(m) {
    if (!allAccounts.some(function(a) { return a.accountId === m.accountId; })) {
      allAccounts.push({ accountId: m.accountId, name: m.name, phone: m.phone, email: m.email || '', orgDept: m.orgDept, orgTeam: m.orgTeam, orgSubTeam: m.orgSubTeam, createdAt: new Date().toISOString() });
    }
  });
  mdSaveAllAccounts(allAccounts);

  currentPage = 1;
  renderMembers();
  showToast('success', '已邀请 ' + data.selectedMembers.length + ' 名成员加入 ' + data.selectedShops.length + ' 家店铺');
};

// ==================== 颜色库 ====================
var MEMBER_COLORS = ['#D4845A','#8B9A7C','#7C8B9A','#B4846C','#9A8B7C','#6C8B84','#C4957A','#8B7C9A','#A47C6C','#7C9A8B'];

// ==================== 全局成员数据（聚合所有店铺的成员） ====================
function loadAllGlobalMembers() {
  var shops = loadShops();
  var allMembers = [];
  var seen = {};
  shops.forEach(function(shop) {
    var key = 'rebecca_members_' + shop.id;
    try {
      var d = localStorage.getItem(key);
      if (d) {
        var mems = JSON.parse(d);
        mems.forEach(function(m) {
          if (seen[m.accountId]) {
            // 已存在：合并店铺信息
            var existing = allMembers.find(function(em) { return em.accountId === m.accountId; });
            if (existing && m.stores) {
              m.stores.forEach(function(s) {
                if (!existing.stores.some(function(es) { return es.id === s.id; })) {
                  existing.stores.push(s);
                }
              });
            }
          } else {
            seen[m.accountId] = true;
            allMembers.push({
              id: m.id,
              accountId: m.accountId,
              name: m.name,
              phone: m.phone || '',
              email: m.email || '',
              orgDept: m.orgDept || '',
              orgTeam: m.orgTeam || '',
              orgSubTeam: m.orgSubTeam || '',
              stores: m.stores || [],
              type: m.type || '',
              joinedAt: m.joinedAt || ''
            });
          }
        });
      }
    } catch(e) {}
  });
  return allMembers;
}

function getDeduplicatedStores(member) {
  if (!member.stores) return [];
  var seen = {};
  return member.stores.filter(function(s) {
    if (seen[s.id]) return false;
    seen[s.id] = true;
    return true;
  });
}

// ==================== 筛选状态 ====================
var currentPage = 1;
var pageSize = 10;
var selectedMemberIds = [];
var sortField = 'joinedAt';
var sortDir = 'desc';

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
  var allMembers = loadAllGlobalMembers();
  var filtered = getFilteredMembers(allMembers);
  var allIds = filtered.map(function(m) { return m.accountId; });
  if (selectedMemberIds.length >= filtered.length && filtered.length > 0) {
    selectedMemberIds = [];
  } else {
    selectedMemberIds = allIds.slice();
  }
  renderMembers();
};

window.toggleMemberSelect = function(accountId) {
  var idx = selectedMemberIds.indexOf(accountId);
  if (idx !== -1) { selectedMemberIds.splice(idx, 1); }
  else { selectedMemberIds.push(accountId); }
  updateBatchBar();
  var cb = document.getElementById('rowCb_' + accountId);
  if (cb) {
    cb.classList.toggle('checked', selectedMemberIds.indexOf(accountId) !== -1);
    cb.innerHTML = cb.classList.contains('checked') ? '\u2713' : '';
  }
};

// ==================== 店铺弹出层 ====================
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
  var popups = document.querySelectorAll('.store-popup.show');
  popups.forEach(function(p) { p.classList.remove('show'); });
}

// ==================== 筛选 ====================
function getFilteredMembers(allMembers) {
  var search = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  var storeFilter = document.getElementById('storeFilter').value;
  var orgFilter = document.getElementById('orgFilter').value;

  return allMembers.filter(function(m) {
    if (search) {
      var matchSearch = (m.name || '').toLowerCase().indexOf(search) !== -1
        || (m.phone || '').indexOf(search) !== -1
        || (m.email || '').toLowerCase().indexOf(search) !== -1
        || (m.accountId || '').toLowerCase().indexOf(search) !== -1;
      if (!matchSearch) return false;
    }
    if (storeFilter) {
      var stores = getDeduplicatedStores(m);
      if (!stores.some(function(s) { return s.id === storeFilter; })) return false;
    }
    if (orgFilter) {
      var fullOrg = m.orgDept;
      if (m.orgTeam) fullOrg += '/' + m.orgTeam;
      if (m.orgSubTeam) fullOrg += '/' + m.orgSubTeam;
      if (fullOrg.indexOf(orgFilter) !== 0) return false;
    }
    return true;
  });
}

function getOrgPaths(allMembers) {
  var paths = {};
  allMembers.forEach(function(m) {
    var full = m.orgDept || '';
    if (m.orgTeam) full += '/' + m.orgTeam;
    if (full) paths[full] = true;
  });
  return Object.keys(paths).sort();
}

// ==================== 排序 ====================
function sortMembers(members) {
  return members.slice().sort(function(a, b) {
    var va = a[sortField] || '', vb = b[sortField] || '';
    if (sortField === 'joinedAt') {
      // 日期时间字符串比较
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    }
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
  updateSortIcons();
  renderMembers();
});

// ==================== 渲染 ====================
function renderMembers() {
  var allMembers = loadAllGlobalMembers();
  var filtered = getFilteredMembers(allMembers);
  filtered = sortMembers(filtered);
  updateSortIcons();
  var tbody = document.getElementById('memberTableBody');
  var empty = document.getElementById('emptyState');
  var countEl = document.getElementById('memberCount');

  countEl.textContent = '(' + filtered.length + '人)';

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
    + orgPaths.map(function(p) {
        var parts = p.split('/');
        var label = parts[parts.length - 1] || p;
        return '<option value="' + p + '">' + p + '</option>';
      }).join('');
  orgFilter.value = currentOrgVal;

  // 分页
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
    var isChecked = selectedMemberIds.indexOf(m.accountId) !== -1;
    var checkboxHtml = '<div class="checkbox' + (isChecked ? ' checked' : '') + '" id="rowCb_' + m.accountId + '" onclick="event.stopPropagation(); toggleMemberSelect(\'' + m.accountId.replace(/'/g, "\\'") + '\')">' + (isChecked ? '\u2713' : '') + '</div>';

    // 组织机构
    var orgHtml = '';
    if (m.orgDept || m.orgTeam) {
      var deptName = (m.orgDept || '').split('/').pop() || m.orgDept;
      var teamLine = m.orgTeam ? m.orgTeam : '';
      if (m.orgSubTeam) teamLine += '<span class="team-arrow">&gt;</span>' + m.orgSubTeam;
      orgHtml = '<div class="org-dept">' + deptName + '</div>' + (teamLine ? '<div class="org-team">' + teamLine + '</div>' : '');
    } else {
      orgHtml = '<span style="color:hsl(var(--muted-foreground))">-</span>';
    }

    // 所在店铺（去重）
    var stores = getDeduplicatedStores(m);
    var storeHtml;
    if (stores.length === 0) {
      storeHtml = '<span style="font-size:13px;color:hsl(var(--muted-foreground))">-</span>';
    } else {
      var popupId = 'storePopup_' + m.accountId;
      storeHtml = '<div class="store-count-cell" onmouseenter="showStorePopup(\'' + popupId + '\')" onmouseleave="hideStorePopup(\'' + popupId + '\')">'
        + '<span class="store-count-badge">' + stores.length + ' 家店铺<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></span>'
        + '<div class="store-popup" id="' + popupId + '">'
        + stores.map(function(s) {
            return '<div class="store-popup-item"><span class="sp-dot" style="background:' + (s.color || '#8B9A7C') + '"></span><span class="sp-name">' + s.name + '</span><span class="sp-domain">' + (s.domain || '') + '</span></div>';
          }).join('')
        + '</div></div>';
    }

    // 操作按钮
    var actionHtml = '<button class="action-btn-sm assign" onclick="openSingleAssign(\'' + m.accountId.replace(/'/g, "\\'") + '\')">指派店铺</button>';

    return '<tr>'
      + '<td>' + checkboxHtml + '</td>'
      + '<td><div class="member-avatar-cell"><div class="member-avatar" style="background:' + color + '">' + m.name.charAt(0) + '</div><div><div class="member-name">' + m.name + '</div></div></div></td>'
      + '<td><span style="font-family:monospace;font-size:13px;">' + (m.accountId || '-') + '</span></td>'
      + '<td>' + (m.phone || '-') + '</td>'
      + '<td><span style="font-size:13px;color:hsl(var(--muted-foreground))">' + (m.email || '-') + '</span></td>'
      + '<td><div class="org-cell">' + orgHtml + '</div></td>'
      + '<td>' + storeHtml + '</td>'
      + '<td><span style="font-size:13px;color:hsl(var(--muted-foreground))">' + (m.joinedAt || '-') + '</span></td>'
      + '<td>' + actionHtml + '</td>'
      + '</tr>';
  }).join('');

  updateBatchBar();
  renderPagination(filtered.length, totalPages);
}

// ==================== 分页 ====================
function renderPagination(total, totalPages) {
  var infoEl = document.getElementById('paginationInfo');
  var btnsEl = document.getElementById('paginationButtons');
  if (!infoEl || !btnsEl) return;
  var end = Math.min(currentPage * pageSize, total);
  infoEl.textContent = total === 0 ? '共 0 条' : '显示 ' + ((currentPage - 1) * pageSize + 1) + '-' + end + ' 条，共 ' + total + ' 条';
  var html = '';
  html += '<div class="page-btn' + (currentPage <= 1 ? ' disabled' : '') + '" onclick="' + (currentPage > 1 ? 'goToPage(' + (currentPage - 1) + ')' : '') + '">‹</div>';
  for (var p = 1; p <= totalPages; p++) {
    if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      html += '<div class="page-btn' + (p === currentPage ? ' active' : '') + '" onclick="goToPage(' + p + ')">' + p + '</div>';
    } else if (p === 2 || p === totalPages - 1) {
      html += '<div class="page-btn disabled">...</div>';
    }
  }
  html += '<div class="page-btn' + (currentPage >= totalPages ? ' disabled' : '') + '" onclick="' + (currentPage < totalPages ? 'goToPage(' + (currentPage + 1) + ')' : '') + '">›</div>';
  btnsEl.innerHTML = html;
}

window.goToPage = function(page) {
  currentPage = page;
  renderMembers();
};

// ==================== 指派店铺（单个） ====================
window.openSingleAssign = function(accountId) {
  selectedMemberIds = [accountId];
  openAssignStoreModal();
};

// ==================== 指派店铺弹窗 ====================
function openAssignStoreModal() {
  var shops = loadShops();
  if (shops.length === 0) { showToast('info', '暂无可选店铺'); return; }

  var overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.id = 'assignStoreOverlay';
  overlay.innerHTML =
    '<div class="dialog assign-dialog">'
    + '<div class="dialog-header"><div class="dialog-title">指派店铺</div><button class="dialog-close" onclick="closeAssignModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    + '<div class="dialog-desc">为选中的 <strong id="assignCount">1</strong> 名成员指派店铺 <span style="font-size:12px;color:hsl(var(--muted-foreground))">（在当前店铺的成员列表中添加该成员）</span></div>'
    + '<div class="dialog-body">'
      + '<label class="form-label">选择店铺（可多选）</label>'
      + '<div class="store-check-grid" id="assignStoreCheckGrid">'
      + shops.map(function(s) {
          return '<div class="store-check-item" data-shop-id="' + s.id + '" onclick="toggleAssignStore(this)">'
            + '<span class="sci-dot" style="background:' + (s.color || '#8B9A7C') + '"></span>'
            + '<span>' + s.name + '</span></div>';
        }).join('')
      + '</div>'
      + '<div class="form-error" id="assignStoreError">请至少选择一家店铺</div>'
    + '</div>'
    + '<div class="dialog-actions">'
      + '<button class="btn btn-secondary" onclick="closeAssignModal()">取消</button>'
      + '<button class="btn btn-primary" onclick="doAssignStores()">确认指派</button>'
    + '</div>'
    + '</div>';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeAssignModal(); });
  document.body.appendChild(overlay);

  var countEl = document.getElementById('assignCount');
  if (countEl) countEl.textContent = selectedMemberIds.length;

  overlay.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeAssignModal(); });
}

window.toggleAssignStore = function(el) { el.classList.toggle('selected'); };

function closeAssignModal() {
  var ov = document.getElementById('assignStoreOverlay');
  if (ov) ov.remove();
}

function doAssignStores() {
  var selectedEls = document.querySelectorAll('#assignStoreCheckGrid .store-check-item.selected');
  if (selectedEls.length === 0) {
    document.getElementById('assignStoreError').style.display = 'block';
    return;
  }
  var allShops = loadShops();
  var assignedStores = [];
  selectedEls.forEach(function(el) {
    var sid = el.getAttribute('data-shop-id');
    var shop = allShops.find(function(s) { return s.id === sid; });
    if (shop) assignedStores.push({ id: shop.id, name: shop.name, domain: shop.domain, color: shop.color });
  });

  var allMembers = loadAllGlobalMembers();

  assignedStores.forEach(function(store) {
    var key = 'rebecca_members_' + store.id;
    var storeMems = [];
    try { var d = localStorage.getItem(key); if (d) storeMems = JSON.parse(d); } catch(e) {}

    selectedMemberIds.forEach(function(accId) {
      var mem = allMembers.find(function(m) { return m.accountId === accId; });
      if (!mem) return;
      if (storeMems.some(function(ex) { return ex.accountId === accId; })) return;

      storeMems.push({
        id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2,6),
        accountId: mem.accountId,
        name: mem.name,
        phone: mem.phone,
        orgDept: mem.orgDept,
        orgTeam: mem.orgTeam,
        orgSubTeam: mem.orgSubTeam,
        stores: assignedStores.concat(assignedStores.length > 0 ? [] : []),
        type: 'invited',
        joinedAt: new Date().toISOString().replace('T', ' ').substr(0, 16)
      });
    });

    localStorage.setItem(key, JSON.stringify(storeMems));
  });

  var storeNames = assignedStores.map(function(s) { return s.name; }).join('、');
  closeAssignModal();
  selectedMemberIds = [];
  currentPage = 1;
  renderMembers();
  showToast('success', '已为 ' + selectedEls.length + ' 家店铺添加成员');
}

// ==================== 批量指派（打开弹窗） ====================
function openBatchAssignStore() {
  if (selectedMemberIds.length === 0) { showToast('info', '请先选择成员'); return; }
  openAssignStoreModal();
}

// ==================== 批量操作 ====================
function batchRemove() {
  if (selectedMemberIds.length === 0) { showToast('info', '请先选择成员'); return; }
  showToast('info', '已选 ' + selectedMemberIds.length + ' 名成员，可派到新店铺');
  openAssignStoreModal();
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
  renderMembers();
});
