/**
 * NOIRÉ HAIR — 页面路由器
 * 负责加载不同页面内容到主内容区，保持头部/底部不变
 */
(function () {
  'use strict';

  var I = window.ShopI18n;

  /* ==================== 当前状态 ==================== */
  var currentPage = null;
  var loadedScripts = {};
  var loadedStyles = {};

  /* ==================== 页面加载 ==================== */
  function loadPage(pagePath) {
    // 分离基础路径与查询参数（如 product/detail.html?id=1）
    var qIdx = pagePath.indexOf('?');
    var basePath = qIdx !== -1 ? pagePath.substring(0, qIdx) : pagePath;

    // 支持传入裸模块名（如 'checkout'）：自动映射到 KNOWN_PAGES 中的真实路径
    if (KNOWN_PAGES[basePath]) {
      var mapped = KNOWN_PAGES[basePath];
      basePath = qIdx !== -1 ? mapped + pagePath.substring(qIdx) : mapped;
      pagePath = basePath;
    }

    // 防止重复加载同一页面（以基础路径判断，避免 query 变化导致重复加载）
    if (basePath === currentPage) return;

    currentPage = basePath;

    // 同步 URL（query 模式，始终嵌套在 shop/index.html 下）
    syncUrl(pagePath, basePath);

    // 更新页面标题
    updatePageTitle(basePath);

    // 更新导航激活状态
    updateNavActive(basePath);

    // 加载页面内容
    fetchPageContent(pagePath, basePath);
  }

  /* ==================== 同步 URL（query 模式 ?bankuai=xxx） ==================== */
  function syncUrl(pagePath, basePath) {
    var params = new URLSearchParams(window.location.search);
    if (basePath === 'index.html') {
      params.delete('bankuai');
      params.delete('id');
    } else {
      // 用 KNOWN_PAGES 的 key 作为 bankuai（如 new-arrivals），更短更友好
      var bankuai = basePath.replace(/\.html$/, '');
      for (var key in KNOWN_PAGES) {
        if (KNOWN_PAGES[key] === basePath) {
          bankuai = key;
          break;
        }
      }
      params.set('bankuai', bankuai);
      // 若传入的 pagePath 本身带 query，保留其中的参数（如 id）
      var pageQ = pagePath.indexOf('?');
      if (pageQ !== -1) {
        var extra = new URLSearchParams(pagePath.substring(pageQ));
        extra.forEach(function (value, key) {
          params.set(key, value);
        });
      }
    }
    var query = params.toString();
    var newUrl = window.location.pathname + (query ? '?' + query : '');
    if (newUrl !== window.location.pathname + window.location.search) {
      window.history.replaceState({ page: pagePath }, '', newUrl);
    }
  }

  /* ==================== 获取页面内容 ==================== */
  function fetchPageContent(pagePath, basePath) {
    var contentArea = document.getElementById('shopContent');
    if (!contentArea) return;

    // 首页 & 外部页面分别放在各自容器，互不覆盖
    var homeSection = document.getElementById('homeSection');
    var externalBox = ensureExternalBox(contentArea);

    if (basePath === 'index.html') {
      // 显示首页，隐藏外部容器
      if (homeSection) homeSection.style.display = '';
      externalBox.style.display = 'none';
      externalBox.innerHTML = '';
      window.scrollTo(0, 0);
    } else {
      // 隐藏首页，显示外部容器
      if (homeSection) homeSection.style.display = 'none';
      externalBox.style.display = '';
      externalBox.innerHTML = '<div class="shop-content-loading"><div class="shop-loading-spinner"></div></div>';
      // 其他页面：从对应目录加载
      loadExternalPage(pagePath, basePath, externalBox);
    }
  }

  /* ==================== 确保外部页面容器存在 ==================== */
  function ensureExternalBox(contentArea) {
    var box = document.getElementById('externalPage');
    if (!box) {
      box = document.createElement('div');
      box.id = 'externalPage';
      contentArea.appendChild(box);
    }
    return box;
  }

  /* ==================== 页面脚本映射 ==================== */
  // 脚本文件名可能与 HTML 文件名不同，在此映射
  var PAGE_SCRIPT_MAP = {
    'new-arrivals/index.html': 'new-arrivals/js/new-arrivals.js',
    'search/index.html': 'search/js/search-results.js',
    'user/index.html': 'user/js/user.js',
    'product/detail.html': 'product/js/detail.js',
    'cart/cart.html': 'cart/js/cart.js',
    'checkout/checkout.html': 'checkout/js/checkout.js',
    'order/success.html': 'order/js/success.js'
  };

  /* ==================== 页面样式映射 ==================== */
  // 样式文件名可能与模块名不同，在此映射；未映射则使用默认规则
  var PAGE_STYLE_MAP = {
    'search/index.html': 'search/css/search-results.css',
    'user/index.html': 'user/css/user.css?v=5',
    'product/detail.html': 'product/css/detail.css',
    'cart/cart.html': 'cart/css/cart.css',
    'checkout/checkout.html': 'checkout/css/checkout.css',
    'order/success.html': 'order/css/success.css'
  };

  /* ==================== 已知页面模块 ==================== */
  // 这些 bankuai 值对应真实存在的页面模块；其余（如 wig）仅作 URL 展示与导航高亮
  var KNOWN_PAGES = {
    'new-arrivals': 'new-arrivals/index.html',
    'search': 'search/index.html',
    'user': 'user/index.html',
    'product/detail': 'product/detail.html',
    'cart': 'cart/cart.html',
    'checkout': 'checkout/checkout.html',
    'order-success': 'order/success.html'
  };

  /* ==================== 加载外部页面 ==================== */
  function loadExternalPage(pagePath, basePath, container) {
    // 解析路径（统一使用不带 query 的 basePath）
    var parts = basePath.split('/');
    var moduleName = parts[0];
    var fileName = parts[1] || 'index.html';

    // HTML 路径（basePath 已不含 query），自动补 .html 后缀
    var htmlPath = basePath;
    if (!htmlPath.endsWith('.html')) {
      htmlPath = htmlPath + '.html';
    }

    // 加载 HTML 片段
    fetch(htmlPath)
      .then(function (response) {
        if (!response.ok) throw new Error('Page not found: ' + htmlPath);
        return response.text();
      })
      .then(function (html) {
        // 提取页面内容（移除 head 和 body 标签）
        var content = extractPageContent(html);

        // 注入内容
        container.innerHTML = content;

        // 修正图片路径：页面以 innerHTML 注入到 shop/index.html 下，
        // 相对路径需以 index.html 为基准（去掉一级 ../），否则 GitHub Pages 上图片 404
        container.querySelectorAll('img[src^="../images/"]').forEach(function (img) {
          img.src = img.getAttribute('src').replace(/^\.\.\/images\//, 'images/');
        });
        container.querySelectorAll('[data-src^="../images/"]').forEach(function (el) {
          el.setAttribute('data-src', el.getAttribute('data-src').replace(/^\.\.\/images\//, 'images/'));
        });

        // 加载页面脚本（使用映射表或默认规则，key 用 basePath）
        var scriptPath = PAGE_SCRIPT_MAP[basePath] || (moduleName + '/js/' + fileName.replace('.html', '.js'));
        loadPageScript(scriptPath);

        // 加载页面样式（使用映射表或默认规则，key 用 basePath）
        var stylePath = PAGE_STYLE_MAP[basePath] || (moduleName + '/css/' + moduleName + '.css');
        loadPageStyle(stylePath);

        // 触发页面初始化
        triggerPageInit(moduleName, fileName.split('?')[0]);

        // 重新应用 i18n
        if (I && I.applyAll) I.applyAll();

        // 滚动到顶部
        window.scrollTo(0, 0);
      })
      .catch(function (err) {
        console.error('Failed to load page:', err);
        container.innerHTML = '<div class="shop-content-error"><p>页面加载失败</p></div>';
      });
  }

  /* ==================== 加载页面脚本 ==================== */
  function loadPageScript(scriptPath) {
    // 检查是否已加载
    if (loadedScripts[scriptPath]) return;

    var script = document.createElement('script');
    script.src = scriptPath;
    script.async = true;
    script.onload = function () {
      loadedScripts[scriptPath] = true;
    };
    script.onerror = function () {
      console.error('Failed to load script:', scriptPath);
    };
    document.head.appendChild(script);
  }

  /* ==================== 加载页面样式 ==================== */
  function loadPageStyle(cssPath) {
    // 检查是否已加载
    if (loadedStyles[cssPath]) return;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.onload = function () {
      loadedStyles[cssPath] = true;
    };
    link.onerror = function () {
      console.error('Failed to load stylesheet:', cssPath);
    };
    document.head.appendChild(link);
  }

  /* ==================== 提取页面内容 ==================== */
  function extractPageContent(html) {
    // 移除 head 标签
    html = html.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    // 移除 body 标签，只保留内容
    var bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    var content = bodyMatch ? bodyMatch[1] : html;
    // 移除 script 和 link 标签（由 router.js 统一加载）
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<link[^>]*>/gi, '');
    return content.trim();
  }

  /* ==================== 触发页面初始化 ==================== */
  function triggerPageInit(moduleName, fileName) {
    // 尝试调用页面的 init 函数
    var initKey = moduleName + 'PageInit';
    if (window[initKey] && typeof window[initKey] === 'function') {
      window[initKey]();
    }

    // 触发页面加载事件
    var event = new CustomEvent('pageLoaded', {
      detail: { module: moduleName, file: fileName }
    });
    document.dispatchEvent(event);
  }

  /* ==================== 更新页面标题 ==================== */
  function updatePageTitle(pagePath) {
    var titleMap = {
      'index.html': 'NOIRÉ HAIR — 奢华假发',
      'new-arrivals/index.html': 'NOIRÉ HAIR — 新品上市',
      'search/index.html': 'NOIRÉ HAIR — 搜索结果',
      'user/index.html': 'NOIRÉ HAIR — 个人中心',
      'product/detail.html': 'NOIRÉ HAIR — 商品详情',
      'checkout/checkout.html': 'NOIRÉ HAIR — 安全结算',
      'order/success.html': 'NOIRÉ HAIR — 下单成功'
      };
    document.title = titleMap[pagePath] || 'NOIRÉ HAIR';
  }

  /* ==================== 更新导航激活状态 ==================== */
  function updateNavActive(pagePath) {
    // 当前 bankuai（如 new-arrivals、wig），用于高亮一级菜单
    var bankuai = getBankuai();
    var bankuaiTop = bankuai.split('/')[0];

    var navLinks = document.querySelectorAll('.shop-nav-link[data-page]');
    navLinks.forEach(function (link) {
      var dp = link.getAttribute('data-page');
      var isActive = false;

      if (bankuaiTop) {
        // 处于某板块（bankuai 非空）：按一级菜单匹配高亮
        if (dp && dp.indexOf('#') === 0) {
          var dpTop = dp.substring(1).split('/')[0];
          isActive = (dpTop === bankuaiTop && dpTop !== '');
        } else if (dp === 'index.html' || dp === '#home') {
          isActive = false; // 首页 logo 不高亮
        }
      } else {
        // 首页（无 bankuai）：高亮 logo / 首页
        if (pagePath === 'index.html') {
          isActive = (!dp || dp === '#home' || dp === 'index.html');
        } else if (dp && dp.indexOf('#') === 0) {
          isActive = false;
        } else {
          isActive = (dp === pagePath);
        }
      }
      link.classList.toggle('active', isActive);
    });
  }

  /* ==================== 浏览器后退/前进 ==================== */
  window.addEventListener('popstate', function (e) {
    var page = resolvePageFromUrl();
    loadPage(page);
  });

  /* ==================== 从 URL 解析 bankuai ==================== */
  function getBankuai() {
    var params = new URLSearchParams(window.location.search);
    return params.get('bankuai') || '';
  }

  /* ==================== 从 URL 解析页面路径 ==================== */
  function resolvePageFromUrl() {
    var bankuai = getBankuai();
    if (!bankuai) {
      return 'index.html';
    }

    var basePath = '';
    // 优先从 KNOWN_PAGES 取值，否则默认加 index.html
    if (KNOWN_PAGES[bankuai]) {
      basePath = KNOWN_PAGES[bankuai];
    } else {
      basePath = bankuai;
      if (!basePath.endsWith('.html')) {
        basePath = basePath + '/index.html';
      }
    }

    // 把 URL 中的 query 参数（如 id）附加回去
    var params = new URLSearchParams(window.location.search);
    params.delete('bankuai');
    var extra = params.toString();
    return extra ? basePath + '?' + extra : basePath;
  }

  /* ==================== 导航点击处理 ==================== */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    // 优先使用 data-page（header 导航统一通过 data-page 路由）
    var dataPage = link.getAttribute('data-page');
    if (dataPage) {
      e.preventDefault();
      if (dataPage === 'index.html' || dataPage === '#home' || dataPage === '') {
        loadPage('index.html');
        return;
      }
      if (dataPage.indexOf('#') === 0) {
        // 锚点菜单（一级/二级/三级，如 #wig、#wig/closure）
        // 若是已知真实页面模块，则加载；否则仅更新 bankuai（URL + 高亮）
        var anchor = dataPage.substring(1); // 去掉 #
        var topKey = anchor.split('/')[0];
        if (KNOWN_PAGES[topKey]) {
          loadPage(KNOWN_PAGES[topKey]);
        } else {
          setBankuaiOnly(anchor);
        }
        return;
      }
      loadPage(dataPage);
      return;
    }

    var href = link.getAttribute('href');
    if (!href) return;

    // 只处理站点内链接（排除外链）
    if (href.startsWith('http') || href.startsWith('//')) return;
    if (href === '#home' || href === 'index.html') {
      e.preventDefault();
      loadPage('index.html');
      return;
    }
    if (href.startsWith('#')) return; // 其他纯锚点不拦截

    e.preventDefault();
    var pagePath = href.replace(/^\/shop\//, '').replace(/^\//, '');
    if (pagePath === '' || pagePath === 'index.html') {
      pagePath = 'index.html';
    }
    loadPage(pagePath);
  });

  /* ==================== 仅更新 bankuai（不加载页面） ==================== */
  function setBankuaiOnly(bankuai) {
    // 空锚点（如占位子项）不写入 URL，仅保持高亮
    if (!bankuai) {
      updateNavActive(currentPage || 'index.html');
      return;
    }
    var params = new URLSearchParams(window.location.search);
    params.set('bankuai', bankuai);
    var query = params.toString();
    var newUrl = window.location.pathname + '?' + query;
    if (newUrl !== window.location.pathname + window.location.search) {
      window.history.replaceState({ page: currentPage }, '', newUrl);
    }
    updateNavActive(currentPage || 'index.html');
  }

  /* ==================== 初始化 ==================== */
  function init() {
    // 从 URL query 解析初始页面（始终嵌套在 shop/index.html 下）
    var pagePath = resolvePageFromUrl();

    // 走完整加载流程（同步 URL、高亮、加载内容）
    currentPage = null; // 重置去重保护，确保首屏一定会加载
    loadPage(pagePath);

    // 触发页面加载事件（让 index.js 等可以监听）
    var event = new CustomEvent('pageLoaded', {
      detail: { module: 'index', file: 'index.html' }
    });
    document.dispatchEvent(event);
  }

  // 导出
  window.ShopRouter = {
    loadPage: loadPage,
    init: init
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
