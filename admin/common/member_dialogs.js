/**
 * ==================== 成员对话框共享组件 ====================
 * 被 admin/member/members.html 和 admin/shop/members.html 共同引用
 * 提供"添加成员"和"邀请成员"两个对话框的完整 UI + 交互逻辑
 * 页面通过 MDHooks 挂载自己的保存/确认回调
 *
 * 依赖：commons.css, member_dialogs.css, commons.js (showToast, loadShops)
 */

// ---- 回调钩子（页面引用此文件前设置） ----
window.MDHooks = window.MDHooks || {
  onAddMember: null,       // function(formData) - formData: {name, phone, accountId, orgDept, orgTeam, orgSubTeam, stores}
  onInviteMembers: null    // function({memberIds, selectedMembers, shopIds, selectedShops}) - 页面处理邀请逻辑
};

// ---- 公共工具函数 ----
function mpad(n) { return n < 10 ? '0' + n : '' + n; }
function mpadNum(n, len) { var s = '' + n; while (s.length < len) s = '0' + s; return s; }

var ALL_ACCOUNTS_KEY = 'rebecca_all_accounts';
function mdLoadAllAccounts() { try { var d = localStorage.getItem(ALL_ACCOUNTS_KEY); return d ? JSON.parse(d) : []; } catch(e) { return []; } }
function mdSaveAllAccounts(accounts) { localStorage.setItem(ALL_ACCOUNTS_KEY, JSON.stringify(accounts)); }

function mdGenerateAccountId() {
  var now = new Date();
  var prefix = 'AC' + now.getFullYear() + mpad(now.getMonth()+1);
  var maxNum = 0;
  var allAccounts = mdLoadAllAccounts();
  allAccounts.forEach(function(a) {
    if (a.accountId && a.accountId.indexOf(prefix) === 0) {
      var num = parseInt(a.accountId.substring(prefix.length), 10);
      if (num > maxNum) maxNum = num;
    }
  });
  var nextNum = maxNum + 1;
  if (nextNum < 1) nextNum = 1;
  return prefix + mpadNum(nextNum, 5);
}

// ---- 组织机构数据 ----
var ORG_TEAMS_MAP = {
  '总部/数码事业部': [
    { name: '数码组', subTeams: ['渠道小组'] },
    { name: '手机组', subTeams: ['旗舰小组'] },
    { name: '配件组', subTeams: [] }
  ],
  '总部/服饰事业部': [
    { name: '运动鞋组', subTeams: [] },
    { name: '服装组', subTeams: ['女装小组'] }
  ],
  '总部/美妆事业部': [
    { name: '护肤组', subTeams: [] },
    { name: '彩妆组', subTeams: [] }
  ],
  '总部/家居事业部': [
    { name: '家电组', subTeams: [] },
    { name: '家纺组', subTeams: [] }
  ],
  '总部/食品事业部': [
    { name: '进口食品组', subTeams: [] }
  ]
};

