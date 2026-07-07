// ==================== 公共脚本 ====================
// 此文件包含商品数据、Toast、侧边栏导航等所有页面共享的逻辑


    // ==================== 商品数据 ====================
    const products = [
      { id: 1, name: 'iPhone 15 Pro Max', spu: 'SPU-DZ-00001', category: '数码电子', price: 9999, originalPrice: 10999, stock: '12款36件', stockLink: true, stockUpdateTime: '2026-07-07 09:30', site: 3, creator: '张三', org: '数码组', orgPath: '总部/数码事业部/数码组', date: '2026-06-15', updateDate: '2026-07-02' },
      { id: 2, name: 'MacBook Air M3', spu: 'SPU-DZ-00002', category: '数码电子', price: 8999, originalPrice: 9499, stock: '6款12件', stockLink: true, stockUpdateTime: '2026-07-07 08:15', site: 5, creator: '李四', org: '手机组', orgPath: '总部/数码事业部/手机组', date: '2026-06-12', updateDate: '2026-07-01' },
      { id: 3, name: 'AirPods Pro 2', spu: 'SPU-DZ-00003', category: '数码电子', price: 1899, originalPrice: 1999, stock: '3款8件', stockLink: false, stockUpdateTime: '', site: 4, creator: '王五', org: '配件组', orgPath: '总部/数码事业部/配件组', date: '2026-06-10', updateDate: '2026-06-28' },
      { id: 4, name: 'Nike Air Max 270', spu: 'SPU-FS-00001', category: '服饰鞋包', price: 899, originalPrice: 1299, stock: '5款120件', stockLink: true, stockUpdateTime: '2026-07-06 22:45', site: 2, creator: '赵六', org: '运动鞋组', orgPath: '总部/服饰事业部/运动鞋组', date: '2026-06-08', updateDate: '2026-06-25' },
      { id: 5, name: 'Adidas Ultraboost', spu: 'SPU-FS-00002', category: '服饰鞋包', price: 1299, originalPrice: 1599, stock: '4款0件', stockLink: false, stockUpdateTime: '', site: 1, creator: '钱七', org: '运动鞋组', orgPath: '总部/服饰事业部/运动鞋组', date: '2026-06-05', updateDate: '2026-06-20' },
      { id: 6, name: '星巴克精品咖啡豆', spu: 'SPU-SP-00001', category: '食品饮料', price: 128, originalPrice: 158, stock: '2款500件', stockLink: true, stockUpdateTime: '2026-07-07 10:00', site: 6, creator: '孙八', org: '进口食品组', orgPath: '总部/食品事业部/进口食品组', date: '2026-06-03', updateDate: '2026-06-18' },
      { id: 7, name: '戴森 V15 吸尘器', spu: 'SPU-JJ-00001', category: '家居生活', price: 4990, originalPrice: 5490, stock: '3款15件', stockLink: false, stockUpdateTime: '', site: 3, creator: '周九', org: '家电组', orgPath: '总部/家居事业部/家电组', date: '2026-06-01', updateDate: '2026-06-15' },
      { id: 8, name: '兰蔻小黑瓶精华', spu: 'SPU-MZ-00001', category: '美妆护肤', price: 1080, originalPrice: 1280, stock: '4款88件', stockLink: true, stockUpdateTime: '2026-07-07 07:30', site: 5, creator: '吴十', org: '护肤组', orgPath: '总部/美妆事业部/护肤组', date: '2026-05-28', updateDate: '2026-06-10' },
      { id: 9, name: 'SK-II 神仙水', spu: 'SPU-MZ-00002', category: '美妆护肤', price: 1590, originalPrice: 1690, stock: '2款0件', stockLink: false, stockUpdateTime: '', site: 4, creator: '吴十', org: '护肤组', orgPath: '总部/美妆事业部/护肤组', date: '2026-05-25', updateDate: '2026-06-08' },
      { id: 10, name: '小米智能手环 8', spu: 'SPU-DZ-00004', category: '数码电子', price: 249, originalPrice: 299, stock: '2款350件', stockLink: true, stockUpdateTime: '2026-07-06 18:20', site: 2, creator: '张三', org: '数码组', orgPath: '总部/数码事业部/数码组', date: '2026-05-20', updateDate: '2026-05-20' },
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
      { key: 'site', label: '所属站点', defaultShow: true },
      { key: 'creator', label: '创建人', defaultShow: true },
      { key: 'org', label: '所属组织', defaultShow: true },
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

    // ==================== 侧边栏导航 ====================
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page === 'products') {
          showPage('products');
        } else if (page) {
          // 其他页面暂不实现，显示提示
          showToast('info', `${item.textContent.trim()} 页面开发中...`);
        }
      });
    });

    // 个人中心通知铃铛
    document.querySelector('.sidebar-profile-bell')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('info', '您有 3 条未读通知');
    });

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
            case 'site':
              content = `<span style="font-weight: 500;">${p.site}</span>`;
              break;
            case 'creator':
              content = `<span style="font-size: 13px;">${p.creator || '-'}</span>`;
              break;
            case 'org':
              content = `<span style="font-size: 13px; color: hsl(var(--muted-foreground));">${p.org || '-'}</span>`;
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
      const syncBtn = document.getElementById('btnSyncShop');
      const delBtn = document.getElementById('btnBatchDelete');
      if (syncBtn) syncBtn.disabled = checked === 0;
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

    function batchSyncToShop() {
      const checkedEls = document.querySelectorAll('#productTableBody .checkbox.checked');
      if (checkedEls.length === 0) {
        showToast('info', '请先选择要同步的商品');
        return;
      }
      const names = [];
      checkedEls.forEach(cb => {
        const row = cb.closest('tr');
        const nameEl = row.querySelector('.product-name');
        if (nameEl) names.push(nameEl.textContent);
      });
      openSyncDialog(names);
    }

    function openSyncDialog(names) {
      const sites = [
        { id: 'qvr', name: 'QVR 品牌站', color: '#C9A96E', domain: 'qvr.shop.com' },
        { id: 'rft', name: 'RFT 品牌站', color: '#6B8F71', domain: 'rft.shop.com' },
        { id: 'blc', name: 'BLC 品牌站', color: '#5B7FBF', domain: 'blc.shop.com' },
        { id: 'nxd', name: 'NXD 品牌站', color: '#C06070', domain: 'nxd.shop.com' },
      ];

      // 每个站点下的一级/二级系列
      const siteSeriesMap = {
        qvr: [
          { id: 'qvr-c1', name: '假发系列', level: 1, children: [
            { id: 'qvr-c1-1', name: 'HD Lace 前蕾丝系列', level: 2 },
            { id: 'qvr-c1-2', name: 'Closure 封口系列', level: 2 },
            { id: 'qvr-c1-3', name: 'Frontal 前额系列', level: 2 },
          ]},
          { id: 'qvr-c2', name: '配件系列', level: 1, children: [
            { id: 'qvr-c2-1', name: '发网与发帽', level: 2 },
            { id: 'qvr-c2-2', name: '护理工具', level: 2 },
          ]},
          { id: 'qvr-c3', name: '定制系列', level: 1, children: [
            { id: 'qvr-c3-1', name: '颜色定制', level: 2 },
            { id: 'qvr-c3-2', name: '尺寸定制', level: 2 },
          ]},
        ],
        rft: [
          { id: 'rft-c1', name: '发套系列', level: 1, children: [
            { id: 'rft-c1-1', name: '全蕾丝发套', level: 2 },
            { id: 'rft-c1-2', name: '半蕾丝发套', level: 2 },
          ]},
          { id: 'rft-c2', name: '配件系列', level: 1, children: [
            { id: 'rft-c2-1', name: '胶水与胶带', level: 2 },
            { id: 'rft-c2-2', name: '梳子与支架', level: 2 },
          ]},
        ],
        blc: [
          { id: 'blc-c1', name: '经典系列', level: 1, children: [
            { id: 'blc-c1-1', name: 'Bob 波波头', level: 2 },
            { id: 'blc-c1-2', name: 'Pixie 精灵短发', level: 2 },
          ]},
          { id: 'blc-c2', name: '潮流系列', level: 1, children: [
            { id: 'blc-c2-1', name: 'Ombre 渐变', level: 2 },
            { id: 'blc-c2-2', name: 'Balayage 挑染', level: 2 },
          ]},
        ],
        nxd: [
          { id: 'nxd-c1', name: '男士系列', level: 1, children: [
            { id: 'nxd-c1-1', name: '男士发块', level: 2 },
            { id: 'nxd-c1-2', name: '男士发套', level: 2 },
          ]},
          { id: 'nxd-c2', name: '女士系列', level: 1, children: [
            { id: 'nxd-c2-1', name: '长发系列', level: 2 },
            { id: 'nxd-c2-2', name: '中短发系列', level: 2 },
          ]},
        ],
      };

      // 模拟已同步数据：{ 商品名: [已铺到的系列ID列表] }
      const existingSyncMap = {
        'iPhone 15 Pro Max': ['qvr-c1-1', 'qvr-c2-1'],
        'MacBook Air M3': ['qvr-c1-1'],
        'Nike Air Max 270': ['rft-c1-1'],
      };

      let selectedSite = 'qvr';
      let selectedSeriesIds = new Set();

      function renderSeries() {
        const series = siteSeriesMap[selectedSite] || [];
        const container = document.getElementById('syncSeriesList');
        container.innerHTML = series.map(cat => `
          <div class="sync-series-category">
            <div class="sync-series-cat-header">
              <svg class="sync-series-cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
              <span>${cat.name}</span>
              <span class="sync-series-cat-hint">一级·不可选</span>
            </div>
            <div class="sync-series-children">
              ${cat.children.map(child => `
                <div class="sync-series-child ${selectedSeriesIds.has(child.id) ? 'selected' : ''}" data-series-id="${child.id}" onclick="window._toggleSeries('${child.id}', this)">
                  <div class="sync-series-child-check">✓</div>
                  <span>${child.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('');
      }

      window._toggleSeries = function(seriesId, el) {
        if (selectedSeriesIds.has(seriesId)) {
          selectedSeriesIds.delete(seriesId);
          el.classList.remove('selected');
        } else {
          selectedSeriesIds.add(seriesId);
          el.classList.add('selected');
        }
        updateSelectedSeriesTags();
      };

      function updateSelectedSeriesTags() {
        const tags = document.getElementById('syncSeriesTags');
        const allSeries = (siteSeriesMap[selectedSite] || []).flatMap(c => c.children);
        const selected = allSeries.filter(s => selectedSeriesIds.has(s.id));
        tags.innerHTML = selected.length === 0
          ? '<span style="font-size:12px;color:hsl(var(--muted-foreground))">未选择系列</span>'
          : selected.map(s => `<div class="sync-selected-tag" data-series="${s.id}" onclick="window._removeSeriesTag('${s.id}')">${s.name}<span class="remove" onclick="event.stopPropagation();window._removeSeriesTag('${s.id}')">×</span></div>`).join('');
      }

      window._removeSeriesTag = function(seriesId) {
        selectedSeriesIds.delete(seriesId);
        const child = document.querySelector(`.sync-series-child[data-series-id='${seriesId}']`);
        if (child) child.classList.remove('selected');
        updateSelectedSeriesTags();
      };

      const overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.innerHTML = `
        <div class="dialog sync-dialog-v3">
          <div class="dialog-title">同步到店铺系列中</div>
          <div class="dialog-desc">已选 ${names.length} 件商品，选择目标站点下的系列进行同步</div>
          <div class="sync-dialog-v3-body">
            <div class="sync-dialog-v3-left">
              <div class="sync-section-title">选择站点</div>
              <div class="sync-site-list-v3" id="syncSiteListV3">
                ${sites.map(s => `
                  <div class="sync-site-row-v3 ${s.id === selectedSite ? 'selected' : ''}" data-site="${s.id}" onclick="window._selectSyncSite('${s.id}', this)">
                    <div class="sync-site-avatar" style="background:${s.color}">${s.name.charAt(0)}</div>
                    <div class="sync-site-info-v3">
                      <div class="sync-site-name-v3">${s.name}</div>
                      <div class="sync-site-domain-v3">${s.domain}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="sync-dialog-v3-right">
              <div class="sync-section-title">选择系列（二级）</div>
              <div class="sync-series-list" id="syncSeriesList"></div>
              <div style="margin-top:16px">
                <div class="sync-section-title">已选系列</div>
                <div class="sync-selected-tags-v3" id="syncSeriesTags"></div>
              </div>
              <div style="margin-top:20px">
                <div class="sync-section-title">上架状态</div>
                <div class="sync-status-options-v3" id="syncStatusOptionsV3">
                  <div class="sync-status-option selected" data-status="on" onclick="window._selectSyncStatus(this)">
                    <div class="radio"></div><span>已上架</span>
                  </div>
                  <div class="sync-status-option" data-status="off" onclick="window._selectSyncStatus(this)">
                    <div class="radio"></div><span>未上架</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="dialog-actions" style="margin-top:20px">
            <button class="btn btn-secondary" onclick="this.closest('.dialog-overlay').remove()">取消</button>
            <button class="btn btn-primary" onclick="window._confirmSyncV3('${names.join('|')}')">确认同步</button>
          </div>
        </div>
      `;

      window._selectSyncSite = function(siteId, el) {
        if (siteId === selectedSite) return;
        selectedSite = siteId;
        selectedSeriesIds.clear();
        document.querySelectorAll('#syncSiteListV3 .sync-site-row-v3').forEach(r => r.classList.remove('selected'));
        el.classList.add('selected');
        renderSeries();
        updateSelectedSeriesTags();
      };

      window._selectSyncStatus = function(el) {
        document.querySelectorAll('#syncStatusOptionsV3 .sync-status-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
      };

      window._confirmSyncV3 = function(namesStr) {
        const names = namesStr.split('|');
        if (selectedSeriesIds.size === 0) {
          showToast('info', '请至少选择一个二级系列');
          return;
        }
        const statusEl = document.querySelector('#syncStatusOptionsV3 .sync-status-option.selected');
        const status = statusEl ? statusEl.dataset.status : 'on';
        const statusText = status === 'on' ? '已上架' : '未上架';

        const allSeries = (siteSeriesMap[selectedSite] || []).flatMap(c => c.children);
        const selectedSeries = allSeries.filter(s => selectedSeriesIds.has(s.id));
        const seriesNames = selectedSeries.map(s => s.name).join('、');
        const siteName = sites.find(s => s.id === selectedSite)?.name || '';

        // 去重检查：按商品分组，记录每个商品已铺到的系列
        let duplicateItems = [];  // { name, seriesList: ['系列1', '系列2'] }
        let syncNames = [];
        for (const name of names) {
          const existing = existingSyncMap[name] || [];
          const alreadyInSeries = existing.filter(eid => selectedSeriesIds.has(eid));
          if (alreadyInSeries.length > 0) {
            const dupSeries = alreadyInSeries.map(eid => {
              const s = allSeries.find(a => a.id === eid);
              return s ? s.name : eid;
            });
            duplicateItems.push({ name, seriesList });
          } else {
            syncNames.push(name);
          }
        }

        if (duplicateItems.length > 0) {
          const maxShow = 5;
          const needCollapse = duplicateItems.length > maxShow;
          const groupId = 'dupGroup_' + Date.now();
          const collapseId = 'dupCollapse_' + Date.now();

          const buildItem = (d, idx) => {
            const seriesTags = d.seriesList.map(s => `<span class="dup-series-tag">${s}</span>`).join('');
            return `
              <div class="dup-item">
                <span class="dup-item-idx">${idx + 1}</span>
                <span class="dup-item-name">${d.name}</span>
                <span class="dup-item-arrow">→</span>
                <span class="dup-item-series">${seriesTags}</span>
              </div>
            `;
          };

          const visibleItems = duplicateItems.slice(0, maxShow).map((d, i) => buildItem(d, i)).join('');
          const hiddenItems = duplicateItems.slice(maxShow).map((d, i) => buildItem(d, i + maxShow)).join('');

          const confirmHtml = `
            <div class="dup-confirm-body">
              <div class="dup-summary">
                <span class="dup-summary-icon">⚠️</span>
                <span>以下 <b>${duplicateItems.length}</b> 件商品已铺货到当前选中的系列，将<b>跳过</b>：</span>
              </div>
              <div class="dup-item-list" id="${groupId}">
                ${visibleItems}
                ${needCollapse ? `<div id="${collapseId}" class="dup-collapse-content">${hiddenItems}</div>` : ''}
              </div>
              ${needCollapse ? `<div class="dup-expand-btn" onclick="window._toggleDupCollapse('${collapseId}', this)">展开全部 ${duplicateItems.length} 件 ▼</div>` : ''}
              <div class="dup-sync-summary">
                ${syncNames.length > 0
                  ? `<span>✅ 可同步 <b>${syncNames.length}</b> 件新商品到 <b>${siteName}</b>（${statusText}）</span>`
                  : `<span style="color:var(--error)">没有可同步的新商品</span>`
                }
              </div>
            </div>
          `;

          const dupOverlay = document.createElement('div');
          dupOverlay.className = 'dialog-overlay';
          dupOverlay.innerHTML = `
            <div class="dialog dup-dialog">
              <div class="dialog-title">跳过已铺货商品</div>
              <div class="dialog-body">${confirmHtml}</div>
              <div class="dialog-actions">
                <button class="btn btn-secondary" id="btnDupCancel">取消</button>
                ${syncNames.length > 0
                  ? `<button class="btn btn-primary" id="btnDupSkip">跳过重复，同步 ${syncNames.length} 件</button>`
                  : `<button class="btn btn-primary" id="btnDupCancel2">知道了</button>`
                }
              </div>
            </div>
          `;
          dupOverlay.addEventListener('click', function(e) {
            if (e.target === dupOverlay) dupOverlay.remove();
          });
          document.body.appendChild(dupOverlay);

          const closeDup = () => dupOverlay.remove();
          document.getElementById('btnDupCancel').addEventListener('click', closeDup);
          const btnCancel2 = document.getElementById('btnDupCancel2');
          if (btnCancel2) btnCancel2.addEventListener('click', closeDup);

          if (syncNames.length > 0) {
            document.getElementById('btnDupSkip').addEventListener('click', function() {
              dupOverlay.remove();
              document.querySelector('.dialog-overlay').remove();
              for (const name of syncNames) {
                if (!existingSyncMap[name]) existingSyncMap[name] = [];
                for (const sid of selectedSeriesIds) {
                  if (!existingSyncMap[name].includes(sid)) {
                    existingSyncMap[name].push(sid);
                  }
                }
              }
              showToast('success', `已同步 ${syncNames.length} 件商品到 ${siteName} 的 ${seriesNames}（${statusText}），跳过 ${duplicateItems.length} 件已铺货商品`);
            });
          }
          return;
        }

        document.querySelector('.dialog-overlay').remove();
        for (const name of syncNames) {
          if (!existingSyncMap[name]) existingSyncMap[name] = [];
          for (const sid of selectedSeriesIds) {
            if (!existingSyncMap[name].includes(sid)) {
              existingSyncMap[name].push(sid);
            }
          }
        }
        showToast('success', `已同步 ${syncNames.length} 件商品到 ${siteName} 的 ${seriesNames}（${statusText}）`);
      };

      // 折叠/展开切换
      window._toggleDupCollapse = function(collapseId, btn) {
        const el = document.getElementById(collapseId);
        if (!el) return;
        const isOpen = el.classList.toggle('open');
        btn.innerHTML = isOpen ? '收起 ▲' : btn.innerHTML.replace('收起 ▲', '展开全部 ' + (el.querySelectorAll('.dup-group-item').length || '') + ' 个系列 ▼');
      };

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);

      renderSeries();
      updateSelectedSeriesTags();
    }

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

