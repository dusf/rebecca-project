/**
 * NOIRÉ HAIR — 新品页面逻辑
 * 依赖：ShopI18n (i18n.js)
 */
(function () {
  'use strict';

  var I = window.ShopI18n;
  var currencySymbol = I.getCountryInfo().currencySymbol;

  /* ==================== 数据 ==================== */
  var CATEGORIES = [
    { key: 'na.cat.all', descKey: 'na.cat.allDesc', img: '../images/xilie.png' },
    { key: 'na.cat.wig', descKey: 'na.cat.wigDesc', img: '../images/category-wig.png' },
    { key: 'na.cat.ext', descKey: 'na.cat.extDesc', img: '../images/category-extension.png' },
    { key: 'na.cat.color', descKey: 'na.cat.colorDesc', img: '../images/chocolate-brown.png' },
    { key: 'na.cat.limited', descKey: 'na.cat.limitedDesc', img: '../images/category-topper.png' }
  ];

  var PRODUCTS = [
    {
      nameKey: 'na.prod.w1',
      spec: '22" | 深棕渐变',
      price: 2299,
      rating: 4.8,
      reviews: 1234,
      badge: 'na.badge.new',
      img: '../images/product-1.png'
    },
    {
      nameKey: 'na.prod.w2',
      spec: '24" | 自然黑',
      price: 2199,
      rating: 4.9,
      reviews: 987,
      badge: 'na.badge.new',
      img: '../images/product-2.png'
    },
    {
      nameKey: 'na.prod.w3',
      spec: '20" | 深棕色',
      price: 2299,
      rating: 4.7,
      reviews: 756,
      badge: 'na.badge.limited',
      img: '../images/product-3.png'
    },
    {
      nameKey: 'na.prod.w4',
      spec: '22" | 摩卡奶茶色',
      price: 2399,
      rating: 4.9,
      reviews: 642,
      badge: 'na.badge.new',
      img: '../images/product-4.png'
    },
    {
      nameKey: 'na.prod.w5',
      spec: '24" | 曜石棕染',
      price: 2199,
      rating: 4.8,
      reviews: 532,
      badge: 'na.badge.new',
      img: '../images/product-5.png'
    },
    {
      nameKey: 'na.prod.w6',
      spec: '20" | 自然黑',
      price: 1899,
      rating: 4.7,
      reviews: 421,
      badge: 'na.badge.new',
      img: '../images/product-1.png'
    }
  ];

  var MORE_PRODUCTS = [
    { nameKey: 'na.prod.m1', spec: '22" | 深棕渐变', price: 2299, rating: 4.8, reviews: 312, badge: 'na.badge.new', img: '../images/product-1.png' },
    { nameKey: 'na.prod.m2', spec: '24" | 自然黑', price: 2199, rating: 4.9, reviews: 287, badge: 'na.badge.new', img: '../images/product-2.png' },
    { nameKey: 'na.prod.m3', spec: '20" | 深棕色', price: 2299, rating: 4.7, reviews: 198, badge: 'na.badge.new', img: '../images/product-3.png' },
    { nameKey: 'na.prod.m4', spec: '22" | 摩卡奶茶色', price: 2399, rating: 4.9, reviews: 156, badge: 'na.badge.new', img: '../images/product-4.png' },
    { nameKey: 'na.prod.m5', spec: '24" | 曜石棕染', price: 2199, rating: 4.8, reviews: 134, badge: 'na.badge.new', img: '../images/product-5.png' },
    { nameKey: 'na.prod.m6', spec: '20" | 自然黑', price: 1899, rating: 4.7, reviews: 98, badge: 'na.badge.new', img: '../images/product-1.png' }
  ];

  var TRENDS = [
    { titleKey: 'na.trend.w1', descKey: 'na.trend.w1Desc', img: '../images/hero-model.png' },
    { titleKey: 'na.trend.w2', descKey: 'na.trend.w2Desc', img: '../images/hero-model-2.png' },
    { titleKey: 'na.trend.w3', descKey: 'na.trend.w3Desc', img: '../images/hero-model-3.png' }
  ];

  var CRAFTS = [
    { icon: 'lace', titleKey: 'na.craft.w1', descKey: 'na.craft.w1Desc' },
    { icon: 'cap', titleKey: 'na.craft.w2', descKey: 'na.craft.w2Desc' },
    { icon: 'hair', titleKey: 'na.craft.w3', descKey: 'na.craft.w3Desc' }
  ];

  /* ==================== SVG 图标 ==================== */
  var ICONS = {
    lace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9"/><path d="M3 12h18"/><path d="M3 12c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5"/></svg>',
    hair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M12 12h.01"/></svg>'
  };

  /* ==================== 渲染函数 ==================== */
  function renderStars(rating) {
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    var html = '';
    for (var i = 0; i < full; i++) html += '<span class="na-star">★</span>';
    if (half) html += '<span class="na-star">★</span>';
    for (i = 0; i < empty; i++) html += '<span class="na-star na-star-empty">☆</span>';
    return html;
  }

  function renderProductCard(product, isMore) {
    var badgeClass = product.badge === 'na.badge.limited' ? 'limited' : '';
    var badgeText = I.t(product.badge);
    return '<div class="na-product-card">' +
      '<div class="na-product-img-wrap">' +
        '<img src="' + product.img + '" alt="" class="na-product-img">' +
        '<span class="na-product-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '<button class="na-product-wishlist" aria-label="Add to wishlist">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="na-product-info">' +
        '<h3 class="na-product-name" data-i18n="' + product.nameKey + '">' + I.t(product.nameKey) + '</h3>' +
        '<p class="na-product-spec">' + product.spec + '</p>' +
        '<p class="na-product-price">' + currencySymbol + product.price.toLocaleString() + '</p>' +
        '<div class="na-product-rating">' +
          '<div class="na-stars">' + renderStars(product.rating) + '</div>' +
          '<span class="na-rating-count">(' + product.reviews + ')</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderCategories() {
    var html = CATEGORIES.map(function (cat) {
      return '<a href="#" class="na-cat-card">' +
        '<img src="' + cat.img + '" alt="" class="na-cat-card-img">' +
        '<h3 class="na-cat-card-title" data-i18n="' + cat.key + '">' + I.t(cat.key) + '</h3>' +
        '<p class="na-cat-card-desc" data-i18n="' + cat.descKey + '">' + I.t(cat.descKey) + '</p>' +
        '<span class="na-cat-card-arrow">→</span>' +
      '</a>';
    }).join('');
    document.getElementById('naCatGrid').innerHTML = html;
  }

  function renderProducts() {
    var html = PRODUCTS.map(function (p) {
      return renderProductCard(p);
    }).join('');
    document.getElementById('naProductGrid').innerHTML = html;
  }

  function renderTrends() {
    var html = TRENDS.map(function (t) {
      return '<a href="#" class="na-trend-card">' +
        '<div class="na-trend-content">' +
          '<h3 class="na-trend-title" data-i18n="' + t.titleKey + '">' + I.t(t.titleKey) + '</h3>' +
          '<p class="na-trend-desc" data-i18n="' + t.descKey + '">' + I.t(t.descKey) + '</p>' +
          '<span class="na-trend-link" data-i18n="na.trend.explore">探索更多 →</span>' +
        '</div>' +
        '<img src="' + t.img + '" alt="" class="na-trend-img">' +
      '</a>';
    }).join('');
    document.getElementById('naTrendGrid').innerHTML = html;
  }

  function renderCrafts() {
    var html = CRAFTS.map(function (c) {
      return '<div class="na-craft-card">' +
        '<div class="na-craft-icon">' + (ICONS[c.icon] || '') + '</div>' +
        '<div class="na-craft-content">' +
          '<h3 class="na-craft-title" data-i18n="' + c.titleKey + '">' + I.t(c.titleKey) + '</h3>' +
          '<p class="na-craft-desc" data-i18n="' + c.descKey + '">' + I.t(c.descKey) + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
    document.getElementById('naCraftGrid').innerHTML = html;
  }

  function renderMoreProducts() {
    var html = MORE_PRODUCTS.map(function (p) {
      return '<div class="na-more-item">' + renderProductCard(p, true) + '</div>';
    }).join('');
    document.getElementById('naMoreTrack').innerHTML = html;
  }

  /* ==================== 轮播控制 ==================== */
  var moreTrack = null;
  var morePosition = 0;

  function initMoreCarousel() {
    moreTrack = document.getElementById('naMoreTrack');
    if (!moreTrack) return;

    var prevBtn = document.querySelector('.na-carousel-arrow-prev');
    var nextBtn = document.querySelector('.na-carousel-arrow-next');

    function getVisibleItems() {
      var w = window.innerWidth;
      if (w <= 768) return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    function updatePosition() {
      if (!moreTrack) return;
      var item = moreTrack.querySelector('.na-more-item');
      if (!item) return;
      var itemWidth = item.offsetWidth + 20; // gap
      moreTrack.style.transform = 'translateX(-' + (morePosition * itemWidth) + 'px)';
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (morePosition > 0) {
          morePosition--;
          updatePosition();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var total = MORE_PRODUCTS.length;
        var visible = getVisibleItems();
        var maxPos = total - visible;
        if (morePosition < maxPos) {
          morePosition++;
          updatePosition();
        }
      });
    }
  }

  /* ==================== 订阅表单 ==================== */
  function initSubscribeForm() {
    var form = document.getElementById('naSubscribeForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('.na-subscribe-input');
      if (input && input.value) {
        alert(I.t('na.subscribe.success') || '订阅成功！');
        input.value = '';
      }
    });
  }

  /* ==================== 初始化 ==================== */
  function init() {
    renderCategories();
    renderProducts();
    renderTrends();
    renderCrafts();
    renderMoreProducts();
    initMoreCarousel();
    initSubscribeForm();

    // 监听国家切换
    document.addEventListener('countryChanged', function () {
      currencySymbol = I.getCountryInfo().currencySymbol;
      renderProducts();
      renderMoreProducts();
    });
  }

  // 监听页面加载事件，由 router.js 触发
  document.addEventListener('pageLoaded', function (e) {
    if (e.detail && e.detail.module === 'new-arrivals') {
      init();
    }
  });

  // 如果 router.js 还没加载，直接初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (window.ShopRouter) {
        // router.js 已加载，等待 pageLoaded 事件
      } else {
        // router.js 未加载，直接初始化
        init();
      }
    });
  } else {
    if (window.ShopRouter) {
      // router.js 已加载，等待 pageLoaded 事件
    } else {
      // router.js 未加载，直接初始化
      init();
    }
  }
})();
