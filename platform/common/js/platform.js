// ==================== 中台后台 公共脚本 ====================
// 此文件包含 Toast、侧边栏导航等所有页面共享的逻辑

// ==================== Toast 通知 ====================
function showToast(type, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span><span>' + message + '</span>';
  container.appendChild(toast);

  setTimeout(function() {
    toast.style.animation = 'toastOut 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// ==================== 侧边栏菜单数据 ====================
var PLATFORM_SIDEBAR_MENU = [
  {
    section: '账号管理',
    items: [
      { page: 'organization', label: '组织机构',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><line x1="8" y1="10" x2="12" y2="14"/><line x1="16" y1="10" x2="12" y2="14"/></svg>' },
      { page: 'accounts', label: '账号列表',
        icon: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { page: 'shop-accounts', label: '商家账号',
        icon: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' }
    ]
  },
  {
    section: '通用参数',
    items: [
      { page: 'zone', label: '地域',
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="M12 2a7 7 0 0 0-7 7 7 7 0 0 0 7 7 7 7 0 0 0 7-7 7 7 0 0 0-7-7z"/></svg>' },
      { page: 'country', label: '国家',
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
      { page: 'region', label: '地区',
        icon: '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
      { page: 'language', label: '语言',
        icon: '<svg viewBox="0 0 24 24"><path d="M5 8h6"/><path d="M8 8v8"/><path d="M14 16V8l5 8V8"/></svg>' },
      { page: 'currency', label: '货币',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
      { page: 'exchange-rate', label: '汇率',
        icon: '<svg viewBox="0 0 24 24"><path d="M17 10H3l4-4"/><path d="M7 14h14l-4 4"/></svg>' },
      { page: 'tax-rate', label: '税率',
        icon: '<svg viewBox="0 0 24 24"><path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>' },
      { page: 'shipping', label: '运费',
        icon: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="13" height="10"/><path d="M15 12h5l2 3v2h-7"/><circle cx="6.5" cy="17" r="2"/><circle cx="17.5" cy="17" r="2"/></svg>' },
      { page: 'vip', label: 'VIP体系',
        icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
      { page: 'category', label: '分类',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' }
    ]
  },
  {
    section: '日志管理',
    items: [
      { page: 'operation-log', label: '操作日志',
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
      { page: 'login-log', label: '登录日志',
        icon: '<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>' }
    ]
  }
];

// ==================== 页面路由映射 ====================
var PLATFORM_PAGE_CONFIG = {
  'organization':  'account/organization/organization.html',
  'accounts':      'account/accounts/accounts.html',
  'shop-accounts': 'account/shop_accounts/shop_accounts.html',
  'zone':          'global/zone/zone.html',
  'country':       'global/country/country.html',
  'region':        'global/region/region.html',
  'language':      'global/language/language.html',
  'currency':      'global/currency/currency.html',
  'exchange-rate': 'global/exchange_rate/exchange_rate.html',
  'tax-rate':      'global/tax_rate/tax_rate.html',
  'shipping':      'global/shipping/shipping.html',
  'vip':           'global/vip/vip.html',
  'category':      'global/category/category.html',
  'operation-log': 'log/operation_log/operation_log.html',
  'login-log':     'log/login_log/login_log.html'
};

// ==================== 面包屑配置 ====================
var PLATFORM_BREADCRUMB_CONFIG = {
  'organization':  ['账号管理', '组织机构'],
  'accounts':      ['账号管理', '账号列表'],
  'shop-accounts': ['账号管理', '商家账号'],
  'zone':          ['通用参数', '地域'],
  'country':       ['通用参数', '国家'],
  'region':        ['通用参数', '地区'],
  'language':      ['通用参数', '语言'],
  'currency':      ['通用参数', '货币'],
  'exchange-rate': ['通用参数', '汇率'],
  'tax-rate':      ['通用参数', '税率'],
  'shipping':      ['通用参数', '运费'],
  'vip':           ['通用参数', 'VIP体系'],
  'category':      ['通用参数', '分类'],
  'operation-log': ['日志管理', '操作日志'],
  'login-log':     ['日志管理', '登录日志']
};

// ==================== 侧边栏渲染 ====================
function renderSidebar(activePage) {
  var container = document.getElementById('sidebarContainer');
  if (!container) return;

  var html = '';
  // 品牌区域
  html += '<div class="sidebar-brand">';
  html += '<div class="sidebar-brand-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>';
  html += '<div><div class="sidebar-brand-name">中台管理</div></div>';
  html += '</div>';

  // 导航菜单
  html += '<nav class="sidebar-nav">';
  PLATFORM_SIDEBAR_MENU.forEach(function(group) {
    html += '<div class="sidebar-section-title">' + group.section + '</div>';
    group.items.forEach(function(item) {
      var activeClass = item.page === activePage ? ' active' : '';
      html += '<div class="sidebar-item' + activeClass + '" data-page="' + item.page + '">';
      html += '<span class="sidebar-item-icon">' + item.icon + '</span>';
      html += item.label;
      html += '</div>';
    });
  });
  html += '</nav>';

  // 底部用户信息
  html += '<div class="sidebar-profile">';
  html += '<div class="sidebar-profile-avatar">管</div>';
  html += '<div class="sidebar-profile-info">';
  html += '<div class="sidebar-profile-name">系统管理员</div>';
  html += '<div class="sidebar-profile-role">超级管理员</div>';
  html += '</div>';
  html += '</div>';

  container.innerHTML = html;
}

// ==================== 更新面包屑 ====================
function updateBreadcrumb(page) {
  var bc = PLATFORM_BREADCRUMB_CONFIG[page] || ['', page];
  var el = document.getElementById('breadcrumb');
  if (!el) return;

  var html = '';
  bc.forEach(function(item, index) {
    var isLast = index === bc.length - 1;
    var label = (typeof item === 'object' && item !== null) ? item.label : item;
    if (isLast) {
      html += '<span class="breadcrumb-current">' + label + '</span>';
    } else if (typeof item === 'object' && item !== null && item.page) {
      html += '<span class="breadcrumb-link" onclick="window.handleSidebarNav(\'' + item.page + '\')">' + label + '</span>';
    } else {
      html += '<span>' + label + '</span>';
    }
    if (!isLast) {
      html += '<span class="breadcrumb-separator">/</span>';
    }
  });
  el.innerHTML = html;
}

// ==================== 侧边栏导航 ====================
window.handleSidebarNav = function(page) {
  if (!page) return;

  // 更新侧边栏选中状态
  var items = document.querySelectorAll('#sidebarContainer .sidebar-item');
  items.forEach(function(item) {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // 更新面包屑
  updateBreadcrumb(page);

  // 加载对应 iframe
  var url = PLATFORM_PAGE_CONFIG[page];
  if (url) {
    loadIframe(url);
    window.currentActivePage = page;
  } else {
    showToast('info', '页面 "' + page + '" 尚未配置路由');
  }
};

// ==================== iframe 加载（缓存池机制：切换菜单时保持页面状态，不重新加载） ====================
var PLATFORM_IFRAME_CACHE = {};
var PLATFORM_CURRENT_URL = 'account/accounts/accounts.html';

function loadIframe(url) {
  var container = document.querySelector('.iframe-container');
  if (!container) return;

  // 导航前关闭所有打开的对话框
  if (typeof dlgOnNavigate === 'function') dlgOnNavigate();

  // 隐藏当前 iframe
  if (PLATFORM_CURRENT_URL && PLATFORM_IFRAME_CACHE[PLATFORM_CURRENT_URL]) {
    PLATFORM_IFRAME_CACHE[PLATFORM_CURRENT_URL].classList.remove('active');
  }

  // 如果已缓存，直接显示
  if (PLATFORM_IFRAME_CACHE[url]) {
    PLATFORM_IFRAME_CACHE[url].classList.add('active');
    PLATFORM_CURRENT_URL = url;
    return;
  }

  // 新建 iframe
  var loader = document.getElementById('iframeLoader');
  if (loader) loader.classList.add('active');

  var iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = '内容区';
  iframe.className = 'active';

  iframe.onload = function() {
    if (loader) loader.classList.remove('active');
  };

  container.appendChild(iframe);
  PLATFORM_IFRAME_CACHE[url] = iframe;
  PLATFORM_CURRENT_URL = url;
}

// 初始化：将初始 iframe 加入缓存
(function() {
  var initIframe = document.getElementById('contentFrame');
  if (initIframe) {
    initIframe.classList.add('active');
    PLATFORM_IFRAME_CACHE[PLATFORM_CURRENT_URL] = initIframe;
  }
})();

// ==================== 事件委托：侧边栏点击 ====================
document.addEventListener('DOMContentLoaded', function() {
  var sidebar = document.getElementById('sidebarContainer');
  if (!sidebar) return;

  sidebar.addEventListener('click', function(e) {
    var item = e.target.closest('.sidebar-item');
    if (!item) return;
    var page = item.dataset.page;
    if (!page) return;

    handleSidebarNav(page);
  });

  // 自动渲染侧边栏
  if (typeof CURRENT_PAGE !== 'undefined') {
    renderSidebar(CURRENT_PAGE);
  }
});

// ==================== 对话框工具函数 ====================
function openDialog(options) {
  var overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.id = options.id || '';

  var titleHtml = options.title || '';
  var descHtml = options.desc ? '<div class="dialog-desc">' + options.desc + '</div>' : '';
  var bodyHtml = options.body || '';
  var actionsHtml = options.actions || '';

  overlay.innerHTML = '<div class="dialog" style="' + (options.width ? 'width:' + options.width + ';' : '') + '">' +
    '<div class="dialog-header">' +
      '<div class="dialog-title">' + titleHtml + '</div>' +
      '<button class="dialog-close" onclick="closeDialog(\'' + (overlay.id || '') + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div>' +
    descHtml +
    '<div class="dialog-body">' + bodyHtml + '</div>' +
    '<div class="dialog-actions">' + actionsHtml + '</div>' +
  '</div>';

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
  return overlay;
}

function closeDialog(id) {
  var overlay = id ? document.getElementById(id) : document.querySelector('.dialog-overlay');
  if (overlay) overlay.remove();
}

// ==================== 页面跳转（iframe兼容） ====================
function navigateToPage(url) {
  if (window.self !== window.top && window.parent && window.parent.loadIframe) {
    window.parent.loadIframe(url);
  } else {
    window.location.href = url;
  }
}
