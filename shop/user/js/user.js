(function () {
  'use strict';

  // 真实用户数据：优先读取登录态（account.js 已在外壳加载并暴露 window.ShopAccount）
  var accountUser = (window.ShopAccount && window.ShopAccount.getUser && window.ShopAccount.getUser()) || null;
  var displayName = accountUser && accountUser.name
    ? accountUser.name
    : (accountUser && accountUser.email ? accountUser.email.split('@')[0] : '优雅女士');

  var user = {
    name: displayName,
    points: 2680,
    pendingPoints: 348,
    balance: 520.00,
    coupons: 3,
    level: 'LV2 进阶会员',
    levelExpire: '2025.12.31 到期',
    growth: 680,
    growthTarget: 1000,
    levelUpNeed: 320,
    nextLevel: 'LV3 尊享会员'
  };

  var orders = {
    pending: 2,
    shipped: 1,
    received: 1,
    completed: 16,
    aftersale: 0
  };

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderProfile() {
    setText('ucSidebarName', user.name);
    setText('ucSidebarPoints', user.points.toLocaleString());
    setText('ucStatPoints', user.points.toLocaleString());
    setText('ucStatPendingPoints', user.pendingPoints.toLocaleString());

    // 会员等级卡片：LV2 + 进阶会员 分两个 span 并排展示
    var levelEl = document.getElementById('ucStatLevel');
    if (levelEl) {
      var lm = (user.level || '').match(/^(LV\d+)\s*(.*)$/);
      var lmEl = levelEl.querySelector('.uc-stat-level-main');
      var lsEl = levelEl.querySelector('.uc-stat-level-sub');
      if (lmEl) lmEl.textContent = lm ? lm[1] : user.level;
      if (lsEl) lsEl.textContent = lm ? lm[2] : '';
    }

    setText('ucStatLevelDate', user.levelExpire);
    setText('ucStatBalance', '$' + user.balance.toFixed(2));
    setText('ucAssetPoints', user.points.toLocaleString());
    setText('ucAssetCoupons', user.coupons);

    // 会员等级横幅
    setText('ucLevelSubtitle', '再消费 $' + user.levelUpNeed + ' 即可升级 ' + user.nextLevel);
    setText('ucLevelMeta', '当前成长值 $' + user.growth + ' / $' + user.growthTarget.toLocaleString());

    var fill = document.getElementById('ucLevelFill');
    if (fill) fill.style.width = Math.round((user.growth / user.growthTarget) * 100) + '%';
  }

  function renderOrders() {
    setText('ucOrderPending', orders.pending || '');
    setText('ucOrderShipped', orders.shipped || '');
    setText('ucOrderReceived', orders.received || '');
    setText('ucOrderCompleted', orders.completed || '');
    setText('ucOrderAfterSale', orders.aftersale || '');

    // 0 不显示角标
    ['ucOrderPending','ucOrderShipped','ucOrderReceived','ucOrderCompleted','ucOrderAfterSale'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var v = parseInt(el.textContent, 10) || 0;
      el.style.display = v > 0 ? 'inline-block' : 'none';
    });
  }

  // 浏览记录
  var historyProducts = [
    { id: 101, name: '法式大波浪真人发假发', meta: '22英寸 | 自然黑', price: 2299, img: 'images/sl1.png' },
    { id: 102, name: '直发真人发假发', meta: '24英寸 | 自然黑', price: 2199, img: 'images/sl2.png' },
    { id: 103, name: '深卷真人发假发', meta: '20英寸 | 自然黑', price: 2299, img: 'images/sl3.png' },
    { id: 104, name: '接发片（7片装）', meta: '自然黑 #1B', price: 189, img: 'images/sl4.png' },
    { id: 105, name: '免洗护理喷雾', meta: '滋养修护 150ml', price: 39, img: 'images/sl5.png' },
    { id: 106, name: '气垫按摩梳', meta: '适合所有发质', price: 29, img: 'images/sl6.png' }
  ];

  function productCardHtml(p) {
    return '' +
      '<a href="#" class="uc-product-card" data-page="product/detail.html?id=' + p.id + '">' +
        '<img class="uc-product-img" src="' + p.img + '" alt="' + p.name + '" loading="lazy" onerror="this.onerror=null;this.src=\'images/product-1.png\'">' +
        '<div class="uc-product-info">' +
          '<p class="uc-product-name">' + p.name + '</p>' +
          '<p class="uc-product-meta">' + p.meta + '</p>' +
          '<span class="uc-product-price">$' + p.price + '</span>' +
          '<span class="uc-product-favorite"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>' +
        '</div>' +
      '</a>';
  }

  function renderHistory() {
    var list = document.getElementById('ucHistoryList');
    if (list) list.innerHTML = historyProducts.map(productCardHtml).join('');
  }

  // 优惠券
  var coupons = [
    { amount: 20, title: '全场通用券', desc: '满 $199 可用', date: '有效期至 2024.06.15' },
    { amount: 50, title: '真人发假发专用券', desc: '满 $399 可用', date: '有效期至 2024.07.01' },
    { amount: 10, title: '配件护理专用券', desc: '满 $99 可用', date: '有效期至 2024.06.08' }
  ];

  function couponHtml(c, idx) {
    return '' +
      '<div class="uc-coupon-item">' +
        '<div class="uc-coupon-left"><span class="uc-coupon-amount"><small>$</small>' + c.amount + '</span></div>' +
        '<div class="uc-coupon-right">' +
          '<div class="uc-coupon-title">' + c.title + '</div>' +
          '<div class="uc-coupon-desc">' + c.desc + '</div>' +
          '<div class="uc-coupon-date">' + c.date + '</div>' +
          '<button type="button" class="uc-coupon-btn" data-coupon="' + idx + '">去使用</button>' +
        '</div>' +
      '</div>';
  }

  function renderCoupons() {
    var list = document.getElementById('ucCouponList');
    if (list) list.innerHTML = coupons.map(couponHtml).join('');
  }

  function initEvents() {
    // 收藏点击
    document.addEventListener('click', function (e) {
      var fav = e.target.closest('.uc-product-favorite');
      if (fav) {
        e.preventDefault();
        e.stopPropagation();
        fav.classList.toggle('active');
      }
      var couponBtn = e.target.closest('.uc-coupon-btn');
      if (couponBtn) {
        // 可扩展：跳转优惠券可用商品列表
        if (window.ShopRouter && ShopRouter.loadPage) {
          ShopRouter.loadPage('product/list.html');
        }
      }
    });

    // 去赚积分
    var earnBtn = document.getElementById('ucEarnPointsBtn');
    if (earnBtn) {
      earnBtn.addEventListener('click', function () {
        showUcComing('积分中心');
      });
    }

    // 查看会员权益
    var benefitBtns = document.querySelectorAll('#ucViewBenefitsBtn, #ucLevelActionBtn');
    benefitBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showUcComing('会员专属权益');
      });
    });

    // 编辑个人资料
    var editBtn = document.getElementById('ucEditProfileBtn');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        showUcComing('账号设置');
      });
    }
  }

  /* ==================== 个人中心站内导航（左侧菜单） ==================== */

  // 切换右侧视图：isHome = true 显示首页内容，否则显示待开发占位
  function switchUcView(link, page) {
    var base = String(page || '').split('?')[0];

    // 1. 更新左侧菜单高亮：菜单内链接精确高亮自身；其余链接按 data-page 匹配（只高亮第一个匹配项）
    var inMenu = !!(link.closest && link.closest('.uc-menu'));
    document.querySelectorAll('.uc-menu a[data-page]').forEach(function (a) {
      a.classList.remove('active');
    });
    if (inMenu) {
      link.classList.add('active');
    } else {
      var target = document.querySelector('.uc-menu a[data-page="' + base + '"]');
      if (target) target.classList.add('active');
    }

    // 2. 更新面包屑标题：菜单内链接取自身文本，其余链接优先取对应菜单项名称
    var title = '';
    if (inMenu) {
      title = link.textContent.trim();
    } else {
      var menuItem = document.querySelector('.uc-menu a[data-page="' + base + '"]');
      title = menuItem ? menuItem.textContent.trim() : (link.textContent || '').trim();
    }
    // 清理「查看全部订单 >」这类文本的尾部箭头与空白
    title = (title || '个人中心').replace(/\s+>\s*$/, '').replace(/\s+/g, ' ').trim();
    setText('ucBreadcrumbTitle', title);

    // 3. 切换右侧视图：仅「我的首页」（带 data-uc-home）显示首页内容，
    //    其余菜单（含指向同一 user/index.html 的「会员中心」）一律显示待开发占位
    var coming = document.getElementById('ucComingView');
    var main = document.querySelector('.uc-main');
    if (!main || !coming) return;
    var isHome = !!(link && link.hasAttribute && link.hasAttribute('data-uc-home'));
    Array.prototype.forEach.call(main.children, function (el) {
      if (el.id === 'ucComingView') {
        el.style.display = isHome ? 'none' : '';
      } else {
        el.style.display = isHome ? '' : 'none';
      }
    });
    if (!isHome) setText('ucComingPageName', title);
  }

  // 按钮类入口统一显示待开发占位
  function showUcComing(title) {
    var coming = document.getElementById('ucComingView');
    var main = document.querySelector('.uc-main');
    if (!main || !coming) return;
    Array.prototype.forEach.call(main.children, function (el) {
      if (el.id === 'ucComingView') {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
    setText('ucComingPageName', title || '个人中心');
    setText('ucBreadcrumbTitle', title || '个人中心');
    // 同步左侧菜单高亮：精确匹配菜单项文本；匹配不到则保持「我的首页」高亮
    var matched = false;
    document.querySelectorAll('.uc-menu a[data-page]').forEach(function (a) {
      var on = a.textContent.trim() === title;
      a.classList.toggle('active', on);
      if (on) matched = true;
    });
    if (!matched) {
      var home = document.querySelector('.uc-menu a[data-uc-home]');
      if (home) home.classList.add('active');
    }
  }

  // 已开发完成、拥有独立页面的个人中心模块（命中则放行 router 跳转，不走占位）
  var UC_BUILT_PAGES = {
    'user/index.html': true,
    'user/member.html': true
  };

  // 捕获阶段拦截 user/* 链接，阻止 router.js 的 document 冒泡监听触发页面跳转
  document.addEventListener('click', function (e) {
    // 仅当个人中心页面已注入时拦截，避免误拦 header 等处的「查看个人中心」入口
    if (!document.querySelector('.uc-page')) return;
    var link = e.target.closest('a[data-page]');
    if (!link) return;
    var page = link.getAttribute('data-page') || '';
    var base = page.split('?')[0];
    if (base.indexOf('user/') !== 0) return; // 只拦截个人中心内部链接

    // 已开发独立页面的链接放行：交给 router.js 正常加载（用 loadPage 确保样式/脚本正确注入）
    if (UC_BUILT_PAGES[base]) {
      e.preventDefault();
      e.stopPropagation();
      if (window.ShopRouter && ShopRouter.loadPage) {
        ShopRouter.loadPage(base);
      } else {
        window.location.href = base;
      }
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // 退出登录
    if (base === 'user/logout.html') {
      if (window.ShopAccount && ShopAccount.logout) ShopAccount.logout();
      alert('已退出登录');
      if (window.ShopRouter && ShopRouter.loadPage) ShopRouter.loadPage('index.html');
      return;
    }

    switchUcView(link, page);
  }, true); // 捕获阶段，先于 router.js 的冒泡监听执行

  function init() {
    renderProfile();
    renderOrders();
    renderHistory();
    renderCoupons();
    initEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
