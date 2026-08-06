/**
 * shop 公共底部 — 动态渲染
 * 依赖：ShopI18n (i18n.js)
 */
(function () {
  'use strict';

  var I = window.ShopI18n;

  /* ---------- SVG 社交图标 ---------- */
  var SOCIAL = [
    { name: 'Instagram', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' },
    { name: 'TikTok', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>' },
    { name: 'YouTube', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>' },
    { name: 'WeChat', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.406-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/></svg>' },
    { name: 'Pinterest', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.739a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>' }
  ];

  /* ---------- 链接列配置 ---------- */
  var FOOTER_COLS = [
    {
      titleKey: 'footer.shop',
      links: [
        { key: 'footer.shopWigs', href: '#' },
        { key: 'footer.shopExtensions', href: '#' },
        { key: 'footer.shopToppers', href: '#' },
        { key: 'footer.shopNew', href: '#' },
        { key: 'footer.shopBest', href: '#' }
      ]
    },
    {
      titleKey: 'footer.service',
      links: [
        { key: 'footer.serviceHelp', href: '#' },
        { key: 'footer.serviceShipping', href: '#' },
        { key: 'footer.serviceReturns', href: '#' },
        { key: 'footer.servicePayment', href: '#' },
        { key: 'footer.serviceContact', href: '#' }
      ]
    },
    {
      titleKey: 'footer.brand',
      links: [
        { key: 'footer.brandAbout', href: '#' },
        { key: 'footer.brandCraft', href: '#' },
        { key: 'footer.brandSustain', href: '#' },
        { key: 'footer.brandPress', href: '#' },
        { key: 'footer.brandBlog', href: '#' }
      ]
    }
  ];

  function render() {
    var footer = document.getElementById('shopFooter');
    if (!footer) return;

    var colsHtml = FOOTER_COLS.map(function (col) {
      var linksHtml = col.links.map(function (link) {
        return '<li><a href="' + link.href + '" data-i18n="' + link.key + '">' + I.t(link.key) + '</a></li>';
      }).join('');
      return '<div class="shop-footer-col"><h4 data-i18n="' + col.titleKey + '">' + I.t(col.titleKey) + '</h4><ul>' + linksHtml + '</ul></div>';
    }).join('');

    var socialHtml = SOCIAL.map(function (s) {
      return '<a href="#" aria-label="' + s.name + '" title="' + s.name + '">' + s.svg + '</a>';
    }).join('');

    footer.innerHTML =
      '<div class="shop-footer">' +
        '<div class="shop-container">' +
          '<div class="shop-footer-top">' +
            '<div class="shop-footer-brand">' +
              '<a href="index.html" class="shop-logo">NOIRÉ</a>' +
              '<p data-i18n="footer.brandDesc">' + I.t('footer.brandDesc') + '</p>' +
              '<div class="shop-social">' + socialHtml + '</div>' +
            '</div>' +
            colsHtml +
            '<div class="shop-footer-newsletter">' +
              '<h4 data-i18n="footer.newsletter">' + I.t('footer.newsletter') + '</h4>' +
              '<p data-i18n="footer.newsletterDesc">' + I.t('footer.newsletterDesc') + '</p>' +
              '<form class="shop-newsletter-form" onsubmit="event.preventDefault();">' +
                '<input type="email" class="shop-newsletter-input" data-i18n-placeholder="footer.newsletterPlaceholder" placeholder="' + I.t('footer.newsletterPlaceholder') + '">' +
                '<button type="submit" class="shop-newsletter-btn">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
                '</button>' +
              '</form>' +
            '</div>' +
          '</div>' +
          '<div class="shop-footer-bottom">' +
            '<div class="shop-footer-legal">' +
              '<a href="#" data-i18n="footer.privacy">' + I.t('footer.privacy') + '</a>' +
              '<a href="#" data-i18n="footer.terms">' + I.t('footer.terms') + '</a>' +
              '<a href="#" data-i18n="footer.accessibility">' + I.t('footer.accessibility') + '</a>' +
            '</div>' +
            '<div class="shop-footer-copyright" data-i18n="footer.copyright">' + I.t('footer.copyright') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  window.ShopFooter = { render: render };
})();
