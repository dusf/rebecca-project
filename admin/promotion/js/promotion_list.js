/* ==================== 促销列表 JS — PRD V4.0 ==================== */

// 从父窗口恢复持久化数据（跨 iframe 页面导航保留）
(function initStore() {
  try {
    if (window.parent && window.parent._promoStore && window.parent._promoStore.data) {
      window._promoStore = window.parent._promoStore;
    } else {
      window._promoStore = { data: null, initialized: false };
      window.parent._promoStore = window._promoStore;
    }
    // 检查是否有 sessionStorage 中待合并的数据（降级方案）
    try {
      var savedData = sessionStorage.getItem('pfSaveData');
      var saveMode = sessionStorage.getItem('pfSaveMode');
      if (savedData && saveMode) {
        var parsed = JSON.parse(savedData);
        if (saveMode === 'edit' && window._promoStore.data) {
          var idx = window._promoStore.data.findIndex(function(d) { return d.id === parsed.id; });
          if (idx !== -1) window._promoStore.data[idx] = parsed;
        } else if (saveMode === 'add') {
          window._promoStore.data = window._promoStore.data || [];
          window._promoStore.data.push(parsed);
        }
        sessionStorage.removeItem('pfSaveData');
        sessionStorage.removeItem('pfSaveMode');
      }
    } catch(e) {}
  } catch(e) {
    window._promoStore = { data: null, initialized: false };
  }
})();

