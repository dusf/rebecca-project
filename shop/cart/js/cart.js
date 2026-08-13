/* ============================================
   NOIRÉ HAIR — 购物车页面 JS
   ============================================ */

(function () {
  'use strict';

  // 图片路径基准：通过 shop/index.html 路由注入时使用 images/，直接访问 cart.html 时使用 ../images/
  var IMG_PREFIX = (window.location.pathname.indexOf('index.html') !== -1 && document.getElementById('shopContent'))
    ? 'images/'
    : '../images/';

  // ---------- 模拟数据 ----------
  var cartData = [
    {
      id: 'p001',
      name: '13x4 透明蕾丝前额假发',
      image: IMG_PREFIX + 'product-1.png',
      price: 189.99,
      specs: { color: '自然黑', length: '24 英寸', cap: '1包' },
      specOptions: {
        color: ['自然黑', '深棕', '栗棕'],
        length: ['20 英寸', '22 英寸', '24 英寸', '26 英寸'],
        cap: ['1包', '3包', '5包']
      },
      qty: 1,
      checked: true,
      hasGift: true,
      giftName: '丝绸袋子 + 发卡 + 睡帽',
      giftImage: 'images/zp1.png',
      discountTip: '满足条件为：满￥89.00减$15.00',
      discountRule: { threshold: 89, minus: 15 },
      discountType: 'amount',
      discountRate: 5,
      discountMin: 89,
      deliveryText: '预计送达时间：7月30日至8月3日'
    },
    {
      id: 'p002',
      name: 'HD 5x5 闭合式蕾丝假发',
      image: IMG_PREFIX + 'product-2.png',
      price: 229.99,
      specs: { color: '深棕', length: '22 英寸', cap: '3包' },
      specOptions: {
        color: ['自然黑', '深棕', '栗棕'],
        length: ['20 英寸', '22 英寸', '24 英寸', '26 英寸'],
        cap: ['1包', '3包', '5包']
      },
      qty: 2,
      checked: true,
      hasGift: false,
      discountTip: '满足条件为：满$199.99享24%折扣',
      discountRule: { threshold: 199.99, minus: 30 },
      discountType: 'rate',
      discountRate: 24,
      discountMin: 199.99,
      deliveryText: '预计送达时间：7月30日至8月3日'
    },
    {
      id: 'p003',
      name: '全手织蕾丝前额假发',
      image: IMG_PREFIX + 'product-3.png',
      price: 299.99,
      specs: { color: '自然黑', length: '26 英寸', cap: '5包' },
      specOptions: {
        color: ['自然黑', '深棕', '栗棕'],
        length: ['20 英寸', '22 英寸', '24 英寸', '26 英寸'],
        cap: ['1包', '3包', '5包']
      },
      qty: 1,
      checked: false,
      hasGift: false,
      discountTip: '',
      discountRule: null,
      discountType: 'none',
      discountRate: 0,
      discountMin: 0,
      deliveryText: '预计送达时间：7月30日至8月3日'
    }
  ];

  var recommendData = [
    { id: 'rec1', name: '13x4 透明蕾丝前额假发', image: IMG_PREFIX + 'product-1.png', price: 189.99, oldPrice: 239.99 },
    { id: 'rec2', name: 'HD 5x5 闭合式蕾丝假发', image: IMG_PREFIX + 'product-2.png', price: 229.99, oldPrice: 279.99 },
    { id: 'rec3', name: '全手织蕾丝前额假发', image: IMG_PREFIX + 'product-3.png', price: 299.99, oldPrice: 359.99 },
    { id: 'rec4', name: '直发水波纹假发', image: IMG_PREFIX + 'product-4.png', price: 259.99, oldPrice: 309.99 },
    { id: 'rec5', name: '深卷波浪假发', image: IMG_PREFIX + 'product-5.png', price: 279.99, oldPrice: 329.99 }
  ];

  var FREE_SHIPPING_THRESHOLD = 229;

  // ---------- DOM 引用 ----------
  var cartListEl = document.getElementById('cartList');
  var cartEmptyEl = document.getElementById('cartEmpty');
  var cartContainerEl = document.getElementById('cartContainer');
  var totalCountEl = null; // 购物车页面无大标题计数徽章
  var selectedCountEl = document.getElementById('cartSelectedCount');
  var selectedCountTopEl = document.getElementById('cartSelectedCountTop');

  var orderItemCountEl = document.getElementById('orderItemCount');
  var orderSubtotalEl = document.getElementById('orderSubtotal');
  var orderShippingEl = document.getElementById('orderShipping');
  var orderTaxEl = document.getElementById('orderTax');
  var orderDiscountEl = document.getElementById('orderDiscount');
  var orderGrandTotalEl = document.getElementById('orderGrandTotal');

  var selectAllTop = document.getElementById('cartSelectAll');
  var selectAllBottom = document.getElementById('cartSelectAllBottom');
  var deleteSelectedBtn = document.getElementById('cartDeleteSelected');
  var deleteSelectedBtnTop = document.getElementById('cartDeleteSelectedTop');
  var sidebarCheckoutBtn = document.getElementById('cartSidebarCheckout');
  var goShoppingBtn = document.getElementById('cartGoShopping');
  var recGridEl = document.getElementById('cartRecGrid');
  var bcHomeLink = document.getElementById('cartBcHome');

  // ---------- 工具函数 ----------
  function formatPrice(n) {
    return '$' + n.toFixed(2);
  }

  // 收起所有规格下拉菜单
  function closeAllSpecMenus() {
    if (!cartListEl) return;
    var menus = cartListEl.querySelectorAll('.cart-spec-menu.open');
    menus.forEach(function (m) { m.classList.remove('open'); });
  }

  // 构建某个商品的规格切换菜单
  function buildSpecMenu(id, menuEl) {
    var idx = findItemIndex(id);
    if (idx === -1) return;
    var item = cartData[idx];
    var opts = item.specOptions || {};
    var html = '';
    for (var key in opts) {
      html += '<div class="cart-spec-menu-group">';
      var labelMap = { color: '颜色', length: '长度', cap: '包数' };
      html += '<div class="cart-spec-menu-label">' + (labelMap[key] || key) + '</div>';
      html += '<div class="cart-spec-menu-items">';
      opts[key].forEach(function (val) {
        var active = item.specs[key] === val ? ' active' : '';
        html += '<button type="button" class="cart-spec-opt' + active + '" data-spec-id="' + id + '" data-spec-key="' + key + '" data-spec-opt="' + val + '">' + val + '</button>';
      });
      html += '</div></div>';
    }
    menuEl.innerHTML = html;
  }

  // 点击空白处收起菜单
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.cart-card-specs')) closeAllSpecMenus();
  });

  function getCheckedItems() {
    return cartData.filter(function (item) { return item.checked; });
  }

  function getCheckedCount() {
    return getCheckedItems().reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function getSubtotal() {
    return getCheckedItems().reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
  }

  function calcShipping(subtotal) {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  }

  // ---------- 渲染商品列表（SHEIN 风格卡片式） ----------
  function renderCartList() {
    if (!cartData.length) {
      showEmpty();
      return;
    }
    showList();

    var html = '';
    cartData.forEach(function (item) {
      var discount = Math.round((1 - item.price / (item.price * 1.15)) * 100);
      html += '<div class="cart-card" data-id="' + item.id + '">'
        + '<label class="cart-check-wrap cart-card-check">'
        +   '<input type="checkbox"' + (item.checked ? ' checked' : '') + ' data-item-check="' + item.id + '">'
        +   '<span class="cart-checkbox"></span>'
        + '</label>'
        + '<div class="cart-card-body">'
        +   '<div class="cart-card-img-wrap"><img class="cart-card-img" src="' + item.image + '" alt="' + item.name + '"></div>'
        +   '<div class="cart-card-info">'
        +     '<h3 class="cart-card-name">' + item.name + '</h3>'
        // 规格选择行（竖线分隔 + 下拉图标）
        +     '<div class="cart-card-specs">';
      var specKeys = Object.keys(item.specs);
      specKeys.forEach(function (key, idx) {
        html += '<span class="cart-spec-pill">' + item.specs[key] + '</span>';
        if (idx < specKeys.length - 1) {
          html += '<span class="cart-spec-sep">|</span>';
        }
      });
      html += '<button type="button" class="cart-spec-toggle" data-spec-toggle="' + item.id + '" aria-label="更换规格">'
        +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
        + '</button>'
        +   '<div class="cart-spec-menu" data-spec-menu="' + item.id + '"></div>';
      html += '</div>';
      // 自动折扣提示条
      if (item.discountTip) {
        html += '<div class="cart-discount-tip">'
          +   '<svg class="cart-discount-tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>'
          +   '<span>' + item.discountTip + '</span>'
          + '</div>';
      }
      // 预计送达时间
      if (item.deliveryText) {
        html += '<div class="cart-card-delivery">'
          +   '<svg class="cart-card-delivery-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
          +   '<span class="cart-card-delivery-text">' + item.deliveryText + '</span>'
          + '</div>';
      }
      // 底部价格+数量行
      // amount: 当前价 = 划线价 − 满减金额；rate: 当前价 = 划线价 ×(1−折扣%)；none: 仅当前价、无划线
      var oldPrice = item.price * 1.15;
      var curPrice = oldPrice;
      var showOld = true;
      var itemTotal = item.price * item.qty;
      if (item.discountType === 'amount' && item.discountRule && itemTotal >= item.discountRule.threshold) {
        curPrice = oldPrice - item.discountRule.minus;
      } else if (item.discountType === 'rate' && itemTotal >= (item.discountMin || 0)) {
        curPrice = oldPrice * (1 - (item.discountRate || 0) / 100);
      } else if (item.discountType === 'none') {
        curPrice = item.price;
        showOld = false;
      } else {
        curPrice = oldPrice;
      }
      html += '<div class="cart-card-footer">'
        +   '<div class="cart-card-price-block">'
        +     '<span class="cart-card-price-cur">$' + curPrice.toFixed(2) + '</span>'
        +     (showOld ? '<span class="cart-card-price-old">$' + oldPrice.toFixed(2) + '</span>' : '')
        +     (item.discountType === 'rate' && itemTotal >= (item.discountMin || 0)
          ? '<span class="cart-card-discount">-' + (item.discountRate || 5) + '%'
            +   '<button type="button" class="cart-card-discount-toggle" data-disc-toggle="' + item.id + '" aria-label="折扣说明">'
            +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
            +   '</button>'
            +   '<div class="cart-disc-pop" data-disc-pop="' + item.id + '">满足$' + item.discountMin + '.00 折扣 ' + (item.discountRate || 5) + '%</div>'
            + '</span>'
          : '')
        +   '</div>'
        +   '<div class="cart-card-actions">'
        +     '<span class="cart-qty-label">数量：</span>'
        +     '<div class="cart-qty-control">'
        +       '<button type="button" class="cart-qty-btn cart-qty-minus" data-qty-minus="' + item.id + '"' + (item.qty <= 1 ? ' disabled' : '') + '>-</button>'
        +       '<input type="number" class="cart-qty-input" value="' + item.qty + '" min="1" max="99" data-qty-input="' + item.id + '">'
        +       '<button type="button" class="cart-qty-btn cart-qty-plus" data-qty-plus="' + item.id + '">+</button>'
        +     '</div>'
        +     '<button type="button" class="cart-card-fav" data-fav="' + item.id + '" title="移至收藏" aria-label="移至收藏">'
        +       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
        +     '</button>'
        +     '<button type="button" class="cart-card-delete" data-delete="' + item.id + '" title="删除" aria-label="删除">'
        +       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
        +     '</button>'
        +   '</div>'
        + '</div>'
        +   '</div>'
        + '</div>'
        + '</div>';
    });

    // 独立赠品区块（从商品卡片中抽离，单独展示套装图片）
    var giftItems = cartData.filter(function (it) { return it.hasGift; });
    if (giftItems.length) {
      html += '<div class="cart-gift-section">'
        +   '<div class="cart-gift-section-head">'
        +     '<svg class="cart-gift-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V21"/><path d="M19 12H5"/><path d="M15.5 8C14.1 6.7 12.5 6 12 6s-2.1.7-3.5 2"/><path d="M8.5 8C9.9 6.7 11.5 6 12 6s2.1.7 3.5 2"/></svg>'
        +     '<span class="cart-gift-section-title">赠品</span>'
        +     '<span class="cart-gift-section-sub">下单即赠，随主商品一同寄出</span>'
        +   '</div>';
      giftItems.forEach(function (g) {
        html += '<div class="cart-gift-row" data-id="' + g.id + '">'
          +   '<div class="cart-gift-row-img"><img src="' + g.giftImage + '" alt="' + g.giftName + '"></div>'
          +   '<div class="cart-gift-row-info">'
          +     '<span class="cart-gift-row-name">' + g.giftName + '</span>'
          +     '<span class="cart-gift-row-ref">随「' + g.name + '」赠送</span>'
          +   '</div>'
          +   '<div class="cart-gift-row-tag">免费</div>'
          + '</div>';
      });
      html += '</div>';
    }

    cartListEl.innerHTML = html;
    updateSummary();
  }

  // ---------- 渲染猜你喜欢 ----------
  function renderRecommend() {
    if (!recGridEl) return;
    var html = '';
    recommendData.forEach(function (item) {
      html += '<div class="cart-rec-card" data-page="product/detail" data-rec-id="' + item.id + '">'
        + '<div class="cart-rec-img-wrap">'
        +   '<img class="cart-rec-img" src="' + item.image + '" alt="' + item.name + '">'
        +   '<button type="button" class="cart-rec-fav" data-rec-fav="' + item.id + '" title="收藏" aria-label="收藏">'
        +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
        +   '</button>'
        + '</div>'
        + '<div class="cart-rec-info">'
        +   '<h4 class="cart-rec-name">' + item.name + '</h4>'
        +   '<div class="cart-rec-price">' + formatPrice(item.price)
        +     (item.oldPrice ? '<span class="cart-rec-price-old">' + formatPrice(item.oldPrice) + '</span>' : '')
        +   '</div>'
        +   '<button type="button" class="cart-rec-add" data-rec-add="' + item.id + '" title="加入购物车" aria-label="加入购物车">'
        +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
        +     '<span>加入购物车</span>'
        +   '</button>'
        + '</div></div>';
    });
    recGridEl.innerHTML = html;
  }

  // ---------- 更新汇总信息 ----------
  function updateSummary() {
    var totalItems = cartData.reduce(function (s, i) { return s + i.qty; }, 0);
    var checkedNum = getCheckedCount();
    var sub = getSubtotal();
    var discount = 0;
    cartData.forEach(function (i) {
      if (!i.checked) return;
      var itemTotal = i.price * i.qty;
      if (i.discountType === 'amount' && i.discountRule && itemTotal >= i.discountRule.threshold) {
        discount += i.discountRule.minus;
      } else if (i.discountType === 'rate' && itemTotal >= (i.discountMin || 0)) {
        discount += (i.price * 1.15) * (i.discountRate || 0) / 100;
      }
    });
    var grand = sub - discount;

    if (totalCountEl) totalCountEl.textContent = totalItems + ' 件商品';
    if (selectedCountEl) selectedCountEl.textContent = checkedNum;
    if (selectedCountTopEl) selectedCountTopEl.textContent = checkedNum;

    if (orderItemCountEl) orderItemCountEl.textContent = checkedNum + ' 件';
    if (orderSubtotalEl) orderSubtotalEl.textContent = formatPrice(sub);
    if (orderShippingEl) orderShippingEl.textContent = '结算页计算';
    if (orderTaxEl) orderTaxEl.textContent = '结算页计算';
    if (orderDiscountEl) orderDiscountEl.textContent = discount > 0 ? '-' + formatPrice(discount) : formatPrice(0);
    if (orderGrandTotalEl) orderGrandTotalEl.textContent = formatPrice(grand);

    // 全选状态同步
    var allChecked = cartData.length > 0 && cartData.every(function (i) { return i.checked; });
    if (selectAllTop) selectAllTop.checked = allChecked;
    if (selectAllBottom) selectAllBottom.checked = allChecked;

    // 删除选中按钮状态
    if (deleteSelectedBtn) deleteSelectedBtn.disabled = checkedNum === 0;
    if (deleteSelectedBtnTop) deleteSelectedBtnTop.disabled = checkedNum === 0;
    // 右侧「去结算」按钮状态
    if (sidebarCheckoutBtn) sidebarCheckoutBtn.disabled = checkedNum === 0;
  }

  // ---------- 显示/隐藏切换 ----------
  function showEmpty() {
    if (cartContainerEl) cartContainerEl.style.display = 'none';
    if (cartEmptyEl) cartEmptyEl.style.display = '';
    var recSection = document.querySelector('.cart-recommend');
    if (recSection) recSection.style.display = 'none';
  }

  function showList() {
    if (cartContainerEl) cartContainerEl.style.display = '';
    if (cartEmptyEl) cartEmptyEl.style.display = 'none';
    var recSection = document.querySelector('.cart-recommend');
    if (recSection) recSection.style.display = '';
  }

  // ---------- 查找商品索引 ----------
  function findItemIndex(id) {
    for (var i = 0; i < cartData.length; i++) {
      if (cartData[i].id === id) return i;
    }
    return -1;
  }

  function findRecItem(id) {
    for (var i = 0; i < recommendData.length; i++) {
      if (recommendData[i].id === id) return recommendData[i];
    }
    return null;
  }

  // 将「猜你喜欢」商品加入购物车（使用默认规格）
  function addRecToCart(recId) {
    var rec = findRecItem(recId);
    if (!rec) return;
    var newId = 'rc_' + recId + '_' + Date.now();
    cartData.push({
      id: newId,
      name: rec.name,
      image: rec.image,
      price: rec.price,
      specs: { color: '自然黑', length: '24 英寸', cap: '1包' },
      specOptions: {
        color: ['自然黑', '深棕', '栗棕'],
        length: ['20 英寸', '22 英寸', '24 英寸', '26 英寸'],
        cap: ['1包', '3包', '5包']
      },
      qty: 1,
      checked: true,
      hasGift: false,
      giftName: '',
      giftImage: 'images/zp1.png',
      discountTip: '',
      discountRule: null,
      discountType: 'none',
      discountRate: 0,
      discountMin: 0,
      deliveryText: '预计送达时间：7月30日至8月3日'
    });
    renderCartList();
  }

  // ---------- 事件委托（列表区域） ----------
  if (cartListEl) {
    cartListEl.addEventListener('click', function (e) {
      var target = e.target;

      // 单选复选框
      var checkInput = target.closest('[data-item-check]');
      if (checkInput) {
        var id = checkInput.getAttribute('data-item-check');
        var idx = findItemIndex(id);
        if (idx !== -1) {
          cartData[idx].checked = checkInput.checked;
          renderCartList();
        }
        return;
      }

      // 数量减
      var minusBtn = target.closest('[data-qty-minus]');
      if (minusBtn && !minusBtn.disabled) {
        var id = minusBtn.getAttribute('data-qty-minus');
        var idx = findItemIndex(id);
        if (idx !== -1 && cartData[idx].qty > 1) {
          cartData[idx].qty--;
          renderCartList();
        }
        return;
      }

      // 数量加
      var plusBtn = target.closest('[data-qty-plus]');
      if (plusBtn) {
        var id = plusBtn.getAttribute('data-qty-plus');
        var idx = findItemIndex(id);
        if (idx !== -1 && cartData[idx].qty < 99) {
          cartData[idx].qty++;
          renderCartList();
        }
        return;
      }

      // 移至收藏
      var favBtn = target.closest('[data-fav]');
      if (favBtn) {
        var favId = favBtn.getAttribute('data-fav');
        var favItem = findItem(favId);
        if (favItem) {
          alert('已将「' + favItem.name + '」移至收藏');
          var favIdx = findItemIndex(favId);
          if (favIdx !== -1) cartData.splice(favIdx, 1);
          renderCartList();
        }
        return;
      }

      // 删除
      var delBtn = target.closest('[data-delete]');
      if (delBtn) {
        var id = delBtn.getAttribute('data-delete');
        var idx = findItemIndex(id);
        if (idx !== -1) {
          cartData.splice(idx, 1);
          renderCartList();
        }
        return;
      }

      // 点击规格下拉图标：展开/收起规格菜单
      var toggleBtn = target.closest('[data-spec-toggle]');
      if (toggleBtn) {
        var id = toggleBtn.getAttribute('data-spec-toggle');
        var menuEl = cartListEl.querySelector('[data-spec-menu="' + id + '"]');
        var isOpen = menuEl && menuEl.classList.contains('open');
        // 先收起所有菜单
        closeAllSpecMenus();
        if (!isOpen && menuEl) {
          buildSpecMenu(id, menuEl);
          menuEl.classList.add('open');
        }
        return;
      }

      // 点击菜单内某项：更换规格
      var optBtn = target.closest('[data-spec-opt]');
      if (optBtn) {
        var id = optBtn.getAttribute('data-spec-id');
        var specKey = optBtn.getAttribute('data-spec-key');
        var value = optBtn.getAttribute('data-spec-opt');
        var idx = findItemIndex(id);
        if (idx !== -1) {
          cartData[idx].specs[specKey] = value;
          renderCartList();
        }
        return;
      }

      // 点击折扣说明下拉图标
      var discBtn = target.closest('[data-disc-toggle]');
      if (discBtn) {
        var id = discBtn.getAttribute('data-disc-toggle');
        var popEl = cartListEl.querySelector('[data-disc-pop="' + id + '"]');
        if (popEl) popEl.classList.toggle('open');
        return;
      }
    });

    // 数量输入框直接修改
    cartListEl.addEventListener('change', function (e) {
      if (e.target.matches('[data-qty-input]')) {
        var id = e.target.getAttribute('data-qty-input');
        var val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 99) val = 99;
        var idx = findItemIndex(id);
        if (idx !== -1) {
          cartData[idx].qty = val;
          renderCartList();
        }
      }
    });
  }

  // ---------- 全选 ----------
  function handleSelectAll(checked) {
    cartData.forEach(function (item) { item.checked = checked; });
    renderCartList();
  }

  if (selectAllTop) {
    selectAllTop.addEventListener('change', function () { handleSelectAll(this.checked); });
  }
  if (selectAllBottom) {
    selectAllBottom.addEventListener('change', function () { handleSelectAll(this.checked); });
  }

  // ---------- 删除选中（顶部/底部共用） ----------
  function onDeleteSelected() {
    var checkedIds = getCheckedItems().map(function (i) { return i.id; });
    if (!checkedIds.length) return;
    cartData = cartData.filter(function (i) { return checkedIds.indexOf(i.id) === -1; });
    renderCartList();
  }
  if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', onDeleteSelected);
  if (deleteSelectedBtnTop) deleteSelectedBtnTop.addEventListener('click', onDeleteSelected);

  // ---------- 结算按钮（右侧订单摘要「去结算」） ----------
  function onCheckout() {
    var items = getCheckedItems();
    if (!items.length) {
      alert('请先选择要结算的商品');
      return;
    }
    if (typeof window.ShopRouter !== 'undefined') {
      window.ShopRouter.loadPage('checkout');
    } else {
      window.location.href = 'checkout/checkout.html';
    }
  }

  if (sidebarCheckoutBtn) sidebarCheckoutBtn.addEventListener('click', onCheckout);

  // ---------- 去逛逛（空购物车） ----------
  if (goShoppingBtn) {
    goShoppingBtn.addEventListener('click', function (e) {
      e.preventDefault();
      navigateToHome();
    });
  }

  // 面包屑首页
  if (bcHomeLink) {
    bcHomeLink.addEventListener('click', function (e) {
      e.preventDefault();
      navigateToHome();
    });
  }

  function navigateToHome() {
    if (typeof window.ShopRouter !== 'undefined') {
      window.ShopRouter.loadPage('new-arrivals');
    } else {
      window.location.hash = '#new-arrivals';
    }
  }

  // ---------- 猜你喜欢：收藏 / 加入购物车 / 跳转详情 ----------
  if (recGridEl) {
    recGridEl.addEventListener('click', function (e) {
      // 加入购物车
      var addBtn = e.target.closest('[data-rec-add]');
      if (addBtn) {
        var addId = addBtn.getAttribute('data-rec-add');
        var recItem = findRecItem(addId);
        alert('已将「' + (recItem ? recItem.name : '商品') + '」加入购物车');
        addRecToCart(addId);
        return;
      }
      // 收藏
      var favBtn = e.target.closest('[data-rec-fav]');
      if (favBtn) {
        var favId = favBtn.getAttribute('data-rec-fav');
        var favRec = findRecItem(favId);
        alert('已将「' + (favRec ? favRec.name : '商品') + '」移至收藏');
        favBtn.classList.toggle('wished');
        return;
      }
      // 跳转详情
      var card = e.target.closest('.cart-rec-card');
      if (card) {
        var page = card.getAttribute('data-page');
        if (page && typeof window.ShopRouter !== 'undefined') {
          window.ShopRouter.loadPage(page);
        } else if (page) {
          window.location.hash = '#' + page;
        }
      }
    });
  }

  // ---------- 初始化 ----------
  renderCartList();
  renderRecommend();

})();