// ---- 可邀请成员池 ----
var INVITABLE_MEMBERS = [
  { id: 'im001', name: '张三', phone: '13800001001', accountId: 'AC20260700002', orgDept: '总部/数码事业部', orgTeam: '数码组', orgSubTeam: '' },
  { id: 'im002', name: '李四', phone: '13800001002', accountId: 'AC20260700003', orgDept: '总部/数码事业部', orgTeam: '数码组', orgSubTeam: '渠道小组' },
  { id: 'im003', name: '王五', phone: '13800001003', accountId: 'AC20260700004', orgDept: '总部/数码事业部', orgTeam: '手机组', orgSubTeam: '' },
  { id: 'im004', name: '赵六', phone: '13800001004', accountId: 'AC20260700005', orgDept: '总部/数码事业部', orgTeam: '手机组', orgSubTeam: '旗舰小组' },
  { id: 'im005', name: '钱七', phone: '13800001005', accountId: 'AC20260700006', orgDept: '总部/数码事业部', orgTeam: '配件组', orgSubTeam: '' },
  { id: 'im006', name: '孙八', phone: '13800001006', accountId: 'AC20260700007', orgDept: '总部/服饰事业部', orgTeam: '运动鞋组', orgSubTeam: '' },
  { id: 'im007', name: '周九', phone: '13800001007', accountId: 'AC20260700008', orgDept: '总部/服饰事业部', orgTeam: '服装组', orgSubTeam: '' },
  { id: 'im008', name: '吴十', phone: '13800001008', accountId: 'AC20260700009', orgDept: '总部/服饰事业部', orgTeam: '服装组', orgSubTeam: '女装小组' },
  { id: 'im009', name: '郑十一', phone: '13800001009', accountId: 'AC20260700010', orgDept: '总部/美妆事业部', orgTeam: '护肤组', orgSubTeam: '' },
  { id: 'im010', name: '冯十二', phone: '13800001010', accountId: 'AC20260700011', orgDept: '总部/美妆事业部', orgTeam: '彩妆组', orgSubTeam: '' },
  { id: 'im011', name: '陈十三', phone: '13800001011', accountId: 'AC20260700012', orgDept: '总部/家居事业部', orgTeam: '家电组', orgSubTeam: '' },
  { id: 'im012', name: '褚十四', phone: '13800001012', accountId: 'AC20260700013', orgDept: '总部/家居事业部', orgTeam: '家纺组', orgSubTeam: '' },
  { id: 'im013', name: '卫十五', phone: '13800001013', accountId: 'AC20260700014', orgDept: '总部/食品事业部', orgTeam: '进口食品组', orgSubTeam: '' },
  { id: 'im014', name: '蒋十六', phone: '13800001014', accountId: 'AC20260700015', orgDept: '总部/数码事业部', orgTeam: '数码组', orgSubTeam: '渠道小组' }
];

function getInviteOrgTree() {
  return [
    { id: 'iorg_zongbu', label: '总部', path: '总部', children: [
      { id: 'iorg_dzsyb', label: '数码事业部', path: '总部/数码事业部', children: [
        { id: 'iorg_dz', label: '数码组', path: '总部/数码事业部/数码组', children: [
          { id: 'iorg_dz_qd', label: '渠道小组', path: '总部/数码事业部/数码组/渠道小组' }
        ]},
        { id: 'iorg_sj', label: '手机组', path: '总部/数码事业部/手机组', children: [
          { id: 'iorg_sj_qj', label: '旗舰小组', path: '总部/数码事业部/手机组/旗舰小组' }
        ]},
        { id: 'iorg_pj', label: '配件组', path: '总部/数码事业部/配件组' }
      ]},
      { id: 'iorg_fssyb', label: '服饰事业部', path: '总部/服饰事业部', children: [
        { id: 'iorg_ydx', label: '运动鞋组', path: '总部/服饰事业部/运动鞋组' },
        { id: 'iorg_fz', label: '服装组', path: '总部/服饰事业部/服装组', children: [
          { id: 'iorg_fz_nz', label: '女装小组', path: '总部/服饰事业部/服装组/女装小组' }
        ]}
      ]},
      { id: 'iorg_mzsyd', label: '美妆事业部', path: '总部/美妆事业部', children: [
        { id: 'iorg_hf', label: '护肤组', path: '总部/美妆事业部/护肤组' },
        { id: 'iorg_cz', label: '彩妆组', path: '总部/美妆事业部/彩妆组' }
      ]},
      { id: 'iorg_jjsyd', label: '家居事业部', path: '总部/家居事业部', children: [
        { id: 'iorg_jd', label: '家电组', path: '总部/家居事业部/家电组' },
        { id: 'iorg_jf', label: '家纺组', path: '总部/家居事业部/家纺组' }
      ]},
      { id: 'iorg_spsyd', label: '食品事业部', path: '总部/食品事业部', children: [
        { id: 'iorg_jksp', label: '进口食品组', path: '总部/食品事业部/进口食品组' }
      ]}
    ]}
  ];
}

function getInviteMemsByPath(orgPath) {
  return INVITABLE_MEMBERS.filter(function(m) {
    var full = m.orgDept;
    if (m.orgTeam) full += '/' + m.orgTeam;
    if (m.orgSubTeam) full += '/' + m.orgSubTeam;
    return full === orgPath;
  });
}

function getInviteMemsByChildren(node) {
  var paths = [node.path];
  function collect(n) { if (n.children) { n.children.forEach(function(c) { paths.push(c.path); collect(c); }); } }
  collect(node);
  return INVITABLE_MEMBERS.filter(function(m) {
    var full = m.orgDept;
    if (m.orgTeam) full += '/' + m.orgTeam;
    if (m.orgSubTeam) full += '/' + m.orgSubTeam;
    return paths.indexOf(full) !== -1;
  });
}