// ==================== 模拟数据 ====================
var pAllData = (window._promoStore && window._promoStore.data) || [
  // ---- 订单金额折扣（order_amount）----
  {
    id: 'PO-001', name: '全场满99减20', code: 'SAVE20', type: 'order_amount', method: 'code',
    valueType: 'percent', value: 20, minType: 'amount', minAmount: 99, minQty: 0,
    eligibility: 'all', targetCustomers: [],
    startDate: '2026-01-01 00:00', endDate: '2026-12-31 23:59', longTerm: false,
    stacking: ['order'], usageLimit: { totalEnabled: true, total: 5000, perCustomer: false },
    status: 'active',
    salesAmount: 156200, discountAmount: 34160, orderCount: 1342, totalUsage: 1258,
    createdAt: '2025-12-20', description: '全场订单满$99享8折'
  },
  {
    id: 'PO-002', name: '会员满150减30', code: null, type: 'order_amount', method: 'automatic',
    valueType: 'fixed', value: 30, minType: 'amount', minAmount: 150, minQty: 0,
    eligibility: 'registered', targetCustomers: [],
    startDate: '2026-03-01 00:00', endDate: '2026-06-30 23:59', longTerm: false,
    stacking: ['order', 'product'], usageLimit: null,
    status: 'active',
    salesAmount: 218900, discountAmount: 41150, orderCount: 823, totalUsage: 823,
    createdAt: '2026-02-15', description: '注册会员订单满$150自动减$30'
  },
  {
    id: 'PO-003', name: '订阅用户首单9折', code: null, type: 'order_amount', method: 'automatic',
    valueType: 'percent', value: 10, minType: 'none', minAmount: 0, minQty: 0,
    eligibility: 'subscribed', targetCustomers: [],
    startDate: '2026-08-01 00:00', endDate: '2026-12-31 23:59', longTerm: false,
    stacking: [], usageLimit: null,
    status: 'active',
    salesAmount: 0, discountAmount: 0, orderCount: 0, totalUsage: 0,
    createdAt: '2026-07-10', description: '订阅用户首单享9折（未开始）'
  },
  {
    id: 'PO-004', name: '指定客户满3件减50', code: 'VIP50', type: 'order_amount', method: 'code',
    valueType: 'fixed', value: 50, minType: 'qty', minAmount: 0, minQty: 3,
    eligibility: 'specific', targetCustomers: [ { id: 'C-001', name: '张三' }, { id: 'C-002', name: '李四' } ],
    startDate: '2026-07-01 00:00', endDate: '2026-09-30 23:59', longTerm: false,
    stacking: ['order'], usageLimit: { totalEnabled: false, total: 0, perCustomer: true },
    status: 'active',
    salesAmount: 153200, discountAmount: 26700, orderCount: 445, totalUsage: 445,
    createdAt: '2026-06-20', description: '指定客户订单满3件减$50，每客户限一次'
  },

  // ---- 产品金额折扣（product_amount）----
  {
    id: 'PP-001', name: '接发系列满减', code: 'HAIR20', type: 'product_amount', method: 'code',
    valueType: 'percent', value: 20, minType: 'none', minAmount: 0, minQty: 0,
    eligibility: 'all', targetCustomers: [],
    scope: { type: 'collection', collections: [ { id: 'COL-001', name: '接发系列' } ], products: [] },
    startDate: '2026-04-01 00:00', endDate: '2026-07-31 23:59', longTerm: false,
    stacking: ['product'], usageLimit: { totalEnabled: true, total: 2000, perCustomer: false },
    status: 'active',
    salesAmount: 78300, discountAmount: 12240, orderCount: 612, totalUsage: 612,
    createdAt: '2026-03-25', description: '接发系列产品享8折'
  },
  {
    id: 'PP-002', name: '指定SKU满100减15', code: null, type: 'product_amount', method: 'automatic',
    valueType: 'fixed', value: 15, minType: 'amount', minAmount: 100, minQty: 0,
    eligibility: 'all', targetCustomers: [],
    scope: { type: 'product', collections: [], products: [ { id: 'P-101', name: '经典款头套', sku: 'WIG-CLASSIC' } ] },
    startDate: '2026-05-01 00:00', endDate: '2026-09-30 23:59', longTerm: false,
    stacking: ['product'], usageLimit: null,
    status: 'active',
    salesAmount: 54200, discountAmount: 8670, orderCount: 289, totalUsage: 289,
    createdAt: '2026-04-20', description: '指定SKU满$100自动减$15'
  },
  {
    id: 'PP-003', name: '头套系列满2件减25%', code: 'WIG30', type: 'product_amount', method: 'code',
    valueType: 'percent', value: 25, minType: 'qty', minAmount: 0, minQty: 2,
    eligibility: 'all', targetCustomers: [],
    scope: { type: 'collection', collections: [ { id: 'COL-002', name: '头套系列' } ], products: [] },
    startDate: '2026-06-01 00:00', endDate: '2026-08-31 23:59', longTerm: false,
    stacking: ['product', 'order'], usageLimit: { totalEnabled: false, total: 0, perCustomer: false },
    status: 'disabled',
    salesAmount: 0, discountAmount: 0, orderCount: 0, totalUsage: 0,
    createdAt: '2026-05-20', description: '头套系列满2件享75折（已禁用）'
  },

  // ---- 买X送Y（xgy）----
  {
    id: 'PX-001', name: '买2送1免费', code: 'BUY2GET1', type: 'xgy', method: 'code',
    buyType: 'qty', buyQty: 2, buyAmount: 0,
    buyScope: { type: 'collection', collections: [ { id: 'COL-001', name: '接发系列' } ], products: [] },
    giftScope: { type: 'collection', collections: [ { id: 'COL-001', name: '接发系列' } ], products: [] },
    giftQty: 1, giftDiscountType: 'free', giftPercent: 0, giftFixed: 0, maxPerOrder: 0,
    eligibility: 'all', targetCustomers: [],
    startDate: '2026-03-15 00:00', endDate: '2026-06-15 23:59', longTerm: false,
    stacking: ['product'], usageLimit: { totalEnabled: true, total: 1500, perCustomer: false },
    status: 'active',
    salesAmount: 31600, discountAmount: 15800, orderCount: 476, totalUsage: 476,
    createdAt: '2026-03-10', description: '接发系列买2件送1件（免费）'
  },
  {
    id: 'PX-002', name: '买2件第二件半价', code: null, type: 'xgy', method: 'automatic',
    buyType: 'qty', buyQty: 2, buyAmount: 0,
    buyScope: { type: 'collection', collections: [ { id: 'COL-002', name: '头套系列' } ], products: [] },
    giftScope: { type: 'collection', collections: [ { id: 'COL-002', name: '头套系列' } ], products: [] },
    giftQty: 1, giftDiscountType: 'percent', giftPercent: 50, giftFixed: 0, maxPerOrder: 1,
    eligibility: 'all', targetCustomers: [],
    startDate: '2026-06-01 00:00', endDate: '2026-08-31 23:59', longTerm: false,
    stacking: ['product', 'order'], usageLimit: null,
    status: 'active',
    salesAmount: 72300, discountAmount: 18075, orderCount: 892, totalUsage: 892,
    createdAt: '2026-05-20', description: '头套系列买2件，第二件半价'
  },
  {
    id: 'PX-003', name: '满100送1件减10', code: 'BOGO10', type: 'xgy', method: 'code',
    buyType: 'amount', buyQty: 0, buyAmount: 100,
    buyScope: { type: 'collection', collections: [ { id: 'COL-003', name: '发饰配件' } ], products: [] },
    giftScope: { type: 'collection', collections: [ { id: 'COL-003', name: '发饰配件' } ], products: [] },
    giftQty: 1, giftDiscountType: 'fixed', giftPercent: 0, giftFixed: 10, maxPerOrder: 3,
    eligibility: 'all', targetCustomers: [],
    startDate: '2026-07-01 00:00', endDate: '2026-09-30 23:59', longTerm: false,
    stacking: ['product'], usageLimit: { totalEnabled: false, total: 0, perCustomer: true },
    status: 'active',
    salesAmount: 12400, discountAmount: 3100, orderCount: 134, totalUsage: 134,
    createdAt: '2026-06-15', description: '发饰配件满$100送1件，每件减$10'
  },

  // ---- 运费折扣（shipping）----
  {
    id: 'PS-001', name: '全球免邮码', code: 'SHIPFREE', type: 'shipping', method: 'code',
    countryType: 'all', countries: [], excludeAbove: 0,
    eligibility: 'all', targetCustomers: [],
    startDate: '2026-01-01 00:00', endDate: '2026-12-31 23:59', longTerm: false,
    stacking: ['shipping'], usageLimit: { totalEnabled: true, total: 10000, perCustomer: false },
    status: 'active',
    salesAmount: 289600, discountAmount: 26940, orderCount: 4523, totalUsage: 4523,
    createdAt: '2026-01-01', description: '输入折扣码享全球免邮'
  },
  {
    id: 'PS-002', name: '指定国家长期免邮', code: null, type: 'shipping', method: 'automatic',
    countryType: 'specific', countries: [ 'US', 'CA', 'GB' ], excludeAbove: 0,
    eligibility: 'all', targetCustomers: [],
    startDate: '2026-01-01 00:00', endDate: '', longTerm: true,
    stacking: ['shipping'], usageLimit: null,
    status: 'active',
    salesAmount: 1154300, discountAmount: 62300, orderCount: 12890, totalUsage: 12890,
    createdAt: '2026-01-01', description: '美加英三国订单自动免邮（长期有效）'
  },
  {
    id: 'PS-003', name: '满50免邮码', code: 'FREESHIP50', type: 'shipping', method: 'code',
    countryType: 'all', countries: [], excludeAbove: 50,
    eligibility: 'all', targetCustomers: [],
    startDate: '2026-01-01 00:00', endDate: '2026-12-31 23:59', longTerm: false,
    stacking: ['shipping'], usageLimit: { totalEnabled: false, total: 0, perCustomer: false },
    status: 'active',
    salesAmount: 167400, discountAmount: 12080, orderCount: 2678, totalUsage: 2678,
    createdAt: '2026-01-01', description: '订单满$50输入折扣码免邮'
  },
  {
    id: 'PS-004', name: '美加新客首单免邮', code: null, type: 'shipping', method: 'automatic',
    countryType: 'specific', countries: [ 'US', 'CA' ], excludeAbove: 79,
    eligibility: 'all', targetCustomers: [],
    startDate: '2025-12-01 00:00', endDate: '2026-06-30 23:59', longTerm: false,
    stacking: [], usageLimit: null,
    status: 'active',
    salesAmount: 185200, discountAmount: 9800, orderCount: 2341, totalUsage: 2341,
    createdAt: '2025-11-01', description: '美加新客首单免邮（已过期）'
  },
  {
    id: 'PS-005', name: '双11全球免邮预热', code: 'VIPSHIP', type: 'shipping', method: 'code',
    countryType: 'all', countries: [], excludeAbove: 0,
    eligibility: 'subscribed', targetCustomers: [],
    startDate: '2026-11-01 00:00', endDate: '2026-11-11 23:59', longTerm: false,
    stacking: ['shipping'], usageLimit: { totalEnabled: true, total: 5000, perCustomer: true },
    status: 'active',
    salesAmount: 0, discountAmount: 0, orderCount: 0, totalUsage: 0,
    createdAt: '2026-07-15', description: '订阅用户双11期间输入折扣码全球免邮（未开始）'
  }
];

// 持久化到父窗口
function pSyncToParent() {
  try {
    window.parent._promoStore.data = pAllData;
  } catch(e) {}
}
pSyncToParent();

