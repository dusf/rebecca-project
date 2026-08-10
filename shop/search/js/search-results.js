/**
 * NOIRÉ HAIR — 搜索结果页逻辑
 */
(function () {
  'use strict';

  var state = {
    keyword: '',
    scope: 'all',
    sort: 'recommend',
    filters: {},
    page: 1,
    pageSize: 12,
    allProducts: []
  };

  // 演示数据：24 条商品
  var MOCK_PRODUCTS = [
    { id: 1, name: 'HD蕾丝大波浪假发 22英寸', spec: '22英寸 | 自然黑 | HD蕾丝', price: 2299, sales: 1234, rating: 5, isNew: true, image: 'images/m1.png', type: 'hd', texture: 'body-wave', length: '20-24', color: 'natural-black', craft: 'hd-lace' },
    { id: 2, name: '奢华深波浪全蕾丝假发 22英寸', spec: '22英寸 | 自然黑 | 手工钩织', price: 2499, sales: 987, rating: 5, isHot: true, image: 'images/m2.png', type: 'full-lace', texture: 'deep-wave', length: '20-24', color: 'natural-black', craft: 'handmade' },
    { id: 3, name: '自然黑大波浪 Closure 假发 20英寸', spec: '20英寸 | 自然黑 | 预拔发际线', price: 1999, sales: 756, rating: 4, isNew: true, image: 'images/m3.png', type: 'closure', texture: 'body-wave', length: '20-24', color: 'natural-black', craft: 'pre-plucked' },
    { id: 4, name: '蜂蜜棕蕾丝前额假发 22英寸', spec: '22英寸 | 蜂蜜棕 | 预拔发际线', price: 2399, sales: 642, rating: 5, image: 'images/m4.png', type: 'frontal', texture: 'body-wave', length: '20-24', color: 'honey', craft: 'pre-plucked' },
    { id: 5, name: '无胶大波浪真人发假发 24英寸', spec: '24英寸 | 自然黑 | 预拔发际线', price: 2799, sales: 1102, rating: 5, isHot: true, image: 'images/m5.png', type: 'glueless', texture: 'body-wave', length: '20-24', color: 'natural-black', craft: 'pre-plucked' },
    { id: 6, name: '深棕色大波浪 HD 假发 22英寸', spec: '22英寸 | 深棕色 | HD蕾丝', price: 2199, sales: 534, rating: 4, image: 'images/m6.png', type: 'hd', texture: 'body-wave', length: '20-24', color: 'dark-brown', craft: 'hd-lace' },
    { id: 7, name: 'HD 蕾丝大波浪假发 20英寸', spec: '20英寸 | 自然黑 | HD蕾丝', price: 2299, sales: 1008, rating: 5, isNew: true, image: 'images/m7.png', type: 'hd', texture: 'body-wave', length: '20-24', color: 'natural-black', craft: 'hd-lace' },
    { id: 8, name: '巧克力棕大波浪 Closure 假发 22英寸', spec: '22英寸 | 巧克力棕 | 手工钩织', price: 2299, sales: 689, rating: 4, image: 'images/m8.png', type: 'closure', texture: 'body-wave', length: '20-24', color: 'chocolate', craft: 'handmade' },
    { id: 9, name: '金色长直发全蕾丝假发 24英寸', spec: '24英寸 | 金色 | 预拔发际线', price: 2099, sales: 445, rating: 4, image: 'images/xinpinzhuti.png', type: 'full-lace', texture: 'straight', length: '20-24', color: 'golden', craft: 'pre-plucked' },
    { id: 10, name: '挑染色水波纹蕾丝前额 22英寸', spec: '22英寸 | 挑染色 | HD蕾丝', price: 2599, sales: 312, rating: 5, image: 'images/xilie.png', type: 'frontal', texture: 'water-wave', length: '20-24', color: 'ombre', craft: 'hd-lace' },
    { id: 11, name: '自然卷短发波波头 12英寸', spec: '12英寸 | 自然黑 | 预拔发际线', price: 1299, sales: 289, rating: 4, image: 'images/category-wig.png', type: 'closure', texture: 'natural-curl', length: '8-12', color: 'natural-black', craft: 'pre-plucked' },
    { id: 12, name: '深波浪 HD 假发 14英寸', spec: '14英寸 | 深棕色 | HD蕾丝', price: 1599, sales: 678, rating: 5, isHot: true, image: 'images/category-extension.png', type: 'hd', texture: 'deep-wave', length: '14-18', color: 'dark-brown', craft: 'hd-lace' },
    { id: 13, name: '无胶直发假发 18英寸', spec: '18英寸 | 自然黑 | 手工钩织', price: 1899, sales: 521, rating: 4, image: 'images/category-topper.png', type: 'glueless', texture: 'straight', length: '14-18', color: 'natural-black', craft: 'handmade' },
    { id: 14, name: '全蕾丝长卷发 26英寸', spec: '26英寸 | 巧克力棕 | 手工钩织', price: 3199, sales: 233, rating: 5, image: 'images/hero-model.png', type: 'full-lace', texture: 'loose-wave', length: '20-24', color: 'chocolate', craft: 'handmade' },
    { id: 15, name: 'Closure 深波浪假发 20英寸', spec: '20英寸 | 蜂蜜棕 | 预拔发际线', price: 1999, sales: 412, rating: 4, image: 'images/hero-model-2.png', type: 'closure', texture: 'deep-wave', length: '20-24', color: 'honey', craft: 'pre-plucked' },
    { id: 16, name: 'HD 蕾丝前额头套 24英寸', spec: '24英寸 | 自然黑 | HD蕾丝', price: 2699, sales: 876, rating: 5, isHot: true, image: 'images/hero-model-3.png', type: 'frontal', texture: 'body-wave', length: '20-24', color: 'natural-black', craft: 'hd-lace' },
    { id: 17, name: '35英寸超长直发全蕾丝假发', spec: '36英寸 | 自然黑 | 手工钩织', price: 3599, sales: 156, rating: 5, image: 'images/jiafa.png', type: 'full-lace', texture: 'straight', length: '35', color: 'natural-black', craft: 'handmade' },
    { id: 18, name: '32英寸大波浪 HD 假发', spec: '32英寸 | 深棕色 | 预拔发际线', price: 2899, sales: 198, rating: 4, image: 'images/jiefa.png', type: 'hd', texture: 'body-wave', length: '32', color: 'dark-brown', craft: 'pre-plucked' },
    { id: 19, name: '金色大波浪 Closure 假发 22英寸', spec: '22英寸 | 金色 | 预拔发际线', price: 2399, sales: 367, rating: 4, image: 'images/chocolate-brown.png', type: 'closure', texture: 'body-wave', length: '20-24', color: 'golden', craft: 'pre-plucked' },
    { id: 20, name: '巧克力棕水波纹蕾丝前额 20英寸', spec: '20英寸 | 巧克力棕 | HD蕾丝', price: 2199, sales: 298, rating: 5, image: 'images/pinpai.png', type: 'frontal', texture: 'water-wave', length: '20-24', color: 'chocolate', craft: 'hd-lace' },
    { id: 21, name: '自然黑松散波浪无胶假发 18英寸', spec: '18英寸 | 自然黑 | 预拔发际线', price: 1799, sales: 543, rating: 4, image: 'images/peijian.png', type: 'glueless', texture: 'loose-wave', length: '14-18', color: 'natural-black', craft: 'pre-plucked' },
    { id: 22, name: '蜂蜜棕长直发全蕾丝假发 24英寸', spec: '24英寸 | 蜂蜜棕 | 手工钩织', price: 2099, sales: 478, rating: 5, image: 'images/xinpinzhuti.png', type: 'full-lace', texture: 'straight', length: '20-24', color: 'honey', craft: 'handmade' },
    { id: 23, name: '挑染色深波浪 HD 假发 22英寸', spec: '22英寸 | 挑染色 | HD蕾丝', price: 2699, sales: 215, rating: 5, image: 'images/xilie.png', type: 'hd', texture: 'deep-wave', length: '20-24', color: 'ombre', craft: 'hd-lace' },
    { id: 24, name: '黑色短发波波头 10英寸', spec: '10英寸 | 自然黑 | 预拔发际线', price: 999, sales: 892, rating: 4, isHot: true, image: 'images/category-wig.png', type: 'closure', texture: 'straight', length: '8-12', color: 'natural-black', craft: 'pre-plucked' }
  ];

  // 价格区间默认值
  var PRICE_MIN = 0;
  var PRICE_MAX = 6999;

  // 筛选显示名
  var FILTER_LABELS = {
    type: { hd: 'HD蕾丝假发', glueless: '无胶假发', closure: 'Closure假发', frontal: '蕾丝前额头套', 'full-lace': '全蕾丝假发' },
    texture: { straight: '直发', 'deep-wave': '深波浪', 'body-wave': '大波浪', 'loose-wave': '松散波浪', 'water-wave': '水波纹', 'natural-curl': '自然卷' },
    length: { '8-12': '8-12英寸', '14-18': '14-18英寸', '20-24': '20-24英寸', '32': '32英寸以上', '35': '35英寸以上' },
    color: { 'natural-black': '自然黑', 'dark-brown': '深棕色', chocolate: '巧克力棕', honey: '蜂蜜棕', golden: '金色', ombre: '挑染色' },
    craft: { 'pre-plucked': '预拔发际线', 'hd-lace': 'HD蕾丝', handmade: '手工钩织' },
    other: { 'in-stock': '仅看有货' }
  };

  // 相关搜索
  var RELATED_KEYWORDS = ['HD蕾丝假发', '深波浪假发', '24英寸假发', '大波浪假发'];

  function init() {
    readUrlParams();
    state.allProducts = MOCK_PRODUCTS.slice();
    bindEvents();
    renderAll();
  }

  // 读取 URL 中的 bankuai/search 参数
  function readUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || params.get('search') || '';
    state.keyword = decodeURIComponent(q);
  }

  function bindEvents() {
    // 搜索框
    var keywordInput = document.getElementById('srKeyword');
    var searchBtn = document.getElementById('srSearchBtn');
    if (keywordInput) {
      keywordInput.value = state.keyword;
      keywordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          state.keyword = keywordInput.value.trim();
          state.page = 1;
          updateUrl();
          renderAll();
        }
      });
    }
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        state.keyword = keywordInput.value.trim();
        state.page = 1;
        updateUrl();
        renderAll();
      });
    }

    // 相关搜索
    document.getElementById('srRelated').addEventListener('click', function (e) {
      var tag = e.target.closest('.tag');
      if (!tag) return;
      state.keyword = tag.textContent;
      keywordInput.value = state.keyword;
      state.page = 1;
      updateUrl();
      renderAll();
    });

    // 搜索范围 tabs
    document.getElementById('srScopeTabs').addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      document.querySelectorAll('#srScopeTabs .tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.scope = tab.getAttribute('data-scope');
      state.page = 1;
      renderAll();
    });

    // 左侧筛选折叠/展开
    document.getElementById('srFilters').addEventListener('click', function (e) {
      var title = e.target.closest('.filter-title');
      if (title) {
        var block = title.parentElement;
        block.classList.toggle('collapsed');
      }
    });

    // 复选框筛选
    document.getElementById('srFilters').addEventListener('change', function (e) {
      var cb = e.target.closest('input[type="checkbox"][data-filter]');
      if (!cb) return;
      var group = cb.getAttribute('data-filter');
      var val = cb.value;
      if (!state.filters[group]) state.filters[group] = [];
      if (cb.checked) {
        if (state.filters[group].indexOf(val) === -1) state.filters[group].push(val);
      } else {
        state.filters[group] = state.filters[group].filter(function (v) { return v !== val; });
      }
      state.page = 1;
      renderAll();
    });

    // 颜色单选（同一组只能选一个）
    document.getElementById('srFilters').addEventListener('click', function (e) {
      var opt = e.target.closest('.color-option');
      if (!opt) return;
      var color = opt.getAttribute('data-color');
      document.querySelectorAll('.color-option').forEach(function (o) { o.classList.remove('selected'); });
      if (state.filters.color && state.filters.color[0] === color) {
        delete state.filters.color;
      } else {
        opt.classList.add('selected');
        state.filters.color = [color];
      }
      state.page = 1;
      renderAll();
    });

    // 清除全部筛选
    document.getElementById('srClearAll').addEventListener('click', clearAllFilters);
    document.getElementById('srClearTags').addEventListener('click', clearAllFilters);

    // 已选条件标签删除
    document.getElementById('srFilterTags').addEventListener('click', function (e) {
      var del = e.target.closest('button[data-group][data-val]');
      if (!del) return;
      var group = del.getAttribute('data-group');
      var val = del.getAttribute('data-val');
      removeFilter(group, val);
    });

    // 排序
    document.querySelectorAll('.sort-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.sort-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.sort = btn.getAttribute('data-sort');
        state.page = 1;
        renderAll();
      });
    });

    // 价格滑块
    var minInput = document.getElementById('srPriceMin');
    var maxInput = document.getElementById('srPriceMax');
    function onPriceChange() {
      var min = parseInt(minInput.value, 10);
      var max = parseInt(maxInput.value, 10);
      if (min > max) {
        var tmp = min; min = max; max = tmp;
      }
      state.priceMin = min;
      state.priceMax = max;
      document.getElementById('srPriceMinLabel').textContent = '¥' + min.toLocaleString();
      document.getElementById('srPriceMaxLabel').textContent = '¥' + max.toLocaleString() + '+';
      state.page = 1;
      renderAll();
    }
    minInput.addEventListener('input', onPriceChange);
    maxInput.addEventListener('input', onPriceChange);
  }

  function clearAllFilters() {
    state.filters = {};
    state.priceMin = PRICE_MIN;
    state.priceMax = PRICE_MAX;
    document.querySelectorAll('#srFilters input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
    document.querySelectorAll('.color-option').forEach(function (o) { o.classList.remove('selected'); });
    document.getElementById('srPriceMin').value = PRICE_MIN;
    document.getElementById('srPriceMax').value = PRICE_MAX;
    document.getElementById('srPriceMinLabel').textContent = '¥' + PRICE_MIN.toLocaleString();
    document.getElementById('srPriceMaxLabel').textContent = '¥' + PRICE_MAX.toLocaleString() + '+';
    state.page = 1;
    renderAll();
  }

  function removeFilter(group, val) {
    if (!state.filters[group]) return;
    state.filters[group] = state.filters[group].filter(function (v) { return v !== val; });
    if (state.filters[group].length === 0) delete state.filters[group];
    // 同步 UI
    if (group === 'color') {
      document.querySelectorAll('.color-option').forEach(function (o) { o.classList.remove('selected'); });
    } else {
      var cb = document.querySelector('input[data-filter="' + group + '"][value="' + val + '"]');
      if (cb) cb.checked = false;
    }
    state.page = 1;
    renderAll();
  }

  function updateUrl() {
    var params = new URLSearchParams(window.location.search);
    params.set('bankuai', 'search');
    if (state.keyword) params.set('q', state.keyword);
    else params.delete('q');
    var newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
  }

  // 通用过滤：关键词 + 左侧筛选 + 价格（不含范围 scope）
  function applyBaseFilters() {
    var list = state.allProducts.slice();

    // 关键词匹配
    var kw = state.keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter(function (p) {
        return p.name.toLowerCase().indexOf(kw) !== -1 ||
               p.spec.toLowerCase().indexOf(kw) !== -1;
      });
    }

    // 筛选
    for (var group in state.filters) {
      var vals = state.filters[group];
      if (!vals || !vals.length) continue;
      list = list.filter(function (p) {
        return vals.indexOf(p[group]) !== -1;
      });
    }

    // 价格
    var min = state.priceMin != null ? state.priceMin : PRICE_MIN;
    var max = state.priceMax != null ? state.priceMax : PRICE_MAX;
    list = list.filter(function (p) { return p.price >= min && p.price <= max; });

    return list;
  }

  // 按范围分类统计（基于通用过滤结果，便于各 tab 显示数量）
  function matchScope(p, scope) {
    if (scope === 'all') return true;
    if (scope === 'wig') return p.type !== 'tool';
    if (scope === 'extension') return p.type === 'closure' || p.type === 'frontal';
    if (scope === 'accessory') return p.type === 'tool';
    return true;
  }

  function computeScopeCounts() {
    var base = applyBaseFilters();
    var counts = { all: base.length, wig: 0, extension: 0, accessory: 0 };
    base.forEach(function (p) {
      if (matchScope(p, 'wig')) counts.wig++;
      if (matchScope(p, 'extension')) counts.extension++;
      if (matchScope(p, 'accessory')) counts.accessory++;
    });
    return counts;
  }

  function getFilteredProducts() {
    var list = applyBaseFilters();

    // 搜索范围
    if (state.scope !== 'all') {
      list = list.filter(function (p) { return matchScope(p, state.scope); });
    }

    // 排序
    if (state.sort === 'price-asc') {
      list.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === 'sales') {
      list.sort(function (a, b) { return b.sales - a.sales; });
    } else if (state.sort === 'new') {
      list.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); });
    }
    // recommend 保持默认顺序

    return list;
  }

  function renderAll() {
    try {
      var filtered = getFilteredProducts();
      renderResultCount(filtered.length);
      renderScopeCounts();
      renderRelated();
      renderActiveFilters();
      renderGrid(filtered);
      renderPagination(filtered.length);
    } catch (err) {
      console.error('[search-results] renderAll error:', err);
    }
  }

  function renderScopeCounts() {
    var counts = computeScopeCounts();
    document.querySelectorAll('#srScopeTabs .tab-count').forEach(function (el) {
      var scope = el.getAttribute('data-count');
      el.textContent = counts[scope] != null ? counts[scope] : 0;
    });
  }

  function renderResultCount(total) {
    document.getElementById('srCount').textContent = '找到 ' + total + ' 件相关商品';
  }

  function renderRelated() {
    var wrap = document.getElementById('srRelatedWrap');
    var container = document.getElementById('srRelated');
    container.innerHTML = RELATED_KEYWORDS.map(function (k) {
      return '<span class="tag">' + k + '</span>';
    }).join('');
    wrap.style.display = 'flex';
  }

  function renderActiveFilters() {
    var wrap = document.getElementById('srActiveFilters');
    var container = document.getElementById('srFilterTags');
    var tags = [];
    for (var group in state.filters) {
      var vals = state.filters[group];
      if (!vals) continue;
      vals.forEach(function (val) {
        var label = FILTER_LABELS[group] && FILTER_LABELS[group][val] ? FILTER_LABELS[group][val] : val;
        tags.push('<span class="filter-tag">' + label + '<button data-group="' + group + '" data-val="' + val + '">×</button></span>');
      });
    }
    if (state.priceMin > PRICE_MIN || state.priceMax < PRICE_MAX) {
      var priceLabel = '¥' + state.priceMin.toLocaleString() + ' - ¥' + state.priceMax.toLocaleString();
      tags.push('<span class="filter-tag">' + priceLabel + '<button data-group="price" data-val="price">×</button></span>');
    }
    container.innerHTML = tags.join('');
    wrap.style.display = tags.length ? 'flex' : 'none';
  }

  function renderGrid(products) {
    var container = document.getElementById('srGrid');
    var empty = document.getElementById('srEmptyState');
    var pagination = document.getElementById('srPagination');
    if (!products.length) {
      container.style.display = 'none';
      if (pagination) pagination.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }
    container.style.display = '';
    if (pagination) pagination.style.display = '';
    if (empty) empty.style.display = 'none';
    var start = (state.page - 1) * state.pageSize;
    var pageProducts = products.slice(start, start + state.pageSize);
    container.innerHTML = pageProducts.map(function (p) {
      var badge = '';
      if (p.isNew) badge = '<span class="product-badge">新品</span>';
      else if (p.isHot) badge = '<span class="product-badge">热销</span>';
      var stars = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating);
      return '' +
        '<div class="product-card" data-id="' + p.id + '">' +
          '<div class="product-thumb">' +
            badge +
            '<img src="' + p.image + '" alt="' + p.name + '">' +
            '<button type="button" class="wish-btn" title="收藏">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="product-info">' +
            '<h3 class="product-name">' + p.name + '</h3>' +
            '<div class="product-meta">' + p.spec + '</div>' +
            '<div class="product-price">￥' + p.price.toLocaleString() + '</div>' +
            '<div class="product-rating"><span class="stars">' + stars + '</span><span>(' + p.sales.toLocaleString() + ')</span></div>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  function renderPagination(total) {
    var container = document.getElementById('srPagination');
    var totalPages = Math.ceil(total / state.pageSize);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }
    var html = '';
    html += '<button ' + (state.page === 1 ? 'disabled' : '') + ' data-page="prev">‹</button>';
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="' + (i === state.page ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    html += '<button ' + (state.page === totalPages ? 'disabled' : '') + ' data-page="next">›</button>';
    container.innerHTML = html;

    // 绑定分页事件
    container.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-page');
        if (action === 'prev') {
          if (state.page > 1) state.page--;
        } else if (action === 'next') {
          if (state.page < totalPages) state.page++;
        } else {
          state.page = parseInt(action, 10);
        }
        renderGrid(getFilteredProducts());
        renderPagination(total);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
