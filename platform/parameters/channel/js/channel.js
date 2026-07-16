// ==================== 物流渠道管理 核心逻辑 ====================

// Toast 代理
function showToast(type, message) {
  if (window.parent && typeof window.parent.showToast === 'function') {
    window.parent.showToast(type, message);
  }
}

// ==================== SVG 图标 ====================
var ICONS = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
  preview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  columns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  sortAsc: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 15 12 9 18 15"/></svg>',
  sortDesc: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
};

// ==================== 样例数据 ====================

// 物流商
var providers = [
  { id: 1, name: '云途', code: 'YUNTU' },
  { id: 2, name: '燕文', code: 'YANWEN' },
  { id: 3, name: 'USPS', code: 'USPS' },
  { id: 4, name: 'DHL', code: 'DHL' },
  { id: 5, name: 'FedEx', code: 'FEDEX' },
  { id: 6, name: 'UPS', code: 'UPS' },
  { id: 7, name: '天捷速递', code: 'TIANJIE' },
  { id: 8, name: '惠程荣达', code: 'HUICHENG' },
  { id: 9, name: '志远国际', code: 'ZHIYUAN' },
  { id: 10, name: '环亚国际', code: 'HUANYA' },
  { id: 11, name: 'FBA物流专线', code: 'FBA' },
  { id: 12, name: '中国邮政', code: 'CHINA_POST' }
];

// 授权账号
var accounts = [
  { id: 1, providerId: 1, name: '云途全球账号', code: 'YUNTU_GLOBAL' },
  { id: 2, providerId: 1, name: '云途欧洲专线账号', code: 'YUNTU_EU' },
  { id: 3, providerId: 2, name: '燕文标准账号', code: 'YANWEN_STD' },
  { id: 4, providerId: 2, name: '燕文经济账号', code: 'YANWEN_ECO' },
  { id: 5, providerId: 3, name: 'USPS主账号', code: 'USPS_MAIN' },
  { id: 6, providerId: 4, name: 'DHL国际账号', code: 'DHL_INTL' },
  { id: 7, providerId: 4, name: 'DHL亚太账号', code: 'DHL_APAC' },
  { id: 8, providerId: 5, name: 'FedEx主账号', code: 'FEDEX_MAIN' },
  { id: 9, providerId: 6, name: 'UPS主账号', code: 'UPS_MAIN' },
  { id: 10, providerId: 7, name: '天捷速递主账号', code: 'TIANJIE_MAIN' },
  { id: 11, providerId: 8, name: '惠程荣达主账号', code: 'HUICHENG_01' },
  { id: 12, providerId: 8, name: '惠程-TEMU专用', code: 'HUICHENG_02' },
  { id: 13, providerId: 9, name: '志远美国专线', code: 'ZHIYUAN_01' },
  { id: 14, providerId: 10, name: '环亚国际主账号', code: 'HUANYA_MAIN' },
  { id: 15, providerId: 11, name: 'FBA主账号', code: 'FBA_MAIN' },
  { id: 16, providerId: 12, name: '中国邮政主账号', code: 'CP_MAIN' }
];

