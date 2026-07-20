// ==================== 父页面 对话框管理器（商城后台） ====================
// 此脚本由 admin/index.html 加载，通过 MutationObserver 监听 iframe 子页面中的
// .dialog-overlay / .confirm-overlay 元素的增删，自动在父页面显示/隐藏全屏遮罩背板，
// 确保遮罩覆盖整个浏览器视口（包括侧边栏和顶栏）。
// 子页面代码无需任何修改。

(function() {
  'use strict';

var iframeContainer = document.querySelector('.iframe-container');
var observer = null;
var backdrop = null;

var WATCH_SELECTORS = '.dialog-overlay, .confirm-overlay';

function getActiveIframe() {
  return document.querySelector('.iframe-container iframe.active') || document.getElementById('contentFrame');
}

function bindIframeEvents(iframe) {
  if (!iframe || iframe._adDialogBound) return;
  iframe._adDialogBound = true;
  iframe.addEventListener('load', function() {
    setTimeout(setupObserver, 100);
  });
}

// 绑定现有 iframe，并监听后续新增的 iframe
var iframes = document.querySelectorAll('.iframe-container iframe');
iframes.forEach(bindIframeEvents);

if (iframeContainer) {
  var containerObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.tagName === 'IFRAME') {
          bindIframeEvents(node);
        }
      });
    });
  });
  containerObserver.observe(iframeContainer, { childList: true });
}

  // ---- 遮罩背板（仅覆盖侧边栏和顶栏，对话框自身的遮罩由子页面 .dialog-overlay 处理） ----
  // Shopify 授权对话框已通过 shopify_dialog.js 在父页面 #dialogHost 中渲染全屏遮罩，
  // 不走此 MutationObserver 路径。
  function showBackdrop() {
    if (backdrop) return;
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }

    backdrop = document.createElement('div');
    backdrop.id = 'adBackdrop';
    var sidebar = document.querySelector('.sidebar');
    var header = document.querySelector('.header');
    var sidebarW = sidebar ? sidebar.offsetWidth : 0;
    var headerH = header ? header.offsetHeight : 0;
    backdrop.style.cssText =
      'position:fixed;top:0;left:0;bottom:0;z-index:9998;background:rgba(0,0,0,0.5);pointer-events:none;' +
      'width:' + sidebarW + 'px;';
    host.appendChild(backdrop);
    if (headerH > 0) {
      var topBar = document.createElement('div');
      topBar.id = 'adBackdropTop';
      topBar.style.cssText =
        'position:fixed;top:0;left:' + sidebarW + 'px;right:0;height:' + headerH + 'px;z-index:9998;' +
        'background:rgba(0,0,0,0.5);pointer-events:none;';
      host.appendChild(topBar);
    }
  }

  function hideBackdrop() {
    if (backdrop) { backdrop.remove(); backdrop = null; }
    var topBar = document.getElementById('adBackdropTop');
    if (topBar) { topBar.remove(); }
  }

  // ---- 检查 iframe 中是否还有可见对话框 ----
  function hasVisibleDialog() {
    var iframe = getActiveIframe();
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return false;
    var dialogs = iframe.contentDocument.body.querySelectorAll(WATCH_SELECTORS);
    for (var i = 0; i < dialogs.length; i++) {
      var d = dialogs[i];
      var style = window.getComputedStyle(d);
      if (style.display !== 'none' && style.visibility !== 'hidden' && d.offsetParent !== null) return true;
    }
    return false;
  }

  // ---- MutationObserver：监听当前 active iframe body 的 DOM 变化 ----
  function setupObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    hideBackdrop();

    var iframe = getActiveIframe();
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return;

    var body = iframe.contentDocument.body;

    function handleMutations(mutations) {
      var added = false, removed = false;

      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];

        // ---- 属性变化：对话框通过 display:none/flex 切换显示/隐藏 ----
        if (m.type === 'attributes') {
          if (matchesSelector(m.target)) {
            var s = window.getComputedStyle(m.target);
            if (s.display !== 'none' && s.visibility !== 'hidden') {
              added = true;
            } else {
              removed = true;
            }
          }
          continue;
        }

        // 检查新增节点
        for (var j = 0; j < m.addedNodes.length; j++) {
          var node = m.addedNodes[j];
          if (node.nodeType === 1) {
            if (matchesSelector(node)) { added = true; break; }
            if (node.querySelectorAll) {
              var inner = node.querySelectorAll(WATCH_SELECTORS);
              if (inner.length > 0) { added = true; break; }
            }
          }
        }

        // 检查移除节点
        for (var k = 0; k < m.removedNodes.length; k++) {
          var rnode = m.removedNodes[k];
          if (rnode.nodeType === 1) {
            if (matchesSelector(rnode)) { removed = true; break; }
            if (rnode.querySelectorAll) {
              var rinner = rnode.querySelectorAll(WATCH_SELECTORS);
              if (rinner.length > 0) { removed = true; break; }
            }
          }
        }
      }

      if (added) showBackdrop();
      if (removed) {
        if (!hasVisibleDialog()) hideBackdrop();
      }
    }

    function matchesSelector(el) {
      if (!el.classList) return false;
      // 检查是否匹配任一 WATCH_SELECTOR
      var sel = el.classList.contains('dialog-overlay') || el.classList.contains('confirm-overlay');
      return sel;
    }

    observer = new MutationObserver(handleMutations);
    observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

    // 初始检查
    if (hasVisibleDialog()) showBackdrop();
  }

  // 对当前 active iframe 立即初始化一次
  setupObserver();

  // 暴露给 loadIframe：切换 active iframe 后重新绑定 observer
  window.adRebindObserver = setupObserver;

  // ---- 导航时关闭（由 loadIframe 调用） ----
  window.adOnNavigate = function() {
    if (observer) { observer.disconnect(); observer = null; }
    hideBackdrop();
  };

  // ---- Escape 键关闭对话框 ----
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (!hasVisibleDialog()) return;
    hideBackdrop();
  });

})();
