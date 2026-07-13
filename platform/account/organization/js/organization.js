// ====== PU_CONFIG ======
window.PU_CONFIG = {
  tbodId: 'orgTableBody',
  columns: [
    { key:'name',   label:'组织名称', defaultShow:true, alwaysShow:true },
    { key:'type',   label:'组织类型', defaultShow:true, alwaysShow:false },
    { key:'parent', label:'上级组织', defaultShow:true, alwaysShow:false },
    { key:'sort',   label:'排序',     defaultShow:false,alwaysShow:false },
    { key:'status', label:'状态',     defaultShow:true, alwaysShow:false },
    { key:'actions',label:'操作',     defaultShow:true, alwaysShow:true }
  ],
  visibleCols: ['name','type','parent','sort','status','actions'],
  batchActions: [
    { name:'enable',  handler: batchEnable  },
    { name:'disable', handler: batchDisable },
    { name:'delete',  handler: batchDelete  }
  ],
  onColumnsChange: function(){ renderTable(); }
};

// ====== 组织类型配置 ======
var ORG_TYPES = {
  group:   { label: '集团', cls: 'group'   },
  company: { label: '公司', cls: 'company' },
  dept:    { label: '部门', cls: 'dept'    },
  team:    { label: '小组', cls: 'team'    }
};

// 类型层级：集团 > 公司 > 部门 > 小组
var ORG_TYPE_LEVEL = { group: 0, company: 1, dept: 2, team: 3 };

// ====== 示例数据 ======
var orgData = window.orgData = [
  { id: 'G1',  name: '瑞贝卡集团',   type: 'group',   parent: null, sort: 1, status: 'active'   },
  { id: 'C1',  name: '瑞贝卡科技',   type: 'company', parent: 'G1',  sort: 1, status: 'active'   },
  { id: 'D1',  name: '技术研发部',   type: 'dept',    parent: 'C1',  sort: 1, status: 'active'   },
  { id: 'T1',  name: '前端开发组',   type: 'team',    parent: 'D1',  sort: 1, status: 'active'   },
  { id: 'T2',  name: '后端开发组',   type: 'team',    parent: 'D1',  sort: 2, status: 'active'   },
  { id: 'D2',  name: '产品设计部',   type: 'dept',    parent: 'C1',  sort: 2, status: 'active'   },
  { id: 'T3',  name: 'UI设计组',     type: 'team',    parent: 'D2',  sort: 1, status: 'active'   },
  { id: 'C2',  name: '瑞贝卡电商',   type: 'company', parent: 'G1',  sort: 2, status: 'active'   },
  { id: 'D3',  name: '运营部',       type: 'dept',    parent: 'C2',  sort: 1, status: 'active'   },
  { id: 'T4',  name: '市场推广组',   type: 'team',    parent: 'D3',  sort: 1, status: 'active'   },
  { id: 'D4',  name: '客服部',       type: 'dept',    parent: 'C2',  sort: 2, status: 'disabled' }
];

var collapsedSet = {};

// ====== 数据工具 ======
function findNode(id) {
  for (var i = 0; i < orgData.length; i++) {
    if (orgData[i].id === id) return orgData[i];
  }
  return null;
}

function getNodeName(id) {
  var n = findNode(id);
  return n ? n.name : '--';
}

// 判断 descendantId 是否是 ancestorId 的后代
function isDescendantOf(descendantId, ancestorId) {
  var current = findNode(descendantId);
  while (current) {
    if (current.parent === ancestorId) return true;
    current = findNode(current.parent);
  }
  return false;
}

// 获取某节点下所有后代 ID 集合
function getDescendantIds(nodeId) {
  var result = [];
  function walk(pid) {
    orgData.forEach(function(item) {
      if (item.parent === pid) {
        result.push(item.id);
        walk(item.id);
      }
    });
  }
  walk(nodeId);
  return result;
}

// ====== 复选框级联选择 ======
function orgToggleCheckbox(el, nodeId) {
  puToggleCheckbox(el);
  var isChecked = el.classList.contains('checked');
  var tbody = document.getElementById('orgTableBody');
  if (!tbody) return;
  var descIds = getDescendantIds(nodeId);
  descIds.forEach(function(did) {
    var row = tbody.querySelector('tr[data-id="' + did + '"]');
    if (!row) return;
    var cb = row.querySelector('.checkbox');
    if (cb) {
      if (isChecked) { cb.classList.add('checked'); cb.innerHTML = '✓'; }
      else { cb.classList.remove('checked'); cb.innerHTML = ''; }
    }
  });
  puUpdateBulkBar();
}