// 物流渠道
var channels = [
  { id: 1, accountId: 1, name: '云途-特惠普货-美国', code: 'YUNTU_ECONOMY_US', serviceType: '经济', countries: ['美国'], deliveryMinDays: 12, deliveryMaxDays: 18, description: '云途全球特惠渠道，美国普货专线', sortOrder: 1, status: 'enabled', createdAt: '2025-03-15' },
  { id: 2, accountId: 2, name: '云途-标准-欧洲', code: 'YUNTU_STANDARD_EU', serviceType: '标准', countries: ['英国', '德国', '法国'], deliveryMinDays: 7, deliveryMaxDays: 12, description: '云途欧洲专线标准渠道', sortOrder: 2, status: 'enabled', createdAt: '2025-04-02' },
  { id: 3, accountId: 3, name: '燕文-标准-全球', code: 'YANWEN_STANDARD_GLOBAL', serviceType: '标准', countries: ['美国', '加拿大', '英国', '德国'], deliveryMinDays: 8, deliveryMaxDays: 15, description: '燕文标准全球配送', sortOrder: 3, status: 'enabled', createdAt: '2025-04-10' },
  { id: 4, accountId: 3, name: '燕文-标准-加拿大', code: 'YANWEN_STANDARD_CA', serviceType: '标准', countries: ['加拿大'], deliveryMinDays: 10, deliveryMaxDays: 14, description: '燕文加拿大专线', sortOrder: 4, status: 'enabled', createdAt: '2025-05-01' },
  { id: 5, accountId: 4, name: '燕文-经济-全球', code: 'YANWEN_ECONOMY_GLOBAL', serviceType: '经济', countries: ['美国', '加拿大', '英国'], deliveryMinDays: 15, deliveryMaxDays: 25, description: '燕文经济渠道，价格低', sortOrder: 5, status: 'disabled', createdAt: '2025-05-15' },
  { id: 6, accountId: 5, name: 'USPS-First Class-美国', code: 'USPS_FIRSTCLASS', serviceType: '经济', countries: ['美国'], deliveryMinDays: 5, deliveryMaxDays: 10, description: 'USPS经济邮政服务', sortOrder: 6, status: 'enabled', createdAt: '2025-05-20' },
  { id: 7, accountId: 5, name: 'USPS-Priority-美国', code: 'USPS_PRIORITY', serviceType: '标准', countries: ['美国'], deliveryMinDays: 2, deliveryMaxDays: 5, description: 'USPS优先邮政服务', sortOrder: 7, status: 'enabled', createdAt: '2025-06-01' },
  { id: 8, accountId: 6, name: 'DHL-快递-全球', code: 'DHL_EXPRESS_GLOBAL', serviceType: '快速', countries: ['美国', '英国', '德国', '法国', '日本', '澳洲', '加拿大'], deliveryMinDays: 3, deliveryMaxDays: 5, description: 'DHL国际快递，时效快', sortOrder: 8, status: 'enabled', createdAt: '2025-06-15' },
  { id: 9, accountId: 6, name: 'DHL-经济-欧洲', code: 'DHL_ECONOMY_EU', serviceType: '经济', countries: ['英国', '德国', '法国'], deliveryMinDays: 10, deliveryMaxDays: 18, description: 'DHL经济渠道，欧洲线', sortOrder: 9, status: 'disabled', createdAt: '2025-07-01' },
  { id: 10, accountId: 7, name: 'DHL-快递-亚太', code: 'DHL_EXPRESS_APAC', serviceType: '快速', countries: ['日本', '韩国', '新加坡', '澳洲'], deliveryMinDays: 2, deliveryMaxDays: 4, description: 'DHL亚太速递', sortOrder: 10, status: 'enabled', createdAt: '2025-07-10' },
  { id: 11, accountId: 10, name: '天捷-快递-欧洲', code: 'TIANJIE_EXPRESS_EU', serviceType: '快速', countries: ['英国', '德国', '法国'], deliveryMinDays: 5, deliveryMaxDays: 8, description: '天捷欧洲快递专线', sortOrder: 11, status: 'enabled', createdAt: '2025-08-01' },
  { id: 12, accountId: 11, name: '惠程-标准-欧美', code: 'HUICHENG_STANDARD_EUUS', serviceType: '标准', countries: ['美国', '英国', '德国'], deliveryMinDays: 7, deliveryMaxDays: 14, description: '惠程荣达标准渠道', sortOrder: 12, status: 'enabled', createdAt: '2025-08-15' },
  { id: 13, accountId: 13, name: '志远-ES8-美国空派', code: 'ZHIYUAN_ES8_US', serviceType: '快速', countries: ['美国'], deliveryMinDays: 5, deliveryMaxDays: 7, description: '志远ES8美国空派专线', sortOrder: 13, status: 'enabled', createdAt: '2025-09-01' },
  { id: 14, accountId: 14, name: '环亚-标准-日本', code: 'HUANYA_STANDARD_JP', serviceType: '标准', countries: ['日本'], deliveryMinDays: 4, deliveryMaxDays: 8, description: '环亚国际日本专线', sortOrder: 14, status: 'enabled', createdAt: '2025-09-10' },
  { id: 15, accountId: 15, name: 'FBA-标准-美国', code: 'FBA_STANDARD_US', serviceType: '标准', countries: ['美国'], deliveryMinDays: 7, deliveryMaxDays: 12, description: '亚马逊FBA头程美国', sortOrder: 15, status: 'enabled', createdAt: '2025-10-01' },
  { id: 16, accountId: 15, name: 'FBA-标准-欧洲', code: 'FBA_STANDARD_EU', serviceType: '标准', countries: ['英国', '德国', '法国', '意大利', '西班牙'], deliveryMinDays: 10, deliveryMaxDays: 18, description: '亚马逊FBA头程欧洲五国', sortOrder: 16, status: 'enabled', createdAt: '2025-10-15' },
  { id: 17, accountId: 16, name: '邮政-经济-全球', code: 'CP_ECONOMY_GLOBAL', serviceType: '经济', countries: ['美国', '英国', '澳洲'], deliveryMinDays: 15, deliveryMaxDays: 30, description: '中国邮政国际经济小包', sortOrder: 17, status: 'enabled', createdAt: '2025-11-01' }
];
var nextChId = 18;

