// ==================== 公共脚本 ====================
// 此文件包含产品数据、Toast、侧边栏导航等所有页面共享的逻辑


    // ==================== Toast 通知 ====================
    function showToast(type, message) {
      const container = document.getElementById('toastContainer');
      const icons = { success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' };
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // ==================== 侧边栏菜单数据 ====================
    const SIDEBAR_MENU = [
      {
        section: '数据',
        items: [
          { page: 'dashboard', label: '数据',
            icon: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5-4-3 5-5-3-2 5"/></svg>' }
        ]
      },
      {
        section: '资产',
        items: [
          { page: 'products', label: '产品',
            icon: '<svg viewBox="0 0 24 24"><path d="m21 7.5-9-5-9 5"/><path d="m21 7.5-9 5-9-5"/><path d="M21 7.5v9l-9 5-9-5v-9"/></svg>' },
          { page: 'social', label: '社媒',
            icon: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.5 10.5 15.5 6.5"/><path d="M8.5 13.5 15.5 17.5"/></svg>' },
          { page: 'influencers', label: '网红',
            icon: '<svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
          { page: 'orders', label: '订单',
            icon: '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' },
          { page: 'inventory', label: '库存',
            icon: '<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' }
        ]
      },
      {
        section: '店铺',
        items: [
          { page: 'categories', label: '分类',
            icon: '<svg viewBox="0 0 24 24"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>' },
          { page: 'attributes', label: '属性',
            icon: '<svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' },
          { page: 'series', label: '系列',
            icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' },
          { page: 'promotions', label: '折扣',
            icon: '<svg viewBox="0 0 24 24"><path d="M12 2H2v10l9.29 9.29c.94.94 2.45.94 3.38 0l6.63-6.63c.94-.94.94-2.45 0-3.38L12 2Z"/><path d="M7 7h.01"/></svg>' },
          { page: 'gifts', label: '赠品',
            icon: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 2.5 2.5v5"/><path d="M16.5 8v-2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1-2.5 2.5h-5"/></svg>' },

          { page: 'content', label: '内容',
            icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>' },
          { page: 'users', label: '用户',
            icon: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>' },
          { page: 'settings', label: '配置',
            icon: '<svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.64l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.64V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.64l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.64V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>' },
          { page: 'decor', label: '装修',
            icon: '<svg viewBox="0 0 24 24"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.707.707a.5.5 0 0 0 .707 0l4.021-4.02a1 1 0 0 1 3.002 3.001l-4.02 4.021a2.5 2.5 0 0 1-3.535 0l-.707-.707a2.5 2.5 0 0 1 0-3.535z"/><path d="M8.79 17.897a1.5 1.5 0 0 0 2.208 1.193l-2.208-1.193Z"/></svg>' }
        ]
      },

    ];

    // ==================== 店铺数据（全局共享） ====================
    const SHOP_COLORS = ['#D4845A', '#8B9A7C', '#7C8B9A', '#B4846C', '#9A8B7C', '#6C8B84', '#C4957A', '#8B7C9A'];

    function loadShops() {
      try {
        const saved = localStorage.getItem('rebecca_shops');
        if (saved) return JSON.parse(saved);
      } catch (e) { /* ignore */ }
      return [
        { id: 'shop_qvr', name: 'QVR品牌站', slug: 'qvr', description: '专注于时尚服饰品牌', logo: '', domain: 'qvr.rebeccashop.com', customDomain: '', domainStatus: 'active', status: 'active', color: '#D4845A', createdAt: '2026-06-15', productCount: 128, languages: ['中文简体', 'English'], defaultLanguage: '中文简体' },
        { id: 'shop_fashion', name: 'Fashion Plus', slug: 'fashion', description: '欧美潮流女装精选', logo: '', domain: 'fashion.rebeccashop.com', customDomain: '', domainStatus: 'active', status: 'active', color: '#8B9A7C', createdAt: '2026-06-20', productCount: 56, languages: ['English', 'Français'], defaultLanguage: 'English' },
        { id: 'shop_tokyo', name: 'Tokyo Select', slug: 'tokyo', description: '日本精选好物', logo: '', domain: 'tokyo.rebeccashop.com', customDomain: '', domainStatus: 'disabled', status: 'disabled', color: '#7C8B9A', createdAt: '2026-07-01', productCount: 0, languages: ['日本語', 'English'], defaultLanguage: '日本語' }
      ];
    }

    function saveShops(shops) {
      localStorage.setItem('rebecca_shops', JSON.stringify(shops));
    }

    function getCurrentShopId() {
      const shopId = localStorage.getItem('rebecca_current_shop');
      const shops = loadShops();
      if (shopId && shops.some(s => s.id === shopId)) return shopId;
      if (shops.length > 0) {
        const active = shops.find(s => s.status === 'active');
        return active ? active.id : shops[0].id;
      }
      return null;
    }

    function setCurrentShopId(id) {
      localStorage.setItem('rebecca_current_shop', id);
    }

    function getCurrentShop() {
      const shops = loadShops();
      const id = getCurrentShopId();
      return shops.find(s => s.id === id) || shops[0] || null;
    }

    function generateShopSlug(name) {
      return name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') || 'store';
    }

    // ==================== 多语言映射与工具 ====================
    var LANG_DISPLAY_TO_LOCALE = {
      '中文简体': { key: 'zh_CN', label: '中文(简体)', flag: '🇨🇳' },
      '中文繁體': { key: 'zh_TW', label: '中文(繁體)', flag: '🇭🇰' },
      'English':   { key: 'en_US', label: 'English',   flag: '🇺🇸' },
      '日本語':    { key: 'ja_JP', label: '日本語',    flag: '🇯🇵' },
      '한국어':    { key: 'ko_KR', label: '한국어',    flag: '🇰🇷' },
      'Français':  { key: 'fr_FR', label: 'Français',  flag: '🇫🇷' },
      'Deutsch':   { key: 'de_DE', label: 'Deutsch',   flag: '🇩🇪' },
      'Español':   { key: 'es_ES', label: 'Español',   flag: '🇪🇸' },
      'Italiano':  { key: 'it_IT', label: 'Italiano',  flag: '🇮🇹' },
      'Português': { key: 'pt_PT', label: 'Português', flag: '🇵🇹' },
      'Svenska':   { key: 'sv_SE', label: 'Svenska',   flag: '🇸🇪' },
      'العربية':  { key: 'ar_SA', label: 'العربية',   flag: '🇸🇦' },
    };

    function getShopSupportedLocales() {
      var shop = getCurrentShop();
      if (!shop || !shop.languages || !shop.languages.length) {
        return [
          { key: 'zh_CN', label: '中文', flag: '🇨🇳' },
          { key: 'en_US', label: 'English', flag: '🇺🇸' },
        ];
      }
      return shop.languages.map(function(lang) {
        var info = LANG_DISPLAY_TO_LOCALE[lang];
        if (info) return { key: info.key, label: info.label, flag: info.flag };
        return { key: lang.toLowerCase().replace(/\s+/g, '_'), label: lang, flag: '' };
      });
    }

    function getShopLocaleMap() {
      var locales = getShopSupportedLocales();
      var map = {};
      locales.forEach(function(loc) {
        map[loc.key] = (loc.flag ? loc.flag + ' ' : '') + loc.label;
      });
      return map;
    }

    function getShopDefaultLocale() {
      var shop = getCurrentShop();
      if (shop && shop.defaultLanguage) {
        var info = LANG_DISPLAY_TO_LOCALE[shop.defaultLanguage];
        if (info) return info.key;
      }
      var locales = getShopSupportedLocales();
      return locales.length > 0 ? locales[0].key : 'zh_CN';
    }

    function getShopLocaleLabel(localeKey) {
      var locales = getShopSupportedLocales();
      for (var i = 0; i < locales.length; i++) {
        if (locales[i].key === localeKey) {
          return (locales[i].flag ? locales[i].flag + ' ' : '') + locales[i].label;
        }
      }
      return localeKey;
    }

    // ==================== 路由映射 ====================
    const PAGE_ROUTES = {
      'products':      'product/product_list.html',
      'add-product':   'product/add_product.html',
      'categories':    'category/category_list.html',
      'attributes':    'attribute/attribute_list.html',
      'settings':      'shop/shop_settings.html',
      'content':         'content/page_list.html',
      'content-pages':     'content/page_list.html',
      'content-articles':  'content/article_list.html',
      'content-faq':       'content/faq_list.html',
      'content-page-edit': 'content/page_edit.html',
      'content-article-edit': 'content/article_edit.html',
      'content-faq-edit':  'content/faq_edit.html',
    };

    // ==================== iframe 兼容的页面跳转 ====================
function navigateToPage(url) {
    if (window.self !== window.top && window.parent.changeIframeSrc) {
        // 直接传递相对 URL，不做 a.href 解析，避免 iframe 内相对路径被重复拼接
        window.parent.changeIframeSrc(url);
    } else {
        window.location.href = url;
    }
}

    // ==================== 侧边栏渲染 ====================
    function renderSidebar(activePage) {
      const container = document.getElementById('sidebarContainer');
      if (!container) return;

      const currentShop = getCurrentShop();
      const shopName = currentShop ? currentShop.name : '暂无店铺';
      const shopDomain = currentShop ? currentShop.domain : '';
      const shopLetter = currentShop ? currentShop.name.charAt(0) : '店';
      const shopColor = currentShop ? currentShop.color : '#D4845A';

      let html = `
      <div class="sidebar-shop-selector" id="shopSelectorToggle">
        <div class="sidebar-shop-avatar" style="background:${shopColor};">${shopLetter}</div>
        <div class="sidebar-shop-info">
          <div class="sidebar-shop-name">${shopName}</div>
          <div class="sidebar-shop-domain">${shopDomain}</div>
        </div>
        <svg class="sidebar-shop-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <nav class="sidebar-nav">`;

      SIDEBAR_MENU.forEach(group => {
        html += `<div class="sidebar-section-title">${group.section}</div>`;
        group.items.forEach(item => {
          const activeClass = item.page === activePage ? ' active' : '';
          html += `
        <div class="sidebar-item${activeClass}" data-page="${item.page}">
          <span class="sidebar-item-icon">${item.icon}</span>
          ${item.label}
        </div>`;
        });
      });

      html += `
      </nav>
      <div class="sidebar-profile">
        <div class="sidebar-profile-avatar">管</div>
        <div class="sidebar-profile-info">
          <div class="sidebar-profile-name">管理员</div>
          <div class="sidebar-profile-role">超级管理员</div>
        </div>
        <div class="sidebar-profile-bell">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <div class="sidebar-profile-bell-dot"></div>
        </div>
      </div>`;

      container.innerHTML = html;
    }

    // ==================== 侧边栏导航（事件委托） ====================
    document.addEventListener('DOMContentLoaded', function() {
      const sidebar = document.getElementById('sidebarContainer');
      if (!sidebar) return;

      sidebar.addEventListener('click', function(e) {
        // 店铺选择器点击
        const shopToggle = e.target.closest('#shopSelectorToggle');
        if (shopToggle) {
          e.stopPropagation();
          toggleShopDropdown(shopToggle);
          return;
        }

        // 通知铃铛点击
        const bell = e.target.closest('.sidebar-profile-bell');
        if (bell) {
          e.stopPropagation();
          showToast('info', '您有 3 条未读通知');
          return;
        }

        const item = e.target.closest('.sidebar-item');
        if (!item) return;
        const page = item.dataset.page;
        if (!page) return;

        // SPA Shell 模式：当前页面自己是 shell（如 index.html），切换 iframe
        if (typeof window.handleSidebarNav === 'function' && window.self === window.top) {
          window.handleSidebarNav(page);
          return;
        }

        // SPA 模式：iframe 内页面，通知父窗口
        if (window.self !== window.top && window.parent && window.parent.handleSidebarNav) {
          window.parent.handleSidebarNav(page);
          return;
        }

        // 已开发的页面：跨页面跳转
        if (PAGE_ROUTES[page]) {
          window.location.href = PAGE_ROUTES[page];
          return;
        }

        // 未开发的页面：显示 toast 提示
        showToast('info', `${item.textContent.trim()} 页面开发中...`);
      });

      // 自动渲染侧边栏
      if (typeof CURRENT_PAGE !== 'undefined') {
        renderSidebar(CURRENT_PAGE);
      }

      // iframe 嵌入模式：渲染后隐藏侧边栏
      if (window.self !== window.top) {
        var sidebarEl = document.getElementById('sidebarContainer');
        if (sidebarEl) sidebarEl.style.display = 'none';
      }
    });

    // ==================== 店铺下拉面板 ====================
    function toggleShopDropdown(toggleEl) {
      const existing = document.getElementById('shopDropdown');
      if (existing) {
        existing.remove();
        toggleEl.classList.remove('open');
        return;
      }

      const shops = loadShops();
      const currentId = getCurrentShopId();
      const rect = toggleEl.getBoundingClientRect();

      const dropdown = document.createElement('div');
      dropdown.id = 'shopDropdown';
      dropdown.className = 'shop-dropdown show';
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.left = rect.left + 'px';

      let shopListHtml = shops.map(shop => {
        const isActive = shop.id === currentId;
        return `<div class="shop-dropdown-item" data-shop-id="${shop.id}">
          <div class="shop-dropdown-item-avatar" style="background:${shop.color};">${shop.name.charAt(0)}</div>
          <div class="shop-dropdown-item-info">
            <div class="shop-dropdown-item-name">${shop.name}</div>
            <div class="shop-dropdown-item-domain">${shop.domain}</div>
          </div>
          ${isActive ? '<div class="shop-dropdown-item-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' : ''}
        </div>`;
      }).join('');

      dropdown.innerHTML = `
        <div class="shop-dropdown-header">切换店铺</div>
        <div class="shop-dropdown-list">${shopListHtml}</div>
        <div class="shop-dropdown-divider"></div>
        <div class="shop-dropdown-action" id="shopDropdownCreate">
          <div class="shop-dropdown-action-icon create"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <span>创建店铺</span>
        </div>
        <div class="shop-dropdown-divider"></div>
        <div class="shop-dropdown-action" id="shopDropdownSettings">
          <div class="shop-dropdown-action-icon config"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.64l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15-.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.64V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.64l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.64V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></div>
          <span>店铺管理</span>
        </div>
        <div class="shop-dropdown-action" id="shopDropdownMembers">
          <div class="shop-dropdown-action-icon members"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <span>成员管理</span>
        </div>
        <div class="shop-dropdown-action" id="shopDropdownOrders">
          <div class="shop-dropdown-action-icon orders"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
          <span>订单管理</span>
        </div>
      `;

      document.body.appendChild(dropdown);
      toggleEl.classList.add('open');

      dropdown.querySelectorAll('.shop-dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
          const shopId = this.dataset.shopId;
          if (shopId && shopId !== currentId) switchShop(shopId);
          closeShopDropdown();
        });
      });

      dropdown.querySelector('#shopDropdownCreate').addEventListener('click', function() {
        closeShopDropdown();
        openCreateShopDialog();
      });

      dropdown.querySelector('#shopDropdownSettings').addEventListener('click', function() {
        closeShopDropdown();
        if (window.self !== window.top && window.parent && window.parent.handleSidebarNav) {
          window.parent.handleSidebarNav('shop-list');
        } else if (typeof window.handleSidebarNav === 'function') {
          window.handleSidebarNav('shop-list');
        } else {
          navigateToPage('shop/shop_list.html');
        }
      });

      dropdown.querySelector('#shopDropdownMembers').addEventListener('click', function() {
        closeShopDropdown();
        if (window.self !== window.top && window.parent && window.parent.handleSidebarNav) {
          window.parent.handleSidebarNav('members');
        } else if (typeof window.handleSidebarNav === 'function') {
          window.handleSidebarNav('members');
        } else {
          navigateToPage('member/members.html');
        }
      });

      dropdown.querySelector('#shopDropdownOrders').addEventListener('click', function() {
        closeShopDropdown();
        if (window.self !== window.top && window.parent && window.parent.handleSidebarNav) {
          window.parent.handleSidebarNav('orders');
        } else if (typeof window.handleSidebarNav === 'function') {
          window.handleSidebarNav('orders');
        } else {
          navigateToPage('product/product_list.html');
        }
      });

      setTimeout(() => {
        document.addEventListener('click', closeShopDropdownOnOutside);
      }, 0);
    }

    function closeShopDropdownOnOutside(e) {
      const dropdown = document.getElementById('shopDropdown');
      const toggle = document.getElementById('shopSelectorToggle');
      if (dropdown && !dropdown.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
        closeShopDropdown();
      }
    }

    function closeShopDropdown() {
      const dropdown = document.getElementById('shopDropdown');
      if (dropdown) dropdown.remove();
      const toggle = document.getElementById('shopSelectorToggle');
      if (toggle) toggle.classList.remove('open');
      document.removeEventListener('click', closeShopDropdownOnOutside);
    }

    function switchShop(shopId) {
      const shops = loadShops();
      const shop = shops.find(s => s.id === shopId);
      if (!shop) return;
      if (shop.status !== 'active') {
        showToast('info', '店铺"' + shop.name + '"已停用，请先启用');
        return;
      }
      setCurrentShopId(shopId);
      showToast('success', '已切换到"' + shop.name + '"');
      if (typeof CURRENT_PAGE !== 'undefined') renderSidebar(CURRENT_PAGE);
      setTimeout(() => location.reload(), 500);
    }

    // ==================== 创建店铺弹窗 ====================
    function openCreateShopDialog() {
      const overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.id = 'createShopOverlay';
      overlay.innerHTML = `
        <div class="dialog" style="width:480px;">
          <div class="dialog-header"><div class="dialog-title">创建新店铺</div><button class="dialog-close" onclick="this.closest('.dialog-overlay').remove()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <div class="dialog-desc">填写店铺基本信息，创建属于你的独立站</div>
          <div class="dialog-body">
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:13px;font-weight:600;color:hsl(var(--foreground));margin-bottom:6px;">店铺名称 <span style="color:hsl(var(--error));">*</span></label>
              <input id="createShopName" class="search-input" style="width:100%;" placeholder="例如：My Brand Store" maxlength="50" />
              <div id="createShopNameError" style="display:none;font-size:12px;color:hsl(var(--error));margin-top:4px;">请输入店铺名称</div>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:13px;font-weight:600;color:hsl(var(--foreground));margin-bottom:6px;">店铺描述</label>
              <textarea id="createShopDesc" class="search-input" style="width:100%;height:80px;resize:none;padding-top:10px;" placeholder="简单描述店铺定位（选填）" maxlength="200"></textarea>
              <div style="font-size:12px;color:hsl(var(--muted-foreground));margin-top:4px;"><span id="createShopDescCount">0</span>/200</div>
            </div>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" id="createShopCancel">取消</button>
            <button class="btn btn-primary" id="createShopConfirm">创建店铺</button>
          </div>
        </div>
      `;

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);

      const nameInput = document.getElementById('createShopName');
      const descInput = document.getElementById('createShopDesc');
      const errorEl = document.getElementById('createShopNameError');
      const descCount = document.getElementById('createShopDescCount');
      const confirmBtn = document.getElementById('createShopConfirm');

      nameInput.focus();

      descInput.addEventListener('input', function() {
        descCount.textContent = this.value.length;
      });

      document.getElementById('createShopCancel').addEventListener('click', function() {
        overlay.remove();
      });

      confirmBtn.addEventListener('click', function() {
        const name = nameInput.value.trim();
        if (!name) {
          errorEl.style.display = 'block';
          nameInput.style.borderColor = 'hsl(var(--error))';
          return;
        }
        errorEl.style.display = 'none';
        nameInput.style.borderColor = '';

        const shops = loadShops();
        if (shops.some(function(s) { return s.name === name; })) {
          errorEl.textContent = '该店铺名称已被使用';
          errorEl.style.display = 'block';
          nameInput.style.borderColor = 'hsl(var(--error))';
          return;
        }

        const desc = descInput.value.trim();
        const slug = generateShopSlug(name);
        const randomColor = SHOP_COLORS[Math.floor(Math.random() * SHOP_COLORS.length)];
        const today = new Date().toISOString().split('T')[0];

        const newShop = {
          id: 'shop_' + Date.now(),
          name: name,
          slug: slug,
          description: desc,
          logo: '',
          domain: slug + '.rebeccashop.com',
          customDomain: '',
          domainStatus: 'active',
          status: 'active',
          color: randomColor,
          createdAt: today,
          productCount: 0
        };

        shops.push(newShop);
        saveShops(shops);
        setCurrentShopId(newShop.id);
        overlay.remove();
        showToast('success', '店铺"' + name + '"创建成功！');

        setTimeout(function() {
          const guideOverlay = document.createElement('div');
          guideOverlay.className = 'dialog-overlay';
          guideOverlay.id = 'guideOverlay';
          guideOverlay.innerHTML = `
            <div class="dialog" style="width:420px;text-align:center;">
              <div class="dialog-header"><div class="dialog-title">店铺创建成功！</div><button class="dialog-close" onclick="this.closest('.dialog-overlay').remove()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
              <div style="width:64px;height:64px;border-radius:50%;background:hsl(142 50% 92%);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="dialog-desc">预览域名：<strong style="color:hsl(var(--primary))">${slug}.rebeccashop.com</strong></div>
              <div class="dialog-actions" style="justify-content:center;">
                <button class="btn btn-secondary" id="guideSkip">暂不配置</button>
                <button class="btn btn-primary" id="guideGoSettings">前往配置</button>
              </div>
            </div>
          `;
          guideOverlay.addEventListener('click', function(e) {
            if (e.target === guideOverlay) guideOverlay.remove();
          });
          document.body.appendChild(guideOverlay);

          document.getElementById('guideSkip').addEventListener('click', function() {
            guideOverlay.remove();
            location.reload();
          });
          document.getElementById('guideGoSettings').addEventListener('click', function() {
            guideOverlay.remove();
            navigateToPage('shop/shop_settings.html');
          });
        }, 300);
      });

      overlay.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') overlay.remove();
      });
    }

    // ==================== 产品分类数据（全局共享） ====================
    var categories = [
      { id: 1, nameEn: "Women's Full Wigs", nameZh: '女士全头套', nameEs: 'Pelucas Completas', sortOrder: 1, productCount: 86, status: 'active', isPreset: true, createdAt: '2026-03-15', updatedAt: '2026-07-18' },
      { id: 2, nameEn: 'Hair Extensions', nameZh: '女士接发', nameEs: 'Extensiones de Cabello', sortOrder: 2, productCount: 42, status: 'active', isPreset: true, createdAt: '2026-03-15', updatedAt: '2026-07-18' },
      { id: 3, nameEn: 'Hair Accessories', nameZh: '发饰配件', nameEs: 'Accesorios para el Cabello', sortOrder: 3, productCount: 28, status: 'active', isPreset: false, createdAt: '2026-04-22', updatedAt: '2026-07-10' },
      { id: 4, nameEn: 'Care Products', nameZh: '护理产品', nameEs: 'Productos de Cuidado', sortOrder: 4, productCount: 15, status: 'active', isPreset: false, createdAt: '2026-05-08', updatedAt: '2026-07-12' },
      { id: 5, nameEn: 'Custom Wigs', nameZh: '定制假发', nameEs: 'Pelucas Personalizadas', sortOrder: 5, productCount: 0, status: 'disabled', isPreset: false, createdAt: '2026-06-01', updatedAt: '2026-06-15' }
    ];

    /** 根据分类 ID 获取该分类下的属性列表（按 sortOrder 排序） */
    function getAttributesByCategory(catId) {
      return (attributes || []).filter(function(a) { return a.categoryId === catId && a.status === 'active'; })
        .sort(function(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
    }

    // ==================== 属性数据（全局共享，与属性管理页数据一致） ====================
    var attributes = [
      // ===== 女士全头套 (categoryId: 1) =====
      { id: 1, categoryId: 1, nameEn: 'Hair Material', nameZh: '发丝材质', nameEs: 'Material del Cabello', inputType: 'single', isRequired: true, sortOrder: 1, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 1, labelEn: '100% Human Hair', labelZh: '全真发', labelEs: 'Cabello 100% Humano', sortOrder: 1, status: 'active' },
          { id: 2, labelEn: 'Human Hair Blend', labelZh: '人发混丝', labelEs: 'Mezcla de Cabello Humano', sortOrder: 2, status: 'active' },
          { id: 3, labelEn: 'Heat-Resistant Synthetic', labelZh: '高温化纤丝', labelEs: 'Fibra Sintética Resistente al Calor', sortOrder: 3, status: 'active' }
        ] },
      { id: 2, categoryId: 1, nameEn: 'Hair Length', nameZh: '发丝长度', nameEs: 'Longitud del Cabello', inputType: 'single', isRequired: true, sortOrder: 2, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 4, labelEn: '30cm', labelZh: '30cm', labelEs: '30cm', sortOrder: 1, status: 'active' },
          { id: 5, labelEn: '40cm', labelZh: '40cm', labelEs: '40cm', sortOrder: 2, status: 'active' },
          { id: 6, labelEn: '50cm', labelZh: '50cm', labelEs: '50cm', sortOrder: 3, status: 'active' },
          { id: 7, labelEn: '60cm', labelZh: '60cm', labelEs: '60cm', sortOrder: 4, status: 'active' },
          { id: 8, labelEn: '70cm', labelZh: '70cm', labelEs: '70cm', sortOrder: 5, status: 'active' }
        ] },
      { id: 3, categoryId: 1, nameEn: 'Hair Color', nameZh: '发色', nameEs: 'Color del Cabello', inputType: 'multiple', isRequired: true, sortOrder: 3, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 9, labelEn: 'Natural Black', labelZh: '自然黑', labelEs: 'Negro Natural', sortOrder: 1, status: 'active' },
          { id: 10, labelEn: 'Dark Tea', labelZh: '黑茶', labelEs: 'Té Oscuro', sortOrder: 2, status: 'active' },
          { id: 11, labelEn: 'Chestnut Brown', labelZh: '栗棕', labelEs: 'Castaño', sortOrder: 3, status: 'active' },
          { id: 12, labelEn: 'Ash Blonde', labelZh: '亚麻', labelEs: 'Rubio Ceniza', sortOrder: 4, status: 'active' },
          { id: 13, labelEn: 'Milk Tea', labelZh: '奶茶', labelEs: 'Té con Leche', sortOrder: 5, status: 'active' },
          { id: 14, labelEn: 'Highlight', labelZh: '挑染', labelEs: 'Reflejos', sortOrder: 6, status: 'active' },
          { id: 15, labelEn: 'Ombre/Gradient', labelZh: '渐变', labelEs: 'Degradado', sortOrder: 7, status: 'active' }
        ] },
      { id: 4, categoryId: 1, nameEn: 'Suitable Style', nameZh: '适用风格', nameEs: 'Estilo Adecuado', inputType: 'single', isRequired: true, sortOrder: 4, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 16, labelEn: 'Daily Commute', labelZh: '日常通勤', labelEs: 'Uso Diario', sortOrder: 1, status: 'active' },
          { id: 17, labelEn: 'Influencer Style', labelZh: '网红造型', labelEs: 'Estilo Influencer', sortOrder: 2, status: 'active' },
          { id: 18, labelEn: 'Traditional/Ancient', labelZh: '古风', labelEs: 'Estilo Antiguo', sortOrder: 3, status: 'active' },
          { id: 19, labelEn: 'Photoshoot/Stage', labelZh: '写真舞台', labelEs: 'Sesión de Fotos/Escenario', sortOrder: 4, status: 'active' }
        ] },
      { id: 5, categoryId: 1, nameEn: 'Target Audience', nameZh: '适用人群', nameEs: 'Público Objetivo', inputType: 'single', isRequired: true, sortOrder: 5, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 20, labelEn: 'Youth Styling', labelZh: '少女造型', labelEs: 'Estilo Juvenil', sortOrder: 1, status: 'active' },
          { id: 21, labelEn: 'Gray Hair Coverage', labelZh: '中青年遮白', labelEs: 'Cobertura de Canas', sortOrder: 2, status: 'active' },
          { id: 22, labelEn: 'Volume Enhancement', labelZh: '发量少增发', labelEs: 'Aumento de Volumen', sortOrder: 3, status: 'active' }
        ] },
      { id: 6, categoryId: 1, nameEn: 'Wig Style', nameZh: '发型款式', nameEs: 'Estilo de Peluca', inputType: 'single', isRequired: true, sortOrder: 6, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 23, labelEn: 'Short Bob', labelZh: '短发波波头', labelEs: 'Bob Corto', sortOrder: 1, status: 'active' },
          { id: 24, labelEn: 'Mid-Length Straight', labelZh: '中长直发', labelEs: 'Liso Medio', sortOrder: 2, status: 'active' },
          { id: 25, labelEn: 'Big Waves', labelZh: '大波浪', labelEs: 'Ondas Grandes', sortOrder: 3, status: 'active' },
          { id: 26, labelEn: 'Wool Curls', labelZh: '羊毛卷', labelEs: 'Rizos Lanosos', sortOrder: 4, status: 'active' }
        ] },
      { id: 7, categoryId: 1, nameEn: 'Bangs Style', nameZh: '刘海样式', nameEs: 'Estilo de Flequillo', inputType: 'single', isRequired: true, sortOrder: 7, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 27, labelEn: 'Wispy Bangs', labelZh: '空气刘海', labelEs: 'Flequillo Ligero', sortOrder: 1, status: 'active' },
          { id: 28, labelEn: 'Side-Swept Bangs', labelZh: '八字刘海', labelEs: 'Flequillo Lateral', sortOrder: 2, status: 'active' },
          { id: 29, labelEn: 'No Bangs', labelZh: '无刘海', labelEs: 'Sin Flequillo', sortOrder: 3, status: 'active' }
        ] },
      { id: 8, categoryId: 1, nameEn: 'Cap Construction', nameZh: '内网工艺', nameEs: 'Construcción de la Base', inputType: 'single', isRequired: true, sortOrder: 8, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 30, labelEn: 'Standard Machine Weft', labelZh: '普通机织', labelEs: 'Tejido a Máquina Estándar', sortOrder: 1, status: 'active' },
          { id: 31, labelEn: 'Breathable Ice Silk Mesh', labelZh: '透气冰丝网', labelEs: 'Malla de Seda Helada Transpirable', sortOrder: 2, status: 'active' },
          { id: 32, labelEn: 'Front Lace & Silk Top', labelZh: '前蕾丝递针', labelEs: 'Encaje Frontal con Aguja', sortOrder: 3, status: 'active' }
        ] },
      { id: 9, categoryId: 1, nameEn: 'Density', nameZh: '发量厚薄', nameEs: 'Densidad', inputType: 'single', isRequired: true, sortOrder: 9, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 33, labelEn: 'Light & Thin', labelZh: '轻薄款', labelEs: 'Ligero y Fino', sortOrder: 1, status: 'active' },
          { id: 34, labelEn: 'Normal Density', labelZh: '正常发量', labelEs: 'Densidad Normal', sortOrder: 2, status: 'active' },
          { id: 35, labelEn: 'Heavy (180%)', labelZh: '加厚高颅顶', labelEs: 'Densidad Alta (180%)', sortOrder: 3, status: 'active' }
        ] },
      { id: 10, categoryId: 1, nameEn: 'Free Gift', nameZh: '配套赠品', nameEs: 'Regalo de Cortesía', inputType: 'single', isRequired: false, sortOrder: 10, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 36, labelEn: 'Yes (Comb + Wig Cap)', labelZh: '有（梳子+发网）', labelEs: 'Sí (Peine + Red)', sortOrder: 1, status: 'active' },
          { id: 37, labelEn: 'No Free Gift', labelZh: '无赠品', labelEs: 'Sin Regalo', sortOrder: 2, status: 'active' }
        ] },
      // ===== 女士接发 (categoryId: 2) =====
      { id: 11, categoryId: 2, nameEn: 'Hair Material', nameZh: '发丝材质', nameEs: 'Material del Cabello', inputType: 'single', isRequired: true, sortOrder: 1, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 1, labelEn: '100% Remy Human Hair', labelZh: 'Remy全真发', labelEs: 'Cabello Remy 100% Humano', sortOrder: 1, status: 'active' },
          { id: 2, labelEn: 'Non-Remy Human Hair', labelZh: '非Remy真发', labelEs: 'Cabello Humano No Remy', sortOrder: 2, status: 'active' },
          { id: 3, labelEn: 'Fiber Synthetic', labelZh: '纤维高温丝', labelEs: 'Fibra Sintética', sortOrder: 3, status: 'active' }
        ] },
      { id: 12, categoryId: 2, nameEn: 'Extension Length', nameZh: '接发长度', nameEs: 'Longitud de Extensión', inputType: 'single', isRequired: true, sortOrder: 2, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 4, labelEn: '14 inch (35cm)', labelZh: '14英寸(35cm)', labelEs: '14 pulgadas (35cm)', sortOrder: 1, status: 'active' },
          { id: 5, labelEn: '18 inch (45cm)', labelZh: '18英寸(45cm)', labelEs: '18 pulgadas (45cm)', sortOrder: 2, status: 'active' },
          { id: 6, labelEn: '22 inch (55cm)', labelZh: '22英寸(55cm)', labelEs: '22 pulgadas (55cm)', sortOrder: 3, status: 'active' },
          { id: 7, labelEn: '24 inch (60cm)', labelZh: '24英寸(60cm)', labelEs: '24 pulgadas (60cm)', sortOrder: 4, status: 'active' }
        ] },
      { id: 13, categoryId: 2, nameEn: 'Extension Color', nameZh: '接发颜色', nameEs: 'Color de Extensión', inputType: 'multiple', isRequired: true, sortOrder: 3, status: 'active', createdAt: '2026-03-20', updatedAt: '2026-07-15',
        options: [
          { id: 8, labelEn: 'Natural Black (#1B)', labelZh: '自然黑(#1B)', labelEs: 'Negro Natural (#1B)', sortOrder: 1, status: 'active' },
          { id: 9, labelEn: 'Dark Brown (#4)', labelZh: '深棕(#4)', labelEs: 'Marrón Oscuro (#4)', sortOrder: 2, status: 'active' },
          { id: 10, labelEn: 'Medium Brown (#6)', labelZh: '中棕(#6)', labelEs: 'Marrón Medio (#6)', sortOrder: 3, status: 'active' },
          { id: 11, labelEn: 'Ash Blonde (#18)', labelZh: '灰金(#18)', labelEs: 'Rubio Ceniza (#18)', sortOrder: 4, status: 'active' },
          { id: 12, labelEn: 'Balayage Highlight', labelZh: '巴黎画染', labelEs: 'Balayage', sortOrder: 5, status: 'active' },
          { id: 13, labelEn: 'Ombre Two-Tone', labelZh: '渐变色', labelEs: 'Degradado Dos Tonos', sortOrder: 6, status: 'active' }
        ] },
      { id: 14, categoryId: 2, nameEn: 'Extension Type', nameZh: '接发方式', nameEs: 'Tipo de Extensión', inputType: 'single', isRequired: true, sortOrder: 4, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 14, labelEn: 'Clip-In Wefts', labelZh: '卡扣片接', labelEs: 'Clip de Sujeción', sortOrder: 1, status: 'active' },
          { id: 15, labelEn: '8D Invisible Tape', labelZh: '8D无痕胶接', labelEs: 'Cinta Invisible 8D', sortOrder: 2, status: 'active' },
          { id: 16, labelEn: 'Nano Ring (I-Tip)', labelZh: '纳米环(I扣)', labelEs: 'Anillo Nano (I-Tip)', sortOrder: 3, status: 'active' },
          { id: 17, labelEn: 'Keratin Bond (U-Tip)', labelZh: '角蛋白(U扣)', labelEs: 'Queratina (U-Tip)', sortOrder: 4, status: 'active' }
        ] },
      { id: 15, categoryId: 2, nameEn: 'Package Size', nameZh: '套装规格', nameEs: 'Tamaño del Paquete', inputType: 'single', isRequired: true, sortOrder: 5, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 18, labelEn: '50g / 3-Piece', labelZh: '50g/3片装', labelEs: '50g / 3 Piezas', sortOrder: 1, status: 'active' },
          { id: 19, labelEn: '80g / 5-Piece', labelZh: '80g/5片装', labelEs: '80g / 5 Piezas', sortOrder: 2, status: 'active' },
          { id: 20, labelEn: '120g / 7-Piece', labelZh: '120g/7片装', labelEs: '120g / 7 Piezas', sortOrder: 3, status: 'active' },
          { id: 21, labelEn: 'Single Strand (Bulk)', labelZh: '单束散装', labelEs: 'Hebra Individual', sortOrder: 4, status: 'active' }
        ] },
      { id: 16, categoryId: 2, nameEn: 'Hair Texture', nameZh: '发丝纹理', nameEs: 'Textura del Cabello', inputType: 'single', isRequired: true, sortOrder: 6, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 22, labelEn: 'Silky Straight', labelZh: '丝滑直发', labelEs: 'Liso Sedoso', sortOrder: 1, status: 'active' },
          { id: 23, labelEn: 'Body Wave', labelZh: '大卷波浪', labelEs: 'Onda Corporal', sortOrder: 2, status: 'active' },
          { id: 24, labelEn: 'Deep Wave', labelZh: '深度波浪', labelEs: 'Onda Profunda', sortOrder: 3, status: 'active' },
          { id: 25, labelEn: 'Curly / Kinky', labelZh: '卷发/小卷', labelEs: 'Rizado/Kinky', sortOrder: 4, status: 'active' }
        ] },
      { id: 17, categoryId: 2, nameEn: 'Application Method', nameZh: '使用方式', nameEs: 'Método de Aplicación', inputType: 'single', isRequired: true, sortOrder: 7, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 26, labelEn: 'DIY Home Use', labelZh: '家用自戴', labelEs: 'Auto-aplicación', sortOrder: 1, status: 'active' },
          { id: 27, labelEn: 'Professional Salon', labelZh: '沙龙专业嫁接', labelEs: 'Salón Profesional', sortOrder: 2, status: 'active' }
        ] },
      { id: 18, categoryId: 2, nameEn: 'Free Gift', nameZh: '配套赠品', nameEs: 'Regalo de Cortesía', inputType: 'single', isRequired: false, sortOrder: 8, status: 'active', createdAt: '2026-04-01', updatedAt: '2026-07-15',
        options: [
          { id: 28, labelEn: 'Yes (Clips + Pliers)', labelZh: '有（卡扣+钳子）', labelEs: 'Sí (Clips + Pinzas)', sortOrder: 1, status: 'active' },
          { id: 29, labelEn: 'No Free Gift', labelZh: '无赠品', labelEs: 'Sin Regalo', sortOrder: 2, status: 'active' }
        ] },
      // ===== 发饰配件 (categoryId: 3) =====
      { id: 19, categoryId: 3, nameEn: 'Material', nameZh: '材质', nameEs: 'Material', inputType: 'single', isRequired: true, sortOrder: 1, status: 'active', createdAt: '2026-05-10', updatedAt: '2026-07-10',
        options: [
          { id: 1, labelEn: 'Silk Satin', labelZh: '真丝缎面', labelEs: 'Satén de Seda', sortOrder: 1, status: 'active' },
          { id: 2, labelEn: 'Acrylic / Resin', labelZh: '亚克力/树脂', labelEs: 'Acrílico/Resina', sortOrder: 2, status: 'active' },
          { id: 3, labelEn: 'Freshwater Pearl', labelZh: '淡水珍珠', labelEs: 'Perla de Agua Dulce', sortOrder: 3, status: 'active' },
          { id: 4, labelEn: 'Zinc Alloy', labelZh: '锌合金', labelEs: 'Aleación de Zinc', sortOrder: 4, status: 'active' },
          { id: 5, labelEn: 'Velvet', labelZh: '天鹅绒', labelEs: 'Terciopelo', sortOrder: 5, status: 'active' }
        ] },
      { id: 20, categoryId: 3, nameEn: 'Accessory Type', nameZh: '配件类型', nameEs: 'Tipo de Accesorio', inputType: 'single', isRequired: true, sortOrder: 2, status: 'active', createdAt: '2026-05-10', updatedAt: '2026-07-10',
        options: [
          { id: 6, labelEn: 'Hair Claw Clip', labelZh: '抓夹', labelEs: 'Pinza de Garra', sortOrder: 1, status: 'active' },
          { id: 7, labelEn: 'Headband', labelZh: '发箍', labelEs: 'Diadema', sortOrder: 2, status: 'active' },
          { id: 8, labelEn: 'Hair Tie / Scrunchie', labelZh: '发圈', labelEs: 'Coletero/Scrunchie', sortOrder: 3, status: 'active' },
          { id: 9, labelEn: 'Hair Scarf', labelZh: '发带/丝巾', labelEs: 'Pañuelo para el Cabello', sortOrder: 4, status: 'active' },
          { id: 10, labelEn: 'Barrette / Hair Pin', labelZh: '发夹/一字夹', labelEs: 'Pasador/Horquilla', sortOrder: 5, status: 'active' }
        ] },
      { id: 21, categoryId: 3, nameEn: 'Color', nameZh: '颜色', nameEs: 'Color', inputType: 'multiple', isRequired: true, sortOrder: 3, status: 'active', createdAt: '2026-05-10', updatedAt: '2026-07-10',
        options: [
          { id: 11, labelEn: 'Classic Black', labelZh: '经典黑', labelEs: 'Negro Clásico', sortOrder: 1, status: 'active' },
          { id: 12, labelEn: 'Pearl White', labelZh: '珍珠白', labelEs: 'Blanco Perla', sortOrder: 2, status: 'active' },
          { id: 13, labelEn: 'Champagne Gold', labelZh: '香槟金', labelEs: 'Dorado Champán', sortOrder: 3, status: 'active' },
          { id: 14, labelEn: 'Rose Gold', labelZh: '玫瑰金', labelEs: 'Oro Rosa', sortOrder: 4, status: 'active' },
          { id: 15, labelEn: 'Tortoise Shell', labelZh: '玳瑁色', labelEs: 'Carey', sortOrder: 5, status: 'active' },
          { id: 16, labelEn: 'Blush Pink', labelZh: '裸粉色', labelEs: 'Rosa Pálido', sortOrder: 6, status: 'active' }
        ] },
      { id: 22, categoryId: 3, nameEn: 'Style', nameZh: '风格', nameEs: 'Estilo', inputType: 'single', isRequired: true, sortOrder: 4, status: 'active', createdAt: '2026-05-10', updatedAt: '2026-07-10',
        options: [
          { id: 17, labelEn: 'Minimalist', labelZh: '简约风', labelEs: 'Minimalista', sortOrder: 1, status: 'active' },
          { id: 18, labelEn: 'Vintage Retro', labelZh: '复古风', labelEs: 'Vintage Retro', sortOrder: 2, status: 'active' },
          { id: 19, labelEn: 'Korean Trendy', labelZh: '韩式潮流', labelEs: 'Tendencia Coreana', sortOrder: 3, status: 'active' },
          { id: 20, labelEn: 'Elegant Luxe', labelZh: '轻奢优雅', labelEs: 'Elegante Lujo', sortOrder: 4, status: 'active' },
          { id: 21, labelEn: 'Sweet Cute', labelZh: '甜美可爱', labelEs: 'Dulce y Lindo', sortOrder: 5, status: 'active' }
        ] },
      { id: 23, categoryId: 3, nameEn: 'Occasion', nameZh: '适用场合', nameEs: 'Ocasión', inputType: 'single', isRequired: false, sortOrder: 5, status: 'active', createdAt: '2026-05-10', updatedAt: '2026-07-10',
        options: [
          { id: 22, labelEn: 'Daily Casual', labelZh: '日常休闲', labelEs: 'Diario Casual', sortOrder: 1, status: 'active' },
          { id: 23, labelEn: 'Office / Commute', labelZh: '通勤办公', labelEs: 'Oficina/Trabajo', sortOrder: 2, status: 'active' },
          { id: 24, labelEn: 'Party / Date', labelZh: '派对约会', labelEs: 'Fiesta/Cita', sortOrder: 3, status: 'active' },
          { id: 25, labelEn: 'Wedding / Formal', labelZh: '婚礼正式场合', labelEs: 'Boda/Formal', sortOrder: 4, status: 'active' }
        ] },
      // ===== 护理产品 (categoryId: 4) =====
      { id: 24, categoryId: 4, nameEn: 'Volume / Size', nameZh: '容量规格', nameEs: 'Volumen/Tamaño', inputType: 'single', isRequired: true, sortOrder: 1, status: 'active', createdAt: '2026-05-15', updatedAt: '2026-07-12',
        options: [
          { id: 1, labelEn: 'Travel Size (30ml)', labelZh: '旅行装(30ml)', labelEs: 'Tamaño Viaje (30ml)', sortOrder: 1, status: 'active' },
          { id: 2, labelEn: 'Standard (100ml)', labelZh: '标准装(100ml)', labelEs: 'Estándar (100ml)', sortOrder: 2, status: 'active' },
          { id: 3, labelEn: 'Large (250ml)', labelZh: '大瓶装(250ml)', labelEs: 'Grande (250ml)', sortOrder: 3, status: 'active' },
          { id: 4, labelEn: 'Family Size (500ml)', labelZh: '家庭装(500ml)', labelEs: 'Tamaño Familiar (500ml)', sortOrder: 4, status: 'active' }
        ] },
      { id: 25, categoryId: 4, nameEn: 'Suitable Hair Type', nameZh: '适用发质', nameEs: 'Tipo de Cabello Adecuado', inputType: 'single', isRequired: true, sortOrder: 2, status: 'active', createdAt: '2026-05-15', updatedAt: '2026-07-12',
        options: [
          { id: 5, labelEn: 'Dry & Damaged', labelZh: '干枯受损发质', labelEs: 'Seco y Dañado', sortOrder: 1, status: 'active' },
          { id: 6, labelEn: 'Oily Scalp', labelZh: '油性头皮', labelEs: 'Cuero Cabelludo Graso', sortOrder: 2, status: 'active' },
          { id: 7, labelEn: 'Color-Treated', labelZh: '染烫发质', labelEs: 'Cabello Teñido', sortOrder: 3, status: 'active' },
          { id: 8, labelEn: 'All Hair Types', labelZh: '所有发质通用', labelEs: 'Todo Tipo de Cabello', sortOrder: 4, status: 'active' },
          { id: 9, labelEn: 'Fine & Thin', labelZh: '细软扁塌发质', labelEs: 'Fino y Delgado', sortOrder: 5, status: 'active' }
        ] },
      { id: 26, categoryId: 4, nameEn: 'Effect / Benefit', nameZh: '功效', nameEs: 'Efecto/Beneficio', inputType: 'single', isRequired: true, sortOrder: 3, status: 'active', createdAt: '2026-05-15', updatedAt: '2026-07-12',
        options: [
          { id: 10, labelEn: 'Deep Repair', labelZh: '深层修护', labelEs: 'Reparación Profunda', sortOrder: 1, status: 'active' },
          { id: 11, labelEn: 'Smooth & Anti-Frizz', labelZh: '柔顺防毛躁', labelEs: 'Suavidad Anti-Frizz', sortOrder: 2, status: 'active' },
          { id: 12, labelEn: 'Volume & Thickening', labelZh: '蓬松增厚', labelEs: 'Volumen y Densidad', sortOrder: 3, status: 'active' },
          { id: 13, labelEn: 'Scalp Care', labelZh: '头皮养护', labelEs: 'Cuidado del Cuero Cabelludo', sortOrder: 4, status: 'active' },
          { id: 14, labelEn: 'Color Protection', labelZh: '护色锁色', labelEs: 'Protección de Color', sortOrder: 5, status: 'active' }
        ] },
      { id: 27, categoryId: 4, nameEn: 'Key Ingredient', nameZh: '核心成分', nameEs: 'Ingrediente Clave', inputType: 'single', isRequired: false, sortOrder: 4, status: 'active', createdAt: '2026-05-15', updatedAt: '2026-07-12',
        options: [
          { id: 15, labelEn: 'Argan Oil', labelZh: '摩洛哥坚果油', labelEs: 'Aceite de Argán', sortOrder: 1, status: 'active' },
          { id: 16, labelEn: 'Keratin Protein', labelZh: '角蛋白', labelEs: 'Proteína de Queratina', sortOrder: 2, status: 'active' },
          { id: 17, labelEn: 'Botanical Extract', labelZh: '植物精华', labelEs: 'Extracto Botánico', sortOrder: 3, status: 'active' },
          { id: 18, labelEn: 'Collagen', labelZh: '胶原蛋白', labelEs: 'Colágeno', sortOrder: 4, status: 'active' },
          { id: 19, labelEn: 'Biotin Complex', labelZh: '生物素复合物', labelEs: 'Complejo de Biotina', sortOrder: 5, status: 'active' }
        ] },
      { id: 28, categoryId: 4, nameEn: 'Product Type', nameZh: '产品类型', nameEs: 'Tipo de Producto', inputType: 'single', isRequired: true, sortOrder: 5, status: 'active', createdAt: '2026-05-15', updatedAt: '2026-07-12',
        options: [
          { id: 20, labelEn: 'Shampoo', labelZh: '洗发水', labelEs: 'Champú', sortOrder: 1, status: 'active' },
          { id: 21, labelEn: 'Conditioner', labelZh: '护发素', labelEs: 'Acondicionador', sortOrder: 2, status: 'active' },
          { id: 22, labelEn: 'Hair Mask', labelZh: '发膜', labelEs: 'Mascarilla Capilar', sortOrder: 3, status: 'active' },
          { id: 23, labelEn: 'Hair Oil / Serum', labelZh: '护发精油', labelEs: 'Aceite/Sérum Capilar', sortOrder: 4, status: 'active' },
          { id: 24, labelEn: 'Leave-in Spray', labelZh: '免洗喷雾', labelEs: 'Spray Sin Enjuague', sortOrder: 5, status: 'active' }
        ] },
      // ===== 定制假发 (categoryId: 5) =====
      { id: 29, categoryId: 5, nameEn: 'Custom Type', nameZh: '定制类型', nameEs: 'Tipo de Personalización', inputType: 'single', isRequired: true, sortOrder: 1, status: 'active', createdAt: '2026-06-05', updatedAt: '2026-07-18',
        options: [
          { id: 1, labelEn: 'Full Custom (Bespoke)', labelZh: '全定制（量身定做）', labelEs: 'Personalización Completa', sortOrder: 1, status: 'active' },
          { id: 2, labelEn: 'Semi-Custom (Modify Existing)', labelZh: '半定制（修改现有款）', labelEs: 'Semi-Personalización', sortOrder: 2, status: 'active' },
          { id: 3, labelEn: 'Color Custom Only', labelZh: '仅定制颜色', labelEs: 'Solo Personalización de Color', sortOrder: 3, status: 'active' }
        ] },
      { id: 30, categoryId: 5, nameEn: 'Custom Hair Material', nameZh: '定制发丝材质', nameEs: 'Material Personalizado', inputType: 'single', isRequired: true, sortOrder: 2, status: 'active', createdAt: '2026-06-05', updatedAt: '2026-07-18',
        options: [
          { id: 4, labelEn: 'Premium Virgin Hair', labelZh: '优质处女发', labelEs: 'Cabello Virgen Premium', sortOrder: 1, status: 'active' },
          { id: 5, labelEn: 'European Hair', labelZh: '欧洲发', labelEs: 'Cabello Europeo', sortOrder: 2, status: 'active' },
          { id: 6, labelEn: 'Brazilian Hair', labelZh: '巴西发', labelEs: 'Cabello Brasileño', sortOrder: 3, status: 'active' },
          { id: 7, labelEn: 'Mongolian Hair', labelZh: '蒙古发', labelEs: 'Cabello Mongol', sortOrder: 4, status: 'active' }
        ] },
      { id: 31, categoryId: 5, nameEn: 'Head Circumference', nameZh: '头围尺寸', nameEs: 'Circunferencia de Cabeza', inputType: 'single', isRequired: true, sortOrder: 3, status: 'active', createdAt: '2026-06-05', updatedAt: '2026-07-18',
        options: [
          { id: 8, labelEn: 'Small (54cm)', labelZh: 'S码(54cm)', labelEs: 'Pequeño (54cm)', sortOrder: 1, status: 'active' },
          { id: 9, labelEn: 'Medium (56cm)', labelZh: 'M码(56cm)', labelEs: 'Mediano (56cm)', sortOrder: 2, status: 'active' },
          { id: 10, labelEn: 'Large (58cm)', labelZh: 'L码(58cm)', labelEs: 'Grande (58cm)', sortOrder: 3, status: 'active' },
          { id: 11, labelEn: 'X-Large (60cm)', labelZh: 'XL码(60cm)', labelEs: 'X-Grande (60cm)', sortOrder: 4, status: 'active' }
        ] },
      { id: 32, categoryId: 5, nameEn: 'Production Time', nameZh: '定制周期', nameEs: 'Tiempo de Producción', inputType: 'single', isRequired: true, sortOrder: 4, status: 'active', createdAt: '2026-06-05', updatedAt: '2026-07-18',
        options: [
          { id: 12, labelEn: 'Express (7 Days)', labelZh: '加急(7天)', labelEs: 'Express (7 Días)', sortOrder: 1, status: 'active' },
          { id: 13, labelEn: 'Standard (15 Days)', labelZh: '标准(15天)', labelEs: 'Estándar (15 Días)', sortOrder: 2, status: 'active' },
          { id: 14, labelEn: 'Premium (30 Days)', labelZh: '精工(30天)', labelEs: 'Premium (30 Días)', sortOrder: 3, status: 'active' },
          { id: 15, labelEn: 'Masterpiece (45 Days)', labelZh: '大师级(45天)', labelEs: 'Obra Maestra (45 Días)', sortOrder: 4, status: 'active' }
        ] },
      { id: 33, categoryId: 5, nameEn: 'Revision Policy', nameZh: '修改政策', nameEs: 'Política de Revisión', inputType: 'single', isRequired: false, sortOrder: 5, status: 'active', createdAt: '2026-06-05', updatedAt: '2026-07-18',
        options: [
          { id: 16, labelEn: '1 Free Revision', labelZh: '免费修改1次', labelEs: '1 Revisión Gratuita', sortOrder: 1, status: 'active' },
          { id: 17, labelEn: '2 Free Revisions', labelZh: '免费修改2次', labelEs: '2 Revisiones Gratuitas', sortOrder: 2, status: 'active' },
          { id: 18, labelEn: 'No Revision', labelZh: '不支持修改', labelEs: 'Sin Revisión', sortOrder: 3, status: 'active' }
        ] }
    ];

    /** 为产品列表页等页面动态生成分类筛选下拉菜单 */
    function buildCategoryFilter(selectId) {
      var select = document.getElementById(selectId || 'categoryFilter');
      if (!select) return;
      var currentVal = select.value;
      var html = '<option value="">全部分类</option>';
      categories.forEach(function(c) {
        html += '<option value="' + c.nameZh + '">' + c.nameZh + '</option>';
      });
      select.innerHTML = html;
      if (currentVal) {
        // 尝试恢复之前选中的值
        var exists = categories.some(function(c) { return c.nameZh === currentVal; });
        if (exists) select.value = currentVal;
      }
    }

    // ==================== 产品数据 ====================
    const products = [
      { id: 1, name: 'Natural Black Full Wig 20"', spu: 'SPU-FW-00001', category: '女士全头套', price: 1299, originalPrice: 1599, stock: '12款36件', stockLink: true, stockUpdateTime: '2026-07-07 09:30', status: 'on-sale', seoSlug: 'natural-black-full-wig-20', seriesCount: 3, seriesNames: ['2024秋冬系列', '旗舰系列', '热销推荐'], creator: '张三', org: '数码组', orgPath: '总部/数码事业部/数码组', date: '2026-06-15', updateDate: '2026-07-02' },
      { id: 2, name: 'Blonde Lace Front Wig', spu: 'SPU-FW-00002', category: '女士全头套', price: 1599, originalPrice: 1899, stock: '6款12件', stockLink: true, stockUpdateTime: '2026-07-07 08:15', status: 'on-sale', seoSlug: 'blonde-lace-front-wig', seriesCount: 2, seriesNames: ['高端系列', '学生特惠'], creator: '李四', org: '手机组', orgPath: '总部/数码事业部/手机组', date: '2026-06-12', updateDate: '2026-07-01' },
      { id: 3, name: 'Clip-in Hair Extensions 18"', spu: 'SPU-HE-00001', category: '女士接发', price: 399, originalPrice: 499, stock: '3款8件', stockLink: false, stockUpdateTime: '', status: 'off-sale', seoSlug: 'clip-in-hair-extensions-18', seriesCount: 1, seriesNames: ['接发系列'], creator: '王五', org: '配件组', orgPath: '总部/数码事业部/配件组', date: '2026-06-10', updateDate: '2026-06-28' },
      { id: 4, name: 'Tape-in Extensions 22"', spu: 'SPU-HE-00002', category: '女士接发', price: 599, originalPrice: 799, stock: '5款120件', stockLink: true, stockUpdateTime: '2026-07-06 22:45', status: 'on-sale', seoSlug: 'tape-in-extensions-22', seriesCount: 2, seriesNames: ['接发系列', '春季新品'], creator: '赵六', org: '运动鞋组', orgPath: '总部/服饰事业部/运动鞋组', date: '2026-06-08', updateDate: '2026-06-25' },
      { id: 5, name: 'Silk Hair Scarf Set', spu: 'SPU-HA-00001', category: '发饰配件', price: 199, originalPrice: 259, stock: '4款0件', stockLink: false, stockUpdateTime: '', status: 'draft', seoSlug: 'silk-hair-scarf-set', seriesCount: 0, seriesNames: [], creator: '钱七', org: '运动鞋组', orgPath: '总部/服饰事业部/运动鞋组', date: '2026-06-05', updateDate: '2026-06-20' },
      { id: 6, name: 'Pearl Hair Clips (6-pack)', spu: 'SPU-HA-00002', category: '发饰配件', price: 89, originalPrice: 128, stock: '2款500件', stockLink: true, stockUpdateTime: '2026-07-07 10:00', status: 'draft', seoSlug: 'pearl-hair-clips-6-pack', seriesCount: 1, seriesNames: ['发饰精选'], creator: '孙八', org: '进口食品组', orgPath: '总部/食品事业部/进口食品组', date: '2026-06-03', updateDate: '2026-06-18' },
      { id: 7, name: 'Argan Oil Hair Serum', spu: 'SPU-CP-00001', category: '护理产品', price: 258, originalPrice: 328, stock: '3款15件', stockLink: false, stockUpdateTime: '', status: 'on-sale', seoSlug: 'argan-oil-hair-serum', seriesCount: 2, seriesNames: ['高端护理', '品质生活'], creator: '周九', org: '家电组', orgPath: '总部/家居事业部/家电组', date: '2026-06-01', updateDate: '2026-06-15' },
      { id: 8, name: 'Keratin Deep Conditioner', spu: 'SPU-CP-00002', category: '护理产品', price: 168, originalPrice: 198, stock: '4款88件', stockLink: true, stockUpdateTime: '2026-07-07 07:30', status: 'on-sale', seoSlug: 'keratin-deep-conditioner', seriesCount: 3, seriesNames: ['护理精选', '明星产品', '节日礼盒'], creator: '吴十', org: '护肤组', orgPath: '总部/美妆事业部/护肤组', date: '2026-05-28', updateDate: '2026-06-10' },
      { id: 9, name: 'Custom Color Full Wig', spu: 'SPU-CW-00001', category: '定制假发', price: 2599, originalPrice: 2999, stock: '2款0件', stockLink: false, stockUpdateTime: '', status: 'off-sale', seoSlug: 'custom-color-full-wig', seriesCount: 1, seriesNames: ['定制系列'], creator: '吴十', org: '护肤组', orgPath: '总部/美妆事业部/护肤组', date: '2026-05-25', updateDate: '2026-06-08' },
      { id: 10, name: 'Boho Braided Headband', spu: 'SPU-HA-00003', category: '发饰配件', price: 69, originalPrice: 99, stock: '2款350件', stockLink: true, stockUpdateTime: '2026-07-06 18:20', status: 'on-sale', seoSlug: 'boho-braided-headband', seriesCount: 2, seriesNames: ['发饰精选', '性价比之王'], creator: '张三', org: '数码组', orgPath: '总部/数码事业部/数码组', date: '2026-05-20', updateDate: '2026-05-20' },
    ];

    // ==================== 组织架构数据 ====================
    const orgTree = [
      { id: 'all', label: '全部组织', path: '' },
      { id: 'org-dzsyb', label: '数码事业部', path: '总部/数码事业部', children: [
        { id: 'org-dz', label: '数码组', path: '总部/数码事业部/数码组' },
        { id: 'org-sj', label: '手机组', path: '总部/数码事业部/手机组' },
        { id: 'org-pj', label: '配件组', path: '总部/数码事业部/配件组' },
      ]},
      { id: 'org-fssyb', label: '服饰事业部', path: '总部/服饰事业部', children: [
        { id: 'org-ydx', label: '运动鞋组', path: '总部/服饰事业部/运动鞋组' },
        { id: 'org-fz', label: '服装组', path: '总部/服饰事业部/服装组' },
      ]},
      { id: 'org-spsyb', label: '食品事业部', path: '总部/食品事业部', children: [
        { id: 'org-jksp', label: '进口食品组', path: '总部/食品事业部/进口食品组' },
        { id: 'org-gnsp', label: '国内食品组', path: '总部/食品事业部/国内食品组' },
      ]},
      { id: 'org-jjsyb', label: '家居事业部', path: '总部/家居事业部', children: [
        { id: 'org-jd', label: '家电组', path: '总部/家居事业部/家电组' },
        { id: 'org-jf', label: '家纺组', path: '总部/家居事业部/家纺组' },
      ]},
      { id: 'org-mzsyd', label: '美妆事业部', path: '总部/美妆事业部', children: [
        { id: 'org-hf', label: '护肤组', path: '总部/美妆事业部/护肤组' },
        { id: 'org-cz', label: '彩妆组', path: '总部/美妆事业部/彩妆组' },
      ]},
    ];

    function flattenOrgTree(tree, level) {
      if (level === undefined) level = 0;
      let result = [];
      for (var i = 0; i < tree.length; i++) {
        var node = tree[i];
        result.push({ id: node.id, label: node.label, path: node.path, level: level });
        if (node.children) {
          result = result.concat(flattenOrgTree(node.children, level + 1));
        }
      }
      return result;
    }

    function buildOrgSelect() {
      const select = document.getElementById('orgFilter');
      if (!select) return;
      const flat = flattenOrgTree(orgTree);
      select.innerHTML = flat.map(function(n) {
        var indent = '\u3000'.repeat(n.level);
        var prefix = n.level === 1 ? '\u251C ' : n.level > 1 ? '\u2514 ' : '';
        return '<option value="' + n.id + '">' + indent + prefix + n.label + '</option>';
      }).join('');
    }

    // ==================== 列配置 ====================
    const columnConfig = [
      { key: 'checkbox', label: '', fixed: 'left', width: '40px', alwaysShow: true, isCheckbox: true },
      { key: 'productInfo', label: '产品信息', fixed: 'left', width: '240px', alwaysShow: true },
      { key: 'category', label: '分类', defaultShow: true },
      { key: 'price', label: '价格', defaultShow: true },
      { key: 'stock', label: '库存', defaultShow: true },
      { key: 'stockLink', label: '库存联动', defaultShow: true },
      { key: 'status', label: '产品状态', defaultShow: true },
      { key: 'series', label: '所属系列', defaultShow: true },
      { key: 'creator', label: '创建人', defaultShow: true },
      { key: 'date', label: '创建时间', defaultShow: true },
      { key: 'updateDate', label: '更新时间', defaultShow: false },
      { key: 'action', label: '操作', fixed: 'right', width: '120px', alwaysShow: true, isAction: true },
    ];

    var productSortField = 'date';
    var productSortDir = 'desc';

    let visibleCols = columnConfig.filter(function(c) { return c.defaultShow || c.alwaysShow; }).map(function(c) { return c.key; });
    let columnOrder = columnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction && !c.alwaysShow; }).map(function(c) { return c.key; });
    columnOrder = columnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction && c.alwaysShow && c.key !== 'checkbox'; }).map(function(c) { return c.key; }).concat(columnOrder);

    function getOrderedVisibleCols() {
      var ordered = [];
      for (var i = 0; i < columnConfig.length; i++) {
        var c = columnConfig[i];
        if ((c.alwaysShow || c.fixed === 'left') && c.fixed !== 'right' && visibleCols.indexOf(c.key) !== -1 && ordered.indexOf(c.key) === -1) {
          ordered.push(c.key);
        }
      }
      for (var j = 0; j < columnOrder.length; j++) {
        var key = columnOrder[j];
        if (visibleCols.indexOf(key) !== -1 && ordered.indexOf(key) === -1) {
          ordered.push(key);
        }
      }
      for (var k = 0; k < visibleCols.length; k++) {
        var vk = visibleCols[k];
        if (ordered.indexOf(vk) === -1) {
          ordered.push(vk);
        }
      }
      for (var m = 0; m < columnConfig.length; m++) {
        var fc = columnConfig[m];
        if (fc.fixed === 'right' && visibleCols.indexOf(fc.key) !== -1 && ordered.indexOf(fc.key) === -1) {
          ordered.push(fc.key);
        }
      }
      return ordered;
    }

    function buildCustomColPanel() {
      var body = document.getElementById('customColBody');
      var movableKeys = columnOrder.filter(function(k) {
        var c = columnConfig.find(function(col) { return col.key === k; });
        return c && !c.isCheckbox && !c.isAction && !c.fixed;
      });
      var alwaysKeys = columnOrder.filter(function(k) {
        var c = columnConfig.find(function(col) { return col.key === k; });
        return c && c.alwaysShow && !c.isCheckbox && !c.isAction;
      });

      var allKeys = alwaysKeys.concat(movableKeys);
      for (var i = 0; i < columnConfig.length; i++) {
        var c = columnConfig[i];
        if (!c.isCheckbox && !c.isAction && !c.fixed && allKeys.indexOf(c.key) === -1) {
          allKeys.push(c.key);
        }
      }

      body.innerHTML = allKeys.map(function(key) {
        var c = columnConfig.find(function(col) { return col.key === key; });
        if (!c) return '';
        var disabled = c.alwaysShow ? 'disabled' : '';
        var active = visibleCols.indexOf(c.key) !== -1 ? 'active' : '';
        var draggable = c.alwaysShow ? '' : 'draggable="true"';
        var dragIcon = '<span class="drag-handle' + (c.alwaysShow ? ' drag-disabled' : '') + '" title="' + (c.alwaysShow ? '固定列不可拖动' : '拖拽排序') + '">\u22EE\u22EE</span>';
        return '<div class="custom-col-item ' + active + ' ' + disabled + '" data-key="' + c.key + '" ' + draggable + '>' +
          dragIcon +
          '<div class="col-check" onclick="' + (c.alwaysShow ? '' : 'toggleCol(this.parentElement, event)') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
          '<span style="flex:1">' + c.label + '</span>' +
        '</div>';
      }).join('');

      initDragEvents(body);
    }

    function initDragEvents(body) {
      var dragItem = null;

      body.querySelectorAll('.custom-col-item[draggable="true"]').forEach(function(item) {
        item.addEventListener('dragstart', function(e) {
          dragItem = this;
          this.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', this.dataset.key);
        });

        item.addEventListener('dragend', function() {
          this.classList.remove('dragging');
          body.querySelectorAll('.custom-col-item').forEach(function(el) { el.classList.remove('drag-over'); });
          dragItem = null;
        });

        item.addEventListener('dragover', function(e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (this !== dragItem && !this.classList.contains('disabled')) {
            this.classList.add('drag-over');
          }
        });

        item.addEventListener('dragleave', function() {
          this.classList.remove('drag-over');
        });

        item.addEventListener('drop', function(e) {
          e.preventDefault();
          this.classList.remove('drag-over');
          if (dragItem && this !== dragItem && !this.classList.contains('disabled')) {
            var fromKey = dragItem.dataset.key;
            var toKey = this.dataset.key;
            var fromIdx = columnOrder.indexOf(fromKey);
            var toIdx = columnOrder.indexOf(toKey);
            if (fromIdx !== -1 && toIdx !== -1) {
              columnOrder.splice(fromIdx, 1);
              columnOrder.splice(toIdx, 0, fromKey);
            }
            buildCustomColPanel();
            renderTableHead();
            renderProducts(getCurrentFilter());
          }
        });
      });
    }

    function toggleCol(el, e) {
      if (e) { e.stopPropagation(); }
      var key = el.dataset.key;
      var c = columnConfig.find(function(col) { return col.key === key; });
      if (c && c.alwaysShow) return;
      if (el.classList.contains('active')) {
        el.classList.remove('active');
        visibleCols = visibleCols.filter(function(k) { return k !== key; });
      } else {
        el.classList.add('active');
        visibleCols.push(key);
      }
      renderTableHead();
      renderProducts(getCurrentFilter());
    }

    function resetCustomCols() {
      visibleCols = columnConfig.filter(function(c) { return c.defaultShow || c.alwaysShow; }).map(function(c) { return c.key; });
      columnOrder = columnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction && !c.alwaysShow; }).map(function(c) { return c.key; });
      columnOrder = columnConfig.filter(function(c) { return !c.isCheckbox && !c.isAction && c.alwaysShow && c.key !== 'checkbox'; }).map(function(c) { return c.key; }).concat(columnOrder);
      buildCustomColPanel();
      renderTableHead();
      renderProducts(getCurrentFilter());
    }

    function toggleCustomColPanel() {
      var panel = document.getElementById('customColPanel');
      var btn = document.querySelector('#customColWrapper button');
      if (panel.classList.contains('show')) {
        panel.classList.remove('show');
        panel.style.display = 'none';
      } else {
        var rect = btn.getBoundingClientRect();
        panel.style.top = (rect.bottom + 4) + 'px';
        panel.style.left = Math.max(8, rect.left - 240 + rect.width) + 'px';
        panel.style.display = 'block';
        panel.classList.add('show');
      }
    }

    document.addEventListener('click', function(e) {
      var wrapper = document.getElementById('customColWrapper');
      var panel = document.getElementById('customColPanel');
      if (wrapper && panel && !wrapper.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('show');
        panel.style.display = 'none';
      }
    });

    function getCurrentFilter() {
      return {
        search: (document.getElementById('productSearch') && document.getElementById('productSearch').value) || '',
        category: (document.getElementById('categoryFilter') && document.getElementById('categoryFilter').value) || '',
        status: (document.getElementById('statusFilter') && document.getElementById('statusFilter').value) || '',
        dateFrom: (document.getElementById('dateFrom') && document.getElementById('dateFrom').value) || '',
        dateTo: (document.getElementById('dateTo') && document.getElementById('dateTo').value) || '',
      };
    }

    function renderTableHead() {
      var thead = document.querySelector('.table-card table thead tr');
      if (!thead) return;
      var ordered = getOrderedVisibleCols();
      var sortableKeys = { 'price': true, 'date': true, 'updateDate': true };
      thead.innerHTML = ordered.map(function(key) {
        var c = columnConfig.find(function(col) { return col.key === key; });
        if (!c) return '';
        var fixedClass = c.fixed ? 'col-fixed-' + c.fixed : '';
        var width = c.width ? 'width:' + c.width + ';' : '';
        if (c.isCheckbox) {
          return '<th class="' + fixedClass + '" style="' + width + '"><div class="checkbox" onclick="toggleAllCheckboxes(this)"></div></th>';
        }
        if (c.isAction) {
          return '<th class="' + fixedClass + '" style="' + width + '">' + c.label + '</th>';
        }
        if (sortableKeys[key]) {
          var sorted = key === productSortField ? ' sorted' : '';
          var icon = key === productSortField ? (productSortDir === 'asc' ? '\u25B2' : '\u25BC') : '';
          return '<th class="sortable' + sorted + ' ' + fixedClass + '" data-sort="' + key + '" style="' + width + '">' + c.label + '<span class="sort-icon">' + icon + '</span></th>';
        }
        return '<th class="' + fixedClass + '" style="' + width + '">' + c.label + '</th>';
      }).join('');
    }


    function showPage(pageId) {
      document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
      var target = document.getElementById('page-' + pageId);
      if (target) {
        target.classList.add('active');
        target.classList.add('page-enter');
        setTimeout(function() { target.classList.remove('page-enter'); }, 300);
      }
      var breadcrumb = document.getElementById('breadcrumb');
      if (pageId === 'products') {
        breadcrumb.innerHTML = '<span>资产</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">产品列表</span>';
      } else if (pageId === 'add-product') {
        breadcrumb.innerHTML = '<span>资产</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-link" onclick="showPage(\'products\')">产品列表</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">添加产品</span>';
      }
      document.querySelectorAll('.sidebar-item').forEach(function(item) {
        if (item.dataset.page === 'products' || (pageId === 'add-product' && item.dataset.page === 'products')) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // ==================== 产品状态 Badge ====================
    function getStatusBadge(status) {
      var map = {
        'draft':    { label: '草稿',     cls: 'badge-secondary' },
        'on-sale':  { label: '已上架',   cls: 'badge-success' },
        'off-sale': { label: '已下架',   cls: 'badge-error' },
      };
      var s = map[status] || { label: status || '-', cls: 'badge-secondary' };
      return '<span class="badge ' + s.cls + '">' + s.label + '</span>';
    }


    // ==================== 获取产品/系列查看URL ====================
    function getShopBaseUrl() {
      var shop = getCurrentShop();
      if (!shop) return '';
      // 优先使用自定义域名，否则用默认域名
      var domain = shop.customDomain || shop.domain || '';
      // 确保有协议前缀
      if (domain && !/^https?:\/\//i.test(domain)) {
        domain = 'https://' + domain;
      }
      return domain.replace(/\/+$/, '');
    }

    function getProductViewUrl(product) {
      var base = getShopBaseUrl();
      if (!base) return '#';
      var slug = product.seoSlug || product.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      return base + '/product/' + encodeURIComponent(slug);
    }

    // ==================== 编辑产品 ====================
    function editProduct(productId) {
      sessionStorage.setItem('editProductId', productId);
      navigateToPage('product/edit_product.html');
    }

    function getCollectionViewUrl(collection) {
      var base = getShopBaseUrl();
      if (!base) return '#';
      var slug = collection.slug || '';
      return base + '/collections/' + encodeURIComponent(slug);
    }

    // ==================== 渲染产品表格 ====================
    function renderProducts(filter) {
      var tbody = document.getElementById('productTableBody');
      var filteredProducts = products.slice();

      if (filter) {
        if (filter.search) {
          var s = filter.search.toLowerCase();
          filteredProducts = filteredProducts.filter(function(p) {
            return p.name.toLowerCase().indexOf(s) !== -1 || p.spu.toLowerCase().indexOf(s) !== -1;
          });
        }
        if (filter.category) {
          filteredProducts = filteredProducts.filter(function(p) { return p.category === filter.category; });
        }
        if (filter.status) {
          filteredProducts = filteredProducts.filter(function(p) { return p.status === filter.status; });
        }
        if (filter.dateFrom) {
          filteredProducts = filteredProducts.filter(function(p) { return p.date >= filter.dateFrom; });
        }
        if (filter.dateTo) {
          filteredProducts = filteredProducts.filter(function(p) { return p.date <= filter.dateTo; });
        }
      }

      // 排序
      filteredProducts.sort(function(a, b) {
        var va = a[productSortField], vb = b[productSortField];
        if (va === undefined) va = ''; if (vb === undefined) vb = '';
        if (productSortField === 'price') {
          // 数值排序
          va = Number(va) || 0; vb = Number(vb) || 0;
          return productSortDir === 'asc' ? va - vb : vb - va;
        }
        // 日期/字符串排序
        if (va < vb) return productSortDir === 'asc' ? -1 : 1;
        if (va > vb) return productSortDir === 'asc' ? 1 : -1;
        return 0;
      });

      if (filteredProducts.length === 0) {
        var colCount = visibleCols.length;
        tbody.innerHTML = '<tr><td colspan="' + colCount + '"><div class="empty-state"><div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><div class="empty-state-title">暂无匹配产品</div><div class="empty-state-desc">试试调整搜索条件或筛选器</div></div></td></tr>';
        return;
      }

      var svgIcon = {
        box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
        shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
        phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
      };

      var categoryIconMap = {
        '女士全头套': svgIcon.shirt,
        '女士接发': svgIcon.droplet,
        '发饰配件': svgIcon.box,
        '护理产品': svgIcon.home,
        '定制假发': svgIcon.phone,
      };

      tbody.innerHTML = filteredProducts.map(function(p) {
        var ordered = getOrderedVisibleCols();
        var cells = ordered.map(function(key) {
          var c = columnConfig.find(function(col) { return col.key === key; });
          if (!c) return '';
          var fixedClass = c.fixed ? 'col-fixed-' + c.fixed : '';
          var width = c.width ? 'width:' + c.width + ';' : '';

          if (c.isCheckbox) {
            return '<td class="' + fixedClass + '" style="' + width + '"><div class="checkbox" onclick="toggleCheckbox(this)"></div></td>';
          }
          if (c.isAction) {
            var viewUrl = getProductViewUrl(p);
            return '<td class="' + fixedClass + '" style="' + width + '"><div class="action-group"><div class="action-btn" title="编辑" onclick="editProduct(' + p.id + ')">' + svgIcon.edit + '</div><div class="action-btn" title="查看" onclick="window.open(\'' + viewUrl + '\', \'_blank\')">' + svgIcon.external + '</div><div class="action-btn danger" title="删除" onclick="confirmDelete(\'' + p.name + '\')">' + svgIcon.trash + '</div></div></td>';
          }

          var content = '';
          switch (key) {
            case 'productInfo':
              content = '<div class="product-cell"><div class="product-img-placeholder">' + (categoryIconMap[p.category] || svgIcon.box) + '</div><div class="product-info"><div class="product-name">' + p.name + '</div><div class="product-sku">' + p.spu + '</div></div></div>';
              break;
            case 'category':
              content = p.category;
              break;
            case 'price':
              content = '<div style="font-weight: 600; color: hsl(var(--error));">\u00A5' + p.price + '</div>' + (p.originalPrice ? '<div style="font-size: 12px; color: hsl(var(--muted-foreground)); text-decoration: line-through;">\u00A5' + p.originalPrice + '</div>' : '');
              break;
            case 'stock':
              content = '<span style="' + (p.stock.indexOf('0\u4EF6') !== -1 ? 'color: hsl(var(--error)); font-weight: 600;' : '') + '">' + p.stock + '</span>';
              break;
            case 'stockLink':
              content = p.stockLink ? '<div><span class="badge badge-success">已联动</span>' + (p.stockUpdateTime ? '<div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px;">' + p.stockUpdateTime + '</div>' : '') + '</div>' : '<span class="badge badge-secondary">未联动</span>';
              break;
            case 'status':
              content = getStatusBadge(p.status);
              break;
            case 'series':
              if (p.seriesCount > 0 && p.seriesNames && p.seriesNames.length > 0) {
                var tooltipItems = p.seriesNames.map(function(name) { return '<div class="series-tooltip-item">' + name + '</div>'; }).join('');
                content = '<div class="series-cell"><span class="series-cell-count">' + p.seriesCount + '</span><span class="series-cell-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg><div class="series-tooltip">' + tooltipItems + '</div></span></div>';
              } else {
                content = '<span style="color: hsl(var(--muted-foreground));">-</span>';
              }
              break;
            case 'creator':
              content = '<span style="font-size: 13px;">' + (p.creator || '-') + '</span>';
              break;
            case 'date':
              content = '<span style="color: hsl(var(--muted-foreground));">' + p.date + '</span>';
              break;
            case 'updateDate':
              content = '<span style="color: hsl(var(--muted-foreground));">' + p.updateDate + '</span>';
              break;
          }
          return '<td class="' + fixedClass + '" style="' + width + '">' + content + '</td>';
        }).join('');
        return '<tr>' + cells + '</tr>';
      }).join('');
    }

    // ==================== 搜索和筛选 ====================
    function filterAndRender() {
      renderProducts(getCurrentFilter());
    }

    // 产品表格排序点击
    document.addEventListener('click', function(e) {
      var th = e.target.closest('th.sortable');
      if (!th) return;
      var key = th.getAttribute('data-sort');
      if (!key) return;
      if (productSortField === key) {
        productSortDir = productSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        productSortField = key;
        productSortDir = 'desc';
      }
      renderTableHead();
      renderProducts(getCurrentFilter());
    });

    var productSearchEl = document.getElementById('productSearch');
    if (productSearchEl) productSearchEl.addEventListener('input', filterAndRender);
    var categoryFilterEl = document.getElementById('categoryFilter');
    if (categoryFilterEl) categoryFilterEl.addEventListener('change', filterAndRender);
    var statusFilterEl = document.getElementById('statusFilter');
    if (statusFilterEl) statusFilterEl.addEventListener('change', filterAndRender);
    var dateFromEl = document.getElementById('dateFrom');
    if (dateFromEl) dateFromEl.addEventListener('change', filterAndRender);
    var dateToEl = document.getElementById('dateTo');
    if (dateToEl) dateToEl.addEventListener('change', filterAndRender);

    // ==================== Checkbox ====================
    function updateSelectedCount() {
      var checked = document.querySelectorAll('#productTableBody .checkbox.checked').length;
      var countEl = document.getElementById('selectedCount');
      if (countEl) countEl.textContent = checked;
      var bar = document.getElementById('bulkActionBar');
      if (bar) bar.classList.toggle('visible', checked > 0);
      var btnOnSale = document.getElementById('btnBatchOnSale');
      var btnOffSale = document.getElementById('btnBatchOffSale');
      var delBtn = document.getElementById('btnBatchDelete');
      if (btnOnSale) btnOnSale.disabled = checked === 0;
      if (btnOffSale) btnOffSale.disabled = checked === 0;
      if (delBtn) delBtn.disabled = checked === 0;
    }

    function toggleCheckbox(el) {
      el.classList.toggle('checked');
      el.innerHTML = el.classList.contains('checked') ? '\u2713' : '';
      updateSelectedCount();
    }

    function toggleAllCheckboxes(el) {
      var isChecked = !el.classList.contains('checked');
      el.classList.toggle('checked');
      el.innerHTML = isChecked ? '\u2713' : '';
      document.querySelectorAll('#productTableBody .checkbox').forEach(function(cb) {
        cb.classList.toggle('checked', isChecked);
        cb.innerHTML = isChecked ? '\u2713' : '';
      });
      updateSelectedCount();
    }

    function exportSelected() {
      var checked = document.querySelectorAll('#productTableBody .checkbox.checked').length;
      if (checked === 0) {
        showToast('info', '请先选择要导出的产品');
        return;
      }
      showToast('success', '已导出 ' + checked + ' 条产品');
    }

    // ==================== 批量设置状态 ====================
    function batchSetStatus(status) {
      var checkedEls = document.querySelectorAll('#productTableBody .checkbox.checked');
      if (checkedEls.length === 0) {
        showToast('info', '请先选择要操作的产品');
        return;
      }
      var statusMap = { 'on-sale': '上架', 'off-sale': '下架', 'draft': '草稿' };
      var statusText = statusMap[status] || status;

      checkedEls.forEach(function(cb) {
        var row = cb.closest('tr');
        var nameEl = row.querySelector('.product-name');
        if (!nameEl) return;
        var productName = nameEl.textContent;
        var product = products.find(function(p) { return p.name === productName; });
        if (product) product.status = status;
      });

      renderProducts(getCurrentFilter());
      updateSelectedCount();
      showToast('success', '已将 ' + checkedEls.length + ' 件产品设为\u300C' + statusText + '\u300D');
    }

    function addToProductSeries() {
      var checkedEls = document.querySelectorAll('#productTableBody .checkbox.checked');
      if (checkedEls.length === 0) {
        showToast('info', '请先选择要添加到系列的产品');
        return;
      }
      var names = [];
      checkedEls.forEach(function(cb) {
        var row = cb.closest('tr');
        var nameEl = row.querySelector('.product-name');
        if (nameEl) names.push(nameEl.textContent);
      });
      showToast('success', '已将 ' + names.length + ' 件产品添加到产品系列中');
    }

    // ==================== 更多操作下拉 ====================
    function toggleMoreActions() {
      var dropdown = document.getElementById('moreActionsDropdown');
      if (!dropdown) return;
      var isOpen = dropdown.classList.contains('show');
      if (isOpen) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
        return;
      }
      var btn = document.getElementById('btnMoreActions');
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.left = Math.max(8, rect.left) + 'px';
      dropdown.classList.add('show');
      dropdown.style.display = 'block';
    }

    document.addEventListener('click', function(e) {
      var wrapper = document.getElementById('moreActionsWrapper');
      var dropdown = document.getElementById('moreActionsDropdown');
      if (dropdown && wrapper && !wrapper.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
      }
    });


    function batchDelete() {
      var checkedEls = document.querySelectorAll('#productTableBody .checkbox.checked');
      if (checkedEls.length === 0) {
        showToast('info', '请先选择要删除的产品');
        return;
      }
      var names = [];
      checkedEls.forEach(function(cb) {
        var row = cb.closest('tr');
        var nameEl = row.querySelector('.product-name');
        if (nameEl) names.push(nameEl.textContent);
      });
      confirmBatchDelete(names);
    }

    function confirmBatchDelete(names) {
      var overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.innerHTML = '<div class="dialog"><div class="dialog-header"><div class="dialog-title">确认批量删除</div><button class="dialog-close" onclick="this.closest(\'.dialog-overlay\').remove()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="dialog-desc">确定要删除选中的 ' + names.length + ' 件产品吗？此操作无法撤销。</div><div class="dialog-actions"><button class="btn btn-secondary" onclick="this.closest(\'.dialog-overlay\').remove()">取消</button><button class="btn btn-destructive" onclick="executeBatchDelete(' + JSON.stringify(names) + '); this.closest(\'.dialog-overlay\').remove();">确认删除</button></div></div>';
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    }

    function executeBatchDelete(names) {
      names.forEach(function(name) {
        var index = products.findIndex(function(p) { return p.name === name; });
        if (index > -1) products.splice(index, 1);
      });
      renderProducts(getCurrentFilter());
      updateSelectedCount();
      showToast('success', '已删除 ' + names.length + ' 件产品');
    }

    // ==================== 删除确认 ====================
    function confirmDelete(name) {
      var overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.innerHTML = '<div class="dialog"><div class="dialog-header"><div class="dialog-title">确认删除</div><button class="dialog-close" onclick="this.closest(\'.dialog-overlay\').remove()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="dialog-desc">确定要删除产品「' + name + '」吗？此操作无法撤销。</div><div class="dialog-actions"><button class="btn btn-secondary" onclick="this.closest(\'.dialog-overlay\').remove()">取消</button><button class="btn btn-destructive" onclick="this.closest(\'.dialog-overlay\').remove();showToast(\'success\', \'已删除: ' + name + '\')">确认删除</button></div></div>';
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    }

    // ==================== Toggle 开关 ====================
    function toggleSwitch(el) {
      el.classList.toggle('active');
    }

    // ==================== 标签选择 ====================
    function toggleTag(el) {
      el.classList.toggle('selected');
    }

    // ==================== 规格管理 ====================
    function addSpecRow() {
      var tbody = document.getElementById('specTableBody');
      var row = document.createElement('tr');
      row.innerHTML = '<td><input class="spec-input" placeholder="如：材质" /></td><td><input class="spec-input" placeholder="如：棉/涤纶" /></td><td><input class="spec-input" type="number" placeholder="0.00" /></td><td><input class="spec-input" type="number" placeholder="0" /></td><td><div class="spec-row-delete" onclick="deleteSpecRow(this)">\u2715</div></td>';
      tbody.appendChild(row);
    }

    function deleteSpecRow(el) {
      var row = el.closest('tr');
      row.style.animation = 'toastOut 0.2s ease';
      setTimeout(function() { row.remove(); }, 200);
    }

    // ==================== 图片上传模拟 ====================
    function simulateUpload() {
      showToast('success', '图片上传成功（模拟）');
      var grid = document.getElementById('uploadPreviewGrid');
      var colors = [
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      ];
      var randomColor = colors[Math.floor(Math.random() * colors.length)];
      var item = document.createElement('div');
      item.className = 'upload-preview-item';
      item.style.background = randomColor;
      item.style.color = 'white';
      item.style.fontSize = '12px';
      item.textContent = '新图';
      grid.appendChild(item);
    }

    // ==================== 可搜索下拉选择器 ====================

    /** 初始化页面上所有 select 为可搜索下拉（跳过已转换的） */
    function initSearchableSelects() {
      var selects = document.querySelectorAll('select');
      for (var i = 0; i < selects.length; i++) {
        if (selects[i]._searchable) continue;
        if (!selects[i].id) continue;
        buildSearchableSelect(selects[i]);
      }
    }

    /** 页面加载后自动初始化所有下拉 */
    document.addEventListener('DOMContentLoaded', initSearchableSelects);

    function buildSearchableSelect(select) {
      var selectId = select.id;
      if (!selectId) return;

      // 外层容器
      var wrapper = document.createElement('div');
      wrapper.className = 'searchable-select';
      wrapper.id = selectId + 'Wrapper';

      // 触发器按钮
      var trigger = document.createElement('button');
      trigger.className = 'searchable-select-trigger';
      trigger.type = 'button';
      var selOpt = select.options[select.selectedIndex];
      var triggerSpan = document.createElement('span');
      triggerSpan.textContent = selOpt ? selOpt.text : '请选择';
      trigger.appendChild(triggerSpan);
      var arrow = document.createElement('span');
      arrow.className = 'searchable-select-arrow';
      arrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0937D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
      trigger.appendChild(arrow);

      // 下拉面板
      var dropdown = document.createElement('div');
      dropdown.className = 'searchable-select-dropdown';
      dropdown.id = selectId + 'Dropdown';
      dropdown.style.display = 'none';

      // 搜索框
      var searchArea = document.createElement('div');
      searchArea.className = 'searchable-select-search';
      var searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = '输入关键词检索...';
      searchInput.id = selectId + 'Search';
      searchArea.appendChild(searchInput);
      dropdown.appendChild(searchArea);

      // 选项列表
      var listDiv = document.createElement('div');
      listDiv.className = 'searchable-select-list';
      listDiv.id = selectId + 'List';
      var selValue = select.value;
      var opts = select.querySelectorAll('option');
      for (var j = 0; j < opts.length; j++) {
        var opt = opts[j];
        var item = document.createElement('div');
        item.className = 'searchable-select-option';
        if (opt.value === selValue) item.classList.add('selected');
        item.dataset.value = opt.value;
        item.textContent = (j + 1) + '. ' + opt.text;
        (function(value, text) {
          item.addEventListener('click', function() {
            selectSearchableOption(selectId, value, text);
          });
        })(opt.value, opt.text);
        listDiv.appendChild(item);
      }
      dropdown.appendChild(listDiv);

      // 组装
      wrapper.appendChild(trigger);
      wrapper.appendChild(dropdown);

      // 隐藏原始 select，插入 wrapper
      select.style.display = 'none';
      select.parentNode.insertBefore(wrapper, select);

      // 触发器点击
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSearchableDropdown(selectId);
      });

      // 搜索过滤
      searchInput.addEventListener('input', function() {
        var q = this.value.toLowerCase();
        var items = dropdown.querySelectorAll('.searchable-select-option');
        var visible = 0;
        for (var k = 0; k < items.length; k++) {
          if (!q || items[k].textContent.toLowerCase().indexOf(q) !== -1) {
            items[k].classList.remove('hidden');
            visible++;
          } else {
            items[k].classList.add('hidden');
          }
        }
        var noneEl = listDiv.querySelector('.searchable-select-none');
        if (visible === 0) {
          if (!noneEl) {
            noneEl = document.createElement('div');
            noneEl.className = 'searchable-select-none';
            noneEl.textContent = '无匹配选项';
            listDiv.appendChild(noneEl);
          }
        } else if (noneEl) {
          noneEl.remove();
        }
      });

      // 点击外部关闭（使用全局事件）
      document.addEventListener('click', function(e) {
        var d = document.getElementById(selectId + 'Dropdown');
        if (d && d.style.display === 'block' && !wrapper.contains(e.target) && !d.contains(e.target)) {
          closeSearchableDropdown(selectId);
        }
      });

      // 保存引用
      select._searchable = { wrapper: wrapper, trigger: trigger, triggerSpan: triggerSpan, dropdown: dropdown };
    }

    function toggleSearchableDropdown(selectId) {
      var dropdown = document.getElementById(selectId + 'Dropdown');
      var triggerEl = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger');
      var wrapper = document.getElementById(selectId + 'Wrapper');
      if (!dropdown) return;
      if (dropdown.style.display === 'block') {
        closeSearchableDropdown(selectId);
        return;
      }
      // 关闭已打开的浏览器原生日期选择器
      var dateInputs = document.querySelectorAll('input[type="date"]');
      for (var di = 0; di < dateInputs.length; di++) {
        dateInputs[di].blur();
      }
      if (triggerEl) {
        var rect = triggerEl.getBoundingClientRect();
        // 将下拉面板提升到 body 层级，避免被父容器 transform/overflow 影响而错位
        if (wrapper && dropdown.parentNode !== document.body) {
          document.body.appendChild(dropdown);
        }
        dropdown.style.top = (rect.bottom + 4) + 'px';
        dropdown.style.left = rect.left + 'px';
        dropdown.style.minWidth = rect.width + 'px';
      }
      dropdown.style.display = 'block';
      if (triggerEl) triggerEl.classList.add('open');
      var search = document.getElementById(selectId + 'Search');
      if (search) setTimeout(function() { search.focus(); }, 100);
    }

    function closeSearchableDropdown(selectId) {
      var dropdown = document.getElementById(selectId + 'Dropdown');
      var triggerEl = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger');
      var wrapper = document.getElementById(selectId + 'Wrapper');
      if (dropdown) {
        dropdown.style.display = 'none';
        // 关闭后移回 wrapper，保持 DOM 结构一致
        if (wrapper && dropdown.parentNode !== wrapper) {
          wrapper.appendChild(dropdown);
        }
      }
      if (triggerEl) triggerEl.classList.remove('open');
      var search = document.getElementById(selectId + 'Search');
      if (search) search.value = '';
      var list = document.getElementById(selectId + 'List');
      if (list) {
        var items = list.querySelectorAll('.searchable-select-option');
        for (var i = 0; i < items.length; i++) items[i].classList.remove('hidden');
        var noneEl = list.querySelector('.searchable-select-none');
        if (noneEl) noneEl.remove();
      }
    }

    function selectSearchableOption(selectId, value, text) {
      var select = document.getElementById(selectId);
      if (!select) return;
      select.value = value;
      var triggerSpan = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger span');
      if (triggerSpan) triggerSpan.textContent = text;
      var list = document.getElementById(selectId + 'List');
      if (list) {
        var items = list.querySelectorAll('.searchable-select-option');
        for (var i = 0; i < items.length; i++) {
          if (items[i].dataset.value === value) {
            items[i].classList.add('selected');
          } else {
            items[i].classList.remove('selected');
          }
        }
      }
      closeSearchableDropdown(selectId);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
