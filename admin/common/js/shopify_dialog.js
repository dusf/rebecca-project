// ==================== Shopify 授权对话框管理器（父页面级） ====================
// 此脚本由 admin/index.html 加载，将对话框 HTML 注入父页面 #dialogHost 中，
// 确保遮罩覆盖整个浏览器视口（含侧边栏和顶栏），与平台管理的对话框架构一致。
//
// 子页面使用方式：
//   1. 在子页面设置 window.ShopifyAuthHooks = { stores, getItems, onSync, ... }
//   2. 调用 window.parent.ShopifyAuth.open() 打开对话框
//   3. 父页面通过 iframe.contentWindow.ShopifyAuthHooks 读取数据和回调

(function() {
  'use strict';

  var DLG_LOADED = false;
  var _state = {
    fw: null,            // 当前 iframe 的 contentWindow
    stores: [],          // 站点列表
    selectedSiteId: null,
    selectedItems: {},   // { itemId: true }
    step: 0              // 0=未打开, 1=授权, 2=站点选择, 3=条目选择
  };

  // 获取当前活跃 iframe 的 contentWindow
  function getFW() {
    var iframe = document.querySelector('.iframe-container iframe.active') || document.getElementById('contentFrame');
    return iframe && iframe.contentWindow;
  }

  // 获取子页面的 hooks
  function getHooks() {
    var fw = _state.fw || getFW();
    return fw && fw.ShopifyAuthHooks;
  }

  // ==================== 对话框 HTML 加载 ====================
  function ensureDialogs(callback) {
    if (DLG_LOADED) { callback(); return; }
    fetch('common/html/shopify_dialogs.html')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var host = document.getElementById('dialogHost');
        if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
        var div = document.createElement('div');
        div.innerHTML = html;
        // 将子节点逐个追加到 host（避免包裹 div）
        while (div.firstChild) {
          host.appendChild(div.firstChild);
        }
        DLG_LOADED = true;
        callback();
      })
      .catch(function(err) {
        console.error('Shopify 对话框加载失败:', err);
      });
  }

  // ==================== 步骤指示器更新 ====================
  // 每个步骤的对话框自带静态步骤指示器，无需 JS 动态切换。
  // 只需在打开对话框时动态设置步骤3标签（产品端:"同步产品"/系列端:"同步系列"）。

  function updateSteps(currentStep) {
    // 步骤指示器在各对话框 HTML 中已静态写好，此函数仅用于兼容性保留。
    // 三个对话框各自独立，切换时只需关闭旧的、打开新的即可。
  }

  function setStep3Label(label) {
    var els = document.querySelectorAll('[id^="step3Label"]');
    for (var i = 0; i < els.length; i++) {
      if (label) els[i].textContent = label;
    }
  }

  // ==================== 渲染站点列表 ====================
  function renderSiteList() {
    var list = document.getElementById('shopifySiteList');
    if (!list) return;
    var stores = _state.stores;
    list.innerHTML = stores.map(function(store) {
      var sel = _state.selectedSiteId === store.id ? ' selected' : '';
      return '<div class="sync-site-row-v3' + sel + '" data-site-id="' + store.id +
        '" onclick="ShopifyAuth.selectSite(\'' + store.id + '\')">' +
        '<div class="sync-site-info-v3">' +
          '<div class="sync-site-name-v3">' + store.name +
            '<span class="sync-site-badge">' + store.productCount + '件产品</span></div>' +
          '<div class="sync-site-domain-v3">' + store.domain + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function selectSiteImpl(siteId) {
    _state.selectedSiteId = siteId;
    _state.selectedItems = {};
    var btn = document.getElementById('shopifySiteNextBtn');
    if (btn) btn.disabled = false;
    renderSiteList();
  }

  // ==================== 渲染条目列表 ====================
  function renderItemList() {
    var list = document.getElementById('shopifyItemList');
    if (!list) return;

    var hooks = getHooks();
    if (!hooks) return;

    var items = hooks.getItems ? hooks.getItems(_state.selectedSiteId) : [];
    var isProduct = hooks.step3Label === '同步产品';

    var html = '<div class="sync-series-children">';
    items.forEach(function(item) {
      var sel = _state.selectedItems[item.id] ? ' selected' : '';
      html += '<div class="sync-series-child' + sel + '" onclick="ShopifyAuth.toggleItem(\'' + item.id + '\')">';
      html += '<div class="sync-series-child-check">' + (sel ? '&#10003;' : '') + '</div>';
      html += '<span style="flex:1">' + item.title + '</span>';
      if (isProduct) {
        // 产品：显示分类、价格、库存
        html += '<span style="font-size:11px;color:hsl(var(--muted-foreground));margin-right:12px;">' + (item.category || '') + '</span>';
        html += '<span style="font-weight:500;font-size:13px;margin-right:12px;">&yen;' + (item.price || 0) + '</span>';
        html += '<span style="font-size:11px;color:hsl(var(--muted-foreground))">' + (item.stock || '') + '</span>';
      } else {
        // 系列：显示件数
        html += '<span style="font-size:11px;color:hsl(var(--muted-foreground))">' + (item.productCount || 0) + '件</span>';
      }
      html += '</div>';
    });
    html += '</div>';
    list.innerHTML = html;
    updateSelectAllCb();
    updateItemBar();
  }

  function toggleItemImpl(itemId) {
    if (_state.selectedItems[itemId]) {
      delete _state.selectedItems[itemId];
    } else {
      _state.selectedItems[itemId] = true;
    }
    renderItemList();
  }

  function toggleSelectAllImpl() {
    var hooks = getHooks();
    if (!hooks) return;
    var items = hooks.getItems ? hooks.getItems(_state.selectedSiteId) : [];
    var allSelected = items.length > 0 && items.every(function(it) { return _state.selectedItems[it.id]; });

    if (allSelected) {
      items.forEach(function(it) { delete _state.selectedItems[it.id]; });
    } else {
      items.forEach(function(it) { _state.selectedItems[it.id] = true; });
    }
    renderItemList();
  }

  function updateSelectAllCb() {
    var hooks = getHooks();
    if (!hooks) return;
    var items = hooks.getItems ? hooks.getItems(_state.selectedSiteId) : [];
    var allSel = items.length > 0 && items.every(function(it) { return _state.selectedItems[it.id]; });
    var cb = document.getElementById('shopifySelectAllCb');
    if (cb) {
      cb.classList.toggle('checked', allSel);
      cb.innerHTML = allSel ? '&#10003;' : '';
    }
  }

  function updateItemBar() {
    var cnt = Object.keys(_state.selectedItems).filter(function(k) { return _state.selectedItems[k]; }).length;
    var countEl = document.getElementById('shopifySelectedCount');
    var syncBtn = document.getElementById('shopifySyncBtn');
    if (countEl) countEl.textContent = '已选 ' + cnt + ' 个';
    if (syncBtn) syncBtn.disabled = cnt === 0;
  }

  // ==================== 公开 API ====================
  window.ShopifyAuth = {

    // 打开对话框
    open: function() {
      _state.fw = getFW();
      var hooks = getHooks();
      if (!hooks) return;

      _state.stores = hooks.stores || [];
      _state.selectedSiteId = null;
      _state.selectedItems = {};
      _state.step = 1;

      ensureDialogs(function() {
        // 自定义步骤3标签
        setStep3Label(hooks.step3Label || '同步产品');

        // 自定义描述文字
        var descEl = document.getElementById('shopifyAuthDesc');
        if (descEl && hooks.step1Desc) {
          descEl.innerHTML = hooks.step1Desc;
        }

        // 自定义步骤3标题
        var titleEl = document.getElementById('shopifyItemTitle');
        if (titleEl && hooks.step3Title) {
          titleEl.textContent = hooks.step3Title;
        }

        // 自定义同步按钮文字
        var syncBtn = document.getElementById('shopifySyncBtn');
        if (syncBtn && hooks.syncBtnLabel) {
          syncBtn.textContent = hooks.syncBtnLabel;
        }

        // 重置表单
        var domainInput = document.getElementById('shopifyStoreDomain');
        if (domainInput) domainInput.value = '';

        // 显示步骤一
        updateSteps(1);
        var authOv = document.getElementById('shopifyAuthOverlay');
        if (authOv) authOv.style.display = 'flex';
      });
    },

    // 关闭所有对话框
    close: function() {
      _state.step = 0;
      var overlays = ['shopifyAuthOverlay', 'shopifySiteOverlay', 'shopifyItemOverlay'];
      overlays.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
    },

    // 步骤一：确认授权
    confirmAuth: function() {
      var domain = document.getElementById('shopifyStoreDomain');
      if (!domain) return;
      var val = domain.value.trim();
      if (!val) {
        // 调用子页面的 toast（如果有）
        var fw = _state.fw;
        if (fw && fw.showToast) fw.showToast('error', '请输入 Shopify 店铺域名');
        return;
      }

      var hooks = getHooks();
      if (hooks && hooks.setStoreDomain) hooks.setStoreDomain(val);

      // 隐藏步骤一，显示步骤二
      document.getElementById('shopifyAuthOverlay').style.display = 'none';
      _state.step = 2;
      _state.selectedSiteId = null;
      updateSteps(2);
      renderSiteList();
      var siteBtn = document.getElementById('shopifySiteNextBtn');
      if (siteBtn) siteBtn.disabled = true;
      document.getElementById('shopifySiteOverlay').style.display = 'flex';
    },

    // 步骤二：选择站点
    selectSite: function(siteId) {
      selectSiteImpl(siteId);
    },

    // 步骤二→三：进入条目选择
    goToStep3: function() {
      if (!_state.selectedSiteId) return;

      var hooks = getHooks();
      if (!hooks) return;

      var stores = _state.stores;
      var site = null;
      for (var i = 0; i < stores.length; i++) {
        if (stores[i].id === _state.selectedSiteId) { site = stores[i]; break; }
      }
      if (!site) return;

      // 设置站点名称
      var nameEl = document.getElementById('shopifySelectedSiteName');
      if (nameEl) nameEl.textContent = site.name;

      // 隐藏步骤二，显示步骤三
      document.getElementById('shopifySiteOverlay').style.display = 'none';
      _state.step = 3;
      updateSteps(3);
      renderItemList();
      updateItemBar();
      document.getElementById('shopifyItemOverlay').style.display = 'flex';
    },

    // 步骤三：条目切换
    toggleItem: function(itemId) {
      toggleItemImpl(itemId);
    },

    // 步骤三：全选/取消全选
    toggleSelectAll: function() {
      toggleSelectAllImpl();
    },

    // 步骤三：确认同步
    confirmSync: function() {
      var selectedIds = Object.keys(_state.selectedItems).filter(function(k) { return _state.selectedItems[k]; });
      if (selectedIds.length === 0) return;

      var hooks = getHooks();
      if (hooks && hooks.onSync) {
        hooks.onSync(selectedIds, _state.selectedSiteId);
      }
      // 关闭对话框（onSync 中可能已关闭，这里做兜底）
      this.close();
    },

    // 获取当前状态（供调试）
    getState: function() {
      return _state;
    }
  };

  // Escape 关闭
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (_state.step > 0) {
      window.ShopifyAuth.close();
    }
  });

})();