// 渠道运费配置
var costs = [
  { id: 1, channelId: 1, costName: '云途-美国特惠-基础运费', countryCodes: ['美国'], firstWeight: 100, firstWeightPrice: 8.00, additionalUnit: 100, additionalPrice: 0.05, dimCoefficient: 6000, isActive: true, description: '云途美国特惠基础运费', createdAt: '2025-03-16' },
  { id: 2, channelId: 2, costName: '云途-欧洲标准-基础运费', countryCodes: ['英国', '德国', '法国'], firstWeight: 150, firstWeightPrice: 12.00, additionalUnit: 100, additionalPrice: 0.08, dimCoefficient: 5000, isActive: true, description: '云途欧洲标准基础运费', createdAt: '2025-04-03' },
  { id: 3, channelId: 2, costName: '云途-欧洲标准-高端运费', countryCodes: [], firstWeight: 100, firstWeightPrice: 18.00, additionalUnit: 50, additionalPrice: 0.10, dimCoefficient: 6000, isActive: false, description: '高端渠道', createdAt: '2025-04-05' },
  { id: 4, channelId: 8, costName: 'DHL-全球快递-基础运费', countryCodes: [], firstWeight: 200, firstWeightPrice: 25.00, additionalUnit: 100, additionalPrice: 0.12, dimCoefficient: 5000, isActive: true, description: 'DHL全球兜底运费', createdAt: '2025-06-16' },
  { id: 5, channelId: 6, costName: 'USPS-美国FirstClass-基础运费', countryCodes: ['美国'], firstWeight: 50, firstWeightPrice: 3.50, additionalUnit: 50, additionalPrice: 0.03, dimCoefficient: 0, isActive: true, description: 'USPS经济邮政', createdAt: '2025-05-21' },
  { id: 6, channelId: 7, costName: 'USPS-美国Priority-基础运费', countryCodes: ['美国'], firstWeight: 100, firstWeightPrice: 7.50, additionalUnit: 100, additionalPrice: 0.04, dimCoefficient: 0, isActive: true, description: 'USPS优先邮政', createdAt: '2025-06-02' },
  { id: 7, channelId: 13, costName: '志远-美国空派-基础运费', countryCodes: ['美国'], firstWeight: 500, firstWeightPrice: 20.00, additionalUnit: 500, additionalPrice: 0.05, dimCoefficient: 6000, isActive: true, description: '志远美国空派', createdAt: '2025-09-02' },
  { id: 8, channelId: 15, costName: 'FBA-美国标准-基础运费', countryCodes: ['美国'], firstWeight: 200, firstWeightPrice: 15.00, additionalUnit: 100, additionalPrice: 0.06, dimCoefficient: 5000, isActive: true, description: 'FBA头程美国', createdAt: '2025-10-02' },
  { id: 9, channelId: 16, costName: 'FBA-欧洲五国-基础运费', countryCodes: ['英国', '德国', '法国', '意大利', '西班牙'], firstWeight: 300, firstWeightPrice: 22.00, additionalUnit: 200, additionalPrice: 0.07, dimCoefficient: 5000, isActive: true, description: 'FBA头程欧洲五国', createdAt: '2025-10-16' },
  { id: 10, channelId: 12, costName: '惠程-欧美标准-基础运费', countryCodes: ['美国', '英国', '德国'], firstWeight: 150, firstWeightPrice: 10.00, additionalUnit: 100, additionalPrice: 0.06, dimCoefficient: 6000, isActive: true, description: '惠程欧美标准', createdAt: '2025-08-16' },
  { id: 11, channelId: 3, costName: '燕文-标准全球-兜底运费', countryCodes: [], firstWeight: 100, firstWeightPrice: 9.00, additionalUnit: 100, additionalPrice: 0.05, dimCoefficient: 6000, isActive: true, description: '燕文标准全球兜底', createdAt: '2025-04-11' }
];
var nextCostId = 12;

// 模拟关联订单
var channelOrders = [
  { channelId: 8, orderCount: 3 },
  { channelId: 13, orderCount: 5 }
];

// ==================== 辅助函数 ====================
function findProvider(id) { return providers.find(function(p) { return p.id === id; }); }
function findAccount(id) { return accounts.find(function(a) { return a.id === id; }); }
function findChannel(id) { return channels.find(function(ch) { return ch.id === id; }); }
function hasOrders(channelId) { return channelOrders.some(function(o) { return o.channelId === channelId; }); }
function getProviderByChannel(ch) {
  var ac = findAccount(ch.accountId);
  return ac ? findProvider(ac.providerId) : null;
}

// 暴露给父页面
window.providers = providers;
window.accounts = accounts;
window.channels = channels;
window.costs = costs;
window.findProvider = findProvider;
window.findAccount = findAccount;
window.findChannel = findChannel;
window.getProviderByChannel = getProviderByChannel;

// ==================== 状态管理 ====================
var selectedChannelId = null;    // 当前选中的渠道ID
var activeTab = 'cost';          // 当前激活的tab: cost | info
var chSortField = 'sortOrder';   // 当前排序字段
var chSortDir = 'asc';           // 排序方向
var chCurrentPage = 1;
var chPageSize = 20;

