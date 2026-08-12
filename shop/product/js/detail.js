// 商品落地页交互
(function () {
  'use strict';

  // 点击右侧「评价数」一键滚动到评论区
  (function initRatingScroll() {
    var trigger = document.getElementById('pdRatingCount');
    var target = document.getElementById('pdReviewsSection');
    if (!trigger || !target) return;
    function scrollToReviews() {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    trigger.addEventListener('click', scrollToReviews);
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToReviews();
      }
    });
  })();

  // 图库切换
  var mainImage = document.getElementById('pdMainImage');
  var mainGallery = document.querySelector('.pd-gallery-main');
  var thumbs = document.querySelectorAll('.pd-thumb[data-src]');
  var thumbsContainer = document.getElementById('pdGalleryThumbs');
  var thumbPrev = document.querySelector('.pd-thumb-prev');
  var thumbNext = document.querySelector('.pd-thumb-next');
  var playBtn = document.getElementById('pdPlayBtn');

  function syncVideoState(thumb) {
    if (!mainGallery) return;
    if (thumb && thumb.getAttribute('data-type') === 'video') {
      mainGallery.classList.add('is-video');
    } else {
      mainGallery.classList.remove('is-video');
    }
  }

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
      selectThumb(t);
    });
  });

  // 选择指定缩略图并更新主图 / 计数 / 视频态
  function selectThumb(t) {
    if (!t) return;
    var src = t.getAttribute('data-src');
    if (mainImage && src) mainImage.src = src;
    thumbs.forEach(function (x) { x.classList.remove('active'); });
    t.classList.add('active');
    syncVideoState(t);
    updateGalleryCounter();
    scrollThumbIntoView(t);
  }

  // 主图左右切换 + 计数显示（当前第几张/共多少张）
  var galleryPrev = document.getElementById('pdGalleryPrev');
  var galleryNext = document.getElementById('pdGalleryNext');
  var galleryCounter = document.getElementById('pdGalleryCounter');

  function currentIndex() {
    for (var i = 0; i < thumbs.length; i++) {
      if (thumbs[i].classList.contains('active')) return i;
    }
    return 0;
  }

  function updateGalleryCounter() {
    if (!galleryCounter) return;
    galleryCounter.textContent = (currentIndex() + 1) + '/' + thumbs.length;
  }

  function navigateGallery(dir) {
    if (!thumbs.length) return;
    var idx = currentIndex();
    idx = (idx + dir + thumbs.length) % thumbs.length; // 循环切换
    selectThumb(thumbs[idx]);
  }

  function scrollThumbIntoView(t) {
    if (!thumbsContainer || !t) return;
    var top = t.offsetTop - thumbsContainer.clientHeight / 2 + t.clientHeight / 2;
    thumbsContainer.scrollTo({ top: top, behavior: 'smooth' });
  }

  if (galleryPrev) galleryPrev.addEventListener('click', function () { navigateGallery(-1); });
  if (galleryNext) galleryNext.addEventListener('click', function () { navigateGallery(1); });

  if (playBtn) {
    playBtn.addEventListener('click', function () {
      // 当前为视频封面，点击可在此处插入真实 <video> 播放；此处仅作占位反馈
      playBtn.classList.add('is-playing');
    });
  }

  // 初始化：根据默认选中的缩略图同步视频状态与计数
  var activeThumb = document.querySelector('.pd-thumb.active');
  syncVideoState(activeThumb);
  updateGalleryCounter();

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
      // 跳转到购物车页面
      if (typeof window.ShopRouter !== 'undefined') {
        window.ShopRouter.loadPage('cart/cart.html');
      } else {
        window.location.hash = '#cart';
      }
    });
  }
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function () {
      // TODO: 接入结算流程
      alert('立即购买 - 跳转结算页');
    });
  }

  // 产品详情「查看更多」逐步展开 / 收起
  function initSellPointsToggle() {
    var box = document.getElementById('pdSellpoints');
    var toggle = document.getElementById('pdSpToggle');
    var textEl = toggle ? toggle.querySelector('.pd-sp-toggle-text') : null;
    if (!box || !toggle || !textEl) return;

    var sections = Array.prototype.slice.call(box.querySelectorAll('.pd-sp-section'));
    if (sections.length <= 2) return; // 内容不多时无需折叠

    // 默认只展示前 2 个版块，其余隐藏
    var visibleCount = 2;
    function applyVisibility() {
      sections.forEach(function (sec, i) {
        sec.style.display = i < visibleCount ? '' : 'none';
      });
    }
    applyVisibility();

    function isAllShown() {
      return visibleCount >= sections.length;
    }

    function renderState() {
      if (isAllShown()) {
        box.classList.add('is-expanded');
        textEl.textContent = '收起';
      } else {
        box.classList.remove('is-expanded');
        textEl.textContent = '查看更多';
      }
    }
    renderState();

    toggle.addEventListener('click', function () {
      if (isAllShown()) {
        // 收起：回到默认前 2 个版块
        visibleCount = 2;
        applyVisibility();
        renderState();
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // 每次再多展开一个版块
        visibleCount += 1;
        applyVisibility();
        renderState();
        if (!isAllShown()) {
          // 还有更多，滚动让刚出现的新版块可见
          var last = sections[visibleCount - 1];
          if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }
  initSellPointsToggle();

  // 评价区 Tab 点击 → 平滑滚动到对应版块
  (function initReviewTabs() {
    var tabs = document.querySelectorAll('.pd-reviews-tabs button');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var targetId = tab.getAttribute('data-target');
        var target = document.getElementById(targetId);
        if (target) {
          var top = target.getBoundingClientRect().top + window.pageYOffset - 16;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  })();
})();
