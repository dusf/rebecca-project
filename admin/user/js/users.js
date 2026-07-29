(function (root) {
  'use strict';

  const COLUMNS = [
    { key: 'user', label: '用户信息', fixed: 'left', alwaysShow: true, width: 260 },
    { key: 'accountStatus', label: '账号状态' },
    { key: 'marketingStatus', label: '邮件营销' },
    { key: 'authProviders', label: '登录方式' },
    { key: 'source', label: '用户来源' },
    { key: 'stores', label: '关联店铺' },
    { key: 'orderCount', label: '订单数', sortable: true },
    { key: 'totalSpent', label: '累计消费', sortable: true },
    { key: 'lastLoginAt', label: '最后登录时间', sortable: true },
    { key: 'createdAt', label: '创建时间', sortable: true }
  ];

  const VISIBLE_KEY = 'rebecca_user_columns_v1';
  const ORDER_KEY = 'rebecca_user_column_order_v1';

  const state = {
    view: 'all',
    search: '',
    filters: {
      accountStatus: 'all',
      marketingStatus: 'all',
      source: 'all',
      authProvider: 'all',
      storeId: 'all',
      createdFrom: '',
      createdTo: ''
    },
    sort: { key: 'createdAt', direction: 'desc' },
    selected: new Set(),
    page: 1,
    pageSize: 10,
    status: 'ready'
  };

  const ACCOUNT_LABELS = {
    registered: '已注册',
    pending: '待激活',
    disabled: '已禁用'
  };
  const MARKETING_LABELS = {
    subscribed: '已订阅',
    not_subscribed: '未订阅',
    unsubscribed: '已退订',
    pending: '待确认',
    invalid: '无效邮箱'
  };
  const SOURCE_LABELS = {
    storefront: '店铺注册',
    newsletter: '邮件订阅',
    shopify_api: 'Shopify API',
    shopify_csv: 'Shopify CSV',
    csv: 'CSV 导入',
    admin: '后台添加',
    import: '其他导入'
  };
  const PROVIDER_LABELS = {
    password: '邮箱密码',
    google: 'Google',
    facebook: 'Facebook',
    shop: 'Shop'
  };
  const VIEW_DEFINITIONS = [
    { key: 'all', label: '全部用户' },
    { key: 'active', label: '已注册' },
    { key: 'subscribed', label: '已订阅' },
    { key: 'pending', label: '待激活' },
    { key: 'disabled', label: '已禁用' }
  ];

  let allUsers = [];
  let visibleKeys = loadVisibleKeys();
  let columnOrder = loadColumnOrder();
  let errorMessage = '';
  let filterControlsReady = false;
  let pageSizeController = null;

  const elements = {};

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function readStorage(key) {
    try {
      return root.localStorage ? JSON.parse(root.localStorage.getItem(key)) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      if (root.localStorage) root.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      showToast('当前浏览器无法保存列设置。', 'error');
    }
  }

  function loadVisibleKeys() {
    const valid = new Set(COLUMNS.map(function (column) { return column.key; }));
    const stored = readStorage(VISIBLE_KEY);
    const keys = Array.isArray(stored)
      ? stored.filter(function (key) { return valid.has(key); })
      : COLUMNS.map(function (column) { return column.key; });
    if (keys.indexOf('user') === -1) keys.unshift('user');
    return new Set(keys);
  }

  function loadColumnOrder() {
    const defaults = COLUMNS.map(function (column) { return column.key; });
    const stored = readStorage(ORDER_KEY);
    if (!Array.isArray(stored)) return defaults;
    const valid = new Set(defaults);
    const unique = stored.filter(function (key, index) {
      return valid.has(key) && stored.indexOf(key) === index;
    });
    defaults.forEach(function (key) {
      if (unique.indexOf(key) === -1) unique.push(key);
    });
    const userIndex = unique.indexOf('user');
    if (userIndex > 0) {
      unique.splice(userIndex, 1);
      unique.unshift('user');
    }
    return unique;
  }

  function activeColumns() {
    return columnOrder.map(function (key) {
      return COLUMNS.find(function (column) { return column.key === key; });
    }).filter(function (column) {
      return column && (column.alwaysShow || visibleKeys.has(column.key));
    });
  }

  function fullName(user) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || '未填写姓名';
  }

  function initials(user) {
    const name = [user.firstName, user.lastName].filter(Boolean).join('');
    return (name || user.email || '用').slice(0, 2).toUpperCase();
  }

  function formatDate(value, withTime) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('zh-CN', withTime === false ? {
      year: 'numeric', month: '2-digit', day: '2-digit'
    } : {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function parentWindow() {
    try {
      return root.parent || root;
    } catch (error) {
      return root;
    }
  }

  function closeMenu(menu) {
    if (menu && menu.tagName === 'DETAILS') menu.open = false;
  }

  function showToast(message, tone) {
    const region = elements.toastRegion || root.document.getElementById('userToastRegion');
    if (!region) return;
    const toast = root.document.createElement('div');
    toast.className = 'um-toast um-toast-' + (tone || 'success');
    toast.textContent = message;
    region.appendChild(toast);
    root.setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }

  function openShopifyImport() {
    try {
      if (window.parent.UserDialogs && typeof window.parent.UserDialogs.openShopifyImport === 'function') {
        window.parent.UserDialogs.openShopifyImport();
        return;
      }
    } catch (error) {
      showToast('无法访问父页面的 Shopify 导入功能。', 'error');
      return;
    }
    showToast('Shopify 导入功能正在加载，请稍后再试。', 'error');
  }

  function openCsvImport() {
    try {
      if (window.parent.UserDialogs && typeof window.parent.UserDialogs.openCsvImport === 'function') {
        window.parent.UserDialogs.openCsvImport();
        return;
      }
    } catch (error) {
      showToast('无法访问父页面的 CSV 导入功能。', 'error');
      return;
    }
    showToast('CSV 导入功能正在加载，请稍后再试。', 'error');
  }

  function openMarketingDialog(ids) {
    const dialogs = parentWindow().UserDialogs;
    const method = dialogs && (
      dialogs.openMarketingConsent ||
      dialogs.openMarketing ||
      dialogs.openConsent
    );
    if (typeof method === 'function') {
      method.call(dialogs, ids.slice());
      return true;
    }
    showToast('邮件营销批量操作暂未加载，请稍后再试。', 'error');
    return false;
  }

  function openDeleteDialog(ids) {
    const dialogs = parentWindow().UserDialogs;
    const method = dialogs && (
      dialogs.openDeleteUsers ||
      dialogs.openDelete ||
      dialogs.openRemoveUsers
    );
    if (typeof method === 'function') {
      method.call(dialogs, ids.slice());
      return true;
    }
    showToast('删除确认功能暂未加载，请稍后再试。', 'error');
    return false;
  }

  function navigateToAdd() {
    try {
      if (typeof window.parent.loadAdminPage === 'function') {
        window.parent.loadAdminPage('users', 'user/user_form.html?mode=add');
        return;
      }
    } catch (error) {
      showToast('无法访问父页面导航。', 'error');
      return;
    }
    showToast('页面导航尚未加载，请刷新后台后重试。', 'error');
  }

  function navigateToEdit(userId) {
    try {
      if (typeof window.parent.loadAdminPage === 'function') {
        window.parent.loadAdminPage('users', `user/user_form.html?mode=edit&id=${encodeURIComponent(userId)}`);
        return;
      }
    } catch (error) {
      showToast('无法访问父页面导航。', 'error');
      return;
    }
    showToast('页面导航尚未加载，请刷新后台后重试。', 'error');
  }

  function option(value, label) {
    return { value: String(value), label: String(label) };
  }

  function uniqueOptions(values, labels, allLabel) {
    const output = [option('all', allLabel)];
    Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(labels[a] || a).localeCompare(String(labels[b] || b), 'zh-CN');
    }).forEach(function (value) {
      output.push(option(value, labels[value] || value));
    });
    return output;
  }

  function comboboxMarkup(name, value) {
    return '<div class="um-combobox" data-um-combobox="' + escapeHtml(name) +
      '" data-value="' + escapeHtml(value) + '">' +
      '<button class="um-control um-combobox-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"></button>' +
      '<div class="um-combobox-popover" role="listbox" hidden>' +
      '<div class="um-combobox-search-wrap">' +
      '<input class="um-combobox-search" type="text" placeholder="输入关键词搜索" aria-label="搜索选项">' +
      '</div><div class="um-combobox-options"></div></div></div>';
  }

  function mountFilter(host, name, currentValue, options, onChange) {
    host.innerHTML = comboboxMarkup(name, currentValue);
    const element = host.firstElementChild;
    const controller = root.UserComponents.mountCombobox(element, options);
    element.addEventListener('um:change', function (event) {
      onChange(event.detail.value);
    });
    return controller;
  }

  function filterOptions() {
    const sources = allUsers.map(function (user) { return user.source; });
    const providers = [];
    const stores = {};
    allUsers.forEach(function (user) {
      (user.authProviders || []).forEach(function (provider) {
        if (provider && provider.type) providers.push(provider.type);
      });
      (user.stores || []).forEach(function (store) {
        if (store && store.id) stores[store.id] = store.name || store.domain || store.id;
      });
    });
    const storeOptions = [option('all', '全部关联店铺')].concat(
      Object.keys(stores).sort(function (a, b) {
        return stores[a].localeCompare(stores[b], 'zh-CN');
      }).map(function (id) { return option(id, stores[id]); })
    );
    return {
      accountStatus: [
        option('all', '全部账号状态'),
        option('registered', '已注册'),
        option('pending', '待激活'),
        option('disabled', '已禁用')
      ],
      marketingStatus: [
        option('all', '全部营销状态'),
        option('subscribed', '已订阅'),
        option('not_subscribed', '未订阅'),
        option('unsubscribed', '已退订')
      ],
      source: uniqueOptions(sources, SOURCE_LABELS, '全部用户来源'),
      authProvider: uniqueOptions(providers, PROVIDER_LABELS, '全部登录方式'),
      storeId: storeOptions
    };
  }

  function setupFilterControls(refresh) {
    const options = filterOptions();
    const definitions = [
      { host: elements.accountFilter, name: 'accountStatus' },
      { host: elements.marketingFilter, name: 'marketingStatus' },
      { host: elements.sourceFilter, name: 'source' },
      { host: elements.providerFilter, name: 'authProvider' },
      { host: elements.storeFilter, name: 'storeId' }
    ];
    if (filterControlsReady && refresh) {
      definitions.forEach(function (definition) {
        const element = definition.host.querySelector('[data-um-combobox]');
        if (element) root.UserComponents.refresh(element, options[definition.name]);
      });
      return;
    }
    definitions.forEach(function (definition) {
      mountFilter(
        definition.host,
        definition.name,
        state.filters[definition.name],
        options[definition.name],
        function (value) {
          state.filters[definition.name] = value;
          state.page = 1;
          render();
        }
      );
    });
    filterControlsReady = true;
  }

  function setupPageSizeControl() {
    const host = elements.pagination.querySelector('[data-page-size-host]');
    if (!host) return;
    pageSizeController = mountFilter(host, 'pageSize', state.pageSize, [
      option('10', '10 条/页'),
      option('20', '20 条/页'),
      option('50', '50 条/页'),
      option('100', '100 条/页')
    ], function (value) {
      state.pageSize = Number(value);
      state.page = 1;
      render();
    });
  }

  function matchesView(user) {
    if (state.view === 'active') return user.accountStatus === 'registered';
    if (state.view === 'subscribed') return user.marketingStatus === 'subscribed';
    if (state.view === 'pending') return user.accountStatus === 'pending';
    if (state.view === 'disabled') return user.accountStatus === 'disabled';
    return true;
  }

  function matchesSearch(user) {
    if (!state.search) return true;
    const haystack = [
      fullName(user),
      user.email,
      user.phone,
      (user.tags || []).join(' '),
      (user.stores || []).map(function (store) {
        return [store.name, store.domain].filter(Boolean).join(' ');
      }).join(' ')
    ].join(' ').toLocaleLowerCase();
    return haystack.indexOf(state.search.toLocaleLowerCase()) !== -1;
  }

  function matchesFilters(user) {
    const filters = state.filters;
    if (filters.accountStatus !== 'all' && user.accountStatus !== filters.accountStatus) return false;
    if (filters.marketingStatus !== 'all' && user.marketingStatus !== filters.marketingStatus) return false;
    if (filters.source !== 'all' && user.source !== filters.source) return false;
    if (filters.authProvider !== 'all' && !(user.authProviders || []).some(function (provider) {
      return provider.type === filters.authProvider;
    })) return false;
    if (filters.storeId !== 'all' && !(user.stores || []).some(function (store) {
      return store.id === filters.storeId;
    })) return false;
    const created = user.createdAt ? String(user.createdAt).slice(0, 10) : '';
    if (filters.createdFrom && (!created || created < filters.createdFrom)) return false;
    if (filters.createdTo && (!created || created > filters.createdTo)) return false;
    return true;
  }

  function sortableValue(user, key) {
    if (key === 'orderCount' || key === 'totalSpent') return Number(user[key]) || 0;
    if (key === 'createdAt' || key === 'lastLoginAt') {
      const time = user[key] ? new Date(user[key]).getTime() : 0;
      return Number.isNaN(time) ? 0 : time;
    }
    return String(user[key] || '').toLocaleLowerCase();
  }

  function filteredUsers() {
    const users = allUsers.filter(function (user) {
      return matchesView(user) && matchesSearch(user) && matchesFilters(user);
    });
    const direction = state.sort.direction === 'asc' ? 1 : -1;
    users.sort(function (left, right) {
      const a = sortableValue(left, state.sort.key);
      const b = sortableValue(right, state.sort.key);
      if (a < b) return -1 * direction;
      if (a > b) return 1 * direction;
      return String(left.id).localeCompare(String(right.id)) * direction;
    });
    return users;
  }

  function hasActiveFilters() {
    return state.view !== 'all' || Boolean(state.search) ||
      Object.keys(state.filters).some(function (key) {
        return state.filters[key] !== 'all' && state.filters[key] !== '';
      });
  }

  function viewCount(view) {
    if (view === 'all') return allUsers.length;
    if (view === 'active') return allUsers.filter(function (user) { return user.accountStatus === 'registered'; }).length;
    if (view === 'subscribed') return allUsers.filter(function (user) { return user.marketingStatus === 'subscribed'; }).length;
    if (view === 'pending') return allUsers.filter(function (user) { return user.accountStatus === 'pending'; }).length;
    return allUsers.filter(function (user) { return user.accountStatus === 'disabled'; }).length;
  }

  function renderViews() {
    elements.viewTabs.innerHTML = VIEW_DEFINITIONS.map(function (view) {
      return '<button class="um-view-tab" type="button" role="tab" data-view="' +
        escapeHtml(view.key) + '" aria-selected="' + (view.key === state.view ? 'true' : 'false') +
        '">' + escapeHtml(view.label) + ' <span>(' + viewCount(view.key) + ')</span></button>';
    }).join('');
  }

  function renderColumnPanel() {
    elements.columnPanel.innerHTML =
      '<div class="um-column-title">自定义列</div>' +
      '<p class="um-column-hint">选择要展示的字段，并用箭头调整列顺序。用户信息始终固定在左侧。</p>' +
      columnOrder.map(function (key, index) {
        const column = COLUMNS.find(function (item) { return item.key === key; });
        if (!column) return '';
        const checked = column.alwaysShow || visibleKeys.has(key);
        return '<div class="um-column-row" data-column="' + escapeHtml(key) + '">' +
          '<label class="um-checkbox">' +
          '<input class="um-checkbox-input" type="checkbox" data-column-visible="' + escapeHtml(key) +
          '" ' + (checked ? 'checked' : '') + (column.alwaysShow ? ' disabled' : '') + '>' +
          '<span class="um-checkbox-box" aria-hidden="true"></span><span>' + escapeHtml(column.label) + '</span></label>' +
          '<button class="um-column-move" type="button" data-column-move="up" aria-label="上移' +
          escapeHtml(column.label) + '"' + (index === 0 || column.alwaysShow ? ' disabled' : '') + '>↑</button>' +
          '<button class="um-column-move" type="button" data-column-move="down" aria-label="下移' +
          escapeHtml(column.label) + '"' + (index === columnOrder.length - 1 || column.alwaysShow ? ' disabled' : '') + '>↓</button>' +
          '</div>';
      }).join('');
  }

  function renderBulkBar() {
    const count = state.selected.size;
    elements.bulkBar.hidden = count === 0;
    if (!count) {
      elements.bulkBar.innerHTML = '';
      return;
    }
    elements.bulkBar.innerHTML =
      '<strong>已选择 ' + count + ' 位用户</strong>' +
      '<div class="um-bulk-actions">' +
      '<button class="um-button um-button-secondary" type="button" data-bulk="tag">添加标签</button>' +
      '<button class="um-button um-button-secondary" type="button" data-bulk="marketing">邮件营销</button>' +
      '<details class="um-menu"><summary class="um-button um-button-secondary">账号状态</summary>' +
      '<div class="um-menu-panel"><button type="button" data-account-status="registered">设为已注册</button>' +
      '<button type="button" data-account-status="pending">设为待激活</button>' +
      '<button type="button" data-account-status="disabled">设为已禁用</button></div></details>' +
      '<button class="um-button um-button-secondary" type="button" data-bulk="export">导出所选</button>' +
      '<button class="um-button um-button-secondary" type="button" data-bulk="columns">自定义列</button>' +
      '<button class="um-icon-button" type="button" data-bulk="refresh" aria-label="刷新列表" title="刷新列表">↻</button>' +
      '<details class="um-menu"><summary class="um-button um-button-secondary">更多</summary>' +
      '<div class="um-menu-panel um-menu-panel-right"><button class="um-button-danger" type="button" data-bulk="delete">删除所选</button>' +
      '<button type="button" data-bulk="clear">取消选择</button></div></details>' +
      '</div>';
  }

  function badge(label, tone) {
    return '<span class="um-badge' + (tone ? ' um-badge-' + tone : '') + '">' + escapeHtml(label) + '</span>';
  }

  function storeDetail(user) {
    const stores = user.stores || [];
    if (!stores.length) return '<span class="um-muted">未关联</span>';
    const rows = stores.map(function (store) {
      return '<div class="um-detail-row"><strong>' + escapeHtml(store.name || '未命名店铺') + '</strong>' +
        '<span class="um-muted">' + escapeHtml(store.domain || store.id || '—') + '</span></div>';
    }).join('');
    return '<button class="um-detail-anchor" type="button" aria-label="查看' + stores.length + '个关联店铺详情">' +
      escapeHtml(stores[0].name || stores[0].domain || stores[0].id) +
      (stores.length > 1 ? ' +' + (stores.length - 1) : '') +
      '<span class="um-detail-card" role="tooltip"><strong>关联店铺</strong>' + rows + '</span></button>';
  }

  function orderDetail(user) {
    return '<button class="um-detail-anchor" type="button" aria-label="查看订单详情">' +
      escapeHtml(user.orderCount || 0) +
      '<span class="um-detail-card" role="tooltip"><strong>订单概览</strong>' +
      '<div class="um-detail-row">订单数：' + escapeHtml(user.orderCount || 0) + '</div>' +
      '<div class="um-detail-row">累计消费：' + escapeHtml(formatMoney(user.totalSpent)) + '</div>' +
      '<div class="um-detail-row">最后下单：' + escapeHtml(formatDate(user.lastOrderAt)) + '</div>' +
      '</span></button>';
  }

  function renderCell(user, key) {
    if (key === 'user') {
      return '<div class="um-user-main"><span class="um-avatar" aria-hidden="true">' +
        escapeHtml(initials(user)) + '</span><div class="um-user-copy">' +
        '<div class="um-user-name">' + escapeHtml(fullName(user)) + '</div>' +
        '<div class="um-user-email" title="' + escapeHtml(user.email) + '">' + escapeHtml(user.email) +
        '</div></div></div>';
    }
    if (key === 'accountStatus') {
      const tone = user.accountStatus === 'registered' ? 'success' :
        (user.accountStatus === 'disabled' ? 'danger' : 'warning');
      return badge(ACCOUNT_LABELS[user.accountStatus] || user.accountStatus, tone);
    }
    if (key === 'marketingStatus') {
      const tone = user.marketingStatus === 'subscribed' ? 'success' :
        (user.marketingStatus === 'unsubscribed' ? 'danger' : '');
      return badge(MARKETING_LABELS[user.marketingStatus] || user.marketingStatus, tone);
    }
    if (key === 'authProviders') {
      if (!user.authProviders || !user.authProviders.length) return '<span class="um-muted">未激活</span>';
      return '<div class="um-badge-row">' + user.authProviders.map(function (provider) {
        return badge(PROVIDER_LABELS[provider.type] || provider.type);
      }).join('') + '</div>';
    }
    if (key === 'source') return escapeHtml(SOURCE_LABELS[user.source] || user.source || '—');
    if (key === 'stores') return storeDetail(user);
    if (key === 'orderCount') return orderDetail(user);
    if (key === 'totalSpent') return escapeHtml(formatMoney(user.totalSpent));
    if (key === 'lastLoginAt') return escapeHtml(user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录');
    if (key === 'createdAt') return escapeHtml(formatDate(user.createdAt));
    return '—';
  }

  function renderHead(columns, pageUsers) {
    const allSelected = pageUsers.length > 0 && pageUsers.every(function (user) {
      return state.selected.has(user.id);
    });
    elements.tableHead.innerHTML = '<tr>' +
      '<th class="um-select-cell um-frozen-left" scope="col">' +
      '<label class="um-checkbox" aria-label="选择当前页全部用户">' +
      '<input class="um-checkbox-input" type="checkbox" id="userSelectPage" ' + (allSelected ? 'checked' : '') + '>' +
      '<span class="um-checkbox-box" aria-hidden="true"></span></label></th>' +
      columns.map(function (column) {
        const classes = column.key === 'user' ? 'um-user-cell um-frozen-left' : '';
        const style = column.width ? ' style="width:' + column.width + 'px"' : '';
        if (!column.sortable) {
          return '<th class="' + classes + '" scope="col"' + style + '>' + escapeHtml(column.label) + '</th>';
        }
        const active = state.sort.key === column.key;
        const ariaSort = active ? (state.sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
        return '<th class="' + classes + '" scope="col" aria-sort="' + ariaSort + '"' + style + '>' +
          '<button class="um-sort-button" type="button" data-sort="' + escapeHtml(column.key) +
          '">' + escapeHtml(column.label) +
          '<span class="um-sort-indicator" aria-hidden="true">' +
          (active ? (state.sort.direction === 'asc' ? '▲' : '▼') : '↕') + '</span></button></th>';
      }).join('') +
      '<th class="um-operation-cell um-frozen-right" scope="col">操作</th></tr>';
    const checkbox = elements.tableHead.querySelector('#userSelectPage');
    if (checkbox) {
      const selectedCount = pageUsers.filter(function (user) { return state.selected.has(user.id); }).length;
      checkbox.indeterminate = selectedCount > 0 && selectedCount < pageUsers.length;
    }
  }

  function renderRows(columns, pageUsers) {
    elements.tableBody.innerHTML = pageUsers.map(function (user) {
      return '<tr data-user-row="' + escapeHtml(user.id) + '">' +
        '<td class="um-select-cell um-frozen-left"><label class="um-checkbox" aria-label="选择' +
        escapeHtml(fullName(user)) + '"><input class="um-checkbox-input" type="checkbox" data-select-user="' +
        escapeHtml(user.id) + '"' + (state.selected.has(user.id) ? ' checked' : '') +
        '><span class="um-checkbox-box" aria-hidden="true"></span></label></td>' +
        columns.map(function (column) {
          const classes = column.key === 'user' ? 'um-user-cell um-frozen-left' : '';
          return '<td class="' + classes + '">' + renderCell(user, column.key) + '</td>';
        }).join('') +
        '<td class="um-operation-cell um-frozen-right"><div class="um-row-actions">' +
        '<button class="um-row-action" type="button" data-row-action="edit" data-user-id="' +
        escapeHtml(user.id) + '">编辑</button>' +
        '<details class="um-menu um-row-menu"><summary class="um-row-action" aria-label="更多用户操作">•••</summary>' +
        '<div class="um-menu-panel um-menu-panel-right">' +
        '<button type="button" data-row-action="marketing" data-user-id="' + escapeHtml(user.id) + '">邮件营销</button>' +
        '<button type="button" data-row-action="account" data-account-status="' +
        (user.accountStatus === 'disabled' ? 'registered' : 'disabled') + '" data-user-id="' +
        escapeHtml(user.id) + '">' + (user.accountStatus === 'disabled' ? '启用账号' : '禁用账号') + '</button>' +
        '<button class="um-button-danger" type="button" data-row-action="delete" data-user-id="' +
        escapeHtml(user.id) + '">删除用户</button></div></details></div></td></tr>';
    }).join('');
  }

  function renderSkeleton(columns) {
    renderHead(columns, []);
    elements.tableBody.innerHTML = Array.from({ length: 6 }).map(function () {
      return '<tr class="um-skeleton-row" aria-hidden="true"><td class="um-select-cell um-frozen-left">' +
        '<span class="um-skeleton">&nbsp;</span></td>' +
        columns.map(function (column) {
          const classes = column.key === 'user' ? 'um-user-cell um-frozen-left' : '';
          return '<td class="' + classes + '"><div class="um-skeleton">&nbsp;</div></td>';
        }).join('') +
        '<td class="um-operation-cell um-frozen-right"><div class="um-skeleton">&nbsp;</div></td></tr>';
    }).join('');
  }

  function stateMarkup(type) {
    if (type === 'error') {
      return '<div class="um-state-content"><span class="um-state-icon" aria-hidden="true">!</span>' +
        '<h2>用户列表加载失败</h2><p>' + escapeHtml(errorMessage || '请检查本地数据后重试。') + '</p>' +
        '<button class="um-button um-button-secondary" type="button" data-state-action="retry">重试</button></div>';
    }
    if (type === 'empty') {
      return '<div class="um-state-content"><span class="um-state-icon" aria-hidden="true">◎</span>' +
        '<h2>还没有用户</h2><p>添加首位用户，或从 Shopify、CSV 导入已有用户档案。</p>' +
        '<button class="um-button um-button-primary" type="button" data-state-action="add">添加用户</button></div>';
    }
    return '<div class="um-state-content"><span class="um-state-icon" aria-hidden="true">⌕</span>' +
      '<h2>没有符合条件的用户</h2><p>尝试更换关键词、快捷视图或筛选条件。</p>' +
      '<button class="um-button um-button-secondary" type="button" data-state-action="clear">清除筛选</button></div>';
  }

  function renderPagination(total, pageCount) {
    if (pageSizeController) {
      pageSizeController.destroy();
      pageSizeController = null;
    }
    if (!total) {
      elements.pagination.hidden = true;
      elements.pagination.innerHTML = '';
      return;
    }
    elements.pagination.hidden = false;
    const start = (state.page - 1) * state.pageSize + 1;
    const end = Math.min(total, state.page * state.pageSize);
    elements.pagination.innerHTML =
      '<div class="um-pagination-size"><span>每页显示</span><div data-page-size-host></div></div>' +
      '<span>第 ' + start + '–' + end + ' 条，共 ' + total + ' 条</span>' +
      '<div class="um-pagination-actions">' +
      '<button class="um-pagination-button" type="button" data-page="prev"' +
      (state.page <= 1 ? ' disabled' : '') + '>上一页</button>' +
      '<span class="um-pagination-current">' + state.page + ' / ' + pageCount + '</span>' +
      '<button class="um-pagination-button" type="button" data-page="next"' +
      (state.page >= pageCount ? ' disabled' : '') + '>下一页</button></div>';
    setupPageSizeControl();
  }

  function renderTable() {
    const columns = activeColumns();
    elements.tableCard.setAttribute('aria-busy', state.status === 'loading' ? 'true' : 'false');
    elements.tableState.hidden = true;
    elements.tableScroll.hidden = false;
    if (state.status === 'loading') {
      renderSkeleton(columns);
      elements.resultSummary.textContent = '正在加载用户…';
      renderPagination(0, 1);
      return;
    }
    if (state.status === 'error') {
      elements.tableScroll.hidden = true;
      elements.tableState.hidden = false;
      elements.tableState.innerHTML = stateMarkup('error');
      elements.resultSummary.textContent = '加载失败';
      renderPagination(0, 1);
      return;
    }
    const users = filteredUsers();
    const pageCount = Math.max(1, Math.ceil(users.length / state.pageSize));
    if (state.page > pageCount) state.page = pageCount;
    const pageUsers = users.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    elements.resultSummary.textContent = users.length + ' 个结果';
    if (!users.length) {
      elements.tableScroll.hidden = true;
      elements.tableState.hidden = false;
      elements.tableState.innerHTML = stateMarkup(allUsers.length === 0 && !hasActiveFilters() ? 'empty' : 'filtered');
      renderPagination(0, 1);
      return;
    }
    renderHead(columns, pageUsers);
    renderRows(columns, pageUsers);
    renderPagination(users.length, pageCount);
  }

  function render() {
    elements.totalCount.textContent = allUsers.length;
    const validIds = new Set(allUsers.map(function (user) { return user.id; }));
    Array.from(state.selected).forEach(function (id) {
      if (!validIds.has(id)) state.selected.delete(id);
    });
    renderViews();
    renderBulkBar();
    renderColumnPanel();
    renderTable();
  }

  function clearFilters() {
    state.view = 'all';
    state.search = '';
    state.filters = {
      accountStatus: 'all',
      marketingStatus: 'all',
      source: 'all',
      authProvider: 'all',
      storeId: 'all',
      createdFrom: '',
      createdTo: ''
    };
    state.page = 1;
    elements.searchInput.value = '';
    elements.createdFrom.value = '';
    elements.createdTo.value = '';
    [
      [elements.accountFilter, 'all'],
      [elements.marketingFilter, 'all'],
      [elements.sourceFilter, 'all'],
      [elements.providerFilter, 'all'],
      [elements.storeFilter, 'all']
    ].forEach(function (entry) {
      const control = entry[0].querySelector('[data-um-combobox]');
      if (control) root.UserComponents.setValue(control, entry[1], false);
    });
    render();
  }

  function refreshUsers(showSuccess) {
    state.status = 'loading';
    render();
    root.setTimeout(function () {
      try {
        allUsers = root.UserStore.list();
        errorMessage = '';
        setupFilterControls(true);
        state.status = showSuccess ? 'success' : 'ready';
        render();
        if (showSuccess) showToast('用户列表已刷新。', 'success');
      } catch (error) {
        errorMessage = error && error.message ? error.message : '未知错误';
        state.status = 'error';
        render();
      }
    }, 120);
  }

  function selectedIds() {
    return Array.from(state.selected);
  }

  function setSelected(ids, selected) {
    ids.forEach(function (id) {
      if (selected) state.selected.add(id);
      else state.selected.delete(id);
    });
    render();
  }

  function updateSelectedAccountStatus(status, ids) {
    const targetIds = ids && ids.length ? ids : selectedIds();
    const result = root.UserStore.setAccountStatus(targetIds, status);
    if (!result.ok) {
      showToast(result.error || '账号状态更新失败。', 'error');
      return;
    }
    allUsers = root.UserStore.list();
    state.selected.clear();
    render();
    showToast('已更新 ' + result.changed + ' 位用户的账号状态。', 'success');
  }

  function addTagToSelected() {
    const value = root.prompt('输入要添加的标签');
    const tag = String(value || '').trim();
    if (!tag) return;
    let changed = 0;
    selectedIds().forEach(function (id) {
      const user = root.UserStore.get(id);
      if (!user) return;
      const tags = Array.isArray(user.tags) ? user.tags.slice() : [];
      if (tags.indexOf(tag) === -1) {
        tags.push(tag);
        if (root.UserStore.update(id, { tags: tags }).ok) changed += 1;
      }
    });
    allUsers = root.UserStore.list();
    state.selected.clear();
    render();
    showToast(changed ? '已为 ' + changed + ' 位用户添加标签。' : '所选用户已包含该标签。', 'success');
  }

  function csvCell(value) {
    return '"' + String(value === null || value === undefined ? '' : value).replace(/"/g, '""') + '"';
  }

  function exportUsers(ids) {
    const idSet = ids && ids.length ? new Set(ids) : null;
    const users = idSet ? allUsers.filter(function (user) { return idSet.has(user.id); }) : filteredUsers();
    if (!users.length) {
      showToast('当前没有可导出的用户。', 'error');
      return;
    }
    const rows = [
      ['姓名', '邮箱', '手机号', '账号状态', '邮件营销', '用户来源', '关联店铺', '订单数', '累计消费', '创建时间'],
      ...users.map(function (user) {
        return [
          fullName(user),
          user.email,
          user.phone,
          ACCOUNT_LABELS[user.accountStatus] || user.accountStatus,
          MARKETING_LABELS[user.marketingStatus] || user.marketingStatus,
          SOURCE_LABELS[user.source] || user.source,
          (user.stores || []).map(function (store) { return store.name || store.domain || store.id; }).join('、'),
          user.orderCount,
          user.totalSpent,
          user.createdAt
        ];
      })
    ];
    const csv = '\uFEFF' + rows.map(function (row) { return row.map(csvCell).join(','); }).join('\r\n');
    const url = root.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = root.document.createElement('a');
    link.href = url;
    link.download = 'users-' + new Date().toISOString().slice(0, 10) + '.csv';
    root.document.body.appendChild(link);
    link.click();
    link.remove();
    root.URL.revokeObjectURL(url);
    showToast('已导出 ' + users.length + ' 位用户。', 'success');
  }

  function handleHeaderClick(event) {
    const importButton = event.target.closest('[data-import]');
    if (importButton) {
      closeMenu(elements.importMenu);
      if (importButton.getAttribute('data-import') === 'shopify') openShopifyImport();
      else openCsvImport();
      return;
    }
    if (event.target.closest('#userAddButton')) navigateToAdd();
    if (event.target.closest('#userExportButton')) exportUsers();
  }

  function handleTableClick(event) {
    const sortButton = event.target.closest('[data-sort]');
    if (sortButton) {
      const key = sortButton.getAttribute('data-sort');
      if (state.sort.key === key) state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
      else state.sort = { key: key, direction: 'desc' };
      state.page = 1;
      render();
      return;
    }
    const rowAction = event.target.closest('[data-row-action]');
    if (rowAction) {
      const id = rowAction.getAttribute('data-user-id');
      const action = rowAction.getAttribute('data-row-action');
      if (action === 'edit') navigateToEdit(id);
      else if (action === 'marketing') openMarketingDialog([id]);
      else if (action === 'account') updateSelectedAccountStatus(rowAction.getAttribute('data-account-status'), [id]);
      else if (action === 'delete') openDeleteDialog([id]);
    }
  }

  function handleTableChange(event) {
    if (event.target.id === 'userSelectPage') {
      const pageUsers = filteredUsers().slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
      setSelected(pageUsers.map(function (user) { return user.id; }), event.target.checked);
      return;
    }
    if (event.target.matches('[data-select-user]')) {
      setSelected([event.target.getAttribute('data-select-user')], event.target.checked);
    }
  }

  function handleBulkClick(event) {
    const account = event.target.closest('[data-account-status]');
    if (account) {
      updateSelectedAccountStatus(account.getAttribute('data-account-status'));
      return;
    }
    const button = event.target.closest('[data-bulk]');
    if (!button) return;
    const action = button.getAttribute('data-bulk');
    if (action === 'tag') addTagToSelected();
    else if (action === 'marketing') openMarketingDialog(selectedIds());
    else if (action === 'export') exportUsers(selectedIds());
    else if (action === 'columns') {
      event.stopPropagation();
      elements.columnMenu.open = true;
      elements.columnMenu.querySelector('summary').focus();
    } else if (action === 'refresh') refreshUsers(true);
    else if (action === 'delete') openDeleteDialog(selectedIds());
    else if (action === 'clear') {
      state.selected.clear();
      render();
    }
  }

  function handleColumnChange(event) {
    const checkbox = event.target.closest('[data-column-visible]');
    if (!checkbox) return;
    const key = checkbox.getAttribute('data-column-visible');
    if (checkbox.checked) visibleKeys.add(key);
    else visibleKeys.delete(key);
    visibleKeys.add('user');
    writeStorage(VISIBLE_KEY, Array.from(visibleKeys));
    render();
    elements.columnMenu.open = true;
  }

  function handleColumnClick(event) {
    const button = event.target.closest('[data-column-move]');
    if (!button) return;
    event.stopPropagation();
    const row = button.closest('[data-column]');
    const key = row && row.getAttribute('data-column');
    const index = columnOrder.indexOf(key);
    const targetIndex = button.getAttribute('data-column-move') === 'up' ? index - 1 : index + 1;
    if (key === 'user' || index < 0 || targetIndex < 1 || targetIndex >= columnOrder.length) return;
    const next = columnOrder.slice();
    const swap = next[targetIndex];
    next[targetIndex] = key;
    next[index] = swap;
    columnOrder = next;
    writeStorage(ORDER_KEY, columnOrder);
    render();
    elements.columnMenu.open = true;
  }

  function handlePaginationClick(event) {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    const pageCount = Math.max(1, Math.ceil(filteredUsers().length / state.pageSize));
    if (button.getAttribute('data-page') === 'prev') state.page = Math.max(1, state.page - 1);
    else state.page = Math.min(pageCount, state.page + 1);
    render();
    elements.tableScroll.scrollLeft = 0;
  }

  function cacheElements() {
    elements.totalCount = root.document.getElementById('userTotalCount');
    elements.viewTabs = root.document.getElementById('userViewTabs');
    elements.searchInput = root.document.getElementById('userSearchInput');
    elements.accountFilter = root.document.getElementById('userAccountFilter');
    elements.marketingFilter = root.document.getElementById('userMarketingFilter');
    elements.sourceFilter = root.document.getElementById('userSourceFilter');
    elements.providerFilter = root.document.getElementById('userProviderFilter');
    elements.storeFilter = root.document.getElementById('userStoreFilter');
    elements.createdFrom = root.document.getElementById('userCreatedFrom');
    elements.createdTo = root.document.getElementById('userCreatedTo');
    elements.bulkBar = root.document.getElementById('userBulkBar');
    elements.tableCard = root.document.getElementById('userTableCard');
    elements.tableScroll = root.document.getElementById('userTableScroll');
    elements.tableHead = root.document.getElementById('userTableHead');
    elements.tableBody = root.document.getElementById('userTableBody');
    elements.tableState = root.document.getElementById('userTableState');
    elements.resultSummary = root.document.getElementById('userResultSummary');
    elements.pagination = root.document.getElementById('userPagination');
    elements.columnMenu = root.document.getElementById('userColumnMenu');
    elements.columnPanel = root.document.getElementById('userColumnPanel');
    elements.importMenu = root.document.getElementById('userImportMenu');
    elements.toastRegion = root.document.getElementById('userToastRegion');
  }

  function bindEvents() {
    root.document.getElementById('userListHeader').addEventListener('click', handleHeaderClick);
    elements.viewTabs.addEventListener('click', function (event) {
      const tab = event.target.closest('[data-view]');
      if (!tab) return;
      state.view = tab.getAttribute('data-view');
      state.page = 1;
      render();
    });
    elements.searchInput.addEventListener('input', function () {
      state.search = elements.searchInput.value.trim();
      state.page = 1;
      render();
    });
    elements.createdFrom.addEventListener('change', function () {
      state.filters.createdFrom = elements.createdFrom.value;
      state.page = 1;
      render();
    });
    elements.createdTo.addEventListener('change', function () {
      state.filters.createdTo = elements.createdTo.value;
      state.page = 1;
      render();
    });
    root.document.getElementById('userClearFilters').addEventListener('click', clearFilters);
    root.document.getElementById('userRefreshButton').addEventListener('click', function () {
      refreshUsers(true);
    });
    elements.tableCard.addEventListener('click', handleTableClick);
    elements.tableCard.addEventListener('change', handleTableChange);
    elements.bulkBar.addEventListener('click', handleBulkClick);
    elements.columnPanel.addEventListener('change', handleColumnChange);
    elements.columnPanel.addEventListener('click', handleColumnClick);
    elements.pagination.addEventListener('click', handlePaginationClick);
    elements.tableState.addEventListener('click', function (event) {
      const action = event.target.closest('[data-state-action]');
      if (!action) return;
      if (action.getAttribute('data-state-action') === 'retry') refreshUsers(false);
      else if (action.getAttribute('data-state-action') === 'add') navigateToAdd();
      else clearFilters();
    });
    root.document.addEventListener('click', function (event) {
      Array.prototype.forEach.call(root.document.querySelectorAll('details.um-menu[open]'), function (menu) {
        if (!menu.contains(event.target)) menu.open = false;
      });
    });
  }

  function exposeHooks() {
    window.UserPageHooks = {
      getUsers: () => root.UserStore.list(),
      getSelectedIds: () => Array.from(state.selected),
      importUsers: (records, source) => root.UserStore.importProfiles(records, source),
      updateMarketing: (ids, status, consent) => root.UserStore.setMarketingStatus(ids, status, consent),
      removeUsers: (ids) => {
        const results = ids.map((id) => root.UserStore.remove(id));
        return { ok: results.every((item) => item.ok), results };
      },
      onDialogComplete: () => {
        state.selected.clear();
        allUsers = root.UserStore.list();
        setupFilterControls(true);
        render();
      }
    };
  }

  function initialize() {
    cacheElements();
    bindEvents();
    exposeHooks();
    state.status = 'loading';
    render();
    refreshUsers(false);
  }

  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window);