// 运费列表分页
var costCurrentPage = 1;
var costPageSize = 10;

// ==================== 渠道添加/更新/删除 ====================
window.channelAddItem = function(accountId, name, code, serviceType, countries, deliveryMinDays, deliveryMaxDays, description, sortOrder, status) {
  channels.push({
    id: nextChId++, accountId: accountId, name: name, code: code,
    serviceType: serviceType, countries: countries || [],
    deliveryMinDays: deliveryMinDays || 7, deliveryMaxDays: deliveryMaxDays || 15,
    description: description || '', sortOrder: sortOrder || 999, status: status || 'enabled',
    createdAt: new Date().toISOString().slice(0, 10)
  });
};

window.channelUpdateItem = function(id, accountId, name, code, serviceType, countries, deliveryMinDays, deliveryMaxDays, description, sortOrder, status) {
  var ch = findChannel(id); if (!ch) return;
  if (accountId !== undefined) ch.accountId = accountId;
  if (name !== undefined) ch.name = name;
  if (code !== undefined) ch.code = code;
  if (serviceType !== undefined) ch.serviceType = serviceType;
  if (countries !== undefined) ch.countries = countries;
  if (deliveryMinDays !== undefined) ch.deliveryMinDays = deliveryMinDays;
  if (deliveryMaxDays !== undefined) ch.deliveryMaxDays = deliveryMaxDays;
  if (description !== undefined) ch.description = description;
  if (sortOrder !== undefined) ch.sortOrder = sortOrder;
  if (status !== undefined) {
    ch.status = status;
    // 联动禁用/启用关联运费
    if (status === 'disabled') {
      costs.forEach(function(c) { if (c.channelId === id) c.isActive = false; });
    }
  }
};

window.channelDeleteItem = function(id) {
  channels = channels.filter(function(ch) { return ch.id !== id; });
  costs = costs.filter(function(c) { return c.channelId !== id; });
};

window.channelBatchDeleteItems = function(ids) {
  channels = channels.filter(function(ch) { return ids.indexOf(ch.id) === -1; });
  costs = costs.filter(function(c) { return ids.indexOf(c.channelId) === -1; });
};

window.channelCopyItem = function(sourceId) {
  var ch = findChannel(sourceId); if (!ch) return null;
  var newCh = {
    id: nextChId++, accountId: ch.accountId,
    name: ch.name + '_Copy',
    code: ch.code + '_COPY',
    serviceType: ch.serviceType,
    countries: ch.countries.slice(),
    deliveryMinDays: ch.deliveryMinDays,
    deliveryMaxDays: ch.deliveryMaxDays,
    description: ch.description,
    sortOrder: ch.sortOrder,
    status: ch.status,
    createdAt: new Date().toISOString().slice(0, 10)
  };
  channels.push(newCh);
  return newCh;
};

window.renderChannelTable = function() { renderChannelList(); };

// ==================== 运费 CRUD ====================
window.costAddItem = function(channelId, obj) {
  costs.push(Object.assign({ id: nextCostId++, channelId: channelId, createdAt: new Date().toISOString().slice(0, 10) }, obj));
};

window.costUpdateItem = function(costId, obj) {
  var c = costs.find(function(co) { return co.id === costId; });
  if (!c) return;
  Object.keys(obj).forEach(function(k) { c[k] = obj[k]; });
};

window.costDeleteItem = function(costId) {
  costs = costs.filter(function(c) { return c.id !== costId; });
};

window.costBatchDeleteItems = function(ids) {
  costs = costs.filter(function(c) { return ids.indexOf(c.id) === -1; });
};

// ==================== 筛选逻辑 ====================
function getFilteredChannels() {
  var provVal = (document.getElementById('chFilterProvider') ? document.getElementById('chFilterProvider').value : '') || '';
  var srvVal = (document.getElementById('chFilterServiceType') ? document.getElementById('chFilterServiceType').value : '') || '';
  var statVal = (document.getElementById('chFilterStatus') ? document.getElementById('chFilterStatus').value : '') || '';
  var search = (document.getElementById('chFilterSearch') && document.getElementById('chFilterSearch').value || '').toLowerCase();

  return channels.filter(function(ch) {
    if (search && ch.name.toLowerCase().indexOf(search) === -1 && ch.code.toLowerCase().indexOf(search) === -1 && (ch.description || '').toLowerCase().indexOf(search) === -1) return false;
    if (srvVal && ch.serviceType !== srvVal) return false;
    if (statVal && ch.status !== statVal) return false;
    if (provVal) {
      var ac = findAccount(ch.accountId);
      if (!ac || ac.providerId !== parseInt(provVal)) return false;
    }
    return true;
  });
}