// ==================== 添加成员弹窗 ====================

window.openAddMemberModal = function() {
  var shops = loadShops();
  var overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.id = 'addMemberModalOverlay';
  overlay.innerHTML =
    '<div class="dialog add-member-dialog">' +
      '<div class="dialog-header"><div class="dialog-title">添加成员</div><button class="dialog-close" onclick="closeAddMemberModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
      '<div class="dialog-desc">创建新成员账号，并指定所在店铺</div>' +
      '<div class="dialog-body">' +
        '<div class="form-group">' +
          '<label class="form-label">姓名</label>' +
          '<input class="form-input" id="addMemberName" placeholder="请输入成员姓名" />' +
          '<div class="form-error" id="addNameError">请输入姓名</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">手机号</label>' +
          '<input class="form-input" id="addMemberPhone" placeholder="请输入手机号" />' +
          '<div class="form-error" id="addPhoneError">请输入手机号</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">组织机构</label>' +
          '<select class="form-input" id="addMemberOrgDept" onchange="onAddDeptChange()">' +
            '<option value="">请选择分公司/部门</option>' +
            '<option value="总部/数码事业部">总部/数码事业部</option>' +
            '<option value="总部/服饰事业部">总部/服饰事业部</option>' +
            '<option value="总部/美妆事业部">总部/美妆事业部</option>' +
            '<option value="总部/家居事业部">总部/家居事业部</option>' +
            '<option value="总部/食品事业部">总部/食品事业部</option>' +
          '</select>' +
          '<div class="form-error" id="addOrgError">请选择组织机构</div>' +
        '</div>' +
        '<div class="form-group" id="addMemberTeamGroup" style="display:none">' +
          '<label class="form-label">小组</label>' +
          '<select class="form-input" id="addMemberOrgTeam" onchange="onAddTeamChange()">' +
            '<option value="">请选择小组</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group" id="addMemberSubTeamGroup" style="display:none">' +
          '<label class="form-label">子小组（可选）</label>' +
          '<select class="form-input" id="addMemberOrgSubTeam">' +
            '<option value="">无</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">所在店铺</label>' +
          '<div class="store-check-grid" id="addStoreCheckGrid">' +
            shops.map(function(s) {
              return '<div class="store-check-item" data-shop-id="' + s.id + '" onclick="toggleAddStoreCheck(this)">' +
                '<span class="sci-dot" style="background:' + (s.color || '#8B9A7C') + '"></span>' +
                '<span>' + s.name + '</span></div>';
            }).join('') +
          '</div>' +
          '<div class="form-error" id="addStoreError">请至少选择一家店铺</div>' +
        '</div>' +
      '</div>' +
      '<div class="dialog-actions">' +
        '<button class="btn btn-secondary" onclick="closeAddMemberModal()">取消</button>' +
        '<button class="btn btn-primary" onclick="doAddMember()">确认添加</button>' +
      '</div>' +
    '</div>';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeAddMemberModal(); });
  document.body.appendChild(overlay);
  overlay.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeAddMemberModal(); });
};

window.closeAddMemberModal = function() {
  var ov = document.getElementById('addMemberModalOverlay');
  if (ov) ov.remove();
  window._addDeptTeams = null;
};

window.onAddDeptChange = function() {
  var deptVal = document.getElementById('addMemberOrgDept').value;
  var teamGroup = document.getElementById('addMemberTeamGroup');
  var teamSelect = document.getElementById('addMemberOrgTeam');
  var subTeamGroup = document.getElementById('addMemberSubTeamGroup');
  var subTeamSelect = document.getElementById('addMemberOrgSubTeam');

  teamSelect.innerHTML = '<option value="">请选择小组</option>';
  subTeamSelect.innerHTML = '<option value="">无</option>';
  teamGroup.style.display = 'none';
  subTeamGroup.style.display = 'none';

  if (deptVal && ORG_TEAMS_MAP[deptVal]) {
    var teams = ORG_TEAMS_MAP[deptVal];
    teams.forEach(function(t) {
      teamSelect.innerHTML += '<option value="' + t.name + '">' + t.name + '</option>';
    });
    teamGroup.style.display = 'block';
    window._addDeptTeams = teams;
  }
};

