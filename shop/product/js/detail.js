// 商品落地页交互
(function () {
  'use strict';

  // 图库切换
  var mainImage = document.getElementById('pdMainImage');
  var thumbs = document.querySelectorAll('.pd-thumb[data-src]');
  var thumbsContainer = document.getElementById('pdGalleryThumbs');
  var thumbPrev = document.querySelector('.pd-thumb-prev');
  var thumbNext = document.querySelector('.pd-thumb-next');

  function updateThumbArrows() {
    if (!thumbsContainer || !thumbPrev || !thumbNext) return;
    var scrollTop = thumbsContainer.scrollTop;
    var maxScroll = thumbsContainer.scrollHeight - thumbsContainer.clientHeight;
    thumbPrev.disabled = scrollTop <= 0;
    thumbNext.disabled = maxScroll <= 0 || scrollTop >= maxScroll - 1;
  }

  function scrollThumbs(direction) {
    if (!thumbsContainer) return;
    var step = 74; // 缩略图高度 64 + gap 10
    thumbsContainer.scrollBy({ top: direction * step, behavior: 'smooth' });
  }

  thumbs.forEach(function (t) {
    t.addEventListener('click', function () {
      var src = t.getAttribute('data-src');
      if (mainImage && src) mainImage.src = src;
      thumbs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
    });
  });

  if (thumbPrev) thumbPrev.addEventListener('click', function () { scrollThumbs(-1); });
  if (thumbNext) thumbNext.addEventListener('click', function () { scrollThumbs(1); });
  if (thumbsContainer) thumbsContainer.addEventListener('scroll', updateThumbArrows);
  // 初始化箭头状态
  setTimeout(updateThumbArrows, 0);

  // SKU 选项切换（单选按钮组）
  function initOptionGroup(id) {
    var group = document.getElementById(id);
    if (!group) return;
    var btns = group.querySelectorAll('.pd-option-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        updatePrice();
      });
    });
  }

  initOptionGroup('pdColorOptions');
  initOptionGroup('pdLengthOptions');
  initOptionGroup('pdBundleOptions');

  // 配送方式切换
  var shippingOptions = document.querySelectorAll('.pd-shipping-option');
  shippingOptions.forEach(function (opt) {
    opt.addEventListener('click', function () {
      shippingOptions.forEach(function (o) { o.classList.remove('active'); });
      opt.classList.add('active');
      var input = opt.querySelector('input[type="radio"]');
      if (input) input.checked = true;
    });
  });

  // 数量增减
  var qtyInput = document.getElementById('pdQtyInput');
  var qtyMinus = document.getElementById('pdQtyMinus');
  var qtyPlus = document.getElementById('pdQtyPlus');
  function setQty(delta) {
    if (!qtyInput) return;
    var v = parseInt(qtyInput.value, 10) || 1;
    v += delta;
    if (v < 1) v = 1;
    if (v > 99) v = 99;
    qtyInput.value = v;
  }
  if (qtyMinus) qtyMinus.addEventListener('click', function () { setQty(-1); });
  if (qtyPlus) qtyPlus.addEventListener('click', function () { setQty(1); });

  // 收藏切换
  var wishBtn = document.getElementById('pdWishlist');
  if (wishBtn) {
    wishBtn.addEventListener('click', function () {
      wishBtn.classList.toggle('active');
      var svg = wishBtn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', wishBtn.classList.contains('active') ? 'currentColor' : 'none');
      }
    });
  }

  // 模拟价格联动（根据套装规格调整价格，便于演示）
  var prices = { '单件': 279, '2包': 529, '3包组合': 749 };
  var originals = { '单件': 399, '2包': 759, '3包组合': 999 };
  var points = { '单件': 56, '2包': 106, '3包组合': 150 };
  function updatePrice() {
    var bundleGroup = document.getElementById('pdBundleOptions');
    var active = bundleGroup ? bundleGroup.querySelector('.pd-option-btn.active') : null;
    var bundle = active ? active.textContent.trim() : '3包组合';
    var price = prices[bundle] || 279;
    var original = originals[bundle] || 399;
    var save = original - price;
    var pct = original > 0 ? Math.round((save / original) * 100) : 0;

    var priceEl = document.getElementById('pdPrice');
    var originalEl = document.getElementById('pdOriginal');
    var discountEl = document.getElementById('pdDiscountTag');
    var memberEl = document.getElementById('pdMemberPrice');
    var pointsEl = document.getElementById('pdPoints');

    if (priceEl) priceEl.textContent = '$' + price.toFixed(2);
    if (originalEl) originalEl.textContent = '$' + original.toFixed(2);
    if (discountEl) discountEl.textContent = '立省 $' + save.toFixed(0) + ' (' + pct + '%)';
    if (memberEl) memberEl.textContent = '$' + (price * 0.95).toFixed(2);
    if (pointsEl) pointsEl.textContent = points[bundle] || 56;
  }
  updatePrice();

  // 按钮事件占位
  var addCartBtn = document.getElementById('pdAddCart');
  var buyNowBtn = document.getElementById('pdBuyNow');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', function () {
      // TODO: 接入购物车逻辑
      alert('已加入购物车');
    });
  }
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function () {
      // TODO: 接入结算流程
      alert('立即购买 - 跳转结算页');
    });
  }
})();
