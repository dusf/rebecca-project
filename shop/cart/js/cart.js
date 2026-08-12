/* ============================================
   NOIRÉ HAIR — 购物车页面 JS
   ============================================ */

(function () {
  'use strict';

  // ---------- 模拟数据 ----------
  var cartData = [
    {
      id: 'p001',
      name: 'NOIRÉ 13x4 透明蕾丝前额假发',
      image: '../images/zp1.png',
      price: 189.99,
      specs: { color: '#1B (自然黑)', length: '24 inch', density: '180%', cap: '中号' },
      qty: 1,
      checked: true,
      hasGift: true,
      giftName: '丝绸袋子 + 发卡 + 睡帽'
    },
    {
      id: 'p002',
      name: 'NOIRÉ HD 5x5 闭合式蕾丝假发',
      image: '../images/zp2.png',
      price: 229.99,
      specs: { color: '#2 (深棕)', length: '22 inch', density: '200%', cap: '大号' },
      qty: 2,
      checked: true,
      hasGift: false
    },
    {
      id: 'p003',
      name: 'NOIRÉ 全手织蕾丝前额假发',
      image: '../images/zp3.png',
      price: 299.99,
      specs: { color: '#1B (自然黑)', length: '26 inch', density: '220%', cap: '小号' },
      qty: 1,
      checked: false,
      hasGift: false
    }
  ];

  var recommendData = [
    { name: 'NOIRÉ 13x4 透明蕾丝前额假发', image: '../images/zp1.png', price: 189.99, oldPrice: 239.99 },
    { name: 'NOIRÉ HD 5x5 闭合式蕾丝假发', image: '../images/zp2.png', price: 229.99, oldPrice: 279.99 },
    { name: 'NOIRÉ 全手织蕾丝前额假发', image: '../images/zp3.png', price: 299.99, oldPrice: 359.99 },
    { name: 'NOIRÉ 直发水波纹假发', image: '../images/l4.png', price: 259.99, oldPrice: 309.99 },
    { name: 'NOIRÉ 深卷波浪假发', image: '../images/hair_model_asset_3.png', price: 279.99, oldPrice: 329.99 }
  ];

  var FREE_SHIPPING_THRESHOLD = 229;

  // ---------- DOM 引用 ----------
  var cartListEl = document.getElementById('cartList');
  var cartEmptyEl = document.getElementById('cartEmpty');
  var cartContainerEl = document.getElementById('cartContainer');
  var totalCountEl = document.getElementById('cartTotalCount');
  var selectedCountEl = document.getElementById('cartSelectedCount');
  var subtotalEl = document.getElementById('cartSubtotal');
  var shippingEl = document.getElementById('cartShipping');
  var grandTotalEl = document.getElementById('cartGrandTotal');

  var orderItemCountEl = document.getElementById('orderItemCount');
  var orderSubtotalEl = document.getElementById('orderSubtotal');
  var orderShippingEl = document.getElementById('orderShipping');
  var orderDiscountEl = document.getElementById('orderDiscount');
  var orderGrandTotalEl = document.getElementById('orderGrandTotal');

  var selectAllTop = document.getElementById('cartSelectAll');
  var selectAllBottom = document.getElementById('cartSelectAllBottom');
  var deleteSelectedBtn = document.getElementById('cartDeleteSelected');
  var checkoutBtn = document.getElementById('cartCheckoutBtn');
  var sidebarCheckoutBtn = document.getElementById('cartSidebarCheckout');
  var couponInput = document.getElementById('cartCouponInput');
  var couponApplyBtn = document.getElementById('cartCouponApply');
  var goShoppingBtn = document.getElementById('cartGoShopping');
  var recGridEl = document.getElementById('cartRecGrid');

  // ---------- 工具函数 ----------
  function formatPrice(n) {
    return '$' + n.toFixed(2);
  }

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

  // ---------- 渲染商品列表 ----------
  function renderCartList() {
    if (!cartData.length) {
      showEmpty();
      return;
    }
    showList();

    var html = '';
    cartData.forEach(function (item) {
      html += '<div class="cart-item" data-id="' + item.id + '">'
        + '<label class="cart-check-wrap">'
        +   '<input type="checkbox"' + (item.checked ? ' checked' : '') + ' data-item-check="' + item.id + '">'
        +   '<span class="cart-checkbox"></span>'
        + '</label>'
        + '<div class="cart-item-info">'
        +   '<div class="cart-item-img-wrap"><img class="cart-item-img" src="' + item.image + '" alt="' + item.name + '"></div>'
        +   '<div class="cart-item-detail">'
        +     '<h3 class="cart-item-name">' + item.name + '</h3>'
        +     '<div class="cart-item-specs">';
      for (var key in item.specs) {
        html += '<span>' + item.specs[key] + '</span>';
      }
      html += '</div>';
      if (item.hasGift) {
        html += '<div class="cart-item-gift-tag"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" width="12" height="12"><rect x="2" y="6" width="12" height="8" rx="1"/><path d="M8 6V14"/><path d="M10 9H6"/><path d="M11 6C10 5 9 4.5 8.5 4.5S7 5 6 6"/></svg>赠品：' + item.giftName + '</div>';
      }
      html +=   '</div></div>'
        + '<div class="cart-item-price-col">' + formatPrice(item.price) + '</div>'
        + '<div class="cart-item-qty-col">'
        +   '<div class="cart-qty-control">'
        +     '<button type="button" class="cart-qty-btn cart-qty-minus" data-qty-minus="' + item.id + '"' + (item.qty <= 1 ? ' disabled' : '') + '>-</button>'
        +     '<input type="number" class="cart-qty-input" value="' + item.qty + '" min="1" max="99" data-qty-input="' + item.id + '">'
        +     '<button type="button" class="cart-qty-btn cart-qty-plus" data-qty-plus="' + item.id + '">+</button>'
        +   '</div>'
        + '</div>'
        + '<div class="cart-item-total-col">' + formatPrice(item.price * item.qty) + '</div>'
        + '<div class="cart-item-action-col">'
        +   '<button type="button" class="cart-item-delete" data-delete="' + item.id + '">删除</button>'
        + '</div>'
        + '</div>';
    });
    cartListEl.innerHTML = html;
    updateSummary();
  }

  // ---------- 渲染猜你喜欢 ----------
  function renderRecommend() {
    if (!recGridEl) return;
    var html = '';
    recommendData.forEach(function (item) {
      html += '<div class="cart-rec-card" data-page="product/detail">'
        + '<div class="cart-rec-img-wrap"><img class="cart-rec-img" src="' + item.image + '" alt="' + item.name + '"></div>'
        + '<div class="cart-rec-info">'
        +   '<h4 class="cart-rec-name">' + item.name + '</h4>'
        +   '<div class="cart-rec-price">' + formatPrice(item.price)
        +     (item.oldPrice ? '<span class="cart-rec-price-old">' + formatPrice(item.oldPrice) + '</span>' : '')
        +   '</div>'
        + '</div></div>';
    });
    recGridEl.innerHTML = html;
  }

  // ---------- 更新汇总信息 ----------
  function updateSummary() {
    var totalItems = cartData.reduce(function (s, i) { return s + i.qty; }, 0);
    var checkedNum = getCheckedCount();
    var sub = getSubtotal();
    var ship = calcShipping(sub);
    var discount = sub > 300 ? Math.min(sub * 0.05, 30) : 0;
    var grand = sub + ship - discount;

    if (totalCountEl) totalCountEl.textContent = totalItems;
    if (selectedCountEl) selectedCountEl.textContent = checkedNum;
    if (subtotalEl) subtotalEl.textContent = formatPrice(sub);
    if (shippingEl) shippingEl.textContent = ship === 0 ? '免费' : formatPrice(ship);
    if (grandTotalEl) grandTotalEl.textContent = formatPrice(grand);

    if (orderItemCountEl) orderItemCountEl.textContent = checkedNum + ' 件';
    if (orderSubtotalEl) orderSubtotalEl.textContent = formatPrice(sub);
    if (orderShippingEl) orderShippingEl.textContent = ship === 0 ? '免费' : formatPrice(ship);
    if (orderDiscountEl) orderDiscountEl.textContent = '-' + formatPrice(discount);
    if (orderGrandTotalEl) orderGrandTotalEl.textContent = formatPrice(grand);

    // 全选状态同步
    var allChecked = cartData.length > 0 && cartData.every(function (i) { return i.checked; });
    if (selectAllTop) selectAllTop.checked = allChecked;
    if (selectAllBottom) selectAllBottom.checked = allChecked;

    // 删除选中按钮状态
    if (deleteSelectedBtn) deleteSelectedBtn.disabled = checkedNum === 0;
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

  // ---------- 删除选中 ----------
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', function () {
      var checkedIds = getCheckedItems().map(function (i) { return i.id; });
      if (!checkedIds.length) return;
      cartData = cartData.filter(function (i) { return checkedIds.indexOf(i.id) === -1; });
      renderCartList();
    });
  }

  // ---------- 结算按钮 ----------
  function onCheckout() {
    var items = getCheckedItems();
    if (!items.length) {
      alert('请先选择要结算的商品');
      return;
    }
    alert('前往结算页面，共 ' + items.length + ' 种商品，' + getCheckedCount() + ' 件');
  }

  if (checkoutBtn) checkoutBtn.addEventListener('click', onCheckout);
  if (sidebarCheckoutBtn) sidebarCheckoutBtn.addEventListener('click', onCheckout);

  // ---------- 优惠券 ----------
  if (couponApplyBtn) {
    couponApplyBtn.addEventListener('click', function () {
      var code = (couponInput.value || '').trim();
      if (!code) {
        alert('请输入优惠券码');
        return;
      }
      alert('优惠券码 "' + code + '" 已应用（模拟）');
      couponInput.value = '';
    });
  }

  // ---------- 去逛逛（空购物车） ----------
  if (goShoppingBtn) {
    goShoppingBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof window.ShopRouter !== 'undefined') {
        window.ShopRouter.loadPage('new-arrivals');
      } else {
        window.location.hash = '#new-arrivals';
      }
    });
  }

  // ---------- 猜你喜欢点击跳转详情 ----------
  if (recGridEl) {
    recGridEl.addEventListener('click', function (e) {
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