// ==================== 列配置 ====================
var pColumnConfig = [
  { key: 'checkbox', label: '', width: '44px', fixed: 'left', visible: true, sortable: false, isCheckbox: true },
  { key: 'promoInfo', label: '折扣信息', width: '220px', fixed: 'left', visible: true, sortable: false },
  { key: 'status', label: '状态', width: '90px', fixed: null, visible: true, sortable: false },
  { key: 'type', label: '类型', width: '92px', fixed: null, visible: true, sortable: false },
  { key: 'valueInfo', label: '优惠内容', width: '190px', fixed: null, visible: true, sortable: false },
  { key: 'method', label: '方式', width: '90px', fixed: null, visible: true, sortable: false },
  { key: 'eligibility', label: '适用范围', width: '100px', fixed: null, visible: true, sortable: false },
  { key: 'usage', label: '使用量', width: '130px', fixed: null, visible: true, sortable: true },
  { key: 'salesAmount', label: 'GMV', width: '110px', fixed: null, visible: false, locked: true, sortable: true },
  { key: 'discountAmount', label: '优惠额', width: '110px', fixed: null, visible: false, locked: true, sortable: true },
  { key: 'orderCount', label: '订单数', width: '100px', fixed: null, visible: false, locked: true, sortable: true },
  { key: 'validity', label: '有效期', width: '150px', fixed: null, visible: true, sortable: true },
  { key: 'actions', label: '', width: '120px', fixed: 'right', visible: true, sortable: false, isAction: true }
];

// ==================== 状态 ====================
var pFilteredData = [];
var pCurrentPage = 1;
var pPageSize = 10;
var pSortKey = null;
var pSortDir = 'desc';
var pSelectedIds = {};
var pFilters = { type: '', method: '', status: '', search: '' };

// ==================== 类型/方法/状态标签映射 ====================
var TYPE_LABELS = { order_amount: '订单金额折扣', product_amount: '产品金额折扣', xgy: '买X送Y', shipping: '运费折扣' };
var METHOD_LABELS = { code: '折扣码', automatic: '自动折扣' };
var STATUS_LABELS = { active: '进行中', disabled: '已禁用', expired: '已过期', scheduled: '未开始' };

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  pApplyFilters();
  pRenderCustomColPanel();
  document.addEventListener('click', pCloseDropdowns);
  // 更新计数
  document.getElementById('promoCount').textContent = '(' + pAllData.length + '个)';
});

// ==================== 工具：日期/状态派生 ====================
function pDatePart(s) {
  if (!s) return '';
  return s.slice(0, 10);
}
function pComputeStatus(d) {
  if (d.status === 'disabled' || d.status === 'archived') return d.status;
  if (d.status === 'scheduled' || d.status === 'expired') return d.status;
  var now = new Date();
  var start = d.startDate ? new Date(d.startDate.replace(' ', 'T')) : null;
  var end = d.endDate ? new Date(d.endDate.replace(' ', 'T')) : null;
  if (end && end.getTime() < now.getTime()) return 'expired';
  if (start && start.getTime() > now.getTime()) return 'scheduled';
  return 'active';
}

// ==================== 过滤与排序 ====================
function pApplyFilters() {
  var search = (document.getElementById('searchInput') || {}).value || '';
  pFilters.search = search.toLowerCase();

  // 同步 filter-select 值到 pFilters
  pFilters.type = (document.getElementById('typeFilter') || {}).value || '';
  pFilters.method = (document.getElementById('methodFilter') || {}).value || '';
  pFilters.status = (document.getElementById('statusFilter') || {}).value || '';

  var dateFrom = (document.getElementById('dateFrom') || {}).value || '';
  var dateTo = (document.getElementById('dateTo') || {}).value || '';

  var data = pAllData.slice();

  if (pFilters.type) data = data.filter(function(d) { return d.type === pFilters.type; });
  if (pFilters.method) data = data.filter(function(d) { return d.method === pFilters.method; });
  if (pFilters.status) data = data.filter(function(d) { return pComputeStatus(d) === pFilters.status; });
  if (dateFrom) data = data.filter(function(d) { return d.startDate && pDatePart(d.startDate) >= dateFrom; });
  if (dateTo) data = data.filter(function(d) { return d.endDate && pDatePart(d.endDate) <= dateTo; });
  if (pFilters.search) {
    data = data.filter(function(d) {
      return (d.name && d.name.toLowerCase().indexOf(pFilters.search) !== -1)
        || (d.code && d.code.toLowerCase().indexOf(pFilters.search) !== -1)
        || (d.id && d.id.toLowerCase().indexOf(pFilters.search) !== -1);
    });
  }

  // 排序
  if (pSortKey) {
    data.sort(function(a, b) {
      var va = a[pSortKey], vb = b[pSortKey];
      if (va == null) va = 0;
      if (vb == null) vb = 0;
      if (typeof va === 'string') {
        return pSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return pSortDir === 'asc' ? va - vb : vb - va;
    });
  }

  pFilteredData = data;
  pCurrentPage = Math.min(pCurrentPage, Math.ceil(data.length / pPageSize) || 1);
  pSelectedIds = {};
  pRenderTable();
  pRenderPagination();
  pUpdateBulkBar();
}

function pSetSort(key) {
  if (pSortKey === key) {
    pSortDir = pSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    pSortKey = key;
    pSortDir = 'desc';
  }
  pApplyFilters();
}

// ==================== 表格渲染 ====================
function pRenderTable() {
  pRenderTableHead();
  pRenderTableBody();
}

function pRenderTableHead() {
  var thead = document.getElementById('promoTableHead');
  if (!thead) return;

  var visibleCols = pColumnConfig.filter(function(c) { return c.visible; });
  var leftFixedCount = 0;
  var html = '<tr>';
  visibleCols.forEach(function(col) {
    var cls = [];
    if (col.fixed === 'left') {
      leftFixedCount++;
      if (leftFixedCount === 2) { cls.push('col-fixed-left-left2'); }
      else { cls.push('col-fixed-left'); }
    }
    if (col.fixed === 'right') cls.push('col-fixed-right');
    if (col.isCheckbox) cls.push('col-checkbox');
    if (col.isAction) cls.push('col-actions');

    var style = col.width ? ' style="width:' + col.width + '"' : '';
    var sortIcon = '';
    if (col.sortable) {
      var sortClass = '';
      if (pSortKey === col.key) {
        sortClass = ' sort-' + pSortDir;
      }
      sortIcon = '<span class="sort-icon' + sortClass + '"></span>';
    }
    html += '<th class="' + cls.join(' ') + '"' + style + '>';
    if (col.isCheckbox) {
      var startIdx = (pCurrentPage - 1) * pPageSize;
      var endIdx = Math.min(startIdx + pPageSize, pFilteredData.length);
      var pageIds = pFilteredData.slice(startIdx, endIdx).map(function(d) { return d.id; });
      var allPageChecked = pageIds.length > 0 && pageIds.every(function(id) { return !!pSelectedIds[id]; });
      html += '<div class="checkbox' + (allPageChecked ? ' checked' : '') + '" onclick="pToggleAllCheckboxes(this)">' + (allPageChecked ? '✓' : '') + '</div>';
    } else if (col.sortable) {
      html += '<span class="sort-header" onclick="pSetSort(\'' + col.key + '\')">' + col.label + sortIcon + '</span>';
    } else {
      html += col.label;
    }
    html += '</th>';
  });
  html += '</tr>';
  thead.innerHTML = html;
}

function pRenderTableBody() {
  var tbody = document.getElementById('promoTableBody');
  if (!tbody) return;

  var visibleCols = pColumnConfig.filter(function(c) { return c.visible; });
  var keys = visibleCols.map(function(c) { return c.key; });
  var start = (pCurrentPage - 1) * pPageSize;
  var end = Math.min(start + pPageSize, pFilteredData.length);
  var pageData = pFilteredData.slice(start, end);

  if (pageData.length === 0) {
    var colspan = visibleCols.length;
    tbody.innerHTML = '<tr><td colspan="' + colspan + '" class="empty-state">暂无折扣活动</td></tr>';
    return;
  }

  tbody.innerHTML = pageData.map(function(d) {
    var isChecked = !!pSelectedIds[d.id];
    return '<tr data-id="' + d.id + '">' + keys.map(function(key) {
      return '<td class="' + pGetCellClass(key) + '">' + pRenderCell(d, key, isChecked) + '</td>';
    }).join('') + '</tr>';
  }).join('');

  // 绑定更多操作事件
  tbody.querySelectorAll('.more-actions-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pToggleRowMenu(btn.dataset.id);
    });
  });
  tbody.querySelectorAll('.more-actions-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = item.dataset.id;
      var action = item.dataset.action;
      pCloseAllMenus();
      pHandleAction(action, id);
    });
  });
}

