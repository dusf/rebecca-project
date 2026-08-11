/**
 * NOIRÉ HAIR — 首页逻辑
 * 依赖：ShopI18n, ShopHeader, ShopFooter
 */
(function () {
  'use strict';

  var I = window.ShopI18n;

  /* ==================== Mock 数据（商家自定义文案，后续从后台 API 获取） ==================== */

  // Hero 轮播 — 使用 i18n key，语言切换时自动翻译
  var HERO_SLIDES = [
    {
      image: 'images/hero-model.png',
      titleKey: 'hero.title',
      subtitleKey: 'hero.subtitle',
      cta1Key: 'hero.cta1',
      cta2Key: 'hero.cta2'
    },
    {
      image: 'images/hero-model-2.png',
      titleKey: 'hero.title2',
      subtitleKey: 'hero.subtitle2',
      cta1Key: 'hero.cta1',
      cta2Key: 'hero.cta2'
    },
    {
      image: 'images/hero-model-3.png',
      titleKey: 'hero.title3',
      subtitleKey: 'hero.subtitle3',
      cta1Key: 'hero.cta1',
      cta2Key: 'hero.cta2'
    }
  ];

  // 分类 — 使用 i18n key，语言切换时自动翻译
  var CATEGORIES = [
    { anchor: 'wig', nameKey: 'categories.wig', descKey: 'categories.wigDesc', image: 'images/category-wig.png', link: '#' },
    { anchor: 'extension', nameKey: 'categories.extension', descKey: 'categories.extensionDesc', image: 'images/category-extension.png', link: '#' },
    { anchor: 'accessory', nameKey: 'categories.topper', descKey: 'categories.topperDesc', image: 'images/category-topper.png', link: '#' }
  ];

  // 产品 — 使用 i18n key，语言切换时自动翻译
  var PRODUCTS = [
    { id: 1, nameKey: 'product.p1Name', specKey: 'product.p1Spec', price: '2,299', rating: 4.5, reviews: 1234, badge: '', image: 'images/1.png' },
    { id: 2, nameKey: 'product.p2Name', specKey: 'product.p2Spec', price: '2,299', rating: 4.8, reviews: 987, badge: '', image: 'images/2.png' },
    { id: 3, nameKey: 'product.p3Name', specKey: 'product.p3Spec', price: '2,299', rating: 4.6, reviews: 756, badge: '', image: 'images/3.png' },
    { id: 4, nameKey: 'product.p4Name', specKey: 'product.p4Spec', price: '2,499', rating: 4.7, reviews: 1102, badge: 'bestsellers.badge', image: 'images/4.png' },
    { id: 5, nameKey: 'product.p5Name', specKey: 'product.p5Spec', price: '2,299', rating: 4.4, reviews: 642, badge: '', image: 'images/5.png' },
    { id: 6, nameKey: 'product.p6Name', specKey: 'product.p6Spec', price: '1,899', rating: 4.3, reviews: 534, badge: '', image: 'images/product-1.png' },
    { id: 7, nameKey: 'product.p7Name', specKey: 'product.p7Spec', price: '2,699', rating: 4.9, reviews: 876, badge: '', image: 'images/product-2.png' },
    { id: 8, nameKey: 'product.p8Name', specKey: 'product.p8Spec', price: '1,999', rating: 4.5, reviews: 445, badge: '', image: 'images/product-3.png' }
  ];

  // 发色发质 — 图片卡片
  var TEXTURES = [
    { nameKey: 'textures.straight', image: 'images/straight.png' },
    { nameKey: 'textures.deepWave', image: 'images/deep-wave.png' },
    { nameKey: 'textures.looseWave', image: 'images/loose-wave.png' },
    { nameKey: 'textures.deepCurl', image: 'images/deep-curl.png' },
    { nameKey: 'textures.curly', image: 'images/curly.png' },
    { nameKey: 'textures.bodyWave', image: 'images/body-wave.png' },
    { nameKey: 'textures.naturalBrown', image: 'images/natural-brown.png' },
    { nameKey: 'textures.chocolateBrown', image: 'images/chocolate-brown.png' },
    { nameKey: 'textures.honeyTea', image: 'images/honey-tea.png' },
    { nameKey: 'textures.highlightGold', image: 'images/highlight-gold.png' }
  ];

  /* ==================== 渲染 Hero 轮播 ==================== */
  var heroCurrentIndex = 0;
  var heroTotalSlides = HERO_SLIDES.length;

  function renderHero() {
    var heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    var slidesHtml = HERO_SLIDES.map(function (slide, i) {
      var activeClass = i === 0 ? ' active' : '';
      return '<div class="hero-slide' + activeClass + '" data-index="' + i + '">' +
        '<div class="hero-content">' +
          '<h1 class="hero-title" data-i18n="' + slide.titleKey + '">' + I.t(slide.titleKey) + '</h1>' +
          '<p class="hero-subtitle" data-i18n="' + slide.subtitleKey + '">' + I.t(slide.subtitleKey) + '</p>' +
          '<div class="hero-actions">' +
            '<a href="#" class="shop-btn shop-btn-primary" data-i18n="' + slide.cta1Key + '">' + I.t(slide.cta1Key) + '</a>' +
            '<a href="#" class="shop-btn shop-btn-outline" data-i18n="' + slide.cta2Key + '">' + I.t(slide.cta2Key) + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-image">' +
          '<div class="hero-image-bg" style="background-image: url(\'' + slide.image + '\');"></div>' +
        '</div>' +
      '</div>';
    }).join('');

    var dotsHtml = HERO_SLIDES.map(function (_, i) {
      return '<button class="hero-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Slide ' + (i + 1) + '"></button>';
    }).join('');

    heroSection.innerHTML =
      '<div class="shop-container">' +
        '<div class="hero-carousel">' +
          slidesHtml +
          '<button class="hero-nav hero-nav-prev" aria-label="Previous slide">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
          '</button>' +
          '<button class="hero-nav hero-nav-next" aria-label="Next slide">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
          '</button>' +
          '<div class="hero-dots">' + dotsHtml + '</div>' +
        '</div>' +
      '</div>';

    bindHeroCarousel();
  }

  function bindHeroCarousel() {
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dot');
    var prevBtn = document.querySelector('.hero-nav-prev');
    var nextBtn = document.querySelector('.hero-nav-next');

    function goToSlide(index) {
      if (index < 0) index = heroTotalSlides - 1;
      if (index >= heroTotalSlides) index = 0;

      slides[heroCurrentIndex].classList.remove('active');
      dots[heroCurrentIndex].classList.remove('active');

      heroCurrentIndex = index;

      slides[heroCurrentIndex].classList.add('active');
      dots[heroCurrentIndex].classList.add('active');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(heroCurrentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(heroCurrentIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToSlide(parseInt(this.getAttribute('data-index'), 10));
      });
    });
  }

  /* ==================== 渲染分类卡片 ==================== */
  function renderCategories() {
    var grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES.map(function (cat) {
      return '<a href="' + cat.link + '" class="category-card" id="' + cat.anchor + '">' +
        '<div class="category-card-text">' +
          '<h3 data-i18n="' + cat.nameKey + '">' + I.t(cat.nameKey) + '</h3>' +
          '<p data-i18n="' + cat.descKey + '">' + I.t(cat.descKey) + '</p>' +
          '<span class="category-card-link">' +
            '<span data-i18n="categories.cta">' + I.t('categories.cta') + '</span>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
          '</span>' +
        '</div>' +
        '<div class="category-card-image"><img src="' + cat.image + '" alt="' + I.t(cat.nameKey) + '"></div>' +
      '</a>';
    }).join('');
  }

  /* ==================== 渲染产品卡片 ==================== */
  function renderStars(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      var cls = i <= Math.round(rating) ? '' : ' class="empty"';
      html += '<svg' + cls + ' viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    return html;
  }

  function renderProducts() {
    var track = document.getElementById('productTrack');
    if (!track) return;

    var countryInfo = I.getCountryInfo();
    var currencySymbol = countryInfo.currencySymbol;

    track.innerHTML = PRODUCTS.map(function (p) {
      var badgeHtml = p.badge
        ? '<span class="product-badge" data-i18n="' + p.badge + '">' + I.t(p.badge) + '</span>'
        : '';
      return '<div class="product-card" data-id="' + p.id + '" data-page="product/detail.html?id=' + p.id + '">' +
        '<div class="product-card-image">' +
          '<img src="' + p.image + '" alt="' + I.t(p.nameKey) + '">' +
          badgeHtml +
          '<button class="product-wishlist" aria-label="Wishlist">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="product-card-body">' +
          '<h3 data-i18n="' + p.nameKey + '">' + I.t(p.nameKey) + '</h3>' +
          '<div class="product-card-specs" data-i18n="' + p.specKey + '">' + I.t(p.specKey) + '</div>' +
          '<div class="product-card-price">' + currencySymbol + p.price + '</div>' +
          '<div class="product-card-rating">' +
            '<div class="product-stars">' + renderStars(p.rating) + '</div>' +
            '<span class="product-reviews">(' + p.reviews.toLocaleString() + ')</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // 收藏按钮
    track.querySelectorAll('.product-wishlist').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.toggle('wished');
      });
    });

    // 商品卡片点击进入详情页
    track.querySelectorAll('.product-card').forEach(function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function (e) {
        if (e.target.closest('.product-wishlist')) return;
        var page = card.getAttribute('data-page');
        if (page && window.ShopRouter && window.ShopRouter.loadPage) {
          window.ShopRouter.loadPage(page);
        }
      });
    });
  }

  /* ==================== 渲染发色样条 ==================== */
  function renderTextures() {
    var container = document.getElementById('textureSwatches');
    if (!container) return;

    container.innerHTML = TEXTURES.map(function (t, i) {
      return '<div class="texture-swatch' + (i === 0 ? ' active' : '') + '" data-index="' + i + '">' +
        '<div class="texture-swatch-image"><img src="' + encodeURI(t.image) + '" alt="' + I.t(t.nameKey) + '"></div>' +
        '<div class="texture-swatch-name" data-i18n="' + t.nameKey + '">' + I.t(t.nameKey) + '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.texture-swatch').forEach(function (el) {
      el.addEventListener('click', function () {
        container.querySelectorAll('.texture-swatch').forEach(function (s) { s.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

  /* ==================== 轮播箭头 ==================== */
  function bindCarousel() {
    var track = document.getElementById('productTrack');
    var prev = document.getElementById('carouselPrev');
    var next = document.getElementById('carouselNext');
    if (!track || !prev || !next) return;

    var cardWidth = function () {
      var card = track.querySelector('.product-card');
      return card ? card.offsetWidth + 20 : 220;
    };

    prev.addEventListener('click', function () {
      track.scrollBy({ left: -cardWidth() * 2, behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: cardWidth() * 2, behavior: 'smooth' });
    });
  }

  /* ==================== 国家切换后重新渲染动态内容 ==================== */
  function onCountryChanged(e) {
    var country = e.detail.country;
    var locale = e.detail.locale;
    var countryCode = e.detail.countryCode;
    // 直接更新语言，不触发递归
    I.applyAll();
    renderHero();
    renderCategories();
    renderProducts();
    renderTextures();
    // 更新页面标题
    document.title = I.t('page.title');
    // 更新国家选择器显示
    var countryBtn = document.getElementById('shopCountryBtn');
    if (countryBtn) {
      var flagSpan = countryBtn.querySelector('.shop-country-btn-flag');
      var nameSpan = document.getElementById('countryCurrentName');
      if (flagSpan) flagSpan.textContent = country.flag;
      if (nameSpan) nameSpan.textContent = country.name;
    }
    // 更新国家下拉选项的 active 状态
    document.querySelectorAll('.shop-country-option').forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-country') === countryCode);
    });
    document.querySelectorAll('.shop-mobile-country-opt').forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-country') === countryCode);
    });
  }

  /* ==================== 初始化 ==================== */
  function init() {
    ShopHeader.render('index.html');
    ShopFooter.render();
    document.title = I.t('page.title');
    renderHero();
    renderCategories();
    renderProducts();
    renderTextures();
    bindCarousel();
    I.applyAll();
    document.addEventListener('countryChanged', onCountryChanged);
  }

  // 监听页面加载事件，由 router.js 触发
  document.addEventListener('pageLoaded', function (e) {
    if (e.detail && e.detail.module === 'index') {
      init();
    }
  });

  // 如果 router.js 还没加载，直接初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // 等待 router.js 加载完成
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
