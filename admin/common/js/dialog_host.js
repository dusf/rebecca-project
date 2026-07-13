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
var dialogIframe = null;           // 当前打开对话框所在的 iframe
var savedIframeZIndex = '';        // 保存 iframe 原始 z-index
var savedIframePosition = '';      // 保存 iframe 原始 position
var savedIframeTop = '';           // 保存 iframe 原始 top
var savedIframeLeft = '';          // 保存 iframe 原始 left
var savedIframeWidth = '';         // 保存 iframe 原始 width
var savedIframeHeight = '';        // 保存 iframe 原始 height

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

  // ---- 全屏遮罩背板 + iframe 全视口扩展 ----
  // 将当前 iframe 扩展到全屏，使子页面中的 .dialog-overlay（position:fixed）
  // 能真正覆盖整个浏览器视口，对话框居中显示。
  // 同时创建全屏遮罩背板覆盖侧边栏和顶栏区域。
  function showBackdrop() {
    if (backdrop) return;
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }

    // 全屏遮罩背板 — 覆盖整个视口（含侧边栏和顶栏）
    backdrop = document.createElement('div');
    backdrop.id = 'adBackdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.5);pointer-events:none;';
    host.appendChild(backdrop);

    // 将当前 active iframe 铺满视口，使子页面对话框能覆盖整个浏览器窗口
    dialogIframe = getActiveIframe();
    if (dialogIframe) {
      savedIframeZIndex    = dialogIframe.style.zIndex;
      savedIframePosition  = dialogIframe.style.position;
      savedIframeTop       = dialogIframe.style.top;
      savedIframeLeft      = dialogIframe.style.left;
      savedIframeWidth     = dialogIframe.style.width;
      savedIframeHeight    = dialogIframe.style.height;
      dialogIframe.style.position = 'fixed';
      dialogIframe.style.top      = '0';
      dialogIframe.style.left     = '0';
      dialogIframe.style.width    = '100vw';
      dialogIframe.style.height   = '100vh';
      dialogIframe.style.zIndex   = '9999';
    }
  }

  function hideBackdrop() {
    if (backdrop) { backdrop.remove(); backdrop = null; }
    if (dialogIframe) {
      // 恢复 iframe 所有原始样式
      dialogIframe.style.position = savedIframePosition;
      dialogIframe.style.top      = savedIframeTop;
      dialogIframe.style.left     = savedIframeLeft;
      dialogIframe.style.width    = savedIframeWidth;
      dialogIframe.style.height   = savedIframeHeight;
      dialogIframe.style.zIndex   = savedIframeZIndex;
      dialogIframe = null;
      savedIframeZIndex   = '';
      savedIframePosition = '';
      savedIframeTop      = '';
      savedIframeLeft     = '';
      savedIframeWidth    = '';
      savedIframeHeight   = '';
    }
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