function pGetCellClass(key) {
  var col = pColumnConfig.find(function(c) { return c.key === key; });
  if (!col) return '';
  var cls = [];
  if (col.fixed === 'left') {
    // 计算是第几个左固定列
    var leftFixedKeys = pColumnConfig.filter(function(c) { return c.visible && c.fixed === 'left'; }).map(function(c) { return c.key; });
    var leftIdx = leftFixedKeys.indexOf(key);
    cls.push(leftIdx === 1 ? 'col-fixed-left-left2' : 'col-fixed-left');
  }
  if (col.fixed === 'right') cls.push('col-fixed-right');
  if (col.isCheckbox) cls.push('col-checkbox');
  if (col.isAction) cls.push('col-actions');
  return cls.join(' ');
}

function pRenderCell(d, key, isChecked) {
  switch (key) {
    case 'checkbox':
      return '<div class="checkbox' + (isChecked ? ' checked' : '') + '" onclick="event.stopPropagation();pToggleSelect(\'' + d.id + '\',this)">' + (isChecked ? '✓' : '') + '</div>';
    case 'promoInfo':
      return '<div class="promo-info-cell">'
        + '<span class="promo-info-name">' + pEscape(d.name) + '</span>'
        + '<span class="promo-info-meta">' + d.id
        + (d.code ? ' <span class="promo-code-tag">' + pEscape(d.code) + '</span>' : '')
        + '</span></div>';
    case 'type':
      return '<span class="promo-type-badge ' + d.type + '">'
        + pGetTypeIcon(d.type) + '<span>' + TYPE_LABELS[d.type] + '</span></span>';
    case 'valueInfo':
      return pRenderValueInfo(d);
    case 'method':
      return '<span class="dist-badge ' + d.method + '">' + METHOD_LABELS[d.method] + '</span>';
    case 'eligibility':
      var elMap = { all: '全部客户', registered: '注册客户', subscribed: '订阅客户', specific: '指定客户' };
      return elMap[d.eligibility] || d.eligibility || '-';
    case 'usage':
      var limitTxt;
      if (d.method === 'code' && d.usageLimit) {
        var uarr = [];
        if (d.usageLimit.totalEnabled) uarr.push('总限 ' + pFmtNum(d.usageLimit.total) + ' 次');
        if (d.usageLimit.perCustomer) uarr.push('每客户限一次');
        limitTxt = uarr.length ? uarr.join(' / ') : '不限次';
      } else if (d.method === 'code') {
        limitTxt = '不限次';
      } else {
        limitTxt = '自动应用';
      }
      var statHtml = (d.totalUsage != null) ? ('已用 ' + pFmtNum(d.totalUsage) + ' 次') : '';
      return '<div class="usage-cell"><div class="usage-limit-text">' + limitTxt + '</div>' + (statHtml ? '<div class="usage-stat-text">' + statHtml + '</div>' : '') + '</div>';
    case 'salesAmount':
      return '<span class="col-info-trigger" '
        + 'onmouseenter="pShowTooltip(event,\'' + d.id + '\',\'sales\')" onmouseleave="pHideTooltip()">$' + pFmtNum(d.salesAmount)
        + '<svg class="col-info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>';
    case 'discountAmount':
      return '<span class="col-info-trigger" '
        + 'onmouseenter="pShowTooltip(event,\'' + d.id + '\',\'discount\')" onmouseleave="pHideTooltip()">$' + pFmtNum(d.discountAmount)
        + '<svg class="col-info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>';
    case 'orderCount':
      return '<span class="col-info-trigger" '
        + 'onmouseenter="pShowTooltip(event,\'' + d.id + '\',\'orders\')" onmouseleave="pHideTooltip()">' + pFmtNum(d.orderCount)
        + '<svg class="col-info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>';
    case 'validity':
      return pRenderValidity(d);
    case 'status':
      return '<span class="status-badge ' + pComputeStatus(d) + '"><span class="status-dot"></span>' + STATUS_LABELS[pComputeStatus(d)] + '</span>';
    case 'actions':
      return '<div class="row-actions">'
        + '<button class="row-action-btn" title="编辑" onclick="event.stopPropagation();pGoEdit(\'' + d.id + '\')">'
        + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>'
        + '<button class="row-action-btn danger" title="删除" onclick="event.stopPropagation();pHandleAction(\'delete\',\'' + d.id + '\')">'
        + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>'
        + '<div class="more-actions-dropdown">'
        + '<button class="more-actions-btn" data-id="' + d.id + '">'
        + '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>'
        + '<div class="more-actions-menu" data-menu-id="' + d.id + '">'
        + '<button class="more-actions-item" data-id="' + d.id + '" data-action="share"><svg class="action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>分享链接</button>'
        + '<button class="more-actions-item" data-id="' + d.id + '" data-action="analytics"><svg class="action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>查看分析</button>'
        + '<button class="more-actions-item" data-id="' + d.id + '" data-action="duplicate"><svg class="action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>复制</button>'
        + (d.status === 'active'
          ? '<button class="more-actions-item" data-id="' + d.id + '" data-action="disable"><svg class="action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>禁用</button>'
          : '<button class="more-actions-item" data-id="' + d.id + '" data-action="enable"><svg class="action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>启用</button>')
        + '</div></div></div>';
    default: return '';
  }
}