// ====== 构建树 ======
function buildTree(data) {
  var map = {};
  var roots = [];
  data.forEach(function(item) {
    item.children = [];
    map[item.id] = item;
  });
  data.forEach(function(item) {
    if (item.parent && map[item.parent]) {
      map[item.parent].children.push(item);
    } else {
      roots.push(item);
    }
  });
  function sortFn(n) {
    n.children.sort(function(a, b) { return a.sort - b.sort; });
    n.children.forEach(sortFn);
  }
  roots.sort(function(a, b) { return a.sort - b.sort; });
  roots.forEach(sortFn);
  return roots;
}

// ====== 过滤数据 ======
function filterData() {
  var keyword = (document.getElementById('searchInput').value || '').toLowerCase();
  var typeVal = document.getElementById('typeFilter').value;
  var statusVal = document.getElementById('statusFilter').value;
  return orgData.filter(function(item) {
    if (keyword && item.name.toLowerCase().indexOf(keyword) === -1) return false;
    if (typeVal && item.type !== typeVal) return false;
    if (statusVal && item.status !== statusVal) return false;
    return true;
  });
}

// ====== 渲染表格 ======
function renderTable() {
  var filtered = filterData();
  var tree = buildTree(filtered);
  var tbody = document.getElementById('orgTableBody');
  var checkedIds = puSaveCheckedIds('orgTableBody');

  if (tree.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg></div><div class="empty-state-title">暂无匹配的组织</div><div class="empty-state-desc">尝试调整筛选条件或添加新的组织机构</div></div></td></tr>';
    puUpdateBulkBar();
    return;
  }

  var rows = [];
  function walk(nodes) {
    nodes.forEach(function(node) {
      var expanded = !collapsedSet[node.id];
      var hasChildren = node.children && node.children.length > 0;
      rows.push({ node: node, hasChildren: hasChildren });
      if (hasChildren && expanded) walk(node.children);
    });
  }
  walk(tree);

  var statusMap = {
    active:   { label: '启用', cls: 'badge-success'   },
    disabled: { label: '停用', cls: 'badge-secondary' }
  };

  var gripSvg = '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.3"/><circle cx="11" cy="3" r="1.3"/><circle cx="5" cy="8" r="1.3"/><circle cx="11" cy="8" r="1.3"/><circle cx="5" cy="13" r="1.3"/><circle cx="11" cy="13" r="1.3"/></svg>';

  var html = '';
  rows.forEach(function(row) {
    var node = row.node;
    var t = ORG_TYPES[node.type] || { label: node.type, cls: '' };
    var parentName = node.parent ? getNodeName(node.parent) : '--';
    var s = statusMap[node.status] || { label: node.status, cls: 'badge-secondary' };
    var depth = ORG_TYPE_LEVEL[node.type];
    var indentCls = depth > 0 ? ' indent-l' + depth : '';

    // 展开/折叠图标
    var toggleHtml = '';
    if (row.hasChildren) {
      var expClass = collapsedSet[node.id] ? '' : ' expanded';
      toggleHtml = '<span class="tree-toggle' + expClass + '" data-tid="' + node.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>';
    } else {
      toggleHtml = '<span class="tree-toggle leaf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>';
    }

    // 前置列：拖拽手柄 + 复选框
    var preColStyle = 'style="width:4%; min-width:60px; padding:0;"';
    var preHtml = '';
    if (node.type !== 'group') {
      preHtml = '<td class="pre-col" ' + preColStyle + '><div class="pre-col-wrap"><span class="drag-handle-icon" draggable="true" data-drag-id="' + node.id + '">' + gripSvg + '</span><div class="checkbox" onclick="orgToggleCheckbox(this,\'' + node.id + '\')"></div></div></td>';
    } else {
      preHtml = '<td class="pre-col" ' + preColStyle + '><div class="pre-col-wrap"><span style="width:14px;flex-shrink:0;"></span><div class="checkbox" onclick="orgToggleCheckbox(this,\'' + node.id + '\')"></div></div></td>';
    }

    html += '<tr data-id="' + node.id + '" data-type="' + node.type + '" data-parent="' + (node.parent || '') + '" data-level="' + ORG_TYPE_LEVEL[node.type] + '">';
    html += preHtml;
    html += '<td class="col-name"><div class="tree-name-cell' + (indentCls ? ' ' + indentCls : '') + '">' + toggleHtml + '<span>' + node.name + '</span></div></td>';
    html += '<td><span class="org-type ' + t.cls + '">' + t.label + '</span></td>';
    html += '<td style="color:hsl(var(--muted-foreground))">' + parentName + '</td>';
    html += '<td>' + node.sort + '</td>';
    html += '<td><span class="badge ' + s.cls + '">' + s.label + '</span></td>';
    html += '<td><div class="action-group">' +
      '<div class="action-btn" title="编辑" onclick="handleEdit(\'' + node.id + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>' +
      '<div class="action-btn danger" title="删除" onclick="handleDelete(\'' + node.id + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>' +
    '</div></td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
  puRestoreCheckedIds('orgTableBody', checkedIds);

  // 展开/折叠
  tbody.querySelectorAll('.tree-toggle:not(.leaf)').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var tid = this.dataset.tid;
      if (collapsedSet[tid]) { delete collapsedSet[tid]; }
      else { collapsedSet[tid] = true; }
      renderTable();
    });
  });

  // 拖拽
  bindDragEvents(tbody);
}

