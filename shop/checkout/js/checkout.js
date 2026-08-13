/* ============================================
   NOIRÉ HAIR — 结算页面 JS
   ============================================ */

(function () {
  'use strict';

  var MAX_POINTS = 1250;          // 用户可用积分
  var POINTS_RATE = 100;          // 100 积分 = 1 美元
  // 积分抵扣上限按订单金额区间封顶（避免无限抵扣）：[区间下限, 区间上限(含), 最大可抵积分]
  var POINT_LIMIT_TIERS = [
    { min: 0, max: 1000, limit: 500 },
    { min: 1000.01, max: 2000, limit: 1000 },
    { min: 2000.01, max: 3000, limit: 1500 },
    { min: 3000.01, max: Infinity, limit: 2000 }
  ];
  var BASE_SUBTOTAL = 498.00;
  var ITEM_DISCOUNT = 129.00;
  var BASE_TAX = 29.70;
  var BASE_SHIPPING = 10.00;

  var currentShipping = BASE_SHIPPING;
  var currentPointsValue = 0.00;  // 初始不自动抵扣，由用户决定是否使用积分
  var currentCouponValue = 0.00;

  var PROMO_DEDUCTION = 30.00;
  var COUPON_DEDUCTION = 25.00;

  // ---------- 优惠券数据 ----------
  var COUPONS = [
    {
      id: 'SAVE10', name: '满 200 减 10', desc: '订单满 ¥200 可用，立减 ¥10', amount: 10,
      validity: { type: 'forever' },
      scope: { type: 'all', text: '全场商品通用' }
    },
    {
      id: 'SAVE25', name: '满 300 减 25', desc: '订单满 ¥300 可用，立减 ¥25', amount: 25,
      validity: { type: 'period', start: '2026-08-01 00:00', end: '2026-12-31 23:59' },
      scope: { type: 'exclude', text: '全场通用，不含生鲜/母婴类及「周年市集」系列' }
    },
    {
      id: 'FREESHIP', name: '免运费券', desc: '本单免运费', amount: 0, freeShipping: true,
      validity: { type: 'period', start: '2026-08-01 00:00', end: '2026-10-31 23:59' },
      scope: { type: 'partial', text: '仅限服饰、家居类目及「秋冬新品」系列' }
    }
  ];
  var selectedCouponId = null; // 已应用/待应用的优惠券 ID

  // ---------- 工具函数 ----------
  function formatPrice(n) {
    return '$' + n.toFixed(2);
  }

  /* ---------- 可搜索 combobox ---------- */
  // 国家 → 区号映射
  var COUNTRY_OPTIONS = [
    { value: 'US', label: '🇺🇸 美国', dial: '+1' },
    { value: 'CN', label: '🇨🇳 中国', dial: '+86' },
    { value: 'FR', label: '🇫🇷 法国', dial: '+33' },
    { value: 'CA', label: '🇨🇦 加拿大', dial: '+1' },
    { value: 'GB', label: '🇬🇧 英国', dial: '+44' },
    { value: 'AU', label: '🇦🇺 澳大利亚', dial: '+61' }
  ];

  // 区号列表（每个国家单独一行，相同区号的国家不合并，避免「美国/加拿大」挤在一起）
  var DIAL_OPTIONS = COUNTRY_OPTIONS.map(function (o) {
    var country = o.label;                                // 如 "🇺🇸 美国"
    var m = country.match(/^(\S+)\s*(.*)$/);
    var name = m ? m[2] : country;                        // 去掉国旗，只留国家名
    return { value: o.dial + '|' + o.value, label: o.dial + ' ' + name }; // 如 "+1 美国"
  });

  function comboSetValue(combo, value) {
    var hidden = combo.querySelector('input[type="hidden"]');
    var input = combo.querySelector('.checkout-combo-input');
    var options = combo._comboOptions || [];
    var found = options.filter(function (o) { return o.value === value; })[0];
    if (hidden) hidden.value = value;
    if (input) input.value = found ? found.label : value;
    if (value && value !== combo.dataset.default) {
      combo.classList.add('has-value');
    } else {
      combo.classList.remove('has-value');
    }
  }

  function comboRenderMenu(combo, filter) {
    var menu = combo.querySelector('.checkout-combo-menu');
    if (!menu) return;
    var options = combo._comboOptions || [];
    var f = (filter || '').trim().toLowerCase();
    menu.innerHTML = '';
    var matched = options.filter(function (o) {
      return !f || o.label.toLowerCase().indexOf(f) !== -1;
    });
    if (!matched.length) {
      var empty = document.createElement('div');
      empty.className = 'checkout-combo-empty';
      empty.textContent = '无匹配项';
      menu.appendChild(empty);
      return;
    }
    var hidden = combo.querySelector('input[type="hidden"]');
    var current = hidden ? hidden.value : '';
    matched.forEach(function (o, i) {
      var opt = document.createElement('div');
      opt.className = 'checkout-combo-option';
      if (o.value === current) opt.classList.add('co-opt-active');
      // 所有下拉项都带序号前缀
      var seq = document.createElement('span');
      seq.className = 'co-opt-seq';
      seq.textContent = (i + 1) + '.';
      opt.appendChild(seq);
      opt.appendChild(document.createTextNode(' ' + o.label));
      opt.addEventListener('mousedown', function (e) {
        e.preventDefault();
        comboSetValue(combo, o.value);
        menu.hidden = true;
        if (typeof combo._comboOnChange === 'function') combo._comboOnChange(o.value);
      });
      menu.appendChild(opt);
    });
  }

  function comboBuild(combo, options, onChange) {
    if (!combo) return;
    combo._comboOptions = options;
    combo._comboOnChange = onChange;
    var input = combo.querySelector('.checkout-combo-input');
    var arrow = combo.querySelector('.checkout-combo-arrow');
    var clear = combo.querySelector('.checkout-combo-clear');
    var menu = combo.querySelector('.checkout-combo-menu');

    function open() {
      // 展开时显示全部选项，不用当前显示值过滤（否则只剩当前选中项）
      comboRenderMenu(combo, '');
      menu.hidden = false;
    }
    function close() {
      menu.hidden = true;
      // 还原文案：非法输入回滚到当前 hidden 值
      comboSetValue(combo, (combo.querySelector('input[type="hidden"]') || {}).value || combo.dataset.default);
    }

    input.addEventListener('focus', open);
    input.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    if (arrow) arrow.addEventListener('click', function (e) { e.stopPropagation(); menu.hidden ? open() : close(); });
    input.addEventListener('input', function () { comboRenderMenu(combo, input.value); menu.hidden = false; });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
    if (clear) {
      clear.addEventListener('click', function (e) {
        e.stopPropagation();
        comboSetValue(combo, combo.dataset.default);
        menu.hidden = true;
        if (typeof combo._comboOnChange === 'function') combo._comboOnChange(combo.dataset.default);
      });
    }

    // 初始值
    var hidden = combo.querySelector('input[type="hidden"]');
    comboSetValue(combo, hidden ? hidden.value : combo.dataset.default);
  }

  function getShopContent() {
    return document.getElementById('shopContent') || document.body;
  }

  function updateRadioCards() {
    var cards = getShopContent().querySelectorAll('.checkout-radio-card');
    cards.forEach(function (card) {
      var input = card.querySelector('input[type="radio"]');
      if (!input) return;
      if (input.checked) {
        card.classList.add('checkout-radio-card-active');
      } else {
        card.classList.remove('checkout-radio-card-active');
      }
    });
  }

  function getDiscountTotal() {
    // 折扣总额 = 商品折扣 + 积分抵扣 + 优惠券/折扣码抵扣（所有优惠项汇总）
    return ITEM_DISCOUNT + currentPointsValue + currentCouponValue;
  }

  function updateDiscountTotal() {
    var el = document.getElementById('coSummaryDiscount');
    if (el) el.textContent = '-' + formatPrice(getDiscountTotal());
  }

  function updateGrandTotal() {
    // 应付总额 = 商品小计 - 折扣总额 + 税费 + 运费
    var grand = BASE_SUBTOTAL - getDiscountTotal() + BASE_TAX + currentShipping;
    var el = document.getElementById('coGrandTotal');
    if (el) el.textContent = formatPrice(Math.max(grand, 0));

    // 本单实付：积分计算基数（不含积分抵扣的应付金额），与应付总额区分
    var earnBaseEl = document.getElementById('coEarnBase');
    if (earnBaseEl) earnBaseEl.textContent = formatPrice(Math.max(getOrderAmount(), 0));
  }

  // 应用优惠券（统一入口：选择或输入均走这里），coupon 为匹配到的券对象或 null（通用码）
  function applyCoupon(coupon, rawCode) {
    var code = rawCode || (coupon ? coupon.id : '');
    selectedCouponId = coupon ? coupon.id : null;
    currentCouponValue = coupon ? (coupon.freeShipping ? 0 : coupon.amount) : PROMO_DEDUCTION;

    if (coupon && coupon.freeShipping) {
      currentShipping = 0;
    } else {
      currentShipping = getStandardShipping();
    }
    updateShippingSummary();

    // 联动输入区：填入对应代码
    var promoInput = document.getElementById('coPromoCode');
    if (promoInput) promoInput.value = code;

    // 右侧摘要抵扣行
    var row = document.getElementById('coCouponRow');
    var deductionEl = document.getElementById('coCouponDeduction');
    var labelEl = document.getElementById('coCouponLabel');
    if (row) row.hidden = false;
    if (deductionEl) deductionEl.textContent = (coupon && coupon.freeShipping) ? '免运费' : '-' + formatPrice(currentCouponValue);
    if (labelEl) {
      if (coupon) labelEl.textContent = '优惠券「' + coupon.name + '」抵扣';
      else labelEl.textContent = '优惠券「' + code + '」抵扣';
    }

    updateDiscountTotal();
    updateGrandTotal();
    updateCouponSnippet();
    refreshPointsMaxDisplay();
    updateShippingCard();
    renderSummaryTips();

    // 联动清除按钮显隐
    var clearBtn = document.getElementById('coPromoClear');
    if (clearBtn) clearBtn.hidden = !code;
  }

  // 输入优惠券代码 → 应用（与选择优惠券联动）
  function applyPromo() {
    var input = document.getElementById('coPromoCode');
    var code = input ? input.value.trim() : '';
    if (!code) {
      // 空值：若已选中优惠券则撤销，否则静默（不再弹窗，避免误触）
      if (selectedCouponId || currentCouponValue > 0) clearCoupon();
      return;
    }
    var matched = COUPONS.filter(function (c) { return c.id.toLowerCase() === code.toLowerCase(); })[0];
    applyCoupon(matched, code); // 匹配到券则选中该券，否则按通用码处理
  }

  function updateShippingSummary() {
    var el = document.getElementById('coSummaryShipping');
    if (el) el.textContent = formatPrice(currentShipping);
  }

  // 当前用于匹配运费档位的订单金额（小计 - 优惠）
  function getStandardSubtotal() {
    return BASE_SUBTOTAL - (ITEM_DISCOUNT + currentCouponValue);
  }

  // 根据所选国家动态刷新标准配送：时效标签 + 当前订单命中运费档位高亮
  function updateShippingCard() {
    var countryCombo = document.getElementById('coCountryCombo');
    var isUS = true;
    if (countryCombo) {
      var hidden = countryCombo.querySelector('input[type="hidden"]');
      isUS = !hidden || hidden.value === 'US';
    }

    var tag = document.getElementById('coStandardTag');
    if (tag) tag.textContent = isUS ? '5 - 8 天' : '8 - 12 天';

    var note = document.getElementById('coShippingNote');
    if (note) note.textContent = isUS
      ? '当前订单已高亮满足条件的运费档位。'
      : '非美国地区时效为 8 - 12 天，运费档位与美国一致。当前订单已高亮满足条件的运费档位。';

    // 高亮当前订单金额命中的档位
    var table = document.getElementById('coShippingTable');
    if (table) {
      var sub = getStandardSubtotal();
      var rows = table.querySelectorAll('tbody tr');
      rows.forEach(function (tr) {
        var min = parseFloat(tr.getAttribute('data-min'));
        var max = parseFloat(tr.getAttribute('data-max'));
        if (sub >= min && sub <= max) tr.classList.add('co-shipping-active');
        else tr.classList.remove('co-shipping-active');
      });
    }

    // 收起状态下也直接显示标准配送当前运费（免费 / 具体金额）
    var stdTag = document.getElementById('coStandardTag');
    if (stdTag) {
      var stdFee = getStandardShipping();
      stdTag.textContent = stdFee > 0 ? ('5 - 8 天 · ' + formatPrice(stdFee)) : '5 - 8 天 · 免费';
    }
  }

  // 按订单金额查运费档位表，返回「标准配送」运费（命中免邮档返回 0）
  function getStandardShipping() {
    var sub = getStandardSubtotal();
    var table = document.getElementById('coShippingTable');
    if (!table) return BASE_SHIPPING;
    var hit = 0;
    table.querySelectorAll('tr').forEach(function (tr) {
      var min = parseFloat(tr.getAttribute('data-min'));
      var max = parseFloat(tr.getAttribute('data-max'));
      if (sub >= min && sub <= max) {
        var feeText = tr.querySelector('.co-shipping-fee').textContent.trim();
        if (feeText.indexOf('免费') !== -1) hit = 0;
        else hit = parseFloat(feeText.replace(/[^0-9.]/g, '')) || 0;
      }
    });
    return hit;
  }

  function handleShippingChange(e) {
    var target = e.target.closest('input[name="shipping"]');
    if (!target) return;

    var std = getStandardShipping();
    if (target.value === 'standard') {
      currentShipping = std;
    } else if (target.value === 'express') {
      currentShipping = std + 8; // 加急 = 对应标准档位运费 + $8
    }

    updateRadioCards();
    updateShippingSummary();
    updateGrandTotal();
  }

  function handlePaymentChange(e) {
    var target = e.target.closest('input[name="payment"]');
    if (target) {
      updateRadioCards();
      toggleCardForm();
    }
  }

  function toggleCardForm() {
    var form = getShopContent().querySelector('#coCardForm');
    var cardInput = getShopContent().querySelector('input[name="payment"][value="card"]');
    if (!form || !cardInput) return;
    if (cardInput.checked) {
      form.removeAttribute('hidden');
    } else {
      form.setAttribute('hidden', '');
    }
  }

  function formatCardNumber(e) {
    var input = e.target;
    var v = input.value.replace(/\D/g, '').substring(0, 19);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatCardExpiry(e) {
    var input = e.target;
    var v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) {
      input.value = v.substring(0, 2) + '/' + v.substring(2);
    } else {
      input.value = v;
    }
  }

  function validateCardForm() {
    var cardInput = getShopContent().querySelector('input[name="payment"][value="card"]');
    if (!cardInput || !cardInput.checked) return true;
    var numberEl = document.getElementById('coCardNumber');
    var expiryEl = document.getElementById('coCardExpiry');
    var cvvEl = document.getElementById('coCardCvv');
    var nameEl = document.getElementById('coCardName');
    var number = numberEl ? numberEl.value.replace(/\s/g, '') : '';
    var expiry = expiryEl ? expiryEl.value.trim() : '';
    var cvv = cvvEl ? cvvEl.value.trim() : '';
    var name = nameEl ? nameEl.value.trim() : '';
    if (number.length < 13 || !/^\d+$/.test(number)) { alert('请输入有效的信用卡卡号'); return false; }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) { alert('请输入有效期，格式为 MM/YY'); return false; }
    if (!/^\d{3,4}$/.test(cvv)) { alert('请输入信用卡背面的安全码'); return false; }
    if (!name) { alert('请输入持卡人姓名'); return false; }
    return true;
  }

  // 不含积分抵扣的应付金额（订单金额口径，用于区间上限匹配与奖励积分计算），避免循环依赖
  function getOrderAmount() {
    return BASE_SUBTOTAL - (ITEM_DISCOUNT + currentCouponValue) + BASE_TAX + currentShipping;
  }

  // 根据订单金额区间返回本单「积分抵扣」的最大可抵积分上限
  function getPointLimitByOrderAmount() {
    var amount = getOrderAmount();
    for (var i = 0; i < POINT_LIMIT_TIERS.length; i++) {
      var t = POINT_LIMIT_TIERS[i];
      if (amount > t.min && amount <= t.max) return t.limit;
    }
    return POINT_LIMIT_TIERS[POINT_LIMIT_TIERS.length - 1].limit;
  }

  // 本单最多可用积分数：受「用户可用积分」「区间封顶积分」「应付金额对应可抵积分」三者较小值限制
  function getMaxDeductPoints() {
    var maxByPayable = Math.floor(getOrderAmount() * POINTS_RATE); // 应付金额可抵积分
    return Math.min(MAX_POINTS, getPointLimitByOrderAmount(), maxByPayable);
  }
  function pointsToValue(points) {
    return points / POINTS_RATE;
  }

  // 折叠头部右侧摘要：仅显示短信息（多语言友好）
  // "最多可抵"已在折叠体内"抵扣积分规则"块(coMaxDeduct)展示，此处不重复
  function updatePointsHeaderSummary() {
    var el = document.getElementById('coPointsHeaderSummary');
    if (!el) return;
    if (currentPointsValue > 0) {
      el.textContent = '已抵 ' + formatPrice(currentPointsValue);
    } else {
      el.textContent = '可用 ' + MAX_POINTS.toLocaleString('en-US');
    }
  }

  function handlePointsChange() {
    var input = document.getElementById('coPoints');
    var valueEl = document.getElementById('coPointsValue');
    var remainEl = document.getElementById('coPointsRemain');
    var summaryEl = document.getElementById('coSummaryPoints');
    if (!input) return;

    var maxPoints = getMaxDeductPoints();
    var points = parseInt(input.value, 10) || 0;
    if (points < 0) points = 0;
    if (points > maxPoints) {
      points = maxPoints;
      input.value = maxPoints;
    }

    var deduction = pointsToValue(points);
    currentPointsValue = deduction;

    if (valueEl) valueEl.textContent = '-' + formatPrice(deduction);
    if (remainEl) remainEl.textContent = '剩余 ' + (MAX_POINTS - points) + ' 积分';
    if (summaryEl) summaryEl.textContent = '-' + formatPrice(deduction);
    var pointsRow = document.getElementById('coPointsSummaryRow');
    if (pointsRow) pointsRow.hidden = (currentPointsValue <= 0);
    updatePointsHeaderSummary();
    updateDiscountTotal();
    updateGrandTotal();
    renderSummaryTips();
  }

  function handleNoteInput() {
    var textarea = document.getElementById('coNote');
    var countEl = document.getElementById('coNoteCount');
    if (!textarea || !countEl) return;
    countEl.textContent = textarea.value.length;
  }

  // ---------- 优惠券选择弹层 ----------
  function updateCouponSnippet() {
    var snippetText = document.getElementById('coCouponSnippetText');
    var snippet = document.getElementById('coCouponSnippet');
    if (!snippetText || !snippet) return;
    if (selectedCouponId) {
      var c = COUPONS.filter(function (x) { return x.id === selectedCouponId; })[0];
      snippetText.textContent = c ? (c.name + ' ' + (c.freeShipping ? '免运费' : '-¥' + c.amount)) : '选择优惠券';
      snippet.classList.add('checkout-coupon-snippet-active');
    } else {
      snippetText.textContent = '选择优惠券';
      snippet.classList.remove('checkout-coupon-snippet-active');
    }
  }

  function formatValidity(v) {
    if (!v) return '有效期以活动规则为准';
    if (v.type === 'forever') return '永久有效';
    if (v.type === 'period') return v.start + ' ~ ' + v.end;
    return '';
  }

  function renderCouponDialog() {
    var list = document.getElementById('coCouponList');
    if (!list) return;
    list.innerHTML = '';
    COUPONS.forEach(function (c) {
      var item = document.createElement('div');
      item.className = 'co-coupon-item';
      item.setAttribute('data-id', c.id);
      if (c.id === selectedCouponId) item.classList.add('co-coupon-item-selected');
      var tag = c.freeShipping ? '免运费' : '立减 ¥' + c.amount;
      item.innerHTML =
        '<div class="co-coupon-item-radio"></div>' +
        '<div class="co-coupon-item-body">' +
          '<div class="co-coupon-item-name">' + c.name +
            '<span class="co-coupon-item-copy" data-code="' + c.id + '" role="button" title="复制券码">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
            '</span>' +
          '</div>' +
          '<div class="co-coupon-item-desc">' + c.desc + '</div>' +
          '<div class="co-coupon-item-code">券码：<span class="co-coupon-code-text">' + c.id + '</span></div>' +
          '<div class="co-coupon-item-meta"><span class="co-coupon-meta-ico">🗓</span>有效期：' + formatValidity(c.validity) + '</div>' +
          '<div class="co-coupon-item-meta"><span class="co-coupon-meta-ico">🎯</span>适用：' + (c.scope ? c.scope.text : '全场通用') + '</div>' +
        '</div>' +
        '<div class="co-coupon-item-tag">' + tag + '</div>';
      // 点击卡片选中/取消（复制按钮不触发选中）
      item.addEventListener('click', function (e) {
        if (e.target.closest('.co-coupon-item-copy')) {
          copyCouponCode(c.id, e.target.closest('.co-coupon-item-copy'));
          e.stopPropagation();
          return;
        }
        if (selectedCouponId === c.id) {
          selectedCouponId = null;
        } else {
          selectedCouponId = c.id;
        }
        list.querySelectorAll('.co-coupon-item').forEach(function (el) {
          el.classList.toggle('co-coupon-item-selected', el.getAttribute('data-id') === selectedCouponId);
        });
      });
      list.appendChild(item);
    });
  }

  function copyCouponCode(code, btnEl) {
    var done = function () {
      if (!btnEl) return;
      btnEl.classList.add('co-coupon-item-copy-ok');
      var prevTitle = btnEl.getAttribute('title');
      btnEl.setAttribute('title', '已复制');
      setTimeout(function () {
        btnEl.classList.remove('co-coupon-item-copy-ok');
        btnEl.setAttribute('title', prevTitle);
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, function () {
        fallbackCopy(code);
        done();
      });
    } else {
      fallbackCopy(code);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function openCouponDialog() {
    var overlay = document.getElementById('coCouponOverlay');
    if (!overlay) return;
    renderCouponDialog();
    overlay.hidden = false;
  }

  function closeCouponDialog() {
    var overlay = document.getElementById('coCouponOverlay');
    if (overlay) overlay.hidden = true;
  }

  // 「全部」按钮：填入最大可抵积分
  function fillAllPoints() {
    var input = document.getElementById('coPoints');
    if (!input) return;
    input.value = getMaxDeductPoints();
    handlePointsChange();
  }

  function validateForm() {
    var form = document.getElementById('checkoutForm');
    if (!form) return false;
    var required = form.querySelectorAll('[required]');
    for (var i = 0; i < required.length; i++) {
      if (!required[i].value.trim()) {
        required[i].focus();
        return false;
      }
    }
    return true;
  }

  function submitOrder() {
    if (!validateForm()) {
      alert('请填写必要的联系与收货信息');
      return;
    }
    if (!validateCardForm()) return;
    openPayDialog();
  }

  function openPayDialog() {
    var overlay = document.getElementById('coPayOverlay');
    if (!overlay) return;

    // 重置步骤状态（每次打开都从初始态开始）
    var stepAuth = document.getElementById('coPayStepAuth');
    var stepConfirm = document.getElementById('coPayStepConfirm');
    var orderNo = document.getElementById('coPayOrderNo');
    if (stepAuth) {
      stepAuth.classList.add('is-active');
      stepAuth.classList.remove('is-completed');
    }
    if (stepConfirm) {
      stepConfirm.classList.remove('is-active', 'is-completed');
    }
    if (orderNo) orderNo.textContent = '正在生成...';

    overlay.hidden = false;

    // 清理上一次可能残留的定时器
    if (window.__coPayTimer1) clearTimeout(window.__coPayTimer1);
    if (window.__coPayTimer2) clearTimeout(window.__coPayTimer2);

    // 阶段一：银行授权完成，进入订单确认
    window.__coPayTimer1 = setTimeout(function () {
      if (stepAuth) {
        stepAuth.classList.add('is-completed');
        stepAuth.classList.remove('is-active');
      }
      if (stepConfirm) stepConfirm.classList.add('is-active');
      if (orderNo) orderNo.textContent = 'ORD-' + generateOrderNo();
    }, 2500);

    // 阶段二：跳转下单成功页
    window.__coPayTimer2 = setTimeout(function () {
      if (window.__coPayTimer1) clearTimeout(window.__coPayTimer1);
      overlay.hidden = true;
      goToOrderSuccess();
    }, 4800);
  }

  function generateOrderNo() {
    var suffix = Math.floor(Math.random() * 1000000).toString();
    while (suffix.length < 6) suffix = '0' + suffix;
    return '26' + suffix;
  }

  function goToOrderSuccess() {
    if (typeof window.ShopRouter !== 'undefined') {
      window.ShopRouter.loadPage('order-success');
    } else if (window.parent !== window && typeof window.parent.ShopRouter !== 'undefined') {
      window.parent.ShopRouter.loadPage('order-success');
    } else {
      window.location.href = '../order/success.html';
    }
  }

  function navigateToHome(e) {
    if (e) e.preventDefault();
    if (typeof window.ShopRouter !== 'undefined') {
      window.ShopRouter.loadPage('new-arrivals');
    } else {
      window.location.hash = '#new-arrivals';
    }
  }

  function navigateToCart(e) {
    if (e) e.preventDefault();
    if (typeof window.ShopRouter !== 'undefined') {
      window.ShopRouter.loadPage('cart');
    } else {
      window.location.hash = '#cart';
    }
  }

  function bindEvents() {
    var shopContent = getShopContent();

    // 单选卡片状态 + 配送/支付方式切换
    shopContent.addEventListener('change', function (e) {
      handleShippingChange(e);
      handlePaymentChange(e);
    });

    // 积分抵扣：展开折叠区后直接输入积分 / 全部
    var pointsInput = document.getElementById('coPoints');
    var pointsAll = document.getElementById('coPointsAll');
    var pointsHeader = document.getElementById('coPointsHeader');
    if (pointsHeader) pointsHeader.addEventListener('click', togglePointsCollapse);
    if (pointsInput) {
      pointsInput.addEventListener('input', handlePointsChange);
      pointsInput.addEventListener('change', handlePointsChange);
    }
    if (pointsAll) pointsAll.addEventListener('click', fillAllPoints);

    // 备注字数
    var noteInput = document.getElementById('coNote');
    if (noteInput) noteInput.addEventListener('input', handleNoteInput);

    // 优惠券：左侧输入「应用」按钮
    var couponBtn = document.getElementById('coApplyCoupon');
    if (couponBtn) couponBtn.addEventListener('click', applyCoupon);

    // 标准配送：运费说明折叠展开
    var shippingToggle = document.getElementById('coShippingToggle');
    var shippingDetail = document.getElementById('coShippingDetail');
    if (shippingToggle && shippingDetail) {
      shippingToggle.addEventListener('click', function () {
        var expanded = shippingToggle.getAttribute('aria-expanded') === 'true';
        var nowExpanded = !expanded;
        shippingToggle.setAttribute('aria-expanded', nowExpanded ? 'true' : 'false');
        shippingDetail.hidden = !nowExpanded;
      });
    }

    // 优惠券：右侧摘要「选择优惠券」点击 → 打开选择弹层
    var couponSnippet = document.getElementById('coCouponSnippet');
    if (couponSnippet) couponSnippet.addEventListener('click', openCouponDialog);

    // 优惠券弹层：关闭 / 取消 / 应用 / 遮罩点击
    var couponOverlay = document.getElementById('coCouponOverlay');
    var couponClose = document.getElementById('coCouponDialogClose');
    var couponCancel = document.getElementById('coCouponDialogCancel');
    var couponApply = document.getElementById('coCouponDialogApply');
    if (couponClose) couponClose.addEventListener('click', closeCouponDialog);
    if (couponCancel) couponCancel.addEventListener('click', closeCouponDialog);
    if (couponApply) couponApply.addEventListener('click', function () {
      var c = COUPONS.filter(function (x) { return x.id === selectedCouponId; })[0];
      if (c) {
        applyCoupon(c, c.id); // 选择形式 → 应用并联动输入区
      } else {
        // 未选择则清除已应用的优惠券
        clearCoupon();
      }
      closeCouponDialog();
    });
    if (couponOverlay) {
      couponOverlay.addEventListener('click', function (e) {
        if (e.target === couponOverlay) closeCouponDialog();
      });
    }
    function clearCoupon() {
      selectedCouponId = null;
      currentCouponValue = 0;
      currentShipping = getStandardShipping();
      var couponRow = document.getElementById('coCouponRow');
      var couponDeduction = document.getElementById('coCouponDeduction');
      var couponLabel = document.getElementById('coCouponLabel');
      if (couponRow) couponRow.hidden = false;
      if (couponDeduction) couponDeduction.textContent = '-' + formatPrice(0);
      if (couponLabel) couponLabel.textContent = '优惠券抵扣';
      var promoInput = document.getElementById('coPromoCode');
      if (promoInput) promoInput.value = '';
      var clearBtn = document.getElementById('coPromoClear');
      if (clearBtn) clearBtn.hidden = true;
      updateShippingSummary();
      updateDiscountTotal();
      updateGrandTotal();
      updateCouponSnippet();
      refreshPointsMaxDisplay();
      updateShippingCard();
      renderSummaryTips();
    }

    // 折扣码应用按钮
    var promoBtn = document.getElementById('coApplyPromo');
    if (promoBtn) promoBtn.addEventListener('click', applyPromo);

    var promoInput = document.getElementById('coPromoCode');
    if (promoInput) {
      promoInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); applyPromo(); }
      });
      // 实时联动：删除代码（清空输入框）即撤销优惠券，抵扣动态归零
      promoInput.addEventListener('input', function () {
        if (!promoInput.value.trim() && (selectedCouponId || currentCouponValue > 0)) {
          clearCoupon();
        }
      });
    }

    // 清除按钮：一键移除优惠券
    var promoClear = document.getElementById('coPromoClear');
    if (promoClear) promoClear.addEventListener('click', function () {
      if (selectedCouponId || currentCouponValue > 0) clearCoupon();
    });


    // 提交订单
    var submitBtn = document.getElementById('coSubmitOrder');
    if (submitBtn) submitBtn.addEventListener('click', submitOrder);

    // 面包屑首页
    var bcHome = shopContent.querySelector('[data-page="index.html"]');
    if (bcHome) bcHome.addEventListener('click', navigateToHome);

    // 编辑购物车：返回购物车页
    var editCart = document.getElementById('coEditCart');
    if (editCart) editCart.addEventListener('click', navigateToCart);

    // 可搜索 combobox：国家 + 区号联动
    var countryCombo = document.getElementById('coCountryCombo');
    var dialCombo = document.getElementById('coDialCombo');
    comboBuild(dialCombo, DIAL_OPTIONS, null);
    comboBuild(countryCombo, COUNTRY_OPTIONS, function (val) {
      // 切换国家 → 区号自动联动（取该国对应区号）
      var opt = COUNTRY_OPTIONS.filter(function (o) { return o.value === val; })[0];
      if (opt) {
        comboSetValue(dialCombo, opt.dial + '|' + val);
      }
      updateShippingCard(); // 国家变化 → 标准配送时效标签与档位刷新
    });

    // 初始化单选卡片状态
    updateRadioCards();
    toggleCardForm();

    // 信用卡输入格式化
    var cardNumber = document.getElementById('coCardNumber');
    var cardExpiry = document.getElementById('coCardExpiry');
    if (cardNumber) cardNumber.addEventListener('input', formatCardNumber);
    if (cardExpiry) cardExpiry.addEventListener('input', formatCardExpiry);

    // 初始化积分模块（展示可用积分 / 本单最多可抵扣，初始不抵扣）
    initPointsModule();

    // 初始化标准配送卡片（时效标签 + 当前订单命中运费档位）
    updateShippingCard();

    // 初始化金额字段（折扣总额 / 应付总额）
    updateDiscountTotal();
    updateGrandTotal();

    // 初始化摘要区感叹号 tooltip 文案
    renderSummaryTips();
  }

  // 应付/优惠变化时刷新「最多可抵扣」与「可赚积分」展示（不动用户已选的积分抵扣）
  function refreshPointsMaxDisplay() {
    var maxPoints = getMaxDeductPoints();
    var maxValue = pointsToValue(maxPoints);
    var maxEl = document.getElementById('coPointsMax');
    var maxDeductEl = document.getElementById('coMaxDeduct');
    if (maxEl) maxEl.textContent = '-' + formatPrice(maxValue);
    if (maxDeductEl) maxDeductEl.textContent = '-' + formatPrice(maxValue);

    var earnPoints = Math.floor(getOrderAmount());
    var earnEl = document.getElementById('coEarnPoints');
    var earnDescEl = document.getElementById('coEarnDesc');
    if (earnEl) earnEl.textContent = earnPoints + ' 积分';
    if (earnDescEl) earnDescEl.textContent = '本单实付 ' + formatPrice(earnPoints) + '，可获得 ' + earnPoints + ' 积分';

    renderPointsLimitText();
    updatePointsHeaderSummary();
  }

  // 展示本单积分抵扣上限（按订单金额区间封顶）
  function renderPointsLimitText() {
    var limitEl = document.getElementById('coPointsLimitText');
    if (!limitEl) return;
    var limit = getPointLimitByOrderAmount();
    var amount = getOrderAmount();
    var tier = null;
    for (var i = 0; i < POINT_LIMIT_TIERS.length; i++) {
      if (amount > POINT_LIMIT_TIERS[i].min && amount <= POINT_LIMIT_TIERS[i].max) { tier = POINT_LIMIT_TIERS[i]; break; }
    }
    var rangeText = tier
      ? (tier.max === Infinity ? '满 ' + formatPrice(tier.min) + ' 以上' : formatPrice(tier.min) + ' ~ ' + formatPrice(tier.max))
      : '';
    limitEl.textContent = '本单积分抵扣上限 ' + limit + ' 积分（订单金额 ' + rangeText + '）';

    // 感叹号 tooltip：完整抵扣区间规则说明（格式化列表，便于阅读）
    var tipEl = document.getElementById('coMaxDeductTip');
    if (tipEl) {
      var rows = POINT_LIMIT_TIERS.map(function (t) {
        var range = t.max === Infinity
          ? formatPrice(t.min) + ' 以上'
          : formatPrice(t.min) + ' ~ ' + formatPrice(t.max);
        return '<li>' +
          '<span class="co-tip-range">订单金额 ' + range + '</span>' +
          '<span class="co-tip-limit">最多抵扣 ' + t.limit + ' 积分（' + formatPrice(pointsToValue(t.limit)) + '）</span>' +
          '</li>';
      }).join('');
      tipEl.innerHTML = '<div class="co-tip-head">积分抵扣按订单金额区间封顶，非无限抵扣：</div>' +
        '<ul class="co-tip-list">' + rows + '</ul>';

      // 折叠头部感叹号：与"本单最多可抵扣"提示相同，额外追加一句兑换说明
      var headerTip = document.getElementById('coPointsHeaderTip');
      if (headerTip) {
        headerTip.innerHTML = '<div class="co-tip-head">积分抵扣按订单金额区间封顶，非无限抵扣：</div>' +
          '<ul class="co-tip-list">' + rows + '</ul>' +
          '<div class="co-tip-head" style="margin-top:8px">100 积分 = ' + formatPrice(pointsToValue(100)) + '，是否抵扣由你决定，积分也可留着在积分商城兑换配件等。</div>';
      }
    }
  }

  // 摘要区三行感叹号 tooltip 文案（折扣总额 / 税费 / 运费）
  function renderSummaryTips() {
    // —— 折扣总额 ——
    var dTip = document.getElementById('coDiscountTip');
    if (dTip) {
      var itemD = formatPrice(ITEM_DISCOUNT);
      var couponD = formatPrice(currentCouponValue);
      var pointsD = formatPrice(currentPointsValue);
      dTip.innerHTML =
        '<div class="co-tip-head">折扣总额是本单所有优惠的汇总，会从小计中一次性扣除：</div>' +
        '<ul class="co-tip-list">' +
          '<li><span class="co-tip-range">商品折扣</span><span class="co-tip-limit">' + itemD + '</span></li>' +
          '<li><span class="co-tip-range">优惠券 / 折扣码</span><span class="co-tip-limit">' + couponD + '</span></li>' +
          '<li><span class="co-tip-range">积分抵扣</span><span class="co-tip-limit">' + pointsD + '</span></li>' +
        '</ul>' +
        '<div class="co-tip-head" style="margin-top:8px">折扣总额 = 以上各项之和，随你的选择实时更新。</div>';
    }

    // —— 税费 ——
    var tTip = document.getElementById('coTaxTip');
    if (tTip) {
      // 演示口径：应税金额 = 小计 - 商品折扣（不含运费/税费本身）
      var taxable = BASE_SUBTOTAL - ITEM_DISCOUNT;
      var taxNote = formatPrice(BASE_TAX) + '（按应税金额 ' + formatPrice(taxable) + ' 估算）';
      tTip.innerHTML =
        '<div class="co-tip-head">税费说明</div>' +
        '<ul class="co-tip-list">' +
          '<li><span class="co-tip-range">计税基础</span><span class="co-tip-limit">商品小计 − 商品折扣</span></li>' +
          '<li><span class="co-tip-range">当前预估税费</span><span class="co-tip-limit">' + taxNote + '</span></li>' +
        '</ul>' +
        '<div class="co-tip-head" style="margin-top:8px">跨境订单实际税费以目的国海关 / 税务机关最终核定为准，多退少不补。</div>';
    }

    // —— 运费 ——（与左侧「配送方式」档位表口径一致）
    var sTip = document.getElementById('coShippingTip');
    if (sTip) {
      // 读取左侧运费档位表，生成与之一致的说明，并标注当前订单金额命中的档位
      var table = document.getElementById('coShippingTable');
      var sub = getStandardSubtotal();
      var rowsHtml = '';
      if (table) {
        var trs = table.querySelectorAll('tr');
        trs.forEach(function (tr) {
          var min = parseFloat(tr.getAttribute('data-min'));
          var max = parseFloat(tr.getAttribute('data-max'));
          var rangeText = tr.querySelector('td').textContent.trim();
          var feeText = tr.querySelector('.co-shipping-fee').textContent.trim();
          var hit = (sub >= min && sub <= max);
          var rangeStyle = hit ? ' style="font-weight:600;color:var(--color-primary,#b8860b)"' : '';
          var feeStyle = hit ? ' style="font-weight:600;color:var(--color-primary,#b8860b)"' : '';
          var mark = hit ? '（当前订单）' : '';
          rowsHtml += '<li><span class="co-tip-range"' + rangeStyle + '>标准配送 ' + rangeText + '</span>' +
            '<span class="co-tip-limit"' + feeStyle + '>' + feeText + mark + '</span></li>';
        });
      }
      var shipNote;
      if (selectedCouponId) {
        var c = COUPONS.filter(function (x) { return x.id === selectedCouponId; })[0];
        if (c && c.freeShipping) {
          shipNote = '已使用「' + c.name + '」，本单免运费。';
        } else {
          shipNote = '加急配送 = 对应标准档位运费 + $8.00；订单满 $229 自动包邮。';
        }
      } else {
        shipNote = '加急配送 = 对应标准档位运费 + $8.00；订单满 $229 自动包邮。';
      }
      sTip.innerHTML =
        '<div class="co-tip-head">运费按订单金额分档（与左侧配送方式一致）：</div>' +
        '<ul class="co-tip-list">' + rowsHtml + '</ul>' +
        '<div class="co-tip-head" style="margin-top:8px">' + shipNote + '</div>';
    }

    // —— 本单实付 ——（解释与"应付总额"的区别：本单实付是计算积分的基数）
    var eTip = document.getElementById('coEarnBaseTip');
    if (eTip) {
      eTip.innerHTML =
        '<div class="co-tip-head">「本单实付」与「应付总额」的区别：</div>' +
        '<ul class="co-tip-list">' +
          '<li><span class="co-tip-range">本单实付</span><span class="co-tip-limit">积分计算基数，已扣商品折扣与优惠券，但未扣积分抵扣</span></li>' +
          '<li><span class="co-tip-range">应付总额</span><span class="co-tip-limit">最终实际支付的现金，再扣除你使用的积分抵扣</span></li>' +
        '</ul>' +
        '<div class="co-tip-head" style="margin-top:8px">你看到的积分（如本单可获得 408 积分）就是按「本单实付」金额计算的，与应付总额无关。</div>';
    }
  }

  // 初始化积分模块展示信息（不自动抵扣，仅告知用户可用与可抵额度）
  function initPointsModule() {
    var availEl = document.getElementById('coPointsAvailable2');
    var maxEl = document.getElementById('coPointsMax');
    var maxDeductEl = document.getElementById('coMaxDeduct');
    var summaryEl = document.getElementById('coSummaryPoints');
    var earnEl = document.getElementById('coEarnPoints');
    var earnDescEl = document.getElementById('coEarnDesc');

    var maxPoints = getMaxDeductPoints();
    var maxValue = pointsToValue(maxPoints);

    if (availEl) availEl.textContent = MAX_POINTS.toLocaleString('en-US');
    if (maxEl) maxEl.textContent = '-' + formatPrice(maxValue);
    if (maxDeductEl) maxDeductEl.textContent = '-' + formatPrice(maxValue);
    if (summaryEl) summaryEl.textContent = '-' + formatPrice(0);

    // 奖励积分：1 美元消费 = 1 积分（按不含积分抵扣的应付金额）
    var earnPoints = Math.floor(getOrderAmount());
    if (earnEl) earnEl.textContent = earnPoints + ' 积分';
    if (earnDescEl) earnDescEl.textContent = '本单实付 ' + formatPrice(earnPoints) + '，可获得 ' + earnPoints + ' 积分';

    renderPointsLimitText();

    // 重置积分输入状态（默认折叠收起，输入框在展开后直接可见，用户输入即抵扣）
    var header = document.getElementById('coPointsHeader');
    var collapse = document.getElementById('coPointsCollapse');
    var body = document.getElementById('coPointsBody');
    var input = document.getElementById('coPoints');
    var valueEl = document.getElementById('coPointsValue');
    var remainEl = document.getElementById('coPointsRemain');
    if (header) header.setAttribute('aria-expanded', 'false');
    if (collapse) collapse.hidden = true;
    if (body) body.hidden = false;
    if (input) input.value = '';
    if (valueEl) valueEl.textContent = '-' + formatPrice(0);
    if (remainEl) remainEl.textContent = '剩余 ' + MAX_POINTS + ' 积分';
    updatePointsHeaderSummary();
  }

  // 折叠头部点击：展开 / 收起积分模块
  function togglePointsCollapse() {
    var header = document.getElementById('coPointsHeader');
    var collapse = document.getElementById('coPointsCollapse');
    if (!header || !collapse) return;
    var expanded = header.getAttribute('aria-expanded') === 'true';
    var nowExpanded = !expanded;
    header.setAttribute('aria-expanded', nowExpanded ? 'true' : 'false');
    collapse.hidden = !nowExpanded;
  }

  // 如果脚本在页面加载后执行，直接绑定
  // 按当前订单金额档位初始化运费（避免满额仍显示 $10 的 bug），需在 UI 刷新前赋值
  currentShipping = getStandardShipping();
  bindEvents();
  // 刷新右侧运费文本（bindEvents 内 updateShippingCard 只高亮档位，不更新右侧金额）
  updateShippingSummary();

  // 确保页面标题（路由加载时也能覆盖默认标题）
  document.title = 'NOIRÉ HAIR — 安全结算';

  // 支持路由多次加载：脚本只执行一次，事件委托已覆盖后续内容；仅刷新 UI 状态
  document.addEventListener('pageLoaded', function (e) {
    var detail = e.detail || {};
    var path = detail.path || (detail.module ? detail.module + '/' + detail.file : '');
    if (path.indexOf('checkout') !== -1) {
      currentShipping = getStandardShipping();
      currentPointsValue = 0.00;
      currentCouponValue = 0.00;
      selectedCouponId = null;
      var couponRow = document.getElementById('coCouponRow');
      if (couponRow) couponRow.hidden = true;
      var promoInput = document.getElementById('coPromoCode');
      if (promoInput) promoInput.value = '';
      updateDiscountTotal();
      updateRadioCards();
      updateCouponSnippet();
      initPointsModule();
      handleNoteInput();
      // 重置 combobox 到默认值（国家默认 US → 区号 +1）
      var countryCombo = document.getElementById('coCountryCombo');
      var dialCombo = document.getElementById('coDialCombo');
      if (countryCombo) comboSetValue(countryCombo, countryCombo.dataset.default);
      if (dialCombo) comboSetValue(dialCombo, dialCombo.dataset.default);
    }
  });

})();