function pRenderValueInfo(d) {
  switch (d.type) {
    case 'order_amount':
    case 'product_amount': {
      var valTxt = d.valueType === 'fixed' ? ('减$' + pFmtNum(d.value)) : (pFmtNum(d.value) + '%折扣');
      var cond = '';
      if (d.minType === 'amount') cond = '（满$' + pFmtNum(d.minAmount) + '）';
      else if (d.minType === 'qty') cond = '（满' + pFmtNum(d.minQty) + '件）';
      var scope = '';
      if (d.type === 'product_amount' && d.scope) {
        if (d.scope.type === 'collection') scope = ' · 指定系列' + (d.scope.collections ? d.scope.collections.length : 0) + '个';
        else if (d.scope.type === 'product') scope = ' · 指定产品' + (d.scope.products ? d.scope.products.length : 0) + '个';
      }
      return valTxt + cond + scope;
    }
    case 'xgy':
      var buyTxt = d.buyType === 'amount' ? '$' + pFmtNum(d.buyAmount) : (d.buyQty || 0);
      var giftTxt;
      if (d.giftDiscountType === 'free') giftTxt = '免费';
      else if (d.giftDiscountType === 'percent') giftTxt = pFmtNum(d.giftPercent) + '%折扣';
      else if (d.giftDiscountType === 'fixed') giftTxt = '减$' + pFmtNum(d.giftFixed);
      else giftTxt = '免费';
      var maxTxt = d.maxPerOrder ? (' · 每单限' + d.maxPerOrder + '次') : '';
      return '买' + buyTxt + ' 送' + pFmtNum(d.giftQty) + '件（' + giftTxt + '）' + maxTxt;
    case 'shipping':
      if (d.countryType === 'specific') return '指定' + (d.countries ? d.countries.length : 0) + '国 免邮' + (d.excludeAbove ? '（超$' + pFmtNum(d.excludeAbove) + '不免）' : '');
      return d.excludeAbove ? '免邮（超$' + pFmtNum(d.excludeAbove) + '不免）' : '无条件 免邮';
    default: return '-';
  }
}

function pRenderValidity(d) {
  var startStr = pDatePart(d.startDate);
  if (!startStr) return '<span class="progress-bar-label">未设置</span>';
  var endStr = pDatePart(d.endDate);
  if (d.longTerm || !endStr) return '<span class="progress-bar-label">' + startStr + ' ~ 长期有效</span>';
  var now = new Date();
  var start = new Date(d.startDate.replace(' ', 'T'));
  var end = new Date(d.endDate.replace(' ', 'T'));
  var totalDays = (end - start) / (1000 * 3600 * 24);
  var elapsedDays = (now - start) / (1000 * 3600 * 24);
  var pct = Math.max(0, Math.min(100, Math.round(elapsedDays / totalDays * 100)));

  var cls = 'validity';
  if (pComputeStatus(d) === 'expired') cls += ' danger';
  else if (pct > 80) cls += ' warning';

  return '<div class="progress-bar-cell">'
    + '<div class="progress-bar-track"><div class="progress-bar-fill ' + cls + '" style="width:' + pct + '%"></div></div>'
    + '<span class="progress-bar-label">' + startStr + ' ~ ' + endStr + '</span></div>';
}

function pGetTypeIcon(type) {
  var paths = {
    order_amount: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    product_amount: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    xgy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M17 8l-5-5-5 5"/><path d="M17 3H7v4"/></svg>',
    shipping: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
  };
  return paths[type] || '';
}

// ==================== 提示框（Tooltip） ====================
function pShowTooltip(e, id, context) {
  var d = pAllData.find(function(r) { return r.id === id; });
  if (!d) return;
  pHideTooltip();

  var tooltip = document.createElement('div');
  tooltip.className = 'promo-tooltip visible';
  tooltip.id = 'promoTooltip';

  var rows = [];
  if (context === 'sales') {
    rows.push({ label: '活动GMV', value: '$' + pFmtNum(d.salesAmount) });
    rows.push({ label: '订单数', value: pFmtNum(d.orderCount) });
    rows.push({ label: '客单价', value: '$' + pFmtNum(Math.round(d.salesAmount / (d.orderCount || 1))) });
  } else if (context === 'discount') {
    rows.push({ label: '累计优惠', value: '$' + pFmtNum(d.discountAmount) });
    rows.push({ label: '使用次数', value: pFmtNum(d.totalUsage) });
    rows.push({ label: '平均优惠', value: '$' + pFmtNum(Math.round(d.discountAmount / (d.totalUsage || 1))) });
  } else if (context === 'orders') {
    rows.push({ label: '关联订单', value: pFmtNum(d.orderCount) });
    rows.push({ label: '转化率', value: (d.orderCount ? Math.round(d.orderCount / d.totalUsage * 100) : 0) + '% (订单/使用)' });
  }

  tooltip.innerHTML = rows.map(function(r) {
    return '<div class="promo-tooltip-row"><span class="promo-tooltip-label">' + r.label + '</span><span class="promo-tooltip-value">' + r.value + '</span></div>';
  }).join('');

  document.body.appendChild(tooltip);

  var rect = e.target.getBoundingClientRect();
  var top = rect.bottom + 8;
  var left = rect.left;
  if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
  if (top + 150 > window.innerHeight) top = rect.top - 160;
  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
}

function pHideTooltip() {
  var el = document.getElementById('promoTooltip');
  if (el) el.remove();
}

// ==================== 分页 ====================
function pRenderPagination() {
  var total = pFilteredData.length;
  var totalPages = Math.ceil(total / pPageSize) || 1;
  var start = (pCurrentPage - 1) * pPageSize + 1;
  var end = Math.min(pCurrentPage * pPageSize, total);

  document.getElementById('pageInfo').textContent = '显示 ' + start + '-' + end + '，共 ' + total + ' 条';
  var btns = document.getElementById('paginationBtns');

  var html = '';
  html += '<button class="btn btn-white btn-sm"' + (pCurrentPage <= 1 ? ' disabled' : '') + ' onclick="pGoPage(' + (pCurrentPage - 1) + ')">上一页</button>';
  for (var i = 1; i <= totalPages; i++) {
    html += '<button class="btn btn-sm ' + (i === pCurrentPage ? 'btn-primary' : 'btn-white') + '" onclick="pGoPage(' + i + ')">' + i + '</button>';
  }
  html += '<button class="btn btn-white btn-sm"' + (pCurrentPage >= totalPages ? ' disabled' : '') + ' onclick="pGoPage(' + (pCurrentPage + 1) + ')">下一页</button>';
  btns.innerHTML = html;
}

