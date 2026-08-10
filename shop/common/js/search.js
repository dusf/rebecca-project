/**
 * NOIRÉ HAIR — 搜索通栏弹层（全宽，与一级导航二级通栏弹层 mega-menu 一致风格）
 * 公共组件，全站复用。由 header.js 初始化时调用 ShopSearch.init()。
 */
(function () {
  'use strict';

  var overlay = null;   // 遮罩（覆盖 header 以下区域，点击关闭）
  var panel = null;     // 通栏面板（固定在 header 下方，全宽）
  var inputEl = null;
  var clearBtn = null;
  var recentKey = 'noire_search_recent';

  // 热门搜索
  var HOT_KEYWORDS = ['蕾丝假发', '全蕾丝', '发片', '接发', '波波头', '长直发', '大波浪', '男士假发'];

  // 推荐商品（演示数据，后续接真实接口）
  var RECOMMEND_PRODUCTS = [
    { name: '自然黑 13×4 前蕾丝假发', price: '￥1,299', img: 'images/xinpinzhuti.png' },
    { name: '深棕 全蕾丝长卷发', price: '￥1,599', img: 'images/xilie.png' },
    { name: '奶茶棕 波波头假发', price: '￥899', img: 'images/jiafa.png' },
    { name: '亚麻金 大波浪假发', price: '￥1,099', img: 'images/jiefa.png' },
    { name: '黑棕 微卷锁骨发', price: '￥999', img: 'images/pinpai.png' },
    { name: '巧克力棕 长直发', price: '￥1,199', img: 'images/peijian.png' }
  ];

  // 热门分类（配真实主题图）
  var HOT_CATS = [
    { key: 'wig', label: '假发', img: 'images/category-wig.png' },
    { key: 'closure', label: '发片', img: 'images/category-topper.png' },
    { key: 'frontal', label: '发帘', img: 'images/craft-lace.png' },
    { key: 'extension', label: '接发', img: 'images/category-extension.png' },
    { key: 'care', label: '护理', img: 'images/chocolate-brown.png' },
    { key: 'tool', label: '工具', img: 'images/peijian.png' },
    { key: 'men', label: '男士', img: 'images/hero-model.png' },
    { key: 'kids', label: '儿童', img: 'images/xilie.png' }
  ];

  /* ==================== 初始化 ==================== */
  function init() {
    if (overlay) return; // 已初始化
    seedRecent();
    buildDom();
    bindEvents();
    renderRecent();
  }

  // 首次无记录时写入演示数据，方便用户参照截图效果查看
  function seedRecent() {
    if (localStorage.getItem(recentKey) === null) {
      localStorage.setItem(recentKey, JSON.stringify(['24英寸假发', '大波浪接发', '金色假发']));
    }
  }

  /* ==================== 构建 DOM（通栏） ==================== */
  function buildDom() {
    overlay = document.createElement('div');
    overlay.id = 'shopSearchOverlay';

    panel = document.createElement('div');
    panel.id = 'shopSearchPanel';
    panel.innerHTML = template();

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    inputEl = panel.querySelector('.ss-input');
    clearBtn = panel.querySelector('.ss-clear');
  }

  function template() {
    var catsHtml = HOT_CATS.map(function (c) {
      return '<div class="ss-cat" data-cat="' + c.key + '">' +
        '<div class="ss-cat-img"><img src="' + c.img + '" alt="' + c.label + '"></div>' +
        '<span class="ss-cat-name">' + c.label + '</span>' +
      '</div>';
    }).join('');

    var productsHtml = RECOMMEND_PRODUCTS.map(function (p) {
      return '<div class="ss-product" data-name="' + p.name + '">' +
        '<img class="ss-product-img" src="' + p.img + '" alt="">' +
        '<div class="ss-product-info">' +
          '<div class="ss-product-name">' + p.name + '</div>' +
          '<div class="ss-product-price">' + p.price + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    var hotHtml = HOT_KEYWORDS.map(function (k) {
      return '<span class="ss-tag" data-keyword="' + k + '">' + k + '</span>';
    }).join('');

    return '' +
      '<div class="ss-inner">' +
        '<div class="ss-search-bar">' +
          '<svg class="ss-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input class="ss-input" type="text" placeholder="搜索假发、接发、配件...">' +
          '<button type="button" class="ss-clear" title="清除">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
          '<button type="button" class="ss-panel-close" title="关闭">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="ss-panel-body">' +
          '<div class="ss-section" id="shopSearchRecentSection">' +
            '<div class="ss-panel-title">' +
              '最近搜索' +
              '<button type="button" class="ss-clear-all" id="shopSearchClear">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>' +
                '清除记录' +
              '</button>' +
            '</div>' +
            '<div class="ss-tags" id="shopSearchRecentList"></div>' +
          '</div>' +
          '<div class="ss-section">' +
            '<div class="ss-panel-title">热门搜索</div>' +
            '<div class="ss-tags">' + hotHtml + '</div>' +
          '</div>' +
          '<div class="ss-section">' +
            '<div class="ss-panel-title">为你推荐' +
              '<a href="javascript:void(0)" class="ss-more" data-more="recommend">查看更多 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></a>' +
            '</div>' +
            '<div class="ss-products">' + productsHtml + '</div>' +
          '</div>' +
          '<div class="ss-section">' +
            '<div class="ss-panel-title">热门分类</div>' +
            '<div class="ss-cats">' + catsHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ==================== 事件绑定 ==================== */
  function bindEvents() {
    // 点击遮罩（header 以下区域）关闭
    overlay.addEventListener('click', function () { close(); });

    // 关闭按钮
    panel.querySelector('.ss-panel-close').addEventListener('click', close);

    // 清除输入
    clearBtn.addEventListener('click', function () {
      inputEl.value = '';
      inputEl.focus();
      clearBtn.classList.remove('show');
    });

    // 输入时显示/隐藏清除按钮
    inputEl.addEventListener('input', function () {
      clearBtn.classList.toggle('show', inputEl.value.length > 0);
    });

    // 输入框回车搜索
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch(inputEl.value.trim());
    });

    // 热词
    panel.querySelectorAll('.ss-tag[data-keyword]').forEach(function (tag) {
      tag.addEventListener('click', function () {
        inputEl.value = tag.getAttribute('data-keyword');
        doSearch(inputEl.value);
      });
    });

    // 推荐商品
    panel.querySelectorAll('.ss-product').forEach(function (p) {
      p.addEventListener('click', function () {
        doSearch(p.getAttribute('data-name'));
      });
    });

    // 热门分类
    panel.querySelectorAll('.ss-cat').forEach(function (c) {
      c.addEventListener('click', function () {
        doSearch(c.querySelector('.ss-cat-name').textContent);
      });
    });

    // 最近搜索项：点击文字搜索，点击 × 删除单条
    panel.addEventListener('click', function (e) {
      var delBtn = e.target.closest('.ss-tag-close');
      if (delBtn) {
        e.stopPropagation();
        var kw = delBtn.getAttribute('data-del');
        var recent = getRecent().filter(function (k) { return k !== kw; });
        localStorage.setItem(recentKey, JSON.stringify(recent));
        renderRecent();
        return;
      }
      var item = e.target.closest('.ss-recent-tag');
      if (item) {
        inputEl.value = item.getAttribute('data-kw');
        doSearch(inputEl.value);
      }
    });

    // 清空最近搜索
    panel.querySelector('#shopSearchClear').addEventListener('click', function () {
      localStorage.removeItem(recentKey);
      renderRecent();
    });

    // 查看更多（为你推荐）
    panel.querySelector('.ss-more[data-more="recommend"]').addEventListener('click', function (e) {
      e.preventDefault();
      goSearch('');
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('show')) close();
    });
  }

  /* ==================== 最近搜索 ==================== */
  function renderRecent() {
    var list = panel.querySelector('#shopSearchRecentList');
    var section = panel.querySelector('#shopSearchRecentSection');
    var recent = getRecent();
    if (!recent.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    list.innerHTML = recent.map(function (kw) {
      return '<span class="ss-tag ss-recent-tag" data-kw="' + kw + '">' +
        kw +
        '<button type="button" class="ss-tag-close" data-del="' + kw + '" title="删除">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</span>';
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
    goSearch(keyword);
  }

  function goSearch(keyword) {
    close();
    var url = 'index.html?bankuai=search';
    if (keyword) url += '&q=' + encodeURIComponent(keyword);
    window.location.href = url;
  }

  /* ==================== 打开 / 关闭 ==================== */
  function open() {
    if (!overlay) init();
    overlay.classList.add('show');
    panel.classList.add('show');
    renderRecent();
    setTimeout(function () { inputEl && inputEl.focus(); }, 50);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('show');
    panel.classList.remove('show');
    if (inputEl) { inputEl.value = ''; clearBtn.classList.remove('show'); }
  }

  /* ==================== 暴露接口 ==================== */
  window.ShopSearch = {
    init: init,
    open: open,
    close: close
  };
})();