window.onAddTeamChange = function() {
  var deptVal = document.getElementById('addMemberOrgDept').value;
  var teamVal = document.getElementById('addMemberOrgTeam').value;
  var subTeamGroup = document.getElementById('addMemberSubTeamGroup');
  var subTeamSelect = document.getElementById('addMemberOrgSubTeam');

  subTeamSelect.innerHTML = '<option value="">无</option>';
  subTeamGroup.style.display = 'none';

  if (deptVal && teamVal && ORG_TEAMS_MAP[deptVal]) {
    var teams = ORG_TEAMS_MAP[deptVal];
    var team = teams.find(function(t) { return t.name === teamVal; });
    if (team && team.subTeams.length > 0) {
      team.subTeams.forEach(function(st) {
        subTeamSelect.innerHTML += '<option value="' + st + '">' + st + '</option>';
      });
      subTeamGroup.style.display = 'block';
    }
  }
};

window.toggleAddStoreCheck = function(el) {
  el.classList.toggle('selected');
};

window.doAddMember = function() {
  var name = document.getElementById('addMemberName').value.trim();
  var phone = document.getElementById('addMemberPhone').value.trim();
  var accountId = mdGenerateAccountId();
  var orgDept = document.getElementById('addMemberOrgDept').value;
  var orgTeam = document.getElementById('addMemberOrgTeam').value;
  var orgSubTeam = document.getElementById('addMemberOrgSubTeam').value;

  var valid = true;
  if (!name) { document.getElementById('addNameError').style.display = 'block'; valid = false; }
  else { document.getElementById('addNameError').style.display = 'none'; }
  if (!phone) { document.getElementById('addPhoneError').style.display = 'block'; valid = false; }
  else { document.getElementById('addPhoneError').style.display = 'none'; }
  if (!orgDept || !orgTeam) { document.getElementById('addOrgError').style.display = 'block'; valid = false; }
  else { document.getElementById('addOrgError').style.display = 'none'; }

  var selectedStores = document.querySelectorAll('#addStoreCheckGrid .store-check-item.selected');
  if (selectedStores.length === 0) { document.getElementById('addStoreError').style.display = 'block'; valid = false; }
  else { document.getElementById('addStoreError').style.display = 'none'; }

  if (!valid) return;

  var stores = [];
  var allShops = loadShops();
  selectedStores.forEach(function(el) {
    var sid = el.getAttribute('data-shop-id');
    var shop = allShops.find(function(s) { return s.id === sid; });
    if (shop) stores.push({ id: shop.id, name: shop.name, domain: shop.domain, color: shop.color });
  });

  var now = new Date();
  var joinedAt = now.getFullYear() + '-' + mpad(now.getMonth()+1) + '-' + mpad(now.getDate()) + ' ' + mpad(now.getHours()) + ':' + mpad(now.getMinutes());

  var formData = {
    name: name, phone: phone, accountId: accountId,
    orgDept: orgDept, orgTeam: orgTeam, orgSubTeam: orgSubTeam || '',
    stores: stores, joinedAt: joinedAt
  };

  closeAddMemberModal();

  // 调用页面注册的回调
  if (typeof window.MDHooks.onAddMember === 'function') {
    window.MDHooks.onAddMember(formData);
  }
};

// ==================== 邀请成员弹窗 ====================

var inviteState = { selectedMemberIds: [], selectedShopIds: [], expandedOrgs: {}, searchQuery: '' };

