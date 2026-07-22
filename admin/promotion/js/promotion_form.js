/* ==================== 折扣表单（新增/编辑）- 通用版 ==================== */
(function () {
  'use strict';

  // 是否编辑模式
  var PF_EDIT_ID = null;
  var PF_DEMO = (typeof window.parent !== 'undefined' && window.parent._promoStore) ? true : false;

  // 当前折扣类型
  var pfCurrentType = 'order_amount';

  // 发布方式 automatic / code
  var pfMethod = 'automatic';

  // 适用客户 eligibility: all / registered / subscribed / specific
  var pfEligibility = 'all';

  // 适用范围状态（产品金额折扣 + 买X送Y 购买/赠送范围共用）
  var PF_SCOPE_STATE = {
    main: { type: null, collections: [], products: [] }, // 产品金额折扣
    xgyBuy: { type: null, collections: [], products: [] }, // 买X送Y 购买范围
    xgyGift: { type: null, collections: [], products: [] } // 买X送Y 赠送范围
  };
  var PF_SCOPE_TARGET = 'main';
  var PF_SCOPE_MODE = 'collection';
  var PF_SCOPE_TITLE = '选择适用对象';

  // 指定客户
  var pfSelectedCustomers = [];
  var pfCustomerTab = 'registered'; // registered | subscribed

  // 运费折扣国家
  var pfSelectedCountries = [];

  // 折扣码
  var pfCode = '';

  // 是否长期有效
  var pfLongTerm = false;

  // ==================== 类型配置 ====================
  var PF_TYPE_CONFIG = {
    order_amount: {
      title: '订单金额折扣',
      desc: '基于整笔订单金额减免',
      icon: 'M9 7h6M9 11h6M9 15h4'
    },
    product_amount: {
      title: '产品金额折扣',
      desc: '基于指定产品/SKU 金额减免',
      icon: 'M3 7h18M3 12h18M3 17h18'
    },
    xgy: {
      title: '买X送Y',
      desc: '满足购买条件赠送商品',
      icon: 'M5 8h14M5 8a2 2 0 110-4M5 8a2 2 0 100 4M19 8a2 2 0 110-4M19 8a2 2 0 100 4M5 16h14M5 16a2 2 0 110 4M5 16a2 2 0 100-4M19 16a2 2 0 110-4M19 16a2 2 0 100 4'
    },
    shipping: {
      title: '运费折扣',
      desc: '减免满足条件的运费',
      icon: 'M3 7h13v10H3zM16 10h4l1 3v4h-5zM7 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z'
    }
  };

  // ==================== 静态数据 ====================
  // 本地占位封面图（SVG data URI，避免外部依赖）
  function pfCover(name, hue) {
    var ch = (name || '?').charAt(0);
    var h1 = hue % 360, h2 = (hue + 35) % 360;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + h1 + ',65%,62%)"/>' +
      '<stop offset="1" stop-color="hsl(' + h2 + ',60%,48%)"/></linearGradient></defs>' +
      '<rect width="80" height="80" rx="8" fill="url(#g)"/>' +
      '<text x="50%" y="52%" font-size="34" fill="#fff" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">' + esc(ch) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  var PF_COLLECTIONS = [
    { id: 'c1', name: '夏季新品', desc: '夏季上新系列', productCount: 12, image: pfCover('夏季新品', 200) },
    { id: 'c2', name: '电子产品', desc: '数码与配件', productCount: 8, image: pfCover('电子产品', 210) },
    { id: 'c3', name: '家居生活', desc: '家居好物', productCount: 15, image: pfCover('家居生活', 25) },
    { id: 'c4', name: '美妆个护', desc: '美妆护肤', productCount: 6, image: pfCover('美妆个护', 330) }
  ];
  // 系列副标题：显示产品数
  function pfCollectionSub(c) { return c.productCount + ' 个产品'; }
  var PF_PRODUCTS = [
    { id: 'p1', name: '无线蓝牙耳机', desc: '旗舰降噪', price: '$199.00', stock: 320, _expanded: true, image: pfCover('无线蓝牙耳机', 200), skus: [{ id: 'p1s1', label: '黑色', price: '$199.00', stock: 180, image: pfCover('黑色', 200) }, { id: 'p1s2', label: '白色', price: '$199.00', stock: 140, image: pfCover('白色', 210) }] },
    { id: 'p2', name: '智能手表', desc: '运动健康', price: '$299.00', stock: 86, _expanded: true, image: pfCover('智能手表', 210), skus: [{ id: 'p2s1', label: '46mm 午夜色', price: '$299.00', stock: 86, image: pfCover('46mm', 210) }] },
    { id: 'p3', name: '便携咖啡机', desc: '桌面胶囊', price: '$89.00', stock: 150, _expanded: true, image: pfCover('便携咖啡机', 25), skus: [{ id: 'p3s1', label: '标准版', price: '$89.00', stock: 150, image: pfCover('标准版', 25) }] },
    { id: 'p4', name: '瑜伽垫', desc: '防滑加厚', price: '$39.00', stock: 540, _expanded: true, image: pfCover('瑜伽垫', 330), skus: [{ id: 'p4s1', label: '紫色', price: '$39.00', stock: 300, image: pfCover('紫色', 330) }, { id: 'p4s2', label: '灰色', price: '$39.00', stock: 240, image: pfCover('灰色', 340) }] }
  ];
  var PF_CUSTOMERS = [
    { id: 'cu1', name: '张伟', email: 'zhangwei@example.com', type: 'registered' },
    { id: 'cu2', name: '李娜', email: 'lina@example.com', type: 'subscribed' },
    { id: 'cu3', name: '王芳', email: 'wangfang@example.com', type: 'registered' },
    { id: 'cu4', name: '刘洋', email: 'liuyang@example.com', type: 'subscribed' },
    { id: 'cu5', name: '陈静', email: 'chenjing@example.com' }
  ];
  var PF_COUNTRIES = [
    { id: 'cn', name: '中国' }, { id: 'us', name: '美国' }, { id: 'jp', name: '日本' },
    { id: 'gb', name: '英国' }, { id: 'de', name: '德国' }, { id: 'fr', name: '法国' },
    { id: 'au', name: '澳大利亚' }, { id: 'ca', name: '加拿大' }, { id: 'sg', name: '新加坡' }
  ];

  // ==================== 工具函数 ====================
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(msg) {
    var t = document.getElementById('pfToast');
    if (!t) { t = document.createElement('div'); t.id = 'pfToast'; t.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:rgba(17,24,39,.9);color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:10000;opacity:0;transition:opacity .25s;'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._t); t._t = setTimeout(function () { t.style.opacity = '0'; }, 2200);
  }

  // datetime 转换： input value = 2026-07-21T14:30  <->  显示 2026-07-21 14:30
  function dtInputToStr(v) { return v ? v.replace('T', ' ') : ''; }
  function dtStrToInput(v) { return v ? v.replace(' ', 'T') : ''; }

  // ==================== 通用区块/组件 HTML ====================
  function pfSection(title, subtitle, inner) {
    return '<div class="form-section-card">' +
      '<div class="form-section-card-header"><div><div class="form-section-card-title">' + esc(title) + '</div>' +
      (subtitle ? '<div class="form-section-card-subtitle">' + esc(subtitle) + '</div>' : '') + '</div></div>' +
      '<div class="form-section-card-body">' + inner + '</div></div>';
  }
  function pfGroup(label, inner, id) {
    return '<div class="form-group"' + (id ? ' id="' + id + '"' : '') + '>' +
      (label ? '<label class="form-label">' + label + '</label>' : '') + inner + '</div>';
  }
  function pfRow(cols) {
    return '<div class="form-row">' + cols.map(function (c) { return '<div class="form-group">' + c + '</div>'; }).join('') + '</div>';
  }

  // radio 组（pill 风格，单选）
  function pfRadioPills(name, options, current, onChange) {
    return '<div class="pf-pill-group" data-name="' + name + '">' + options.map(function (o) {
      var active = (o.value === current) ? ' active' : '';
      return '<div class="pf-pill' + active + '" data-value="' + o.value + '" onclick="' + onChange + '(\'' + name + '\',\'' + o.value + '\')">' + esc(o.label) + '</div>';
    }).join('') + '</div>';
  }
  // checkbox 组（pill 风格，多选）
  function pfCheckPills(name, options, currentArr, onChange) {
    currentArr = currentArr || [];
    return '<div class="pf-pill-group" data-name="' + name + '">' + options.map(function (o) {
      var active = (currentArr.indexOf(o.value) >= 0) ? ' active' : '';
      return '<div class="pf-pill' + active + '" data-value="' + o.value + '" onclick="' + onChange + '(\'' + name + '\',\'' + o.value + '\')">' + esc(o.label) + '</div>';
    }).join('') + '</div>';
  }

  // ==================== 主构建 ====================
  function pfBuildForm() {
    var container = $('formSections');
    if (!container) return;

    var typeCards = Object.keys(PF_TYPE_CONFIG).map(function (k) {
      var c = PF_TYPE_CONFIG[k];
      return '<div class="type-card' + (k === pfCurrentType ? ' selected' : '') + '" data-type="' + k + '" onclick="pfSelectType(\'' + k + '\')">' +
        '<div class="type-card-icon ' + k + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + c.icon + '"/></svg></div>' +
        '<div class="type-card-label">' + esc(c.title) + '</div>' +
        '<div class="type-card-desc">' + esc(c.desc) + '</div></div>';
    }).join('');

    container.innerHTML =
      pfSection('选择折扣类型', '请选择你要创建的折扣类型', '<div class="type-selector">' + typeCards + '</div>') +
      pfSection('基本信息', '', pfBuildBasicSection()) +
      '<div id="typeFieldsWrap"></div>' +
      pfSection('折扣叠加', '允许此折扣与其他类型的折扣同时使用', pfBuildStackingSection());

    pfBuildTypeFields();
  }

  // 基本信息区块
  function pfBuildBasicSection() {
    var nameLabel = pfMethod === 'automatic' ? '折扣标题' : '折扣名称';
    var nameHint = pfMethod === 'automatic'
      ? '此标题将展示在客户的购物车与结算页面'
      : '客户在结算时看到的折扣名称';

    var html = '';
    html += pfGroup(nameLabel + '<span class="required">*</span>', '<input type="text" class="form-input" id="pfName" placeholder="请输入">', 'pfNameWrap');
    html += '<div class="form-hint" id="pfNameHint">' + nameHint + '</div>';

    // 发布方式
    html += '<div style="margin-top:20px;">';
    html += pfGroup('发布方式', pfRadioPills('method', [
      { value: 'automatic', label: '自动折扣' },
      { value: 'code', label: '折扣码' }
    ], pfMethod, 'pfOnRadio'), 'pfMethodWrap');
    html += '<div class="form-hint" style="margin-top:6px;">' + (pfMethod === 'automatic'
      ? '客户无需输入，自动应用于符合条件的订单'
      : '客户必须在结算时输入折扣码') + '</div>';

    // 折扣码（仅 code 形式显示）
    html += '<div id="pfCodeWrap" style="' + (pfMethod === 'code' ? '' : 'display:none;') + 'margin-top:12px;">';
    html += pfGroup('折扣码', '<div class="code-generator"><input type="text" class="form-input" id="pfCode" placeholder="输入自定义折扣码" value="' + esc(pfCode) + '"><button type="button" class="btn btn-secondary" onclick="pfGenCode()">随机生成</button></div>');
    html += '<div class="form-hint">可自定义字符/数字，或点击随机生成</div></div>';
    html += '</div>';

    // 适用客户范围
    html += '<div style="margin-top:20px;">';
    html += pfGroup('适用客户',
      pfRadioPills('pfEligibility', [
        { value: 'all', label: '全部客户' },
        { value: 'registered', label: '注册客户' },
        { value: 'subscribed', label: '订阅客户' },
        { value: 'specific', label: '指定客户' }
      ], pfEligibility, 'pfOnRadio'), 'pfEligibilityWrap');
    html += '<div id="pfCustomerWrap" style="' + (pfEligibility === 'specific' ? '' : 'display:none;') + 'margin-top:12px;">' +
      '<button type="button" class="pf-scope-btn" id="pfCustomerBtn" onclick="pfOpenCustomerDialog()">选择客户 <span id="pfCustomerBtnCount"></span></button>' +
      '<div class="pf-selected-list" id="pfCustomerSelected"></div>' +
      '</div>';
    html += '</div>';

    // 折扣最大使用次数（仅 code 形式显示）
    html += '<div id="pfUsageWrap" style="' + (pfMethod === 'code' ? '' : 'display:none;') + 'margin-top:20px;">';
    html += pfGroup('折扣最大使用次数',
      '<div class="pf-check-list">' +
      '<label class="pf-check-item"><input type="checkbox" id="pfUsageTotalChk" onchange="pfOnUsageChange()"> 限制此折扣可使用的总次数 ' +
      '<input type="number" class="form-input pf-inline-num" id="pfUsageTotalNum" min="1" placeholder="次数" style="display:none;"></label>' +
      '<label class="pf-check-item"><input type="checkbox" id="pfUsagePerCustChk" onchange="pfOnUsageChange()"> 最多客户限使用一次</label>' +
      '</div>');
    html += '</div>';

    // 有效期
    html += '<div style="margin-top:20px;">';
    html += pfGroup('有效日期范围',
      '<div class="pf-datetime-wrap">' +
      '<div class="pf-datetime-item"><label class="pf-dt-label">开始时间</label><input type="datetime-local" class="form-input" id="pfStart"></div>' +
      '<div class="pf-datetime-item"><label class="pf-dt-label">结束时间</label><input type="datetime-local" class="form-input" id="pfEnd"' + (pfLongTerm ? ' disabled' : '') + '></div>' +
      '</div>' +
      '<label class="pf-check-item" style="margin-top:10px;"><input type="checkbox" id="pfLongTerm" onchange="pfToggleLongTerm()"> 长期有效（无结束时间）</label>');
    html += '</div>';

    return html;
  }

  // 折扣叠加区块
  function pfBuildStackingSection() {
    return pfCheckPills('stacking', [
      { value: 'product', label: '支持产品折扣叠加' },
      { value: 'order', label: '支持订单折扣叠加' },
      { value: 'shipping', label: '支持运费折扣叠加' }
    ], [], 'pfOnCheck');
  }

  // ==================== 类型特定字段 ====================
  function pfBuildTypeFields() {
    var wrap = $('typeFieldsWrap');
    if (!wrap) return;
    var html = '';
    if (pfCurrentType === 'order_amount') html = pfBuildOrderAmount();
    else if (pfCurrentType === 'product_amount') html = pfBuildProductAmount();
    else if (pfCurrentType === 'shipping') html = pfBuildShipping();
    else if (pfCurrentType === 'xgy') html = pfBuildXgy();
    wrap.innerHTML = html;
  }

  // 折扣值（百分比/固定金额）通用
  function pfValueBlock(blockId, valueType, percentVal, fixedVal) {
    var html = pfGroup('折扣值',
      pfRadioPills(blockId + 'ValueType', [
        { value: 'percent', label: '百分比（%）' },
        { value: 'fixed', label: '固定金额（$ ）' }
      ], valueType, 'pfOnRadio'), blockId + 'ValueWrap');
    html += '<div class="pf-value-detail" id="' + blockId + 'PercentWrap" style="' + (valueType === 'percent' ? '' : 'display:none;') + 'margin-top:12px;">' +
      pfGroup('折扣百分比', '<div class="pf-input-suffix"><input type="number" class="form-input" id="' + blockId + 'Percent" min="0" max="100" placeholder="0" value="' + (percentVal || '') + '"><span class="pf-suffix">%</span></div>') +
      '</div>';
    html += '<div class="pf-value-detail" id="' + blockId + 'FixedWrap" style="' + (valueType === 'fixed' ? '' : 'display:none;') + 'margin-top:12px;">' +
      pfGroup('减免金额', '<div class="pf-input-suffix"><span class="pf-suffix">$</span><input type="number" class="form-input" id="' + blockId + 'Fixed" min="0" placeholder="0.00" value="' + (fixedVal || '') + '"></div>') +
      '</div>';
    return html;
  }

  // 最低购买要求（单选）通用： none / amount / qty，amountLabel 区分订单/产品
  function pfMinRequireBlock(blockId, reqType, amountVal, qtyVal, amountLabel) {
    var html = '<div class="pf-min-require" style="margin-top:24px;">';
    html += pfGroup('最低购买要求',
      pfRadioPills(blockId + 'MinType', [
        { value: 'none', label: '无最低要求' },
        { value: 'amount', label: amountLabel },
        { value: 'qty', label: '最低购买商品数量（加购数量）' }
      ], reqType, 'pfOnRadio'), blockId + 'MinWrap');
    html += '<div id="' + blockId + 'AmountWrap" style="' + (reqType === 'amount' ? '' : 'display:none;') + 'margin-top:12px;">' +
      pfGroup('最低购买金额', '<div class="pf-input-suffix"><span class="pf-suffix">$</span><input type="number" class="form-input" id="' + blockId + 'MinAmount" min="0" placeholder="0.00" value="' + (amountVal || '') + '"></div>') +
      '</div>';
    html += '<div id="' + blockId + 'QtyWrap" style="' + (reqType === 'qty' ? '' : 'display:none;') + 'margin-top:12px;">' +
      pfGroup('最低购买商品数量', '<div class="pf-input-suffix"><input type="number" class="form-input" id="' + blockId + 'MinQty" min="1" placeholder="0" value="' + (qtyVal || '') + '"><span class="pf-suffix">件</span></div>') +
      '</div>';
    html += '</div>';
    return html;
  }

  // 订单金额折扣
  function pfBuildOrderAmount() {
    var inner = pfValueBlock('oa', 'percent', '', '');
    inner += pfMinRequireBlock('oa', 'none', '', '', '最低购买金额（订单金额 $）');
    return pfSection('优惠规则', '订单金额折扣配置', inner);
  }

  // 产品金额折扣
  function pfBuildProductAmount() {
    var inner = pfValueBlock('pa', 'percent', '', '');
    inner += pfMinRequireBlock('pa', 'none', '', '', '最低购买金额（SKU 价格 $）');
    inner += '<div style="margin-top:20px;">' + pfGroup('适用产品范围',
      pfRadioPills('paScope', [
        { value: 'collection', label: '指定产品系列（可多个）' },
        { value: 'product', label: '指定产品及 SKU（可多个）' }
      ], PF_SCOPE_STATE.main.type || '', 'pfOnRadio'), 'paScopeWrap');
    inner += '<div id="paScopePickWrap" style="' + (PF_SCOPE_STATE.main.type ? '' : 'display:none;') + 'margin-top:12px;" class="pf-scope-trigger">' +
      '<button type="button" class="pf-scope-btn" onclick="pfOpenScopeDialog(\'main\')">选择' + (PF_SCOPE_STATE.main.type === 'product' ? '产品及 SKU' : '产品系列') + ' <span id="paScopeCount"></span></button>' +
      '<div class="pf-selected-list" id="paScopeTags"></div></div>';
    inner += '</div>';
    // 渲染已选标签
    setTimeout(function () { pfRenderScopeTags('main', 'paScopeTags', 'paScopeCount'); }, 0);
    return pfSection('优惠规则', '产品金额折扣配置', inner);
  }

  // 运费折扣
  function pfBuildShipping() {
    var inner = pfGroup('适用国家/地区',
      pfRadioPills('shipCountry', [
        { value: 'all', label: '所有国家/地区' },
        { value: 'specific', label: '指定国家/地区' }
      ], 'all', 'pfOnRadio'), 'shipCountryWrap');
    inner += '<div id="shipCountryPickWrap" style="display:none;margin-top:12px;" class="pf-scope-trigger">' +
      '<button type="button" class="pf-scope-btn" onclick="pfOpenCountryDialog()">选择国家/地区 <span id="shipCountryCount"></span></button>' +
      '<div class="pf-selected-list" id="shipCountryTags"></div></div>';
    inner += '<div style="margin-top:20px;">' +
      pfGroup('排除超过特定金额的运费', '<div class="pf-input-suffix"><span class="pf-suffix">$</span><input type="number" class="form-input" id="pfShipExclude" min="0" placeholder="0.00"></div>') +
      '<div class="form-hint">订单运费超过该金额时，此运费折扣不适用</div></div>';
    return pfSection('优惠规则', '运费折扣配置', inner);
  }

  // 买X送Y
  function pfBuildXgy() {
    var inner = '';
    // 客户满足购买条件
    inner += pfGroup('客户满足购买条件',
      pfRadioPills('xgyBuyType', [
        { value: 'qty', label: '最低购买商品数量（加购数量）' },
        { value: 'amount', label: '最低购买金额（SKU 价格）' }
      ], 'qty', 'pfOnRadio'), 'xgyBuyTypeWrap');
    inner += '<div id="xgyBuyQtyWrap" style="margin-top:12px;">' +
      pfGroup('购买数量', '<div class="pf-input-suffix"><input type="number" class="form-input" id="pfXgyBuyQty" min="1" placeholder="0"><span class="pf-suffix">件</span></div>') + '</div>';
    inner += '<div id="xgyBuyAmountWrap" style="display:none;margin-top:12px;">' +
      pfGroup('购买金额', '<div class="pf-input-suffix"><span class="pf-suffix">$</span><input type="number" class="form-input" id="pfXgyBuyAmount" min="0" placeholder="0.00"></div>') + '</div>';

    // 指定购买的商品范围
    inner += '<div style="margin-top:20px;">' + pfGroup('指定购买的商品范围',
      pfRadioPills('xgyBuyScope', [
        { value: 'product', label: '指定产品及 SKU' },
        { value: 'collection', label: '指定产品系列' }
      ], PF_SCOPE_STATE.xgyBuy.type || '', 'pfOnRadio'), 'xgyBuyScopeWrap');
    inner += '<div id="xgyBuyPickWrap" style="' + (PF_SCOPE_STATE.xgyBuy.type ? '' : 'display:none;') + 'margin-top:12px;" class="pf-scope-trigger">' +
      '<button type="button" class="pf-scope-btn" onclick="pfOpenScopeDialog(\'xgyBuy\')">选择' + (PF_SCOPE_STATE.xgyBuy.type === 'product' ? '产品及 SKU' : '产品系列') + ' <span id="xgyBuyScopeCount"></span></button>' +
      '<div class="pf-selected-list" id="xgyBuyScopeTags"></div></div></div>';

    // 指定送的商品范围
    inner += '<div style="margin-top:20px;">' + pfGroup('指定送的商品范围',
      pfRadioPills('xgyGiftScope', [
        { value: 'product', label: '指定产品及 SKU' },
        { value: 'collection', label: '指定产品系列' }
      ], PF_SCOPE_STATE.xgyGift.type || '', 'pfOnRadio'), 'xgyGiftScopeWrap');
    inner += '<div id="xgyGiftPickWrap" style="' + (PF_SCOPE_STATE.xgyGift.type ? '' : 'display:none;') + 'margin-top:12px;" class="pf-scope-trigger">' +
      '<button type="button" class="pf-scope-btn" onclick="pfOpenScopeDialog(\'xgyGift\')">选择' + (PF_SCOPE_STATE.xgyGift.type === 'product' ? '产品及 SKU' : '产品系列') + ' <span id="xgyGiftScopeCount"></span></button>' +
      '<div class="pf-selected-list" id="xgyGiftScopeTags"></div></div></div>';

    // 送的数量
    inner += '<div style="margin-top:20px;">' +
      pfGroup('赠送数量', '<div class="pf-input-suffix"><input type="number" class="form-input" id="pfXgyGiftQty" min="1" placeholder="0"><span class="pf-suffix">件</span></div>');

    // 折扣价（百分比/每件减免/免费）
    inner += pfGroup('赠送商品折扣',
      pfRadioPills('xgyGiftDiscountType', [
        { value: 'percent', label: '折扣百分比（%）' },
        { value: 'fixed', label: '每件减免金额（$ ）' },
        { value: 'free', label: '免费' }
      ], 'free', 'pfOnRadio'), 'xgyGiftDiscountWrap');
    inner += '<div id="xgyGiftPercentWrap" style="display:none;margin-top:12px;">' +
      pfGroup('折扣百分比', '<div class="pf-input-suffix"><input type="number" class="form-input" id="pfXgyGiftPercent" min="0" max="100" placeholder="0"><span class="pf-suffix">%</span></div>') + '</div>';
    inner += '<div id="xgyGiftFixedWrap" style="display:none;margin-top:12px;">' +
      pfGroup('每件减免金额', '<div class="pf-input-suffix"><span class="pf-suffix">$</span><input type="number" class="form-input" id="pfXgyGiftFixed" min="0" placeholder="0.00"></div>') + '</div>';
    inner += '</div>';

    // 每笔订单最大使用次数
    inner += '<div style="margin-top:20px;">' +
      pfGroup('每笔订单的最大使用次数', '<div class="pf-input-suffix"><input type="number" class="form-input" id="pfXgyMaxPerOrder" min="1" placeholder="不限制则留空"><span class="pf-suffix">次</span></div>');

    return pfSection('优惠规则', '买 X 送 Y 配置', inner);
  }

  // ==================== 交互处理 ====================
  window.pfSelectType = function (type) {
    pfCurrentType = type;
    var cards = document.querySelectorAll('.type-card');
    cards.forEach(function (c) { c.classList.toggle('selected', c.getAttribute('data-type') === type); });
    pfBuildTypeFields();
    pfUpdatePreview();
  };

  // 通用 radio 切换
  window.pfOnRadio = function (name, value) {
    if (name === 'method') { pfMethod = value; pfRebuildBasic(); }
    else if (name === 'pfEligibility') {
      pfEligibility = value;
      var cw = document.getElementById('pfCustomerWrap');
      if (cw) {
        cw.style.display = value === 'specific' ? '' : 'none';
        if (value === 'specific') pfRenderCustomerSelected();
      }
      pfUpdatePreview();
    }
    else if (name === 'oaValueType') { $('oaPercentWrap').style.display = value === 'percent' ? '' : 'none'; $('oaFixedWrap').style.display = value === 'fixed' ? '' : 'none'; }
    else if (name === 'oaMinType') { $('oaAmountWrap').style.display = value === 'amount' ? '' : 'none'; $('oaQtyWrap').style.display = value === 'qty' ? '' : 'none'; }
    else if (name === 'paValueType') { $('paPercentWrap').style.display = value === 'percent' ? '' : 'none'; $('paFixedWrap').style.display = value === 'fixed' ? '' : 'none'; }
    else if (name === 'paMinType') { $('paAmountWrap').style.display = value === 'amount' ? '' : 'none'; $('paQtyWrap').style.display = value === 'qty' ? '' : 'none'; }
    else if (name === 'paScope') { if (PF_SCOPE_STATE.main.type !== value) { PF_SCOPE_STATE.main.type = value; PF_SCOPE_STATE.main.collections = []; PF_SCOPE_STATE.main.products = []; } $('paScopePickWrap').style.display = ''; pfRenderScopeTags('main', 'paScopeTags', 'paScopeCount'); $('paScopePickWrap').querySelector('button').innerHTML = '选择' + (value === 'product' ? '产品及 SKU' : '产品系列') + ' <span id="paScopeCount"></span>'; }
    else if (name === 'shipCountry') { $('shipCountryPickWrap').style.display = value === 'specific' ? '' : 'none'; }
    else if (name === 'xgyBuyType') { $('xgyBuyQtyWrap').style.display = value === 'qty' ? '' : 'none'; $('xgyBuyAmountWrap').style.display = value === 'amount' ? '' : 'none'; }
    else if (name === 'xgyBuyScope') { if (PF_SCOPE_STATE.xgyBuy.type !== value) { PF_SCOPE_STATE.xgyBuy.type = value; PF_SCOPE_STATE.xgyBuy.collections = []; PF_SCOPE_STATE.xgyBuy.products = []; } $('xgyBuyPickWrap').style.display = ''; $('xgyBuyPickWrap').querySelector('button').innerHTML = '选择' + (value === 'product' ? '产品及 SKU' : '产品系列') + ' <span id="xgyBuyScopeCount"></span>'; pfRenderScopeTags('xgyBuy', 'xgyBuyScopeTags', 'xgyBuyScopeCount'); }
    else if (name === 'xgyGiftScope') { if (PF_SCOPE_STATE.xgyGift.type !== value) { PF_SCOPE_STATE.xgyGift.type = value; PF_SCOPE_STATE.xgyGift.collections = []; PF_SCOPE_STATE.xgyGift.products = []; } $('xgyGiftPickWrap').style.display = ''; $('xgyGiftPickWrap').querySelector('button').innerHTML = '选择' + (value === 'product' ? '产品及 SKU' : '产品系列') + ' <span id="xgyGiftScopeCount"></span>'; pfRenderScopeTags('xgyGift', 'xgyGiftScopeTags', 'xgyGiftScopeCount'); }
    else if (name === 'xgyGiftDiscountType') {
      $('xgyGiftPercentWrap').style.display = value === 'percent' ? '' : 'none';
      $('xgyGiftFixedWrap').style.display = value === 'fixed' ? '' : 'none';
    }
    // 重新渲染该组 active 状态
    var group = document.querySelector('.pf-pill-group[data-name="' + name + '"]');
    if (group) { var pills = group.querySelectorAll('.pf-pill'); pills.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-value') === value); }); }
    pfUpdatePreview();
  };

  // 通用 checkbox 切换（多选）
  window.pfOnCheck = function (name, value) {
    var group = document.querySelector('.pf-pill-group[data-name="' + name + '"]');
    if (!group) return;
    var pill = group.querySelector('.pf-pill[data-value="' + value + '"]');
    if (!pill) return;
    pill.classList.toggle('active');
    pfUpdatePreview();
  };

  // 重新构建基本信息区块（method 变化时）
  function pfRebuildBasic() {
    var sections = $('formSections').querySelectorAll('.form-section-card');
    // 基本信息是第二个 section（索引1），叠加是最后一个
    // 找到标题为"基本信息"的
    var basicSec = null;
    for (var i = 0; i < sections.length; i++) {
      var t = sections[i].querySelector('.form-section-card-title');
      if (t && t.textContent === '基本信息') { basicSec = sections[i].querySelector('.form-section-card-body'); break; }
    }
    if (basicSec) basicSec.innerHTML = pfBuildBasicSection();
    if (pfEligibility === 'specific') pfRenderCustomerSelected();
  }

  window.pfOnUsageChange = function () {
    $('pfUsageTotalNum').style.display = $('pfUsageTotalChk').checked ? '' : 'none';
  };

  window.pfGenCode = function () {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    pfCode = code;
    $('pfCode').value = code;
  };

  window.pfToggleLongTerm = function () {
    pfLongTerm = $('pfLongTerm').checked;
    $('pfEnd').disabled = pfLongTerm;
    if (pfLongTerm) $('pfEnd').value = '';
  };

  // ==================== 范围（系列/产品）选择对话框 ====================
  window.pfOpenScopeDialog = function (target) {
    PF_SCOPE_TARGET = target;
    var overlay = $('pfScopeOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.id = 'pfScopeOverlay';
      overlay.innerHTML =
        '<div class="pf-dialog">' +
        '<div class="pf-dialog-header"><div class="pf-dialog-title" id="pfScopeTitle"></div><button class="pf-dialog-close" onclick="pfCloseScopeDialog()">✕</button></div>' +
        '<div class="pf-dialog-search"><input type="text" id="pfScopeSearch" placeholder="搜索..." oninput="pfOnScopeSearch()"></div>' +
        '<div class="pf-dialog-body"><div class="pf-dialog-list" id="pfScopeList"></div></div>' +
        '<div class="pf-dialog-footer pf-dialog-footer--split">' +
          '<div class="pf-dialog-footer-left"><label class="pf-dialog-select-all-check"><input type="checkbox" onchange="pfToggleSelectAllScope()"> 全选</label><span class="pf-dialog-count" id="pfScopeCount2"></span></div>' +
          '<div class="dialog-actions"><button class="btn btn-secondary" onclick="pfCloseScopeDialog()">取消</button><button class="btn btn-primary" onclick="pfConfirmScopeDialog()">确定</button></div>' +
        '</div>' +
        '</div></div>';
      document.body.appendChild(overlay);
    }
    PF_SCOPE_TITLE = (target === 'main' ? '选择适用产品范围' : (target === 'xgyBuy' ? '选择购买的商品范围' : '选择赠送的商品范围'));
    $('pfScopeTitle').textContent = PF_SCOPE_TITLE;
    overlay.style.display = 'flex';
    pfRenderScopeDialog();
  };
  window.pfCloseScopeDialog = function () { var o = $('pfScopeOverlay'); if (o) o.style.display = 'none'; };

  function pfRenderScopeDialog() {
    // 默认展示 collection 或 product（根据当前 target 类型）
    var st = PF_SCOPE_STATE[PF_SCOPE_TARGET];
    var mode = st.type || (PF_SCOPE_TARGET === 'main' ? 'collection' : 'product');
    PF_SCOPE_MODE = mode;
    var list = $('pfScopeList');
    var search = ($('pfScopeSearch') ? $('pfScopeSearch').value : '').toLowerCase();
    var html = '';
    if (mode === 'collection') {
      PF_COLLECTIONS.forEach(function (c) {
        if (search && c.name.toLowerCase().indexOf(search) < 0) return;
        var sel = st.collections.indexOf(c.id) >= 0;
        html += '<div class="pf-dialog-item' + (sel ? ' selected' : '') + '" onclick="pfToggleScopeCol(\'' + c.id + '\')"><input type="checkbox" ' + (sel ? 'checked' : '') + ' onchange="pfToggleScopeCol(\'' + c.id + '\')"><img class="pf-dialog-item-cover" src="' + c.image + '" alt=""><div class="pf-dialog-item-info"><div class="pf-dialog-item-name">' + esc(c.name) + '</div><div class="pf-dialog-item-desc">' + esc(pfCollectionSub(c)) + '</div></div></div>';
      });
    } else {
      PF_PRODUCTS.forEach(function (p) {
        if (search && (p.name.toLowerCase().indexOf(search) < 0 && p.desc.toLowerCase().indexOf(search) < 0)) return;
        var sel = st.products.indexOf(p.id) >= 0;
        var selSku = p.skus.filter(function (s) { return st.products.indexOf(p.id + '|' + s.id) >= 0; }).length;
        var skuDesc = '已选 ' + selSku + ' 个 SKU / 共 ' + p.skus.length + ' 个 SKU';
        html += '<div class="pf-dialog-item' + (sel ? ' selected' : '') + '" onclick="pfToggleScopeProduct(\'' + p.id + '\')"><img class="pf-dialog-item-cover" src="' + p.image + '" alt=""><input type="checkbox" ' + (sel ? 'checked' : '') + ' onchange="pfToggleScopeProduct(\'' + p.id + '\')"><div class="pf-dialog-item-info"><div class="pf-dialog-item-name">' + esc(p.name) + '</div><div class="pf-dialog-item-desc">' + esc(skuDesc) + '</div></div>' +
          '<button class="pf-dialog-item-expand' + (p._expanded ? ' expanded' : '') + '" onclick="event.stopPropagation();pfToggleSku(\'' + p.id + '\')">▾</button>' +
          '<span class="pf-dialog-item-stock">库存 ' + p.stock + '</span></div>';
        if (p._expanded) {
          p.skus.forEach(function (s) {
            var ssel = (st.products.indexOf(p.id + '|' + s.id) >= 0);
            html += '<div class="pf-dialog-sku-item' + (ssel ? ' selected' : '') + '" onclick="pfToggleSkuSel(\'' + p.id + '\',\'' + s.id + '\')"><input type="checkbox" ' + (ssel ? 'checked' : '') + '><span class="sku-label">' + esc(s.label) + '</span><span class="sku-price">' + esc(s.price) + '</span><span class="sku-stock">库存 ' + s.stock + '</span></div>';
          });
        }
        html += '</div>';
      });
    }
    list.innerHTML = html;
    pfRefreshScopeCount();
  }
  window.pfOnScopeSearch = function () { pfRenderScopeDialog(); };
  window.pfToggleScopeCol = function (id) {
    var st = PF_SCOPE_STATE[PF_SCOPE_TARGET];
    var idx = st.collections.indexOf(id);
    if (idx >= 0) st.collections.splice(idx, 1); else st.collections.push(id);
    pfRenderScopeDialog();
  };
  window.pfToggleScopeProduct = function (id) {
    var st = PF_SCOPE_STATE[PF_SCOPE_TARGET];
    var p = PF_PRODUCTS.find(function (x) { return x.id === id; });
    if (!p) return;
    var skuKeys = p.skus.map(function (s) { return p.id + '|' + s.id; });
    var wasChecked = st.products.indexOf(id) >= 0;
    if (wasChecked) {
      // 取消产品级：移除产品本身及其下所有 SKU
      var i1 = st.products.indexOf(id); if (i1 >= 0) st.products.splice(i1, 1);
      skuKeys.forEach(function (k) { var i = st.products.indexOf(k); if (i >= 0) st.products.splice(i, 1); });
    } else {
      // 选中产品级：选中产品本身及其下所有 SKU
      if (st.products.indexOf(id) < 0) st.products.push(id);
      skuKeys.forEach(function (k) { if (st.products.indexOf(k) < 0) st.products.push(k); });
    }
    pfRenderScopeDialog();
  };
  window.pfToggleSku = function (id) {
    var p = PF_PRODUCTS.find(function (x) { return x.id === id; });
    if (p) p._expanded = !p._expanded;
    pfRenderScopeDialog();
  };
  window.pfToggleSkuSel = function (pid, sid) {
    var st = PF_SCOPE_STATE[PF_SCOPE_TARGET];
    var key = pid + '|' + sid;
    var idx = st.products.indexOf(key);
    if (idx >= 0) st.products.splice(idx, 1); else st.products.push(key);
    // 同步产品级勾选状态：其下 SKU 是否全选
    var p = PF_PRODUCTS.find(function (x) { return x.id === pid; });
    if (p) {
      var allSkuSelected = p.skus.every(function (s) { return st.products.indexOf(pid + '|' + s.id) >= 0; });
      var pIdx = st.products.indexOf(pid);
      if (allSkuSelected && pIdx < 0) st.products.push(pid);
      if (!allSkuSelected && pIdx >= 0) st.products.splice(pIdx, 1);
    }
    pfRenderScopeDialog();
  };
  window.pfToggleSelectAllScope = function () {
    var st = PF_SCOPE_STATE[PF_SCOPE_TARGET];
    if (PF_SCOPE_MODE === 'collection') {
      if (st.collections.length === PF_COLLECTIONS.length) st.collections = []; else st.collections = PF_COLLECTIONS.map(function (c) { return c.id; });
    } else {
      var all = [];
      PF_PRODUCTS.forEach(function (p) { all.push(p.id); p.skus.forEach(function (s) { all.push(p.id + '|' + s.id); }); });
      if (st.products.length === all.length) st.products = []; else st.products = all;
    }
    pfRenderScopeDialog();
  };
  function pfRefreshScopeCount() {
    var st = PF_SCOPE_STATE[PF_SCOPE_TARGET];
    var n = st.collections.length + st.products.length;
    var c = $('pfScopeCount2'); if (c) c.textContent = '已选 ' + n + ' 项';
  }
  window.pfConfirmScopeDialog = function () {
    var target = PF_SCOPE_TARGET;
    pfCloseScopeDialog();
    if (target === 'main') pfRenderScopeTags('main', 'paScopeTags', 'paScopeCount');
    else if (target === 'xgyBuy') pfRenderScopeTags('xgyBuy', 'xgyBuyScopeTags', 'xgyBuyScopeCount');
    else if (target === 'xgyGift') pfRenderScopeTags('xgyGift', 'xgyGiftScopeTags', 'xgyGiftScopeCount');
    pfUpdatePreview();
  };

  // 渲染已选范围标签（搜索框 + 卡片列表）
  function pfScopeTagsId(t) { return t === 'main' ? 'paScopeTags' : (t === 'xgyBuy' ? 'xgyBuyScopeTags' : 'xgyGiftScopeTags'); }
  function pfScopeCountId(t) { return t === 'main' ? 'paScopeCount' : (t === 'xgyBuy' ? 'xgyBuyScopeCount' : 'xgyGiftScopeCount'); }
  function pfRenderScopeTags(target, tagsId, countId) {
    var st = PF_SCOPE_STATE[target];
    var items = [];
    st.collections.forEach(function (id) { var c = PF_COLLECTIONS.find(function (x) { return x.id === id; }); if (c) items.push({ id: target + '::c_' + id, name: c.name, sub: pfCollectionSub(c), img: c.image }); });
    st.products.forEach(function (id) {
      if (id.indexOf('|') >= 0) {
        var parts = id.split('|'); var p = PF_PRODUCTS.find(function (x) { return x.id === parts[0]; });
        var s = p && p.skus.find(function (y) { return y.id === parts[1]; });
        if (p) { var cnt = p.skus.filter(function (sk) { return st.products.indexOf(p.id + '|' + sk.id) >= 0; }).length; items.push({ id: target + '::p_' + id, name: p.name, sub: '已选 ' + cnt + ' 个 SKU / 共 ' + p.skus.length + ' 个 SKU', img: p.image, edit: 'pfEditProductSkus(\'' + p.id + '\',\'' + target + '\')' }); }
      } else {
        var p2 = PF_PRODUCTS.find(function (x) { return x.id === id; });
        if (p2) { var cnt2 = p2.skus.filter(function (sk) { return st.products.indexOf(p2.id + '|' + sk.id) >= 0; }).length; items.push({ id: target + '::p_' + id, name: p2.name, sub: '已选 ' + cnt2 + ' 个 SKU / 共 ' + p2.skus.length + ' 个 SKU', img: p2.image, edit: 'pfEditProductSkus(\'' + p2.id + '\',\'' + target + '\')' }); }
      }
    });
    var cnt = $(countId); if (cnt) cnt.textContent = items.length ? '(' + items.length + ')' : '';
    pfRenderSelectedList(tagsId, 'pfScopeSelSearch_' + target, 'pfScopeCards_' + target, items, 'pfRemoveScopeItem');
  }
  window.pfRemoveScopeItem = function (combined) {
    var i = combined.indexOf('::'); if (i < 0) return;
    var target = combined.slice(0, i);
    var raw = combined.slice(i + 2);
    var st = PF_SCOPE_STATE[target]; if (!st) return;
    if (raw.indexOf('c_') === 0) { var cid = raw.slice(2); var k = st.collections.indexOf(cid); if (k >= 0) st.collections.splice(k, 1); }
    else if (raw.indexOf('p_') === 0) { var pk = raw.slice(2); var k2 = st.products.indexOf(pk); if (k2 >= 0) st.products.splice(k2, 1); }
    pfRenderScopeTags(target, pfScopeTagsId(target), pfScopeCountId(target));
    pfUpdatePreview();
  };

  // ==================== 国家选择 ====================
  window.pfOpenCountryDialog = function () {
    var overlay = $('pfCountryOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.id = 'pfCountryOverlay';
      overlay.innerHTML =
        '<div class="pf-dialog"><div class="pf-dialog-header"><div class="pf-dialog-title">选择国家/地区</div><button class="pf-dialog-close" onclick="pfCloseCountryDialog()">✕</button></div>' +
        '<div class="pf-dialog-search"><input type="text" id="pfCountrySearch" placeholder="搜索国家..." oninput="pfRenderCountryDialog()"></div>' +
        '<div class="pf-dialog-body"><div class="pf-dialog-list" id="pfCountryList"></div></div>' +
        '<div class="pf-dialog-footer pf-dialog-footer--split">' +
          '<div class="pf-dialog-footer-left"><label class="pf-dialog-select-all-check"><input type="checkbox" onchange="pfToggleSelectAllCountry()"> 全选</label><span class="pf-dialog-count" id="pfCountryCount2"></span></div>' +
          '<div class="dialog-actions"><button class="btn btn-secondary" onclick="pfCloseCountryDialog()">取消</button><button class="btn btn-primary" onclick="pfConfirmCountryDialog()">确定</button></div>' +
        '</div></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    pfRenderCountryDialog();
  };
  window.pfCloseCountryDialog = function () { var o = $('pfCountryOverlay'); if (o) o.style.display = 'none'; };
  function pfRenderCountryDialog() {
    var search = ($('pfCountrySearch') ? $('pfCountrySearch').value : '').toLowerCase();
    var list = $('pfCountryList');
    list.innerHTML = PF_COUNTRIES.map(function (c) {
      if (search && c.name.toLowerCase().indexOf(search) < 0) return '';
      var sel = pfSelectedCountries.indexOf(c.id) >= 0;
      return '<div class="pf-dialog-item' + (sel ? ' selected' : '') + '" onclick="pfToggleCountry(\'' + c.id + '\')"><input type="checkbox" ' + (sel ? 'checked' : '') + ' onchange="pfToggleCountry(\'' + c.id + '\')"><div class="pf-dialog-item-info"><div class="pf-dialog-item-name">' + esc(c.name) + '</div></div></div>';
    }).join('');
    var c = $('pfCountryCount2'); if (c) c.textContent = '已选 ' + pfSelectedCountries.length + ' 项';
  }
  window.pfToggleCountry = function (id) {
    var idx = pfSelectedCountries.indexOf(id);
    if (idx >= 0) pfSelectedCountries.splice(idx, 1); else pfSelectedCountries.push(id);
    pfRenderCountryDialog();
    pfRenderCountrySelected();
  };
  window.pfToggleSelectAllCountry = function () {
    if (pfSelectedCountries.length === PF_COUNTRIES.length) pfSelectedCountries = []; else pfSelectedCountries = PF_COUNTRIES.map(function (c) { return c.id; });
    pfRenderCountryDialog();
    pfRenderCountrySelected();
  };
  window.pfConfirmCountryDialog = function () {
    pfCloseCountryDialog();
    pfRenderCountrySelected();
    pfUpdatePreview();
  };
  function pfRenderCountrySelected() {
    var items = pfSelectedCountries.map(function (id) { var c = PF_COUNTRIES.find(function (x) { return x.id === id; }); return c ? { id: c.id, name: c.name, sub: c.code || '' } : null; }).filter(Boolean);
    var cnt = $('shipCountryCount'); if (cnt) cnt.textContent = items.length ? '(' + items.length + ')' : '';
    pfRenderSelectedList('shipCountryTags', 'pfCountrySelSearch', 'pfCountryCards', items, 'pfRemoveSelectedCountry');
  }
  window.pfRemoveSelectedCountry = function (id) {
    var idx = pfSelectedCountries.indexOf(id);
    if (idx >= 0) pfSelectedCountries.splice(idx, 1);
    pfRenderCountrySelected();
    if ($('pfCountryOverlay') && $('pfCountryOverlay').style.display === 'flex') pfRenderCountryDialog();
    pfUpdatePreview();
  };

  // ==================== 选中项卡片列表（搜索框 + 卡片）通用渲染 ====================
  function pfRenderSelectedList(wrapId, searchId, cardsId, items, onRemove) {
    var wrap = $(wrapId);
    if (!wrap) return;
    if (!items.length) { wrap.innerHTML = ''; return; }
    var cards = items.map(function (it) {
      return '<div class="pf-sel-card" data-name="' + esc(it.name) + '">' +
        (it.img ? '<img class="pf-sel-card-cover" src="' + it.img + '" alt="">' : '') +
        '<div class="pf-sel-card-info"><div class="pf-sel-card-name">' + esc(it.name) + '</div>' +
        (it.sub ? '<div class="pf-sel-card-sub">' + esc(it.sub) + '</div>' : '') +
        '</div>' +
        (it.edit ? '<button type="button" class="pf-sel-card-edit" onclick="' + it.edit + '">编辑</button>' : '') +
        '<button type="button" class="pf-sel-card-remove" title="移除" onclick="' + onRemove + '(\'' + it.id + '\')">✕</button>' +
        '</div>';
    }).join('');
    wrap.innerHTML = '<div class="pf-sel-search"><input type="text" class="form-input" id="' + searchId + '" placeholder="搜索已选..." oninput="pfFilterSelectedCards(\'' + cardsId + '\', this.value)"></div><div class="pf-sel-cards" id="' + cardsId + '">' + cards + '</div>';
  }
  window.pfFilterSelectedCards = function (cardsId, value) {
    value = (value || '').toLowerCase().trim();
    var box = $(cardsId); if (!box) return;
    box.querySelectorAll('.pf-sel-card').forEach(function (card) {
      var n = card.getAttribute('data-name') || '';
      card.style.display = (!value || n.toLowerCase().indexOf(value) >= 0) ? '' : 'none';
    });
  };

  // ==================== 指定客户 ====================
  window.pfOpenCustomerDialog = function () {
    var overlay = $('pfCustomerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      overlay.id = 'pfCustomerOverlay';
      overlay.innerHTML =
        '<div class="pf-dialog"><div class="pf-dialog-header"><div class="pf-dialog-title">选择客户</div><button class="pf-dialog-close" onclick="pfCloseCustomerDialog()">✕</button></div>' +
        '<div class="pf-dialog-tabs">' +
          '<div class="pf-dialog-tab" data-tab="registered" onclick="pfSwitchCustomerTab(\'registered\')">注册用户<span class="tab-badge" id="pfCustTabBadgeReg"></span></div>' +
          '<div class="pf-dialog-tab" data-tab="subscribed" onclick="pfSwitchCustomerTab(\'subscribed\')">订阅用户<span class="tab-badge" id="pfCustTabBadgeSub"></span></div>' +
        '</div>' +
        '<div class="pf-dialog-search"><input type="text" id="pfCustomerSearch" placeholder="搜索客户名称或邮箱..." oninput="pfRenderCustomerDialog()"></div>' +
        '<div class="pf-dialog-body"><div class="pf-dialog-list" id="pfCustomerList"></div></div>' +
        '<div class="pf-dialog-footer pf-dialog-footer--split">' +
          '<div class="pf-dialog-footer-left"><label class="pf-dialog-select-all-check"><input type="checkbox" id="pfCustomerSelectAll" onchange="pfToggleSelectAllCustomer()"> 全选</label><span class="pf-dialog-count" id="pfCustomerCount2"></span></div>' +
          '<div class="dialog-actions"><button class="btn btn-secondary" onclick="pfCloseCustomerDialog()">取消</button><button class="btn btn-primary" onclick="pfConfirmCustomerDialog()">确定</button></div>' +
        '</div></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    pfRenderCustomerDialog();
  };
  window.pfCloseCustomerDialog = function () { var o = $('pfCustomerOverlay'); if (o) o.style.display = 'none'; };
  window.pfSwitchCustomerTab = function (tab) {
    pfCustomerTab = tab;
    var s = $('pfCustomerSearch'); if (s) s.value = '';
    pfRenderCustomerDialog();
  };
  function pfCustomerTabList() {
    return PF_CUSTOMERS.filter(function (c) { return c.type === pfCustomerTab; });
  }
  function pfRenderCustomerDialog() {
    var search = ($('pfCustomerSearch') ? $('pfCustomerSearch').value : '').toLowerCase();
    var tabItems = pfCustomerTabList();
    var html = '';
    tabItems.forEach(function (c) {
      if (search && c.name.toLowerCase().indexOf(search) < 0 && c.email.toLowerCase().indexOf(search) < 0) return;
      var sel = pfSelectedCustomers.indexOf(c.id) >= 0;
      html += '<div class="pf-dialog-item' + (sel ? ' selected' : '') + '" onclick="pfToggleCustomer(\'' + c.id + '\')"><input type="checkbox" ' + (sel ? 'checked' : '') + ' onchange="pfToggleCustomer(\'' + c.id + '\')"><div class="pf-dialog-item-info"><div class="pf-dialog-item-name">' + esc(c.name) + '</div><div class="pf-dialog-item-desc">' + esc(c.email) + '</div></div></div>';
    });
    var list = $('pfCustomerList'); if (list) list.innerHTML = html || '<div class="pf-dialog-empty">暂无数据</div>';
    // tab 高亮
    var overlay = $('pfCustomerOverlay');
    if (overlay) overlay.querySelectorAll('.pf-dialog-tab').forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === pfCustomerTab); });
    // tab 已选徽标
    var regSel = PF_CUSTOMERS.filter(function (c) { return c.type === 'registered' && pfSelectedCustomers.indexOf(c.id) >= 0; }).length;
    var subSel = PF_CUSTOMERS.filter(function (c) { return c.type === 'subscribed' && pfSelectedCustomers.indexOf(c.id) >= 0; }).length;
    var rb = $('pfCustTabBadgeReg'); if (rb) rb.textContent = regSel ? regSel : '';
    var sb = $('pfCustTabBadgeSub'); if (sb) sb.textContent = subSel ? subSel : '';
    // 计数（总计）
    var c = $('pfCustomerCount2'); if (c) c.textContent = '已选 ' + pfSelectedCustomers.length + ' 人';
    // 全选（针对当前 tab）
    var tabSel = tabItems.filter(function (x) { return pfSelectedCustomers.indexOf(x.id) >= 0; }).length;
    var sa = $('pfCustomerSelectAll'); if (sa) sa.checked = (tabItems.length > 0 && tabSel === tabItems.length);
  }
  window.pfToggleCustomer = function (id) {
    var idx = pfSelectedCustomers.indexOf(id);
    if (idx >= 0) pfSelectedCustomers.splice(idx, 1); else pfSelectedCustomers.push(id);
    pfRenderCustomerDialog();
  };
  window.pfToggleSelectAllCustomer = function () {
    var tabIds = pfCustomerTabList().map(function (c) { return c.id; });
    var allSelected = tabIds.every(function (id) { return pfSelectedCustomers.indexOf(id) >= 0; });
    if (allSelected) {
      // 取消当前 tab 全部
      pfSelectedCustomers = pfSelectedCustomers.filter(function (id) { return tabIds.indexOf(id) < 0; });
    } else {
      // 选中当前 tab 全部
      tabIds.forEach(function (id) { if (pfSelectedCustomers.indexOf(id) < 0) pfSelectedCustomers.push(id); });
    }
    pfRenderCustomerDialog();
  };
  window.pfConfirmCustomerDialog = function () {
    pfCloseCustomerDialog();
    pfRenderCustomerSelected();
    pfUpdatePreview();
  };
  function pfRenderCustomerSelected() {
    var btnCount = $('pfCustomerBtnCount');
    if (btnCount) btnCount.textContent = pfSelectedCustomers.length ? '(' + pfSelectedCustomers.length + ')' : '';
    var items = pfSelectedCustomers.map(function (id) { var c = PF_CUSTOMERS.find(function (x) { return x.id === id; }); return c ? { id: c.id, name: c.name, sub: c.email } : null; }).filter(Boolean);
    pfRenderSelectedList('pfCustomerSelected', 'pfCustomerSelectSearch', 'pfCustomerCards', items, 'pfRemoveSelectedCustomer');
  }
  window.pfRemoveSelectedCustomer = function (id) {
    var idx = pfSelectedCustomers.indexOf(id);
    if (idx >= 0) pfSelectedCustomers.splice(idx, 1);
    pfRenderCustomerSelected();
    if ($('pfCustomerOverlay') && $('pfCustomerOverlay').style.display === 'flex') pfRenderCustomerDialog();
    pfUpdatePreview();
  };

  // ==================== 预览 ====================
  var PF_ELIG_LABEL = { all: '全部客户', registered: '注册客户', subscribed: '订阅客户', specific: '指定客户' };

  function pfPreviewRow(label, value) {
    return '<div class="preview-row"><span class="preview-row-label">' + esc(label) + '</span><span class="preview-row-value">' + value + '</span></div>';
  }

  function pfUpdatePreview() {
    var card = $('pfPreview');
    if (!card) return;
    var typeName = PF_TYPE_CONFIG[pfCurrentType].title;
    var methodName = pfMethod === 'automatic' ? '自动折扣' : '折扣码';

    // 标题 / 折扣码
    var name = valOf('pfName');
    var lines = [];
    lines.push('<div class="preview-card-title">' + esc(name || (pfMethod === 'automatic' ? '未命名折扣' : '未命名折扣码')) + '</div>');
    if (pfMethod === 'code') {
      var code = valOf('pfCode');
      lines.push('<div class="preview-code">' + esc(code || '折扣码待生成') + '</div>');
    }

    var rows = '';
    rows += pfPreviewRow('折扣类型', esc(typeName));
    rows += pfPreviewRow('发布方式', esc(methodName));

    // 类型特定明细
    if (pfCurrentType === 'order_amount' || pfCurrentType === 'product_amount') {
      var isOa = pfCurrentType === 'order_amount';
      var vt = getRadioVal(isOa ? 'oaValueType' : 'paValueType');
      var val = vt === 'percent'
        ? ((valOf(isOa ? 'oaPercent' : 'paPercent') || '0') + '%')
        : ('$' + (valOf(isOa ? 'oaFixed' : 'paFixed') || '0'));
      rows += pfPreviewRow('折扣值', esc(val));
      var mt = getRadioVal(isOa ? 'oaMinType' : 'paMinType');
      if (mt === 'amount') rows += pfPreviewRow('最低金额', '$' + esc(valOf(isOa ? 'oaMinAmount' : 'paMinAmount') || '0'));
      else if (mt === 'qty') rows += pfPreviewRow('最低数量', esc(valOf(isOa ? 'oaMinQty' : 'paMinQty') || '0') + ' 件');
      else rows += pfPreviewRow('购买要求', '无最低要求');
      if (pfCurrentType === 'product_amount') {
        var st = PF_SCOPE_STATE.main;
        var scopeDesc = st.type === 'product' ? ('指定产品及 SKU ' + st.products.length + ' 项') : (st.type === 'collection' ? ('指定系列 ' + st.collections.length + ' 个') : '未指定');
        rows += pfPreviewRow('适用范围', esc(scopeDesc));
      }
    } else if (pfCurrentType === 'shipping') {
      var ct = getRadioVal('shipCountry');
      rows += pfPreviewRow('国家/地区', ct === 'all' ? '所有国家/地区' : ('指定 ' + pfSelectedCountries.length + ' 个'));
      var ex = valOf('pfShipExclude');
      if (ex) rows += pfPreviewRow('排除超额运费', '$' + esc(ex));
    } else if (pfCurrentType === 'xgy') {
      var bt = getRadioVal('xgyBuyType');
      rows += pfPreviewRow('购买条件', bt === 'qty' ? (esc(valOf('pfXgyBuyQty') || '0') + ' 件') : ('$' + esc(valOf('pfXgyBuyAmount') || '0')));
      var gdt = getRadioVal('xgyGiftDiscountType');
      var giftDesc = gdt === 'free' ? '免费' : (gdt === 'percent' ? (esc(valOf('pfXgyGiftPercent') || '0') + '% 折扣') : ('$' + esc(valOf('pfXgyGiftFixed') || '0') + ' 减免'));
      rows += pfPreviewRow('赠送', esc(valOf('pfXgyGiftQty') || '0') + ' 件 · ' + giftDesc);
    }

    // 适用客户
    rows += pfPreviewRow('适用客户', esc(PF_ELIG_LABEL[pfEligibility] || '全部客户') + (pfEligibility === 'specific' ? ('（' + pfSelectedCustomers.length + '人）') : ''));

    // 使用次数（仅折扣码）
    if (pfMethod === 'code') {
      var usageArr = [];
      if ($('pfUsageTotalChk') && $('pfUsageTotalChk').checked) usageArr.push('总限 ' + (valOf('pfUsageTotalNum') || '0') + ' 次');
      if ($('pfUsagePerCustChk') && $('pfUsagePerCustChk').checked) usageArr.push('每客户限一次');
      if (usageArr.length) rows += pfPreviewRow('使用次数', esc(usageArr.join('，')));
    }

    // 有效期
    var start = valOf('pfStart');
    var validText;
    if (pfLongTerm) validText = (start ? dtInputToStr(start) + ' 起' : '') + '长期有效';
    else {
      var end = valOf('pfEnd');
      if (start || end) validText = (start ? dtInputToStr(start) : '未设置') + ' ~ ' + (end ? dtInputToStr(end) : '未设置');
      else validText = '未设置';
    }
    rows += pfPreviewRow('有效期', esc(validText));

    // 叠加
    var stackMap = { product: '产品折扣', order: '订单折扣', shipping: '运费折扣' };
    var stacking = readStacking().map(function (s) { return stackMap[s]; }).filter(Boolean);
    rows += pfPreviewRow('叠加', stacking.length ? esc(stacking.join('，')) : '不叠加');

    lines.push('<div class="preview-rows">' + rows + '</div>');
    card.innerHTML = lines.join('');
  }
  function getRadioVal(name) {
    var group = document.querySelector('.pf-pill-group[data-name="' + name + '"]');
    if (!group) return null;
    var active = group.querySelector('.pf-pill.active');
    return active ? active.getAttribute('data-value') : null;
  }
  function valOf(id) { var el = $(id); return el ? el.value : ''; }

  // ==================== 保存 / 编辑填充 ====================
  window.pfSave = function () {
    var name = $('pfName') ? $('pfName').value.trim() : '';
    if (!name) { toast('请输入折扣' + (pfMethod === 'automatic' ? '标题' : '名称')); return; }
    if (pfMethod === 'code') {
      var code = $('pfCode') ? $('pfCode').value.trim() : '';
      if (!code) { toast('请输入折扣码'); return; }
    }
    // 构建数据
    var data = {
      id: PF_EDIT_ID || ('promo_' + Date.now()),
      type: pfCurrentType,
      method: pfMethod,
      name: name,
      code: pfMethod === 'code' ? (($('pfCode') || {}).value || '') : '',
      eligibility: pfEligibility,
      targetCustomers: pfSelectedCustomers.slice(),
      startDate: dtInputToStr(($('pfStart') || {}).value || ''),
      endDate: pfLongTerm ? '' : dtInputToStr(($('pfEnd') || {}).value || ''),
      longTerm: pfLongTerm,
      stacking: readStacking(),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    // 使用次数（仅 code）
    if (pfMethod === 'code') {
      data.usageLimit = {
        totalEnabled: $('pfUsageTotalChk') ? $('pfUsageTotalChk').checked : false,
        total: $('pfUsageTotalChk') && $('pfUsageTotalChk').checked ? (parseInt(($('pfUsageTotalNum') || {}).value, 10) || 0) : 0,
        perCustomer: $('pfUsagePerCustChk') ? $('pfUsagePerCustChk').checked : false
      };
    }
    // 类型特定
    if (pfCurrentType === 'order_amount') {
      data.valueType = getRadioVal('oaValueType');
      data.value = data.valueType === 'percent' ? (parseFloat(valOf('oaPercent')) || 0) : (parseFloat(valOf('oaFixed')) || 0);
      data.minType = getRadioVal('oaMinType');
      data.minAmount = data.minType === 'amount' ? (parseFloat(valOf('oaMinAmount')) || 0) : 0;
      data.minQty = data.minType === 'qty' ? (parseInt(valOf('oaMinQty'), 10) || 0) : 0;
    } else if (pfCurrentType === 'product_amount') {
      data.valueType = getRadioVal('paValueType');
      data.value = data.valueType === 'percent' ? (parseFloat(valOf('paPercent')) || 0) : (parseFloat(valOf('paFixed')) || 0);
      data.minType = getRadioVal('paMinType');
      data.minAmount = data.minType === 'amount' ? (parseFloat(valOf('paMinAmount')) || 0) : 0;
      data.minQty = data.minType === 'qty' ? (parseInt(valOf('paMinQty'), 10) || 0) : 0;
      data.scope = { type: PF_SCOPE_STATE.main.type, collections: PF_SCOPE_STATE.main.collections.slice(), products: PF_SCOPE_STATE.main.products.slice() };
    } else if (pfCurrentType === 'shipping') {
      data.countryType = getRadioVal('shipCountry');
      data.countries = pfSelectedCountries.slice();
      data.excludeAbove = parseFloat(valOf('pfShipExclude')) || 0;
    } else if (pfCurrentType === 'xgy') {
      data.buyType = getRadioVal('xgyBuyType');
      data.buyQty = data.buyType === 'qty' ? (parseInt(valOf('pfXgyBuyQty'), 10) || 0) : 0;
      data.buyAmount = data.buyType === 'amount' ? (parseFloat(valOf('pfXgyBuyAmount')) || 0) : 0;
      data.buyScope = { type: PF_SCOPE_STATE.xgyBuy.type, collections: PF_SCOPE_STATE.xgyBuy.collections.slice(), products: PF_SCOPE_STATE.xgyBuy.products.slice() };
      data.giftScope = { type: PF_SCOPE_STATE.xgyGift.type, collections: PF_SCOPE_STATE.xgyGift.collections.slice(), products: PF_SCOPE_STATE.xgyGift.products.slice() };
      data.giftQty = parseInt(valOf('pfXgyGiftQty'), 10) || 0;
      data.giftDiscountType = getRadioVal('xgyGiftDiscountType');
      data.giftPercent = data.giftDiscountType === 'percent' ? (parseFloat(valOf('pfXgyGiftPercent')) || 0) : 0;
      data.giftFixed = data.giftDiscountType === 'fixed' ? (parseFloat(valOf('pfXgyGiftFixed')) || 0) : 0;
      data.maxPerOrder = parseInt(valOf('pfXgyMaxPerOrder'), 10) || 0;
    }

    // 存储（与列表页共用 window.parent._promoStore.data 结构）
    if (!window.parent._promoStore || !window.parent._promoStore.data) window.parent._promoStore = { data: [] };
    var store = window.parent._promoStore.data;
    if (PF_EDIT_ID) {
      var idx = store.findIndex(function (p) { return p.id === PF_EDIT_ID; });
      if (idx >= 0) store[idx] = data; else store.push(data);
    } else {
      store.push(data);
    }
    toast(PF_EDIT_ID ? '折扣已更新' : '折扣已创建');
    setTimeout(function () { pfNavBack(); }, 700);
  };

  function readStacking() {
    var arr = [];
    var group = document.querySelector('.pf-pill-group[data-name="stacking"]');
    if (group) group.querySelectorAll('.pf-pill.active').forEach(function (p) { arr.push(p.getAttribute('data-value')); });
    return arr;
  }

  window.pfPopulateForm = function (promo) {
    if (!promo) return;
    PF_EDIT_ID = promo.id || null;
    pfCurrentType = promo.type || 'order_amount';
    pfMethod = promo.method || 'automatic';
    pfEligibility = promo.eligibility || 'all';
    pfSelectedCustomers = (promo.targetCustomers || []).slice();
    pfLongTerm = !!promo.longTerm;
    if (promo.code) pfCode = promo.code;
    // 范围
    if (promo.scope) { PF_SCOPE_STATE.main = { type: promo.scope.type, collections: (promo.scope.collections || []).slice(), products: (promo.scope.products || []).slice() }; }
    if (promo.buyScope) { PF_SCOPE_STATE.xgyBuy = { type: promo.buyScope.type, collections: (promo.buyScope.collections || []).slice(), products: (promo.buyScope.products || []).slice() }; }
    if (promo.giftScope) { PF_SCOPE_STATE.xgyGift = { type: promo.giftScope.type, collections: (promo.giftScope.collections || []).slice(), products: (promo.giftScope.products || []).slice() }; }
    if (promo.countries) pfSelectedCountries = promo.countries.slice();

    pfBuildForm();

    // 填充基本信息
    if ($('pfName')) $('pfName').value = promo.name || '';
    if ($('pfCode') && promo.code) $('pfCode').value = promo.code;
    if (pfEligibility === 'specific') pfRenderCustomerSelected();
    if (promo.usageLimit) {
      if ($('pfUsageTotalChk')) { $('pfUsageTotalChk').checked = !!promo.usageLimit.totalEnabled; }
      if ($('pfUsageTotalNum')) $('pfUsageTotalNum').value = promo.usageLimit.total || '';
      if ($('pfUsageTotalChk')) $('pfUsageTotalNum').style.display = promo.usageLimit.totalEnabled ? '' : 'none';
      if ($('pfUsagePerCustChk')) $('pfUsagePerCustChk').checked = !!promo.usageLimit.perCustomer;
    }
    if ($('pfStart')) $('pfStart').value = dtStrToInput(promo.startDate || '');
    if ($('pfEnd')) { $('pfEnd').value = dtStrToInput(promo.endDate || ''); $('pfEnd').disabled = pfLongTerm; }
    if ($('pfLongTerm')) $('pfLongTerm').checked = pfLongTerm;

    // 叠加
    (promo.stacking || []).forEach(function (v) {
      var pill = document.querySelector('.pf-pill-group[data-name="stacking"] .pf-pill[data-value="' + v + '"]');
      if (pill) pill.classList.add('active');
    });

    // 类型特定填充
    if (pfCurrentType === 'order_amount') {
      setRadio('oaValueType', promo.valueType);
      if (promo.valueType === 'percent') { if ($('oaPercent')) $('oaPercent').value = promo.value || ''; } else { if ($('oaFixed')) $('oaFixed').value = promo.value || ''; }
      setRadio('oaMinType', promo.minType);
      if (promo.minType === 'amount' && $('oaMinAmount')) $('oaMinAmount').value = promo.minAmount || '';
      if (promo.minType === 'qty' && $('oaMinQty')) $('oaMinQty').value = promo.minQty || '';
    } else if (pfCurrentType === 'product_amount') {
      setRadio('paValueType', promo.valueType);
      if (promo.valueType === 'percent') { if ($('paPercent')) $('paPercent').value = promo.value || ''; } else { if ($('paFixed')) $('paFixed').value = promo.value || ''; }
      setRadio('paMinType', promo.minType);
      if (promo.minType === 'amount' && $('paMinAmount')) $('paMinAmount').value = promo.minAmount || '';
      if (promo.minType === 'qty' && $('paMinQty')) $('paMinQty').value = promo.minQty || '';
      if (promo.scope && promo.scope.type) { setRadio('paScope', promo.scope.type); pfRenderScopeTags('main', 'paScopeTags', 'paScopeCount'); }
    } else if (pfCurrentType === 'shipping') {
      setRadio('shipCountry', promo.countryType);
      if (promo.countryType === 'specific') { pfRenderCountrySelected(); }
      if ($('pfShipExclude')) $('pfShipExclude').value = promo.excludeAbove || '';
    } else if (pfCurrentType === 'xgy') {
      setRadio('xgyBuyType', promo.buyType);
      if (promo.buyType === 'qty' && $('pfXgyBuyQty')) $('pfXgyBuyQty').value = promo.buyQty || '';
      if (promo.buyType === 'amount' && $('pfXgyBuyAmount')) $('pfXgyBuyAmount').value = promo.buyAmount || '';
      if (promo.buyScope && promo.buyScope.type) { setRadio('xgyBuyScope', promo.buyScope.type); pfRenderScopeTags('xgyBuy', 'xgyBuyScopeTags', 'xgyBuyScopeCount'); }
      if (promo.giftScope && promo.giftScope.type) { setRadio('xgyGiftScope', promo.giftScope.type); pfRenderScopeTags('xgyGift', 'xgyGiftScopeTags', 'xgyGiftScopeCount'); }
      if ($('pfXgyGiftQty')) $('pfXgyGiftQty').value = promo.giftQty || '';
      setRadio('xgyGiftDiscountType', promo.giftDiscountType);
      if (promo.giftDiscountType === 'percent' && $('pfXgyGiftPercent')) $('pfXgyGiftPercent').value = promo.giftPercent || '';
      if (promo.giftDiscountType === 'fixed' && $('pfXgyGiftFixed')) $('pfXgyGiftFixed').value = promo.giftFixed || '';
      if ($('pfXgyMaxPerOrder')) $('pfXgyMaxPerOrder').value = promo.maxPerOrder || '';
    }
    // 预览
    pfUpdatePreview();
  };

  function setRadio(name, value) {
    var group = document.querySelector('.pf-pill-group[data-name="' + name + '"]');
    if (!group) return;
    group.querySelectorAll('.pf-pill').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-value') === value); });
    // 触发对应显隐
    window.pfOnRadio(name, value);
  }

  // ==================== 实时预览绑定 ====================
  // 用事件委托监听左侧表单的所有输入变化（文本/数字/日期/勾选/下拉），实时刷新右侧预览
  function pfBindLivePreview() {
    var container = $('formSections');
    if (!container || container._pfLiveBound) return;
    container._pfLiveBound = true;
    container.addEventListener('input', function () { pfUpdatePreview(); });
    container.addEventListener('change', function () { pfUpdatePreview(); });
  }

  // ==================== 初始化 ====================
  function pfInit() {
    pfBindLivePreview();
    // 编辑模式：从列表页传入
    if (window.parent && window.parent._promoEditId) {
      var editId = window.parent._promoEditId;
      window.parent._promoEditId = null;
      var store = (window.parent._promoStore && window.parent._promoStore.data) || [];
      var promo = store.find(function (p) { return p.id === editId; });
      if (promo) { pfPopulateForm(promo); return; }
    }
    pfBuildForm();
    pfUpdatePreview();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pfInit);
  else pfInit();

  // 返回折扣列表页（兼容 iframe 缓存导航机制）
  function pfNavBack() {
    try {
      if (typeof navigateToPage === 'function') { navigateToPage('promotion/promotion_list.html'); return; }
      if (window.parent && typeof window.parent.handleSidebarNav === 'function') { window.parent.handleSidebarNav('promotions'); return; }
      if (window.parent && typeof window.parent.changeIframeSrc === 'function') { window.parent.changeIframeSrc('promotion/promotion_list.html'); return; }
    } catch (e) {}
    window.history.back();
  }

  // ==================== 产品 SKU 编辑对话框 ====================
  var PF_EDIT_PID = null, PF_EDIT_TARGET = null, PF_EDIT_SEARCH = '';
  window.pfEditProductSkus = function (pid, target) {
    PF_EDIT_PID = pid; PF_EDIT_TARGET = target; PF_EDIT_SEARCH = '';
    var overlay = $('pfSkuEditOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'pf-dialog-overlay';
      overlay.id = 'pfSkuEditOverlay';
      overlay.style.display = 'none';
      overlay.innerHTML =
        '<div class="pf-dialog"><div class="pf-dialog-header"><div class="pf-dialog-title" id="pfSkuEditTitle">编辑 SKU</div><button class="pf-dialog-close" onclick="pfCloseSkuEdit()">✕</button></div>' +
        '<div class="pf-dialog-search"><input type="text" id="pfSkuEditSearch" placeholder="搜索 SKU 名称..." oninput="pfRenderSkuEdit()"><span class="pf-dialog-count" id="pfSkuEditCount"></span></div>' +
        '<div class="pf-dialog-body"><div class="pf-dialog-list" id="pfSkuEditList"></div></div>' +
        '<div class="pf-dialog-footer pf-dialog-footer--split">' +
          '<div class="pf-dialog-footer-left"><label class="pf-dialog-select-all-check"><input type="checkbox" id="pfSkuEditSelectAll" onchange="pfToggleSkuEditAll()"> 全选</label><span class="pf-dialog-count" id="pfSkuEditCount2"></span></div>' +
          '<div class="dialog-actions"><button class="btn btn-secondary" onclick="pfCloseSkuEdit()">取消</button><button class="btn btn-primary" onclick="pfConfirmSkuEdit()">确定</button></div>' +
        '</div></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    pfRenderSkuEdit();
  };
  window.pfCloseSkuEdit = function () { var o = $('pfSkuEditOverlay'); if (o) o.style.display = 'none'; };
  function pfSkuEditSelected() {
    var st = PF_SCOPE_STATE[PF_EDIT_TARGET];
    return st.products.filter(function (k) { return k.indexOf(PF_EDIT_PID + '|') === 0; });
  }
  window.pfRenderSkuEdit = function () {
    var p = PF_PRODUCTS.find(function (x) { return x.id === PF_EDIT_PID; });
    if (!p) return;
    var title = $('pfSkuEditTitle'); if (title) title.textContent = '编辑 SKU · ' + p.name;
    var search = PF_EDIT_SEARCH.toLowerCase();
    var list = $('pfSkuEditList');
    if (list) {
      var html = '';
      p.skus.forEach(function (s) {
        if (search && s.label.toLowerCase().indexOf(search) < 0) return;
        var sel = pfSkuEditSelected().indexOf(p.id + '|' + s.id) >= 0;
        html += '<div class="pf-sku-edit-item' + (sel ? ' selected' : '') + '" onclick="pfToggleSkuEdit(\'' + p.id + '\',\'' + s.id + '\')">' +
          '<input type="checkbox" ' + (sel ? 'checked' : '') + ' onchange="pfToggleSkuEdit(\'' + p.id + '\',\'' + s.id + '\')">' +
          '<img class="pf-sku-edit-cover" src="' + s.image + '" alt="">' +
          '<div class="pf-sku-edit-info"><div class="pf-sku-edit-name">' + esc(s.label) + '</div></div>' +
          '<div class="pf-sku-edit-stock">库存 ' + s.stock + '</div>' +
          '<div class="pf-sku-edit-price">' + esc(s.price) + '</div>' +
          '</div>';
      });
      list.innerHTML = html || '<div class="pf-dialog-empty">暂无数据</div>';
    }
    var selCount = pfSkuEditSelected().length;
    var c = $('pfSkuEditCount'); if (c) c.textContent = '已选 ' + selCount + ' / 共 ' + p.skus.length;
    var c2 = $('pfSkuEditCount2'); if (c2) c2.textContent = '已选 ' + selCount + ' 个';
    var sa = $('pfSkuEditSelectAll'); if (sa) sa.checked = (p.skus.length > 0 && selCount === p.skus.length);
  };
  window.pfToggleSkuEdit = function (pid, sid) {
    var st = PF_SCOPE_STATE[PF_EDIT_TARGET];
    var key = pid + '|' + sid;
    var idx = st.products.indexOf(key);
    if (idx >= 0) st.products.splice(idx, 1); else st.products.push(key);
    // 同步产品级勾选状态
    var p = PF_PRODUCTS.find(function (x) { return x.id === pid; });
    if (p) {
      var all = p.skus.every(function (s) { return st.products.indexOf(pid + '|' + s.id) >= 0; });
      var pi = st.products.indexOf(pid);
      if (all && pi < 0) st.products.push(pid);
      if (!all && pi >= 0) st.products.splice(pi, 1);
    }
    pfRenderSkuEdit();
  };
  window.pfToggleSkuEditAll = function () {
    var st = PF_SCOPE_STATE[PF_EDIT_TARGET];
    var p = PF_PRODUCTS.find(function (x) { return x.id === PF_EDIT_PID; });
    if (!p) return;
    var keys = p.skus.map(function (s) { return p.id + '|' + s.id; });
    var allSel = keys.every(function (k) { return st.products.indexOf(k) >= 0; });
    if (allSel) {
      st.products = st.products.filter(function (k) { return keys.indexOf(k) < 0; });
      var pi = st.products.indexOf(p.id); if (pi >= 0) st.products.splice(pi, 1);
    } else {
      keys.forEach(function (k) { if (st.products.indexOf(k) < 0) st.products.push(k); });
      if (st.products.indexOf(p.id) < 0) st.products.push(p.id);
    }
    pfRenderSkuEdit();
  };
  window.pfConfirmSkuEdit = function () {
    pfCloseSkuEdit();
    if (PF_EDIT_TARGET === 'main') pfRenderScopeTags('main', 'paScopeTags', 'paScopeCount');
    else if (PF_EDIT_TARGET === 'xgyBuy') pfRenderScopeTags('xgyBuy', 'xgyBuyScopeTags', 'xgyBuyScopeCount');
    else if (PF_EDIT_TARGET === 'xgyGift') pfRenderScopeTags('xgyGift', 'xgyGiftScopeTags', 'xgyGiftScopeCount');
  };

  window.pfPopulateForm = pfPopulateForm;
  window.pfSave = pfSave;
  window.pfNavBack = pfNavBack;
  window.pfGoBack = pfNavBack;
})();
