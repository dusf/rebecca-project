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
      { page: 'accounts', label: '账号列表',
        icon: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { page: 'roles', label: '角色管理',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
      { page: 'permissions', label: '权限配置',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' }
    ]
  },
  {
    section: '全局配置',
    items: [
      { page: 'fields', label: '通用字段',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>' },
      { page: 'templates', label: '模版配置',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' },
      { page: 'dictionary', label: '数据字典',
        icon: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' }
    ]
  },
  {
    section: '系统设置',
    items: [
      { page: 'audit-log', label: '操作日志',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>' },
      { page: 'system-config', label: '系统参数',
        icon: '<svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.64l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15-.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.64V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.64l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.64V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>' }
    ]
  }
];

// ==================== 页面路由映射 ====================
var PLATFORM_PAGE_CONFIG = {
  'accounts':     'account/accounts.html',
  'roles':        'account/roles.html',
  'permissions':  'account/permissions.html',
  'fields':       'config/fields.html',
  'templates':    'config/templates.html',
  'dictionary':   'config/dictionary.html',
  'audit-log':    'config/audit_log.html',
  'system-config':'config/system_config.html'
};

// ==================== 面包屑配置 ====================
var PLATFORM_BREADCRUMB_CONFIG = {
  'accounts':     ['账号管理', '账号列表'],
  'roles':        ['账号管理', '角色管理'],
  'permissions':  ['账号管理', '权限配置'],
  'fields':       ['全局配置', '通用字段'],
  'templates':    ['全局配置', '模版配置'],
  'dictionary':   ['全局配置', '数据字典'],
  'audit-log':    ['系统设置', '操作日志'],
  'system-config':['系统设置', '系统参数']
};

// ==================== 侧边栏渲染 ====================
function renderSidebar(activePage) {
  var container = document.getElementById('sidebarContainer');
  if (!container) return;

  var html = '';
  // 品牌区域
  html += '<div class="sidebar-brand">';
  html += '<div class="sidebar-brand-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>';
  html += '<div><div class="sidebar-brand-name">中台管理</div><div class="sidebar-brand-sub">PLATFORM CONSOLE</div></div>';
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

// ==================== iframe 加载 ====================
function loadIframe(url) {
  var iframe = document.getElementById('contentFrame');
  var loader = document.getElementById('iframeLoader');
  if (!iframe) return;

  if (loader) loader.classList.add('active');

  iframe.src = url;

  iframe.onload = function() {
    if (loader) loader.classList.remove('active');
  };
}

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