function pGoPage(p) {
  pCurrentPage = Math.max(1, Math.min(Math.ceil(pFilteredData.length / pPageSize) || 1, p));
  pSelectedIds = {};
  pRenderTable();
  pRenderPagination();
  pUpdateBulkBar();
}

// ==================== 选择逻辑 ====================
function pToggleSelect(id, el) {
  if (pSelectedIds[id]) {
    delete pSelectedIds[id];
    el.classList.remove('checked');
    el.innerHTML = '';
  } else {
    pSelectedIds[id] = true;
    el.classList.add('checked');
    el.innerHTML = '✓';
  }
  pUpdateBulkBar();
  pRenderTableHead();
}

function pToggleAllCheckboxes(el) {
  var isChecked = !el.classList.contains('checked');
  var start = (pCurrentPage - 1) * pPageSize;
  var end = Math.min(start + pPageSize, pFilteredData.length);
  var pageIds = pFilteredData.slice(start, end).map(function(d) { return d.id; });
  if (isChecked) {
    el.classList.add('checked');
    el.innerHTML = '✓';
    pageIds.forEach(function(id) { pSelectedIds[id] = true; });
  } else {
    el.classList.remove('checked');
    el.innerHTML = '';
    pageIds.forEach(function(id) { delete pSelectedIds[id]; });
  }
  pRenderTableBody();
  pUpdateBulkBar();
}

function pUpdateBulkBar() {
  var cnt = Object.keys(pSelectedIds).length;
  var el = document.getElementById('selectedCount');
  if (el) el.textContent = cnt;
  var btnEnable = document.getElementById('bulkEnable');
  var btnDisable = document.getElementById('bulkDisable');
  var btnDelete = document.getElementById('bulkDelete');
  var disabled = cnt === 0;
  if (btnEnable) btnEnable.disabled = disabled;
  if (btnDisable) btnDisable.disabled = disabled;
  if (btnDelete) btnDelete.disabled = disabled;
}

// ==================== 批量操作 ====================
function pBulkSetStatus(status) {
  var ids = Object.keys(pSelectedIds);
  if (ids.length === 0) return;
  var label = status === 'active' ? '启用' : '禁用';
  pShowConfirm('确认' + label, '确定要' + label + '选中的 ' + ids.length + ' 个折扣活动吗？', function() {
    ids.forEach(function(id) {
      var d = pAllData.find(function(r) { return r.id === id; });
      if (d) {
        if (status === 'active') {
          var now = new Date().toISOString().slice(0, 10);
          if (d.endDate && !d.longTerm && pDatePart(d.endDate) < now) { d.endDate = '2027-12-31 23:59'; }
        }
        d.status = status;
      }
    });
    pSyncToParent();
    pSelectedIds = {};
    pApplyFilters();
    if (typeof showToast === 'function') showToast('已' + label + ' ' + ids.length + ' 个折扣', 'success');
  });
}

function pBulkDelete() {
  var ids = Object.keys(pSelectedIds);
  if (ids.length === 0) return;
  pShowConfirm('确认删除', '确定要删除选中的 ' + ids.length + ' 个折扣活动吗？此操作不可恢复。', function() {
    pAllData = pAllData.filter(function(d) { return !pSelectedIds[d.id]; });
    pSyncToParent();
    pSelectedIds = {};
    pApplyFilters();
    if (typeof showToast === 'function') showToast('已删除 ' + ids.length + ' 个折扣', 'success');
  });
}

// ==================== 筛选逻辑 ====================
function pOnFilterChange() {
  var typeVal = document.getElementById('typeFilter').value;
  var methodVal = document.getElementById('methodFilter').value;
  var statusVal = document.getElementById('statusFilter').value;
  pFilters.type = typeVal || '';
  pFilters.method = methodVal || '';
  pFilters.status = statusVal || '';
  pApplyFilters();
}

// ==================== 更多操作下拉 ====================
function pToggleRowMenu(id) {
  // 先关闭所有其他打开的菜单（并复位其操作列的层叠层级）
  var openMenu = document.querySelector('.more-actions-menu.show');
  if (openMenu) {
    openMenu.classList.remove('show');
    var prevCell = openMenu.closest('td');
    if (prevCell) prevCell.style.zIndex = '';
  }

  var menu = document.querySelector('.more-actions-menu[data-menu-id="' + id + '"]');
  if (!menu) return;

  // 如果菜单已显示，则关闭（复位操作列层级）
  if (menu.classList.contains('show')) {
    var cell0 = menu.closest('td');
    if (cell0) cell0.style.zIndex = '';
    menu.classList.remove('show');
    return;
  }

  // 找到对应的按钮获取位置
  var btn = document.querySelector('.more-actions-btn[data-id="' + id + '"]');
  if (btn) {
    var rect = btn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(4, rect.right - 170) + 'px';
    // 操作列是 sticky 固定列，会形成独立层叠上下文，导致下拉菜单被下方行操作列覆盖。
    // 临时抬高该行操作列 z-index，使菜单整体浮到所有行之上。
    var cell = btn.closest('td');
    if (cell) cell.style.zIndex = '9999';
  }
  menu.classList.add('show');
}

function pToggleMoreActions() {
  var dropdown = document.getElementById('moreActionsDropdown');
  if (!dropdown) return;
  pCloseAllMenus();
  if (dropdown.style.display === 'none' || dropdown.style.display === '') {
    var btn = document.getElementById('btnMoreActions');
    if (btn) {
      var rect = btn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.left = Math.max(0, rect.right - 170) + 'px';
    }
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
  }
}

function pBulkSetScheduled() {
  var ids = Object.keys(pSelectedIds);
  if (ids.length === 0) return;
  pShowConfirm('批量设为未开始', '确定要将选中的 ' + ids.length + ' 个折扣设为未开始吗？', function() {
    ids.forEach(function(id) {
      var d = pAllData.find(function(r) { return r.id === id; });
      if (d) d.status = 'scheduled';
    });
    pSyncToParent();
    pSelectedIds = {};
    pApplyFilters();
    if (typeof showToast === 'function') showToast('已设为未开始', 'success');
  });
}