// ==================== 排序 ====================
function sortChannels(data) {
  return data.sort(function(a, b) {
    var va, vb;
    if (chSortField === 'name') { va = a.name; vb = b.name; }
    else if (chSortField === 'code') { va = a.code; vb = b.code; }
    else if (chSortField === 'deliveryDays') { va = a.deliveryMinDays || 0; vb = b.deliveryMinDays || 0; }
    else if (chSortField === 'countries') { va = (a.countries || []).length; vb = (b.countries || []).length; }
    else { va = a.sortOrder || 999; vb = b.sortOrder || 999; }
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return chSortDir === 'asc' ? -1 : 1;
    if (va > vb) return chSortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

function setSort(field) {
  if (chSortField === field) {
    chSortDir = chSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    chSortField = field;
    chSortDir = 'asc';
  }
  renderChannelList();
}

// ==================== 获取渠道运费 ====================
function getChannelCosts(channelId) {
  return costs.filter(function(c) { return c.channelId === channelId; });
}

function getFilteredCosts(channelId) {
  if (!channelId) return [];
  var ccc = getChannelCosts(channelId);
  var countryFilter = (document.getElementById('costFilterCountry') ? document.getElementById('costFilterCountry').value : '') || '';
  var statFilter = (document.getElementById('costFilterStatus') ? document.getElementById('costFilterStatus').value : '') || '';
  var search = (document.getElementById('costFilterSearch') ? document.getElementById('costFilterSearch').value : '').toLowerCase();

  return ccc.filter(function(c) {
    if (search && c.costName.toLowerCase().indexOf(search) === -1 && (c.description || '').toLowerCase().indexOf(search) === -1) return false;
    if (statFilter === 'enabled' && !c.isActive) return false;
    if (statFilter === 'disabled' && c.isActive) return false;
    if (countryFilter) {
      if (countryFilter === '__global__') { if (c.countryCodes.length > 0) return false; }
      else { if (c.countryCodes.indexOf(countryFilter) === -1) return false; }
    }
    return true;
  });
}

// ==================== 初始化筛选下拉 ====================
function initFilters() {
  // 渠道筛选
  var provSel = document.getElementById('chFilterProvider');
  if (provSel) {
    providers.forEach(function(p) {
      var o = document.createElement('option'); o.value = p.id; o.textContent = p.name; provSel.appendChild(o);
    });
    refreshSearchableSelect('chFilterProvider');
  }
}

window.onChProvFilterChange = function() {
  chCurrentPage = 1;
  renderChannelList();
};

// ==================== 渲染左侧渠道卡片列表 ====================
function renderChannelList() {
  var filtered = getFilteredChannels();
  sortChannels(filtered);

  var list = document.getElementById('chCardList');
  var headerCountEl = document.getElementById('chHeaderCount');
  if (headerCountEl) headerCountEl.textContent = '(' + filtered.length + '个)';

  // 分页
  var totalPages = Math.ceil(filtered.length / chPageSize) || 1;
  if (chCurrentPage > totalPages) chCurrentPage = totalPages;
  var pageData = filtered.slice((chCurrentPage - 1) * chPageSize, chCurrentPage * chPageSize);

  if (!filtered.length) {
    list.innerHTML = '<div class="channel-card-empty">暂无物流渠道</div>';
    renderChPagination(0);
    return;
  }

  var sm = { enabled: { label: '启用', cls: 'badge-success' }, disabled: { label: '禁用', cls: 'badge-secondary' } };
  var stBadges = { '经济': 'badge-warning', '标准': 'badge-info', '快速': 'badge-success' };
  var stLabels = { '经济': '经济', '标准': '标准', '快速': '快速' };

  list.innerHTML = pageData.map(function(ch) {
    var ac = findAccount(ch.accountId);
    var p = ac ? findProvider(ac.providerId) : null;
    var s = sm[ch.status] || { label: ch.status, cls: 'badge-secondary' };
    var stBg = stBadges[ch.serviceType] || 'badge-secondary';
    var stLb = stLabels[ch.serviceType] || ch.serviceType;
    var daysStr = ch.deliveryMinDays === ch.deliveryMaxDays ? ch.deliveryMinDays + '天' : ch.deliveryMinDays + '-' + ch.deliveryMaxDays + '天';
    var countryCnt = (ch.countries || []).length;
    var selectedCls = ch.id === selectedChannelId ? ' selected' : '';
    var statusDotCls = ch.status === 'enabled' ? 'enabled' : 'disabled';

    return (
      '<div class="channel-card' + selectedCls + '" data-id="' + ch.id + '" onclick="selectChannel(' + ch.id + ')">' +
        '<div class="channel-card-row1">' +
          '<div class="channel-card-name">' + escHtml(ch.name) + '</div>' +
          '<span class="channel-card-status-dot ' + statusDotCls + '" title="' + s.label + '"></span>' +
        '</div>' +
        '<div class="channel-card-row2">' +
          '<span class="channel-card-provider">' + (p ? escHtml(p.name) : '—') + '</span>' +
          '<span class="channel-card-dot">·</span>' +
          '<span class="channel-card-code">' + escHtml(ch.code) + '</span>' +
        '</div>' +
        '<div class="channel-card-row3">' +
          '<span class="badge ' + stBg + ' channel-card-type">' + stLb + '</span>' +
          '<span class="channel-card-days">' + daysStr + '</span>' +
          '<span class="channel-card-dot">·</span>' +
          '<span class="channel-card-countries">' + countryCnt + '国</span>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  renderChPagination(filtered.length);
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderChPagination(total) {
  var c = document.getElementById('chPagination');
  if (!c) return;
  var tp = Math.ceil(total / chPageSize) || 1;
  var cur = chCurrentPage;
  if (cur > tp) cur = tp;
  var s = total === 0 ? 0 : (cur - 1) * chPageSize + 1;
  var e = Math.min(cur * chPageSize, total);
  var h = '<span class="pagination-info">' + (total===0?'无数据':(s + '-' + e + ' 条，共 ' + total + ' 条')) + '</span>';
  h += '<div class="pagination-buttons">';
  h += '<div class="page-btn' + (cur <= 1 ? ' disabled' : '') + '" data-page="' + (cur - 1) + '">‹</div>';
  var pages = [];
  if (tp <= 7) { for (var i = 1; i <= tp; i++) pages.push(i); }
  else {
    pages.push(1);
    if (cur > 3) pages.push('...');
    for (var i = Math.max(2, cur - 1); i <= Math.min(tp - 1, cur + 1); i++) pages.push(i);
    if (cur < tp - 2) pages.push('...');
    pages.push(tp);
  }
  for (var i = 0; i < pages.length; i++) {
    var p = pages[i];
    if (p === '...') { h += '<div class="page-btn disabled">...</div>'; }
    else { h += '<div class="page-btn' + (p === cur ? ' active' : '') + '" data-page="' + p + '">' + p + '</div>'; }
  }
  h += '<div class="page-btn' + (cur >= tp ? ' disabled' : '') + '" data-page="' + (cur + 1) + '">›</div>';
  h += '</div>';
  c.innerHTML = h;
  c.querySelectorAll('.page-btn:not(.disabled):not([data-page="..."])').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var pg = parseInt(this.getAttribute('data-page'));
      if (pg && pg !== cur) { chCurrentPage = pg; renderChannelList(); }
    });
  });
}

// ==================== 选择渠道 ====================
function selectChannel(chId) {
  selectedChannelId = chId;
  activeTab = 'cost';
  renderChannelList();
  renderDetailPanel();
}

// ==================== 渲染右侧详情面板 ====================
function renderDetailPanel() {
  if (!selectedChannelId) {
    document.getElementById('detailInfoTab').style.display = 'none';
    document.getElementById('detailEmpty').style.display = 'flex';
    return;
  }

  document.getElementById('detailEmpty').style.display = 'none';
  document.getElementById('detailInfoTab').style.display = '';
  renderChannelInfoTab();
  renderCostTab();
}

// ==================== Tab 切换 ====================
function switchDetailTab(tab) {
  activeTab = tab;
  var tabs = document.querySelectorAll('.channel-detail-tab');
  tabs.forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
  var contents = document.querySelectorAll('.channel-detail-body .tab-content');
  contents.forEach(function(c) { c.classList.toggle('active', c.dataset.tab === tab); });
  if (tab === 'cost') renderCostList();
}

// ==================== 渠道信息 Tab ====================
function renderChannelInfoTab() {
  var ch = findChannel(selectedChannelId);
  if (!ch) return;
  var ac = findAccount(ch.accountId);
  var p = getProviderByChannel(ch);
  var daysStr = ch.deliveryMinDays === ch.deliveryMaxDays ? ch.deliveryMinDays + '天' : ch.deliveryMinDays + '-' + ch.deliveryMaxDays + '天';
  var stMap = { '经济': '经济', '标准': '标准', '快速': '快速' };
  var enabled = ch.status === 'enabled';

  var h = '<div class="channel-info-form">';

  // ===== 顶部 hero 区域：渠道名 + 状态徽章 =====
  h += '<div class="channel-info-hero">';
  h += '  <div class="channel-info-hero-main">';
  h += '    <div class="channel-info-hero-label">渠道</div>';
  h += '    <div class="channel-info-hero-name">' + escHtml(ch.name) + '</div>';
  h += '    <div class="channel-info-hero-code">' + escHtml(ch.code) + '</div>';
  h += '  </div>';
  h += '  <div class="channel-info-hero-badge">';
  h += '    <span class="status-dot ' + (enabled ? 'on' : 'off') + '"></span>';
  h += '    <span>' + (enabled ? '已启用' : '已禁用') + '</span>';
  h += '  </div>';
  h += '</div>';

  // ===== 关键属性卡片网格（label 上 / value 下） =====
  h += '<div class="channel-info-grid">';
  h += infoCard('物流商', p ? p.name : '—');
  h += infoCard('授权账号', ac ? ac.name : '—');
  h += infoCard('服务类型', stMap[ch.serviceType] || ch.serviceType || '—', null, 'tag-' + (ch.serviceType || ''));
  h += infoCard('预估时效', daysStr);
  h += infoCard('排序权重', ch.sortOrder || 999);
  h += infoCard('创建时间', ch.createdAt || '—');
  h += '</div>';

  // ===== 配送国家/地区 =====
  h += '<div class="channel-info-block">';
  h += '  <div class="channel-info-block-label">配送国家/地区</div>';
  if (ch.countries && ch.countries.length) {
    h += '<div class="country-tags-inline">';
    ch.countries.forEach(function(c) { h += '<span class="country-tag">' + c + '</span>'; });
    h += '</div>';
  } else {
    h += '<div class="channel-info-empty">未配置</div>';
  }
  h += '</div>';

  // ===== 描述/备注 =====
  h += '<div class="channel-info-block">';
  h += '  <div class="channel-info-block-label">描述 / 备注</div>';
  if (ch.description && ch.description.trim()) {
    h += '<div class="channel-info-desc">' + escHtml(ch.description) + '</div>';
  } else {
    h += '<div class="channel-info-empty">暂无描述</div>';
  }
  h += '</div>';

  // ===== 操作按钮 =====
  h += '<div class="channel-info-actions">';
  h += '  <div class="channel-info-actions-left">';
  h += '    <button class="btn btn-primary" onclick="handleEditChannel(' + ch.id + ')">' + ICONS.edit + ' 编辑渠道</button>';
  h += '    <button class="btn btn-secondary" onclick="handleCopyChannel(' + ch.id + ')">' + ICONS.copy + ' 复制渠道</button>';
  h += '  </div>';
  h += '  <div class="channel-info-actions-right">';
  h += '    <button class="btn btn-secondary" onclick="handleToggleChannel(' + ch.id + ')">' + (enabled ? '禁用渠道' : '启用渠道') + '</button>';
  h += '    <button class="btn btn-destructive" onclick="handleDeleteChannel(' + ch.id + ')">' + ICONS.del + ' 删除渠道</button>';
  h += '  </div>';
  h += '</div>';

  h += '</div>';

  var container = document.querySelector('#tabInfo .channel-info-form-wrap');
  if (container) container.innerHTML = h;
}

/** 渲染单个属性卡片：label 上、value 下 */
function infoCard(label, value, suffix, extraClass) {
  var v = (value === undefined || value === null || value === '') ? '—' : value;
  return '<div class="channel-info-card ' + (extraClass || '') + '">' +
           '<div class="channel-info-card-label">' + label + '</div>' +
           '<div class="channel-info-card-value">' + v + (suffix || '') + '</div>' +
         '</div>';
}

// ==================== 运费配置 Tab ====================
function renderCostTab() {
  renderCostList();
}

function buildCostCountryDisplay(countryCodes) {
  var MAX_SHOW = 3;
  if (countryCodes.length <= MAX_SHOW) {
    return countryCodes.map(function(cc) { return '<span class="cost-country-tag">' + cc + '</span>'; }).join('');
  }
  var shown = countryCodes.slice(0, MAX_SHOW).map(function(cc) { return '<span class="cost-country-tag">' + cc + '</span>'; }).join('');
  var more = countryCodes.length - MAX_SHOW;
  var popover = countryCodes.join('、');
  return shown +
    '<span class="cost-country-more">+' + more +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10" style="margin-left:2px;flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>' +
      '<span class="cost-country-popover">' + escHtml(popover) + '</span>' +
    '</span>';
}

function renderCostList() {
  var ch = findChannel(selectedChannelId);
  var filtered = getFilteredCosts(selectedChannelId);
  var container = document.getElementById('costTableBody');

  // 更新 tab badge
  var badge = document.querySelector('.channel-detail-tab[data-tab="cost"] .tab-badge');
  if (badge) badge.textContent = getChannelCosts(selectedChannelId).length;

  if (!filtered.length) {
    container.innerHTML = '<tr><td colspan="9"><div style="text-align:center;padding:40px 20px;color:hsl(var(--muted-foreground));font-size:14px;">暂无运费配置，请点击"新增运费"添加</div></td></tr>';
    renderCostPagination(filtered.length);
    return;
  }

  // 分页
  costCurrentPage = Math.min(costCurrentPage, Math.ceil(filtered.length / costPageSize) || 1);
  var pageData = filtered.slice((costCurrentPage - 1) * costPageSize, costCurrentPage * costPageSize);

  container.innerHTML = pageData.map(function(c) {
    var countryDisplay = c.countryCodes.length === 0 ? '<span class="badge badge-info">全球兜底</span>' : buildCostCountryDisplay(c.countryCodes);
    var dimDisplay = c.dimCoefficient === 0 ? '不启用' : c.dimCoefficient;
    return '<tr>' +
      '<td><strong>' + escHtml(c.costName) + '</strong></td>' +
      '<td>' + countryDisplay + '</td>' +
      '<td class="cost-fee-cell">' + c.firstWeight + 'g / $' + c.firstWeightPrice.toFixed(2) + '</td>' +
      '<td class="cost-fee-cell">' + c.additionalUnit + 'g / $' + c.additionalPrice.toFixed(2) + '</td>' +
      '<td>' + dimDisplay + '</td>' +
      '<td><span class="badge ' + (c.isActive ? 'badge-success' : 'badge-secondary') + '">' + (c.isActive ? '启用' : '禁用') + '</span></td>' +
      '<td style="white-space:nowrap;">' +
        '<div class="action-group">' +
          '<div class="action-btn" title="预览" onclick="handlePreviewCost(' + c.id + ')">' + ICONS.preview + '</div>' +
          '<div class="action-btn" title="编辑" onclick="handleEditCost(' + c.id + ')">' + ICONS.edit + '</div>' +
          '<div class="action-btn" title="' + (c.isActive ? '禁用' : '启用') + '" onclick="handleToggleCost(' + c.id + ')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
          '</div>' +
          '<div class="action-btn danger" title="删除" onclick="handleDeleteCost(' + c.id + ')">' + ICONS.del + '</div>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');

  renderCostPagination(filtered.length);
}

function renderCostPagination(total) {
  var c = document.getElementById('costPagination');
  if (!c) return;
  var tp = Math.ceil(total / costPageSize) || 1;
  var cur = costCurrentPage;
  if (cur > tp) cur = tp;
  var s = total === 0 ? 0 : (cur - 1) * costPageSize + 1;
  var e = Math.min(cur * costPageSize, total);
  c.innerHTML = '<span class="pagination-info">' + (total===0?'无数据':(s + '-' + e + ' 条，共 ' + total + ' 条')) + '</span>';
}

// ==================== 操作处理函数 ====================

// 渠道操作
function handleAddChannel() {
  if (window.parent && window.parent.openChannelDialog) window.parent.openChannelDialog('add', null);
}

function handleEditChannel(id) {
  if (window.parent && window.parent.openChannelDialog) window.parent.openChannelDialog('edit', id);
}

function handleCopyChannel(id) {
  if (window.parent && window.parent.openChannelCopyDialog) window.parent.openChannelCopyDialog(id);
}

function handleDeleteChannel(id) {
  var ch = findChannel(id); if (!ch) return;
  if (hasOrders(id)) { showToast('warning', '该渠道存在关联订单，请先处理订单后再删除'); return; }
  if (window.parent && window.parent.openChannelDeleteDialog) window.parent.openChannelDeleteDialog(id);
}

function handleToggleChannel(id) {
  if (window.parent && window.parent.openChannelToggleDialog) window.parent.openChannelToggleDialog(id);
}

// 运费操作
function handleAddCost() {
  if (window.parent && window.parent.openCostFormDialog) window.parent.openCostFormDialog('add', selectedChannelId, null);
}

function handleEditCost(costId) {
  if (window.parent && window.parent.openCostFormDialog) window.parent.openCostFormDialog('edit', selectedChannelId, costId);
}

function handlePreviewCost(costId) {
  if (window.parent && window.parent.openCostPreviewDialog) window.parent.openCostPreviewDialog(selectedChannelId, costId);
}

function handleDeleteCost(costId) {
  if (window.parent && window.parent.openCostDeleteDialog) window.parent.openCostDeleteDialog(costId);
}

function handleToggleCost(costId) {
  if (window.parent && window.parent.openCostToggleDialog) window.parent.openCostToggleDialog(costId);
}

// ==================== 刷新 ====================
function refreshPage() {
  chCurrentPage = 1;
  costCurrentPage = 1;
  renderChannelList();
  renderDetailPanel();
  showToast('success', '数据已刷新');
}

// ==================== 初始化 ====================
function initChannelPage() {
  initFilters();
  renderChannelList();
  // 默认选中第一个
  if (channels.length > 0 && !selectedChannelId) {
    selectedChannelId = channels[0].id;
  }
  renderChannelList();
  renderDetailPanel();
}

try {
  initChannelPage();
} catch(e) {
  console.error('Channel page init error:', e);
}