window.openInviteMemberModal = function() {
  inviteState = { selectedMemberIds: [], selectedShopIds: [], expandedOrgs: {}, searchQuery: '' };
  var overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.id = 'inviteMemberModalOverlay';
  overlay.innerHTML = '<div class="dialog invite-dialog">' +
    '<div class="dialog-header"><div class="dialog-title">邀请成员</div><button class="dialog-close" onclick="closeInviteMemberModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
    '<div class="dialog-desc">选择成员并指定要加入的店铺，确认后成员将获得对应店铺的访问权限</div>' +
    '<div class="dialog-body">' +
      '<div class="invite-panels">' +
        '<div class="invite-left">' +
          '<div class="invite-search"><input class="invite-search-input" id="inviteSearchInput" placeholder="搜索姓名或手机号..." /></div>' +
          '<div class="invite-tree" id="inviteTree"></div>' +
        '</div>' +
        '<div class="invite-right">' +
          '<div class="invite-right-title"><span>选择店铺</span><button class="clear-link" onclick="clearInviteShops()">清空</button></div>' +
          '<div class="invite-shop-list" id="inviteShopList"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="invite-footer">' +
      '<span class="invite-footer-info">已选择 <strong id="inviteSelectedCount">0</strong> 名成员，<strong id="inviteShopCount">0</strong> 家店铺</span>' +
      '<div class="dialog-actions" style="margin:0;">' +
        '<button class="btn btn-secondary" onclick="closeInviteMemberModal()">取消</button>' +
        '<button class="btn btn-primary" id="inviteConfirmBtn" onclick="doInviteMembers()" disabled>确认邀请</button>' +
      '</div>' +
    '</div>' +
  '</div>';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeInviteMemberModal(); });
  document.body.appendChild(overlay);
  renderInviteTree();
  renderInviteShops();
  var si = document.getElementById('inviteSearchInput');
  if (si) { si.addEventListener('input', function() { inviteState.searchQuery = this.value; renderInviteTree(); }); }
  overlay.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeInviteMemberModal(); });
};

window.closeInviteMemberModal = function() {
  var ov = document.getElementById('inviteMemberModalOverlay');
  if (ov) ov.remove();
};

function renderInviteTree() {
  var ct = document.getElementById('inviteTree');
  if (!ct) return;
  var q = inviteState.searchQuery.trim().toLowerCase();

  if (q) {
    var matched = INVITABLE_MEMBERS.filter(function(m) { return m.name.toLowerCase().indexOf(q) !== -1 || m.phone.indexOf(q) !== -1 || m.accountId.toLowerCase().indexOf(q) !== -1; });
    ct.innerHTML = matched.length === 0 ? '<div class="it-no-result">未找到匹配的成员</div>' : matched.map(renderInviteMemberNode).join('');
    return;
  }

  ct.innerHTML = getInviteOrgTree().map(renderInviteOrgNode).join('');
}