// ====== 拖拽排序 ======
var currentDragId = null;
var currentDragNode = null;

function bindDragEvents(tbody) {
  tbody.querySelectorAll('.drag-handle-icon').forEach(function(handle) {
    handle.addEventListener('dragstart', handleDragStart);
    handle.addEventListener('dragend', handleDragEnd);
  });
  tbody.querySelectorAll('tr[data-id]').forEach(function(tr) {
    tr.addEventListener('dragover', handleDragOver);
    tr.addEventListener('dragleave', handleDragLeave);
    tr.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(e) {
  var dragId = this.dataset.dragId;
  var node = findNode(dragId);
  if (!node || node.type === 'group') { e.preventDefault(); return; }
  currentDragId = dragId;
  currentDragNode = node;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragId);
  var row = this.closest('tr');
  document.body.classList.add('dragging-active');
  requestAnimationFrame(function() { if (row) row.classList.add('dragging'); });
}

function handleDragEnd(e) {
  var tbody = document.getElementById('orgTableBody');
  var row = tbody.querySelector('tr.dragging');
  if (row) row.classList.remove('dragging');
  document.body.classList.remove('dragging-active');
  clearAllDragStates();
  currentDragId = null;
  currentDragNode = null;
}

function clearAllDragStates() {
  var tbody = document.getElementById('orgTableBody');
  if (!tbody) return;
  tbody.querySelectorAll('tr').forEach(function(r) {
    r.classList.remove('drag-over-valid','drag-insert-before','drag-insert-after','drag-zone-highlight','drag-invalid');
  });
}

function handleDragOver(e) {
  if (!currentDragNode) return;
  e.preventDefault();
  var row = e.currentTarget;
  var targetId = row.dataset.id;
  if (targetId === currentDragId) { e.dataTransfer.dropEffect = 'none'; clearAllDragStates(); return; }
  if (isDescendantOf(targetId, currentDragId)) { e.dataTransfer.dropEffect = 'none'; clearAllDragStates(); row.classList.add('drag-invalid'); return; }
  var targetNode = findNode(targetId);
  if (!targetNode) { e.dataTransfer.dropEffect = 'none'; return; }
  clearAllDragStates();
  var draggedLevel = ORG_TYPE_LEVEL[currentDragNode.type];
  var targetLevel = ORG_TYPE_LEVEL[targetNode.type];
  var canBeParent = (targetLevel === draggedLevel - 1);
  var isSibling = (currentDragNode.parent === targetNode.parent && draggedLevel === targetLevel);
  if (!canBeParent && !isSibling) { e.dataTransfer.dropEffect = 'none'; row.classList.add('drag-invalid'); return; }
  row.classList.remove('drag-invalid');
  var rect = row.getBoundingClientRect();
  var y = e.clientY - rect.top;
  var inTopZone = y < rect.height * 0.3;
  var inBottomZone = y > rect.height * 0.7;
  if (canBeParent && !inTopZone && !inBottomZone) { row.classList.add('drag-over-valid'); e.dataTransfer.dropEffect = 'move'; }
  else if (isSibling && inTopZone) { row.classList.add('drag-insert-before'); e.dataTransfer.dropEffect = 'move'; }
  else if (isSibling && inBottomZone) { row.classList.add('drag-insert-after'); e.dataTransfer.dropEffect = 'move'; }
  else if (canBeParent && (inTopZone || inBottomZone)) { row.classList.add('drag-over-valid'); e.dataTransfer.dropEffect = 'move'; }
  else { e.dataTransfer.dropEffect = 'none'; }
}

function handleDragLeave(e) {
  if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
    var row = e.currentTarget;
    row.classList.remove('drag-over-valid','drag-insert-before','drag-insert-after','drag-invalid');
  }
}

function handleDrop(e) {
  e.preventDefault(); e.stopPropagation();
  if (!currentDragNode) return;
  var row = e.currentTarget;
  var targetId = row.dataset.id;
  var targetNode = findNode(targetId);
  if (!targetNode || targetId === currentDragId) return;
  var rect = row.getBoundingClientRect();
  var y = e.clientY - rect.top;
  var inTopZone = y < rect.height * 0.3;
  var inBottomZone = y > rect.height * 0.7;
  var draggedLevel = ORG_TYPE_LEVEL[currentDragNode.type];
  var targetLevel = ORG_TYPE_LEVEL[targetNode.type];
  var canBeParent = (targetLevel === draggedLevel - 1);
  var isSibling = (currentDragNode.parent === targetNode.parent && draggedLevel === targetLevel);
  if (canBeParent && !inTopZone && !inBottomZone) { moveToParent(currentDragNode, targetNode); }
  else if (isSibling) { reorderSibling(currentDragNode, targetNode, inTopZone ? 'before' : 'after'); }
  else if (canBeParent && (inTopZone || inBottomZone)) { moveToParent(currentDragNode, targetNode); }
  else { showToast('warning', '不允许跨层级拖拽，请遵循直系父子层级规则'); return; }
  clearAllDragStates();
  currentDragId = null;
  currentDragNode = null;
  renderTable();
  showToast('success', '排序已更新');
}

function moveToParent(draggedNode, newParentNode) {
  var oldParent = draggedNode.parent;
  draggedNode.parent = newParentNode.id;
  var siblings = orgData.filter(function(item) { return item.parent === newParentNode.id && item.id !== draggedNode.id; });
  var maxSort = 0;
  siblings.forEach(function(s) { if (s.sort > maxSort) maxSort = s.sort; });
  draggedNode.sort = maxSort + 1;
  if (oldParent) renumberSorts(oldParent);
}

function reorderSibling(draggedNode, targetNode, position) {
  var parentId = draggedNode.parent;
  var siblings = orgData.filter(function(item) { return item.parent === parentId && item.id !== draggedNode.id; })
    .sort(function(a, b) { return a.sort - b.sort; });
  var targetIndex = -1;
  for (var i = 0; i < siblings.length; i++) { if (siblings[i].id === targetNode.id) { targetIndex = i; break; } }
  if (targetIndex === -1) return;
  var newOrder = [];
  for (var j = 0; j < siblings.length; j++) {
    if (j === targetIndex && position === 'before') newOrder.push(draggedNode);
    newOrder.push(siblings[j]);
    if (j === targetIndex && position === 'after') newOrder.push(draggedNode);
  }
  for (var k = 0; k < newOrder.length; k++) { newOrder[k].sort = k + 1; }
}

function renumberSorts(parentId) {
  var children = orgData.filter(function(item) { return item.parent === parentId; })
    .sort(function(a, b) { return a.sort - b.sort; });
  for (var i = 0; i < children.length; i++) { children[i].sort = i + 1; }
}

// ====== 添加/编辑组织对话框 ======
function handleAdd() { openOrgFormDialog('add', null); }

function handleEdit(id) { openOrgFormDialog('edit', id); }

// 对话框委托给父页面（parent frame），以实现全屏遮罩
function openOrgFormDialog(mode, id) {
  if (window.parent && window.parent.openOrgFormDialog) {
    window.parent.openOrgFormDialog(mode, id);
  }
}

// ---- 供父页面调用的数据处理函数 ----

/** 添加组织（由父页面对话框提交触发） */
window.orgAddItem = function(type, name, parent, status) {
  var prefixMap = { group: 'G', company: 'C', dept: 'D', team: 'T' };
  var prefix = prefixMap[type];
  var maxNum = 0;
  orgData.forEach(function(item) { if (item.id.charAt(0) === prefix) { var num = parseInt(item.id.substring(1)); if (num > maxNum) maxNum = num; } });
  var newId = prefix + (maxNum + 1);
  var siblings = orgData.filter(function(item) { return item.parent === parent; });
  var maxS = 0;
  siblings.forEach(function(s) { if (s.sort > maxS) maxS = s.sort; });
  var autoSort = maxS + 1;
  orgData.push({ id: newId, name: name, type: type, parent: parent, sort: autoSort, status: status });
  showToast('success', '添加成功');
};

/** 更新组织（由父页面对话框提交触发） */
window.orgUpdateItem = function(id, type, name, parent, status) {
  var node = findNode(id);
  if (!node) { showToast('error', '组织不存在'); return; }
  node.name = name;
  // 如果有子节点，类型不允许修改（disabled），dialog_host 负责保留原类型
  var hasChildren = orgData.some(function(item) { return item.parent === id; });
  if (!hasChildren) node.type = type;

  // 若上级组织发生变更，重新计算排序号
  var newParent = parent || null;
  if (node.parent !== newParent) {
    var oldParent = node.parent;
    node.parent = newParent;
    var siblings = orgData.filter(function(item) { return item.parent === newParent; });
    var maxS = 0;
    siblings.forEach(function(s) { if (s.sort > maxS) maxS = s.sort; });
    node.sort = maxS + 1;
    if (oldParent) renumberSorts(oldParent);
  }
  node.status = status;
  showToast('success', '保存成功');
};

// ====== 删除组织对话框 ======
function handleDelete(id) {
  if (window.parent && window.parent.openOrgDeleteDialog) {
    window.parent.openOrgDeleteDialog(id);
  }
}

/** 删除组织（由父页面对话框确认触发） */
window.orgDeleteItem = function(id) {
  var descIds = getDescendantIds(id);
  var allIds = [id].concat(descIds);
  orgData = orgData.filter(function(item) { return allIds.indexOf(item.id) === -1; });
  showToast('success', '已删除 ' + allIds.length + ' 个组织');
};

// ====== 批量操作 ======
function batchEnable(ids) {
  var count = 0;
  ids.forEach(function(id) { var n = findNode(id); if (n && n.status !== 'active') { n.status = 'active'; count++; } });
  renderTable();
  showToast('success', '已启用 ' + count + ' 条');
}

function batchDisable(ids) {
  var count = 0;
  ids.forEach(function(id) { var n = findNode(id); if (n && n.status !== 'disabled') { n.status = 'disabled'; count++; } });
  renderTable();
  showToast('success', '已停用 ' + count + ' 条');
}

function batchDelete(ids) {
  if (window.parent && window.parent.openOrgBatchDeleteDialog) {
    window.parent.openOrgBatchDeleteDialog(ids);
  }
}

/** 批量删除组织（由父页面对话框确认触发） */
window.orgBatchDeleteItems = function(ids) {
  orgData = orgData.filter(function(item) { return ids.indexOf(item.id) === -1; });
  showToast('success', '已删除 ' + ids.length + ' 个组织');
};

// ====== 自定义列面板初始化 ======
function initCustomCols() {
  var config = window.PU_CONFIG;
  if (config && config.columns) {
    puBuildCustomColPanel(config.columns, config.visibleCols);
  }
}

// ====== 初始化 ======
document.addEventListener('DOMContentLoaded', function() {
  initCustomCols();
  renderTable();
  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('typeFilter').addEventListener('change', renderTable);
  document.getElementById('statusFilter').addEventListener('change', renderTable);
});

function refreshPage() {
  renderTable();
  showToast('success', '数据已刷新');
}