function pExportPromos() {
  if (typeof showToast === 'function') showToast('导出功能开发中', 'info');
}

function pClearExpired() {
  var expired = pAllData.filter(function(d) { return pComputeStatus(d) === 'expired'; });
  if (expired.length === 0) {
    if (typeof showToast === 'function') showToast('没有已过期的折扣', 'info');
    return;
  }
  pShowConfirm('清除已过期折扣', '确定要清除 ' + expired.length + ' 条已过期的折扣吗？此操作不可恢复。', function() {
    pAllData = pAllData.filter(function(d) { return d.status !== 'expired'; });
    pSyncToParent();
    pApplyFilters();
    if (typeof showToast === 'function') showToast('已清除 ' + expired.length + ' 条过期折扣', 'success');
  });
}

function pCloseAllMenus() {
  document.querySelectorAll('.more-actions-menu.show').forEach(function(m) {
    m.classList.remove('show');
    var cell = m.closest('td');
    if (cell) cell.style.zIndex = '';
  });
}

function pCloseDropdowns(e) {
  // 不关闭由触发按钮或面板内部点击引发的事件
  if (e && e.target) {
    if (e.target.closest('#customColPanel')) return;
    if (e.target.closest('#moreActionsDropdown')) return;
    if (e.target.closest('.more-actions-menu')) return;
    if (e.target.closest('[onclick*="pToggleCustomColPanel"]')) return;
    if (e.target.closest('[onclick*="pToggleMoreActions"]')) return;
    if (e.target.closest('.more-actions-btn')) return;
  }
  pCloseAllMenus();
  var mad = document.getElementById('moreActionsDropdown');
  if (mad) mad.style.display = 'none';
  var ccp = document.getElementById('customColPanel');
  if (ccp) ccp.classList.remove('show');
}

function pHandleAction(action, id) {
  var d = pAllData.find(function(r) { return r.id === id; });
  if (!d) return;

  switch (action) {
    case 'edit':
      pGoEdit(id); break;
    case 'share':
      pShowShareDialog(d); break;
    case 'analytics':
      pShowAnalyticsDialog(d); break;
    case 'duplicate':
      pDuplicate(id); break;
    case 'enable':
      d.status = 'active'; pSyncToParent(); pApplyFilters();
      if (typeof showToast === 'function') showToast('已启用折扣', 'success'); break;
    case 'disable':
      d.status = 'disabled'; pSyncToParent(); pApplyFilters();
      if (typeof showToast === 'function') showToast('已禁用折扣', 'success'); break;
    case 'delete':
      pShowConfirm('确认删除', '确定要删除折扣「' + d.name + '」吗？此操作不可恢复。', function() {
        pAllData = pAllData.filter(function(r) { return r.id !== id; });
        pSyncToParent();
        pApplyFilters();
        if (typeof showToast === 'function') showToast('已删除', 'success');
      }); break;
  }
}

// ==================== 导航 ====================
function pGoAdd() {
  if (typeof navigateToPage === 'function') {
    navigateToPage('promotion/add_promotion.html');
  } else {
    window.parent.handleSidebarNav('add-promotion');
  }
}

function pGoEdit(id) {
  try { sessionStorage.setItem('editPromoId', id); } catch(e) {}
  try { window.parent._promoEditId = id; } catch(e) {}
  if (typeof navigateToPage === 'function') {
    navigateToPage('promotion/edit_promotion.html');
  } else {
    window.parent.handleSidebarNav('edit-promotion');
  }
}

function pDuplicate(id) {
  var src = pAllData.find(function(r) { return r.id === id; });
  if (!src) return;
  var newId = 'P' + src.type.substring(0,1).toUpperCase() + '-' + String(pAllData.length + 1).padStart(3, '0');
  var clone = JSON.parse(JSON.stringify(src));
  clone.id = newId;
  clone.name = src.name + ' (副本)';
  clone.totalUsage = 0;
  clone.salesAmount = 0;
  clone.discountAmount = 0;
  clone.orderCount = 0;
  clone.status = 'disabled';
  clone.createdAt = new Date().toISOString().slice(0, 10);
  if (src.method === 'code') clone.code = src.code + 'CP';
  pAllData.push(clone);
  pSyncToParent();
  pApplyFilters();
  if (typeof showToast === 'function') showToast('已复制折扣活动', 'success');
}

function pRefresh() {
  pFilters = { type: '', method: '', status: '', search: '' };
  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  // 重置原生 select 元素
  ['typeFilter', 'methodFilter', 'statusFilter'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  // 重置日期输入
  var dateFrom = document.getElementById('dateFrom');
  var dateTo = document.getElementById('dateTo');
  if (dateFrom) dateFrom.value = '';
  if (dateTo) dateTo.value = '';

  pSortKey = null;
  pSortDir = 'desc';
  pCurrentPage = 1;
  pApplyFilters();
}

// ==================== 自定义列面板 ====================
function pRenderCustomColPanel() {
  var list = document.getElementById('customColList');
  if (!list) return;

  var html = '';
  pColumnConfig.forEach(function(col, idx) {
    // 固定列（复选框/折扣信息/操作）始终固定，在自定义列中显示为不可选中状态
    var isFixed = col.fixed === 'left' || col.fixed === 'right';
    var disabled = (isFixed || col.locked) ? ' disabled' : '';
    var draggable = (isFixed || col.locked) ? 'false' : 'true';
    var dragTitle = (isFixed || col.locked) ? '固定列不可拖动' : '拖拽排序';
    html += '<div class="custom-col-item' + (col.visible ? ' active' : '') + disabled + '" draggable="' + draggable + '" data-idx="' + idx + '">'
      + '<span class="drag-handle" title="' + dragTitle + '">⠿</span>'
      + '<div class="col-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
      + '<span>' + col.label + '</span></div>';
  });
  list.innerHTML = html;

  // 点击切换可见性（固定列与锁定列不可点击）
  list.querySelectorAll('.custom-col-item').forEach(function(item) {
    item.addEventListener('click', function() {
      if (this.classList.contains('disabled')) return;
      var idx = parseInt(this.dataset.idx);
      var col = pColumnConfig[idx];
      if (col) {
        col.visible = !col.visible;
        this.classList.toggle('active');
      }
    });
  });

  // 拖拽排序（固定列与锁定列不参与）
  var dragSrc = null;
  list.querySelectorAll('.custom-col-item').forEach(function(item) {
    if (item.classList.contains('disabled')) return;
    item.addEventListener('dragstart', function(e) {
      dragSrc = this;
      this.classList.add('dragging');
    });
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });
    item.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      if (dragSrc && dragSrc !== this) {
        var items = Array.from(list.querySelectorAll('.custom-col-item'));
        var fromIdx = items.indexOf(dragSrc);
        var toIdx = items.indexOf(this);
        if (fromIdx < toIdx) {
          list.insertBefore(dragSrc, this.nextSibling);
        } else {
          list.insertBefore(dragSrc, this);
        }
      }
    });
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      dragSrc = null;
    });
  });
}

