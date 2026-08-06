/**
 * shop 公共头部 — 动态渲染 + 交互
 * 依赖：ShopI18n (i18n.js)
 */
(function () {
  'use strict';

  var I = window.ShopI18n;

  /* ---------- SVG 图标 ---------- */
  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };

  /* ---------- 导航配置（一级菜单栏） ---------- */
  var NAV_ITEMS = [
    { key: 'nav.new',        page: '#new' },
    { key: 'nav.wig',        page: '#wig' },
    { key: 'nav.extension',  page: '#extension' },
    { key: 'nav.bestsellers',page: '#bestsellers' },
    { key: 'nav.accessory',  page: '#accessory' },
    { key: 'nav.brand',      page: '#brand' },
    { key: 'nav.help',       page: '#help' }
  ];

  /* ---------- 渲染头部 ---------- */
  function renderHeader(activePage) {
    var header = document.getElementById('shopHeader');
    if (!header) return;

    var currentLocale = I.getLocale();
    var locales = I.getSupported();

    var navHtml = NAV_ITEMS.map(function (item) {
      var isActive = activePage === item.page;
      return '<a href="' + item.page + '" class="shop-nav-link' + (isActive ? ' active' : '') + '" data-i18n="' + item.key + '">' + I.t(item.key) + '</a>';
    }).join('');

    var langOptionsHtml = locales.map(function (loc) {
      return '<button class="shop-locale-option' + (loc === currentLocale ? ' active' : '') + '" data-locale="' + loc + '">' + I.getLocaleName(loc) + '</button>';
    }).join('');

    var mobileNavHtml = NAV_ITEMS.map(function (item) {
      return '<a href="' + item.page + '" class="shop-mobile-nav-link" data-i18n="' + item.key + '">' + I.t(item.key) + '</a>';
    }).join('');

    var mobileLangHtml = locales.map(function (loc) {
      return '<button class="shop-mobile-locale-opt' + (loc === currentLocale ? ' active' : '') + '" data-locale="' + loc + '">' + I.getLocaleName(loc) + '</button>';
    }).join('');

    header.innerHTML =
      '<div class="shop-announcement">' +
        '<button class="shop-announcement-arrow" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
        '<span data-i18n="announcement.text">' + I.t('announcement.text') + '</span>' +
        '<button class="shop-announcement-arrow" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      '</div>' +
      '<div class="shop-header">' +
        '<div class="shop-container shop-header-inner">' +
          '<button class="shop-hamburger" id="shopHamburger" aria-label="Menu">' + ICONS.menu + '</button>' +
          '<a href="index.html" class="shop-logo">NOIRÉ</a>' +
          '<nav class="shop-nav">' + navHtml + '</nav>' +
          '<div class="shop-header-actions">' +
            '<div class="shop-locale-selector">' +
              '<button class="shop-locale-btn" id="shopLocaleBtn">' +
                '<span id="localeCurrentName">' + I.getLocaleName(currentLocale) + '</span>' + ICONS.chevron +
              '</button>' +
              '<div class="shop-locale-dropdown" id="shopLocaleDropdown">' + langOptionsHtml + '</div>' +
            '</div>' +
            '<button class="shop-icon-btn" data-action="search" aria-label="' + I.t('header.search') + '">' + ICONS.search + '</button>' +
            '<button class="shop-icon-btn" data-action="account" aria-label="' + I.t('header.account') + '">' + ICONS.user + '</button>' +
            '<button class="shop-icon-btn" data-action="cart" aria-label="' + I.t('header.cart') + '">' +
              ICONS.bag + '<span class="shop-cart-badge" id="shopCartBadge">0</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="shop-mobile-nav" id="shopMobileNav">' +
        '<div class="shop-mobile-nav-overlay" id="shopMobileNavOverlay"></div>' +
        '<div class="shop-mobile-nav-panel">' +
          '<button class="shop-mobile-nav-close" id="shopMobileNavClose">' + ICONS.close + '</button>' +
          mobileNavHtml +
          '<div class="shop-mobile-locale">' +
            '<div class="shop-mobile-locale-label" data-i18n="header.lang">' + I.t('header.lang') + '</div>' +
            '<div class="shop-mobile-locale-options">' + mobileLangHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    bindEvents();
  }

  /* ---------- 绑定交互 ---------- */
  function bindEvents() {
    // 语言切换下拉
    var localeBtn = document.getElementById('shopLocaleBtn');
    var localeDropdown = document.getElementById('shopLocaleDropdown');
    if (localeBtn && localeDropdown) {
      localeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        localeDropdown.classList.toggle('show');
        localeBtn.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        localeDropdown.classList.remove('show');
        localeBtn.classList.remove('open');
      });
    }

    // 语言选项点击
    document.querySelectorAll('.shop-locale-option, .shop-mobile-locale-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var locale = this.getAttribute('data-locale');
        if (locale) I.setLocale(locale);
      });
    });

    // 移动端导航
    var hamburger = document.getElementById('shopHamburger');
    var mobileNav = document.getElementById('shopMobileNav');
    var mobileNavClose = document.getElementById('shopMobileNavClose');
    var mobileNavOverlay = document.getElementById('shopMobileNavOverlay');

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () { mobileNav.classList.add('open'); });
    }
    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', function () { mobileNav.classList.remove('open'); });
    }
    if (mobileNavOverlay) {
      mobileNavOverlay.addEventListener('click', function () { mobileNav.classList.remove('open'); });
    }
  }

  /* ---------- 导出 ---------- */
  window.ShopHeader = { render: renderHeader };
})();
