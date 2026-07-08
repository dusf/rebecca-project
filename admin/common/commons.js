// ==================== 公共脚本 ====================
// 此文件包含商品数据、Toast、侧边栏导航等所有页面共享的逻辑


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
          { page: 'products', label: '商品',
            icon: '<svg viewBox="0 0 24 24"><path d="m21 7.5-9-5-9 5"/><path d="m21 7.5-9 5-9-5"/><path d="M21 7.5v9l-9 5-9-5v-9"/></svg>' },
          { page: 'social', label: '社媒',
            icon: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.5 10.5 15.5 6.5"/><path d="M8.5 13.5 15.5 17.5"/></svg>' },
          { page: 'influencers', label: '网红',
            icon: '<svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
          { page: 'orders', label: '订单',
            icon: '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' }
        ]
      },
      {
        section: '店铺',
        items: [
          { page: 'series', label: '系列',
            icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>' },
          { page: 'promotions', label: '促销',
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
      {
        section: '全局',
        items: [
          { page: 'countries', label: '国家',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
          { page: 'language', label: '语言',
            icon: '<svg viewBox="0 0 24 24"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>' },
          { page: 'currency', label: '货币',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M12 11v6"/><path d="M10 17h4"/></svg>' },
          { page: 'exchange-rate', label: '汇率',
            icon: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-9 9"/><path d="M3 12a9 9 0 0 1 9-9"/><path d="M12 3v18"/><path d="m7 6 2-2 2 2"/><path d="m13 18 2 2 2-2"/></svg>' },
          { page: 'tax-rate', label: '税率',
            icon: '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>' },
          { page: 'freight', label: '运费',
            icon: '<svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' },
          { page: 'vip-system', label: 'VIP体系',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
          { page: 'category-mgmt', label: '分类',
            icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' }
        ]
      }
    ];

    // ==================== 路由映射 ====================
    const PAGE_ROUTES = {
      'products':      'product/product_list.html',
      'add-product':   'product/add_product.html',
      'countries':     'country/countries.html',
      'exchange-rate': 'exchange-rate/exchange_rate.html'
    };

    // ==================== 侧边栏渲染 ====================
    function renderSidebar(activePage) {
      const container = document.getElementById('sidebarContainer');
      if (!container) return;

      let html = `
      <div class="sidebar-shop-selector">
        <div class="sidebar-shop-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <div class="sidebar-shop-info">
          <div class="sidebar-shop-name">QVR品牌站</div>
          <div class="sidebar-shop-domain">youpin.shop</div>
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
    });

    // ==================== 商品数据 ====================
    const products = [
      { id: 1, name: 'iPhone 15 Pro Max', spu: 'SPU-DZ-00001', category: '数码电子', price: 9999, originalPrice: 10999, stock: '12款36件', stockLink: true, stockUpdateTime: '2026-07-07 09:30', status: 'on-sale', creator: '张三', org: '数码组', orgPath: '总部/数码事业部/数码组', date: '2026-06-15', updateDate: '2026-07-02' },
      { id: 2, name: 'MacBook Air M3', spu: 'SPU-DZ-00002', category: '数码电子', price: 8999, originalPrice: 9499, stock: '6款12件', stockLink: true, stockUpdateTime: '2026-07-07 08:15', status: 'on-sale', creator: '李四', org: '手机组', orgPath: '总部/数码事业部/手机组', date: '2026-06-12', updateDate: '2026-07-01' },
      { id: 3, name: 'AirPods Pro 2', spu: 'SPU-DZ-00003', category: '数码电子', price: 1899, originalPrice: 1999, stock: '3款8件', stockLink: false, stockUpdateTime: '', status: 'off-sale', creator: '王五', org: '配件组', orgPath: '总部/数码事业部/配件组', date: '2026-06-10', updateDate: '2026-06-28' },
      { id: 4, name: 'Nike Air Max 270', spu: 'SPU-FS-00001', category: '服饰鞋包', price: 899, originalPrice: 1299, stock: '5款120件', stockLink: true, stockUpdateTime: '2026-07-06 22:45', status: 'on-sale', creator: '赵六', org: '运动鞋组', orgPath: '总部/服饰事业部/运动鞋组', date: '2026-06-08', updateDate: '2026-06-25' },
      { id: 5, name: 'Adidas Ultraboost', spu: 'SPU-FS-00002', category: '服饰鞋包', price: 1299, originalPrice: 1599, stock: '4款0件', stockLink: false, stockUpdateTime: '', status: 'draft', creator: '钱七', org: '运动鞋组', orgPath: '总部/服饰事业部/运动鞋组', date: '2026-06-05', updateDate: '2026-06-20' },
      { id: 6, name: '星巴克精品咖啡豆', spu: 'SPU-SP-00001', category: '食品饮料', price: 128, originalPrice: 158, stock: '2款500件', stockLink: true, stockUpdateTime: '2026-07-07 10:00', status: 'draft', creator: '孙八', org: '进口食品组', orgPath: '总部/食品事业部/进口食品组', date: '2026-06-03', updateDate: '2026-06-18' },
      { id: 7, name: '戴森 V15 吸尘器', spu: 'SPU-JJ-00001', category: '家居生活', price: 4990, originalPrice: 5490, stock: '3款15件', stockLink: false, stockUpdateTime: '', status: 'on-sale', creator: '周九', org: '家电组', orgPath: '总部/家居事业部/家电组', date: '2026-06-01', updateDate: '2026-06-15' },
      { id: 8, name: '兰蔻小黑瓶精华', spu: 'SPU-MZ-00001', category: '美妆护肤', price: 1080, originalPrice: 1280, stock: '4款88件', stockLink: true, stockUpdateTime: '2026-07-07 07:30', status: 'on-sale', creator: '吴十', org: '护肤组', orgPath: '总部/美妆事业部/护肤组', date: '2026-05-28', updateDate: '2026-06-10' },
      { id: 9, name: 'SK-II 神仙水', spu: 'SPU-MZ-00002', category: '美妆护肤', price: 1590, originalPrice: 1690, stock: '2款0件', stockLink: false, stockUpdateTime: '', status: 'off-sale', creator: '吴十', org: '护肤组', orgPath: '总部/美妆事业部/护肤组', date: '2026-05-25', updateDate: '2026-06-08' },
      { id: 10, name: '小米智能手环 8', spu: 'SPU-DZ-00004', category: '数码电子', price: 249, originalPrice: 299, stock: '2款350件', stockLink: true, stockUpdateTime: '2026-07-06 18:20', status: 'on-sale', creator: '张三', org: '数码组', orgPath: '总部/数码事业部/数码组', date: '2026-05-20', updateDate: '2026-05-20' },
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

    function flattenOrgTree(tree, level = 0) {
      let result = [];
      for (const node of tree) {
        result.push({ ...node, level });
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
      select.innerHTML = flat.map(n => {
        const indent = '　'.repeat(n.level);
        const prefix = n.level === 1 ? '├ ' : n.level > 1 ? '└ ' : '';
        return `<option value="${n.id}">${indent}${prefix}${n.label}</option>`;
      }).join('');
    }

    // ==================== 列配置 ====================
    const columnConfig = [
      { key: 'checkbox', label: '', fixed: 'left', width: '40px', alwaysShow: true, isCheckbox: true },
      { key: 'productInfo', label: '商品信息', fixed: 'left', width: '240px', alwaysShow: true },
      { key: 'category', label: '分类', defaultShow: true },
      { key: 'price', label: '价格', defaultShow: true },
      { key: 'stock', label: '库存', defaultShow: true },
      { key: 'stockLink', label: '库存联动', defaultShow: true },
      { key: 'status', label: '商品状态', defaultShow: true },
      { key: 'creator', label: '创建人', defaultShow: true },
      { key: 'date', label: '创建时间', defaultShow: true },
      { key: 'updateDate', label: '更新时间', defaultShow: false },
      { key: 'action', label: '操作', fixed: 'right', width: '120px', alwaysShow: true, isAction: true },
    ];

    let visibleCols = columnConfig.filter(c => c.defaultShow || c.alwaysShow).map(c => c.key);
    // 可拖拽排序列（排除固定列 checkbox 和 action，只保留中间列）
    let columnOrder = columnConfig.filter(c => !c.isCheckbox && !c.isAction && !c.alwaysShow).map(c => c.key);
    // 初始化时把 alwaysShow 的中间列也加入（productInfo）
    columnOrder = columnConfig.filter(c => !c.isCheckbox && !c.isAction && c.alwaysShow && c.key !== 'checkbox').map(c => c.key).concat(columnOrder);

    function getOrderedVisibleCols() {
      const ordered = [];
      // 固定左侧列（排除右侧固定列）
      for (const c of columnConfig) {
        if ((c.alwaysShow || c.fixed === 'left') && c.fixed !== 'right' && visibleCols.includes(c.key) && !ordered.includes(c.key)) {
          ordered.push(c.key);
        }
      }
      // 按 columnOrder 顺序插入中间列
      for (const key of columnOrder) {
        if (visibleCols.includes(key) && !ordered.includes(key)) {
          ordered.push(key);
        }
      }
      // 把不在 columnOrder 中但 visible 的列追加
      for (const key of visibleCols) {
        if (!ordered.includes(key)) {
          ordered.push(key);
        }
      }
      // 固定右侧列
      for (const c of columnConfig) {
        if (c.fixed === 'right' && visibleCols.includes(c.key) && !ordered.includes(c.key)) {
          ordered.push(c.key);
        }
      }
      return ordered;
    }

    function buildCustomColPanel() {
      const body = document.getElementById('customColBody');
      // 按 columnOrder 排序可移动的列，固定列置顶
      const movableKeys = columnOrder.filter(k => {
        const c = columnConfig.find(col => col.key === k);
        return c && !c.isCheckbox && !c.isAction && !c.fixed;
      });
      const alwaysKeys = columnOrder.filter(k => {
        const c = columnConfig.find(col => col.key === k);
        return c && c.alwaysShow && !c.isCheckbox && !c.isAction;
      });

      // 固定列先展示，可拖拽列后展示
      const allKeys = [...alwaysKeys, ...movableKeys];
      // 把未在 columnOrder 中的非固定列追加
      for (const c of columnConfig) {
        if (!c.isCheckbox && !c.isAction && !c.fixed && !allKeys.includes(c.key)) {
          allKeys.push(c.key);
        }
      }

      body.innerHTML = allKeys.map(key => {
        const c = columnConfig.find(col => col.key === key);
        if (!c) return '';
        const disabled = c.alwaysShow ? 'disabled' : '';
        const active = visibleCols.includes(c.key) ? 'active' : '';
        const draggable = c.alwaysShow ? '' : 'draggable="true"';
        return `<div class="custom-col-item ${active} ${disabled}" data-key="${c.key}" ${draggable}>
          ${c.alwaysShow ? '' : '<span class="drag-handle" title="拖拽排序">⋮⋮</span>'}
          <div class="col-check" onclick="${c.alwaysShow ? '' : 'toggleCol(this.parentElement)'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <span style="flex:1">${c.label}</span>
        </div>`;
      }).join('');

      // 绑定拖拽事件
      initDragEvents(body);
    }

    function initDragEvents(body) {
      let dragItem = null;

      body.querySelectorAll('.custom-col-item[draggable="true"]').forEach(item => {
        item.addEventListener('dragstart', function(e) {
          dragItem = this;
          this.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', this.dataset.key);
        });

        item.addEventListener('dragend', function() {
          this.classList.remove('dragging');
          body.querySelectorAll('.custom-col-item').forEach(el => el.classList.remove('drag-over'));
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
            const fromKey = dragItem.dataset.key;
            const toKey = this.dataset.key;
            const fromIdx = columnOrder.indexOf(fromKey);
            const toIdx = columnOrder.indexOf(toKey);
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

    function toggleCol(el) {
      const key = el.dataset.key;
      const c = columnConfig.find(col => col.key === key);
      if (c && c.alwaysShow) return;
      if (el.classList.contains('active')) {
        el.classList.remove('active');
        visibleCols = visibleCols.filter(k => k !== key);
      } else {
        el.classList.add('active');
        visibleCols.push(key);
      }
      renderTableHead();
      renderProducts(getCurrentFilter());
    }

    function resetCustomCols() {
      visibleCols = columnConfig.filter(c => c.defaultShow || c.alwaysShow).map(c => c.key);
      columnOrder = columnConfig.filter(c => !c.isCheckbox && !c.isAction && !c.alwaysShow).map(c => c.key);
      columnOrder = columnConfig.filter(c => !c.isCheckbox && !c.isAction && c.alwaysShow && c.key !== 'checkbox').map(c => c.key).concat(columnOrder);
      buildCustomColPanel();
      renderTableHead();
      renderProducts(getCurrentFilter());
    }

    function toggleCustomColPanel() {
      const panel = document.getElementById('customColPanel');
      const btn = document.querySelector('#customColWrapper button');
      if (panel.classList.contains('show')) {
        panel.classList.remove('show');
        panel.style.display = 'none';
      } else {
        // 根据按钮的视口位置动态计算弹出层坐标
        const rect = btn.getBoundingClientRect();
        panel.style.top = (rect.bottom + 4) + 'px';
        panel.style.left = Math.max(8, rect.left - 240 + rect.width) + 'px';
        panel.style.display = 'block';
        panel.classList.add('show');
      }
    }

    // 点击外部关闭面板
    document.addEventListener('click', function(e) {
      const wrapper = document.getElementById('customColWrapper');
      const panel = document.getElementById('customColPanel');
      if (wrapper && panel && !wrapper.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('show');
        panel.style.display = 'none';
      }
    });

    function getCurrentFilter() {
      return {
        search: document.getElementById('productSearch')?.value || '',
        category: document.getElementById('categoryFilter')?.value || '',
        status: document.getElementById('statusFilter')?.value || '',
        org: document.getElementById('orgFilter')?.value || '',
      };
    }

    function renderTableHead() {
      const thead = document.querySelector('.table-card table thead tr');
      if (!thead) return;
      const ordered = getOrderedVisibleCols();
      thead.innerHTML = ordered.map(key => {
        const c = columnConfig.find(col => col.key === key);
        if (!c) return '';
        const fixedClass = c.fixed ? `col-fixed-${c.fixed}` : '';
        const width = c.width ? `width:${c.width};` : '';
        if (c.isCheckbox) {
          return `<th class="${fixedClass}" style="${width}"><div class="checkbox" onclick="toggleAllCheckboxes(this)"></div></th>`;
        }
        if (c.isAction) {
          return `<th class="${fixedClass}" style="${width}">${c.label}</th>`;
        }
        return `<th class="${fixedClass}" style="${width}">${c.label}</th>`;
      }).join('');
    }


    function showPage(pageId) {
      // 隐藏所有页面
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

      // 显示目标页面
      const target = document.getElementById('page-' + pageId);
      if (target) {
        target.classList.add('active');
        target.classList.add('page-enter');
        setTimeout(() => target.classList.remove('page-enter'), 300);
      }

      // 更新面包屑
      const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
      const breadcrumb = document.getElementById('breadcrumb');
      if (pageId === 'products') {
        breadcrumb.innerHTML = '<span>资产</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">商品列表</span>';
      } else if (pageId === 'add-product') {
        breadcrumb.innerHTML = '<span>资产</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-link" onclick="showPage(\'products\')">商品列表</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">添加商品</span>';
      }

      // 更新侧边栏选中状态
      document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.dataset.page === 'products' || (pageId === 'add-product' && item.dataset.page === 'products')) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // ==================== 商品状态 Badge ====================
    function getStatusBadge(status) {
      const map = {
        'draft':    { label: '草稿',     cls: 'badge-secondary' },
        'on-sale':  { label: '已上架',   cls: 'badge-success' },
        'off-sale': { label: '已下架',   cls: 'badge-error' },
      };
      const s = map[status] || { label: status || '-', cls: 'badge-secondary' };
      return `<span class="badge ${s.cls}">${s.label}</span>`;
    }

    // ==================== 渲染商品表格 ====================
    function renderProducts(filter = {}) {
      const tbody = document.getElementById('productTableBody');
      let filteredProducts = [...products];

      // 搜索过滤
      if (filter.search) {
        const s = filter.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(s) || p.spu.toLowerCase().includes(s)
        );
      }

      // 分类过滤
      if (filter.category) {
        const catMap = { electronics: '数码电子', clothing: '服饰鞋包', food: '食品饮料', home: '家居生活', beauty: '美妆护肤' };
        filteredProducts = filteredProducts.filter(p => p.category === catMap[filter.category]);
      }

      // 组织过滤
      if (filter.org) {
        const orgNode = flattenOrgTree(orgTree).find(n => n.id === filter.org);
        if (orgNode && orgNode.path) {
          filteredProducts = filteredProducts.filter(p => p.orgPath && p.orgPath.startsWith(orgNode.path));
        }
      }

      if (filteredProducts.length === 0) {
        const colCount = visibleCols.length;
        tbody.innerHTML = `
          <tr>
            <td colspan="${colCount}">
              <div class="empty-state">
                <div class="empty-state-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
                <div class="empty-state-title">暂无匹配商品</div>
                <div class="empty-state-desc">试试调整搜索条件或筛选器</div>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      // SVG icon helpers
      const svgIcon = {
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
      };

      const categoryIconMap = {
        '数码电子': svgIcon.phone,
        '服饰鞋包': svgIcon.shirt,
        '食品饮料': svgIcon.coffee,
        '家居生活': svgIcon.home,
        '美妆护肤': svgIcon.droplet,
      };

      tbody.innerHTML = filteredProducts.map(p => {
        const ordered = getOrderedVisibleCols();
        const cells = ordered.map(key => {
          const c = columnConfig.find(col => col.key === key);
          if (!c) return '';
          const fixedClass = c.fixed ? `col-fixed-${c.fixed}` : '';
          const width = c.width ? `width:${c.width};` : '';

          if (c.isCheckbox) {
            return `<td class="${fixedClass}" style="${width}"><div class="checkbox" onclick="toggleCheckbox(this)"></div></td>`;
          }
          if (c.isAction) {
            return `<td class="${fixedClass}" style="${width}">
              <div class="action-group">
                <div class="action-btn" title="编辑" onclick="showToast('info', '编辑: ${p.name}')">${svgIcon.edit}</div>
                <div class="action-btn" title="复制" onclick="showToast('success', '已复制商品')">${svgIcon.copy}</div>
                <div class="action-btn danger" title="删除" onclick="confirmDelete('${p.name}')">${svgIcon.trash}</div>
              </div>
            </td>`;
          }

          let content = '';
          switch (key) {
            case 'productInfo':
              content = `<div class="product-cell">
                <div class="product-img-placeholder">${categoryIconMap[p.category] || svgIcon.box}</div>
                <div class="product-info">
                  <div class="product-name">${p.name}</div>
                  <div class="product-sku">${p.spu}</div>
                </div>
              </div>`;
              break;
            case 'category':
              content = p.category;
              break;
            case 'price':
              content = `<div style="font-weight: 600; color: hsl(var(--error));">¥${p.price}</div>
                ${p.originalPrice ? `<div style="font-size: 12px; color: hsl(var(--muted-foreground)); text-decoration: line-through;">¥${p.originalPrice}</div>` : ''}`;
              break;
            case 'stock':
              content = `<span style="${p.stock.includes('0件') ? 'color: hsl(var(--error)); font-weight: 600;' : ''}">${p.stock}</span>`;
              break;
            case 'stockLink':
              content = p.stockLink
                ? `<div><span class="badge badge-success">已联动</span>${p.stockUpdateTime ? `<div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px;">${p.stockUpdateTime}</div>` : ''}</div>`
                : '<span class="badge badge-secondary">未联动</span>';
              break;
            case 'status':
              content = getStatusBadge(p.status);
              break;
            case 'creator':
              content = `<span style="font-size: 13px;">${p.creator || '-'}</span>`;
              break;
            case 'date':
              content = `<span style="color: hsl(var(--muted-foreground));">${p.date}</span>`;
              break;
            case 'updateDate':
              content = `<span style="color: hsl(var(--muted-foreground));">${p.updateDate}</span>`;
              break;
          }
          return `<td class="${fixedClass}" style="${width}">${content}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
    }

    // ==================== 搜索和筛选 ====================
    function filterAndRender() {
      renderProducts(getCurrentFilter());
    }

    document.getElementById('productSearch').addEventListener('input', filterAndRender);
    document.getElementById('categoryFilter').addEventListener('change', filterAndRender);
    document.getElementById('orgFilter')?.addEventListener('change', filterAndRender);

    // ==================== Checkbox ====================
    function updateSelectedCount() {
      const checked = document.querySelectorAll('#productTableBody .checkbox.checked').length;
      const countEl = document.getElementById('selectedCount');
      if (countEl) countEl.textContent = checked;
      const bar = document.getElementById('bulkActionBar');
      if (bar) {
        bar.classList.toggle('visible', checked > 0);
      }
      // 控制按钮状态
      const btnOnSale = document.getElementById('btnBatchOnSale');
      const btnOffSale = document.getElementById('btnBatchOffSale');
      const delBtn = document.getElementById('btnBatchDelete');
      if (btnOnSale) btnOnSale.disabled = checked === 0;
      if (btnOffSale) btnOffSale.disabled = checked === 0;
      if (delBtn) delBtn.disabled = checked === 0;
    }

    function toggleCheckbox(el) {
      el.classList.toggle('checked');
      if (el.classList.contains('checked')) {
        el.innerHTML = '✓';
      } else {
        el.innerHTML = '';
      }
      updateSelectedCount();
    }

    function toggleAllCheckboxes(el) {
      const isChecked = !el.classList.contains('checked');
      el.classList.toggle('checked');
      el.innerHTML = isChecked ? '✓' : '';

      document.querySelectorAll('#productTableBody .checkbox').forEach(cb => {
        cb.classList.toggle('checked', isChecked);
        cb.innerHTML = isChecked ? '✓' : '';
      });
      updateSelectedCount();
    }

    function exportSelected() {
      const checked = document.querySelectorAll('#productTableBody .checkbox.checked').length;
      if (checked === 0) {
        showToast('info', '请先选择要导出的商品');
        return;
      }
      showToast('success', `已导出 ${checked} 条商品`);
    }

    // ==================== 批量设置状态 ====================
    function batchSetStatus(status) {
      const checkedEls = document.querySelectorAll('#productTableBody .checkbox.checked');
      if (checkedEls.length === 0) {
        showToast('info', '请先选择要操作的商品');
        return;
      }
      const statusMap = { 'on-sale': '上架', 'off-sale': '下架', 'draft': '草稿' };
      const statusText = statusMap[status] || status;

      checkedEls.forEach(cb => {
        const row = cb.closest('tr');
        const nameEl = row.querySelector('.product-name');
        if (!nameEl) return;
        const productName = nameEl.textContent;
        const product = products.find(p => p.name === productName);
        if (product) product.status = status;
      });

      renderProducts(getCurrentFilter());
      updateSelectedCount();
      showToast('success', `已将 ${checkedEls.length} 件商品设为「${statusText}」`);
    }

    // ==================== 添加到产品系列中 ====================
    function addToProductSeries() {
      const checkedEls = document.querySelectorAll('#productTableBody .checkbox.checked');
      if (checkedEls.length === 0) {
        showToast('info', '请先选择要添加到系列的商品');
        return;
      }
      const names = [];
      checkedEls.forEach(cb => {
        const row = cb.closest('tr');
        const nameEl = row.querySelector('.product-name');
        if (nameEl) names.push(nameEl.textContent);
      });
      showToast('success', `已将 ${names.length} 件商品添加到产品系列中`);
    }

    // ==================== 更多操作下拉 ====================
    function toggleMoreActions() {
      const dropdown = document.getElementById('moreActionsDropdown');
      const wrapper = document.getElementById('moreActionsWrapper');
      if (!dropdown) return;

      const isOpen = dropdown.classList.contains('show');
      if (isOpen) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
        return;
      }

      // body 级别 fixed 定位：按钮下方左对齐，彻底脱离父级 stacking context
      const btn = document.getElementById('btnMoreActions');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.left = Math.max(8, rect.left) + 'px';
      dropdown.classList.add('show');
      dropdown.style.display = 'block';
    }

    // 点击外部关闭更多操作下拉
    document.addEventListener('click', function(e) {
      const wrapper = document.getElementById('moreActionsWrapper');
      const dropdown = document.getElementById('moreActionsDropdown');
      if (dropdown && wrapper && !wrapper.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
      }
    });


    function batchDelete() {
      const checkedEls = document.querySelectorAll('#productTableBody .checkbox.checked');
      if (checkedEls.length === 0) {
        showToast('info', '请先选择要删除的商品');
        return;
      }
      const names = [];
      checkedEls.forEach(cb => {
        const row = cb.closest('tr');
        const nameEl = row.querySelector('.product-name');
        if (nameEl) names.push(nameEl.textContent);
      });
      confirmBatchDelete(names);
    }

    function confirmBatchDelete(names) {
      const overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.innerHTML = `
        <div class="dialog">
          <div class="dialog-title">确认批量删除</div>
          <div class="dialog-desc">确定要删除选中的 ${names.length} 件商品吗？此操作无法撤销。</div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" onclick="this.closest('.dialog-overlay').remove()">取消</button>
            <button class="btn btn-destructive" onclick="executeBatchDelete(${JSON.stringify(names)}); this.closest('.dialog-overlay').remove();">确认删除</button>
          </div>
        </div>
      `;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    }

    function executeBatchDelete(names) {
      names.forEach(name => {
        const index = products.findIndex(p => p.name === name);
        if (index > -1) products.splice(index, 1);
      });
      renderProducts(getCurrentFilter());
      updateSelectedCount();
      showToast('success', `已删除 ${names.length} 件商品`);
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
      const tbody = document.getElementById('specTableBody');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input class="spec-input" placeholder="如：材质" /></td>
        <td><input class="spec-input" placeholder="如：棉/涤纶" /></td>
        <td><input class="spec-input" type="number" placeholder="0.00" /></td>
        <td><input class="spec-input" type="number" placeholder="0" /></td>
        <td><div class="spec-row-delete" onclick="deleteSpecRow(this)">✕</div></td>
      `;
      tbody.appendChild(row);
    }

    function deleteSpecRow(el) {
      const row = el.closest('tr');
      row.style.animation = 'toastOut 0.2s ease';
      setTimeout(() => row.remove(), 200);
    }

    // ==================== 图片上传模拟 ====================
    function simulateUpload() {
      showToast('success', '图片上传成功（模拟）');
      const grid = document.getElementById('uploadPreviewGrid');
      const colors = [
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const item = document.createElement('div');
      item.className = 'upload-preview-item';
      item.style.background = randomColor;
      item.style.color = 'white';
      item.style.fontSize = '12px';
      item.textContent = '新图';
      grid.appendChild(item);
    }

