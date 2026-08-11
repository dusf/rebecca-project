// 个人中心 - 仅做数据填充与横向产品列表渲染
// 注意：本文件不修改任何容器（.uc-page / .shop-header-inner）的宽度或样式，
// 容器宽度完全由 user.css 与导航栏 .shop-container 保持一致。

(function () {
  'use strict';

  // 真实用户数据：优先读取登录态（account.js 已在外壳加载并暴露 window.ShopAccount）
  var accountUser = (window.ShopAccount && window.ShopAccount.getUser && window.ShopAccount.getUser()) || null;
  var displayName = accountUser && accountUser.name
    ? accountUser.name
    : (accountUser && accountUser.email ? accountUser.email.split('@')[0] : 'NOIRÉ 会员');

  var user = {
    name: displayName,
    avatarText: displayName ? displayName.charAt(0).toUpperCase() : 'N',
    joinDate: '2024.03.15',
    points: 2680,
    balance: 520.0,
    coupons: 3,
    orders: { pending: 2, shipped: 3, received: 1 }
  };

  // 会员等级体系（基于累计积分门槛，电商常见四级）
  var LEVELS = [
    { name: '银卡会员', min: 0 },
    { name: '金卡会员', min: 2000 },
    { name: '铂金会员', min: 8000 },
    { name: '钻石会员', min: 20000 }
  ];

  // 根据积分计算当前等级与下一等级进度
  function calcLevel(points) {
    var idx = 0;
    for (var i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i].min) idx = i;
    }
    var cur = LEVELS[idx];
    var next = LEVELS[idx + 1] || null;
    var progress = 100;
    var remain = 0;
    if (next) {
      var span = next.min - cur.min;
      var got = points - cur.min;
      progress = span > 0 ? Math.round((got / span) * 100) : 100;
      progress = Math.max(0, Math.min(100, progress));
      remain = next.min - points;
    }
    return { level: cur, next: next, progress: progress, remain: remain };
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderProfile() {
    var lv = calcLevel(user.points);

    setText('ucSidebarAvatar', user.avatarText);
    setText('ucSidebarName', user.name);
    setText('ucSidebarPoints', user.points.toLocaleString());
    setText('ucSidebarLevel', lv.level.name);
    setText('ucHeroAvatar', user.avatarText);
    setText('ucHeroName', user.name);
    setText('ucHeroDate', user.joinDate);
    setText('ucHeroPoints', user.points.toLocaleString());
    setText('ucHeroBalance', '¥' + user.balance.toFixed(2));
    setText('ucHeroLevel', lv.level.name);
    setText('ucAssetPoints', user.points.toLocaleString());
    setText('ucAssetCoupons', user.coupons);
    setText('ucOrderPending', user.orders.pending);
    setText('ucOrderShipped', user.orders.shipped);
    setText('ucOrderReceived', user.orders.received);

    // 等级进度条
    var fill = document.getElementById('ucLevelFill');
    if (fill) fill.style.width = lv.progress + '%';
    setText('ucLevelTag', lv.level.name);
    setText('ucLevelTip', lv.next ? ('再消费 ' + lv.remain.toLocaleString() + ' 积分升级') : '已达最高等级');
  }

  // 横向产品卡片（用于「浏览记录 / 猜你喜欢」）
  var products = [
    { id: 301, name: '丝缎润养洗发露', price: 268, img: '../images/z1.png' },
    { id: 302, name: '角蛋白修护发膜', price: 320, img: '../images/z2.png' },
    { id: 303, name: '轻盈蓬松喷雾', price: 188, img: '../images/z1.png' },
    { id: 304, name: '山茶花护发精油', price: 256, img: '../images/z2.png' },
    { id: 305, name: '氨基酸洁发膏', price: 198, img: '../images/z1.png' },
    { id: 306, name: '头皮舒缓精华', price: 360, img: '../images/z2.png' }
  ];

  function cardHtml(p) {
    return '' +
      '<a href="#" class="uc-product-card" data-page="product/detail.html?id=' + p.id + '">' +
        '<img class="uc-product-img" src="' + p.img + '" alt="' + p.name + '" loading="lazy">' +
        '<div class="uc-product-info">' +
          '<p class="uc-product-name">' + p.name + '</p>' +
          '<span class="uc-product-price">¥' + p.price + '</span>' +
        '</div>' +
      '</a>';
  }

  function renderProducts() {
    var history = document.getElementById('ucHistoryList');
    var recommend = document.getElementById('ucRecommendList');
    var html = products.map(cardHtml).join('');
    if (history) history.innerHTML = html;
    if (recommend) recommend.innerHTML = html;
  }

  function init() {
    renderProfile();
    renderProducts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
