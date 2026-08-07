/**
 * NOIRÉ HAIR — 搜索弹层（居中模态对话框）
 * 公共组件，全站复用。由 header.js 初始化时调用 ShopSearch.init()。
 */
(function () {
  'use strict';

  var overlay = null;
  var inputEl = null;
  var rangeCombo = null;
  var recentKey = 'noire_search_recent';

  // 搜索范围选项
  var RANGE_OPTIONS = [
    { value: 'all', label: '全部' },
    { value: 'product', label: '商品' },
    { value: 'article', label: '文章' },
    { value: 'page', label: '页面' }
  ];
  var currentRange = 'all';

  // 热门搜索
  var HOT_KEYWORDS = ['蕾丝假发', '全蕾丝', '发片', '接发', '波波头', '长直发', '大波浪', '男士假发'];

  // 推荐商品（演示数据，后续接真实接口）
  var RECOMMEND_PRODUCTS = [
    { name: '自然黑 13×4 前蕾丝假发', price: '￥1,299', img: 'images/xinpinzhuti.png' },
    { name: '深棕 全蕾丝长卷发', price: '￥1,599', img: 'images/xilie.png' },
    { name: '奶茶棕 波波头假发', price: '￥899', img: 'images/jiafa.png' },
    { name: '亚麻金 大波浪假发', price: '￥1,099', img: 'images/jiefa.png' }
  ];

  // 热门分类
  var HOT_CATS = [
    { key: 'wig', label: '假发' },
    { key: 'closure', label: '发片' },
    { key: 'frontal', label: '发帘' },
    { key: 'extension', label: '接发' },
    { key: 'care', label: '护理' },
    { key: 'tool', label: '工具' },
    { key: 'men', label: '男士' },
    { key: 'kids', label: '儿童' }
  ];

  /* ==================== 初始化 ==================== */
  function init() {
    if (overlay) return; // 已初始化
    buildOverlay();
    bindEvents();
    renderRecent();
  }

  /* ==================== 构建 DOM ==================== */
  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'shop-search-overlay';
    overlay.id = 'shopSearchOverlay';
    overlay.innerHTML = template();
    document.body.appendChild(overlay);

    inputEl = overlay.querySelector('.shop-search-input');
    rangeCombo = overlay.querySelector('.shop-search-range-combo');
  }

  function template() {
    var catsHtml = HOT_CATS.map(function (c) {
      return '<div class="shop-search-cat" data-cat="' + c.key + '">' +
        '<svg class="shop-search-cat-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><circle cx="12" cy="12" r="9"/></svg>' +
        '<span class="shop-search-cat-label">' + c.label + '</span>' +
        '</div>';
    }).join('');

    var productsHtml = RECOMMEND_PRODUCTS.map(function (p) {
      return '<div class="shop-search-product" data-name="' + p.name + '">' +
        '<img class="shop-search-product-img" src="' + p.img + '" alt="">' +
        '<div class="shop-search-product-name">' + p.name + '</div>' +
        '<div class="shop-search-product-price">' + p.price + '</div>' +
        '</div>';
    }).join('');

    var hotHtml = HOT_KEYWORDS.map(function (k) {
      return '<span class="shop-search-tag" data-keyword="' + k + '">' + k + '</span>';
    }).join('');

    return '' +
      '<div class="shop-search-modal" role="dialog" aria-label="搜索">' +
        '<div class="shop-search-top">' +
          '<div class="shop-search-input-wrap">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<input class="shop-search-input" type="text" placeholder="搜索商品、文章、页面...">' +
          '</div>' +
          '<div class="shop-search-range">' +
            '<span class="shop-search-range-label">搜索范围</span>' +
            '<div class="shop-search-range-combo">' +
              '<input class="combo-input" type="text" value="全部" readonly>' +
              '<svg class="combo-arrow" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
              '<div class="combo-menu">' +
                RANGE_OPTIONS.map(function (o, i) {
                  return '<div class="combo-item" data-value="' + o.value + '"><span class="combo-index">' + (i + 1) + '. </span>' + o.label + '</div>';
                }).join('') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button class="shop-search-close" aria-label="关闭"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>' +
        '</div>' +
        '<div class="shop-search-body">' +
          '<div class="shop-search-section" id="shopSearchRecentSection">' +
            '<div class="shop-search-section-title">最近搜索 <button class="shop-search-clear" id="shopSearchClear">清空</button></div>' +
            '<div id="shopSearchRecentList"></div>' +
          '</div>' +
          '<div class="shop-search-section">' +
            '<div class="shop-search-section-title">热门搜索</div>' +
            '<div class="shop-search-tags">' + hotHtml + '</div>' +
          '</div>' +
          '<div class="shop-search-section">' +
            '<div class="shop-search-section-title">为你推荐</div>' +
            '<div class="shop-search-products">' + productsHtml + '</div>' +
          '</div>' +
          '<div class="shop-search-section">' +
            '<div class="shop-search-section-title">热门分类</div>' +
            '<div class="shop-search-cats">' + catsHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ==================== 事件绑定 ==================== */
  function bindEvents() {
    // 点击遮罩（非弹层）关闭
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // 关闭按钮
    overlay.querySelector('.shop-search-close').addEventListener('click', close);

    // 输入框回车搜索
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch(inputEl.value.trim());
    });

    // 范围 combobox
    var comboInput = rangeCombo.querySelector('.combo-input');
    comboInput.addEventListener('click', function () {
      rangeCombo.classList.toggle('open');
    });
    rangeCombo.querySelectorAll('.combo-item').forEach(function (item) {
      item.addEventListener('click', function () {
        currentRange = item.getAttribute('data-value');
        comboInput.value = item.textContent.trim();
        rangeCombo.classList.remove('open');
      });
    });
    // 点击外部收起范围菜单
    document.addEventListener('click', function (e) {
      if (rangeCombo && !rangeCombo.contains(e.target)) {
        rangeCombo.classList.remove('open');
      }
    });

    // 热词
    overlay.querySelectorAll('.shop-search-tag').forEach(function (tag) {
      tag.addEventListener('click', function () {
        inputEl.value = tag.getAttribute('data-keyword');
        doSearch(inputEl.value);
      });
    });

    // 推荐商品
    overlay.querySelectorAll('.shop-search-product').forEach(function (p) {
      p.addEventListener('click', function () {
        doSearch(p.getAttribute('data-name'));
      });
    });

    // 热门分类
    overlay.querySelectorAll('.shop-search-cat').forEach(function (c) {
      c.addEventListener('click', function () {
        inputEl.value = c.querySelector('.shop-search-cat-label').textContent;
        doSearch(inputEl.value);
      });
    });

    // 最近搜索项
    overlay.addEventListener('click', function (e) {
      var item = e.target.closest('.shop-search-recent-item');
      if (item) {
        inputEl.value = item.getAttribute('data-kw');
        doSearch(inputEl.value);
      }
    });

    // 清空最近搜索
    overlay.querySelector('#shopSearchClear').addEventListener('click', function () {
      localStorage.removeItem(recentKey);
      renderRecent();
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  /* ==================== 最近搜索 ==================== */
  function renderRecent() {
    var list = overlay.querySelector('#shopSearchRecentList');
    var section = overlay.querySelector('#shopSearchRecentSection');
    var recent = getRecent();
    if (!recent.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    list.innerHTML = recent.map(function (kw) {
      return '<div class="shop-search-recent-item" data-kw="' + kw + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>' +
        '<span>' + kw + '</span>' +
        '</div>';
    }).join('');
  }

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(recentKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function pushRecent(kw) {
    var recent = getRecent().filter(function (k) { return k !== kw; });
    recent.unshift(kw);
    if (recent.length > 8) recent = recent.slice(0, 8);
    localStorage.setItem(recentKey, JSON.stringify(recent));
  }

  /* ==================== 搜索行为 ==================== */
  function doSearch(keyword) {
    if (!keyword) {
      inputEl.focus();
      return;
    }
    pushRecent(keyword);
    // 后续接真实搜索页/结果页，这里先 console 并关闭弹层
    console.log('[搜索]', { keyword: keyword, range: currentRange });
    close();
    // TODO: 跳转到搜索结果页（如 ?bankuai=search&q=xxx）
  }

  /* ==================== 打开 / 关闭 ==================== */
  function open() {
    if (!overlay) init();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderRecent();
    setTimeout(function () { inputEl && inputEl.focus(); }, 50);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ==================== 暴露接口 ==================== */
  window.ShopSearch = {
    init: init,
    open: open,
    close: close
  };
})();