function pToggleColVis(key, visible) {
  var col = pColumnConfig.find(function(c) { return c.key === key; });
  if (col) col.visible = visible;
}

function pApplyCustomCols() {
  // 按拖拽顺序更新 pColumnConfig
  var items = document.querySelectorAll('#customColList .custom-col-item');
  var ordered = [];
  items.forEach(function(item) {
    var idx = parseInt(item.dataset.idx);
    var col = pColumnConfig[idx];
    if (col && !col.isCheckbox && !col.isAction) {
      col.visible = item.classList.contains('active');
      ordered.push(col);
    }
  });

  // 保留 checkbox 和 actions
  var result = [pColumnConfig.find(function(c) { return c.isCheckbox; })];
  ordered.forEach(function(c) { result.push(c); });
  result.push(pColumnConfig.find(function(c) { return c.isAction; }));
  pColumnConfig = result;

  pToggleCustomColPanel();
  pRenderTable();
}

function pToggleCustomColPanel() {
  var panel = document.getElementById('customColPanel');
  if (!panel) return;
  var isShowing = panel.classList.contains('show');
  if (!isShowing) {
    // 定位面板到触发按钮下方
    var btns = document.querySelectorAll('#bulkActionBar button');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('onclick') === 'pToggleCustomColPanel()') {
        var rect = btns[i].getBoundingClientRect();
        panel.style.top = (rect.bottom + 4) + 'px';
        panel.style.left = (rect.right - 240) + 'px';
        break;
      }
    }
    pRenderCustomColPanel();
  }
  pCloseAllMenus();
  var mad = document.getElementById('moreActionsDropdown');
  if (mad) mad.style.display = 'none';
  panel.classList.toggle('show');
}

// ==================== 对话框（注入到父页面） ====================
function pShowConfirm(title, message, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'p-confirm-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = '<div class="p-confirm-box" style="background:#fff;border-radius:12px;padding:24px;min-width:360px;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.15);">'
    + '<h3 style="font-size:16px;margin:0 0 8px;">' + pEscape(title) + '</h3>'
    + '<p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.5;">' + pEscape(message) + '</p>'
    + '<div style="display:flex;justify-content:flex-end;gap:12px;">'
    + '<button class="p-confirm-cancel" style="background:#f3f4f6;border:none;padding:8px 20px;border-radius:6px;font-size:14px;cursor:pointer;">取消</button>'
    + '<button class="p-confirm-ok" style="background:#dc2626;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:14px;cursor:pointer;">确定</button>'
    + '</div></div>';

  overlay.querySelector('.p-confirm-cancel').onclick = function() { overlay.remove(); };
  overlay.querySelector('.p-confirm-ok').onclick = function() { overlay.remove(); if (onConfirm) onConfirm(); };
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var target = window.parent.document.body || document.body;
  target.appendChild(overlay);
}

function pShowShareDialog(d) {
  var shareUrl = 'https://shop.example.com/discount/' + (d.code || d.id);
  var overlay = document.createElement('div');
  overlay.className = 'p-dialog-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = '<div class="p-dialog-box" style="background:#fff;border-radius:12px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.15);overflow:hidden;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;padding:24px 24px 0;">'
    + '<span style="font-size:16px;font-weight:700;">分享折扣链接</span>'
    + '<button class="p-dialog-close" style="border:none;background:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button></div>'
    + '<div style="padding:24px;"><p style="font-size:14px;color:#374151;margin:0 0 8px;">' + pEscape(d.name) + '</p>'
    + '<div style="display:flex;gap:8px;margin-bottom:16px;">'
    + '<input type="text" readonly value="' + shareUrl + '" style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-size:13px;background:#f9fafb;">'
    + '<button class="p-copy-btn" style="background:var(--primary);color:#fff;border:none;padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;">复制</button></div>'
    + '<div style="font-size:12px;color:#9ca3af;">客户通过此链接可直接使用折扣</div></div></div>';

  overlay.querySelector('.p-dialog-close').onclick = function() { overlay.remove(); };
  overlay.querySelector('.p-copy-btn').onclick = function() {
    try { navigator.clipboard.writeText(shareUrl); } catch(e) {}
    if (typeof showToast === 'function') showToast('已复制链接', 'success');
    overlay.remove();
  };
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var target = window.parent.document.body || document.body;
  target.appendChild(overlay);
}

function pShowAnalyticsDialog(d) {
  var overlay = document.createElement('div');
  overlay.className = 'p-dialog-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = '<div class="p-dialog-box" style="background:#fff;border-radius:12px;max-width:560px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.15);overflow:hidden;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;padding:24px 24px 0;">'
    + '<span style="font-size:16px;font-weight:700;">折扣分析 — ' + pEscape(d.name) + '</span>'
    + '<button class="p-dialog-close" style="border:none;background:none;font-size:20px;cursor:pointer;color:#6b7280;">&times;</button></div>'
    + '<div style="padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">'
    + '<div style="background:#f9fafb;padding:16px;border-radius:8px;"><div style="font-size:12px;color:#6b7280;">使用次数</div><div style="font-size:22px;font-weight:700;margin-top:4px;">' + pFmtNum(d.totalUsage) + '</div></div>'
    + '<div style="background:#f9fafb;padding:16px;border-radius:8px;"><div style="font-size:12px;color:#6b7280;">关联订单</div><div style="font-size:22px;font-weight:700;margin-top:4px;">' + pFmtNum(d.orderCount) + '</div></div>'
    + '<div style="background:#f9fafb;padding:16px;border-radius:8px;"><div style="font-size:12px;color:#6b7280;">GMV</div><div style="font-size:22px;font-weight:700;margin-top:4px;">$' + pFmtNum(d.salesAmount) + '</div></div>'
    + '<div style="background:#f9fafb;padding:16px;border-radius:8px;"><div style="font-size:12px;color:#6b7280;">优惠总额</div><div style="font-size:22px;font-weight:700;margin-top:4px;">$' + pFmtNum(d.discountAmount) + '</div></div></div></div>';

  overlay.querySelector('.p-dialog-close').onclick = function() { overlay.remove(); };
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var target = window.parent.document.body || document.body;
  target.appendChild(overlay);
}

// ==================== 工具函数 ====================
function pEscape(s) { if (!s) return ''; return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function pFmtNum(n) { if (n == null) return '0'; return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
