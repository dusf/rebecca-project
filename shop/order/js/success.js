(function () {
  'use strict';

  function bindCopyOrderNo() {
    var btn = document.getElementById('osCopyOrderNo');
    var valueEl = document.getElementById('osOrderNo');
    if (!btn || !valueEl) return;

    btn.addEventListener('click', function () {
      var text = valueEl.textContent.trim();

      function done() {
        var original = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(function () {
          btn.textContent = original;
        }, 1500);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          done();
        } catch (e) {
          /* 忽略复制失败 */
        }
        document.body.removeChild(ta);
      }
    });
  }

  function bindActions() {
    var viewBtn = document.getElementById('osViewOrderBtn');
    var continueBtn = document.getElementById('osContinueBtn');

    if (viewBtn) {
      viewBtn.addEventListener('click', function () {
        if (typeof window.ShopRouter !== 'undefined') {
          window.ShopRouter.loadPage('account/orders.html');
        } else {
          window.location.hash = '#account/orders';
        }
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', function () {
        if (typeof window.ShopRouter !== 'undefined') {
          window.ShopRouter.loadPage('index.html');
        } else {
          window.location.hash = '#home';
        }
      });
    }

    // 继续探索卡片与"查看全部"通过 data-page 委托跳转
    var container = document.querySelector('.order-success-page');
    if (container && typeof window.ShopRouter !== 'undefined') {
      container.addEventListener('click', function (e) {
        var link = e.target.closest('[data-page]');
        if (link && link.tagName === 'A') {
          e.preventDefault();
          window.ShopRouter.loadPage(link.getAttribute('data-page'));
        }
      });
    }
  }

  function init() {
    bindCopyOrderNo();
    bindActions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
