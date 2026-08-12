/**
 * NOIRÉ HAIR — 页面加载器
 * 提供页面内容加载、脚本注入、样式注入等工具函数
 */
(function () {
  'use strict';

  /* ==================== 加载页面 HTML ==================== */
  function loadPageHtml(pagePath) {
    return fetch(pagePath)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + pagePath);
        return response.text();
      });
  }

  /* ==================== 提取页面主体内容 ==================== */
  function extractBodyContent(html) {
    // 方法1: 提取 <body> 内容
    var bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1].trim();
    }

    // 方法2: 提取 <main> 内容
    var mainMatch = html.match(/<main[^>]*>([\s\S]*)<\/main>/i);
    if (mainMatch) {
      return mainMatch[1].trim();
    }

    // 方法3: 提取 id="content" 或 class="page-content"
    var contentMatch = html.match(/(?:id="content"|class="[^"]*page-content[^"]*")>([\s\S]*)<\/(?:div|section|main)/i);
    if (contentMatch) {
      return contentMatch[1].trim();
    }

    // 方法4: 返回原始 HTML
    return html;
  }

  /* ==================== 加载页面脚本 ==================== */
  function loadPageScript(scriptPath) {
    return new Promise(function (resolve, reject) {
      // 检查是否已加载
      if (document.querySelector('script[src="' + scriptPath + '"]')) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = scriptPath;
      script.async = true;

      script.onload = resolve;
      script.onerror = function () {
        reject(new Error('Failed to load script: ' + scriptPath));
      };

      document.head.appendChild(script);
    });
  }

  /* ==================== 加载页面样式 ==================== */
  function loadPageStyle(cssPath) {
    return new Promise(function (resolve, reject) {
      // 检查是否已加载
      if (document.querySelector('link[href="' + cssPath + '"]')) {
        resolve();
        return;
      }

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;

      link.onload = resolve;
      link.onerror = function () {
        reject(new Error('Failed to load stylesheet: ' + cssPath));
      };

      document.head.appendChild(link);
    });
  }

  /* ==================== 加载完整页面 ==================== */
  function loadFullPage(pagePath, container) {
    var contentArea = container || document.getElementById('shopContent');
    if (!contentArea) {
      console.error('Content container not found');
      return Promise.reject(new Error('Content container not found'));
    }

    // 显示加载状态
    contentArea.innerHTML = '<div class="shop-content-loading"><div class="shop-loading-spinner"></div></div>';

    return loadPageHtml(pagePath)
      .then(function (html) {
        var content = extractBodyContent(html);
        contentArea.innerHTML = content;

        // 修正图片路径：页面以 innerHTML 注入到 shop/index.html 下，
        // 相对路径需以 index.html 为基准（去掉一级 ../），否则 GitHub Pages 上图片 404
        contentArea.querySelectorAll('img[src^="../images/"]').forEach(function (img) {
          img.src = img.getAttribute('src').replace(/^\.\.\/images\//, 'images/');
        });
        contentArea.querySelectorAll('[data-src^="../images/"]').forEach(function (el) {
          el.setAttribute('data-src', el.getAttribute('data-src').replace(/^\.\.\/images\//, 'images/'));
        });

        // 加载页面脚本和样式
        var moduleName = pagePath.split('/')[0];
        var fileName = pagePath.split('/')[1] || 'index.html';

        return Promise.all([
          loadPageScript(moduleName + '/js/' + fileName.replace('.html', '.js')),
          loadPageStyle(moduleName + '/css/' + moduleName + '.css')
        ]);
      })
      .then(function () {
        // 触发页面初始化事件
        var event = new CustomEvent('pageLoaded', {
          detail: { path: pagePath }
        });
        document.dispatchEvent(event);

        // 滚动到顶部
        window.scrollTo(0, 0);
      })
      .catch(function (err) {
        console.error('Failed to load page:', err);
        contentArea.innerHTML = '<div class="shop-content-error"><p>页面加载失败</p></div>';
        throw err;
      });
  }

  /* ==================== 卸载页面 ==================== */
  function unloadPage() {
    var contentArea = document.getElementById('shopContent');
    if (contentArea) {
      contentArea.innerHTML = '';
    }
  }

  /* ==================== 导出 ==================== */
  window.ShopPageLoader = {
    loadPageHtml: loadPageHtml,
    extractBodyContent: extractBodyContent,
    loadPageScript: loadPageScript,
    loadPageStyle: loadPageStyle,
    loadFullPage: loadFullPage,
    unloadPage: unloadPage
  };
})();