function renderInviteOrgNode(node) {
  var isExp = inviteState.expandedOrgs[node.id] === true;
  var cm = getInviteMemsByChildren(node);
  var total = cm.length;
  var availIds = cm.map(function(m) { return m.id; });
  var allSel = availIds.length > 0 && availIds.every(function(id) { return inviteState.selectedMemberIds.indexOf(id) !== -1; });
  var partSel = availIds.length > 0 && !allSel && availIds.some(function(id) { return inviteState.selectedMemberIds.indexOf(id) !== -1; });

  var h = '<div class="it-node' + (allSel || partSel ? ' checked' : '') + '" onclick="toggleInviteOrg(event,\'' + node.id + '\')">';
  if (node.children) { h += '<span class="it-expand' + (isExp ? ' open' : '') + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></span>'; }
  else { h += '<span class="it-expand"></span>'; }
  h += '<span class="it-cb"></span><svg class="it-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>';
  h += '<span class="it-label">' + node.label + '</span><span class="it-extra">' + total + '</span></div>';

  if (node.children && isExp) {
    h += '<div class="it-children">';
    node.children.forEach(function(cn) {
      h += renderInviteOrgNode(cn);
      getInviteMemsByPath(cn.path).forEach(function(m) { h += renderInviteMemberNode(m); });
    });
    h += '</div>';
  }
  return h;
}

function renderInviteMemberNode(m) {
  var sel = inviteState.selectedMemberIds.indexOf(m.id) !== -1;
  var orgShow = m.orgTeam || '';
  if (m.orgSubTeam) orgShow += ' > ' + m.orgSubTeam;
  return '<div class="it-node member' + (sel ? ' checked' : '') + '" onclick="toggleInviteMember(event,\'' + m.id + '\')">' +
    '<span class="it-expand"></span><span class="it-cb"></span>' +
    '<svg class="it-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
    '<span class="it-label">' + m.name + ' <span style="font-size:11px;color:#9B8E85">' + m.phone + '</span></span>' +
    '<span class="it-extra" style="font-size:11px;color:#9B8E85">' + orgShow + '</span></div>';
}

window.toggleInviteOrg = function(event, nodeId) {
  event.stopPropagation();
  if (event.target.closest('.it-expand')) {
    inviteState.expandedOrgs[nodeId] = !inviteState.expandedOrgs[nodeId];
    renderInviteTree();
    return;
  }
  var tree = getInviteOrgTree();
  function find(nodes, id) { for (var i = 0; i < nodes.length; i++) { if (nodes[i].id === id) return nodes[i]; if (nodes[i].children) { var f = find(nodes[i].children, id); if (f) return f; } } return null; }
  var node = find(tree, nodeId);
  if (!node) return;
  var allMems = node.children ? getInviteMemsByChildren(node) : getInviteMemsByPath(node.path);
  var allIds = allMems.map(function(m) { return m.id; });
  var allSel = allIds.length > 0 && allIds.every(function(id) { return inviteState.selectedMemberIds.indexOf(id) !== -1; });
  if (allSel) { inviteState.selectedMemberIds = inviteState.selectedMemberIds.filter(function(id) { return allIds.indexOf(id) === -1; }); }
  else { allIds.forEach(function(id) { if (inviteState.selectedMemberIds.indexOf(id) === -1) inviteState.selectedMemberIds.push(id); }); }
  updateInviteFooter();
  renderInviteTree();
};

window.toggleInviteMember = function(event, memberId) {
  event.stopPropagation();
  var idx = inviteState.selectedMemberIds.indexOf(memberId);
  if (idx !== -1) { inviteState.selectedMemberIds.splice(idx, 1); } else { inviteState.selectedMemberIds.push(memberId); }
  updateInviteFooter();
  renderInviteTree();
};

function renderInviteShops() {
  var ct = document.getElementById('inviteShopList');
  if (!ct) return;
  var shops = loadShops();
  if (shops.length === 0) { ct.innerHTML = '<div class="invite-shop-empty">暂无可选店铺</div>'; return; }
  ct.innerHTML = shops.map(function(s) {
    var sel = inviteState.selectedShopIds.indexOf(s.id) !== -1;
    return '<div class="invite-shop-item' + (sel ? ' selected' : '') + '" onclick="toggleInviteShop(\'' + s.id + '\')">' +
      '<span class="s-dot" style="background:' + (s.color || '#8B9A7C') + '"></span>' +
      '<div class="s-info"><div class="s-name">' + s.name + '</div><div class="s-domain">' + (s.domain || '') + '</div></div>' +
      '<span class="s-check"></span></div>';
  }).join('');
  updateInviteFooter();
}

window.toggleInviteShop = function(shopId) {
  var idx = inviteState.selectedShopIds.indexOf(shopId);
  if (idx !== -1) { inviteState.selectedShopIds.splice(idx, 1); } else { inviteState.selectedShopIds.push(shopId); }
  renderInviteShops();
};

window.clearInviteShops = function() {
  inviteState.selectedShopIds = [];
  renderInviteShops();
};

function updateInviteFooter() {
  var mc = document.getElementById('inviteSelectedCount');
  var sc = document.getElementById('inviteShopCount');
  var btn = document.getElementById('inviteConfirmBtn');
  if (mc) mc.textContent = inviteState.selectedMemberIds.length;
  if (sc) sc.textContent = inviteState.selectedShopIds.length;
  if (btn) btn.disabled = inviteState.selectedMemberIds.length === 0 || inviteState.selectedShopIds.length === 0;
}

window.doInviteMembers = function() {
  if (inviteState.selectedMemberIds.length === 0 || inviteState.selectedShopIds.length === 0) return;

  // 收集选中的成员详情
  var selectedMembers = inviteState.selectedMemberIds.map(function(mid) {
    return INVITABLE_MEMBERS.find(function(m) { return m.id === mid; });
  }).filter(Boolean);

  // 收集选中的店铺详情
  var shops = loadShops();
  var selectedShops = inviteState.selectedShopIds.map(function(sid) {
    return shops.find(function(s) { return s.id === sid; });
  }).filter(Boolean);

  closeInviteMemberModal();

  // 调用页面注册的回调
  if (typeof window.MDHooks.onInviteMembers === 'function') {
    window.MDHooks.onInviteMembers({
      memberIds: inviteState.selectedMemberIds,
      selectedMembers: selectedMembers,
      shopIds: inviteState.selectedShopIds,
      selectedShops: selectedShops
    });
  }
};
